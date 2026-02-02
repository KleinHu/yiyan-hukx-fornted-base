import request from '@/utils/request/requestJpaas';
import { MyTurnToPageParams } from './model/bpmInstanceCcModel';

// 分页查询我的转发
export function queryMyTurnToPage(data: MyTurnToPageParams) {
  return request.post('/api-bpm/bpm/core/bpmInstCc/getMyTurnTo', data);
}

// 更新抄送状态为已读
export function updateReadStatus(cpId: string) {
  return request.post('/api-bpm/bpm/core/bpmInstCc/updRead', undefined, {
    params: { cpId },
  });
}

// 阅读明细
export function getByInstId(instId: string) {
  return request.post('/api-bpm/bpm/core/bpmInstCc/getByInstId', undefined, {
    params: { instId },
  });
}

// 分页查询收到的转发
export function queryMyReceiveCopyPage(params: MyTurnToPageParams) {
  return request.post('/api-bpm/bpm/core/bpmInstCc/myRecevieTurn', {
    ...params,
  });
}
