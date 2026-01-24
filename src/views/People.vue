<template>
  <AppLayout>
    <div>
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">People</h1>
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
            v-if="selectedUsers.length > 0"
            @click="bulkDelete"
            class="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Selected ({{ selectedUsers.length }})
          </button>
          <button
            @click="showForm = true; editingUser = null"
            class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            + Add Person
          </button>
        </div>
      </div>

      <!-- Form Modal -->
      <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <PersonForm
            :user="editingUser"
            :departments="usersStore.departments"
            @submit="handleFormSubmit"
            @cancel="closeForm"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="usersStore.loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Table View -->
      <div v-else-if="viewMode === 'table' && usersStore.users.length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input
                  type="checkbox"
                  :checked="selectedUsers.length === usersStore.users.length && usersStore.users.length > 0"
                  :indeterminate="selectedUsers.length > 0 && selectedUsers.length < usersStore.users.length"
                  @change="toggleSelectAll"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="user in usersStore.users"
              :key="user.id"
              :class="selectedUsers.includes(user.id) ? 'bg-primary-50' : 'hover:bg-gray-50'"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  :value="user.id"
                  v-model="selectedUsers"
                  @click.stop
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <Avatar :name="user.name" :email="user.email" :image-url="user.avatar" size="sm" />
                  <router-link
                    :to="`/people/${user.id}`"
                    class="text-sm font-medium text-primary-600 hover:text-primary-800"
                  >
                    {{ user.name }}
                  </router-link>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 capitalize">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ getDepartmentName(user.department) || 'Not assigned' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  @click.stop="showDepartmentAssignment(user)"
                  class="text-primary-600 hover:text-primary-900 mr-4"
                >
                  Assign Dept
                </button>
                <button
                  @click.stop="editUser(user)"
                  class="text-primary-600 hover:text-primary-900 mr-4"
                >
                  Edit
                </button>
                <button
                  @click.stop="deleteUser(user.id)"
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
      <div v-else-if="viewMode === 'grid' && usersStore.users.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="user in usersStore.users"
          :key="user.id"
          class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start gap-4 mb-4">
            <Avatar :name="user.name" :email="user.email" :image-url="user.avatar" size="lg" />
            <div class="flex-1">
              <router-link :to="`/people/${user.id}`" class="block">
                <h3 class="text-xl font-semibold text-primary-600 hover:text-primary-800 mb-1">{{ user.name }}</h3>
              </router-link>
              <p class="text-sm text-gray-500">{{ user.email }}</p>
            </div>
            <div class="flex gap-2">
              <button
                @click="editUser(user)"
                class="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                @click="deleteUser(user.id)"
                class="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex items-center">
              <span class="text-sm font-medium text-gray-600 w-24">Role:</span>
              <span class="px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm capitalize">
                {{ user.role }}
              </span>
            </div>
            <div class="flex items-center">
              <span class="text-sm font-medium text-gray-600 w-24">Department:</span>
              <span v-if="user.department" class="text-sm text-gray-900">
                {{ getDepartmentName(user.department) }}
              </span>
              <span v-else class="text-sm text-gray-400 italic">Not assigned</span>
            </div>
          </div>

          <button
            @click="showDepartmentAssignment(user)"
            class="mt-4 w-full px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50"
          >
            Assign to Department
          </button>
        </div>
      </div>

      <!-- Department Assignment Modal -->
      <div v-if="showDepartmentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg max-w-md w-full mx-4 p-6">
          <h2 class="text-2xl font-bold mb-4">Assign {{ selectedUser?.name }} to Department</h2>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              v-model="selectedDepartmentId"
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
            >
              <option :value="null">No Department</option>
              <option v-for="dept in usersStore.departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div class="flex justify-end gap-4">
            <button
              @click="closeDepartmentModal"
              class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="assignDepartment"
              class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Assign
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!usersStore.loading && usersStore.users.length === 0" class="text-center py-12 bg-white rounded-lg shadow-md">
        <p class="text-gray-500 text-lg">No people found. Add your first person!</p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUsersStore } from '../stores/users'
import AppLayout from '../components/layout/AppLayout.vue'
import PersonForm from '../components/people/PersonForm.vue'
import Avatar from '../components/common/Avatar.vue'

const usersStore = useUsersStore()

const showForm = ref(false)
const editingUser = ref(null)
const showDepartmentModal = ref(false)
const selectedUser = ref(null)
const selectedDepartmentId = ref(null)
const viewMode = ref('table')
const selectedUsers = ref([])

onMounted(async () => {
  await usersStore.fetchUsers()
  await usersStore.fetchDepartments()
})

function getDepartmentName(deptId) {
  const dept = usersStore.getDepartmentById(deptId)
  return dept ? dept.name : 'Unknown'
}

function editUser(user) {
  editingUser.value = user
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingUser.value = null
}

async function handleFormSubmit(formData) {
  try {
    if (editingUser.value) {
      await usersStore.updateUser(editingUser.value.id, formData)
    } else {
      await usersStore.createUser(formData)
    }
    closeForm()
    await usersStore.fetchUsers()
  } catch (error) {
    console.error('Error saving user:', error)
    alert('Error saving user. Please try again.')
  }
}

async function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await usersStore.deleteUser(userId)
      await usersStore.fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user. Please try again.')
    }
  }
}

function showDepartmentAssignment(user) {
  selectedUser.value = user
  selectedDepartmentId.value = user.department
  showDepartmentModal.value = true
}

function closeDepartmentModal() {
  showDepartmentModal.value = false
  selectedUser.value = null
  selectedDepartmentId.value = null
}

async function assignDepartment() {
  try {
    await usersStore.updateUser(selectedUser.value.id, {
      department: selectedDepartmentId.value
    })
    await usersStore.fetchUsers()
    closeDepartmentModal()
  } catch (error) {
    console.error('Error assigning department:', error)
    alert('Error assigning department. Please try again.')
  }
}

function toggleSelectAll(event) {
  if (event.target.checked) {
    selectedUsers.value = usersStore.users.map(user => user.id)
  } else {
    selectedUsers.value = []
  }
}

async function bulkDelete() {
  const count = selectedUsers.value.length
  if (confirm(`Are you sure you want to delete ${count} user(s)?`)) {
    try {
      for (const id of selectedUsers.value) {
        await usersStore.deleteUser(id)
      }
      selectedUsers.value = []
      await usersStore.fetchUsers()
    } catch (error) {
      console.error('Error deleting users:', error)
      alert('Error deleting users. Please try again.')
    }
  }
}
</script>

