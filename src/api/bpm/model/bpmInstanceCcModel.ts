// 流程抄送

// 流程实例抄送信息
export interface instCp {
  appId: string;
  ccId: string;
  companyId: string;
  createBy: string;
  createDepId: string;
  createTime: string;
  id: string;
  instId: string;
  isRead: string;
  pkId: string;
  tenantId: string;
  updateBy: string;
  updateTime: string;
  userId: string;
}
// 我的抄送流程实例
export interface MyTurnToRecord {
  appId: string;
  ccType: string;
  companyId: string;
  createBy: string;
  createDepId: string;
  createTime: string;
  defId: string;
  fromUser: string;
  fromUserId: string;
  id: string;
  instCp: instCp;
  instId: string;
  nodeId: string;
  nodeName: string;
  pkId: string;
  subject: string;
  tenantId: string;
  treeId: string;
  updateBy: string;
  updateTime: string;
}
// 抄送查询条件
export interface MyTurnToParams {
  Q_SUBJECT__S_LK?: string;
  Q_TREE_ID__S_EQ?: string;
}
// 抄送分页查询的参数
export interface MyTurnToPageParams {
  pageNo: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  params: MyTurnToParams;
}
