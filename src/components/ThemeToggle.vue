<script setup lang="ts">
import { computed } from "vue";
import Button from "./Button.vue";
import IconMoon from "./icons/IconMoon.vue";
import IconSun from "./icons/IconSun.vue";
import QaIconButton from "./QaIconButton.vue";
import { useTheme } from "../composables/useTheme.js";

withDefaults(
  defineProps<{
    embedded?: boolean;
  }>(),
  {
    embedded: false,
  },
);

const { isDark, toggleTheme } = useTheme();

const ariaLabel = computed(() =>
  isDark.value ? "Switch to light theme" : "Switch to dark theme",
);
</script>

<template>
  <QaIconButton
    v-if="embedded"
    :active="isDark"
    :aria-label="ariaLabel"
    title="Toggle theme"
    @click="toggleTheme()"
  >
    <IconSun v-if="isDark" />
    <IconMoon v-else />
  </QaIconButton>
  <Button
    v-else
    class="qa-theme-toggle"
    :active="isDark"
    :aria-label="ariaLabel"
    title="Toggle theme"
    @click="toggleTheme()"
  >
    <IconSun v-if="isDark" />
    <IconMoon v-else />
  </Button>
</template>

<style scoped>
.qa-theme-toggle svg {
  display: block;
}
</style>
