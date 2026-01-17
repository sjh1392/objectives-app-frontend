<template>
  <div
    class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-move"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    draggable="true"
  >
    <h3 class="font-medium text-gray-900 mb-2">{{ keyResult.title }}</h3>
    <p v-if="keyResult.description" class="text-sm text-gray-600 mb-3 line-clamp-2">
      {{ keyResult.description }}
    </p>
    <div class="space-y-2">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-600">Progress:</span>
        <span class="font-medium">{{ Math.round(keyResult.progress_percentage || 0) }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="h-2 rounded-full transition-all"
          :class="{
            'bg-green-500': keyResult.progress_percentage >= 80,
            'bg-blue-500': keyResult.progress_percentage >= 50 && keyResult.progress_percentage < 80,
            'bg-yellow-500': keyResult.progress_percentage >= 25 && keyResult.progress_percentage < 50,
            'bg-red-500': keyResult.progress_percentage < 25
          }"
          :style="{ width: `${Math.min(keyResult.progress_percentage || 0, 100)}%` }"
        ></div>
      </div>
      <div class="flex justify-between text-xs text-gray-500">
        <span>{{ keyResult.current_value || 0 }} / {{ keyResult.target_value || 0 }} {{ keyResult.unit || '' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  keyResult: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['drag-start', 'drag-end', 'drop'])

function handleDragStart(event) {
  emit('drag-start', { keyResult: props.keyResult })
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', props.keyResult.id)
}

function handleDragEnd(event) {
  // Let the parent handle clearing the dragged state
  emit('drag-end')
}
</script>

