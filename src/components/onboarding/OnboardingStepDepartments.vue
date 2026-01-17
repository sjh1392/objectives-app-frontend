<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Departments</h2>
    <p class="text-gray-600 mb-6">Create departments to organize your team and objectives.</p>

    <!-- Add Department Form -->
    <div v-if="showForm" class="mb-6 bg-gray-50 rounded-lg p-4">
      <DepartmentForm
        :department="editingDepartment"
        :users="users"
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
        + Add Department
      </button>
    </div>

    <!-- Departments List -->
    <div v-if="departments.length > 0" class="space-y-3">
      <div
        v-for="dept in departments"
        :key="dept.id"
        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <div class="flex-1">
          <h3 class="font-medium text-gray-900">{{ dept.name }}</h3>
          <p v-if="dept.description" class="text-sm text-gray-500 mt-1">{{ dept.description }}</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="editDepartment(dept)"
            class="px-3 py-1 text-sm text-primary-600 hover:text-primary-800"
          >
            Edit
          </button>
          <button
            @click="deleteDepartment(dept.id)"
            class="px-3 py-1 text-sm text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-500">
      No departments yet. Add your first department to get started.
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
import DepartmentForm from '../departments/DepartmentForm.vue'
import api from '../../services/api'

const emit = defineEmits(['step-complete', 'data-updated'])

const usersStore = useUsersStore()
const departments = ref([])
const showForm = ref(false)
const editingDepartment = ref(null)
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const users = computed(() => usersStore.users)

async function loadDepartments() {
  try {
    const response = await api.get('/departments')
    departments.value = response.data || []
    if (departments.value.length > 0) {
      emit('step-complete', 'departments')
    }
  } catch (error) {
    console.error('Error loading departments:', error)
  }
}

function showAddForm() {
  editingDepartment.value = null
  showForm.value = true
}

function editDepartment(dept) {
  editingDepartment.value = dept
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingDepartment.value = null
}

async function handleSubmit(data) {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    if (editingDepartment.value) {
      // Update
      await api.put(`/departments/${editingDepartment.value.id}`, data)
      successMessage.value = 'Department updated successfully!'
    } else {
      // Create
      await api.post('/departments', data)
      successMessage.value = 'Department created successfully!'
    }
    
    await loadDepartments()
    cancelForm()
    emit('data-updated')
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to save department'
    console.error('Error saving department:', error)
  } finally {
    loading.value = false
  }
}

async function deleteDepartment(id) {
  if (!confirm('Are you sure you want to delete this department?')) {
    return
  }
  
  try {
    await api.delete(`/departments/${id}`)
    await loadDepartments()
    emit('data-updated')
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to delete department'
    console.error('Error deleting department:', error)
  }
}

onMounted(async () => {
  await usersStore.fetchUsers()
  await loadDepartments()
})
</script>

