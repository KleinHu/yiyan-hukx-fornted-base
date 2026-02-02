import request from '@/utils/request/requestJpaas';
import {
  BpmTopNodeByCatKeyParams,
  BpmTopNodeByParentIdParams,
} from '@/api/bpm/model/bpmCategoryTreeModel';

// 根据模板id查询字段（列表）
export function getTreeCatByKey(catKey: string) {
  return request.get('/api-system/system/core/sysTreeCat/getTreeCatByKey/', {
    params: { catKey },
  });
}
export function getTopNodesByCatKey(params: BpmTopNodeByCatKeyParams) {
  return request.post(
    '/api-system/system/core/sysTree/getTopNodesByCatKey',
    undefined,
    { params }
  );
}

export function getCatByParentId(params: BpmTopNodeByParentIdParams) {
  return request.post(
    '/api-system/system/core/sysTree/getByParentId',
    undefined,
    { params }
  );
}
