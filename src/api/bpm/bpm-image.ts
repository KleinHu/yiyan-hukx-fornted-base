import request from '@/utils/request/requestJpaas';
import { BpmImageParams, BpmImageNodeParams } from './model/bpmImageModel';

// 查询流程图
export function getBpmnXmlFromParam(params: BpmImageParams) {
  return request.post('/api-bpm/bpm/core/bpmImage/getBpmnXmlFromParam', {
    ...params,
  });
}

// 查询流程图节点（审批）信息
export function getBpmnImageNodeInfo(params: BpmImageNodeParams) {
  return request.post('/api-bpm/bpm/core/bpmImage/getBpmnImageNodeInfo', {
    ...params,
  });
}
