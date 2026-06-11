<script setup lang="ts">
import QaIconButton from "./QaIconButton.vue";
import IconMinimize from "./icons/IconMinimize.vue";
import IconMaximize from "./icons/IconMaximize.vue";
import IconRestore from "./icons/IconRestore.vue";
import IconClose from "./icons/IconClose.vue";

defineProps<{
  maximized?: boolean;
}>();

const emit = defineEmits<{
  minimize: [];
  maximize: [];
  close: [];
}>();
</script>

<template>
  <div class="qa-window-controls">
    <QaIconButton
      class="qa-window-controls__btn"
      aria-label="Minimize"
      @click="emit('minimize')"
    >
      <IconMinimize />
    </QaIconButton>
    <QaIconButton
      class="qa-window-controls__btn"
      :aria-label="maximized ? 'Restore' : 'Maximize'"
      @click="emit('maximize')"
    >
      <IconRestore v-if="maximized" />
      <IconMaximize v-else />
    </QaIconButton>
    <QaIconButton
      class="qa-window-controls__btn qa-window-controls__btn--close"
      aria-label="Close"
      @click="emit('close')"
    >
      <IconClose />
    </QaIconButton>
  </div>
</template>
