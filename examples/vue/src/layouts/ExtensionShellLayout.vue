<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watch } from "vue";
import { fakePeaks, formatDb } from "@quantumaudio/ableton-extension-sdk";
import {
  IconLink,
  IconPlay,
  IconStop,
  QaBadge,
  QaButton,
  QaButtonGroup,
  QaFader,
  QaIconButton,
  QaKnob,
  QaLed,
  QaMeter,
  QaPanel,
  QaSegmented,
  QaSlider,
  QaStatusBar,
  QaToggle,
  QaToolbar,
  QaValueField,
  QaWaveform,
  QaWaveformThumb,
  QaXYPad,
} from "@quantumaudio/ableton-extension-sdk/vue";
import ProjectToolbarLayout from "./ProjectToolbarLayout.vue";

type TrackStatus = "synced" | "edited" | "unlinked";

interface ShellTrack {
  name: string;
  short: string;
  particle: string | null;
  status: TrackStatus;
  peaks: number[];
  /** Mixer fader position, 0..1. */
  level: number;
  gainDb: number;
  pan: number;
  sendA: number;
  mute: boolean;
  solo: boolean;
  /** Pulse rate in beats — drives the fake meter animation. */
  rate: number;
  phase: number;
}

const tracks = reactive<ShellTrack[]>([
  {
    name: "Kick",
    short: "KD",
    particle: "kick-v3",
    status: "synced",
    peaks: fakePeaks("kick-v3", 96),
    level: 0.85,
    gainDb: 0,
    pan: 0,
    sendA: 6,
    mute: false,
    solo: false,
    rate: 1,
    phase: 0,
  },
  {
    name: "Snare",
    short: "SN",
    particle: "snare-v1",
    status: "edited",
    peaks: fakePeaks("snare-v1", 96),
    level: 0.7,
    gainDb: -1.5,
    pan: 5,
    sendA: 24,
    mute: false,
    solo: false,
    rate: 0.5,
    phase: 0.5,
  },
  {
    name: "Hats",
    short: "HH",
    particle: "hats-16",
    status: "synced",
    peaks: fakePeaks("hats-16", 96),
    level: 0.55,
    gainDb: -4,
    pan: -12,
    sendA: 18,
    mute: false,
    solo: false,
    rate: 4,
    phase: 0.25,
  },
  {
    name: "Bass — Operator",
    short: "BS",
    particle: "bass-loop",
    status: "edited",
    peaks: fakePeaks("bass-loop", 96),
    level: 0.78,
    gainDb: 1,
    pan: 0,
    sendA: 12,
    mute: false,
    solo: false,
    rate: 2,
    phase: 0.125,
  },
  {
    name: "Pad — Wavetable",
    short: "PD",
    particle: null,
    status: "unlinked",
    peaks: fakePeaks("pad-wt", 96),
    level: 0.6,
    gainDb: -6,
    pan: 18,
    sendA: 42,
    mute: true,
    solo: false,
    rate: 0.25,
    phase: 0,
  },
]);

const view = ref("particles");
const viewOptions = [
  { value: "particles", label: "Particles" },
  { value: "mixer", label: "Mixer" },
  { value: "macros", label: "Macros" },
];

const selected = ref(3);
const selectedTrack = computed(() => tracks[selected.value] ?? tracks[0]!);

const linkedCount = computed(
  () => tracks.filter((track) => track.particle !== null).length,
);
const pendingChanges = computed(
  () => tracks.filter((track) => track.status === "edited").length,
);

function commitChanges(): void {
  for (const track of tracks) {
    if (track.status === "edited") track.status = "synced";
  }
}

const statusBadge: Record<
  TrackStatus,
  { label: string; variant?: "highlight"; accent?: "green" }
> = {
  synced: { label: "synced", accent: "green" },
  edited: { label: "edited", variant: "highlight" },
  unlinked: { label: "unlinked" },
};

// Transport + fake playback animation -------------------------------------

const playing = ref(false);
const tempo = ref(124);
const beatOn = ref(false);
const playhead = ref(0);
const levels = ref<number[][]>(tracks.map(() => [0, 0]));

let rafId: number | null = null;
let epoch = 0;

