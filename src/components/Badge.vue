<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string | number;
    variant?: "default" | "highlight";
  }>(),
  {
    variant: "default",
  },
);
</script>

<template>
  <span
    class="qa-badge"
    :class="{ 'qa-badge--highlight': variant === 'highlight' }"
  >
    {{ label }}
  </span>
</template>
