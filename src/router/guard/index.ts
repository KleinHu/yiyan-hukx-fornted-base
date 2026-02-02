import type { Router } from 'vue-router';
import { setRouteEmitter } from '@/utils/route-listener';
import setupUserLoginInfoGuard from './userLoginInfo';
import setupPermissionGuard from './permission';

function setupPageGuard(router: Router) {
  router.beforeEach(async (to) => {
    // emit route change
    setRouteEmitter(to);
  });
}

export default function createRouteGuard(router: Router) {
  setupPageGuard(router);

  // 守卫：是否能获取当前用户信息（是否登录）
  setupUserLoginInfoGuard(router);

  // 守卫：用户可访问路由权限
  setupPermissionGuard(router);
}
