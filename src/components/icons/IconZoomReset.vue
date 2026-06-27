<script setup lang="ts">
import FitToPageOutlineIcon from "vue-material-design-icons/FitToPageOutline.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="FitToPageOutlineIcon" :size="size" />
</template>
