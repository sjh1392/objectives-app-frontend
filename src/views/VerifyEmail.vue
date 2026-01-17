<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
      </div>
      <div v-if="!verified" class="mt-8 space-y-6">
        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>
        <div v-if="success" class="rounded-md bg-green-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">Email verified successfully! Redirecting to login...</h3>
            </div>
          </div>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-600">
            Enter the verification token sent to <strong>{{ email }}</strong>
          </p>
        </div>
        <form @submit.prevent="handleVerify">
          <div>
            <label for="token" class="block text-sm font-medium text-gray-700">Verification Token</label>
            <input
              id="token"
              v-model="token"
              name="token"
              type="text"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter verification token"
            />
          </div>
          <div class="mt-4">
            <button
              type="submit"
              :disabled="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Verifying...</span>
              <span v-else>Verify Email</span>
            </button>
          </div>
        </form>
        <div class="text-center">
          <button
            @click="handleResend"
            :disabled="resending"
            class="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
          >
            {{ resending ? 'Sending...' : "Didn't receive the email? Resend" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref(route.query.email || '')
const token = ref(route.query.token || '')
const error = ref('')
const success = ref(false)
const verified = ref(false)
const loading = ref(false)
const resending = ref(false)

onMounted(() => {
  // If token is in query, auto-verify
  if (token.value) {
    handleVerify()
  }
})

const handleVerify = async () => {
  error.value = ''
  loading.value = true
  
  const result = await authStore.verifyEmail(token.value)
  
  if (result.success) {
    verified.value = true
    success.value = true
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } else {
    error.value = result.error
  }
  
  loading.value = false
}

const handleResend = async () => {
  if (!email.value) {
    error.value = 'Email address is required'
    return
  }
  
  resending.value = true
  error.value = ''
  
  const result = await authStore.resendVerification(email.value)
  
  if (result.success) {
    error.value = ''
    alert('Verification email sent! Please check your inbox.')
  } else {
    error.value = result.error
  }
  
  resending.value = false
}
</script>

