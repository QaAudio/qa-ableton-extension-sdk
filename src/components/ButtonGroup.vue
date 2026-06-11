<script setup lang="ts">
withDefaults(
  defineProps<{
    align?: "start" | "end";
  }>(),
  {
    align: "start",
  },
);
</script>

<template>
  <div
    class="qa-button-group"
    :class="{ 'qa-button-group--end': align === 'end' }"
  >
    <slot />
  </div>
</template>
