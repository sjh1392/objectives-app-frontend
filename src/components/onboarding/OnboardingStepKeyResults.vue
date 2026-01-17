<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Key Results</h2>
    <p class="text-gray-600 mb-6">Add key results to measure progress on your objectives.</p>

    <!-- Objective Selection -->
    <div v-if="objectives.length === 0" class="text-center py-8 text-gray-500">
      No objectives found. Please create objectives first.
    </div>

    <div v-else>
      <!-- Select Objective -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">Select Objective</label>
        <select
          v-model="selectedObjectiveId"
          @change="loadKeyResults"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Choose an objective...</option>
          <option v-for="obj in objectives" :key="obj.id" :value="obj.id">
            {{ obj.title }}
          </option>
        </select>
      </div>

      <!-- Add Key Result Form -->
      <div v-if="showForm && selectedObjectiveId" class="mb-6 bg-gray-50 rounded-lg p-4">
        <KeyResultForm
          :key-result="editingKeyResult"
          @submit="handleSubmit"
          @cancel="cancelForm"
        />
      </div>

      <!-- Add Button -->
      <div v-if="selectedObjectiveId && !showForm" class="mb-6">
        <button
          @click="showAddForm"
          class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          + Add Key Result
        </button>
      </div>

      <!-- Key Results List -->
      <div v-if="selectedObjectiveId && keyResults.length > 0" class="space-y-3">
        <div
          v-for="kr in keyResults"
          :key="kr.id"
          class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <div class="flex-1">
            <h3 class="font-medium text-gray-900">{{ kr.title }}</h3>
            <p v-if="kr.description" class="text-sm text-gray-500 mt-1">{{ kr.description }}</p>
            <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span v-if="kr.target_value !== null">
                Target: {{ kr.target_value }} {{ kr.unit || '' }}
              </span>
              <span v-if="kr.current_value !== null">
                Current: {{ kr.current_value }} {{ kr.unit || '' }}
              </span>
              <span v-if="kr.progress_percentage !== null">
                Progress: {{ Math.round(kr.progress_percentage) }}%
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="editKeyResult(kr)"
              class="px-3 py-1 text-sm text-primary-600 hover:text-primary-800"
            >
              Edit
            </button>
            <button
              @click="deleteKeyResult(kr.id)"
              class="px-3 py-1 text-sm text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      <div v-else-if="selectedObjectiveId && keyResults.length === 0" class="text-center py-8 text-gray-500">
        No key results yet. Add your first key result for this objective.
      </div>
    </div>

    <div v-if="successMessage" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useObjectivesStore } from '../../stores/objectives'
import KeyResultForm from '../keyresults/KeyResultForm.vue'
import api from '../../services/api'

const emit = defineEmits(['step-complete', 'data-updated'])

const objectivesStore = useObjectivesStore()
const objectives = ref([])
const selectedObjectiveId = ref('')
const keyResults = ref([])
const showForm = ref(false)
const editingKeyResult = ref(null)
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function loadObjectives() {
  try {
    const response = await api.get('/objectives')
    objectives.value = response.data || []
  } catch (error) {
    console.error('Error loading objectives:', error)
  }
}

async function loadKeyResults() {
  if (!selectedObjectiveId.value) {
    keyResults.value = []
    return
  }
  
  try {
    const response = await api.get(`/objectives/${selectedObjectiveId.value}/key-results`)
    keyResults.value = response.data || []
    if (keyResults.value.length > 0) {
      emit('step-complete', 'key-results')
    }
  } catch (error) {
    console.error('Error loading key results:', error)
    keyResults.value = []
  }
}

function showAddForm() {
  if (!selectedObjectiveId.value) {
    errorMessage.value = 'Please select an objective first'
    return
  }
  editingKeyResult.value = null
  showForm.value = true
}

function editKeyResult(kr) {
  editingKeyResult.value = kr
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingKeyResult.value = null
}

async function handleSubmit(data) {
  if (!selectedObjectiveId.value) {
    errorMessage.value = 'Please select an objective first'
    return
  }
  
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    if (editingKeyResult.value) {
      // Update
      await api.put(`/key-results/${editingKeyResult.value.id}`, data)
      successMessage.value = 'Key result updated successfully!'
    } else {
      // Create
      await api.post(`/objectives/${selectedObjectiveId.value}/key-results`, data)
      successMessage.value = 'Key result created successfully!'
    }
    
    await loadKeyResults()
    cancelForm()
    emit('data-updated')
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to save key result'
    console.error('Error saving key result:', error)
  } finally {
    loading.value = false
  }
}

async function deleteKeyResult(id) {
  if (!confirm('Are you sure you want to delete this key result?')) {
    return
  }
  
  try {
    await api.delete(`/key-results/${id}`)
    await loadKeyResults()
    emit('data-updated')
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to delete key result'
    console.error('Error deleting key result:', error)
  }
}

onMounted(async () => {
  await loadObjectives()
})
</script>

