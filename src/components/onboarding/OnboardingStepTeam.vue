<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Team Members</h2>
    <p class="text-gray-600 mb-6">Add team members who will be working on objectives.</p>

    <!-- Add Person Form -->
    <div v-if="showForm" class="mb-6 bg-gray-50 rounded-lg p-4">
      <PersonForm
        :user="editingUser"
        :departments="departments"
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
        + Add Team Member
      </button>
    </div>

    <!-- Users List -->
    <div v-if="users.length > 0" class="space-y-3">
      <div
        v-for="user in users"
        :key="user.id"
        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <div class="flex items-center gap-3 flex-1">
          <Avatar :name="user.name" :email="user.email" size="sm" />
          <div>
            <h3 class="font-medium text-gray-900">{{ user.name }}</h3>
            <p class="text-sm text-gray-500">{{ user.email }}</p>
            <div class="flex gap-2 mt-1">
              <span class="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">{{ user.role }}</span>
              <span v-if="user.department" class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                {{ getDepartmentName(user.department) }}
              </span>
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="editUser(user)"
            class="px-3 py-1 text-sm text-primary-600 hover:text-primary-800"
          >
            Edit
          </button>
          <button
            @click="deleteUser(user.id)"
            class="px-3 py-1 text-sm text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-500">
      No team members yet. Add your first team member to get started.
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
import PersonForm from '../people/PersonForm.vue'
import Avatar from '../common/Avatar.vue'
import api from '../../services/api'

const emit = defineEmits(['step-complete', 'data-updated'])

const usersStore = useUsersStore()
const users = ref([])
const showForm = ref(false)
const editingUser = ref(null)
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const departments = computed(() => usersStore.departments)

function getDepartmentName(deptId) {
  const dept = departments.value.find(d => d.id === deptId)
  return dept ? dept.name : ''
}

async function loadUsers() {
  try {
    const response = await api.get('/users')
    users.value = response.data || []
    if (users.value.length > 0) {
      emit('step-complete', 'team')
    }
  } catch (error) {
    console.error('Error loading users:', error)
  }
}

function showAddForm() {
  editingUser.value = null
  showForm.value = true
}

function editUser(user) {
  editingUser.value = user
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingUser.value = null
}

async function handleSubmit(data) {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    if (editingUser.value) {
      // Update
      await api.put(`/users/${editingUser.value.id}`, data)
      successMessage.value = 'Team member updated successfully!'
    } else {
      // Create
      await api.post('/users', data)
      successMessage.value = 'Team member created successfully!'
    }
    
    await loadUsers()
    await usersStore.fetchUsers() // Refresh store
    cancelForm()
    emit('data-updated')
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to save team member'
    console.error('Error saving user:', error)
  } finally {
    loading.value = false
  }
}

async function deleteUser(id) {
  if (!confirm('Are you sure you want to delete this team member?')) {
    return
  }
  
  try {
    await api.delete(`/users/${id}`)
    await loadUsers()
    await usersStore.fetchUsers() // Refresh store
    emit('data-updated')
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to delete team member'
    console.error('Error deleting user:', error)
  }
}

onMounted(async () => {
  await usersStore.fetchDepartments()
  await loadUsers()
})
</script>

