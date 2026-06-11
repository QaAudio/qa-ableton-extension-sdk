<script setup lang="ts">
import { computed } from "vue";
import { clamp, denormalize, normalize, specFromProps } from "../lib/param.js";
import { useParamDrag } from "../composables/useParamDrag.js";
import { useParamKeyboard } from "../composables/useParamKeyboard.js";

const props = withDefaults(
  defineProps<{
    modelValue: number;
    min?: number;
    max?: number;
    defaultValue?: number;
    height?: number;
    ticks?: number[];
    fill?: boolean;
    step?: number;
    disabled?: boolean;
  }>(),
  {
    min: 0,
    max: 1,
    height: 120,
    fill: true,
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
  }),
);

const norm = computed(() => normalize(props.modelValue, spec.value));

const thumbTop = computed(() => `${(1 - norm.value) * 100}%`);
const fillHeight = computed(() => `${norm.value * 100}%`);

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
</script>

<template>
  <div class="qa-fader">
    <div
      class="qa-fader__track-wrap"
      :class="{ 'qa-fader__track-wrap--disabled': disabled }"
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
      <div class="qa-fader__track" :style="{ height: `${height}px` }">
        <div
          v-if="fill"
          class="qa-fader__fill"
          :style="{ height: fillHeight }"
        />
        <div
          v-for="(tick, index) in ticks"
          :key="index"
          class="qa-fader__tick"
          :style="{ bottom: `${tick * 100}%` }"
        />
        <div class="qa-fader__thumb" :style="{ top: thumbTop }" />
      </div>
    </div>
  </div>
</template>
