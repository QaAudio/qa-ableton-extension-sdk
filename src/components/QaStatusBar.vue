<script setup lang="ts">
defineProps<{
  message?: string;
}>();
</script>

<template>
  <footer class="qa-status-bar">
    <div v-if="$slots.leading" class="qa-status-bar__leading">
      <slot name="leading" />
    </div>
    <output
      class="qa-status-bar__message"
      :title="message"
    >
      <slot>{{ message }}</slot>
    </output>
    <div v-if="$slots.trailing" class="qa-status-bar__actions">
      <slot name="trailing" />
    </div>
  </footer>
</template>
