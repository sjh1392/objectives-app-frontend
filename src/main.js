import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useCompanyStore } from './stores/company'
import './style.css'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Load auth state on app start
const authStore = useAuthStore()
authStore.loadFromStorage()

// Load company data from storage on app start (instant, no flash)
const companyStore = useCompanyStore()
companyStore.loadFromStorage()

app.mount('#app')

