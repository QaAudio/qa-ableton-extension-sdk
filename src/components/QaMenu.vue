<script setup lang="ts">
defineProps<{
  /** Inline style for fixed positioning (top/left). */
  style?: Record<string, string> | string;
}>();
</script>

<template>
  <div class="qa-menu" role="menu" :style="style" @contextmenu.prevent>
    <slot />
  </div>
</template>
