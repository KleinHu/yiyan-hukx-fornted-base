import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const DASHBOARD: AppRouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DEFAULT_LAYOUT,
    meta: {
      locale: 'menu.dashboard',
      requiresAuth: true,
      icon: 'icon-dashboard',
      order: 0,
      compress: true,
    },
    children: [
      {
        path: 'workplace',
        name: 'Workplace',
        component: () => import('@/views/dashboard/workplace/index.vue'),
        meta: {
          locale: 'menu.dashboard.workplace',
          icon: 'icon-dashboard',
          requiresAuth: true,
          roles: ['*'],
        },
      },
    ],
  },
  {
    path: '/process',
    name: 'process',
    component: DEFAULT_LAYOUT,
    meta: {
      title: '流程工作台',
      requiresAuth: true,
      roles: ['*'],
      icon: 'icon-list',
    },
    children: [
      {
        path: 'my-task',
        name: 'MyTask',
        component: () => import('@/views/dashboard/bpm/my-task/index.vue'),
        meta: {
          title: '我的待办',
          requiresAuth: true,
          roles: ['*'],
        },
      },
      {
        path: 'my-approved',
        name: 'MyApproved',
        component: () => import('@/views/dashboard/bpm/my-approved/index.vue'),
        meta: {
          title: '我的已办',
          requiresAuth: true,
          roles: ['*'],
        },
      },
      {
        path: 'my-Event',
        name: 'MyEvent',
        component: () =>
          import('@/views/dashboard/bpm/my-bpm-instance-list/index.vue'),
        meta: {
          title: '我的申请',
          requiresAuth: true,
          roles: ['*'],
        },
      },
      {
        path: 'my-Tracked',
        name: 'MyTracked',
        component: () => import('@/views/dashboard/bpm/my-tracked/index.vue'),
        meta: {
          title: '我的跟踪',
          requiresAuth: true,
          roles: ['*'],
        },
      },
      {
        path: 'my-trans-out-task',
        name: 'MyTransOutTask',
        component: () =>
          import('@/views/dashboard/bpm/my-trans-out-task/index.vue'),
        meta: {
          title: '我的转办',
          requiresAuth: true,
          roles: ['*'],
        },
      },
      {
        path: 'my-receive-task',
        name: 'MyReceiveTask',
        component: () =>
          import('@/views/dashboard/bpm/my-receive-task/index.vue'),
        meta: {
          title: '收到的转办',
          requiresAuth: true,
          roles: ['*'],
        },
      },
      {
        path: 'my-turn-to',
        name: 'MyTurnTo',
        component: () => import('@/views/dashboard/bpm/my-turn-to/index.vue'),
        meta: {
          title: '我的抄送',
          requiresAuth: true,
          roles: ['*'],
        },
      },
      {
        path: 'my-receive-copy',
        name: 'MyReceiveCopy',
        component: () =>
          import('@/views/dashboard/bpm/my-receive-copy/index.vue'),
        meta: {
          title: '收到的抄送',
          requiresAuth: true,
          roles: ['*'],
        },
      },
    ],
  },
];

export default DASHBOARD;
