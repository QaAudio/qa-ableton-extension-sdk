<script setup lang="ts">
import WindowRestoreIcon from "vue-material-design-icons/WindowRestore.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="WindowRestoreIcon" :size="size" />
</template>
