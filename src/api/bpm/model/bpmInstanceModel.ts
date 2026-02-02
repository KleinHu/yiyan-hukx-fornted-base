import { TaskExecutor } from './bpmTaskModel';

export interface BpmInstRecord {
  actDefId: string;
  actInstId: string;
  appId: string;
  applicantName: string;
  applicantNo: string;
  billNo: string;
  billType: string;
  busKey: string;
  checkFileId: string;
  companyId: string;
  createBy: string;
  createDepId: string;
  createTime: string;
  dataSaveMode: string;
  defCode: string;
  defId: string;
  endTime: string;
  errors: string;
  fieldJson: string;
  formSolutionAlias: string;
  formType: string;
  instId: string;
  instNo: string;
  isLive: string;
  isTest: string;
  liveInstId: string;
  lockedBy: string;
  parentActInstId: string;
  pkId: string;
  startDepFull: string;
  startDepId: string;
  status: string;
  subject: string;
  supportMobile: string;
  tenantId: string;
  treeId: string;
  updateBy: string;
  updateTime: string;
  version: number;
}
export interface BpmInstParams {
  BILL_NO__S_LK?: string;
  STATUS__S_EQ?: string;
  CREATE_TIME__D_GT?: string;
  CREATE_TIME__D_LT?: string;
  tableId?: string;
}

// 分页查询的参数
export interface BpmInstPageParams {
  pageNo: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  params: BpmInstParams;
}

export interface BpmInstListRes {
  data: BpmInstRecord[];
  totalCount: number;
  totalPage: number;
  pageNo: number;
  pageSize: number;
}

// 流程状态更新
export interface BpmInstStatusUpdateReq {
  instId: string;
  status: string;
}

// 保存草稿更新
export interface BpmInstDraftUpdateReq {
  formJson: string;
  defId: string;
  instId?: string;
  systemHand?: boolean;
}

// 作废流程实例
export interface BpmInstCancelParams { 
  reason?: string;
  instId: string;
}

// 取回流程
export interface BpmInstRevokeParams {
  opinion: string;
  instId: string;
  from: string;
}

// 发起流程
export interface BpmInstStartReq {
  formJson: string;
  defId: string;
  instId?: string;
  checkType: 'AGREE';
  systemHand: boolean;
}

// 查询流程实例详情
export interface BpmInstDetailParams {
  instId: string;
  from: string;
}

// 获取流程实例状态
export interface BpmInstInfoParam {
  type: string;
  id: string;
  action?: string;
  taskId?: string;
}

// 审批历史记录
export interface BpmInstCheckRecord {
  actDefId: string;
  actTaskId?: string;
  agentUserId?: string;
  appId: string;
  applicantName?: string;
  applicantNo?: string;
  checkStatus: string;
  companyId: string;
  completeTime: string;
  createBy: string;
  createDepId?: string;
  createTime: string;
  duration: number;
  durationVal?: string;
  enableMobile?: string;
  handleDepFull?: string;
  handleDepId?: string;
  handlerId: string;
  handlerUserDeptName?: string;
  handlerUserName: string;
  handlerUserNo?: string;
  handlerUserPhoto: string;
  handlerUserSex: string;
  hisId: string;
  instId: string;
  isHidden: string;
  jumpType: string;
  jumpTypeName: string;
  linkUpUserIds: string;
  linkUpUsers?: string;
  nodeId: string;
  nodeName: string;
  opFiles: string[];
  opinionName: string;
  ownerId: string;
  pkId: string;
  relInsts: string;
  remark: string;
  subject: string;
  taskExecutors?: TaskExecutor[];
  taskId: string;
  tenantId: string;
  transferorId: string;
  transferorName: string;
  treeId: string;
  updateBy?: string;
  updateTime: string;
}

// 流程变量
export interface BpmInstVarRecord {
  idx?: number;
  key: string;
  type: string;
  val: string;
}

// 保存流程变量
export interface BpmInstVarUpdateParams {
  actInstId: string;
  data: string;
}

// 删除流程变量
export interface BpmInstVarRemoveParams {
  actInstId: string;
  varKey: string;
}

// 查我的流程
export interface BpmMyEventParams {
  BILL_NO__S_EQ?: string;
  STATUS__S_EQ?: string;
  VERSION__I_EQ?: string;
  Q_SUBJECT__S_LK?: string;
  CREATE_TIME__D_GE?: string;
  CREATE_TIME__D_LE?: string;
}

// 查我的流程分页查询的参数
export interface BpmMyEventPageParams {
  pageNo: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  params: BpmMyEventParams;
  CREATE_TIME__D_GE?: any;
  CREATE_TIME__D_LE?: any;
}

// 我的已办
export interface BpmMyApprovedParams {
  Q_SUBJECT__S_LK?: string;
  Q_NODE_NAME__S_LK?: string;
  Q_CREATE_TIME__D_GE?: string;
  Q_CREATE_TIME__D_LE?: string;
}

// 我的已办分页查询的参数
export interface BpmMyApprovedPageParams {
  pageNo: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  params: BpmMyApprovedParams;
}
