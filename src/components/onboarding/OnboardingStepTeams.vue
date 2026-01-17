<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Teams</h2>
    <p class="text-gray-600 mb-6">Create teams to organize your team members and objectives.</p>

    <!-- Add Team Form -->
    <div v-if="showForm" class="mb-6 bg-gray-50 rounded-lg p-4">
      <TeamForm
        :team="editingTeam"
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
        + Add Team
      </button>
    </div>

    <!-- Teams List -->
    <div v-if="teams.length > 0" class="space-y-3">
      <div
        v-for="team in teams"
        :key="team.id"
        class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <div class="flex-1">
          <h3 class="font-medium text-gray-900">{{ team.name }}</h3>
          <p v-if="team.description" class="text-sm text-gray-500 mt-1">{{ team.description }}</p>
        </div>
        <div class="flex gap-2">
          <button
            @click="editTeam(team)"
            class="px-3 py-1 text-sm text-primary-600 hover:text-primary-800"
          >
            Edit
          </button>
          <button
            @click="deleteTeam(team.id)"
            class="px-3 py-1 text-sm text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    <div v-else class="text-center py-8 text-gray-500">
      No teams yet. Add your first team to get started.
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
import TeamForm from '../teams/TeamForm.vue'
import api from '../../services/api'

const emit = defineEmits(['step-complete', 'data-updated'])

const usersStore = useUsersStore()
const teams = ref([])
const showForm = ref(false)
const editingTeam = ref(null)
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const users = computed(() => usersStore.users)

async function loadTeams() {
  try {
    // Try /teams first, fallback to /departments for backward compatibility
    let response
    try {
      response = await api.get('/teams')
    } catch (err) {
      response = await api.get('/departments')
    }
    teams.value = response.data || []
    if (teams.value.length > 0) {
      emit('step-complete', 'teams')
    }
  } catch (error) {
    console.error('Error loading teams:', error)
  }
}

function showAddForm() {
  editingTeam.value = null
  showForm.value = true
}

function editTeam(team) {
  editingTeam.value = team
  showForm.value = true
}

function cancelForm() {
  showForm.value = false
  editingTeam.value = null
}

async function handleSubmit(data) {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    if (editingTeam.value) {
      // Update - try /teams first, fallback to /departments
      try {
        await api.put(`/teams/${editingTeam.value.id}`, data)
      } catch (err) {
        await api.put(`/departments/${editingTeam.value.id}`, data)
      }
      successMessage.value = 'Team updated successfully!'
    } else {
      // Create - try /teams first, fallback to /departments
      try {
        await api.post('/teams', data)
      } catch (err) {
        await api.post('/departments', data)
      }
      successMessage.value = 'Team created successfully!'
    }
    
    await loadTeams()
    cancelForm()
    emit('data-updated')
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to save team'
    console.error('Error saving team:', error)
  } finally {
    loading.value = false
  }
}

async function deleteTeam(id) {
  if (!confirm('Are you sure you want to delete this team?')) {
    return
  }
  
  try {
    // Try /teams first, fallback to /departments
    try {
      await api.delete(`/teams/${id}`)
    } catch (err) {
      await api.delete(`/departments/${id}`)
    }
    await loadTeams()
    emit('data-updated')
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to delete team'
    console.error('Error deleting team:', error)
  }
}

onMounted(async () => {
  await usersStore.fetchUsers()
  await loadTeams()
})
</script>

