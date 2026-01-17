<template>
  <AppLayout>
    <div>
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <!-- Stats Cards -->
      <div v-if="objectivesStore.stats" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="text-sm text-gray-500 mb-1">Total Objectives</div>
          <div class="text-3xl font-bold text-gray-900">{{ objectivesStore.stats.total }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="text-sm text-gray-500 mb-1">Active</div>
          <div class="text-3xl font-bold text-green-600">{{ objectivesStore.stats.active }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="text-sm text-gray-500 mb-1">Completed</div>
          <div class="text-3xl font-bold text-blue-600">{{ objectivesStore.stats.completed }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="text-sm text-gray-500 mb-1">Avg Progress</div>
          <div class="text-3xl font-bold text-primary-600">
            {{ Math.round(objectivesStore.stats.averageProgress) }}%
          </div>
        </div>
      </div>

      <!-- Manager Actions -->
      <div 
        class="bg-white rounded-lg shadow-md mb-8 transition-all"
        :class="hasNoActions ? 'p-4' : 'p-6'"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-gray-900">Manager Actions</h2>
          <span 
            v-if="managerActions && !hasNoActions"
            class="text-xs font-medium px-2 py-1 rounded-full"
            :class="{
              'bg-red-100 text-red-700': (managerActions.pastDue?.length || 0) > 0,
              'bg-yellow-100 text-yellow-700': (managerActions.pastDue?.length || 0) === 0 && (managerActions.noUpdates?.length || 0) > 0,
              'bg-green-100 text-green-700': hasNoActions
            }"
          >
            {{ (managerActions.pastDue?.length || 0) + (managerActions.noUpdates?.length || 0) }} items
          </span>
        </div>
        
        <!-- Compact "No Actions" State -->
        <div v-if="managerActions && hasNoActions" class="flex items-center gap-3 text-sm text-gray-600">
          <svg class="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>All objectives are up to date. No action items required.</span>
        </div>

        <!-- Objectives Without Updates -->
        <div v-else-if="managerActions && managerActions.noUpdates && managerActions.noUpdates.length > 0" class="mb-4">
          <h3 class="text-sm font-medium text-gray-700 mb-2">
            Needs Update ({{ managerActions.noUpdates.length }})
          </h3>
          <div class="space-y-1.5">
            <router-link
              v-for="objective in managerActions.noUpdates"
              :key="objective.id"
              :to="`/objectives/${objective.id}`"
              class="block p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            >
              <div class="flex justify-between items-center">
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">{{ objective.title }}</div>
                  <div class="text-xs text-gray-500 mt-0.5">
                    Updated {{ formatDateTime(objective.updated_at) }}
                  </div>
                </div>
                <span
                  class="ml-2 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                  :class="{
                    'bg-green-100 text-green-800': objective.status === 'Active',
                    'bg-yellow-100 text-yellow-800': objective.status === 'On Hold',
                    'bg-gray-100 text-gray-800': objective.status === 'Draft'
                  }"
                >
                  {{ objective.status }}
                </span>
              </div>
            </router-link>
          </div>
        </div>

        <!-- Past Due Objectives -->
        <div v-if="managerActions && managerActions.pastDue && managerActions.pastDue.length > 0">
          <h3 class="text-sm font-medium text-red-700 mb-2">
            Past Due ({{ managerActions.pastDue.length }})
          </h3>
          <div class="space-y-1.5">
            <router-link
              v-for="objective in managerActions.pastDue"
              :key="objective.id"
              :to="`/objectives/${objective.id}`"
              class="block p-2 border border-red-200 rounded hover:bg-red-50 transition-colors"
            >
              <div class="flex justify-between items-center">
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">{{ objective.title }}</div>
                  <div class="text-xs text-red-600 mt-0.5">
                    Due {{ formatDate(objective.due_date) }}
                  </div>
                </div>
                <span
                  class="ml-2 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                  :class="{
                    'bg-green-100 text-green-800': objective.status === 'Active',
                    'bg-yellow-100 text-yellow-800': objective.status === 'On Hold',
                    'bg-gray-100 text-gray-800': objective.status === 'Draft'
                  }"
                >
                  {{ objective.status }}
                </span>
              </div>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Objectives -->
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Objectives</h2>
          <div class="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              @click="viewMode = 'grid'"
              :class="viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
              class="px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cards
            </button>
            <button
              @click="viewMode = 'table'"
              :class="viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
              class="px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              List
            </button>
          </div>
        </div>

        <!-- Table View -->
        <div v-if="viewMode === 'table'">
          <div v-if="subscribedObjectives.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="objective in subscribedObjectives"
                  :key="objective.id"
                  @click="router.push(`/objectives/${objective.id}`)"
                  class="cursor-pointer hover:bg-gray-50"
                >
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ objective.title }}</div>
                  <div class="text-sm text-gray-500 line-clamp-1">{{ objective.description }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': objective.status === 'Active',
                      'bg-blue-100 text-blue-800': objective.status === 'Completed',
                      'bg-yellow-100 text-yellow-800': objective.status === 'On Hold',
                      'bg-gray-100 text-gray-800': objective.status === 'Draft',
                      'bg-red-100 text-red-800': objective.status === 'Cancelled'
                    }"
                  >
                    {{ objective.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-24 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        class="h-2 rounded-full"
                        :class="{
                          'bg-green-500': objective.progress_percentage >= 80,
                          'bg-blue-500': objective.progress_percentage >= 50 && objective.progress_percentage < 80,
                          'bg-yellow-500': objective.progress_percentage >= 25 && objective.progress_percentage < 50,
                          'bg-red-500': objective.progress_percentage < 25
                        }"
                        :style="{ width: `${Math.min(objective.progress_percentage || 0, 100)}%` }"
                      ></div>
                    </div>
                    <span class="text-sm text-gray-900">{{ Math.round(objective.progress_percentage || 0) }}%</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <router-link
                    v-if="objective.owner_id && getOwner(objective.owner_id)"
                    :to="`/people/${objective.owner_id}`"
                    @click.stop
                    class="flex items-center gap-2"
                  >
                    <Avatar
                      :name="getOwner(objective.owner_id).name"
                      :email="getOwner(objective.owner_id).email"
                      size="sm"
                    />
                    <span class="text-sm text-gray-900">{{ getOwner(objective.owner_id).name }}</span>
                  </router-link>
                  <span v-else class="text-sm text-gray-400 italic">Unassigned</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(objective.due_date) }}
                </td>
              </tr>
            </tbody>
          </table>
          </div>
          
          <!-- Empty State for Table View -->
          <div v-else class="text-center py-12 bg-white rounded-lg shadow-md">
            <p class="text-gray-500 text-lg">You haven't subscribed to any objectives yet.</p>
            <p class="text-gray-400 text-sm mt-2">Subscribe to objectives from the Objectives page to see them here.</p>
          </div>
        </div>

        <!-- Grid View -->
        <div v-else-if="subscribedObjectives.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ObjectiveCard
            v-for="objective in subscribedObjectives"
            :key="objective.id"
            :objective="objective"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12 bg-white rounded-lg shadow-md">
          <p class="text-gray-500 text-lg">You haven't subscribed to any objectives yet.</p>
          <p class="text-gray-400 text-sm mt-2">Subscribe to objectives from the Objectives page to see them here.</p>
        </div>
      </div>

      <!-- Popular Tags -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4">Popular Tags</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in objectivesStore.tags.slice(0, 10)"
            :key="tag"
            @click="filterByTag(tag)"
            class="px-3 py-1 text-gray-700 border border-gray-300 rounded-full text-sm hover:bg-gray-50"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useObjectivesStore } from '../stores/objectives'
