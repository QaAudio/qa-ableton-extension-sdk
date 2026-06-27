<script setup lang="ts">
import InformationIcon from "vue-material-design-icons/Information.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="InformationIcon" :size="size" />
</template>
