// 我的已办、审批记录、审批历史
import { TaskExecutor } from './bpmTaskModel';

// 审批历史记录
export interface BpmCheckHistoryRecord {
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
export interface BpmMyApprovedParams {
  Q_SUBJECT__S_LK?: string;
  Q_NODE_NAME__S_LK?: string;
  Q_CREATE_TIME__D_GE?: string;
  Q_CREATE_TIME__D_LE?: string;
}

// 分页查询的参数
export interface BpmMyApprovedPageParams {
  pageNo: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  params: BpmMyApprovedParams;
}
