<script setup lang="ts">
import { computed } from "vue";
import { formatPercent, formatValue, specFromProps } from "../lib/param.js";

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

function onInput(event: Event): void {
  emit("update:modelValue", Number((event.target as HTMLInputElement).value));
}

function onDblclick(): void {
  if (props.defaultValue === undefined) return;
  emit("update:modelValue", props.defaultValue);
}
</script>

<template>
  <div class="qa-slider-row">
    <span v-if="label" class="qa-label__text">{{ label }}</span>
    <span v-else />
    <input
      class="qa-slider"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :disabled="disabled"
      :style="{ '--qa-slider-fill': fill }"
      @input="onInput"
      @dblclick="onDblclick"
    />
    <span v-if="showValue" class="qa-slider-row__value">{{ readout }}</span>
    <span v-else />
  </div>
</template>
