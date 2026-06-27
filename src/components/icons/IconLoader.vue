<script setup lang="ts">
import LoadingIcon from "vue-material-design-icons/Loading.vue";
import QaMdiIcon from "./QaMdiIcon.vue";

withDefaults(defineProps<{ size?: number }>(), { size: 16 });
</script>

<template>
  <QaMdiIcon :icon="LoadingIcon" :size="size" spin />
</template>
