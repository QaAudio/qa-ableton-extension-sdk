<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";

export type AutocompleteOption = {
  value: string;
  label: string;
};

const props = withDefaults(
  defineProps<{
    modelValue: string;
    options: AutocompleteOption[];
    placeholder?: string;
    invalid?: boolean;
    emptyLabel?: string;
    id?: string;
    disabled?: boolean;
    allowCreate?: boolean;
    showCreate?: boolean;
    createLabel?: string;
  }>(),
  {
    placeholder: "",
    invalid: false,
    emptyLabel: "No matches",
    allowCreate: false,
    showCreate: false,
    createLabel: "Create new",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  select: [option: AutocompleteOption];
  create: [query: string];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const open = ref(false);
const activeIndex = ref(-1);

const filteredOptions = computed(() => {
  const query = props.modelValue.trim().toLowerCase();
  if (!query) return props.options;
  return props.options.filter(
    (option) =>
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query),
  );
});

const showCreateRow = computed(
  () =>
    props.allowCreate &&
    props.showCreate &&
    props.modelValue.trim().length > 0,
);

const selectableCount = computed(
  () => filteredOptions.value.length + (showCreateRow.value ? 1 : 0),
);

const createRowIndex = computed(() =>
  showCreateRow.value ? filteredOptions.value.length : -1,
);

watch([filteredOptions, showCreateRow], () => {
  activeIndex.value = selectableCount.value > 0 ? 0 : -1;
});

function updateValue(value: string): void {
  emit("update:modelValue", value);
  open.value = true;
}

function selectOption(option: AutocompleteOption): void {
  emit("update:modelValue", option.label);
  emit("select", option);
  open.value = false;
}

function selectCreate(): void {
  const query = props.modelValue.trim();
  if (!query) return;
  emit("create", query);
  open.value = false;
}

function onKeyDown(event: KeyboardEvent): void {
  if (!open.value && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
    open.value = true;
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (selectableCount.value === 0) return;
    activeIndex.value = (activeIndex.value + 1) % selectableCount.value;
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (selectableCount.value === 0) return;
    activeIndex.value =
      (activeIndex.value - 1 + selectableCount.value) % selectableCount.value;
    return;
  }

  if (event.key === "Enter" && activeIndex.value >= 0) {
    if (showCreateRow.value && activeIndex.value === createRowIndex.value) {
      event.preventDefault();
      selectCreate();
      return;
    }

    const option = filteredOptions.value[activeIndex.value];
    if (option) {
      event.preventDefault();
      selectOption(option);
    }
    return;
  }

  if (event.key === "Escape") {
    open.value = false;
  }
}

onMounted(() => {
  void nextTick(() => inputRef.value?.focus());
});

defineExpose({
  focus: () => inputRef.value?.focus(),
});
</script>

<template>
  <div class="qa-autocomplete">
    <input
      :id="id"
      ref="inputRef"
      class="qa-input"
      :class="{ 'qa-input--invalid': invalid }"
      type="text"
      autocomplete="off"
      :placeholder="placeholder"
      :disabled="disabled"
      :value="modelValue"
      :aria-invalid="invalid ? 'true' : 'false'"
      @input="updateValue(($event.target as HTMLInputElement).value)"
      @focus="open = true"
      @blur="open = false"
      @keydown="onKeyDown"
    />

    <ul
      v-if="open && (selectableCount > 0 || modelValue)"
      class="qa-autocomplete__list"
    >
      <li
        v-for="(option, index) in filteredOptions"
        :key="option.value"
        class="qa-autocomplete__option"
        :class="{ 'qa-autocomplete__option--active': index === activeIndex }"
        @mousedown.prevent="selectOption(option)"
      >
        {{ option.label }}
      </li>
      <li
        v-if="showCreateRow"
        class="qa-autocomplete__create"
        :class="{ 'qa-autocomplete__create--active': activeIndex === createRowIndex }"
        @mousedown.prevent="selectCreate"
      >
        {{ createLabel }}
      </li>
      <li
        v-if="filteredOptions.length === 0 && !showCreateRow"
        class="qa-autocomplete__empty"
      >
        {{ emptyLabel }}
      </li>
    </ul>
  </div>
</template>
