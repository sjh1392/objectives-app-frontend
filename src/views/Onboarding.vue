<template>
  <AppLayout>
    <div class="max-w-6xl mx-auto">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Get Started</h1>
        <p class="text-gray-600">Set up your company, team, and objectives</p>
      </div>

      <!-- Progress Bar -->
      <div class="mb-8 bg-white rounded-lg shadow-md p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">Progress</span>
          <span class="text-sm text-gray-500">{{ completedSteps }}/{{ totalSteps }} steps completed</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-primary-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${(completedSteps / totalSteps) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="bg-white rounded-lg shadow-md mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px" aria-label="Tabs">
            <button
              v-for="(step, index) in steps"
              :key="step.id"
              @click="currentStep = index"
              :class="[
                'px-6 py-4 text-sm font-medium border-b-2 transition-colors',
                currentStep === index
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                step.completed && 'text-green-600'
              ]"
            >
              <div class="flex items-center gap-2">
                <span v-if="step.completed" class="text-green-500">✓</span>
                <span>{{ step.label }}</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      <!-- Step Content -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <component
          :is="steps[currentStep].component"
          @step-complete="handleStepComplete"
          @data-updated="handleDataUpdated"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import OnboardingStepCompany from '../components/onboarding/OnboardingStepCompany.vue'
import OnboardingStepDepartments from '../components/onboarding/OnboardingStepDepartments.vue'
import OnboardingStepTeam from '../components/onboarding/OnboardingStepTeam.vue'
import OnboardingStepObjectives from '../components/onboarding/OnboardingStepObjectives.vue'
import OnboardingStepKeyResults from '../components/onboarding/OnboardingStepKeyResults.vue'
import api from '../services/api'

const currentStep = ref(0)

const steps = ref([
  { id: 'company', label: 'Company Info', component: OnboardingStepCompany, completed: false },
  { id: 'departments', label: 'Departments', component: OnboardingStepDepartments, completed: false },
  { id: 'team', label: 'Team Members', component: OnboardingStepTeam, completed: false },
  { id: 'objectives', label: 'Objectives', component: OnboardingStepObjectives, completed: false },
  { id: 'key-results', label: 'Key Results', component: OnboardingStepKeyResults, completed: false }
])

const totalSteps = computed(() => steps.value.length)
const completedSteps = computed(() => steps.value.filter(s => s.completed).length)

async function checkStepCompletion() {
  try {
    // Check company
    const companyRes = await api.get('/company')
    if (companyRes.data && companyRes.data.name) {
      steps.value[0].completed = true
    }

    // Check departments
    const deptsRes = await api.get('/departments')
    if (deptsRes.data && deptsRes.data.length > 0) {
      steps.value[1].completed = true
    }

    // Check team members
    const usersRes = await api.get('/users')
    if (usersRes.data && usersRes.data.length > 0) {
      steps.value[2].completed = true
    }

    // Check objectives
    const objectivesRes = await api.get('/objectives')
    if (objectivesRes.data && objectivesRes.data.length > 0) {
      steps.value[3].completed = true
    }

    // Check key results (need to check if any objective has key results)
    if (objectivesRes.data && objectivesRes.data.length > 0) {
      const hasKeyResults = await Promise.all(
        objectivesRes.data.slice(0, 5).map(async (obj) => {
          try {
            const krRes = await api.get(`/objectives/${obj.id}/key-results`)
            return krRes.data && krRes.data.length > 0
          } catch {
            return false
          }
        })
      )
      if (hasKeyResults.some(Boolean)) {
        steps.value[4].completed = true
      }
    }
  } catch (error) {
    console.error('Error checking step completion:', error)
  }
}

function handleStepComplete(stepId) {
  const step = steps.value.find(s => s.id === stepId)
  if (step) {
    step.completed = true
  }
}

function handleDataUpdated() {
  checkStepCompletion()
}

onMounted(() => {
  checkStepCompletion()
})
</script>

