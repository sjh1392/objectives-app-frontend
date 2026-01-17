<template>
  <span
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-gray-700 border border-gray-300"
  >
    {{ tag }}
  </span>
</template>

<script setup>
const props = defineProps({
  tag: {
    type: String,
    required: true
  }
})
</script>

