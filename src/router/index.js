import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import ObjectivesList from '../views/ObjectivesList.vue'
import ObjectiveDetail from '../views/ObjectiveDetail.vue'
import Reports from '../views/Reports.vue'
import People from '../views/People.vue'
import PersonDetail from '../views/PersonDetail.vue'
import Departments from '../views/Departments.vue'
import Structure from '../views/Structure.vue'
import Integrations from '../views/Integrations.vue'
import Onboarding from '../views/Onboarding.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/objectives',
    name: 'ObjectivesList',
    component: ObjectivesList
  },
  {
    path: '/objectives/:id',
    name: 'ObjectiveDetail',
    component: ObjectiveDetail
  },
  {
    path: '/reports',
    name: 'Reports',
    component: Reports
  },
  {
    path: '/people',
    name: 'People',
    component: People
  },
  {
    path: '/people/:id',
    name: 'PersonDetail',
    component: PersonDetail
  },
  {
    path: '/departments',
    name: 'Departments',
    component: Departments
  },
  {
    path: '/structure',
    name: 'Structure',
    component: Structure
  },
  {
    path: '/integrations',
    name: 'Integrations',
    component: Integrations
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: Onboarding
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

