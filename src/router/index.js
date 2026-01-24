import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
// import Dashboard from '../views/Dashboard.vue' // Removed - redirecting to Objectives
import ObjectivesList from '../views/ObjectivesList.vue'
import ObjectiveDetail from '../views/ObjectiveDetail.vue'
import Reports from '../views/Reports.vue'
import People from '../views/People.vue'
import PersonDetail from '../views/PersonDetail.vue'
import Departments from '../views/Departments.vue'
// import Structure from '../views/Structure.vue' // Merged into Departments
import Timeline from '../views/Timeline.vue'
import Integrations from '../views/Integrations.vue'
import Onboarding from '../views/Onboarding.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import VerifyEmail from '../views/VerifyEmail.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ResetPassword from '../views/ResetPassword.vue'
import AcceptInvitation from '../views/AcceptInvitation.vue'
import GoogleCallback from '../views/GoogleCallback.vue'
import Settings from '../views/Settings.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/auth/google/callback',
    name: 'GoogleCallback',
    component: GoogleCallback,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: VerifyEmail,
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPassword,
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { requiresGuest: true }
  },
  {
    path: '/invite/accept',
    name: 'AcceptInvitation',
    component: AcceptInvitation,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    redirect: '/objectives'
  },
  {
    path: '/objectives',
    name: 'ObjectivesList',
    component: ObjectivesList,
    meta: { requiresAuth: true }
  },
  {
    path: '/objectives/:id',
    name: 'ObjectiveDetail',
    component: ObjectiveDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports,
    meta: { requiresAuth: true }
  },
  {
    path: '/people',
    name: 'People',
    component: People,
    meta: { requiresAuth: true }
  },
  {
    path: '/people/:id',
    name: 'PersonDetail',
    component: PersonDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/departments',
    name: 'Departments',
    component: Departments,
    meta: { requiresAuth: true }
  },
  {
    path: '/structure',
    redirect: '/departments'
  },
  {
    path: '/timeline',
    name: 'Timeline',
    component: Timeline,
    meta: { requiresAuth: true }
  },
  {
    path: '/integrations',
    name: 'Integrations',
    component: Integrations,
    meta: { requiresAuth: true }
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: Onboarding,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Load auth state from storage if not already loaded
  if (!authStore.token && localStorage.getItem('authToken')) {
    authStore.loadFromStorage()
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Try to fetch current user to verify token
    if (authStore.token) {
      try {
        await authStore.fetchCurrentUser()
        next()
        return
      } catch (error) {
        // Token is invalid, redirect to login
        authStore.logout()
      }
    }
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'ObjectivesList' })
    return
  }
  
  next()
})

export default router

