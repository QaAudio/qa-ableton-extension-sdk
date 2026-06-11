<script setup lang="ts">
export type SegmentedOption = { value: string; label: string };

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: SegmentedOption[];
    disabled?: boolean;
    ariaLabel?: string;
  }>(),
  {
    ariaLabel: "Segmented control",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

function onKeydown(event: KeyboardEvent, index: number): void {
  if (props.disabled) return;
  let next = index;
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    next = (index + 1) % props.options.length;
    event.preventDefault();
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    next = (index - 1 + props.options.length) % props.options.length;
    event.preventDefault();
  } else {
    return;
  }
  const option = props.options[next];
  if (option) emit("update:modelValue", option.value);
}
</script>

<template>
  <div class="qa-segmented" role="tablist" :aria-label="ariaLabel">
    <button
      v-for="(option, index) in options"
      :key="option.value"
      type="button"
      class="qa-button qa-segmented__item"
      :class="{
        'qa-button--highlight': option.value === modelValue,
        'qa-segmented__item--first': index === 0,
        'qa-segmented__item--last': index === options.length - 1,
      }"
      role="tab"
      :aria-selected="option.value === modelValue ? 'true' : 'false'"
      :data-active="option.value === modelValue ? 'true' : undefined"
      :disabled="disabled"
      @click="$emit('update:modelValue', option.value)"
      @keydown="onKeydown($event, index)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style scoped>
.qa-segmented {
  display: inline-flex;
}

.qa-segmented__item {
  border-radius: 0;
}

.qa-segmented__item--first {
  border-top-left-radius: 0.25em;
  border-bottom-left-radius: 0.25em;
}

.qa-segmented__item--last {
  border-top-right-radius: 0.25em;
  border-bottom-right-radius: 0.25em;
}

.qa-segmented__item + .qa-segmented__item {
  margin-left: -1px;
}
</style>
