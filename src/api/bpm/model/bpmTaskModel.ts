import { FormPcRecord } from '@/api/form/model/formPcModel';

export interface TaskExecutor {
  type: string;
  id: string;
  name: string;
  account: string;
  calcType: string;
}

export interface BpmTaskRecord {
  actDefId: string;
  actInstId: string;
  actTaskId: string;
  appId: string;
  applicantName: string;
  applicantNo: string;
  assignee: string;
  billNo: string;
  billType: string;
  bpmCheckHistory: string;
  busKey: string;
  companyId: string;
  createBy: string;
  createDepId: string;
  createTime: string;
  defId: string;
  descp: string;
  executionId: string;
  executor: string;
  expiredTime: string;
  formJson: string;
  hasCandicate: boolean;
  instId: string;
  key: string;
  name: string;
  owner: string;
  parentId: string;
  pkId: string;
  preTaskId: string;
  priority: string;
  status: string;
  subject: string;
  taskExecutors: TaskExecutor[];
  taskId: string;
  taskType: string;
  tenantId: string;
  treeId: string;
  updateBy: string;
  updateTime: string;
}

export interface BpmTaskParams {
  STATUS__S_EQ?: string;
  BILL_NO__S_EQ?: string;
  EXECUTOR__S_EQ?: string;
  CREATE_TIME__D_GT?: string;
  CREATE_TIME__D_LT?: string;
}

// 分页查询的参数
export interface BpmTaskPageParams {
  pageNo: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  params: BpmTaskParams;
}

export interface BpmTaskListRes {
  data: BpmTaskRecord[];
  totalCount: number;
  totalPage: number;
  pageNo: number;
  pageSize: number;
}

// 设置执行人
export interface BpmTaskExecutorReq {
  bpmTask: BpmTaskRecord;
  userIds: string[];
}

// 我的待办查询表单的参数
// 正常参数无法带'.'号
export interface BpmMyTaskFormParams {
  SUBJECT__S_LK?: string;
  BILL_NO__S_LK?: string;
  NAME__S_LK?: string;
  CREATE_TIME__D_GE?: string;
  CREATE_TIME__D_LE?: string;
}

// 我的待办查询参数
export interface BpmMyTaskParams {
  'Q_v.SUBJECT__S_LK'?: string;
  'Q_v.BILL_NO__S_LK'?: string;
  'Q_v.NAME__S_LK'?: string;
  'Q_v.CREATE_TIME__D_GE'?: Date;
  'Q_v.CREATE_TIME__D_LE'?: Date;
}

// 分页查询的参数
export interface BpmMyTaskPageParams {
  pageNo: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  params: BpmMyTaskParams;
}

// 保存表单
export interface BpmTaskFormUpdateReq {
  taskId: string;
  systemHand: boolean;
  formJson: string;
}

// 提交表单
export interface BpmTaskFormCompleteReq {
  taskId: string;
  checkType: string;
  opinion: string;
  msgTypes?: string;
  copyUserAccounts?: string;
  opinionName?: string;
  opFiles?: string;
  formJson?: string;
  nextJumpType?: string;
  destNodeId?: string;
  nodeExecutors?: any;
  systemHand?: boolean;
  relInsts?: string;
}

// 添加意见表单
export interface BpmOpinionFormReq {
  opText: string;
}

// 后续的任务节点及执行人员表单
export interface BpmExecutorsFormReq {
  taskId: string;
  checkType: string;
  formData: any;
  systemHand: boolean;
}

// 转办人
interface TransferUser {
  name: string;
  id: string;
}
// 转办
export interface BpmTransferTaskReq {
  msgType: string;
  msgTypes: string[];
  opinion: string;
  subject: string;
  taskId: string;
  toUser: TransferUser[];
}

// 加签
export interface BpmAddSignReq {
  taskId: string;
  opinion: string;
  toUserIds: string;
}

// 流转
export interface BpmRoamTaskReq {
  msgType: string;
  msgTypes: string[];
  subject: string;
  taskId: string;
  toUser: TransferUser[];
  approveType: 'sequential' | 'parallel';
  opinion: string;
  completeType: number;
  completeJudgeType: 'voteCount' | 'votePercent';
  completeSetting: number;
}

// 暂存意见表单
export interface TemporaryOpinion {
  taskId: string;
  opinion: string;
  id: string;
}

// 流程表单配置
export interface BpmTaskFormRecord {
  formpc?: FormPcRecord[];
  mobile?: FormPcRecord[];
}
export type BpmTaskSwitchOption =
  | 'allowDefButtons' // 允许自定义审批按钮
  | 'allowSelectExecutor' // 允许选择执行人
  | 'allowExecutorNull' // 允许执行人为空
  | 'allowAddSign' // 允许加签
  | 'precedenceConfig' // 优先从配置中获取执行人
  | 'notAllowBatch' // 不允许批量审批
  | 'singleExecutor' // 单选(选择执行人)
  | 'quickApprove' // 快速审批
  | 'showMoreOptions'; // 更多选项

// 流程实例详情
export interface BpmTaskConfigRecord {
  alias: string;
  form: BpmTaskFormRecord;
  switchOptions: BpmTaskSwitchOption[];
}

// 流程节点记录
export interface BpmTaskNodeRecord {
  actDefId: string;
  actInstId: string;
  assignee: string;
  companyId: string;
  createBy: string;
  createDepId: string;
  createTime: string;
  defId: string;
  endTime: number;
  executionId: string;
  instId: string;
  jumpType: string;
  level: number;
  multipleType: string;
  nextJumpType?: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  outTranId?: string;
  parentId: string;
  pathId: string;
  pkId: string;
  refPathId?: string;
  startTime: number;
  tenantId: string;
  toUserId?: string;
  token?: string;
  updateBy: string;
  updateTime: string;
  userIds?: string;
}
