import request from '@/utils/request/requestJpaas';
import { FormPcPageParams, FormPcCreateReq } from './model/formPcModel';

// 查询表单列表
export function queryFormPcPage(data: FormPcPageParams) {
  return request.post('/api-form/form/core/formPc/query', data);
}

// 查询指定表单
export function getFormPcById(pkId: string) {
  return request.get('/api-form/form/core/formPc/get', { params: { pkId } });
}

// 新建表单
export function createFormPc(data: FormPcCreateReq) {
  return request.post('/api-form/form/core/formPc/save', data);
}

// 删除表单
export function deleteFormPc(ids: string) {
  return request.post('/api-form/form/core/formPc/del', undefined, {
    params: { ids },
  });
}
