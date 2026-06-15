<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import {
  drawWaveform,
  MIN_LOOP_WIDTH,
  type BeatGridOptions,
  type WaveformLoopRegion,
  type WaveformPalette,
  type WaveformSelection,
} from "../audio/waveform-draw.js";

export type { BeatGridOptions, WaveformLoopRegion, WaveformPalette, WaveformSelection };

/**
 * Canvas waveform display with optional playhead, selection, beat grid, loop region, and seek/drag interaction.
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
}>();

const rootRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let resizeObserver: ResizeObserver | null = null;
let themeObserver: MutationObserver | null = null;
let selectStart: number | null = null;
let selecting = false;
let loopDrag: "start" | "end" | null = null;
let resizeDrag = false;
let resizeStartY = 0;
let resizeStartHeight = 0;

const HANDLE_HIT_PX = 8;

function redraw(): void {
  const canvas = canvasRef.value;
  const root = rootRef.value;
  if (!canvas || !root) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = root.clientWidth;
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
  });
}

function positionFromEvent(event: MouseEvent | PointerEvent): number {
  const root = rootRef.value;
  if (!root) return 0;
  const rect = root.getBoundingClientRect();
  return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
}

function loopHandleAt(event: MouseEvent | PointerEvent): "start" | "end" | null {
  if (!props.loopRegion || !rootRef.value) return null;
  const rect = rootRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const startX = props.loopRegion.start * rect.width;
  const endX = props.loopRegion.end * rect.width;
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

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function onClick(event: MouseEvent): void {
  if (!props.interactive || selecting || loopDrag || resizeDrag) return;
  emit("seek", positionFromEvent(event));
}

function onPointerdown(event: PointerEvent): void {
  if ((event.target as HTMLElement).classList.contains("qa-waveform__resize-handle")) {
    return;
  }
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
  ],
  () => redraw(),
  { deep: true },
);
</script>

<template>
  <div
    ref="rootRef"
    class="qa-waveform"
    :class="{ 'qa-waveform--interactive': interactive }"
    :style="{ height: `${height}px` }"
    :tabindex="interactive ? 0 : undefined"
    @click="onClick"
    @pointerdown="onPointerdown"
    @pointermove="onPointermove"
    @pointerup="onPointerup"
    @pointercancel="onPointerup"
  >
    <canvas ref="canvasRef" class="qa-waveform__canvas" :height="height" aria-hidden="true" />
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
