<script setup lang="ts">
import RecordCircleIcon from "vue-material-design-icons/RecordCircle.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="RecordCircleIcon" :size="size" />
</template>
