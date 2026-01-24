<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

      <!-- Profile Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Profile</h2>
        
        <form @submit.prevent="updateProfile" class="space-y-6">
          <!-- Avatar -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            <div class="flex items-center gap-4">
              <Avatar
                :name="formData.name"
                :email="currentUser?.email || ''"
                :image-url="avatarPreview || formData.avatar"
                size="xl"
              />
              <div class="flex-1">
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  @change="handleAvatarSelect"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="$refs.avatarInput.click()"
                  class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors"
                >
                  Change Picture
                </button>
                <button
                  v-if="formData.avatar || avatarPreview"
                  type="button"
                  @click="removeAvatar"
                  class="ml-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition-colors"
                >
                  Remove
                </button>
                <p class="text-xs text-gray-500 mt-2">PNG, JPG, GIF, WEBP up to 5MB</p>
                <p v-if="avatarError" class="text-xs text-red-600 mt-1">{{ avatarError }}</p>
              </div>
            </div>
          </div>

          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Your name"
            />
          </div>

          <!-- Email (read-only) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              :value="currentUser?.email || ''"
              type="email"
              disabled
              class="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p class="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div class="flex justify-end gap-4 pt-4">
            <button
              type="button"
              @click="resetForm"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="loading || !hasChanges"
              class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="loading">Saving...</span>
              <span v-else>Save Changes</span>
            </button>
          </div>
        </form>

        <div v-if="profileSuccessMessage" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
          {{ profileSuccessMessage }}
        </div>
        <div v-if="profileErrorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {{ profileErrorMessage }}
        </div>
      </div>

      <!-- Subscriptions Section -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Objective Subscriptions</h2>
          <span class="text-sm text-gray-500">{{ subscriptions.length }} subscribed</span>
        </div>
        
        <p class="text-sm text-gray-600 mb-4">
          You'll receive notifications for updates to objectives you're subscribed to.
        </p>

        <div v-if="loadingSubscriptions" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="text-sm text-gray-500 mt-2">Loading subscriptions...</p>
        </div>

        <div v-else-if="subscriptions.length === 0" class="text-center py-8 text-gray-500">
          <p>You're not subscribed to any objectives.</p>
          <router-link to="/objectives" class="text-primary-600 hover:text-primary-700 mt-2 inline-block">
            Browse objectives to subscribe
          </router-link>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="subscription in subscriptions"
            :key="subscription.id"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div class="flex-1">
              <router-link
                :to="`/objectives/${subscription.objective_id}`"
                class="text-primary-600 hover:text-primary-700 font-medium"
              >
                {{ subscription.objective_title || 'Untitled Objective' }}
              </router-link>
              <p class="text-xs text-gray-500 mt-1">
                Subscribed {{ formatDate(subscription.created_at) }}
              </p>
            </div>
            <button
              @click="unsubscribe(subscription.objective_id)"
              :disabled="unsubscribing === subscription.objective_id"
              class="ml-4 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            >
              <span v-if="unsubscribing === subscription.objective_id">Unsubscribing...</span>
              <span v-else>Unsubscribe</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Notification Preferences Section (placeholder for future) -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Notification Preferences</h2>
        <p class="text-sm text-gray-600">
          Notification preferences will be available soon. For now, you'll receive notifications for all subscribed objectives.
        </p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'
import api from '@/services/api'
import AppLayout from '@/components/layout/AppLayout.vue'
import Avatar from '@/components/common/Avatar.vue'

const authStore = useAuthStore()
const usersStore = useUsersStore()

const currentUser = computed(() => authStore.currentUser)

const formData = ref({
  name: '',
  avatar: null
})

const originalData = ref({
  name: '',
  avatar: null
})

const avatarInput = ref(null)
const avatarPreview = ref(null)
const selectedAvatarFile = ref(null)
const avatarError = ref('')
const loading = ref(false)
const profileSuccessMessage = ref('')
const profileErrorMessage = ref('')

