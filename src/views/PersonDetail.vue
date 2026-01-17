<template>
  <AppLayout>
    <div v-if="usersStore.loading || objectivesStore.loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>

    <div v-else-if="person" class="max-w-6xl mx-auto">
      <!-- Person Header -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
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

      <!-- Objectives Section -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">
          Objectives ({{ personObjectives.length }})
        </h2>

        <!-- Filters -->
        <div class="bg-white rounded-lg shadow-md p-4 mb-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <!-- Objectives List -->
        <div v-if="filteredObjectives.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <!-- Statistics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="text-sm text-gray-500 mb-1">Total Objectives</div>
          <div class="text-3xl font-bold text-gray-900">{{ personObjectives.length }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="text-sm text-gray-500 mb-1">Active</div>
          <div class="text-3xl font-bold text-green-600">{{ activeCount }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="text-sm text-gray-500 mb-1">Completed</div>
          <div class="text-3xl font-bold text-blue-600">{{ completedCount }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="text-sm text-gray-500 mb-1">Avg Progress</div>
          <div class="text-3xl font-bold text-primary-600">{{ Math.round(averageProgress) }}%</div>
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
}

onMounted(async () => {
  await usersStore.fetchUsers()
  await usersStore.fetchDepartments()
  await objectivesStore.fetchObjectives()
})
</script>

