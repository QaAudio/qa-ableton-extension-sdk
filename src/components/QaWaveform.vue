<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import {
  drawWaveform,
  MIN_LOOP_WIDTH,
  type BeatGridOptions,
  type WaveformLoopRegion,
  type WaveformPalette,
  type WaveformSelection,
  type WaveformViewRange,
} from "../audio/waveform-draw.js";
import QaIconButton from "./QaIconButton.vue";
import IconZoomIn from "./icons/IconZoomIn.vue";
import IconZoomOut from "./icons/IconZoomOut.vue";
import IconZoomReset from "./icons/IconZoomReset.vue";

export type { BeatGridOptions, WaveformLoopRegion, WaveformPalette, WaveformSelection, WaveformViewRange };

const FULL_VIEW: WaveformViewRange = { start: 0, end: 1 };
const ZOOM_FACTOR = 1.25;
const SCROLL_THUMB_MIN_PX = 24;

/**
 * Canvas waveform display with optional playhead, selection, beat grid, loop region, seek/drag interaction, and zoom.
 */
const props = withDefaults(
  defineProps<{
    peaks: number[];
    colorGuidance?: number[];
    palette?: WaveformPalette;
    playhead?: number;
    selection?: WaveformSelection;
    loopRegion?: WaveformLoopRegion | null;
    loopActive?: boolean;
    beatGrid?: BeatGridOptions;
    color?: string;
    accentColor?: string;
    interactive?: boolean;
    resizable?: boolean;
    zoomable?: boolean;
    viewRange?: WaveformViewRange;
    height?: number;
    minHeight?: number;
    maxHeight?: number;
  }>(),
  {
    palette: "hot",
    color: "var(--c-waveform)",
    accentColor: "var(--c-waveform-accent)",
    interactive: false,
    resizable: false,
    zoomable: false,
    loopActive: false,
    height: 64,
    minHeight: 48,
    maxHeight: 240,
  },
);

const emit = defineEmits<{
  seek: [position: number];
  select: [selection: WaveformSelection];
  "update:loopRegion": [region: WaveformLoopRegion];
  "update:height": [height: number];
  "update:viewRange": [range: WaveformViewRange];
}>();

const rootRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const scrollTrackRef = ref<HTMLElement | null>(null);
const internalViewRange = ref<WaveformViewRange>({ ...FULL_VIEW });
let resizeObserver: ResizeObserver | null = null;
let themeObserver: MutationObserver | null = null;
let selectStart: number | null = null;
let selecting = false;
let loopDrag: "start" | "end" | null = null;
let resizeDrag = false;
let resizeStartY = 0;
let resizeStartHeight = 0;
let scrollDrag = false;
let scrollDragStartX = 0;
let scrollDragStartViewStart = 0;
let trackWidthPx = 0;

const HANDLE_HIT_PX = 8;

const activeViewRange = computed<WaveformViewRange>(() => props.viewRange ?? internalViewRange.value);

const viewSpan = computed(() => activeViewRange.value.end - activeViewRange.value.start);

const minViewSpan = computed(() => Math.max(0.02, 10 / Math.max(1, props.peaks.length)));

const isZoomed = computed(() => viewSpan.value < 1 - 1e-6);

const canZoomIn = computed(() => viewSpan.value > minViewSpan.value + 1e-6);

const scrollThumbStyle = computed(() => {
  const span = viewSpan.value;
  if (span >= 1) return { width: "100%", left: "0%" };
  const widthPct = Math.max(span, SCROLL_THUMB_MIN_PX / Math.max(trackWidthPx, 1));
  const travel = 1 - widthPct;
  const leftPct = travel > 0 ? (activeViewRange.value.start / (1 - span)) * travel : 0;
  return {
    width: `${widthPct * 100}%`,
    left: `${leftPct * 100}%`,
  };
});

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function clampViewRange(range: WaveformViewRange, minSpan: number): WaveformViewRange {
  const span = Math.min(1, Math.max(minSpan, range.end - range.start));
  let start = clamp01(range.start);
  let end = start + span;
  if (end > 1) {
    end = 1;
    start = 1 - span;
  }
  return { start, end };
}

function setViewRange(next: WaveformViewRange): void {
  const clamped = clampViewRange(next, minViewSpan.value);
  if (props.viewRange === undefined) {
    internalViewRange.value = clamped;
  }
  emit("update:viewRange", clamped);
}

function zoomAt(factor: number, anchor: number): void {
  const { start, end } = activeViewRange.value;
  const span = end - start;
  const newSpan = Math.min(1, Math.max(minViewSpan.value, span / factor));
  const anchorInView = span > 0 ? (anchor - start) / span : 0.5;
  let newStart = anchor - anchorInView * newSpan;
  let newEnd = newStart + newSpan;
  if (newStart < 0) {
    newStart = 0;
    newEnd = newSpan;
  }
  if (newEnd > 1) {
    newEnd = 1;
    newStart = 1 - newSpan;
  }
  setViewRange({ start: newStart, end: newEnd });
}

