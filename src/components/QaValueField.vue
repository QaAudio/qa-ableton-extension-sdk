<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import {
  formatValue,
  sanitizeParamValue,
  specFromProps,
} from "../lib/param.js";
import { useParamDrag } from "../composables/useParamDrag.js";
import { useParamKeyboard } from "../composables/useParamKeyboard.js";

const props = withDefaults(
  defineProps<{
    modelValue: number;
    min: number;
    max: number;
    step?: number;
    defaultValue?: number;
    unit?: string;
    format?: (value: number) => string;
    parse?: (text: string) => number | null;
    /** When true, emit only finite integers (step defaults to 1). */
    integer?: boolean;
    width?: string;
    label?: string;
    disabled?: boolean;
    taper?: "linear" | "log";
  }>(),
  {},
);

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const editing = ref(false);
const editText = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

const spec = computed(() =>
  specFromProps({
    min: props.min,
    max: props.max,
    step: props.step ?? (props.integer ? 1 : undefined),
    defaultValue: props.defaultValue,
    unit: props.unit,
    format: props.format,
    taper: props.taper,
  }),
);

const readout = computed(() => formatValue(props.modelValue, spec.value));

function setValue(value: number): void {
  const next = sanitizeParamValue(value, props.min, props.max, {
    integer: props.integer,
  });
  if (next !== null) {
    emit("update:modelValue", next);
  }
}

const { dragging, onPointerdown } = useParamDrag({
  value: () => props.modelValue,
  spec: spec.value,
  onChange: setValue,
  disabled: () => (props.disabled ?? false) || editing.value,
});

const { onKeydown } = useParamKeyboard({
  value: () => props.modelValue,
  spec: spec.value,
  onChange: setValue,
  disabled: () => (props.disabled ?? false) || editing.value,
});

async function startEditing(): Promise<void> {
  if (props.disabled) return;
  editing.value = true;
  editText.value = readout.value.replace(props.unit ?? "", "");
  await nextTick();
  inputRef.value?.focus();
  inputRef.value?.select();
}

function onBoxDblclick(event: MouseEvent): void {
  event.preventDefault();
  startEditing();
}

function commitEdit(): void {
  const parsed = props.parse?.(editText.value.trim()) ?? Number(editText.value);
  if (parsed !== null) {
    setValue(parsed);
  }
  editing.value = false;
}

function cancelEdit(): void {
  editing.value = false;
}

function onEditKeydown(event: KeyboardEvent): void {
  if (event.key === "Enter") {
    event.preventDefault();
    commitEdit();
  } else if (event.key === "Escape") {
    event.preventDefault();
    cancelEdit();
  }
}
</script>

<template>
  <div class="qa-value-field">
    <span v-if="label" class="qa-value-field__label">{{ label }}</span>
    <div
      v-if="!editing"
      class="qa-value-field__box"
      :class="{
        'qa-value-field__box--dragging': dragging,
        'qa-value-field__box--disabled': disabled,
      }"
      :style="{ width }"
      role="slider"
      tabindex="0"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-valuenow="modelValue"
      :aria-valuetext="readout"
      :aria-label="label ?? 'Value'"
      @pointerdown="onPointerdown"
      @dblclick="onBoxDblclick"
      @keydown="onKeydown"
    >
      {{ readout }}
    </div>
    <div
      v-else
      class="qa-value-field__box qa-value-field__box--editing"
      :style="{ width }"
    >
      <input
        ref="inputRef"
        class="qa-value-field__input"
        type="text"
        v-model="editText"
        @keydown="onEditKeydown"
        @blur="commitEdit"
      />
    </div>
  </div>
</template>
