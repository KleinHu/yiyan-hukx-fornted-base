import request from '@/utils/request/requestJpaas';
import {
  BpmInstPageParams,
  BpmInstStatusUpdateReq,
  BpmInstDraftUpdateReq,
  BpmInstDetailParams,
  BpmInstInfoParam,
  BpmInstStartReq,
  BpmInstVarUpdateParams,
  BpmInstVarRemoveParams,
  BpmMyEventPageParams,
  BpmMyApprovedPageParams,
  BpmInstCancelParams,
  BpmInstRevokeParams,
} from './model/bpmInstanceModel';

// 分页查询
export function queryBpmMyEventPage(params: BpmMyEventPageParams) {
  return request.post('/api-bpm/bpm/core/bpmInst/myBpmInsts', {
    ...params,
  });
}

// 分页查询
export function queryBpmInstPage(data: BpmInstPageParams) {
  return request.post('/api-bpm/bpm/core/bpmInst/query', data);
}

// 作废
export function cancelBpmInst(params: BpmInstCancelParams) {
  return request.post('/api-bpm/bpm/core/bpmInst/cancelProcess', undefined, {
    params,
  });
}
// 恢复
export function recoverInstByDefId(defId: string) {
  return request.post('/api-bpm/bpm/core/bpmInst/recover', undefined, {
    params: { defId },
  });
}
// 删除
export function removeBpmInst(ids: string) {
  return request.post('/api-bpm/bpm/core/bpmInst/del', undefined, {
    params: { ids },
  });
}
// 删除备份
export function removeBpmInstArchive(ids: string) {
  return request.post('/api-bpm/bpm/core/bpmInst/delArchive', undefined, {
    params: { ids },
  });
}
// 更新状态
export function updateBpmInstStatus(params: BpmInstStatusUpdateReq) {
  return request.post(
    '/api-bpm/bpm/core/bpmInst/updateProcessStatus',
    undefined,
    { params }
  );
}

// 根据action获取流程定义信息
export function getProcessonfigByDefKey(defKey: string) {
  return request.get('/api-bpm/bpm/core/bpmInst/getProcessConfigByKey', {
    params: { defKey },
  });
}

// 根据defKey、type、id获取流程实例信息（状态）
export function getInfoByDefKeyInstId(params: BpmInstInfoParam) {
  return request.post(
    '/api-bpm/bpm/core/bpmInst/getInfoByDefKeyInstId',
    undefined,
    { params }
  );
}

// 保存流程草稿
export function saveBpmInstDraft(data: BpmInstDraftUpdateReq) {
  return request.post('/api-bpm/bpm/core/bpmInst/saveDraft', data);
}

// 启动流程
export function startBpmProcess(data: BpmInstStartReq) {
  return request.post('/api-bpm/bpm/core/bpmInst/startProcess', data);
}

// 根据流程实例ID进行加密操作
export function getBpmInstEncrypt(instId: string) {
  return request.post(
    '/api-bpm/bpm/core/bpmInst/getBpmInstEncrypt',
    undefined,
    { params: { instId } }
  );
}

// 查询实例详情
export function getBpmInstDetail(params: BpmInstDetailParams) {
  return request.get('/api-bpm/bpm/core/bpmInst/getInstDetail', {
    params,
  });
}

// 查询实例审批历史
export function getBpmInstCheckHistory(instId: string) {
  return request.get('/api-bpm/bpm/core/bpmCheckHistory/getCheckHistorys', {
    params: { instId },
  });
}

// 取回流程
export function revokeBpmProcess(params: BpmInstRevokeParams) {
  return request.post('/api-bpm/bpm/core/bpmInst/revokeProcess', undefined, {
    params,
  });
}

// 分页查询：我的已办
export function queryBpmMyApprovedPage(params: BpmMyApprovedPageParams) {
  return request.post('/api-bpm/bpm/core/bpmCheckHistory/getMyApproved', {
    ...params,
  });
}

// 根据instId查询流程实例信息
export function getBpmInstOperateDetail(instId: string) {
  return request.get('/api-bpm/bpm/core/bpmInst/getInstDetailForInterpose', {
    params: { instId },
  });
}

// 根据actInstId查询流程变量
export function queryBpmInstVarsByActInst(actInstId: string) {
  return request.post('/api-bpm/bpm/core/bpmInst/listVars', undefined, {
    params: { actInstId },
  });
}

// 保存流程变量
export function updateBpmInstVars(params: BpmInstVarUpdateParams) {
  return request.post('/api-bpm/bpm/core/bpmInst/saveVarRow', undefined, {
    params,
  });
}

// 移除一个流程变量
export function removeBpmInstVars(params: BpmInstVarRemoveParams) {
  return request.post('/api-bpm/bpm/core/bpmInst/delVar', undefined, {
    params,
  });
}
