<script setup lang="ts">
import { computed, ref } from "vue";
import { QaButton, QaThemeToggle } from "@quantumaudio/ableton-extension-sdk/vue";
import ChannelStripLayout from "./layouts/ChannelStripLayout.vue";
import EffectPanelLayout from "./layouts/EffectPanelLayout.vue";
import ExtensionShellLayout from "./layouts/ExtensionShellLayout.vue";
import FxChainLayout from "./layouts/FxChainLayout.vue";
import InstrumentDeviceLayout from "./layouts/InstrumentDeviceLayout.vue";
import ProjectToolbarLayout from "./layouts/ProjectToolbarLayout.vue";
import RenameDialogLayout from "./layouts/RenameDialogLayout.vue";
import SampleEditorLayout from "./layouts/SampleEditorLayout.vue";
import StatusChromeLayout from "./layouts/StatusChromeLayout.vue";
import SynthPlaygroundLayout from "./layouts/SynthPlaygroundLayout.vue";
import AccentVariationsLayout from "./layouts/AccentVariationsLayout.vue";

const props = withDefaults(
  defineProps<{
    initialLayout?: string;
    screenshotMode?: boolean;
  }>(),
  {
    initialLayout: "extension-shell",
    screenshotMode: false,
  },
);

type LayoutId =
  | "extension-shell"
  | "effect-panel"
  | "rename-dialog"
  | "project-toolbar"
  | "status-chrome"
  | "instrument-device"
  | "channel-strip"
  | "sample-editor"
  | "fx-chain"
  | "synth-playground"
  | "accent-variations";

const layouts: { id: LayoutId; label: string; blurb: string }[] = [
  {
    id: "extension-shell",
    label: "Extension shell",
    blurb:
      "Toolbar, transport, tabbed particles/mixer/macros panel, status bar — the Intricator-shaped sandwich.",
  },
  {
    id: "effect-panel",
    label: "Effect panel",
    blurb: "Device-style sliders and bypass — good for audio/MIDI utilities.",
  },
  {
    id: "rename-dialog",
    label: "Rename dialog",
    blurb: "Modal form with QaDialog + QaTextInput — SDK dialog pattern.",
  },
  {
    id: "project-toolbar",
    label: "Project toolbar",
    blurb: "Link/Sync actions plus project autocomplete.",
  },
  {
    id: "status-chrome",
    label: "Status chrome",
    blurb: "Connection indicator, info action, embedded theme toggle.",
  },
  {
    id: "instrument-device",
    label: "Instrument device",
    blurb: "Knobs, segmented tabs, filter select — synth/device UI.",
  },
  {
    id: "channel-strip",
    label: "Channel strip",
    blurb: "Pan, sends, fader, stereo meter, mute/solo/arm toggles.",
  },
  {
    id: "sample-editor",
    label: "Sample editor",
    blurb: "Interactive waveform, transport, warp mode, loop toggle.",
  },
  {
    id: "fx-chain",
    label: "FX chain",
    blurb: "Device panels with XY pad, fold, and power states.",
  },
  {
    id: "synth-playground",
    label: "Synth playground",
    blurb: "Web Audio demo — power on to hear a live synth + meter.",
  },
  {
    id: "accent-variations",
    label: "Accent variations",
    blurb: "Fill vs surface accent colors — orange, red, blue, green, purple.",
  },
];

const activeLayout = ref<LayoutId>(
  layouts.some((entry) => entry.id === props.initialLayout)
    ? (props.initialLayout as LayoutId)
    : "extension-shell",
);

const activeMeta = computed(
  () => layouts.find((entry) => entry.id === activeLayout.value) ?? layouts[0],
);

const layoutComponent = computed(() => {
  switch (activeLayout.value) {
    case "effect-panel":
      return EffectPanelLayout;
    case "rename-dialog":
      return RenameDialogLayout;
    case "project-toolbar":
      return ProjectToolbarLayout;
    case "status-chrome":
      return StatusChromeLayout;
    case "instrument-device":
      return InstrumentDeviceLayout;
    case "channel-strip":
      return ChannelStripLayout;
    case "sample-editor":
      return SampleEditorLayout;
    case "fx-chain":
      return FxChainLayout;
    case "synth-playground":
      return SynthPlaygroundLayout;
    case "accent-variations":
      return AccentVariationsLayout;
    default:
      return ExtensionShellLayout;
  }
});
</script>

<template>
  <div class="gallery" :class="{ 'gallery--screenshot': screenshotMode }">
    <aside v-if="!screenshotMode" class="gallery__sidebar">
      <div>
        <h1 class="gallery__title">Vue layout gallery</h1>
        <p class="gallery__hint">
          Copy-paste starters from QuantumAudio extensions. Toggle theme and
          resize the window — these layouts are built for narrow Live webviews.
        </p>
      </div>

      <nav class="gallery__nav" aria-label="Layouts">
        <QaButton
          v-for="entry in layouts"
          :key="entry.id"
          :highlight="entry.id === activeLayout"
          :active="entry.id === activeLayout"
          @click="activeLayout = entry.id"
        >
          {{ entry.label }}
        </QaButton>
      </nav>

      <div class="gallery__footer">
        <p class="gallery__hint">{{ activeMeta.blurb }}</p>
        <QaThemeToggle />
      </div>
    </aside>

    <section class="gallery__stage" :aria-label="activeMeta.label">
      <div class="gallery__frame">
        <component :is="layoutComponent" />
      </div>
    </section>
  </div>
</template>
