<script setup lang="ts">
import { computed } from "vue";
import {
  clamp,
  denormalize,
  formatValue,
  normalize,
  specFromProps,
} from "../lib/param.js";
import { accentClasses, type AccentColor } from "../lib/accent.js";
import { useParamDrag } from "../composables/useParamDrag.js";
import { useParamKeyboard } from "../composables/useParamKeyboard.js";

const props = withDefaults(
  defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    defaultValue?: number;
    height?: number;
    /** Normalized [0, 1] positions for labeled ruler ticks. */
    ticks?: number[];
    /** Number of evenly spaced minor ruler ticks. */
    rulerTicks?: number;
    showRuler?: boolean;
    fill?: boolean;
    step?: number;
    taper?: "linear" | "log";
    unit?: string;
    format?: (value: number) => string;
    disabled?: boolean;
    accent?: AccentColor;
  }>(),
  {
    min: 0,
    max: 1,
    height: 120,
    rulerTicks: 20,
    showRuler: true,
    fill: false,
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
    unit: props.unit,
    format: props.format,
  }),
);

const norm = computed(() => normalize(props.modelValue, spec.value));

const thumbTop = computed(() => `${(1 - norm.value) * 100}%`);
const fillHeight = computed(() => `${norm.value * 100}%`);

const minorRulerTicks = computed(() =>
  Array.from({ length: props.rulerTicks + 1 }, (_, index) => index / props.rulerTicks),
);

const labeledTicks = computed(() =>
  (props.ticks ?? []).map((position) => ({
    position,
    label: formatValue(
      denormalize(position, spec.value),
      spec.value,
    ),
  })),
);

function setValue(value: number): void {
  emit("update:modelValue", value);
}

function onTrackClick(event: MouseEvent): void {
  if (props.disabled) return;
  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const t = clamp(1 - (event.clientY - rect.top) / rect.height, 0, 1);
  setValue(denormalize(t, spec.value));
}

const { onPointerdown, onDblclick } = useParamDrag({
  value: () => props.modelValue,
  spec: spec.value,
  onChange: setValue,
  pixelsForFullRange: props.height,
  disabled: () => props.disabled ?? false,
});

const { onKeydown } = useParamKeyboard({
  value: () => props.modelValue,
  spec: spec.value,
  onChange: setValue,
  disabled: () => props.disabled ?? false,
  orientation: "vertical",
});

const accentClassList = computed(() => accentClasses(props.accent));
</script>

<template>
  <div class="qa-fader" :class="accentClassList">
    <div
      v-if="showRuler"
      class="qa-fader__ruler"
      :style="{ height: `${height}px` }"
      aria-hidden="true"
    >
      <div
        v-for="(position, index) in minorRulerTicks"
        :key="`minor-${index}`"
        class="qa-fader__ruler-tick"
        :class="{ 'qa-fader__ruler-tick--major': ticks?.includes(position) }"
        :style="{ top: `${(1 - position) * 100}%` }"
      />
      <div
        v-for="(tick, index) in labeledTicks"
        :key="`label-${index}`"
        class="qa-fader__ruler-label"
        :style="{ top: `${(1 - tick.position) * 100}%` }"
      >
        {{ tick.label }}
      </div>
    </div>

    <div
      class="qa-fader__track-wrap"
      :class="{ 'qa-fader__track-wrap--disabled': disabled }"
      :style="{ height: `${height}px` }"
      role="slider"
      tabindex="0"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="modelValue"
      aria-orientation="vertical"
      aria-label="Fader"
      @pointerdown="onPointerdown"
      @dblclick="onDblclick"
      @keydown="onKeydown"
      @click="onTrackClick"
    >
      <div class="qa-fader__track">
        <div class="qa-fader__track-center" />
        <div
          v-if="fill"
          class="qa-fader__fill"
          :style="{ height: fillHeight }"
        />
      </div>
      <div class="qa-fader__thumb" :style="{ top: thumbTop }">
        <div class="qa-fader__thumb-line" />
        <div class="qa-fader__thumb-arrow" />
      </div>
    </div>
  </div>
</template>
