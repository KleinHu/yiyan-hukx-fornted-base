import request from '@/utils/request/request';
import requestForFile from '@/utils/request/requestForFile';
import {
  UserListRes,
  UserParams,
  UserFilterParams,
  UserRecord,
  UserPasswordReq,
} from './model/userModel';

// 分页查询用户列表
export function queryUserRecordList(params: UserParams) {
  return request.get<UserListRes>('/api/system/user/page', { params });
}

// 全量查询用户列表
export function queryUserRecordListAll() {
  return request.get<any[]>('/api/system/user/list-all-simple');
}

// 分页查询用户列表并按最低密级过滤
export function querySecretUserRecordList(params: UserParams) {
  return request.get<UserListRes>('/api/system/select-model/user', { params });
}

// 过滤出符合密级的人员
export function filterUserRecordList(params: UserFilterParams) {
  return request.get('/api/system/select-model/user/filter', { params });
}

// 将流程中选择的角色转换为具体人员
export function transUserFromeRoles(ids: string) {
  return request.get('/api/system/permission/role-ids/users', {
    params: { ids },
  });
}

// 保存用户
export function saveUserRecord(data: UserRecord) {
  return request.post('/api/system/user', {
    ...data,
  });
}
// 导入用户
export function importUserRecord(data: FormData) {
  return request.post('/api/system/user/import', data, {
    headers: {
      'Content-Type': 'application/form-data',
    },
  });
}
// 下载导入用户的excel模板
export function downloadUserTemplate() {
  return requestForFile.get('/api/system/user/excel-template', {
    responseType: 'blob',
  });
}

// 修改用户信息
export function updateUserRecord(data: UserRecord) {
  return request.put('/api/system/user', {
    ...data,
  });
}

// 删除用户，传id数组，支持批量
export function deleteUserRecords(data: any) {
  return request.delete('/api/system/user', { data }); // 这里data要用{}，否则会报错
}

// 激活用户
export function activeUserRecord(data: UserRecord) {
  return request.post('/api/system/user/activate', data);
}
// 批量激活用户
export function activeUserBatch(ids: string[]) {
  return request.post('/api/system/user/activate-batch', ids);
}

// 禁用/启用用户
export function updateUserStatus(data: UserRecord) {
  return request.put('/api/system/user/status', data);
}

// 通过id获取用户信息
export function queryUserRecordById(id: string) {
  return request.get<UserRecord>(`/api/system/user/${id}`);
}

export function setUserSecretLevel(data: UserRecord) {
  return request.put('/api/system/user/secret-level', data);
}

export function updatePassword(data: UserPasswordReq) {
  return request.put('/api/system/user/password', data);
}
