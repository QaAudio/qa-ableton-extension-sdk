<script setup lang="ts">
withDefaults(
  defineProps<{
    disabled?: boolean;
    active?: boolean;
    highlight?: boolean;
    type?: "button" | "submit";
    title?: string;
    ariaLabel?: string;
  }>(),
  {
    type: "button",
  },
);
</script>

<template>
  <button
    :type="type"
    class="qa-button qa-icon-button"
    :class="{ 'qa-button--highlight': highlight }"
    :disabled="disabled"
    :aria-pressed="active ? 'true' : undefined"
    :aria-label="ariaLabel"
    :title="title ?? ariaLabel"
    :data-active="highlight && active ? 'true' : undefined"
  >
    <slot />
  </button>
</template>
