<script setup lang="ts">
import { ref } from "vue";
import { QaButton, QaButtonGroup, QaPanel, QaSlider } from "@quantumaudio/ableton-extension-sdk/vue";

const drive = ref(35);
const tone = ref(58);
const mix = ref(100);
const bypassed = ref(false);

const defaults = { drive: 35, tone: 58, mix: 100 };

function reset(): void {
  drive.value = defaults.drive;
  tone.value = defaults.tone;
  mix.value = defaults.mix;
  bypassed.value = false;
}
</script>

<template>
  <main class="layout-root effect-panel">
    <QaPanel label="QA Saturator" subtitle="Audio Effect · Device view">
      <QaSlider v-model="drive" label="Drive" :min="0" :max="100" unit="%" />
      <QaSlider v-model="tone" label="Tone" :min="0" :max="100" unit="%" />
      <QaSlider v-model="mix" label="Mix" :min="0" :max="100" unit="%" />

      <QaButtonGroup>
        <QaButton :active="bypassed" @click="bypassed = !bypassed">Bypass</QaButton>
        <QaButton @click="reset">Reset</QaButton>
      </QaButtonGroup>

      <p class="qa-status" :data-state="bypassed ? undefined : 'linked'">
        {{ bypassed ? "Bypassed — dry signal only." : "Processing input bus 1/2." }}
      </p>
    </QaPanel>
  </main>
</template>

<style scoped>
.effect-panel {
  padding: 0.85em;
  justify-content: flex-start;
}

.effect-panel :deep(.qa-panel) {
  width: 100%;
}
</style>
