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
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Manager Actions</h2>
        
        <!-- Celebratory Message when no actions needed -->
        <div v-if="managerActions && hasNoActions" class="text-center py-12">
          <div class="text-6xl mb-4">🎉</div>
          <h3 class="text-2xl font-bold text-green-600 mb-2">Excellent Work!</h3>
          <p class="text-lg text-gray-600 mb-1">All objectives are up to date and on track.</p>
          <p class="text-sm text-gray-500">No action items required at this time.</p>
        </div>

        <!-- Objectives Without Updates -->
        <div v-else-if="managerActions" class="mb-6">
          <h3 class="text-lg font-medium text-gray-700 mb-3">
            Objectives Without Recent Updates ({{ managerActions.noUpdates?.length || 0 }})
          </h3>
          <div v-if="managerActions.noUpdates && managerActions.noUpdates.length > 0" class="space-y-2">
            <router-link
              v-for="objective in managerActions.noUpdates"
              :key="objective.id"
              :to="`/objectives/${objective.id}`"
              class="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ objective.title }}</div>
                  <div class="text-sm text-gray-500 mt-1">
                    Last updated: {{ formatDateTime(objective.updated_at) }}
                  </div>
                </div>
                <span
                  class="ml-3 px-2 py-1 rounded-full text-xs font-semibold"
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
          <div v-else class="text-sm text-gray-500 italic py-2">
            All objectives have recent updates.
          </div>
        </div>

        <!-- Past Due Objectives -->
        <div v-if="managerActions">
          <h3 class="text-lg font-medium text-red-700 mb-3">
            Past Due Objectives ({{ managerActions.pastDue?.length || 0 }})
          </h3>
          <div v-if="managerActions.pastDue && managerActions.pastDue.length > 0" class="space-y-2">
            <router-link
              v-for="objective in managerActions.pastDue"
              :key="objective.id"
              :to="`/objectives/${objective.id}`"
              class="block p-3 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="font-medium text-gray-900">{{ objective.title }}</div>
                  <div class="text-sm text-red-600 mt-1">
                    Due date: {{ formatDate(objective.due_date) }}
                  </div>
                </div>
                <span
                  class="ml-3 px-2 py-1 rounded-full text-xs font-semibold"
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
          <div v-else class="text-sm text-gray-500 italic py-2">
            No past due objectives.
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
        <div v-if="viewMode === 'table'" class="bg-white rounded-lg shadow-md overflow-hidden">
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
                v-for="objective in objectivesStore.objectives"
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

        <!-- Grid View -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ObjectiveCard
            v-for="objective in objectivesStore.objectives"
            :key="objective.id"
            :objective="objective"
          />
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
import AppLayout from '../components/layout/AppLayout.vue'
import ObjectiveCard from '../components/objectives/ObjectiveCard.vue'
import Avatar from '../components/common/Avatar.vue'
import api from '../services/api'

const router = useRouter()
const objectivesStore = useObjectivesStore()
const usersStore = useUsersStore()
const viewMode = ref('table')
const managerActions = ref(null)

const hasNoActions = computed(() => {
  if (!managerActions.value) return false
  const noUpdates = managerActions.value.noUpdates?.length || 0
  const pastDue = managerActions.value.pastDue?.length || 0
  return noUpdates === 0 && pastDue === 0
})

onMounted(async () => {
  await usersStore.fetchUsers()
  await objectivesStore.fetchObjectives()
  await objectivesStore.fetchStats()
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

