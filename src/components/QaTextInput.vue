<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    placeholder?: string;
    invalid?: boolean;
    error?: string;
    id?: string;
  }>(),
  {
    invalid: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const inputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  void nextTick(() => inputRef.value?.focus());
});

defineExpose({
  focus: () => inputRef.value?.focus(),
  select: () => inputRef.value?.select(),
});
</script>

<template>
  <label class="qa-label" :for="id">
    <span v-if="label" class="qa-label__text">{{ label }}</span>
    <input
      :id="id"
      ref="inputRef"
      class="qa-input"
      :class="{ 'qa-input--invalid': invalid }"
      type="text"
      autocomplete="off"
      :placeholder="placeholder"
      :value="modelValue"
      :aria-invalid="invalid ? 'true' : 'false'"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error && invalid" class="qa-field-error">{{ error }}</span>
  </label>
</template>
