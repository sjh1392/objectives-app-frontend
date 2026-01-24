<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div v-if="loading" class="space-y-4">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p class="text-gray-600">Completing sign-in...</p>
      </div>
      <div v-else-if="error" class="space-y-4">
        <div class="text-red-600 text-xl font-semibold">{{ error }}</div>
        <router-link to="/login" class="text-indigo-600 hover:text-indigo-500">
          Return to login
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    console.log('Google callback - route.query:', route.query)
    const code = route.query.code
    const errorParam = route.query.error
    
    // Check for OAuth error from Google
    if (errorParam) {
      error.value = `Google sign-in error: ${errorParam}`
      loading.value = false
      return
    }
    
    if (!code) {
      error.value = 'No authorization code received from Google'
      loading.value = false
      return
    }
    
    console.log('Exchanging code for token...')
    // Exchange code for token
    const result = await authStore.exchangeGoogleCode(code)
    
    console.log('Exchange result:', result)
    
    if (result.success) {
      // Get redirect path from sessionStorage or use state from URL
      const state = route.query.state || '/'
      const redirectPath = sessionStorage.getItem('googleOAuthRedirect') || state
      sessionStorage.removeItem('googleOAuthRedirect')
      
      console.log('Redirecting to:', redirectPath)
      // Redirect to intended destination
      router.push(redirectPath)
    } else {
      error.value = result.error || 'Failed to complete sign-in'
      loading.value = false
    }
  } catch (err) {
    console.error('Google callback error:', err)
    console.error('Error details:', err.response?.data)
    error.value = err.response?.data?.error || err.message || 'An error occurred during sign-in'
    loading.value = false
  }
})
</script>

