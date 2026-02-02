import type { Router, LocationQueryRaw } from 'vue-router';
import NProgress from 'nprogress'; // progress bar

import { useUserStore } from '@/store';
import usePermissionStore from '@/store/modules/permission';
import { isLogin } from '@/utils/auth';
import { NOT_FOUND_NAME, WHITE_LIST } from '../constants';

export default function setupUserLoginInfoGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start();
    const userStore = useUserStore();
    const permissionStore = usePermissionStore();
    const permissionAllowList = WHITE_LIST.filter(
      (elem) => elem.name !== NOT_FOUND_NAME
    );
    if (isLogin()) {
      if (
        userStore.userCode ||
        permissionAllowList.find((elem) => elem.name === to.name)
      ) {
        next();
      } else {
        // userStore中无userCode信息（即用户信息丢失）
        try {
          await userStore.info();

          permissionStore.generateRoute(userStore.menus || [], router);

          next();
        } catch (error) {
          await userStore.logout();
          next({
            name: 'login',
            query: {
              redirect: to.name,
              ...to.query,
            } as LocationQueryRaw,
          });
        }
      }
    } else {
      if (permissionAllowList.find((elem) => elem.name === to.name)) {
        next();
        return;
      }
      next({
        name: 'login',
        query: {
          redirect: to.name,
          ...to.query,
        } as LocationQueryRaw,
      });
    }
  });
}
