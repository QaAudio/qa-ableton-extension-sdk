<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const props = withDefaults(
  defineProps<{
    title?: string;
    open?: boolean;
  }>(),
  {
    open: false,
  },
);

const emit = defineEmits<{
  close: [];
}>();

function onKeyDown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    emit("close");
  }
}

onMounted(() => {
  document.addEventListener("keydown", onKeyDown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeyDown);
});
</script>

<template>
  <div v-if="open" class="qa-dialog-overlay" @click.self="emit('close')">
    <section class="qa-dialog" role="dialog" :aria-label="title">
      <header v-if="title" class="qa-dialog__header">
        <h2 class="qa-dialog__title">{{ title }}</h2>
      </header>
      <div class="qa-dialog__body">
        <slot />
      </div>
      <footer v-if="$slots.footer" class="qa-dialog__footer">
        <slot name="footer" />
      </footer>
    </section>
  </div>
</template>

<style scoped>
.qa-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 100;
}

.qa-dialog {
  width: min(100%, 22rem);
  background: var(--c-panel-bg, var(--c-input-bg-500));
  border: 1px solid var(--c-control-border);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
}

.qa-dialog__title {
  font: inherit;
  font-size: 1rem;
  margin: 0;
}

.qa-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.qa-dialog__footer {
  display: flex;
  justify-content: flex-end;
}
</style>
