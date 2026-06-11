<script setup lang="ts">
import { ref } from "vue";
import { fakePeaks } from "@quantumaudio/ableton-extension-sdk";
import {
  IconPause,
  IconPlay,
  IconStop,
  QaIconButton,
  QaSelect,
  QaToggle,
  QaValueField,
  QaWaveform,
} from "@quantumaudio/ableton-extension-sdk/vue";
import { formatDb } from "@quantumaudio/ableton-extension-sdk";

const peaks = fakePeaks("sample-editor", 400);
const playhead = ref(0.4);
const selection = ref({ start: 0.25, end: 0.55 });
const playing = ref(false);
const start = ref(0.25);
const end = ref(0.55);
const gain = ref(-3);
const warpMode = ref("beats");
const loop = ref(true);

const warpModes = [
  { value: "beats", label: "Beats" },
  { value: "tones", label: "Tones" },
  { value: "texture", label: "Texture" },
  { value: "repitch", label: "Re-pitch" },
];

function onSeek(position: number): void {
  playhead.value = position;
}

function onSelect(value: { start: number; end: number }): void {
  selection.value = value;
  start.value = value.start;
  end.value = value.end;
}
</script>

<template>
  <main class="layout-root sample-editor">
    <QaWaveform
      :peaks="peaks"
      :playhead="playhead"
      :selection="selection"
      interactive
      :height="72"
      @seek="onSeek"
      @select="onSelect"
    />
    <div class="sample-editor__transport">
      <QaIconButton title="Play" @click="playing = true">
        <IconPlay />
      </QaIconButton>
      <QaIconButton title="Pause" @click="playing = false">
        <IconPause />
      </QaIconButton>
      <QaIconButton title="Stop" @click="playing = false; playhead = 0">
        <IconStop />
      </QaIconButton>
    </div>
    <div class="sample-editor__fields">
      <QaValueField
        v-model="start"
        label="Start"
        :min="0"
        :max="1"
        :step="0.01"
      />
      <QaValueField
        v-model="end"
        label="End"
        :min="0"
        :max="1"
        :step="0.01"
      />
      <QaValueField
        v-model="gain"
        label="Gain"
        :min="-24"
        :max="24"
        :default-value="0"
        :format="formatDb"
      />
    </div>
    <QaSelect v-model="warpMode" label="Warp" :options="warpModes" />
    <QaToggle v-model="loop">Loop</QaToggle>
  </main>
</template>

<style scoped>
.sample-editor {
  padding: 0.85em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.sample-editor__transport {
  display: flex;
  gap: 0.25em;
}

.sample-editor__fields {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5em;
}
</style>
