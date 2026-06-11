<script setup lang="ts">
import { computed } from "vue";
import { accentClasses, type AccentProp } from "../lib/accent.js";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    label?: string;
    disabled?: boolean;
    accent?: AccentProp;
  }>(),
  {},
);

defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const accentClassList = computed(() => accentClasses(props.accent));
</script>

<template>
  <button
    type="button"
    class="qa-button qa-toggle"
    :class="[{ 'qa-button--highlight': modelValue }, accentClassList]"
    :disabled="disabled"
    :aria-pressed="modelValue ? 'true' : 'false'"
    :data-active="modelValue ? 'true' : undefined"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<style scoped>
.qa-toggle {
  border-radius: 0.25em;
  min-width: 2.5em;
}
</style>
