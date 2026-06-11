<script setup lang="ts">
import { ref } from "vue";
import {
  IconRecord,
  QaFader,
  QaKnob,
  QaLed,
  QaMeter,
  QaToggle,
  QaValueField,
} from "@quantumaudio/ableton-extension-sdk/vue";

const pan = ref(0);
const sendA = ref(0);
const sendB = ref(25);
const level = ref(0.72);
const mute = ref(false);
const solo = ref(false);
const arm = ref(false);
const trackName = ref(1);
</script>

<template>
  <main class="layout-root channel-strip">
    <div class="channel-strip__header">
      <QaLed :on="!mute" color="green" />
      <QaValueField
        v-model="trackName"
        :min="1"
        :max="99"
        :default-value="1"
        width="3em"
      />
    </div>
    <div class="channel-strip__knobs">
      <QaKnob
        v-model="pan"
        label="Pan"
        :min="-50"
        :max="50"
        :default-value="0"
        bipolar
        size="sm"
        unit="%"
      />
      <QaKnob v-model="sendA" label="A" :min="0" :max="100" size="sm" unit="%" />
      <QaKnob v-model="sendB" label="B" :min="0" :max="100" size="sm" unit="%" />
    </div>
    <div class="channel-strip__fader-row">
      <QaFader v-model="level" :height="100" :ticks="[0.25, 0.5, 0.75]" />
      <QaMeter :levels="[0.7, 0.65]" :clip="[false, true]" :length="100" />
    </div>
    <div class="channel-strip__toggles">
      <QaToggle v-model="mute">M</QaToggle>
      <QaToggle v-model="solo">S</QaToggle>
      <QaToggle v-model="arm" class="channel-strip__arm">
        <IconRecord />
      </QaToggle>
    </div>
  </main>
</template>

<style scoped>
.channel-strip {
  padding: 0.85em;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
  width: 5.5rem;
  margin: 0 auto;
}

.channel-strip__header {
  display: flex;
  align-items: center;
  gap: 0.35em;
  width: 100%;
}

.channel-strip__knobs {
  display: flex;
  gap: 0.35em;
  justify-content: center;
}

.channel-strip__fader-row {
  display: flex;
  gap: 0.35em;
  align-items: flex-end;
}

.channel-strip__toggles {
  display: flex;
  gap: 0.25em;
}

.channel-strip__arm :deep(svg) {
  width: 12px;
  height: 12px;
}
</style>