function tick(timestamp: number): void {
  const beats = ((timestamp - epoch) / 1000) * (tempo.value / 60);
  beatOn.value = beats % 1 < 0.22;
  playhead.value = (beats % 16) / 16;
  const anySolo = tracks.some((track) => track.solo);
  levels.value = tracks.map((track) => {
    const audible = !track.mute && (!anySolo || track.solo);
    if (!audible) return [0, 0];
    const pulse = Math.max(
      0,
      Math.sin((beats * track.rate + track.phase) * Math.PI * 2),
    );
    const value = track.level * (0.3 + 0.65 * pulse ** 2);
    return [value, value * 0.9];
  });
  rafId = requestAnimationFrame(tick);
}

function stopPlayback(): void {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  beatOn.value = false;
  playhead.value = 0;
  levels.value = tracks.map(() => [0, 0]);
}

watch(playing, (on) => {
  if (on) {
    epoch = performance.now();
    rafId = requestAnimationFrame(tick);
  } else {
    stopPlayback();
  }
});

onUnmounted(stopPlayback);

const masterLevels = computed<number[]>(() => {
  let left = 0;
  let right = 0;
  for (const [l = 0, r = 0] of levels.value) {
    left = Math.max(left, l);
    right = Math.max(right, r);
  }
  return [left * 0.95, right * 0.95];
});

// Macro page state ----------------------------------------------------------

const macroDrive = ref(35);
const macroSpace = ref(22);
const macroWidth = ref(64);
const macroGrain = ref(48);
const macroMotion = ref({ x: 0.32, y: 0.66 });
const macroMorph = ref(42);

const statusMessage = computed(() => {
  if (playing.value) {
    return `Playing — ${tempo.value} BPM · ${linkedCount.value}/${tracks.length} particles linked`;
  }
  if (pendingChanges.value > 0) {
    const plural = pendingChanges.value === 1 ? "" : "s";
    return `Connected to Ableton — ${pendingChanges.value} pending change${plural}`;
  }
  return "Connected to Ableton — everything in sync";
});
</script>

