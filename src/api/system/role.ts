import request from '@/utils/request/request';
import {
  DataAuthParam,
  RoleListRes,
  RoleParams,
  RoleRecord,
} from './model/roleModel';

// 分页查询角色列表
export function queryRoleRecordPage(params: RoleParams) {
  return request.get<RoleListRes>('/api/system/role/page', {
    params,
  });
}

// 不分页查询角色列表
export function queryRoleRecordList(params: RoleRecord) {
  return request.get('/api/system/role/list', {
    params,
  });
}

// 保存角色
export function saveRoleRecord(data: RoleRecord) {
  return request.post('/api/system/role', {
    ...data,
  });
}

// 修改角色信息
export function updateRoleRecord(data: RoleRecord) {
  return request.put('/api/system/role', {
    ...data,
  });
}

// 删除角色
export function deleteRoleRecord(id: string) {
  return request.delete('/api/system/role', {
    data: id,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// 设置角色的数据权限
export function updateRoleDataAuth(data: DataAuthParam) {
  return request.post('/api/system/permission/assign-role-data-scope', {
    ...data,
  });
}
