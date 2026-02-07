import { AppRouteRecordRaw } from '../types';

const BlankPage = () => import('@/layout/blank-layout.vue');

const WHITE_VIEWS: AppRouteRecordRaw = {
  path: '/ext',
  name: 'externalViews',
  component: BlankPage,
  meta: {
    requiresAuth: false,
    hideInMenu: true,
  },
  children: [
    {
      path: 'sixs-overview',
      name: 'SixSOverviewPublic',
      component: () => import('@/views/white/sixs/overview/index.vue'),
      meta: {
        title: '6S 管理概览',
        requiresAuth: false,
        hideInMenu: true,
      },
    },
  ],
};

export default WHITE_VIEWS;
