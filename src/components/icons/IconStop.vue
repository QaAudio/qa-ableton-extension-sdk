<script setup lang="ts">
import StopIcon from "vue-material-design-icons/Stop.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="StopIcon" :size="size" />
</template>
