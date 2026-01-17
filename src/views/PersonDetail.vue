<template>
  <AppLayout>
    <div v-if="usersStore.loading || objectivesStore.loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="person" class="max-w-6xl mx-auto">
      <!-- Person Header -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-6 flex-1">
            <Avatar :name="person.name" :email="person.email" size="xl" />
            <div class="flex-1">
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ person.name }}</h1>
              <p class="text-gray-600 mb-4">{{ person.email }}</p>
            <div class="flex items-center gap-4">
              <span class="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium capitalize">
                {{ person.role }}
              </span>
              <span v-if="person.department" class="text-sm text-gray-600">
                Department: <span class="font-medium">{{ getDepartmentName(person.department) }}</span>
              </span>
              <span v-else class="text-sm text-gray-400 italic">No department assigned</span>
            </div>
            </div>
          </div>
          <router-link
            to="/people"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            ← Back to People
          </router-link>
        </div>
      </div>

      <!-- Statistics Overview -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div class="bg-gray-50 rounded-md p-3 border border-gray-200">
          <div class="text-xs text-gray-500 mb-0.5">Total Objectives</div>
          <div class="text-xl font-semibold text-gray-700">{{ personObjectives.length }}</div>
        </div>
        <div class="bg-gray-50 rounded-md p-3 border border-gray-200">
          <div class="text-xs text-gray-500 mb-0.5">Active</div>
          <div class="text-xl font-semibold text-green-600">{{ activeCount }}</div>
        </div>
        <div class="bg-gray-50 rounded-md p-3 border border-gray-200">
          <div class="text-xs text-gray-500 mb-0.5">Completed</div>
          <div class="text-xl font-semibold text-blue-600">{{ completedCount }}</div>
        </div>
        <div class="bg-gray-50 rounded-md p-3 border border-gray-200">
          <div class="text-xs text-gray-500 mb-0.5">Avg Progress</div>
          <div class="text-xl font-semibold text-primary-600">{{ Math.round(averageProgress) }}%</div>
        </div>
      </div>

      <!-- Objectives Section -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Objectives ({{ personObjectives.length }})
        </h2>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-md p-4 mb-4">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                v-model="statusFilter"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Draft">Draft</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                v-model="priorityFilter"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Group By</label>
              <select
                v-model="groupBy"
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                <option value="">None</option>
                <option value="person">Person</option>
                <option value="due_date">Month & Year (Due Date)</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div class="flex items-end">
              <button
                @click="clearFilters"
                class="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Objectives List - Grouped -->
        <div v-if="filteredObjectives.length > 0 && groupBy">
          <div v-for="(group, groupKey) in groupedObjectives" :key="groupKey" class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
              {{ getGroupLabel(groupKey) }}
              <span class="text-sm font-normal text-gray-500 ml-2">({{ group.length }})</span>
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ObjectiveCard
                v-for="objective in group"
                :key="objective.id"
                :objective="objective"
              />
            </div>
          </div>
        </div>

        <!-- Objectives List - Ungrouped -->
        <div v-else-if="filteredObjectives.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ObjectiveCard
            v-for="objective in filteredObjectives"
            :key="objective.id"
            :objective="objective"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12 bg-white rounded-lg shadow-md">
          <p class="text-gray-500 text-lg">
            {{ statusFilter || priorityFilter ? 'No objectives match the filters.' : 'No objectives assigned to this person.' }}
          </p>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500 text-lg">Person not found</p>
      <router-link to="/people" class="text-primary-600 hover:text-primary-800 mt-4 inline-block">
        ← Back to People
      </router-link>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUsersStore } from '../stores/users'
import { useObjectivesStore } from '../stores/objectives'
import AppLayout from '../components/layout/AppLayout.vue'
import ObjectiveCard from '../components/objectives/ObjectiveCard.vue'
import Avatar from '../components/common/Avatar.vue'

const route = useRoute()
const usersStore = useUsersStore()
const objectivesStore = useObjectivesStore()

const statusFilter = ref('')
const priorityFilter = ref('')
const groupBy = ref('')

const person = computed(() => {
  return usersStore.getUserById(route.params.id)
})

const personObjectives = computed(() => {
  return objectivesStore.objectives.filter(obj => obj.owner_id === route.params.id)
})

const filteredObjectives = computed(() => {
  let filtered = [...personObjectives.value]

  if (statusFilter.value) {
    filtered = filtered.filter(obj => obj.status === statusFilter.value)
  }

  if (priorityFilter.value) {
    filtered = filtered.filter(obj => obj.priority === priorityFilter.value)
  }

  return filtered
})

const groupedObjectives = computed(() => {
  if (!groupBy.value || filteredObjectives.value.length === 0) {
    return {}
  }

  const groups = {}

  filteredObjectives.value.forEach(objective => {
    let key = ''

    switch (groupBy.value) {
      case 'person':
        key = objective.owner_id || 'unassigned'
        break
      case 'due_date':
        if (objective.due_date) {
          const date = new Date(objective.due_date)
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        } else {
          key = 'no_due_date'
        }
        break
      case 'priority':
        key = objective.priority || 'no_priority'
        break
      case 'status':
        key = objective.status || 'no_status'
        break
    }

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(objective)
  })

  // Sort groups based on type
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (groupBy.value === 'due_date') {
      return b.localeCompare(a) // Most recent first
    } else if (groupBy.value === 'priority') {
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2, 'no_priority': 3 }
      return (priorityOrder[a] || 99) - (priorityOrder[b] || 99)
    } else if (groupBy.value === 'status') {
      const statusOrder = { 'Active': 0, 'On Hold': 1, 'Draft': 2, 'Completed': 3, 'Cancelled': 4, 'no_status': 5 }
      return (statusOrder[a] || 99) - (statusOrder[b] || 99)
    }
    return a.localeCompare(b)
  })

  const sortedGroups = {}
  sortedKeys.forEach(key => {
    sortedGroups[key] = groups[key]
  })

  return sortedGroups
})

function getGroupLabel(groupKey) {
  if (!groupBy.value) return ''

  switch (groupBy.value) {
    case 'person':
      if (groupKey === 'unassigned') {
        return 'Unassigned'
      }
      const user = usersStore.getUserById(groupKey)
      return user ? user.name : 'Unknown Person'
    case 'due_date':
      if (groupKey === 'no_due_date') {
        return 'No Due Date'
      }
      const [year, month] = groupKey.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    case 'priority':
      return groupKey === 'no_priority' ? 'No Priority' : groupKey.charAt(0).toUpperCase() + groupKey.slice(1).toLowerCase()
    case 'status':
      return groupKey === 'no_status' ? 'No Status' : groupKey
    default:
      return groupKey
  }
}

const activeCount = computed(() => {
  return personObjectives.value.filter(obj => obj.status === 'Active').length
})

const completedCount = computed(() => {
  return personObjectives.value.filter(obj => obj.status === 'Completed').length
})

const averageProgress = computed(() => {
  if (personObjectives.value.length === 0) return 0
  const total = personObjectives.value.reduce((sum, obj) => sum + (obj.progress_percentage || 0), 0)
  return total / personObjectives.value.length
})

function getDepartmentName(deptId) {
  const dept = usersStore.getDepartmentById(deptId)
  return dept ? dept.name : 'Unknown'
}

function clearFilters() {
  statusFilter.value = ''
  priorityFilter.value = ''
  groupBy.value = ''
}

onMounted(async () => {
  await usersStore.fetchUsers()
  await usersStore.fetchDepartments()
  await objectivesStore.fetchObjectives()
})
</script>

