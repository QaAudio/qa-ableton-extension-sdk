<script setup lang="ts">
import MagnifyMinusIcon from "vue-material-design-icons/MagnifyMinus.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="MagnifyMinusIcon" :size="size" />
</template>
