import request from '@/utils/request/requestJpaas';
import {
  BpmTaskPageParams,
  BpmMyTaskPageParams,
  BpmTaskExecutorReq,
  BpmTaskFormUpdateReq,
  BpmTaskFormCompleteReq,
  BpmOpinionFormReq,
  BpmExecutorsFormReq,
  BpmTransferTaskReq,
  BpmRoamTaskReq,
  BpmAddSignReq,
} from './model/bpmTaskModel';

// 分页查询
export function queryBpmTaskPage(data: BpmTaskPageParams) {
  return request.post('/api-bpm/bpm/core/bpmTask/query', data);
}

// 分页查询我的待办
export function queryBpmMyTaskPage(data: BpmMyTaskPageParams) {
  return request.post('/api-bpm/bpm/core/bpmTask/myTasks', data);
}

// 驳回时选择可以驳回的节点
export function queryBackNodes(taskId: string) {
  return request.get(`/api-bpm/bpm/core/bpmTask/getBackNodes/${taskId}`);
}

// 设置执行人
export function updateBpmTaskAssignee(data: BpmTaskExecutorReq) {
  return request.post('/api-bpm/bpm/core/bpmTaskUser/setAssignee', data);
}

// 获取流程任务的明细
export function getBpmTaskDetail(taskId: string) {
  return request.get('/api-bpm/bpm/core/bpmTask/getTaskInfo', {
    params: { taskId },
  });
}

// 更新任务【锁定/解锁】状态
export function updateBpmTaskLocked(taskId: string) {
  return request.post('/api-bpm/bpm/core/bpmTask/getTaskInfo', undefined, {
    params: { taskId },
  });
}

// 取消流转
export function cancelBpmTaskRoam(taskId: string) {
  return request.get('/api-bpm/bpm/core/bpmTask/cancelTransRoamTask', {
    params: { taskId },
  });
}

// 流转
export function roamBpmTask(data: BpmRoamTaskReq) {
  return request.post('/api-bpm/bpm/core/bpmTask/transRoamTask', data);
}

// 流转情况查询
export function queryBpmTaskRoam(taskId: string) {
  return request.post('/api-bpm/bpm/core/bpmTask/getRoamTasks', undefined, {
    params: { taskId },
  });
}

// 转办
export function transferBpmTask(data: BpmTransferTaskReq) {
  return request.post('/api-bpm/bpm/core/bpmTask/transTask', data);
}

// 加签
export function addSignUser(data: BpmAddSignReq) {
  return request.post('/api-bpm/bpm/core/bpmTask/addSignUser', data);
}

// 保存单据数据
export function saveBpmTrackForm(data: BpmTaskFormUpdateReq) {
  return request.post('/api-bpm/bpm/core/bpmTask/saveFormData', data);
}

// 驳回单据数据
export function completeTask(data: BpmTaskFormCompleteReq) {
  return request.post('/api-bpm/bpm/core/bpmTask/completeTask', data);
}

// 获取当前用户后续的任务节点及执行人员
export function getTaskFlowNodesExecutors(data: BpmExecutorsFormReq) {
  return request.post(
    '/api-bpm/bpm/core/bpmTask/getTaskFlowNodesExecutors',
    data
  );
}

// 保存常用审批意见
export function opinionSave(data: BpmOpinionFormReq) {
  return request.post('/api-bpm/bpm/core/bpmOpinionLib/save', data);
}

// 获取常用审批意见
export function getOpinion() {
  return request.get('/api-bpm/bpm/core/bpmOpinionLib/getUserText');
}

// 删除常用审批意见
export function delOpinion(ids: string) {
  return request.post('/api-bpm/bpm/core/bpmOpinionLib/del', undefined, {
    params: { ids },
  });
}

// 保存暂存意见
export function saveTemporaryOpinion(
  taskId: string,
  opinion: string,
  id: string
) {
  return request.post(
    '/api-bpm/bpm/core/bpmTemporaryOpinion/saveOpinion',
    undefined,
    {
      params: { taskId, opinion, id },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
}
// 获取暂存意见
export function getTemporaryOpinion(taskId: string) {
  return request.get(
    '/api-bpm/bpm/core/bpmTemporaryOpinion/getTemporaryOpinion',
    {
      params: { taskId },
    }
  );
}
