import type { Router, RouteRecordNormalized } from 'vue-router';
import NProgress from 'nprogress'; // progress bar

import usePermission from '@/hooks/permission';
import { useUserStore, useAppStore, useTabBarStore } from '@/store';
import usePermissionStore from '@/store/modules/permission';
import { WHITE_LIST, NOT_FOUND, ROOT_MENU } from '../constants';

export default function setupPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const appStore = useAppStore();
    const tabBarStore = useTabBarStore();
    const userStore = useUserStore();
    const permissionStore = usePermissionStore();
    const Permission = usePermission();
    const permissionsAllow = Permission.accessRouter(to);
    if (appStore.menuFromServer) {
      // 针对来自服务端的菜单配置进行处理
      // Handle routing configuration from the server

      // 根据需要自行完善来源于服务端的菜单配置的permission逻辑
      // Refine the permission logic from the server's menu configuration as needed
      if (
        !permissionStore.routers.length &&
        !WHITE_LIST.find((el) => el.name === to.name)
      ) {
        // await appStore.fetchServerMenuConfig();
        // 构建路由树
        permissionStore.generateRoute(userStore.menus || [], router);
      }

      if (to.params.pathMatch) {
        // 动态路由加载未完成时，会把path当成路由参数并优先匹配到notFound页面
        // 此时需要通过path查找
        // 当菜单为两级分层的模式时，路由可能缺少一级，需要用末尾匹配
        const routeByPath = router
          .getRoutes()
          .filter(
            (e) =>
              e.path === to.path ||
              (appStore.menuPattern === 1 && e.path.endsWith(to.path))
          )[0];
        if (routeByPath?.name && routeByPath.name !== to.name) {
          // 若name匹配到notFound而path匹配到指定页面
          // 说明是动态路由页面尚未加载完成
          // 需要重定向到指定页面
          next({ ...to, name: routeByPath.name });
        } else {
          // 没有匹配到任何页面
          next(NOT_FOUND);
        }
      } else if (appStore.menuPattern === 1 && !permissionStore.currentModule) {
        // redirectName存在表示要绕开notFound
        // 根据menuPattern判断当前菜单是全菜单还是模块菜单
        // 若是模块菜单，还要找到页面对应模块并切换
        if (WHITE_LIST.find((el) => el.name === to.name)) {
          next();
        } else {
          const isFind = permissionStore.searchCurrentModules(
            to.name as string,
            router
          );
          if (!isFind) {
            // 跳转
            tabBarStore.resetTabList();
            next(ROOT_MENU);
          } else {
            next({ name: to.name as string });
          }
        }
      } else {
        let exist = false;
        // 白名单+动态路由
        const serverMenuConfig = [...permissionStore.routers, ...WHITE_LIST];

        while (serverMenuConfig.length && !exist) {
          // 在动态路由中匹配
          const element = serverMenuConfig.shift();
          if (element?.name === to.name) exist = true;

          if (element?.children) {
            serverMenuConfig.push(
              ...(element.children as unknown as RouteRecordNormalized[])
            );
          }
        }
        if (exist && permissionsAllow) {
          // 匹配成功且无需权限：放行
          next();
        } else next(NOT_FOUND);
      }
    } else {
      // 非动态路由：
      // 无需权限：放行
      // eslint-disable-next-line no-lonely-if
      if (permissionsAllow) next();
      else {
        // 需要权限：404
        const destination =
          // Permission.findFirstPermissionRoute(appRoutes, userStore.role) ||
          NOT_FOUND;
        next(destination);
      }
    }
    NProgress.done();
  });
}
