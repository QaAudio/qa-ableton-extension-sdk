<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { drawWaveform } from "../audio/waveform-draw.js";

export type WaveformSelection = { start: number; end: number };

/**
 * Canvas waveform display with optional playhead, selection, and seek/drag interaction.
 */
const props = withDefaults(
  defineProps<{
    peaks: number[];
    playhead?: number;
    selection?: WaveformSelection;
    color?: string;
    accentColor?: string;
    interactive?: boolean;
    height?: number;
  }>(),
  {
    color: "var(--c-waveform)",
    accentColor: "var(--c-waveform-accent)",
    interactive: false,
    height: 64,
  },
);

const emit = defineEmits<{
  seek: [position: number];
  select: [selection: WaveformSelection];
}>();

const rootRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let resizeObserver: ResizeObserver | null = null;
let themeObserver: MutationObserver | null = null;
let selectStart: number | null = null;
let selecting = false;

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
    selection: props.selection,
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

function onClick(event: MouseEvent): void {
  if (!props.interactive || selecting) return;
  emit("seek", positionFromEvent(event));
}

function onPointerdown(event: PointerEvent): void {
  if (!props.interactive) return;
  selecting = true;
  selectStart = positionFromEvent(event);
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

function onPointermove(event: PointerEvent): void {
  if (!props.interactive || !selecting || selectStart === null) return;
  const end = positionFromEvent(event);
  emit("select", {
    start: Math.min(selectStart, end),
    end: Math.max(selectStart, end),
  });
}

function onPointerup(event: PointerEvent): void {
  if (!selecting) return;
  selecting = false;
  selectStart = null;
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
  () => [props.peaks, props.playhead, props.selection, props.height, props.color, props.accentColor],
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
  >
    <canvas ref="canvasRef" class="qa-waveform__canvas" :height="height" aria-hidden="true" />
  </div>
</template>
