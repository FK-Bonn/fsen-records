import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/vorankuendigung',
      name: 'vorankuendigung',
      component: () => import('../views/VorankuendigungView.vue'),
    },
    {
      path: '/bfsg',
      name: 'bfsg',
      component: () => import('../views/BfsgView.vue'),
    },
    {
      path: '/finanzuebersicht',
      name: 'finanzuebersicht',
      component: () => import('../views/FinancialStatusView.vue'),
      children: [
        {path: 'afsg', name: 'finanzuebersicht-afsg', component: () => import('../views/FinancialStatusAfsgView.vue')},
        {path: 'bfsg', name: 'finanzuebersicht-bfsg', component: () => import('../views/FinancialStatusBfsgView.vue')},
      ],
    },
    {
      path: '/hhp',
      name: 'hhp',
      component: () => import('../views/BudgetView.vue'),
    },
    {
      path: '/afsg-verteilung',
      name: 'afsg-verteilung',
      component: () => import('../views/FundsView.vue'),
    },
    {
      path: '/sitzungsprotokolle',
      name: 'sitzungsprotokolle',
      component: () => import('../views/ProceedingsView.vue'),
    },
    {
      path: '/waehlendenverzeichnisse',
      name: 'waehlendenverzeichnisse',
      component: () => import('../views/ElectoralRegistersView.vue'),
    },
    {
      path: '/diff/:dateStart/:dateEnd?',
      name: 'diff',
      component: () => import('../views/DiffView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/accounts',
      name: 'accounts',
      component: () => import('../views/AccountsView.vue'),
    },
    {
      path: '/accounts/create',
      name: 'accounts-create',
      component: () => import('../views/CreateAccountView.vue'),
    },
    {
      path: '/accounts/edit-permissions',
      name: 'accounts-edit-permissions',
      component: () => import('../views/EditPermissionsView.vue'),
    },
    {
      path: '/accounts/reset-password',
      name: 'accounts-reset-password',
      component: () => import('../views/ResetPasswordView.vue'),
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: () => import('../views/ChangePasswordView.vue'),
    },
    {
      path: '/logout',
      name: 'logout',
      component: () => import('../views/LogoutView.vue'),
    },
    {
      path: '/help',
      name: 'help',
      component: () => import('../views/HelpView.vue'),
    },
  ]
})

export default router
