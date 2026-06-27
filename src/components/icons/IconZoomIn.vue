<script setup lang="ts">
import MagnifyPlusIcon from "vue-material-design-icons/MagnifyPlus.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="MagnifyPlusIcon" :size="size" />
</template>