function panBy(delta: number): void {
  const { start, end } = activeViewRange.value;
  const span = end - start;
  let newStart = start + delta;
  let newEnd = end + delta;
  if (newStart < 0) {
    newStart = 0;
    newEnd = span;
  }
  if (newEnd > 1) {
    newEnd = 1;
    newStart = 1 - span;
  }
  setViewRange({ start: newStart, end: newEnd });
}

function zoomIn(): void {
  const anchor = (activeViewRange.value.start + activeViewRange.value.end) / 2;
  zoomAt(ZOOM_FACTOR, anchor);
}

function zoomOut(): void {
  const anchor = (activeViewRange.value.start + activeViewRange.value.end) / 2;
  zoomAt(1 / ZOOM_FACTOR, anchor);
}

function resetZoom(): void {
  setViewRange({ ...FULL_VIEW });
}

function redraw(): void {
  const canvas = canvasRef.value;
  const root = rootRef.value;
  if (!canvas || !root) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = root.clientWidth;
  trackWidthPx = scrollTrackRef.value?.clientWidth ?? width;
  drawWaveform(canvas, ctx, {
    peaks: props.peaks,
    width,
    height: props.height,
    color: props.color,
    accentColor: props.accentColor,
    palette: props.palette,
    colorGuidance: props.colorGuidance,
    selection: props.selection,
    loopRegion: props.loopRegion ?? undefined,
    loopActive: props.loopActive,
    beatGrid: props.beatGrid,
    playhead: props.playhead,
    showPlayhead: props.playhead !== undefined,
    viewRange: activeViewRange.value,
  });
}

function positionFromEvent(event: MouseEvent | PointerEvent): number {
  const root = rootRef.value;
  if (!root) return 0;
  const rect = root.getBoundingClientRect();
  const t = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  const { start, end } = activeViewRange.value;
  return clamp01(start + t * (end - start));
}

function loopHandleAt(event: MouseEvent | PointerEvent): "start" | "end" | null {
  if (!props.loopRegion || !rootRef.value) return null;
  const rect = rootRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const { start, end } = activeViewRange.value;
  const span = end - start;
  const startX = ((props.loopRegion.start - start) / span) * rect.width;
  const endX = ((props.loopRegion.end - start) / span) * rect.width;
  if (Math.abs(x - startX) <= HANDLE_HIT_PX) return "start";
  if (Math.abs(x - endX) <= HANDLE_HIT_PX) return "end";
  return null;
}

function clampLoopRegion(region: WaveformLoopRegion): WaveformLoopRegion {
  let start = clamp01(region.start);
  let end = clamp01(region.end);
  if (end - start < MIN_LOOP_WIDTH) {
    if (loopDrag === "start") {
      start = Math.max(0, end - MIN_LOOP_WIDTH);
    } else {
      end = Math.min(1, start + MIN_LOOP_WIDTH);
    }
  }
  return { start, end };
}

function isControlTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(".qa-waveform__resize-handle") ||
      target.closest(".qa-waveform__zoom") ||
      target.closest(".qa-waveform__scroll"),
  );
}

function onClick(event: MouseEvent): void {
  if (!props.interactive || selecting || loopDrag || resizeDrag || scrollDrag) return;
  if (isControlTarget(event.target)) return;
  emit("seek", positionFromEvent(event));
}

