<script setup lang="ts">
import CloseIcon from "vue-material-design-icons/Close.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="CloseIcon" :size="size" />
</template>
