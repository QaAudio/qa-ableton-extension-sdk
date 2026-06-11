<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    label?: string;
    disabled?: boolean;
  }>(),
  {},
);

defineEmits<{
  "update:modelValue": [value: boolean];
}>();
</script>

<template>
  <button
    type="button"
    class="qa-button qa-toggle"
    :class="{ 'qa-button--highlight': modelValue }"
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
