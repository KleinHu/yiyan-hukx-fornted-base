export interface BpmImageFormData {
  COMPANY_ID_: string;
  CREATE_BY_: string;
  CREATE_BY_NAME: string;
  CREATE_DEP_ID_?: string;
  CREATE_TIME_: number[];
  ID_: string;
  INST_ID_: string;
  INST_STATUS_: string;
  PARENT_ID_: string;
  REF_ID_: string;
  TENANT_ID_: string;
  UPDATE_BY_?: string;
  UPDATE_BY_NAME?: string;
  UPDATE_TIME_?: string;
  UPDATE_VERSION_: number;
  // initData: { table1: {} };
  spr: string;
  sub__table1: string[];
  wlsmmc: string;
  wlswbb: string;
}

// 请求流程图用参数
export interface BpmImageParams {
  formData?: BpmImageFormData;
  instId?: string;
  defId?: string;
  preview: boolean;
  showHis: boolean;
}

// 请求流程图节点用参数
export interface BpmImageNodeParams {
  formData?: BpmImageFormData;
  instId?: string;
  defId?: string;
  nodeId: string;
}
