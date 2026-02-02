import { defineStore } from 'pinia';
import DASHBOARD from '@/router/routes/modules/dashboard';
import BPM from '@/router/routes/modules/bpm';
import { REDIRECT_MAIN, REDIRECT_BUFF } from '@/router/routes/base';
// import { appRoutes } from '@/router/routes';
import { Router } from 'vue-router';
import { MenuState } from '../security/types';
import { PermissionState } from './type';

const Layout = () => import('@/layout/default-layout.vue');
const BlankPage = () => import('@/layout/blank-layout.vue');

const modules = import.meta.glob('/src/views/**/*.vue', {
  eager: true,
  import: 'default',
});

const loadView = async (component: string | undefined) => {
  if (component) {
    return modules[`/src/views/${component}.vue`];
  }
  return undefined;
};

const usePermissionStore = defineStore('menu', {
  state: (): PermissionState => ({
    routers: [], // 当前路由，用于菜单和router，= 模块 + 静态路由或 = 全 + 静态路由
    modules: [], // 全路由
    baseRouters: [...DASHBOARD, BPM, REDIRECT_MAIN, REDIRECT_BUFF],
    currentModule: undefined,
  }),

  getters: {
    serverMenu(state: PermissionState): PermissionState {
      return { ...state };
    },
  },

  actions: {
    clearMenu() {
      this.routers = [];
      this.modules = [];
      this.currentModule = undefined;
    },

    // 递归构建路由节点
    generateNode(tree: MenuState): any | undefined {
      const { name, path, code, component, icon, type, visible } = tree;
      if (type === 2) {
        // 菜单
        return {
          path: path || '',
          name: code,
          component: () => loadView(component),
          meta: {
            title: name,
            requiresAuth: true,
            icon: icon || undefined,
            hideInMenu: !visible,
          },
        };
      }
      // 目录
      if (tree.children && tree.children.length > 0) {
        // 二级目录，用空白路由页填充
        const children: any[] = [];
        const list = tree.children;
        list.forEach((e) => {
          const childNode = this.generateNode(e);
          if (childNode) {
            children.push(childNode);
          }
        });
        return {
          path: path || '',
          name: code,
          component: BlankPage,
          meta: {
            title: name,
            requiresAuth: true,
            icon: icon || undefined,
            hideInMenu: !visible,
          },
          children,
        };
      }
      return undefined;
    },

    // 构建路由树
    generateRoute(
      menus: MenuState[],
      router: Router | undefined = undefined
    ): any[] {
      this.clearMenu();
      const asyncRouters: any[] = [];
      menus.forEach((tree) => {
        const { name, path, code, icon, type, visible } = tree;
        if (type === 1) {
          // 目录f
          const children: any[] = [];
          if (tree.children && tree.children.length > 0) {
            tree.children.forEach((n) => {
              const node = this.generateNode(n);
              if (node) {
                children.push(node);
              }
            });
          }
          asyncRouters.push({
            name: code,
            path: path || '',
            meta: {
              title: name,
              requiresAuth: true,
              icon: icon || undefined,
              hideInMenu: !visible,
            },
            component: Layout,
            children,
          });
        }
      });
      this.modules = [...asyncRouters];
      this.routers = [...this.baseRouters, ...asyncRouters];
      if (router) {
        // 加入来自后端的动态路由
        asyncRouters.forEach((e) => {
          router.addRoute({ ...e, path: `/${e.path}` });
        });
      }

      return asyncRouters;
    },

    // 在主菜单选择一个模块跳转
    switchModules(module: string, router: Router) {
      // 移除现有的动态路由
      this.modules.forEach((e) => {
        if (e.name && router.hasRoute(e.name)) {
          router.removeRoute(e.name);
        }
      });

      // 重新构建动态路由
      const currentModule = this.modules.filter(
        (elem) => elem.name === module
      )[0];
      this.currentModule = currentModule;
      this.routers = [...this.baseRouters];
      if (currentModule?.children) {
        currentModule.children.forEach((elem: any) => {
          elem = { ...elem, path: `/${elem.path}`, component: Layout };
          router.addRoute(elem);
        });
        this.routers = [...this.baseRouters, ...currentModule.children];
      }
    },

    // 反查当前路由所在模块
    // routeName: to.name，去往路由的名字
    searchCurrentModules(routeName: string, router: Router) {
      const posibleModules = this.modules.filter((module) => {
        if (module.children?.length > 0) {
          const cloneRouters = [...module.children];
          while (cloneRouters.length) {
            const firstElement = cloneRouters.shift();
            if (firstElement?.name === routeName) {
              return true;
            }
            if (firstElement?.children) {
              cloneRouters.push(...firstElement.children);
            }
          }
        }
        return false;
      });
      if (posibleModules.length === 1) {
        this.switchModules(posibleModules[0].name as string, router);
        return true;
      }
      return false;
    },
  },
});

export default usePermissionStore;
