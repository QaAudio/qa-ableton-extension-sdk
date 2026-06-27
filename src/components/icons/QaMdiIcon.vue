<script setup lang="ts">
import { computed, type Component } from "vue";

const props = withDefaults(
  defineProps<{
    icon: Component;
    size?: number;
    spin?: boolean;
  }>(),
  {
    size: 16,
    spin: false,
  },
);

const iconClass = computed(() => ({
  "qa-icon": true,
  "qa-icon-loader": props.spin,
}));
</script>

<template>
  <component
    :is="icon"
    :size="size"
    fill-color="currentColor"
    :class="iconClass"
    aria-hidden="true"
  />
</template>
