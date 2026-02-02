import request from '@/utils/request/requestJpaas';
import {
  BpmDefPageParams,
  JpaasSysCategoriesReq,
} from './model/bpmDefineModel';

// app下是否有流程分类
export function queryCategoriesByKey(params: JpaasSysCategoriesReq) {
  return request.post(
    '/api-system/system/core/sysTree/getByCatKey',
    undefined,
    {
      params,
    }
  );
}

// 分页查询
export function queryBpmDefPage(params: BpmDefPageParams) {
  return request.post('/api-bpm/bpm/core/bpmDef/query', {
    ...params,
  });
}

// 新建流程分页查询
export function queryBpmNewInstancePage(params: BpmDefPageParams) {
  return request.post('/api-bpm/bpm/core/bpmDef/getAllForStart', {
    ...params,
  });
}

// 保存
export function saveBpmDefPage(data: BpmDefPageParams) {
  return request.post('/api-bpm/bpm/core/bpmDef/save', data);
}
// 清除
export function clearInstByDefId(defId: string) {
  return request.post('/api-bpm/bpm/core/bpmDef/clearInstByDefId', undefined, {
    params: { defId },
  });
}
// 作废
export function discardInstByDefId(defId: string) {
  return request.post('/api-bpm/bpm/core/bpmDef/discard', undefined, {
    params: { defId },
  });
}
// 恢复
export function recoverInstByDefId(defId: string) {
  return request.post('/api-bpm/bpm/core/bpmDef/recover', undefined, {
    params: { defId },
  });
}
// 删除
export function removeBpmDef(ids: string) {
  return request.post('/api-bpm/bpm/core/bpmDef/del', undefined, {
    params: { ids },
  });
}

// 获取需要指定人员的流程节点
export function getStartUserNodes(defId: string, alias: string) {
  const data = {} as any;
  data[alias] = {};
  // data.outerForm = {};
  return request.post('/api-bpm/bpm/core/bpmDef/getStartUserNodes', data, {
    params: { defId },
  });
}

// 获取下一节点执行人
export function getFlowNodesExecutors(defId: string, alias: string) {
  const data = {} as any;
  data[alias] = {};
  return request.post('/api-bpm/bpm/core/bpmDef/getFlowNodesExecutors', data, {
    params: { defId },
  });
}
