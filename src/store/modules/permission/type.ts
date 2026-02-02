import type { RouteRecordNormalized } from 'vue-router';

export interface PermissionState {
  routers: RouteRecordNormalized[];
  modules: RouteRecordNormalized[];
  baseRouters?: any;
  currentModule?: RouteRecordNormalized;
}
