<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-full',
      sizeClasses,
      variantClasses,
      { 'opacity-50 cursor-not-allowed': disabled },
    ]"
    :disabled="disabled"
    :type="type"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      ["primary", "secondary", "outline", "danger", "ghost"].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
  type: {
    type: String,
    default: "button",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "p-1.5 text-sm";
    case "lg":
      return "p-3 text-lg";
    default:
      return "p-2";
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case "primary":
      return "bg-primary-600 text-white hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:outline-none";
    case "secondary":
      return "bg-gray-600 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:outline-none";
    case "outline":
      return "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:outline-none";
    case "danger":
      return "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none";
    case "ghost":
      return "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:outline-none";
    default:
      return "";
  }
});

defineEmits(["click"]);
</script>
