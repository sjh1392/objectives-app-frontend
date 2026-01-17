<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Company Information</h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
        <input
          v-model="formData.name"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Enter your company name"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          v-model="formData.description"
          rows="4"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Tell us about your company"
        ></textarea>
      </div>

      <!-- Logo Upload -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
        <div class="mt-2">
          <!-- Current Logo Display -->
          <div v-if="logoPreview || currentLogoUrl" class="mb-4">
            <img
              :src="logoPreview || currentLogoUrl"
              alt="Company logo"
              class="h-24 w-24 object-contain border border-gray-300 rounded-md p-2 bg-gray-50"
            />
            <button
              type="button"
              @click="removeLogo"
              class="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Remove logo
            </button>
          </div>

          <!-- File Input -->
          <div
            @drop.prevent="handleDrop"
            @dragover.prevent
            @dragenter.prevent
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors"
            :class="{ 'border-primary-500 bg-primary-50': isDragging }"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              @change="handleFileSelect"
              class="hidden"
            />
            <div class="space-y-2">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="text-sm text-gray-600">
                <button
                  type="button"
                  @click="$refs.fileInput.click()"
                  class="font-medium text-primary-600 hover:text-primary-500"
                >
                  Click to upload
                </button>
                <span> or drag and drop</span>
              </div>
              <p class="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 5MB</p>
            </div>
          </div>
          <div v-if="logoError" class="mt-2 text-sm text-red-600">{{ logoError }}</div>
        </div>
      </div>

      <div class="flex justify-end gap-4 pt-4">
        <button
          type="submit"
          :disabled="loading"
          class="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Saving...</span>
          <span v-else>Save & Continue</span>
        </button>
      </div>
    </form>

    <div v-if="successMessage" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../services/api'

const emit = defineEmits(['step-complete', 'data-updated'])

const formData = ref({
  name: '',
  description: ''
})

const fileInput = ref(null)
const logoPreview = ref(null)
const currentLogoUrl = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)
const logoError = ref('')
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function loadCompanyData() {
  try {
    const response = await api.get('/company')
    if (response.data) {
      formData.value = {
        name: response.data.name || '',
        description: response.data.description || ''
      }
      if (response.data.logo_url) {
        currentLogoUrl.value = response.data.logo_url
      }
    }
  } catch (error) {
    console.error('Error loading company data:', error)
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

function validateAndSetFile(file) {
  logoError.value = ''
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    logoError.value = 'Please select a valid image file (JPEG, PNG, GIF, or WEBP)'
    return
  }
  
  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    logoError.value = 'File size must be less than 5MB'
    return
  }
  
  selectedFile.value = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

function removeLogo() {
  selectedFile.value = null
  logoPreview.value = null
  currentLogoUrl.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function handleSubmit() {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  try {
    // First, upload logo if a new one was selected
    let logoUrl = currentLogoUrl.value
    
    if (selectedFile.value) {
      const formData = new FormData()
      formData.append('logo', selectedFile.value)
      
      const uploadResponse = await api.post('/company/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      logoUrl = uploadResponse.data.logo_url
    }
    
    // Then save/update company info
    await api.post('/company', {
      name: formData.value.name,
      description: formData.value.description,
      logo_url: logoUrl
    })
    
    successMessage.value = 'Company information saved successfully!'
    emit('step-complete', 'company')
    emit('data-updated')
    
    // Update page title immediately
    if (formData.value.name) {
      document.title = `${formData.value.name} - Objectives Management`
    }
    
    // Clear file selection after successful upload
    selectedFile.value = null
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.error || 'Failed to save company information'
    console.error('Error saving company:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCompanyData()
})
</script>

