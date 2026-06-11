<script setup lang="ts">
import { computed, onUnmounted } from "vue";
import { clamp } from "../lib/param.js";
import { accentClasses, type AccentColor } from "../lib/accent.js";

export type XYValue = { x: number; y: number };

const props = withDefaults(
  defineProps<{
    modelValue: XYValue;
    labelX?: string;
    labelY?: string;
    defaultValue?: XYValue;
    disabled?: boolean;
    accent?: AccentColor;
  }>(),
  {
    labelX: "X",
    labelY: "Y",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: XYValue];
}>();

const handleStyle = computed(() => ({
  left: `${props.modelValue.x * 100}%`,
  top: `${(1 - props.modelValue.y) * 100}%`,
}));

const accentClassList = computed(() => accentClasses(props.accent));

function setFromClient(clientX: number, clientY: number, rect: DOMRect): void {
  const x = clamp((clientX - rect.left) / rect.width, 0, 1);
  const y = clamp(1 - (clientY - rect.top) / rect.height, 0, 1);
  emit("update:modelValue", { x, y });
}

let activePointerId: number | null = null;
let surfaceEl: HTMLElement | null = null;

function onPointermove(event: PointerEvent): void {
  if (activePointerId !== event.pointerId || !surfaceEl) return;
  setFromClient(event.clientX, event.clientY, surfaceEl.getBoundingClientRect());
}

function onPointerup(event: PointerEvent): void {
  if (activePointerId !== event.pointerId) return;
  activePointerId = null;
  surfaceEl = null;
  window.removeEventListener("pointermove", onPointermove);
  window.removeEventListener("pointerup", onPointerup);
}

function onPointerdown(event: PointerEvent): void {
  if (props.disabled) return;
  if (event.button !== 0) return;
  event.preventDefault();
  const target = event.currentTarget as HTMLElement;
  surfaceEl = target;
  target.setPointerCapture(event.pointerId);
  activePointerId = event.pointerId;
  setFromClient(event.clientX, event.clientY, target.getBoundingClientRect());
  window.addEventListener("pointermove", onPointermove);
  window.addEventListener("pointerup", onPointerup);
}

function onDblclick(): void {
  if (props.disabled || !props.defaultValue) return;
  emit("update:modelValue", { ...props.defaultValue });
}

function onKeydown(event: KeyboardEvent): void {
  if (props.disabled) return;
  const step = event.shiftKey ? 0.001 : 0.01;
  let { x, y } = props.modelValue;
  let handled = false;

  switch (event.key) {
    case "ArrowLeft":
      x -= step;
      handled = true;
      break;
    case "ArrowRight":
      x += step;
      handled = true;
      break;
    case "ArrowUp":
      y += step;
      handled = true;
      break;
    case "ArrowDown":
      y -= step;
      handled = true;
      break;
    default:
      break;
  }

  if (!handled) return;
  event.preventDefault();
  emit("update:modelValue", {
    x: clamp(x, 0, 1),
    y: clamp(y, 0, 1),
  });
}

onUnmounted(() => {
  window.removeEventListener("pointermove", onPointermove);
  window.removeEventListener("pointerup", onPointerup);
});
</script>

<template>
  <div class="qa-xy-pad" :class="accentClassList">
    <div v-if="labelX || labelY" class="qa-xy-pad__labels">
      <span>{{ labelX }}</span>
      <span>{{ labelY }}</span>
    </div>
    <div
      class="qa-xy-pad__surface"
      :class="{ 'qa-xy-pad__surface--disabled': disabled }"
      tabindex="0"
      role="application"
      :aria-label="`${labelX} ${labelY} pad`"
      @pointerdown="onPointerdown"
      @dblclick="onDblclick"
      @keydown="onKeydown"
    >
      <div class="qa-xy-pad__guide-v" />
      <div class="qa-xy-pad__guide-h" />
      <div class="qa-xy-pad__handle" :style="handleStyle" />
    </div>
  </div>
</template>
