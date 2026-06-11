<script setup lang="ts">
import { computed } from "vue";
import { formatPercent, formatValue, specFromProps } from "../lib/param.js";
import { accentClasses, type AccentColor } from "../lib/accent.js";
import { useParamDrag } from "../composables/useParamDrag.js";
import { useParamKeyboard } from "../composables/useParamKeyboard.js";

const props = withDefaults(
  defineProps<{
    modelValue: number;
    label?: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    format?: (value: number) => string;
    showValue?: boolean;
    defaultValue?: number;
    disabled?: boolean;
    accent?: AccentColor;
  }>(),
  {
    min: 0,
    max: 1,
    showValue: true,
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
    unit: props.unit,
    format: props.format,
  }),
);

const fill = computed(() => {
  const span = spec.value.max - spec.value.min;
  if (span <= 0) return "0%";
  const percent = ((props.modelValue - spec.value.min) / span) * 100;
  return `${percent}%`;
});

const readout = computed(() => {
  if (props.format) return props.format(props.modelValue);
  if (props.unit === "%" && props.min === 0 && props.max === 100) {
    return formatPercent(props.modelValue);
  }
  return formatValue(props.modelValue, spec.value);
});

const accentClassList = computed(() => accentClasses(props.accent));

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
  <div class="qa-slider-row">
    <span v-if="label" class="qa-label__text">{{ label }}</span>
    <span v-else />
    <div
      class="qa-slider"
      :class="[
        accentClassList,
        {
          'qa-slider--dragging': dragging,
          'qa-slider--disabled': disabled,
        },
      ]"
      role="slider"
      tabindex="0"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="modelValue"
      :aria-valuetext="readout"
      :aria-orientation="'vertical'"
      :aria-label="label ?? 'Parameter'"
      :style="{ '--qa-slider-fill': fill }"
      @pointerdown="onPointerdown"
      @dblclick="onDblclick"
      @keydown="onKeydown"
    >
      <span v-if="showValue" class="qa-slider__value">{{ readout }}</span>
    </div>
  </div>
</template>