<template>
  <main class="layout-root extension-shell">
    <QaToolbar>
      <ProjectToolbarLayout embedded />
    </QaToolbar>

    <div class="shell-transport">
      <QaButtonGroup>
        <QaIconButton
          aria-label="Play"
          highlight
          :active="playing"
          @click="playing = true"
        >
          <IconPlay />
        </QaIconButton>
        <QaIconButton aria-label="Stop" @click="playing = false">
          <IconStop />
        </QaIconButton>
      </QaButtonGroup>
      <QaLed :on="beatOn" color="green" :size="7" />
      <QaValueField
        v-model="tempo"
        :min="60"
        :max="180"
        :default-value="124"
        integer
        unit=" BPM"
        width="5.6em"
      />
      <span class="shell-transport__spacer" />
      <span class="shell-transport__master">
        <span class="shell-transport__master-label">MST</span>
        <QaMeter
          :levels="masterLevels"
          orientation="horizontal"
          :length="52"
          :thickness="4"
        />
      </span>
    </div>

    <QaPanel label="night-drive" grow>
      <template #header>
        <QaBadge
          v-if="pendingChanges > 0"
          :label="pendingChanges"
          variant="highlight"
        />
      </template>
      <template #subtitle>
        <p class="extension-shell__subtitle">
          Late-night techno sketch · {{ linkedCount }}/{{ tracks.length }}
          particles linked
        </p>
      </template>

      <div class="shell-tabs">
        <QaSegmented
          v-model="view"
          :options="viewOptions"
          aria-label="Shell view"
        />
      </div>

      <!-- Particles: linked-track browser + selected-track editor -->
      <div v-if="view === 'particles'" class="layout-scroll shell-particles">
        <button
          v-for="(track, index) in tracks"
          :key="track.name"
          type="button"
          class="shell-row"
          :class="{ 'shell-row--active': index === selected }"
          @click="selected = index"
        >
          <QaLed
            :on="track.status !== 'unlinked'"
            :color="track.status === 'synced' ? 'green' : 'accent'"
          />
          <span class="shell-row__text">
            <span class="shell-row__name">{{ track.name }}</span>
            <span class="shell-row__meta">{{ track.particle ?? "—" }}</span>
          </span>
          <span class="shell-row__thumb">
            <QaWaveformThumb
              v-if="track.particle"
              :peaks="track.peaks"
              :height="18"
            />
          </span>
          <QaBadge
            :label="statusBadge[track.status].label"
            :variant="statusBadge[track.status].variant"
            :accent="statusBadge[track.status].accent"
          />
        </button>

        <div class="shell-detail">
          <div class="shell-detail__header">
            <span class="shell-detail__title">{{ selectedTrack.name }}</span>
            <span class="shell-detail__toggles">
              <QaToggle v-model="selectedTrack.mute">M</QaToggle>
              <QaToggle v-model="selectedTrack.solo" accent="blue">S</QaToggle>
            </span>
          </div>
          <QaWaveform
            :peaks="selectedTrack.peaks"
            :playhead="playing ? playhead : 0"
            :height="44"
          />
          <div class="shell-detail__params">
            <QaKnob
              v-model="selectedTrack.gainDb"
              label="Gain"
              :min="-12"
              :max="12"
              :default-value="0"
              bipolar
              size="sm"
              :format="formatDb"
            />
            <QaKnob
              v-model="selectedTrack.pan"
              label="Pan"
              :min="-50"
              :max="50"
              :default-value="0"
              bipolar
              size="sm"
            />
            <div class="shell-detail__send">
              <QaSlider
                v-model="selectedTrack.sendA"
                label="Send A"
                :min="0"
                :max="100"
                unit="%"
                accent="blue"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Mixer: compact strip per particle track -->
      <div v-else-if="view === 'mixer'" class="layout-scroll shell-mixer-wrap">
        <div class="shell-mixer">
          <div
            v-for="(track, index) in tracks"
            :key="track.name"
            class="shell-strip"
            :class="{ 'shell-strip--active': index === selected }"
            @click="selected = index"
          >
            <QaKnob
              v-model="track.pan"
              :min="-50"
              :max="50"
              :default-value="0"
              bipolar
              size="sm"
              :show-value="false"
            />
            <div class="shell-strip__fader">
              <QaFader
                v-model="track.level"
                :height="92"
                :show-ruler="false"
              />
              <QaMeter
                :levels="levels[index] ?? [0, 0]"
                :length="92"
                :thickness="4"
              />
            </div>
            <span class="shell-strip__toggles">
              <QaToggle v-model="track.mute">M</QaToggle>
              <QaToggle v-model="track.solo" accent="blue">S</QaToggle>
            </span>
            <span class="shell-strip__name">{{ track.short }}</span>
          </div>
        </div>
      </div>

      <!-- Macros: performance controls for the whole rack -->
      <div v-else class="layout-scroll shell-macros">
        <div class="shell-macros__knobs">
          <QaKnob
            v-model="macroDrive"
            label="Drive"
            accent="red"
            :min="0"
            :max="100"
            :default-value="35"
            unit="%"
          />
          <QaKnob
            v-model="macroSpace"
            label="Space"
            accent="blue"
            :min="0"
            :max="100"
            :default-value="22"
            unit="%"
          />
          <QaKnob
            v-model="macroWidth"
            label="Width"
            accent="green"
            :min="0"
            :max="100"
            :default-value="64"
            unit="%"
          />
          <QaKnob
            v-model="macroGrain"
            label="Grain"
            accent="purple"
            :min="0"
            :max="100"
            :default-value="48"
            unit="%"
          />
        </div>
        <QaXYPad
          v-model="macroMotion"
          label-x="Filter"
          label-y="Res"
          :default-value="{ x: 0.32, y: 0.66 }"
        />
        <QaSlider
          v-model="macroMorph"
          label="Morph"
          :min="0"
          :max="100"
          unit="%"
        />
      </div>
    </QaPanel>

    <QaStatusBar :message="statusMessage">
      <template #leading>
        <span
          class="qa-connection-indicator qa-connection-indicator--linked"
          title="Linked"
        >
          <IconLink />
        </span>
      </template>
      <template #trailing>
        <QaButtonGroup>
          <QaIconButton aria-label="Sync changes" title="Sync">
            <QaBadge :label="pendingChanges" variant="highlight" />
          </QaIconButton>
          <QaButton
            highlight
            :disabled="pendingChanges === 0"
            @click="commitChanges"
          >
            Commit
          </QaButton>
        </QaButtonGroup>
      </template>
    </QaStatusBar>
  </main>
