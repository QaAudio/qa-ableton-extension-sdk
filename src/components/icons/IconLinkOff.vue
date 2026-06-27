<script setup lang="ts">
import LinkOffIcon from "vue-material-design-icons/LinkOff.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="LinkOffIcon" :size="size" />
</template>
