<script setup lang="ts">
import { ref } from "vue";
import {
  QaBadge,
  QaButton,
  QaKnob,
  QaLed,
  QaPanel,
  QaPowerButton,
  QaSegmented,
  QaSlider,
  QaToggle,
} from "@quantumaudio/ableton-extension-sdk/vue";
import type { AccentColor } from "@quantumaudio/ableton-extension-sdk";

const colors: { id: AccentColor | "default"; label: string }[] = [
  { id: "default", label: "Orange" },
  { id: "red", label: "Red" },
  { id: "blue", label: "Blue" },
  { id: "green", label: "Green" },
  { id: "purple", label: "Purple" },
];

const slider = ref(62);
const knob = ref(0.45);
const segmented = ref("a");
const toggled = ref(true);
const powered = ref(true);

const segmentedOptions = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C" },
];
</script>

<template>
  <main class="layout-root accent-variations">
    <QaPanel label="Accent variations" subtitle="Fill vs surface · per-component accent prop">
      <div v-for="entry in colors" :key="entry.id" class="accent-row">
        <span class="accent-row__label">{{ entry.label }}</span>

        <div class="accent-row__fills">
          <QaSlider
            v-model="slider"
            :label="entry.label"
            :min="0"
            :max="100"
            unit="%"
            :accent="entry.id === 'default' ? undefined : entry.id"
          />
          <QaKnob
            v-model="knob"
            :label="entry.label"
            :accent="entry.id === 'default' ? undefined : entry.id"
          />
        </div>

        <div class="accent-row__surfaces">
          <QaButton :accent="entry.id === 'default' ? true : entry.id">
            {{ entry.label }}
          </QaButton>
          <QaBadge :label="3" :accent="entry.id === 'default' ? true : entry.id" />
          <QaToggle
            v-model="toggled"
            :accent="entry.id === 'default' ? true : entry.id"
          >
            On
          </QaToggle>
          <QaSegmented
            v-model="segmented"
            :options="segmentedOptions"
            :accent="entry.id === 'default' ? true : entry.id"
          />
          <QaPowerButton
            v-model="powered"
            :accent="entry.id === 'default' ? true : entry.id"
          />
          <QaLed on color="accent" :accent="entry.id === 'default' ? undefined : entry.id" />
        </div>
      </div>

      <p class="qa-status">
        Fill controls swap track/arc hue. Buttons and badges use a persistent colored surface.
        Toggle and segmented tint the selected state only.
      </p>
    </QaPanel>
  </main>
</template>

<style scoped>
.accent-variations {
  padding: 0.85em;
  justify-content: flex-start;
}

.accent-variations :deep(.qa-panel) {
  width: 100%;
}

.accent-row {
  display: grid;
  gap: 0.5em;
  padding: 0.65em 0;
  border-bottom: 1px solid var(--c-control-border);
}

.accent-row:last-of-type {
  border-bottom: none;
}

.accent-row__label {
  color: var(--c-text-secondary);
  font-size: 0.92em;
}

.accent-row__fills,
.accent-row__surfaces {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5em;
}

.accent-row__fills {
  flex-direction: column;
  align-items: stretch;
}

.accent-row__fills :deep(.qa-knob) {
  align-self: flex-start;
}
</style>
