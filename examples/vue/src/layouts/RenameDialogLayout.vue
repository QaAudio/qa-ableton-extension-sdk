<script setup lang="ts">
import { ref } from "vue";
import {
  QaButton,
  QaButtonGroup,
  QaDialog,
  QaTextInput,
} from "@quantumaudio/ableton-extension-sdk/vue";

const open = ref(true);
const clipName = ref("Verse loop 01");
const result = ref<string | null>(null);

function submit(): void {
  const trimmed = clipName.value.trim();
  if (!trimmed) return;
  result.value = `Renamed to “${trimmed}”`;
  open.value = false;
}

function cancel(): void {
  result.value = "Cancelled";
  open.value = false;
}
</script>

<template>
  <main class="layout-root rename-dialog">
    <div class="rename-dialog__backdrop">
      <p v-if="result" class="qa-log">{{ result }}</p>
      <QaButton v-else highlight @click="open = true">Reopen dialog</QaButton>
    </div>

    <QaDialog title="Rename clip" :open="open" @close="cancel">
      <QaTextInput
        v-model="clipName"
        label="Clip name"
        placeholder="New clip name…"
        @keydown.enter.prevent="submit"
      />

      <template #footer>
        <QaButtonGroup>
          <QaButton @click="cancel">Cancel</QaButton>
          <QaButton highlight @click="submit">OK</QaButton>
        </QaButtonGroup>
      </template>
    </QaDialog>
  </main>
</template>

<style scoped>
.rename-dialog__backdrop {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}
</style>
