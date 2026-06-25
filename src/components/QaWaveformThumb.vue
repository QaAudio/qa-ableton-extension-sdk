<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";
import { drawWaveform } from "../audio/waveform-draw.js";

/** Compact waveform thumbnail for lists and browsers. */
const props = withDefaults(
  defineProps<{
    peaks: number[];
    height?: number;
    color?: string;
  }>(),
  {
    height: 24,
    color: "var(--c-waveform)",
  },
);

const rootRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
let resizeObserver: ResizeObserver | null = null;
let themeObserver: MutationObserver | null = null;

let lastWidth = -1;
let lastHeight = -1;
let lastDpr = -1;
let lastPeaks: number[] | null = null;
let lastColor = "";

function redraw(force = false): void {
  const canvas = canvasRef.value;
  const root = rootRef.value;
  if (!canvas || !root) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = root.clientWidth;
  const dpr = window.devicePixelRatio || 1;
  if (
    !force &&
    width === lastWidth &&
    props.height === lastHeight &&
    dpr === lastDpr &&
    props.peaks === lastPeaks &&
    props.color === lastColor
  ) {
    return;
  }

  lastWidth = width;
  lastHeight = props.height;
  lastDpr = dpr;
  lastPeaks = props.peaks;
  lastColor = props.color;

  drawWaveform(canvas, ctx, {
    peaks: props.peaks,
    width,
    height: props.height,
    color: props.color,
    showPlayhead: false,
  });
}

onMounted(() => {
  redraw(true);
  if (rootRef.value) {
    resizeObserver = new ResizeObserver(() => redraw());
    resizeObserver.observe(rootRef.value);
  }
  themeObserver = new MutationObserver(() => redraw(true));
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
  () => [props.peaks, props.height, props.color] as const,
  () => redraw(),
);
</script>

<template>
  <div
    ref="rootRef"
    class="qa-waveform-thumb"
    :style="{ height: `${height}px` }"
    role="img"
    aria-label="Waveform preview"
  >
    <canvas ref="canvasRef" class="qa-waveform-thumb__canvas" :height="height" aria-hidden="true" />
  </div>
</template>
