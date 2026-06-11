<script setup lang="ts">
import IconChevronDown from "./icons/IconChevronDown.vue";

export type SelectOption = { value: string; label: string };

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: SelectOption[];
    label?: string;
    id?: string;
    disabled?: boolean;
  }>(),
  {},
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const fieldId = props.id ?? `qa-select-${Math.random().toString(36).slice(2, 9)}`;

function onChange(event: Event): void {
  emit("update:modelValue", (event.target as HTMLSelectElement).value);
}
</script>

<template>
  <div class="qa-select-wrap">
    <label v-if="label" class="qa-select-wrap__label" :for="fieldId">{{ label }}</label>
    <div class="qa-select-field">
      <select
        :id="fieldId"
        class="qa-select"
        :value="modelValue"
        :disabled="disabled"
        @change="onChange"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <IconChevronDown class="qa-select-field__chevron" />
    </div>
  </div>
</template>
