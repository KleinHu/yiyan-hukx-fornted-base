import { AppRouteRecordRaw } from '../types';

const BlankPage = () => import('@/layout/blank-layout.vue');

const BPM: AppRouteRecordRaw = {
  path: '/bpm',
  name: 'bpmView',
  component: BlankPage,
  meta: {
    requiresAuth: true,
    hideInMenu: true,
  },
  children: [
    {
      path: 'bpm-instance-detail',
      name: 'BpmInstanceDetail',
      component: () => import('@/views/bpm/bpm-instance-detail/index.vue'),
      meta: {
        title: '流程详情',
        requiresAuth: true,
        hideInMenu: true,
      },
    },
    {
      path: 'bpm-instance-start',
      name: 'BpmInstanceStart',
      component: () => import('@/views/bpm/bpm-instance-start/index.vue'),
      meta: {
        title: '流程启动',
        requiresAuth: true,
        hideInMenu: true,
      },
    },
    {
      path: 'bpm-task-detail',
      name: 'BpmTaskDetail',
      component: () => import('@/views/bpm/bpm-task-detail/index.vue'),
      meta: {
        title: '流程任务处理',
        requiresAuth: true,
        hideInMenu: true,
      },
    },
  ],
};

export default BPM;
