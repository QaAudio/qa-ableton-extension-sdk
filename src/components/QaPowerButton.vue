<script setup lang="ts">
import IconPower from "./icons/IconPower.vue";

withDefaults(
  defineProps<{
    modelValue: boolean;
    size?: number;
    disabled?: boolean;
    ariaLabel?: string;
  }>(),
  {
    size: 16,
    ariaLabel: "Device on",
  },
);

defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>

<template>
  <button
    type="button"
    class="qa-power-button"
    :class="{ 'qa-power-button--on': modelValue }"
    :disabled="disabled"
    :aria-pressed="modelValue ? 'true' : 'false'"
    :aria-label="ariaLabel"
    :style="{ width: `${size + 8}px`, height: `${size + 8}px` }"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <IconPower :style="{ width: `${size}px`, height: `${size}px` }" />
  </button>
</template>

<style scoped>
.qa-power-button {
  appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid var(--c-control-border);
  border-radius: 50%;
  background: var(--c-control-bg--500);
  color: var(--c-text-secondary);
  cursor: pointer;
}

.qa-power-button:hover {
  background: var(--c-control-bg--400);
}

.qa-power-button--on {
  color: var(--c-highlight--primary);
}

.qa-power-button:focus-visible {
  outline: 2px solid var(--c-control-outline);
  outline-offset: 0;
}

.qa-power-button:disabled {
  opacity: 0.45;
  cursor: default;
  pointer-events: none;
}
</style>
