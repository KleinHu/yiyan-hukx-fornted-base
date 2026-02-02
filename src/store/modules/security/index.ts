import { defineStore } from 'pinia';
import {
  login as userLogin,
  logout as userLogout,
  ssoLogin,
  getUserInfo,
  validateCode,
  validateToken,
  validateTicket,
  outerLogin,
} from '@/api/security';
import { LoginInfo } from '@/api/model/securityModel';
import { setToken, clearToken } from '@/utils/auth';
import { removeRouteListener } from '@/utils/route-listener';
import { UserState } from './types';
import useAppStore from '../app';

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    // 需要赋值的字段必须写在这里，哪怕值为undefined，否则会无法赋值！
    id: undefined,
    username: undefined,
    userCode: undefined,
    avatar: undefined,
    deptCode: undefined,
    address: undefined,
    email: undefined,
    deptId: undefined,
    mobile: undefined,
    title: undefined,
    // 密级
    secretLevel: undefined,
    mainOrgId: 0,
    role: '',
    // 路由权限
    menus: [],
    // 按钮权限
    permissions: [],
    roles: [],
  }),

  getters: {
    userInfo(state: UserState): UserState {
      return { ...state };
    },
  },

  actions: {
    switchRoles() {
      return new Promise((resolve) => {
        this.role = this.role === 'user' ? 'admin' : 'user';
        resolve(this.role);
      });
    },
    // Set user's information
    setInfo(partial: Partial<UserState>) {
      this.$patch(partial);
    },

    // Reset user's information
    resetInfo() {
      this.$reset();
    },

    // Get user's information
    async info() {
      const { data } = await getUserInfo();

      this.setInfo({
        ...data.user,
        menus: data.menus,
        roles: data.roles,
        permissions: data.permissions,
      });
    },

    // Login
    async login(loginForm: LoginInfo) {
      try {
        const { data } = await userLogin(loginForm);
        setToken(data.access_token);
      } catch (err) {
        clearToken();
        throw err;
      }
    },

    // 门户单点
    async ssoLogin(token: string) {
      try {
        const { data } = await ssoLogin(token);
        setToken(data.access_token);
      } catch (err) {
        clearToken();
        throw err;
      }
    },

    // token Login
    async tokenLogin(token: string) {
      try {
        setToken(token); // 这里拿到了token直接就存起来
      } catch (err) {
        clearToken();
        throw err;
      }
    },

    // 商网认证登录
    async ticketLogin(ticket: string) {
      try {
        const { data } = await validateTicket(ticket);
        if (data !== null) {
          setToken(data.access_token);
        } else {
          clearToken();
        }
      } catch (err) {
        clearToken();
        throw err;
      }
    },

    // 身份中台登录
    async codeLogin(code: string) {
      try {
        const { data } = await validateCode(code);
        if (data !== null) {
          setToken(data.access_token);
        } else {
          clearToken();
        }
      } catch (err) {
        clearToken();
        throw err;
      }
    },

    // 同一套易研服务下的不同应用间切换
    async switchLogin(token: string) {
      try {
        const { data } = await validateToken(token);
        if (data !== null) {
          setToken(data.access_token);
        } else {
          clearToken();
        }
      } catch (err) {
        clearToken();
        throw err;
      }
    },

    // 不同环境易研服务下的应用间切换
    async outerLogin(token: string) {
      try {
        const { data } = await outerLogin(token);
        if (data !== null) {
          setToken(data.access_token);
        } else {
          clearToken();
        }
      } catch (err) {
        clearToken();
        throw err;
      }
    },

    logoutCallBack() {
      const appStore = useAppStore();
      this.resetInfo();
      clearToken();
      removeRouteListener();
      appStore.clearServerMenu();
    },
    // Logout
    async logout() {
      try {
        await userLogout();
      } finally {
        this.logoutCallBack();
      }
    },
  },
});

export default useUserStore;
