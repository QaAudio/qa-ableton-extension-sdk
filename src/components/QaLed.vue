<script setup lang="ts">
import { computed } from "vue";
import { accentClasses, type AccentColor } from "../lib/accent.js";

const props = withDefaults(
  defineProps<{
    on: boolean;
    color?: "accent" | "green" | "red";
    accent?: AccentColor;
    size?: number;
  }>(),
  {
    color: "accent",
    size: 8,
  },
);

const accentClassList = computed(() =>
  props.color === "accent" ? accentClasses(props.accent) : [],
);

const colorVar = computed(() => {
  if (!props.on) return "var(--c-led-off)";
  switch (props.color) {
    case "green":
      return "var(--c-meter-low)";
    case "red":
      return "var(--c-clip)";
    default:
      return "var(--c-accent)";
  }
});
</script>

<template>
  <span
    class="qa-led"
    :class="accentClassList"
    role="img"
    :aria-label="on ? 'On' : 'Off'"
    :style="{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: colorVar,
    }"
  />
</template>

<style scoped>
.qa-led {
  display: inline-block;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
