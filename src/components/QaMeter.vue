<script setup lang="ts">
import { computed } from "vue";
import { clamp } from "../lib/param.js";

/**
 * Level meter for mono or stereo channels.
 *
 * Consumer drives `levels` (0..1); no internal smoothing or animation.
 */
const props = withDefaults(
  defineProps<{
    levels: number[];
    clip?: boolean[];
    orientation?: "vertical" | "horizontal";
    length?: number;
    thickness?: number;
  }>(),
  {
    orientation: "vertical",
    length: 120,
    thickness: 6,
  },
);

const clipFlags = computed(() =>
  props.levels.map((_, index) => props.clip?.[index] ?? false),
);

function clampedLevel(level: number): number {
  return clamp(level, 0, 1);
}
</script>

<template>
  <div
    class="qa-meter"
    :class="`qa-meter--${orientation}`"
    :style="
      orientation === 'vertical'
        ? { height: `${length}px` }
        : { width: `${length}px` }
    "
  >
    <div class="qa-meter__channels">
      <div
        v-for="(level, index) in levels"
        :key="index"
        class="qa-meter__channel"
        role="meter"
        :aria-valuemin="0"
        :aria-valuemax="1"
        :aria-valuenow="clampedLevel(level)"
        :aria-label="`Channel ${index + 1} level`"
        :style="
          orientation === 'vertical'
            ? { width: `${thickness}px`, height: `${length}px` }
            : { height: `${thickness}px`, width: `${length}px` }
        "
      >
        <div
          class="qa-meter__clip"
          :class="{ 'qa-meter__clip--lit': clipFlags[index] }"
        />
        <div
          class="qa-meter__track"
          :style="
            orientation === 'vertical'
              ? { flex: 1, width: `${thickness}px` }
              : { flex: 1, height: `${thickness}px` }
          "
        >
          <div class="qa-meter__gradient" />
          <div
            class="qa-meter__shade"
            :style="
              orientation === 'vertical'
                ? { transform: `scaleY(${1 - clampedLevel(level)})` }
                : { transform: `scaleX(${1 - clampedLevel(level)})` }
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>