function onPointerdown(event: PointerEvent): void {
  if (isControlTarget(event.target)) return;
  if (!props.interactive) return;

  const handle = loopHandleAt(event);
  if (handle && props.loopRegion) {
    loopDrag = handle;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    event.preventDefault();
    return;
  }

  selecting = true;
  selectStart = positionFromEvent(event);
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function onPointermove(event: PointerEvent): void {
  if (loopDrag && props.loopRegion) {
    const pos = positionFromEvent(event);
    const next =
      loopDrag === "start"
        ? { start: pos, end: props.loopRegion.end }
        : { start: props.loopRegion.start, end: pos };
    emit("update:loopRegion", clampLoopRegion(next));
    return;
  }
  if (!props.interactive || !selecting || selectStart === null) return;
  const end = positionFromEvent(event);
  emit("select", {
    start: Math.min(selectStart, end),
    end: Math.max(selectStart, end),
  });
}

function onPointerup(): void {
  selecting = false;
  selectStart = null;
  loopDrag = null;
}

function onWheel(event: WheelEvent): void {
  if (!props.zoomable) return;

  if (event.ctrlKey) {
    event.preventDefault();
    const anchor = positionFromEvent(event);
    const factor = event.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
    zoomAt(factor, anchor);
    return;
  }

  if (event.shiftKey && isZoomed.value) {
    event.preventDefault();
    const root = rootRef.value;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    const panDelta = (event.deltaY / rect.width) * viewSpan.value;
    panBy(panDelta);
  }
}

function viewStartFromTrackX(trackX: number, trackWidth: number): number {
  const span = viewSpan.value;
  const widthPct = Math.max(span, SCROLL_THUMB_MIN_PX / Math.max(trackWidth, 1));
  const thumbWidth = widthPct * trackWidth;
  const travel = Math.max(1, trackWidth - thumbWidth);
  const ratio = Math.min(1, Math.max(0, trackX / travel));
  return ratio * (1 - span);
}

function onScrollTrackDown(event: PointerEvent): void {
  const track = scrollTrackRef.value;
  if (!track) return;
  const rect = track.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const span = viewSpan.value;
  const newStart = viewStartFromTrackX(x - (rect.width * span) / 2, rect.width);
  setViewRange({ start: newStart, end: newStart + span });
}

function onScrollThumbDown(event: PointerEvent): void {
  scrollDrag = true;
  scrollDragStartX = event.clientX;
  scrollDragStartViewStart = activeViewRange.value.start;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  event.preventDefault();
}

function onScrollPointermove(event: PointerEvent): void {
  if (!scrollDrag) return;
  const track = scrollTrackRef.value;
  if (!track) return;
  const rect = track.getBoundingClientRect();
  const span = viewSpan.value;
  const widthPct = Math.max(span, SCROLL_THUMB_MIN_PX / Math.max(rect.width, 1));
  const thumbWidth = widthPct * rect.width;
  const travel = Math.max(1, rect.width - thumbWidth);
  const deltaX = event.clientX - scrollDragStartX;
  const deltaView = (deltaX / travel) * (1 - span);
  setViewRange({ start: scrollDragStartViewStart + deltaView, end: scrollDragStartViewStart + deltaView + span });
}

function onScrollPointerup(): void {
  scrollDrag = false;
}

function onResizePointerdown(event: PointerEvent): void {
  if (!props.resizable) return;
  resizeDrag = true;
  resizeStartY = event.clientY;
  resizeStartHeight = props.height;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  event.preventDefault();
}

function onResizePointermove(event: PointerEvent): void {
  if (!resizeDrag) return;
  const delta = event.clientY - resizeStartY;
  const next = Math.min(props.maxHeight, Math.max(props.minHeight, resizeStartHeight + delta));
  emit("update:height", next);
}

function onResizePointerup(): void {
  resizeDrag = false;
}

onMounted(() => {
  redraw();
  if (rootRef.value) {
    resizeObserver = new ResizeObserver(() => redraw());
    resizeObserver.observe(rootRef.value);
  }
  themeObserver = new MutationObserver(() => redraw());
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-qa-theme"],
  });
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  themeObserver?.disconnect();
});

watch(
  () => [
    props.peaks,
    props.colorGuidance,
    props.palette,
    props.playhead,
    props.selection,
    props.loopRegion,
    props.loopActive,
    props.beatGrid,
    props.height,
    props.color,
    props.accentColor,
    props.viewRange,
    activeViewRange.value,
  ],
  () => redraw(),
  { deep: true },
);

watch(
  () => props.peaks.length,
  () => {
    if (!isZoomed.value) return;
    setViewRange(activeViewRange.value);
  },
);
</script>

<template>
  <div
    ref="rootRef"
    class="qa-waveform"
    :class="{
      'qa-waveform--interactive': interactive,
      'qa-waveform--zoomed': zoomable && isZoomed,
    }"
    :style="{ height: `${height}px` }"
    :tabindex="interactive ? 0 : undefined"
    @click="onClick"
    @pointerdown="onPointerdown"
    @pointermove="onPointermove"
    @pointerup="onPointerup"
    @pointercancel="onPointerup"
    @wheel="onWheel"
  >
    <canvas ref="canvasRef" class="qa-waveform__canvas" :height="height" aria-hidden="true" />
    <div v-if="zoomable" class="qa-waveform__zoom" @pointerdown.stop>
      <QaIconButton
        title="Zoom in (Ctrl + scroll)"
        aria-label="Zoom in"
        :disabled="!canZoomIn"
        @click="zoomIn"
      >
        <IconZoomIn />
      </QaIconButton>
      <QaIconButton title="Zoom out (Ctrl + scroll)" aria-label="Zoom out" @click="zoomOut">
        <IconZoomOut />
      </QaIconButton>
      <QaIconButton
        title="Fit waveform"
        aria-label="Fit waveform"
        :disabled="!isZoomed"
        @click="resetZoom"
      >
        <IconZoomReset />
      </QaIconButton>
    </div>
    <div
      v-if="zoomable && isZoomed"
      class="qa-waveform__scroll"
      @pointerdown.stop
      @pointermove="onScrollPointermove"
      @pointerup="onScrollPointerup"
      @pointercancel="onScrollPointerup"
    >
      <div
        ref="scrollTrackRef"
        class="qa-waveform__scroll-track"
        @pointerdown="onScrollTrackDown"
      >
        <div
          class="qa-waveform__scroll-thumb"
          :style="scrollThumbStyle"
          @pointerdown.stop="onScrollThumbDown"
        />
      </div>
    </div>
    <div
      v-if="resizable"
      class="qa-waveform__resize-handle"
      title="Resize waveform"
      @pointerdown.stop="onResizePointerdown"
      @pointermove="onResizePointermove"
      @pointerup="onResizePointerup"
      @pointercancel="onResizePointerup"
    />
  </div>
</template>