import { useUsersStore } from '../stores/users'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../components/layout/AppLayout.vue'
import ObjectiveCard from '../components/objectives/ObjectiveCard.vue'
import Avatar from '../components/common/Avatar.vue'
import api from '../services/api'

const router = useRouter()
const objectivesStore = useObjectivesStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()
const viewMode = ref('table')
const managerActions = ref(null)
const subscribedObjectives = ref([])

const hasNoActions = computed(() => {
  if (!managerActions.value) return false
  const noUpdates = managerActions.value.noUpdates?.length || 0
  const pastDue = managerActions.value.pastDue?.length || 0
  return noUpdates === 0 && pastDue === 0
})

async function loadSubscribedObjectives() {
  try {
    console.log('Loading subscribed objectives for user:', authStore.currentUserId)
    const response = await api.get('/objectives/subscribed')
    console.log('Subscribed objectives response:', response)
    console.log('Response data:', response.data)
    console.log('Response data type:', typeof response.data)
    console.log('Response data length:', response.data?.length)
    
    // Ensure we're handling both array and object responses
    const objectives = Array.isArray(response.data) ? response.data : (response.data?.objectives || [])
    subscribedObjectives.value = objectives
    // Also update the store for stats and other purposes
    objectivesStore.objectives = objectives
    console.log('Loaded', subscribedObjectives.value.length, 'subscribed objectives')
  } catch (error) {
    console.error('Error loading subscribed objectives:', error)
    console.error('Error response:', error.response)
    console.error('Error status:', error.response?.status)
    console.error('Error data:', error.response?.data)
    console.error('Error message:', error.message)
    subscribedObjectives.value = []
    // Show user-friendly error
    if (error.response?.status === 404) {
      console.warn('Subscribed objectives endpoint not found - falling back to all objectives')
      // Fallback: load all objectives if endpoint doesn't exist yet
      await objectivesStore.fetchObjectives()
      subscribedObjectives.value = objectivesStore.objectives
    }
  }
}

onMounted(async () => {
  // Ensure auth store is loaded
  if (!authStore.currentUser) {
    authStore.loadFromStorage()
  }
  
  await usersStore.fetchUsers()
  await loadSubscribedObjectives() // Load only subscribed objectives
  await objectivesStore.fetchStats() // Stats might need all objectives, but we'll use subscribed for display
  await objectivesStore.fetchTags()
  await loadManagerActions()
})

async function loadManagerActions() {
  try {
    const response = await api.get('/dashboard/manager-actions')
    managerActions.value = response.data
  } catch (error) {
    console.error('Error loading manager actions:', error)
  }
}

function getOwner(ownerId) {
  return usersStore.getUserById(ownerId)
}

function formatDate(dateString) {
  if (!dateString) return 'No due date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatDateTime(dateString) {
  if (!dateString) return 'Never'
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function filterByTag(tag) {
  objectivesStore.setFilter('tag', tag)
  router.push('/objectives')
}
</script>

