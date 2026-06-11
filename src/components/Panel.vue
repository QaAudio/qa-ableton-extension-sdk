<script setup lang="ts">
defineProps<{
  label?: string;
  subtitle?: string;
  grow?: boolean;
}>();
</script>

<template>
  <section
    class="qa-panel"
    :class="{ 'qa-panel--grow': grow }"
    :aria-label="label"
  >
    <header v-if="label || $slots.header" class="qa-panel__header">
      <div v-if="label || $slots.header" class="qa-panel__header-row">
        <span v-if="label" class="qa-label__text">{{ label }}</span>
        <slot name="header" />
      </div>
      <span v-if="subtitle" class="qa-panel__subtitle">{{ subtitle }}</span>
      <slot name="subtitle" />
    </header>
    <slot />
  </section>
</template>
