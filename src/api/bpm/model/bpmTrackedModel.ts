import { BpmInstRecord } from './bpmInstanceModel';

// 流程跟踪记录
export interface BpmMyTrackedRecord {
  appId: string;
  bpmInst: BpmInstRecord;
  companyId: string;
  createBy: string;
  createDepId: string;
  createTime: string;
  curNode: string;
  id: string;
  instId: string;
  pkId: string;
  tenantId: string;
  updateBy: string;
  updateTime: string;
}
export interface BpmMyTrackedParams {
  SUBJECT__S_LK?: string;
  CREATE_TIME__D_GT?: string;
  CREATE_TIME__D_LT?: string;
}

// 分页查询的参数
export interface BpmMyTrackedPageParams {
  pageNo: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  params: BpmMyTrackedParams;
}
