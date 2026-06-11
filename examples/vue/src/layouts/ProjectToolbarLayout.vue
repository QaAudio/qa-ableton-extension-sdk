<script setup lang="ts">
import { ref } from "vue";
import {
  IconSquare,
  QaAutocomplete,
  QaButton,
  QaButtonGroup,
  QaIconButton,
  QaPanel,
} from "@quantumaudio/ableton-extension-sdk/vue";

const props = withDefaults(
  defineProps<{
    embedded?: boolean;
  }>(),
  {
    embedded: false,
  },
);

const projectQuery = ref("night-drive");
const linkActive = ref(true);

const projects = [
  { value: "night-drive", label: "night-drive" },
  { value: "demo-warehouse", label: "demo-warehouse" },
  { value: "acid-test", label: "acid-test" },
];
</script>

<template>
  <component :is="embedded ? 'div' : 'main'" class="project-toolbar-root" :class="{ 'layout-root': !embedded }">
    <QaPanel v-if="!embedded" label="Project picker" subtitle="Toolbar row from Intricator / Atlas UIs">
      <div class="project-toolbar">
        <QaButtonGroup>
          <QaButton highlight :active="linkActive" @click="linkActive = !linkActive">
            Link
          </QaButton>
          <QaButton highlight>Sync</QaButton>
          <QaButton>Browse</QaButton>
        </QaButtonGroup>

        <div class="qa-toolbar__grow">
          <QaAutocomplete
            v-model="projectQuery"
            :options="projects"
            placeholder="Select a project…"
            allow-create
            show-create
            create-label="Create project…"
          />
        </div>
      </div>

      <p class="qa-status" :data-state="linkActive ? 'linked' : undefined">
        {{ linkActive ? "Linked to Live — project autocomplete is live." : "Link disabled — read-only mode." }}
      </p>
    </QaPanel>

    <div v-else class="project-toolbar project-toolbar--embedded">
      <div class="qa-toolbar__grow">
        <QaAutocomplete
          v-model="projectQuery"
          :options="projects"
          placeholder="Select a project…"
          allow-create
          show-create
          create-label="Create project…"
        />
      </div>

      <QaIconButton aria-label="Browse projects" title="Browse">
        <IconSquare />
      </QaIconButton>
    </div>
  </component>
</template>

<style scoped>
.project-toolbar-root:not(.layout-root) {
  width: 100%;
  min-width: 0;
}

.project-toolbar-root.layout-root {
  padding: 0.85em;
}

.project-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5em;
  width: 100%;
  min-width: 0;
}

.project-toolbar--embedded {
  gap: 0.35em;
}
</style>
