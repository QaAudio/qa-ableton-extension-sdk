<script setup lang="ts">
withDefaults(
  defineProps<{
    spacing?: number;
  }>(),
  {
    spacing: 8,
  },
);
</script>

<template>
  <div class="qa-toolbar">
    <slot />
  </div>
</template>

<style scoped>
.qa-toolbar {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: v-bind(spacing + "px");
  min-width: 0;
}
</style>
