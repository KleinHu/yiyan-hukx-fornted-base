export interface BpmTreeCategoryData {
  catId: string;
  companyId: string;
  createBy: string;
  createDepId: string;
  createTime: string;
  descp: string;
  key: string;
  name: string;
  pkId: string;
  sn: number;
  tenantId: string;
  updateBy: string;
  updateTime: string;
}

// 请求流程图用参数
export interface BpmTreeParams {
  catKey?: string;
}

export interface BpmTopNodeByCatKeyParams {
  catKey?: string;
  readKey?: string;
  isAdmin?: boolean;
  isGrant?: boolean;
  appId?: string;
  statisticConfig?: any;
}

export interface BpmTopNodeByParentIdParams {
  parentId?: string;
  catKey?: string;
  readKey?: string;
  isAdmin?: boolean;
  isGrant?: boolean;
  appId?: string;
  statisticConfig?: any;
}
