import { createRouter, createWebHistory } from 'vue-router';
import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css';

import { appRoutes } from './routes';
import { REDIRECT_MAIN, REDIRECT_BUFF, NOT_FOUND_ROUTE } from './routes/base';
import createRouteGuard from './guard';

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const constantRoutes = [
  {
    path: '/',
    redirect: 'login',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/sso-login',
    name: 'ssoLogin',
    component: () => import('@/views/login/sso-login/index.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/goto-login',
    name: 'gotoLogin',
    component: () => import('@/views/login/code-login/gotologin.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/code-login',
    name: 'codeLogin',
    component: () => import('@/views/login/code-login/index.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/token-login',
    name: 'tokenLogin',
    component: () => import('@/views/login/token-login/index.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/ticket-login',
    name: 'ticketLogin',
    component: () => import('@/views/login/ticket-login/index.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/switch-login',
    name: 'switchLogin',
    component: () => import('@/views/login/switch-login/index.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/outer-login',
    name: 'outerLogin',
    component: () => import('@/views/login/outer-login/index.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/failed-login',
    name: 'failedLogin',
    component: () => import('@/views/login/failed-login/index.vue'),
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/root-menu',
    name: 'rootMenu',
    component: () => import('@/views/root-menu/index.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  ...appRoutes,
  REDIRECT_MAIN,
  REDIRECT_BUFF,
  NOT_FOUND_ROUTE,
];

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior() {
    return { top: 0 };
  },
});

createRouteGuard(router);

export default router;
