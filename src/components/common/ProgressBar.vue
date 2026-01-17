<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-1">
      <span class="text-sm font-medium text-gray-700">{{ label }}</span>
      <span class="text-sm font-semibold text-gray-900">{{ percentage }}%</span>
    </div>
    <div class="w-full bg-gray-200 rounded-full h-2.5">
      <div
        class="h-2.5 rounded-full transition-all duration-300"
        :class="progressColorClass"
        :style="{ width: `${Math.min(percentage, 100)}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 100
  },
  label: {
    type: String,
    default: 'Progress'
  }
})

const progressColorClass = computed(() => {
  if (props.percentage >= 80) return 'bg-green-500'
  if (props.percentage >= 50) return 'bg-blue-500'
  if (props.percentage >= 25) return 'bg-yellow-500'
  return 'bg-red-500'
})
</script>

