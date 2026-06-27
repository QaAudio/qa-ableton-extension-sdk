<script setup lang="ts">
import WeatherNightIcon from "vue-material-design-icons/WeatherNight.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="WeatherNightIcon" :size="size" />
</template>
