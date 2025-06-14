<template>
  <div>
    <label v-if="label" :for="id" class="form-label">{{ label }}</label>
    <div class="relative">
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="[
          'form-input',
          errorMessage
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : '',
          { 'pl-10': iconLeft, 'pr-10': iconRight || clearable },
        ]"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
      />
      <div
        v-if="iconLeft"
        class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
      >
        <slot name="icon-left"></slot>
      </div>
      <div
        v-if="iconRight"
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
      >
        <slot name="icon-right"></slot>
      </div>
      <button
        v-if="clearable && modelValue"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
        @click="$emit('update:modelValue', '')"
      >
        <span class="sr-only">クリア</span>
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
    <p v-else-if="helpText" class="form-help">{{ helpText }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  modelValue: string;
  label?: string;
  id?: string;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  errorMessage?: string;
  helpText?: string;
  iconLeft?: boolean;
  iconRight?: boolean;
  clearable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  id: () => `input-${Math.random().toString(36).substring(2, 9)}`,
  placeholder: "",
  disabled: false,
  required: false,
  iconLeft: false,
  iconRight: false,
  clearable: false,
});

defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();
</script>
