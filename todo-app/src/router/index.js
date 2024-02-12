import { createRouter, createWebHashHistory } from 'vue-router'
import LoginForm from '../views/LoginForm.vue'
import RegistrationForm from '../views/RegistrationForm.vue'
import TodoPage from '../views/TodoPage'
import store from '../auth/store';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginForm },
  { path: '/register', component: RegistrationForm },
  {
    path: '/todos',
    component: TodoPage,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})


router.beforeEach((to, from, next) => {
  const requiresAuth = to.meta.requiresAuth;
  console.log(requiresAuth);
  console.log(store.state.auth.loggedIn);
  if (requiresAuth && !store.state.auth.loggedIn) {
    next('/login');
  } else {
    next();
  }
});
export default router
