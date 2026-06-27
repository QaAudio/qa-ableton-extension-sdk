<script setup lang="ts">
import LinkIcon from "vue-material-design-icons/Link.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="LinkIcon" :size="size" />
</template>
