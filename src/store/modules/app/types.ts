import type { RouteRecordNormalized } from 'vue-router';

export interface AppState {
  theme: string;
  colorWeak: boolean;
  navbar: boolean;
  menu: boolean;
  topMenu: boolean;
  hideMenu: boolean;
  menuCollapse: boolean;
  footer: boolean;
  themeColor: string;
  menuWidth: number;
  circleWidth: number;
  globalSettings: boolean;
  device: string;
  tabBar: boolean;
  menuFromServer: boolean;
  serverMenu: RouteRecordNormalized[];
  menuPattern: number; // 0=简洁，1=标准（圆圈）
  captchaEnable: boolean; // 是否开启验证码
  captchaType: 'blockPuzzle' | 'clickWord'; // 验证码类别：滑动 | 图片点击
  // 系统密级,值参见@/constants/index.ts, SecretLevel
  secretLevel: number;
  [key: string]: unknown;
}
