<template>
  <button
    :class="[
      'btn',
      variant ? `btn-${variant}` : '',
      size ? `btn-${size}` : '',
      { 'opacity-50 cursor-not-allowed': disabled },
    ]"
    :disabled="disabled || loading"
    :type="type"
    @click="$emit('click', $event)"
  >
    <slot name="icon-left" v-if="$slots['icon-left']" />
    <span v-if="loading" class="mr-2">
      <span
        class="inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"
      ></span>
    </span>
    <slot />
    <slot name="icon-right" v-if="$slots['icon-right']" />
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      ["primary", "secondary", "outline", "danger"].includes(value),
  },
  size: {
    type: String,
    default: "",
    validator: (value) => ["", "sm", "lg"].includes(value),
  },
  type: {
    type: String,
    default: "button",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click"]);
</script>
