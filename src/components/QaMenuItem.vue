<script setup lang="ts">
import QaButton from "./Button.vue";

withDefaults(
  defineProps<{
    disabled?: boolean;
    variant?: "default" | "danger";
    type?: "button" | "submit";
  }>(),
  {
    variant: "default",
    type: "button",
  },
);
</script>

<template>
  <QaButton
    :type="type"
    class="qa-menu__item"
    :class="{ 'qa-menu__item--danger': variant === 'danger' }"
    role="menuitem"
    :disabled="disabled"
  >
    <slot />
  </QaButton>
</template>
