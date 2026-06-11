<script setup lang="ts">
import { ref } from "vue";
import {
  QaDevicePanel,
  QaKnob,
  QaSegmented,
  QaSelect,
  QaValueField,
} from "@quantumaudio/ableton-extension-sdk/vue";
import { formatHz, formatPercent } from "@quantumaudio/ableton-extension-sdk";

const enabled = ref(true);
const collapsed = ref(false);
const tab = ref("osc-a");
const tune = ref(0);
const shape = ref(42);
const cutoff = ref(1200);
const resonance = ref(35);
const voices = ref(8);

const tabs = [
  { value: "osc-a", label: "Osc A" },
  { value: "osc-b", label: "Osc B" },
  { value: "filter", label: "Filter" },
];

const filterTypes = [
  { value: "lp12", label: "LP12" },
  { value: "lp24", label: "LP24" },
  { value: "bp", label: "BP" },
  { value: "hp", label: "HP" },
];

const filterType = ref("lp12");
</script>

<template>
  <main class="layout-root instrument-device">
    <QaDevicePanel
      v-model:enabled="enabled"
      v-model:collapsed="collapsed"
      title="QA Drift"
    >
      <QaSegmented v-model="tab" :options="tabs" />
      <div class="instrument-device__knobs">
        <QaKnob
          v-model="tune"
          label="Tune"
          :min="-24"
          :max="24"
          :default-value="0"
          bipolar
          unit=" st"
        />
        <QaKnob
          v-model="shape"
          label="Shape"
          :min="0"
          :max="100"
          :default-value="42"
          unit="%"
          :format="formatPercent"
        />
        <QaKnob
          v-model="cutoff"
          label="Cutoff"
          :min="20"
          :max="20000"
          :default-value="1200"
          taper="log"
          :format="formatHz"
        />
        <QaKnob
          v-model="resonance"
          label="Res"
          :min="0"
          :max="100"
          :default-value="35"
          unit="%"
          :format="formatPercent"
        />
      </div>
      <QaSelect v-model="filterType" label="Filter" :options="filterTypes" />
      <QaValueField
        v-model="voices"
        label="Voices"
        :min="1"
        :max="16"
        :default-value="8"
        integer
      />
    </QaDevicePanel>
  </main>
</template>

<style scoped>
.instrument-device {
  padding: 0.85em;
}

.instrument-device__knobs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75em;
  justify-content: space-between;
}
</style>
