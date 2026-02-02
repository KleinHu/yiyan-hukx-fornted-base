export type RoleType = '' | '*' | 'admin' | 'user';

export interface UserState extends UserInfoState {
  permissions?: string[];
  roles?: string[];
  menus?: MenuState[];
}

export interface UserInfoState {
  id?: string;
  username?: string;
  avatar?: string;
  polity?: string;
  deptId?: string;
  address?: string;
  email?: string;
  nickname?: string;
  deptCode?: string;
  mainOrgId?: number;
  mobile?: string;
  userCode?: string;
  title?: string;
  role: RoleType;
  secretLevel?: number;
}

export interface MenuState {
  component?: string;
  type?: number;
  icon?: string;
  name: string;
  children?: MenuState[];
  permission?: string;
  code?: string;
  path?: string;
  visible: boolean;
}
