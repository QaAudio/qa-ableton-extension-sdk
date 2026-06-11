<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    on: boolean;
    color?: "accent" | "green" | "red";
    size?: number;
  }>(),
  {
    color: "accent",
    size: 8,
  },
);

const colorVar = computed(() => {
  if (!props.on) return "var(--c-led-off)";
  switch (props.color) {
    case "green":
      return "var(--c-meter-low)";
    case "red":
      return "var(--c-clip)";
    default:
      return "var(--c-led-on)";
  }
});
</script>

<template>
  <span
    class="qa-led"
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
