import request from '@/utils/request/request';
import requestForFile from '@/utils/request/requestForFile';
import { DeptListRes, DeptParams, DeptRecord } from './model/deptModel';

// 查询部门的树形结构列表
export function queryDeptRecordTreeList(params: any) {
  return request.get('/api/system/dept/listTree', { params });
}

// 分页查询部门列表
export function queryDeptRecordList(params: DeptParams) {
  return request.get<DeptListRes>('/api/system/dept/page', { params });
}

// 新增部门
export function addDeptRecord(data: DeptRecord) {
  return request.post('/api/system/dept', data);
}

// 修改部门
export function editDeptRecord(data: DeptRecord) {
  return request.put('/api/system/dept', data);
}

// 删除部门，传id数组，支持批量
export function deleteDeptRecords(data: any) {
  return request.delete('/api/system/dept', { data }); // 这里data要用{}，否则会报错
}

// 导出到Excel
export function exportDataToExcel() {
  // 文件导出接口要用专门的requestForFile，且要求responseType为blob才行
  return requestForFile.get('/api/system/dept/export', {
    responseType: 'blob',
  });
}

// 导入Excel
export function importExcelToData(data: FormData) {
  return request.post('/api/system/dept/import', data, {
    headers: {
      'Content-Type': 'application/form-data',
    },
  });
}
