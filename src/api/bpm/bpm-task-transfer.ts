import request from '@/utils/request/requestJpaas';
import {
  BpmMyTransOutTaskParams,
  BpmMyTrackedParams,
  BpmMyTrackedPageParams,
} from './model/bpmTaskTransferModel';

// 分页查询我的转办
export function querMyTransOutTaskdPage(params: BpmMyTransOutTaskParams) {
  return request.post('/api-bpm/bpm/core/bpmTaskTransfer/getMyTransOutTask', {
    ...params,
  });
}

// 取回任务获取通知方式
export function queryFileConfigRecordPage() {
  return request.get('/api-system/system/core/message/getMessageHandler');
}

// 取回任务
export function doRetrieveTask(data: BpmMyTrackedParams) {
  return request.post('/api-bpm/bpm/core/bpmTaskTransfer/doRetrieveTask', data);
}

// 分页查询收到的转办
export function queryMyReceiveTaskPage(params: BpmMyTrackedPageParams) {
  return request.post('/api-bpm/bpm/core/bpmTaskTransfer/getMyReceiveTask', {
    ...params,
  });
}
