<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-bold mb-6">{{ isEditing ? 'Edit Key Result' : 'Add New Key Result' }}</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          v-model="formData.title"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          v-model="formData.description"
          rows="3"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        ></textarea>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Target Value</label>
          <input
            v-model.number="formData.target_value"
            type="number"
            step="0.01"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Current Value</label>
          <input
            v-model.number="formData.current_value"
            type="number"
            step="0.01"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div v-if="isEditing">
        <label class="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
        <div class="flex items-center gap-3">
          <input
            v-model.number="progressPercent"
            @input="updateCurrentValueFromProgress"
            type="number"
            min="0"
            max="100"
            step="0.1"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
          />
          <span class="text-sm text-gray-500">%</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">Adjust progress percentage (will update current value)</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
        <input
          v-model="formData.unit"
          type="text"
          placeholder="e.g., %, $, count"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
        <input
          v-model="formData.due_date"
          type="date"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div class="flex justify-end gap-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {{ isEditing ? 'Update' : 'Add' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  keyResult: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['submit', 'cancel'])

const isEditing = computed(() => !!props.keyResult)

const formData = ref({
  title: '',
  description: '',
  target_value: null,
  current_value: null,
  unit: 'percentage',
  due_date: '',
  status: 'Not Started'
})

const progressPercent = ref(0)

watch(() => props.keyResult, (newKR) => {
  if (newKR) {
    formData.value = {
      title: newKR.title || '',
      description: newKR.description || '',
      target_value: newKR.target_value || null,
      current_value: newKR.current_value || null,
      unit: newKR.unit || 'percentage',
      due_date: newKR.due_date || '',
      status: newKR.status || 'Not Started'
    }
    progressPercent.value = newKR.progress_percentage || 0
  } else {
    formData.value = {
      title: '',
      description: '',
      target_value: null,
      current_value: null,
      unit: 'percentage',
      due_date: '',
      status: 'Not Started'
    }
    progressPercent.value = 0
  }
}, { immediate: true })

function updateCurrentValueFromProgress() {
  if (formData.value.target_value && formData.value.target_value > 0) {
    formData.value.current_value = (progressPercent.value / 100) * formData.value.target_value
  }
}

function handleSubmit() {
  const submitData = {
    ...formData.value,
    progress_percentage: isEditing.value ? progressPercent.value : 0
  }
  emit('submit', submitData)
}
</script>

