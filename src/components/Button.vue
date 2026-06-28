<script setup lang="ts">
import { computed } from "vue";
import { accentClasses, type AccentProp } from "../lib/accent.js";

const props = withDefaults(
  defineProps<{
    disabled?: boolean;
    active?: boolean;
    highlight?: boolean;
    accent?: AccentProp;
    variant?: "default" | "ghost";
    type?: "button" | "submit";
  }>(),
  {
    variant: "default",
    type: "button",
  },
);

const accentClassList = computed(() => accentClasses(props.accent));
</script>

<template>
  <button
    :type="type"
    class="qa-button"
    :class="[
      { 'qa-button--highlight': highlight, 'qa-button--ghost': variant === 'ghost' },
      accentClassList,
    ]"
    :disabled="disabled"
    :aria-pressed="active ? 'true' : undefined"
    :data-active="highlight && active ? 'true' : undefined"
  >
    <slot />
  </button>
</template>
