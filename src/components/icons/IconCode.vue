<script setup lang="ts">
import CodeTagsIcon from "vue-material-design-icons/CodeTags.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="CodeTagsIcon" :size="size" />
</template>
