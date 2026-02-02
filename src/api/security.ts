import request from '@/utils/request/security';
import { getToken } from '@/utils/auth';
// import type { RouteRecordNormalized } from 'vue-router';
import { appKey, appSecret } from '@/config/settings.json';
import { LoginInfo, UserRes } from './model/securityModel';

export function login(data: LoginInfo) {
  // return request.post<LoginRes>('/oauth/token', data);
  return request({
    method: 'post',
    url: '/api/oauth/user/token',
    auth: {
      username: appKey,
      password: appSecret,
    },
    data,
  });
}

export function logout() {
  const token = getToken();
  return request.post('/api/oauth/logout', undefined, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getUserInfo() {
  const token = getToken();
  return request.get<UserRes>('/api/system/permission/info', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// export function getMenuList() {
//   return request.post<RouteRecordNormalized[]>('/api/user/menu');
// }

// 单点登录
export function ssoLogin(token: string) {
  return request({
    method: 'get',
    url: '/api/oauth/sso/token',
    auth: {
      username: appKey,
      password: appSecret,
    },
    params: { token },
  });
}

// 解析ticket, 得到token
export function validateTicket(ticket: string) {
  return request({
    method: 'get',
    url: '/api/oauth/sso/ticket/validation',
    params: { ticket },
  });
}

// 解析code, 得到access_token
export function validateCode(code: string) {
  return request({
    method: 'get',
    url: '/api/oauth/sso/szhk',
    auth: {
      username: appKey,
      password: appSecret,
    },
    params: { code },
  });
}

// 解析token, 得到另一个token
export function validateToken(token: string) {
  return request({
    method: 'get',
    url: '/api/oauth/sso/switch',
    auth: {
      username: appKey,
      password: appSecret,
    },
    params: { token },
  });
}

// 解析token, 得到另一个token（不同环境的易研服务）
export function outerLogin(token: string) {
  return request({
    method: 'get',
    url: '/api/oauth/sso/cacitcloud',
    auth: {
      username: appKey,
      password: appSecret,
    },
    params: { token },
  });
}
