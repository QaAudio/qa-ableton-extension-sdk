<script setup lang="ts">
import { ref } from "vue";
import {
  IconInfo,
  IconLink,
  QaButton,
  QaButtonGroup,
  QaIconButton,
  QaPanel,
  QaStatusBar,
  QaThemeToggle,
  QaToolbar,
} from "@quantumaudio/ableton-extension-sdk/vue";

const status = ref("Scanning Live set…");
const linked = ref(false);

function connect(): void {
  status.value = "Connecting to Ableton…";
  window.setTimeout(() => {
    linked.value = true;
    status.value = "Linked — 12 tracks, 128 BPM";
  }, 900);
}
</script>

<template>
  <main class="layout-root status-chrome">
    <QaToolbar>
      <span class="qa-label__text">Kernel</span>
      <div class="qa-toolbar__grow" />
      <QaButtonGroup>
        <QaButton highlight :active="linked" @click="connect">
          {{ linked ? "Linked" : "Connect" }}
        </QaButton>
        <QaButton :disabled="!linked">Scan</QaButton>
      </QaButtonGroup>
    </QaToolbar>

    <QaPanel label="MCP bridge" subtitle="Read-only context for agents">
      <p class="qa-log">
        Drop this chrome into any extension webview: toolbar up top, status line
        down below, theme toggle in the corner. Agents stay out of your hair;
        you stay in Live.
      </p>
      <QaButton highlight :disabled="!linked" @click="status = 'Context refreshed.'">
        Refresh context
      </QaButton>
    </QaPanel>

    <QaStatusBar :message="status">
      <template #leading>
        <span
          class="qa-connection-indicator"
          :class="{ 'qa-connection-indicator--linked': linked }"
          :title="linked ? 'Linked' : 'Disconnected'"
        >
          <IconLink />
        </span>
      </template>
      <template #trailing>
        <QaIconButton
          aria-label="About this extension"
          title="About"
          @click="status = 'qa-ableton-extension-sdk v0.1'"
        >
          <IconInfo />
        </QaIconButton>
        <QaThemeToggle embedded />
      </template>
    </QaStatusBar>
  </main>
</template>

<style scoped>
.status-chrome :deep(.qa-toolbar) {
  flex-shrink: 0;
  padding: 0.45em 0.55em;
  border-bottom: 1px solid var(--c-control-border);
}

.status-chrome :deep(.qa-panel) {
  flex: 1;
  min-height: 0;
  margin: 0.65em;
}

.status-chrome :deep(.qa-status-bar) {
  flex-shrink: 0;
  margin-top: auto;
}
</style>
