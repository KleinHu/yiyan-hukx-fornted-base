import request from '@/utils/request/requestJpaas';
import { BpmMyApprovedPageParams } from './model/bpmCheckHistoryModel';

// 分页查询我的审批
export function queryBpmMyApprovedPage(params: BpmMyApprovedPageParams) {
  return request.post('/api-bpm/bpm/core/bpmCheckHistory/getMyApproved', {
    ...params,
  });
}

// 查询流程实例的审批历史
export function getBpmInstCheckHistory(instId: string) {
  return request.get('/api-bpm/bpm/core/bpmCheckHistory/getCheckHistorys', {
    params: { instId },
  });
}