const subscriptions = ref([])
const loadingSubscriptions = ref(false)
const unsubscribing = ref(null)

const hasChanges = computed(() => {
  return formData.value.name !== originalData.value.name ||
         avatarPreview.value !== null ||
         (formData.value.avatar !== originalData.value.avatar)
})

function handleAvatarSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  avatarError.value = ''
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    avatarError.value = 'Please select a valid image file (JPEG, PNG, GIF, or WEBP)'
    return
  }
  
  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    avatarError.value = 'File size must be less than 5MB'
    return
  }
  
  selectedAvatarFile.value = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function removeAvatar() {
  selectedAvatarFile.value = null
  avatarPreview.value = null
  formData.value.avatar = null
  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

async function updateProfile() {
  loading.value = true
  profileSuccessMessage.value = ''
  profileErrorMessage.value = ''
  
  try {
    let avatarUrl = formData.value.avatar
    
    // Upload avatar if a new one was selected
    if (selectedAvatarFile.value) {
      const uploadFormData = new FormData()
      uploadFormData.append('avatar', selectedAvatarFile.value)
      
      const uploadResponse = await api.post('/users/me/avatar', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      avatarUrl = uploadResponse.data.avatar
    }
    
    // Update user profile
    const response = await api.put(`/users/${currentUser.value.id}`, {
      name: formData.value.name,
      avatar: avatarUrl
    })
    
    // Update auth store
    authStore.setCurrentUser({
      ...currentUser.value,
      name: response.data.name,
      avatar: response.data.avatar
    })
    
    // Update users store if user is in the list
    if (usersStore.users.find(u => u.id === currentUser.value.id)) {
      await usersStore.fetchUsers()
    }
    
    // Reset form
    originalData.value = {
      name: response.data.name,
      avatar: response.data.avatar
    }
    formData.value = {
      name: response.data.name,
      avatar: response.data.avatar
    }
    selectedAvatarFile.value = null
    avatarPreview.value = null
    if (avatarInput.value) {
      avatarInput.value.value = ''
    }
    
    profileSuccessMessage.value = 'Profile updated successfully!'
    setTimeout(() => {
      profileSuccessMessage.value = ''
    }, 3000)
  } catch (error) {
    profileErrorMessage.value = error.response?.data?.error || 'Failed to update profile'
    console.error('Error updating profile:', error)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  formData.value = {
    name: originalData.value.name,
    avatar: originalData.value.avatar
  }
  selectedAvatarFile.value = null
  avatarPreview.value = null
  avatarError.value = ''
  profileSuccessMessage.value = ''
  profileErrorMessage.value = ''
  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

async function loadSubscriptions() {
  loadingSubscriptions.value = true
  try {
    const response = await api.get('/users/me/subscriptions')
    subscriptions.value = response.data || []
  } catch (error) {
    console.error('Error loading subscriptions:', error)
    subscriptions.value = []
  } finally {
    loadingSubscriptions.value = false
  }
}

async function unsubscribe(objectiveId) {
  if (!confirm('Are you sure you want to unsubscribe from this objective?')) {
    return
  }
  
  unsubscribing.value = objectiveId
  try {
    await api.delete(`/objectives/${objectiveId}/subscribe`)
    subscriptions.value = subscriptions.value.filter(s => s.objective_id !== objectiveId)
  } catch (error) {
    console.error('Error unsubscribing:', error)
    alert(error.response?.data?.error || 'Failed to unsubscribe')
  } finally {
    unsubscribing.value = null
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

async function loadUserData() {
  if (!currentUser.value) return
  
  // Load user details
  try {
    const user = usersStore.getUserById(currentUser.value.id) || currentUser.value
    formData.value = {
      name: user.name || '',
      avatar: user.avatar || null
    }
    originalData.value = {
      name: user.name || '',
      avatar: user.avatar || null
    }
  } catch (error) {
    console.error('Error loading user data:', error)
  }
}

onMounted(async () => {
  await loadUserData()
  await loadSubscriptions()
})
</script>

