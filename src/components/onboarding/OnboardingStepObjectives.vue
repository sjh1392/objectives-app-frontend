<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Objectives</h2>
    <p class="text-gray-600 mb-6">Create objectives to track your company's goals and progress.</p>

    <!-- Add Objective Form -->
    <div v-if="showForm" class="mb-6 bg-gray-50 rounded-lg p-4">
      <ObjectiveForm
        :objective="editingObjective"
        @submit="handleSubmit"
        @cancel="cancelForm"
      />
    </div>

    <!-- Add Button -->
    <div v-else class="mb-6">
      <button
        @click="showAddForm"
        class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
      >
        + Add Objective
      </button>
    </div>

    <!-- Objectives List -->
    <div v-if="objectives.length > 0" class="space-y-3">
      <div
        v-for="objective in objectives"
        :key="objective.id"
        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-medium text-gray-900">{{ objective.title }}</h3>
            <span
              class="px-2 py-1 text-xs font-semibold rounded-full"
              :class="{
                'bg-green-100 text-green-800': objective.status === 'Active',
                'bg-blue-100 text-blue-800': objective.status === 'Completed',
                'bg-yellow-100 text-yellow-800': objective.status === 'On Hold',
                'bg-gray-100 text-gray-800': objective.status === 'Draft'
              }"
            >
              {{ objective.status }}
            </span>
          </div>
          <p v-if="objective.description" class="text-sm text-gray-500 mb-2">{{ objective.description }}</p>
          <div class="flex items-center gap-4 text-xs text-gray-500">
            <span v-if="objective.owner_id">Owner: {{ getOwnerName(objective.owner_id) }}</span>
            <span v-if="objective.department_id">Dept: {{ getDepartmentName(objective.department_id) }}</span>
            <span v-if="objective.progress_percentage !== null">
              Progress: {{ Math.round(objective.progress_percentage) }}%
            </span>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="editObjective(objective)"
            class="px-3 py-1 text-sm text-primary-600 hover:text-primary-800"
          >
            Edit
          </button>
          <button
            @click="deleteObjective(objective.id)"
            class="px-3 py-1 text-sm text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-500">
      No objectives yet. Add your first objective to get started.
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
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '../../stores/users'
import { useObjectivesStore } from '../../stores/objectives'
import ObjectiveForm from '../objectives/ObjectiveForm.vue'
import api from '../../services/api'

const emit = defineEmits(['step-complete', 'data-updated'])

const usersStore = useUsersStore()
const objectivesStore = useObjectivesStore()
const objectives = ref([])
const showForm = ref(false)
const editingObjective = ref(null)
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

function getOwnerName(ownerId) {
  const user = usersStore.getUserById(ownerId)
  return user ? user.name : 'Unknown'
}

function getDepartmentName(deptId) {
  const dept = usersStore.departments.find(d => d.id === deptId)
  return dept ? dept.name : 'Unknown'
}

async function loadObjectives() {
  try {
    const response = await api.get('/objectives')
    objectives.value = response.data || []
    if (objectives.value.length > 0) {
      emit('step-complete', 'objectives')
    }
  } catch (error) {
    console.error('Error loading objectives:', error)
  }
}

function showAddForm() {
  editingObjective.value = null
  showForm.value = true
}

function editObjective(objective) {
  editingObjective.value = objective
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingObjective.value = null
}

async function handleSubmit(data) {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    if (editingObjective.value) {
      // Update
      await api.put(`/objectives/${editingObjective.value.id}`, data)
      successMessage.value = 'Objective updated successfully!'
    } else {
      // Create
      await api.post('/objectives', data)
      successMessage.value = 'Objective created successfully!'
    }
    
    await loadObjectives()
    await objectivesStore.fetchObjectives() // Refresh store
    cancelForm()
    emit('data-updated')
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to save objective'
    console.error('Error saving objective:', error)
  } finally {
    loading.value = false
  }
}

async function deleteObjective(id) {
  if (!confirm('Are you sure you want to delete this objective?')) {
    return
  }
  
  try {
    await api.delete(`/objectives/${id}`)
    await loadObjectives()
    await objectivesStore.fetchObjectives() // Refresh store
    emit('data-updated')
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to delete objective'
    console.error('Error deleting objective:', error)
  }
}

onMounted(async () => {
  await usersStore.fetchUsers()
  await usersStore.fetchDepartments()
  await loadObjectives()
})
</script>

