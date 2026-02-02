import { FormPcRecord } from '@/api/form/model/formPcModel';
import { BpmTaskSwitchOption } from '@/api/bpm/model/bpmTaskModel';

export interface BpmDefRecord {
  actDefId: string;
  actDepId: string;
  appId: string;
  boDefIds: string;
  color: string;
  companyId: string;
  createBy: string;
  createDepId: string;
  createTime: string;
  defId: string;
  deploy: string;
  descp: string;
  designXml: string;
  designXmlTemp: string;
  extConfs: string;
  extConfsTemp: string;
  formal: string;
  icon: string;
  isMain: string;
  key: string;
  mainDefId: string;
  name: string;
  pkId: string;
  status: string;
  tenantId: string;
  treeId: string;
  updateBy: string;
  updateTime: string;
  version: number;
}
export interface BpmDefParams {
  Q_STATUS__S_EQ?: string;
  Q_KEY__S_LK?: string;
  Q_NAME__S_LK?: string;
}

// 分页查询的参数
export interface BpmDefPageParams {
  pageNo: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  params: BpmDefParams;
}

export interface BpmDefListRes {
  data: BpmDefRecord[];
  totalCount: number;
  totalPage: number;
  pageNo: number;
  pageSize: number;
}

export interface JpaasSysCategoriesReq {
  catKey: string;
  readKey: string;
  isAdmin: boolean;
  isGrant: boolean;
  appId?: string;
}

// 流程表单配置
export interface BpmFormRecord {
  formpc: FormPcRecord[];
  mobile: FormPcRecord[];
}

export type BpmStartNodeOption =
  | 'skipFirstNode' // 跳过第一个节点
  | 'startConfirm' // 启动需要确认
  | 'fillOpinion' // 启动可填写意见
  | 'assignFlowUsers' // 指定节点执行人
  | 'relInsts' // 关联流程
  | 'startCalFlowusers'; // 计算后续执行人

// 流程定义详细配置
export interface BpmDefConfigRecord {
  defId: string;
  startNodeOptions: BpmStartNodeOption[]; // 开始节点配置（全局配置-参数）
  allowSelectPath: boolean;
  startForm: BpmFormRecord;
  globalForm: BpmFormRecord;
  detailForm: BpmFormRecord;
  switchOptions: BpmTaskSwitchOption[];
}
