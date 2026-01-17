<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Objectives</h2>
    <p class="text-gray-600 mb-6">Create objectives to track your company's goals and progress. Use the table below to add and edit objectives in bulk.</p>

    <!-- Table Editor -->
    <ObjectiveTableEditor
      :objectives="objectives"
      :simplified="true"
      :hide-existing="true"
      @saved="handleSaved"
      @data-updated="handleDataUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUsersStore } from '../../stores/users'
import { useObjectivesStore } from '../../stores/objectives'
import ObjectiveTableEditor from '../objectives/ObjectiveTableEditor.vue'
import api from '../../services/api'

const emit = defineEmits(['step-complete', 'data-updated'])

const usersStore = useUsersStore()
const objectivesStore = useObjectivesStore()
const objectives = ref([])

async function loadObjectives() {
  try {
    const response = await api.get('/objectives')
    objectives.value = response.data || []
    if (objectives.value.length > 0) {
      emit('step-complete', 'objectives')
    }
  } catch (error) {
    console.error('Error loading objectives:', error)
  }
}

function handleSaved() {
  loadObjectives()
  objectivesStore.fetchObjectives() // Refresh store
}

function handleDataUpdated() {
  loadObjectives()
  emit('data-updated')
}

onMounted(async () => {
  await usersStore.fetchUsers()
  // Try to fetch teams, fallback to departments
  try {
    if (usersStore.fetchTeams) {
      await usersStore.fetchTeams()
    } else {
      await usersStore.fetchDepartments()
    }
  } catch (error) {
    await usersStore.fetchDepartments()
  }
  await loadObjectives()
})
</script>

