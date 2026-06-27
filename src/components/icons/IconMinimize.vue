<script setup lang="ts">
import WindowMinimizeIcon from "vue-material-design-icons/WindowMinimize.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="WindowMinimizeIcon" :size="size" />
</template>
