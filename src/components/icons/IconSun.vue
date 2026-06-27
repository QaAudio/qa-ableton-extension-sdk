<script setup lang="ts">
import WhiteBalanceSunnyIcon from "vue-material-design-icons/WhiteBalanceSunny.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="WhiteBalanceSunnyIcon" :size="size" />
</template>
