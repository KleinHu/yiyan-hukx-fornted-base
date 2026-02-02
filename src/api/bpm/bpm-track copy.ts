import request from '@/utils/request/requestJpaas';
import { BpmMyTrackedPageParams } from './model/bpmTrackedModel';

// 跟踪流程或取消跟踪
export function trackBpmInst(instId: string) {
  return request.post('/api-bpm/bpm/core/bpmInstTracked/doTracked', undefined, {
    params: { instId },
  });
}

// 分页查询
export function queryBpmMyTrackedPage(params: BpmMyTrackedPageParams) {
  return request.post('/api-bpm/bpm/core/bpmInstTracked/getMyTracked', {
    ...params,
  });
}

// 取消跟踪
export function removeTracked(instId: string) {
  return request.post(
    '/api-bpm/bpm/core/bpmInstTracked/removeTracked',
    undefined,
    {
      params: { instId },
    }
  );
}