</template>

<style scoped>
.extension-shell :deep(.qa-toolbar) {
  flex-shrink: 0;
  padding: 0.45em 0.55em;
  border-bottom: 1px solid var(--c-control-border);
  background-color: var(--c-control-bg--500);
}

.extension-shell :deep(.qa-panel) {
  flex: 1;
  min-height: 0;
  border: none;
  border-radius: 0;
}

.extension-shell :deep(.qa-status-bar) {
  flex-shrink: 0;
  margin-top: 0;
}

.extension-shell__subtitle {
  margin: 0;
  color: var(--c-text-secondary);
  font-size: 0.88em;
}

/* Transport strip ---------------------------------------------------------*/

.shell-transport {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.4em 0.55em;
  border-bottom: 1px solid var(--c-control-border);
  background-color: var(--c-control-bg--500);
}

.shell-transport__spacer {
  flex: 1;
}

.shell-transport__master {
  display: flex;
  align-items: center;
  gap: 0.4em;
}

.shell-transport__master-label {
  color: var(--c-text-secondary);
  font-size: 0.72em;
  letter-spacing: 0.06em;
}

/* Tabs ---------------------------------------------------------------------*/

.shell-tabs {
  flex-shrink: 0;
  display: flex;
  padding: 0.55em 0.65em 0.1em;
}

.shell-tabs :deep(.qa-segmented) {
  width: 100%;
}

.shell-tabs :deep(.qa-segmented__item) {
  flex: 1;
}

/* Particles view ------------------------------------------------------------*/

.shell-row {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 0.35em 0.45em;
  border: 1px solid var(--c-control-border);
  background-color: var(--c-input-bg-500);
  font-size: 0.92em;
  text-align: left;
}

.shell-row--active {
  outline: 1px solid
    color-mix(in srgb, var(--c-highlight--primary) 55%, transparent);
}

.shell-row__text {
  display: flex;
  flex-direction: column;
  gap: 0.1em;
  min-width: 0;
  flex: 1;
}

.shell-row__name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shell-row__meta {
  color: var(--c-text-secondary);
  font-size: 0.8em;
}

.shell-row__thumb {
  width: 4.5em;
  flex-shrink: 0;
}

.shell-detail {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 0.5em;
  border: 1px solid var(--c-control-border);
  background-color: var(--c-control-bg--500);
}

.shell-detail__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5em;
}

.shell-detail__title {
  font-size: 0.92em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.shell-detail__toggles {
  display: flex;
  gap: 0.25em;
}

.shell-detail__params {
  display: flex;
  align-items: flex-start;
  gap: 0.65em;
}

.shell-detail__send {
  flex: 1;
  min-width: 0;
  align-self: center;
}

/* Mixer view ----------------------------------------------------------------*/

.shell-mixer-wrap {
  align-items: center;
}

.shell-mixer {
  display: flex;
  gap: 0.35em;
  justify-content: center;
}

.shell-strip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4em;
  padding: 0.45em 0.3em 0.35em;
  border: 1px solid var(--c-control-border);
  background-color: var(--c-input-bg-500);
  cursor: pointer;
}

.shell-strip--active {
  outline: 1px solid
    color-mix(in srgb, var(--c-highlight--primary) 55%, transparent);
}

.shell-strip__fader {
  display: flex;
  align-items: flex-end;
  gap: 0.25em;
}

.shell-strip__toggles {
  display: flex;
  gap: 0.2em;
}

.shell-strip__toggles :deep(.qa-toggle) {
  min-width: 1.6em;
  padding-inline: 0.2em;
}

.shell-strip__name {
  color: var(--c-text-secondary);
  font-size: 0.72em;
  letter-spacing: 0.06em;
}

/* Macros view ---------------------------------------------------------------*/

.shell-macros {
  gap: 0.75em;
}

.shell-macros__knobs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5em;
  justify-items: center;
}
</style>
