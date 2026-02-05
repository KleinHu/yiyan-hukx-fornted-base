import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const SIXS: AppRouteRecordRaw = {
  path: '/sixs',
  name: 'sixs',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.sixs',
    requiresAuth: true,
    icon: 'icon-apps',
    order: 5,
  },
  children: [
    {
      path: 'overview',
      name: 'SixsOverview',
      component: () => import('@/views/sixs/overview/index.vue'),
      meta: {
        locale: 'menu.sixs.overview',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'account',
      name: 'SixsAccount',
      component: () => import('@/views/sixs/account/index.vue'),
      meta: {
        locale: 'menu.sixs.account',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'category',
      name: 'SixsCategory',
      component: () => import('@/views/sixs/category/index.vue'),
      meta: {
        locale: 'menu.sixs.category',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'check-record',
      name: 'SixsCheckRecord',
      component: () => import('@/views/sixs/check-record/index.vue'),
      meta: {
        locale: 'menu.sixs.checkRecord',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'score-record',
      name: 'SixsScoreRecord',
      component: () => import('@/views/sixs/score-record/index.vue'),
      meta: {
        locale: 'menu.sixs.scoreRecord',
        requiresAuth: true,
        roles: ['*'],
      },
    },
  ],
};

export default SIXS;
