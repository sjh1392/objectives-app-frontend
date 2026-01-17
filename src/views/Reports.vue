<template>
  <AppLayout>
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Reports & Analytics</h1>

      <!-- Overall Statistics -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 class="text-xl font-semibold mb-4">Overall Statistics</h2>
        <div v-if="objectivesStore.stats" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div class="text-sm text-gray-600 mb-1">Total Objectives</div>
            <div class="text-2xl font-bold">{{ objectivesStore.stats.total }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">Average Progress</div>
            <div class="text-2xl font-bold text-primary-600">
              {{ Math.round(objectivesStore.stats.averageProgress) }}%
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">Active</div>
            <div class="text-2xl font-bold text-green-600">{{ objectivesStore.stats.active }}</div>
          </div>
          <div>
            <div class="text-sm text-gray-600 mb-1">Completed</div>
            <div class="text-2xl font-bold text-blue-600">{{ objectivesStore.stats.completed }}</div>
          </div>
        </div>
      </div>

      <!-- Update Activity -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Update Activity</h2>
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                  Most Recently Updated
                </th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">
                  Least Recently Updated
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="index in Math.max(mostUpdatedObjectives.length, leastUpdatedObjectives.length)" :key="index">
                <td class="px-4 py-3">
                  <div
                    v-if="mostUpdatedObjectives[index - 1]"
                    class="cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                    @click="navigateToObjective(mostUpdatedObjectives[index - 1].id)"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-gray-900 truncate">
                          {{ mostUpdatedObjectives[index - 1].title }}
                        </div>
                        <div class="text-xs text-gray-500 mt-0.5">
                          {{ formatDateTime(mostUpdatedObjectives[index - 1].updated_at) }}
                          <span v-if="mostUpdatedObjectives[index - 1].owner_id && getOwner(mostUpdatedObjectives[index - 1].owner_id)" class="ml-2">
                            • {{ getOwner(mostUpdatedObjectives[index - 1].owner_id).name }}
                          </span>
                        </div>
                      </div>
                      <span
                        class="ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0"
                        :class="{
                          'bg-green-100 text-green-800': mostUpdatedObjectives[index - 1].status === 'Active',
                          'bg-blue-100 text-blue-800': mostUpdatedObjectives[index - 1].status === 'Completed',
                          'bg-yellow-100 text-yellow-800': mostUpdatedObjectives[index - 1].status === 'On Hold',
                          'bg-gray-100 text-gray-800': mostUpdatedObjectives[index - 1].status === 'Draft',
                          'bg-red-100 text-red-800': mostUpdatedObjectives[index - 1].status === 'Cancelled'
                        }"
                      >
                        {{ mostUpdatedObjectives[index - 1].status }}
                      </span>
                    </div>
                  </div>
                  <div v-else class="text-sm text-gray-400 italic">—</div>
                </td>
                <td class="px-4 py-3">
                  <div
                    v-if="leastUpdatedObjectives[index - 1]"
                    class="cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
                    @click="navigateToObjective(leastUpdatedObjectives[index - 1].id)"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-gray-900 truncate">
                          {{ leastUpdatedObjectives[index - 1].title }}
                        </div>
                        <div class="text-xs text-gray-500 mt-0.5">
                          {{ formatDateTime(leastUpdatedObjectives[index - 1].updated_at) }}
                          <span v-if="leastUpdatedObjectives[index - 1].owner_id && getOwner(leastUpdatedObjectives[index - 1].owner_id)" class="ml-2">
                            • {{ getOwner(leastUpdatedObjectives[index - 1].owner_id).name }}
                          </span>
                        </div>
                      </div>
                      <span
                        class="ml-2 px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0"
                        :class="{
                          'bg-green-100 text-green-800': leastUpdatedObjectives[index - 1].status === 'Active',
                          'bg-blue-100 text-blue-800': leastUpdatedObjectives[index - 1].status === 'Completed',
                          'bg-yellow-100 text-yellow-800': leastUpdatedObjectives[index - 1].status === 'On Hold',
                          'bg-gray-100 text-gray-800': leastUpdatedObjectives[index - 1].status === 'Draft',
                          'bg-red-100 text-red-800': leastUpdatedObjectives[index - 1].status === 'Cancelled'
                        }"
                      >
                        {{ leastUpdatedObjectives[index - 1].status }}
                      </span>
                    </div>
                  </div>
                  <div v-else class="text-sm text-gray-400 italic">—</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Team-based Reporting -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">Reports by Team</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="team in usersStore.departments"
            :key="team.id"
            class="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            @click="selectTeam(team.id)"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">{{ team.name }}</h3>
              <span class="text-sm text-gray-500">
                {{ getObjectivesByTeam(team.id).length }} objectives
              </span>
            </div>
            <div v-if="teamStats[team.id]" class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Avg Progress:</span>
                <span class="font-semibold">{{ Math.round(teamStats[team.id].averageProgress) }}%</span>
              </div>
              <div class="text-sm text-gray-600">
                <div>Active: {{ teamStats[team.id].byStatus.Active || 0 }}</div>
                <div>Completed: {{ teamStats[team.id].byStatus.Completed || 0 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Team Report -->
      <div v-if="selectedTeam" class="bg-white rounded-lg shadow-md p-6 mb-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-semibold">Report: {{ getTeamName(selectedTeam) }}</h2>
          <button
            @click="selectedTeam = null"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div v-if="teamStats[selectedTeam]" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-1">Total Objectives</div>
            <div class="text-2xl font-bold">{{ teamStats[selectedTeam].total }}</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-1">Average Progress</div>
            <div class="text-2xl font-bold text-primary-600">
              {{ Math.round(teamStats[selectedTeam].averageProgress) }}%
            </div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-1">Active</div>
            <div class="text-2xl font-bold text-green-600">
              {{ teamStats[selectedTeam].byStatus.Active || 0 }}
            </div>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <div class="text-sm text-gray-600 mb-1">Completed</div>
            <div class="text-2xl font-bold text-blue-600">
              {{ teamStats[selectedTeam].byStatus.Completed || 0 }}
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ObjectiveCard
            v-for="objective in getObjectivesByTeam(selectedTeam)"
            :key="objective.id"
            :objective="objective"
          />
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

const router = useRouter()
const objectivesStore = useObjectivesStore()
const usersStore = useUsersStore()
const selectedTeam = ref(null)
const teamStats = ref({})

const getObjectivesByTeam = (teamId) => {
  return objectivesStore.objectives.filter(obj => obj.department_id === teamId)
}

const getTeamName = (teamId) => {
  const team = usersStore.getDepartmentById(teamId)
  return team ? team.name : 'Unknown Team'
}

const mostUpdatedObjectives = computed(() => {
  const objectives = [...objectivesStore.objectives]
  return objectives
    .filter(obj => obj.updated_at)
    .sort((a, b) => {
      const dateA = new Date(a.updated_at)
      const dateB = new Date(b.updated_at)
      return dateB - dateA // Most recent first
    })
    .slice(0, 5) // Top 5 most updated
})

const leastUpdatedObjectives = computed(() => {
  const objectives = [...objectivesStore.objectives]
  return objectives
    .filter(obj => obj.updated_at)
    .sort((a, b) => {
      const dateA = new Date(a.updated_at)
      const dateB = new Date(b.updated_at)
      return dateA - dateB // Oldest first
    })
    .slice(0, 5) // Top 5 least updated
})

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

function getOwner(ownerId) {
  return usersStore.getUserById(ownerId)
}

function navigateToObjective(objectiveId) {
  router.push(`/objectives/${objectiveId}`)
}

function calculateTeamStats(teamId) {
  const objectives = getObjectivesByTeam(teamId)
  if (objectives.length === 0) {
    return {
      total: 0,
      averageProgress: 0,
      byStatus: {
        Active: 0,
        Completed: 0,
        'On Hold': 0,
        Draft: 0,
        Cancelled: 0
      }
    }
  }

  const total = objectives.length
  const totalProgress = objectives.reduce((sum, obj) => sum + (obj.progress_percentage || 0), 0)
  const averageProgress = totalProgress / total

  const byStatus = {
    Active: 0,
    Completed: 0,
    'On Hold': 0,
    Draft: 0,
    Cancelled: 0
  }

  objectives.forEach(obj => {
    if (obj.status && byStatus.hasOwnProperty(obj.status)) {
      byStatus[obj.status]++
    }
  })

  return {
    total,
    averageProgress,
    byStatus
  }
}

onMounted(async () => {
  await objectivesStore.fetchObjectives()
  await usersStore.fetchDepartments()
  await objectivesStore.fetchStats()
  await loadTeamStats()
})

async function loadTeamStats() {
  for (const team of usersStore.departments) {
    teamStats.value[team.id] = calculateTeamStats(team.id)
  }
}

async function selectTeam(teamId) {
  selectedTeam.value = teamId
  if (!teamStats.value[teamId]) {
    teamStats.value[teamId] = calculateTeamStats(teamId)
  }
}
</script>

