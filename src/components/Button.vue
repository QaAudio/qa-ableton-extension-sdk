<script setup lang="ts">
withDefaults(
  defineProps<{
    disabled?: boolean;
    active?: boolean;
    highlight?: boolean;
    type?: "button" | "submit";
  }>(),
  {
    type: "button",
  },
);
</script>

<template>
  <button
    :type="type"
    class="qa-button"
    :class="{ 'qa-button--highlight': highlight }"
    :disabled="disabled"
    :aria-pressed="active ? 'true' : undefined"
    :data-active="highlight && active ? 'true' : undefined"
  >
    <slot />
  </button>
</template>
