<script setup lang="ts">
defineProps<{
  label?: string;
}>();
</script>

<template>
  <div class="qa-value-field-group">
    <span v-if="label" class="qa-value-field-group__label">{{ label }}</span>
    <div class="qa-value-field-group__bar">
      <slot />
    </div>
  </div>
</template>
