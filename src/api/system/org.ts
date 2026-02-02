import request from '@/utils/request/request';
import { OrgRecord } from '@/api/system/model/orgModel';

// 查询组织机构的树形结构列表
export function queryOrgRecordTreeList(params: OrgRecord) {
  return request.get('/api/system/org/listTree', { params });
}

// 新增组织机构
export function addOrgRecord(data: OrgRecord) {
  return request.post('/api/system/org', data);
}

// 修改组织机构
export function editOrgRecord(data: OrgRecord) {
  return request.put('/api/system/org', data);
}

// 删除组织机构，传id数组，支持批量
export function deleteOrgRecords(data: any) {
  return request.delete('/api/system/org', { data }); // 这里data要用{}，否则会报错
}
