<template>
  <AppLayout>
    <div>
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Departments</h1>
        <div class="flex gap-3">
          <div class="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              @click="viewMode = 'table'"
              :class="viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
              class="px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Table
            </button>
            <button
              @click="viewMode = 'grid'"
              :class="viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
              class="px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Grid
            </button>
            <button
              @click="viewMode = 'tree'"
              :class="viewMode === 'tree' ? 'bg-primary-600 text-white' : 'bg-white text-gray-700'"
              class="px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Tree
            </button>
          </div>
          <button
            v-if="selectedDepartments.length > 0"
            @click="bulkDelete"
            class="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Selected ({{ selectedDepartments.length }})
          </button>
          <button
            @click="showForm = true; editingDepartment = null"
            class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            + Add Department
          </button>
        </div>
      </div>

      <!-- Form Modal -->
      <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <DepartmentForm
            :department="editingDepartment"
            :users="usersStore.users"
            @submit="handleFormSubmit"
            @cancel="closeForm"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="usersStore.loading || objectivesStore.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Table View -->
      <div v-else-if="viewMode === 'table' && usersStore.departments.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  :checked="selectedDepartments.length === usersStore.departments.length && usersStore.departments.length > 0"
                  :indeterminate="selectedDepartments.length > 0 && selectedDepartments.length < usersStore.departments.length"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manager</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Members</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="department in usersStore.departments"
              :key="department.id"
              :class="selectedDepartments.includes(department.id) ? 'bg-primary-50' : 'hover:bg-gray-50'"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  :value="department.id"
                  v-model="selectedDepartments"
                  @click.stop
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ department.name }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500">{{ department.description || '—' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ getManagerName(department.manager_id) || 'No manager' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ getDepartmentMembers(department.id).length }} people
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click.stop="editDepartment(department)"
                  class="text-primary-600 hover:text-primary-900 mr-4"
                >
                  Edit
                </button>
                <button
                  @click.stop="deleteDepartment(department.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid' && usersStore.departments.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="department in usersStore.departments"
          :key="department.id"
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">{{ department.name }}</h3>
              <p v-if="department.description" class="text-sm text-gray-600">
                {{ department.description }}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                @click="editDepartment(department)"
                class="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                @click="deleteDepartment(department.id)"
                class="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>

          <div class="space-y-2 mb-4">
            <div class="flex items-center">
              <span class="text-sm font-medium text-gray-600 w-24">Manager:</span>
              <span v-if="department.manager_id" class="text-sm text-gray-900">
                {{ getManagerName(department.manager_id) }}
              </span>
              <span v-else class="text-sm text-gray-400 italic">No manager</span>
            </div>
            <div class="flex items-center">
              <span class="text-sm font-medium text-gray-600 w-24">Members:</span>
              <span class="text-sm text-gray-900">
                {{ getDepartmentMembers(department.id).length }} people
              </span>
            </div>
          </div>

          <!-- Department Members List -->
          <div v-if="getDepartmentMembers(department.id).length > 0" class="mt-4 pt-4 border-t">
            <h4 class="text-sm font-medium text-gray-700 mb-2">Team Members:</h4>
            <ul class="space-y-1">
              <li
                v-for="member in getDepartmentMembers(department.id)"
                :key="member.id"
                class="text-sm text-gray-600"
              >
                • {{ member.name }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Tree View -->
      <div v-else-if="viewMode === 'tree'" class="bg-white rounded-lg shadow-md p-8">
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
          </div>

          <!-- Empty State -->
          <div v-if="usersStore.departments.length === 0 && unassignedPeople.length === 0" class="text-center py-12">
            <p class="text-gray-500 text-lg">No organizational structure defined yet.</p>
            <p class="text-gray-400 text-sm mt-2">Add departments and people to see the structure.</p>
          </div>
        </div>
      </div>

      <!-- Empty State for Table/Grid views -->
      <div v-else-if="usersStore.departments.length === 0" class="text-center py-12 bg-white rounded-lg shadow-md">
        <p class="text-gray-500 text-lg">No departments found. Add your first department!</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUsersStore } from '../stores/users'
import { useObjectivesStore } from '../stores/objectives'
import AppLayout from '../components/layout/AppLayout.vue'
import DepartmentForm from '../components/departments/DepartmentForm.vue'

const usersStore = useUsersStore()
const objectivesStore = useObjectivesStore()

const showForm = ref(false)
const editingDepartment = ref(null)
const viewMode = ref('table')
const selectedDepartments = ref([])

const unassignedPeople = computed(() => {
  return usersStore.users.filter(user => !user.department)
})

onMounted(async () => {
  await usersStore.fetchDepartments()
  await usersStore.fetchUsers()
  await objectivesStore.fetchObjectives()
})

function getManagerName(managerId) {
  const manager = usersStore.getUserById(managerId)
  return manager ? manager.name : 'Unknown'
}

function getDepartmentMembers(departmentId) {
  const members = usersStore.users.filter(user => user.department === departmentId)
  // Sort: manager first, then by name
  const department = usersStore.departments.find(d => d.id === departmentId)
  if (!department) return members
  return members.sort((a, b) => {
    if (a.id === department.manager_id) return -1
    if (b.id === department.manager_id) return 1
    return a.name.localeCompare(b.name)
  })
}

function getDepartmentObjectives(departmentId) {
  return objectivesStore.objectives.filter(obj => obj.department_id === departmentId)
}

function editDepartment(department) {
  editingDepartment.value = department
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingDepartment.value = null
}

async function handleFormSubmit(formData) {
  try {
    if (editingDepartment.value) {
      await usersStore.updateDepartment(editingDepartment.value.id, formData)
    } else {
      await usersStore.createDepartment(formData)
    }
    closeForm()
    await usersStore.fetchDepartments()
    await usersStore.fetchUsers() // Refresh to update member counts
  } catch (error) {
    console.error('Error saving department:', error)
    alert('Error saving department. Please try again.')
  }
}

async function deleteDepartment(departmentId) {
  if (confirm('Are you sure you want to delete this department? Users assigned to this department will be unassigned.')) {
    try {
      await usersStore.deleteDepartment(departmentId)
      await usersStore.fetchDepartments()
      await usersStore.fetchUsers()
      // Remove from selection if it was selected
      selectedDepartments.value = selectedDepartments.value.filter(id => id !== departmentId)
    } catch (error) {
      console.error('Error deleting department:', error)
      alert('Error deleting department. Please try again.')
    }
  }
}

function toggleSelectAll(event) {
  if (event.target.checked) {
    selectedDepartments.value = usersStore.departments.map(dept => dept.id)
  } else {
    selectedDepartments.value = []
  }
}

async function bulkDelete() {
  const count = selectedDepartments.value.length
  if (confirm(`Are you sure you want to delete ${count} department(s)? Users assigned to these departments will be unassigned.`)) {
    try {
      for (const id of selectedDepartments.value) {
        await usersStore.deleteDepartment(id)
      }
      selectedDepartments.value = []
      await usersStore.fetchDepartments()
      await usersStore.fetchUsers()
    } catch (error) {
      console.error('Error deleting departments:', error)
      alert('Error deleting departments. Please try again.')
    }
  }
}
</script>

