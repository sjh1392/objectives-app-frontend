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

      <!-- Table View -->
      <div v-if="viewMode === 'table' && usersStore.departments.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
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

      <!-- Empty State -->
      <div v-if="usersStore.departments.length === 0" class="text-center py-12 bg-white rounded-lg shadow-md">
        <p class="text-gray-500 text-lg">No departments found. Add your first department!</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUsersStore } from '../stores/users'
import AppLayout from '../components/layout/AppLayout.vue'
import DepartmentForm from '../components/departments/DepartmentForm.vue'

const usersStore = useUsersStore()

const showForm = ref(false)
const editingDepartment = ref(null)
const viewMode = ref('table')
const selectedDepartments = ref([])

onMounted(async () => {
  await usersStore.fetchDepartments()
  await usersStore.fetchUsers()
})

function getManagerName(managerId) {
  const manager = usersStore.getUserById(managerId)
  return manager ? manager.name : 'Unknown'
}

function getDepartmentMembers(departmentId) {
  return usersStore.users.filter(user => user.department === departmentId)
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

