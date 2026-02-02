// 流程转办

// 流程转办记录
export interface myTransOutTaskRecord {
  appId: string;
  companyId: string;
  createBy: string;
  createDepId: string;
  createTime: string;
  id: string;
  instId: string;
  ownerid: string;
  pkId: string;
  subject: string;
  taskId: string;
  tenantId: string;
  toUserId: string;
  treeId: string;
  type: string;
  updateBy: string;
  updateTime: string;
}

// 查询参数
export interface BpmMyTransOutTaskParams {
  Q_SUBJECT__S_LK?: string;
  Q_CREATE_TIME__D_GE?: string;
  Q_CREATE_TIME__D_LE?: string;
}

// 取回操作
export interface BpmMyTrackedParams {
  opinion: string;
  msgTypes: string;
  taskId: string;
}

// 分页查询的参数
export interface BpmMyTrackedPageParams {
  pageNo: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  params: BpmMyTransOutTaskParams;
}
