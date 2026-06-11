<script setup lang="ts">
import { computed } from "vue";
import { accentClasses, type AccentProp } from "../lib/accent.js";

const props = withDefaults(
  defineProps<{
    label: string | number;
    variant?: "default" | "highlight";
    accent?: AccentProp;
  }>(),
  {
    variant: "default",
  },
);

const accentClassList = computed(() => accentClasses(props.accent));
</script>

<template>
  <span
    class="qa-badge"
    :class="[{ 'qa-badge--highlight': variant === 'highlight' }, accentClassList]"
  >
    {{ label }}
  </span>
</template>
