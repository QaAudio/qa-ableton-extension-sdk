<script setup lang="ts">
import IconChevronDown from "./icons/IconChevronDown.vue";
import QaPowerButton from "./QaPowerButton.vue";

const props = withDefaults(
  defineProps<{
    title: string;
    enabled?: boolean;
    collapsed?: boolean;
    showPower?: boolean;
  }>(),
  {
    showPower: true,
  },
);

const emit = defineEmits<{
  "update:enabled": [value: boolean];
  "update:collapsed": [value: boolean];
}>();

function toggleCollapsed(): void {
  emit("update:collapsed", !props.collapsed);
}
</script>

<template>
  <section class="qa-device-panel">
    <header class="qa-device-panel__header">
      <QaPowerButton
        v-if="showPower && enabled !== undefined"
        :model-value="enabled"
        :size="12"
        @update:model-value="$emit('update:enabled', $event)"
      />
      <span class="qa-device-panel__title">{{ title }}</span>
      <slot name="header-extra" />
      <button
        v-if="collapsed !== undefined"
        type="button"
        class="qa-device-panel__fold"
        :aria-expanded="collapsed ? 'false' : 'true'"
        aria-label="Fold device"
        @click="toggleCollapsed"
      >
        <IconChevronDown
          class="qa-device-panel__fold-icon"
          :class="{ 'qa-device-panel__fold-icon--collapsed': collapsed }"
        />
      </button>
    </header>
    <div
      v-show="!collapsed"
      class="qa-device-panel__body"
      :class="{ 'qa-device-panel__body--disabled': enabled === false }"
    >
      <slot />
    </div>
  </section>
</template>
