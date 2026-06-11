<script setup lang="ts">
import { ref } from "vue";
import {
  IconLink,
  QaBadge,
  QaButton,
  QaButtonGroup,
  QaIconButton,
  QaPanel,
  QaStatusBar,
  QaToolbar,
} from "@quantumaudio/ableton-extension-sdk/vue";
import ProjectToolbarLayout from "./ProjectToolbarLayout.vue";

const pendingChanges = ref(3);
const selectedTrack = ref("Bass — Operator");

const tracks = [
  { name: "Kick", particle: "kick-v3" },
  { name: "Snare", particle: "snare-v1" },
  { name: "Bass — Operator", particle: "bass-loop" },
  { name: "Pad — Wavetable", particle: null },
];
</script>

<template>
  <main class="layout-root extension-shell">
    <QaToolbar>
      <ProjectToolbarLayout embedded />
    </QaToolbar>

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
          Late-night techno sketch · 4 particles
        </p>
      </template>

      <div class="layout-scroll">
        <button
          v-for="track in tracks"
          :key="track.name"
          type="button"
          class="mock-row"
          :class="{ 'mock-row--active': track.name === selectedTrack }"
          @click="selectedTrack = track.name"
        >
          <span>{{ track.name }}</span>
          <span class="mock-row__meta">
            {{ track.particle ?? "unlinked" }}
          </span>
        </button>
      </div>
    </QaPanel>

    <QaStatusBar message="Connected to Ableton — 3 pending changes">
      <template #leading>
        <span class="qa-connection-indicator qa-connection-indicator--linked" title="Linked">
          <IconLink />
        </span>
      </template>
      <template #trailing>
        <QaButtonGroup>
          <QaIconButton aria-label="Sync changes" title="Sync">
            <QaBadge :label="pendingChanges" variant="highlight" />
          </QaIconButton>
          <QaButton highlight @click="pendingChanges = 0">Commit</QaButton>
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
</style>
