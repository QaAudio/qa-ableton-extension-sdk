<script setup lang="ts">
import WindowMaximizeIcon from "vue-material-design-icons/WindowMaximize.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="WindowMaximizeIcon" :size="size" />
</template>
