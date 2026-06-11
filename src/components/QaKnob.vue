<script setup lang="ts">
import { computed } from "vue";
import { formatValue, normalize, specFromProps } from "../lib/param.js";
import { useParamDrag } from "../composables/useParamDrag.js";
import { useParamKeyboard } from "../composables/useParamKeyboard.js";

const props = withDefaults(
  defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    defaultValue?: number;
    bipolar?: boolean;
    size?: "sm" | "md" | "lg";
    label?: string;
    unit?: string;
    format?: (value: number) => string;
    showValue?: boolean;
    taper?: "linear" | "log";
    step?: number;
    disabled?: boolean;
  }>(),
  {
    min: 0,
    max: 1,
    bipolar: false,
    size: "md",
    showValue: true,
    taper: "linear",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const spec = computed(() =>
  specFromProps({
    min: props.min,
    max: props.max,
    step: props.step,
    defaultValue: props.defaultValue,
    taper: props.taper,
    bipolar: props.bipolar,
    unit: props.unit,
    format: props.format,
  }),
);

const readout = computed(() => formatValue(props.modelValue, spec.value));

const CX = 20;
const CY = 20;
const R = 15;
const NEEDLE_R = 14;
const SWEEP_DEG = 270;
const TRACK_START = -135;
const TRACK_END = 135;

const norm = computed(() => normalize(props.modelValue, spec.value));

/** Dial angle in degrees; 0 = 12 o'clock, sweep is clockwise on screen. */
const needleAngle = computed(() => {
  if (props.bipolar) {
    return (norm.value - 0.5) * 2 * (SWEEP_DEG / 2);
  }
  return TRACK_START + norm.value * SWEEP_DEG;
});

function polarXY(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CX + Math.cos(rad) * radius,
    y: CY + Math.sin(rad) * radius,
  };
}

/** SVG arc along the knob ring from `startDeg` to `endDeg` (clockwise on screen). */
function ringArc(startDeg: number, endDeg: number): string {
  if (Math.abs(endDeg - startDeg) < 0.01) return "";
  const start = polarXY(startDeg, R);
  const end = polarXY(endDeg, R);
  const sweep = endDeg - startDeg;
  const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
  const sweepFlag = sweep > 0 ? 1 : 0;
  return `M ${start.x.toFixed(3)} ${start.y.toFixed(3)} A ${R} ${R} 0 ${largeArc} ${sweepFlag} ${end.x.toFixed(3)} ${end.y.toFixed(3)}`;
}

const trackPath = computed(() => ringArc(TRACK_START, TRACK_END));

const valueArcPath = computed(() => {
  const angle = needleAngle.value;
  if (props.bipolar) {
    if (Math.abs(angle) < 0.01) return "";
    return angle > 0 ? ringArc(0, angle) : ringArc(angle, 0);
  }
  if (norm.value <= 0) return "";
  return ringArc(TRACK_START, angle);
});

const needleEnd = computed(() => polarXY(needleAngle.value, NEEDLE_R));

function setValue(value: number): void {
  emit("update:modelValue", value);
}

const { dragging, onPointerdown, onDblclick } = useParamDrag({
  value: () => props.modelValue,
  spec: spec.value,
  onChange: setValue,
  disabled: () => props.disabled ?? false,
});

const { onKeydown } = useParamKeyboard({
  value: () => props.modelValue,
  spec: spec.value,
  onChange: setValue,
  disabled: () => props.disabled ?? false,
  orientation: "vertical",
});
</script>

<template>
  <div class="qa-knob" :class="`qa-knob--${size}`">
    <span v-if="label" class="qa-knob__label">{{ label }}</span>
    <div
      class="qa-knob__dial"
      :class="{ 'qa-knob__dial--disabled': disabled }"
      role="slider"
      tabindex="0"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="modelValue"
      :aria-valuetext="readout"
      :aria-orientation="'vertical'"
      :aria-label="label ?? 'Parameter'"
      @pointerdown="onPointerdown"
      @dblclick="onDblclick"
      @keydown="onKeydown"
    >
      <svg class="qa-knob__svg" viewBox="0 0 40 40" aria-hidden="true">
        <path class="qa-knob__track" :d="trackPath" />
        <path v-if="valueArcPath" class="qa-knob__arc" :d="valueArcPath" />
        <line
          class="qa-knob__needle"
          :x1="CX"
          :y1="CY"
          :x2="needleEnd.x"
          :y2="needleEnd.y"
        />
      </svg>
    </div>
    <span
      class="qa-knob__value"
      :class="{
        'qa-knob__value--hidden': !showValue,
        'qa-knob__value--dragging': dragging,
      }"
    >
      {{ readout }}
    </span>
  </div>
</template>
