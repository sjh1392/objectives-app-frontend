<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Accept Invitation
        </h2>
        <p v-if="invitation" class="mt-2 text-center text-sm text-gray-600">
          You've been invited to join <strong>{{ invitation.organizationName }}</strong> as a <strong>{{ invitation.role }}</strong>
        </p>
      </div>
      <form v-if="invitation && !accepted" class="mt-8 space-y-6" @submit.prevent="handleAccept">
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Your Name</label>
            <input
              id="name"
              v-model="name"
              name="name"
              type="text"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Password (min 8 characters)"
            />
          </div>
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Confirm password"
            />
          </div>
        </div>
        <div>
          <button
            type="submit"
            :disabled="loading || password !== confirmPassword"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Accepting...</span>
            <span v-else>Accept Invitation</span>
          </button>
        </div>
        <div v-if="password && confirmPassword && password !== confirmPassword" class="text-sm text-red-600 text-center">
          Passwords do not match
        </div>
      </form>
      <div v-if="accepted" class="mt-8">
        <div class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">
                Invitation accepted! Redirecting...
              </h3>
            </div>
          </div>
        </div>
      </div>
      <div v-if="loadingInvitation" class="text-center">
        <p class="text-sm text-gray-600">Loading invitation...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const token = ref(route.query.token || '')
const invitation = ref(null)
const name = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const accepted = ref(false)
const loading = ref(false)
const loadingInvitation = ref(true)

onMounted(async () => {
  if (!token.value) {
    error.value = 'Invitation token is required'
    loadingInvitation.value = false
    return
  }
  
  try {
    const response = await api.get(`/invitations/${token.value}`)
    invitation.value = response.data
    loadingInvitation.value = false
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load invitation'
    loadingInvitation.value = false
  }
})

const handleAccept = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  
  error.value = ''
  loading.value = true
  
  try {
    const response = await api.post(`/invitations/${token.value}/accept`, {
      name: name.value,
      password: password.value
    })
    
    const { token: authToken, user } = response.data
    authStore.setToken(authToken)
    authStore.setCurrentUser(user)
    
    accepted.value = true
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to accept invitation'
  } finally {
    loading.value = false
  }
}
</script>

