<script setup lang="ts">
import PowerIcon from "vue-material-design-icons/Power.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="PowerIcon" :size="size" />
</template>
