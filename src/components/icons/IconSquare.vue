<script setup lang="ts">
import CheckboxBlankOutlineIcon from "vue-material-design-icons/CheckboxBlankOutline.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="CheckboxBlankOutlineIcon" :size="size" />
</template>
