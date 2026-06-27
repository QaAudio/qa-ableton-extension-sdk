<script setup lang="ts">
import ChevronDownIcon from "vue-material-design-icons/ChevronDown.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="ChevronDownIcon" :size="size" />
</template>
