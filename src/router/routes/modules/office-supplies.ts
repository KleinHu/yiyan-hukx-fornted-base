import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const OFFICE_SUPPLIES: AppRouteRecordRaw = {
  path: '/office-supplies',
  name: 'OfficeSupplies',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: 'menu.office-supplies',
    icon: 'icon-common',
    requiresAuth: true,
    order: 4,
  },
  children: [
    {
      path: 'overview',
      name: 'SuppliesOverview',
      component: () => import('@/views/office-supplies/overview/index.vue'),
      meta: {
        locale: 'menu.office-supplies.overview',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'item',
      name: 'SuppliesItem',
      component: () => import('@/views/office-supplies/item/index.vue'),
      meta: {
        locale: 'menu.office-supplies.item',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: 'user-apply',
      name: 'SuppliesUserApply',
      component: () => import('@/views/office-supplies/user-apply/index.vue'),
      meta: {
        locale: 'menu.office-supplies.user-apply',
        requiresAuth: true,
        roles: ['*'],
      },
    },
    {
      path: 'apply',
      name: 'SuppliesApply',
      component: () => import('@/views/office-supplies/apply/index.vue'),
      meta: {
        locale: 'menu.office-supplies.apply',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
    {
      path: 'inventory',
      name: 'SuppliesInventory',
      component: () => import('@/views/office-supplies/inventory/index.vue'),
      meta: {
        locale: 'menu.office-supplies.inventory',
        requiresAuth: true,
        roles: ['admin'],
      },
    },
  ],
};

export default OFFICE_SUPPLIES;
