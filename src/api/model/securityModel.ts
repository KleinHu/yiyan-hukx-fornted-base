// 登录参数
export interface LoginInfo {
  client_id?: string;
  client_secret?: string;
  grant_type?: string;
  username: string;
  password: string;
}

// 登录返回值
export interface LoginRes {
  access_token: string;
  token_tye: string;
  refresh_token: string;
  expoires_in: number;
  scope: string;
}

// 用户基本信息
export interface UserInfo {
  username?: string;
  avatar?: string;
  polity?: string;
  deptId?: string;
  address?: string;
  email?: string;
  nickname?: string;
  deptCode?: string;
  mobile?: string;
  entryTime?: string;
  birthday?: string;
  userCode?: string;
  title?: string;
}

// 菜单基本信息
export interface MenuInfo {
  component?: string;
  icon?: string;
  name: string;
  children?: MenuInfo[];
  permission?: string;
  path?: string;
  visible: boolean;
}

// 用户信息返回值
export interface UserRes {
  user: UserInfo;
  menus: MenuInfo[];
  permissions: string[];
  roles: string[];
}
