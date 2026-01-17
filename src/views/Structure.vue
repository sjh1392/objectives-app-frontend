<template>
  <AppLayout>
    <div>
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Organizational Structure</h1>
        <div class="flex gap-3">
          <div class="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              @click="viewStyle = 'cards'"
              :class="viewStyle === 'cards' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
              class="px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Cards
            </button>
            <button
              @click="viewStyle = 'tree'"
              :class="viewStyle === 'tree' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
              class="px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Tree
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="usersStore.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Cards View -->
      <div v-else-if="viewStyle === 'cards'">
        <!-- Unassigned People -->
        <div v-if="unassignedPeople.length > 0" class="mb-8">
          <h2 class="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span class="mr-2">📋</span>
            Unassigned People
          </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="person in unassignedPeople"
                  :key="person.id"
                  class="bg-white rounded-lg border-2 border-dashed border-gray-300 p-4 hover:border-primary-400 transition-colors"
                >
                  <div class="flex items-start gap-3">
                    <Avatar :name="person.name" :email="person.email" size="md" />
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900">{{ person.name }}</h3>
                      <p class="text-sm text-gray-500 mt-1">{{ person.email }}</p>
                    </div>
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                  {{ person.role }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Departments -->
        <div v-for="department in usersStore.departments" :key="department.id" class="mb-8">
          <div class="bg-white rounded-lg shadow-md p-6">
            <!-- Department Header -->
            <div class="flex items-start justify-between mb-6 pb-4 border-b">
              <div class="flex-1">
                <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ department.name }}</h2>
                <p v-if="department.description" class="text-gray-600">{{ department.description }}</p>
              </div>
              <div class="text-right">
                <div class="text-sm text-gray-500 mb-1">Manager</div>
                <div v-if="department.manager_id" class="font-medium text-gray-900">
                  {{ getManagerName(department.manager_id) }}
                </div>
                <div v-else class="text-gray-400 italic text-sm">No manager assigned</div>
              </div>
            </div>

            <!-- Department Members -->
            <div v-if="getDepartmentMembers(department.id).length > 0">
              <h3 class="text-sm font-medium text-gray-700 mb-4">
                Team Members ({{ getDepartmentMembers(department.id).length }})
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="member in getDepartmentMembers(department.id)"
                  :key="member.id"
                  :class="member.id === department.manager_id ? 'border-2 border-primary-500 bg-primary-50' : 'border border-gray-200 bg-white'"
                  class="rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div class="flex items-start gap-3 mb-2">
                    <Avatar :name="member.name" :email="member.email" size="md" />
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <h4 class="font-semibold text-gray-900">{{ member.name }}</h4>
                        <span
                          v-if="member.id === department.manager_id"
                          class="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-200 text-primary-800"
                        >
                          Manager
                        </span>
                      </div>
                      <p class="text-sm text-gray-500 mt-1">{{ member.email }}</p>
                    </div>
                    <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 capitalize">
                      {{ member.role }}
                    </span>
                  </div>
                  <div class="mt-2 text-xs text-gray-500">
                    {{ member.role }}
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-400">
              <p>No members assigned to this department</p>
            </div>

            <!-- Department Objectives -->
            <div v-if="getDepartmentObjectives(department.id).length > 0" class="mt-6 pt-6 border-t">
              <h3 class="text-sm font-medium text-gray-700 mb-4">
                Department Objectives ({{ getDepartmentObjectives(department.id).length }})
              </h3>
              <div class="space-y-2">
                <router-link
                  v-for="objective in getDepartmentObjectives(department.id)"
                  :key="objective.id"
                  :to="`/objectives/${objective.id}`"
                  class="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <div class="font-medium text-gray-900">{{ objective.title }}</div>
                      <div class="text-sm text-gray-500 mt-1">
                        Due: {{ formatDate(objective.due_date) }} | 
                        Progress: {{ Math.round(objective.progress_percentage || 0) }}%
                      </div>
                    </div>
                    <span
                      class="ml-3 px-2 py-1 rounded-full text-xs font-semibold"
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
                  </div>
                </router-link>
              </div>
            </div>
            <div v-else class="mt-6 pt-6 border-t">
              <p class="text-sm text-gray-400 italic">No objectives assigned to this department</p>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="usersStore.departments.length === 0 && unassignedPeople.length === 0" class="text-center py-12 bg-white rounded-lg shadow-md">
          <p class="text-gray-500 text-lg">No organizational structure defined yet.</p>
          <p class="text-gray-400 text-sm mt-2">Add departments and people to see the structure.</p>
        </div>
      </div>

      <!-- Tree View -->
      <div v-else-if="viewStyle === 'tree'" class="bg-white rounded-lg shadow-md p-8">
        <div class="space-y-8">
          <!-- Unassigned People -->
          <div v-if="unassignedPeople.length > 0" class="border-l-4 border-gray-300 pl-6">
            <h2 class="text-lg font-semibold text-gray-700 mb-4">Unassigned People</h2>
            <div class="space-y-2 ml-4">
              <div
                v-for="person in unassignedPeople"
                :key="person.id"
                class="flex items-center gap-3 py-2"
              >
                <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span class="font-medium text-gray-900">{{ person.name }}</span>
                <span class="text-sm text-gray-500">{{ person.email }}</span>
                <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
                  {{ person.role }}
                </span>
              </div>
            </div>
          </div>

          <!-- Departments Tree -->
          <div v-for="department in usersStore.departments" :key="department.id" class="border-l-4 border-primary-500 pl-6">
            <!-- Department Node -->
            <div class="mb-4">
              <div class="flex items-center gap-3 mb-2">
                <div class="w-4 h-4 bg-primary-500 rounded-full"></div>
                <h2 class="text-xl font-bold text-gray-900">{{ department.name }}</h2>
              </div>
              <p v-if="department.description" class="text-sm text-gray-600 ml-7 mb-2">
                {{ department.description }}
              </p>
              <div v-if="department.manager_id" class="flex items-center gap-2 ml-7 mb-4">
                <span class="text-sm text-gray-600">Manager:</span>
                <span class="text-sm font-medium text-primary-700">{{ getManagerName(department.manager_id) }}</span>
              </div>
            </div>

            <!-- People Nodes -->
            <div v-if="getDepartmentMembers(department.id).length > 0" class="ml-8 space-y-2">
              <div
                v-for="member in getDepartmentMembers(department.id)"
                :key="member.id"
                class="flex items-center gap-3 py-2 pl-4 border-l-2"
                :class="member.id === department.manager_id ? 'border-primary-400 bg-primary-50 rounded-r' : 'border-gray-200'"
              >
                <div
                  class="w-2 h-2 rounded-full"
                  :class="member.id === department.manager_id ? 'bg-primary-500' : 'bg-gray-400'"
                ></div>
                <span class="font-medium text-gray-900">{{ member.name }}</span>
                <span class="text-sm text-gray-500">{{ member.email }}</span>
                <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
                  {{ member.role }}
                </span>
                <span
                  v-if="member.id === department.manager_id"
                  class="px-2 py-0.5 text-xs rounded-full bg-primary-200 text-primary-800 font-medium"
                >
                  Manager
                </span>
              </div>
            </div>
            <div v-else class="ml-8 text-sm text-gray-400 italic py-2">
              No members assigned
            </div>

            <!-- Department Objectives in Tree View -->
            <div v-if="getDepartmentObjectives(department.id).length > 0" class="ml-8 mt-4 pl-4 border-l-2 border-primary-300">
              <div class="mb-2">
                <span class="text-sm font-medium text-gray-700">
                  Objectives ({{ getDepartmentObjectives(department.id).length }})
                </span>
              </div>
              <div class="space-y-2">
                <router-link
                  v-for="objective in getDepartmentObjectives(department.id)"
                  :key="objective.id"
                  :to="`/objectives/${objective.id}`"
                  class="block py-2 pl-4 border-l-2 border-gray-200 hover:bg-gray-50 rounded-r transition-colors"
                >
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span class="font-medium text-gray-900">{{ objective.title }}</span>
                    <span class="text-xs text-gray-500">
                      ({{ Math.round(objective.progress_percentage || 0) }}%)
                    </span>
                    <span
                      class="px-2 py-0.5 text-xs rounded-full"
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
                  </div>
                </router-link>
              </div>
            </div>
            <div v-else class="ml-8 mt-4 text-sm text-gray-400 italic py-2">
              No objectives assigned to this department
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="usersStore.departments.length === 0 && unassignedPeople.length === 0" class="text-center py-12">
            <p class="text-gray-500 text-lg">No organizational structure defined yet.</p>
            <p class="text-gray-400 text-sm mt-2">Add departments and people to see the structure.</p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '../stores/users'
import { useObjectivesStore } from '../stores/objectives'
import AppLayout from '../components/layout/AppLayout.vue'
import Avatar from '../components/common/Avatar.vue'

const usersStore = useUsersStore()
const objectivesStore = useObjectivesStore()
const viewStyle = ref('cards')

const unassignedPeople = computed(() => {
  return usersStore.users.filter(user => !user.department)
})

onMounted(async () => {
  await usersStore.fetchUsers()
  await usersStore.fetchDepartments()
  await objectivesStore.fetchObjectives()
})

function getManagerName(managerId) {
  const manager = usersStore.getUserById(managerId)
  return manager ? manager.name : 'Unknown'
}

function getDepartmentMembers(departmentId) {
  const members = usersStore.users.filter(user => user.department === departmentId)
  // Sort: manager first, then by name
  return members.sort((a, b) => {
    if (a.id === departmentId) return -1
    if (b.id === departmentId) return 1
    return a.name.localeCompare(b.name)
  })
}

function getDepartmentObjectives(departmentId) {
  return objectivesStore.objectives.filter(obj => obj.department_id === departmentId)
}

function formatDate(dateString) {
  if (!dateString) return 'No due date'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

