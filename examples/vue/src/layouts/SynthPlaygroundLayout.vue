<script setup lang="ts">
import { onUnmounted, ref, watch } from "vue";
import { fakePeaks } from "@quantumaudio/ableton-extension-sdk";
import {
  QaKnob,
  QaMeter,
  QaPowerButton,
  QaSegmented,
  QaWaveform,
} from "@quantumaudio/ableton-extension-sdk/vue";
import { formatHz } from "@quantumaudio/ableton-extension-sdk";

const powered = ref(false);
const frequency = ref(440);
const cutoff = ref(2000);
const resonance = ref(8);
const gain = ref(0.35);
const waveform = ref("sine");

const waveformOptions = [
  { value: "sine", label: "Sine" },
  { value: "square", label: "Square" },
  { value: "sawtooth", label: "Saw" },
  { value: "triangle", label: "Tri" },
];

const meterLevels = ref([0, 0]);
const displayPeaks = ref(fakePeaks("synth-idle", 200));

let audioContext: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let filter: BiquadFilterNode | null = null;
let gainNode: GainNode | null = null;
let analyser: AnalyserNode | null = null;
let rafId: number | null = null;
const timeData = new Float32Array(2048);

function stopAudio(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  oscillator?.stop();
  oscillator?.disconnect();
  filter?.disconnect();
  gainNode?.disconnect();
  analyser?.disconnect();
  oscillator = null;
  filter = null;
  gainNode = null;
  analyser = null;
  void audioContext?.close();
  audioContext = null;
  meterLevels.value = [0, 0];
  displayPeaks.value = fakePeaks("synth-idle", 200);
}

function applyParams(): void {
  if (!oscillator || !filter || !gainNode) return;
  oscillator.frequency.value = frequency.value;
  oscillator.type = waveform.value as OscillatorType;
  filter.frequency.value = cutoff.value;
  filter.Q.value = resonance.value;
  gainNode.gain.value = gain.value;
}

// Unverified e2e from CI — manual steps in repo TODOLLIST.md (Synth playground Web Audio).
function startAudio(): void {
  stopAudio();
  audioContext = new AudioContext();
  oscillator = audioContext.createOscillator();
  filter = audioContext.createBiquadFilter();
  gainNode = audioContext.createGain();
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;

  oscillator.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(analyser);
  analyser.connect(audioContext.destination);

  applyParams();
  oscillator.start();

  const tick = (): void => {
    if (!analyser) return;
    analyser.getFloatTimeDomainData(timeData);
    let sum = 0;
    let max = 0;
    const bucketCount = 200;
    const bucketSize = Math.floor(timeData.length / bucketCount);
    const peaks: number[] = [];
    for (let b = 0; b < bucketCount; b++) {
      let bucketMax = 0;
      const start = b * bucketSize;
      for (let i = start; i < start + bucketSize; i++) {
        const sample = Math.abs(timeData[i] ?? 0);
        sum += sample * sample;
        if (sample > max) max = sample;
        if (sample > bucketMax) bucketMax = sample;
      }
      peaks.push(bucketMax);
    }
    const rms = Math.sqrt(sum / timeData.length);
    meterLevels.value = [Math.min(1, rms * 4), Math.min(1, max)];
    displayPeaks.value = peaks;
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
}

watch(powered, (on) => {
  if (on) startAudio();
  else stopAudio();
});

watch([frequency, cutoff, resonance, gain, waveform], () => applyParams());

onUnmounted(() => stopAudio());
</script>

<template>
  <main class="layout-root synth-playground">
    <div class="synth-playground__power">
      <QaPowerButton v-model="powered" :size="14" aria-label="Synth power" />
      <span class="qa-status">{{ powered ? "Running" : "Off" }}</span>
    </div>
    <QaSegmented v-model="waveform" :options="waveformOptions" />
    <div class="synth-playground__knobs">
      <QaKnob
        v-model="frequency"
        label="Freq"
        :min="40"
        :max="2000"
        :default-value="440"
        taper="log"
        :format="formatHz"
        :disabled="!powered"
      />
      <QaKnob
        v-model="cutoff"
        label="Cutoff"
        :min="40"
        :max="8000"
        :default-value="2000"
        taper="log"
        :format="formatHz"
        :disabled="!powered"
      />
      <QaKnob
        v-model="resonance"
        label="Res"
        :min="0"
        :max="20"
        :default-value="8"
        :disabled="!powered"
      />
      <QaKnob
        v-model="gain"
        label="Gain"
        :min="0"
        :max="1"
        :default-value="0.35"
        :disabled="!powered"
      />
    </div>
    <div class="synth-playground__viz">
      <QaWaveform :peaks="displayPeaks" :height="56" />
      <QaMeter :levels="meterLevels" :length="56" :thickness="5" />
    </div>
  </main>
</template>

<style scoped>
.synth-playground {
  padding: 0.85em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.synth-playground__power {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.synth-playground__knobs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5em;
}

.synth-playground__viz {
  display: flex;
  gap: 0.5em;
  align-items: flex-end;
}

.synth-playground__viz :deep(.qa-waveform) {
  flex: 1;
}
</style>
