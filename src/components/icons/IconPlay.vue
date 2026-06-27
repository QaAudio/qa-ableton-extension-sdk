<script setup lang="ts">
import PlayIcon from "vue-material-design-icons/Play.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="PlayIcon" :size="size" />
</template>
