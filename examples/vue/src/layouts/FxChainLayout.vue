<script setup lang="ts">
import { ref } from "vue";
import {
  QaDevicePanel,
  QaKnob,
  QaToggle,
  QaXYPad,
} from "@quantumaudio/ableton-extension-sdk/vue";

const echoEnabled = ref(true);
const echoCollapsed = ref(false);
const reverbEnabled = ref(false);
const reverbCollapsed = ref(true);

const xy = ref({ x: 0.35, y: 0.6 });
const feedback = ref(45);
const time = ref(380);
const sync = ref(true);
</script>

<template>
  <main class="layout-root fx-chain">
    <QaDevicePanel
      v-model:enabled="echoEnabled"
      v-model:collapsed="echoCollapsed"
      title="Echo"
    >
      <QaXYPad
        v-model="xy"
        label-x="Filter"
        label-y="Dry/Wet"
        :default-value="{ x: 0.5, y: 0.5 }"
      />
      <div class="fx-chain__knobs">
        <QaKnob v-model="feedback" label="FB" :min="0" :max="100" unit="%" />
        <QaKnob v-model="time" label="Time" :min="1" :max="2000" unit=" ms" />
      </div>
      <QaToggle v-model="sync">Sync</QaToggle>
    </QaDevicePanel>
    <QaDevicePanel
      v-model:enabled="reverbEnabled"
      v-model:collapsed="reverbCollapsed"
      title="Reverb"
    />
  </main>
</template>

<style scoped>
.fx-chain {
  padding: 0.85em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.fx-chain__knobs {
  display: flex;
  gap: 0.75em;
}
</style>
