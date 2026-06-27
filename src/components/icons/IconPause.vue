<script setup lang="ts">
import PauseIcon from "vue-material-design-icons/Pause.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="PauseIcon" :size="size" />
</template>
