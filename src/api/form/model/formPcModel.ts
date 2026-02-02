// 表单
export interface FormPcRecord {
  alias: string;
  appId: string;
  boDefAlias: string;
  bodefId?: string;
  buttonDef: string;
  categoryId: string;
  companyId?: string;
  component: string;
  copyed: number;
  createBy: string;
  createDepId: string;
  createTime: string;
  dataSetting: string;
  datasource: string;
  deployed: number;
  formBoDef?: string;
  formBoEntity?: string;
  formSettings: string;
  id: string;
  javascript?: string;
  javascriptKey?: string;
  javascriptTemp?: string;
  main: number;
  metadata?: string;
  metadataTemp?: string;
  mobileJavascript?: string;
  name: string;
  opinionDef: string;
  permissionR?: string;
  permissionW?: string;
  pkField?: string;
  pkId: string;
  tabDef: string;
  tableButtonDef: string;
  template?: string;
  templateTemp?: string;
  tenantId: string;
  type: string;
  updateBy?: string;
  updateTime: string;
  urlParams: string;
  version: number;
  wizard: number;
}
export interface FormPcParams {
  Q_TO_AUTH_USER_NAME__S_LK?: string;
}

// 分页查询的参数
export interface FormPcPageParams {
  pageNo: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: string;
  params: FormPcParams;
}

export interface FormPcListRes {
  data: FormPcRecord[];
  totalCount: number;
  totalPage: number;
  pageNo: number;
  pageSize: number;
}

// 创建表单
export interface FormPcCreateReq {
  alias: string;
  //   appId:string;
  boDefAlias: '-1';
  categoryId: string;
  component: string;
  deployed: '1';
  main?: string;
  name: string;
  type: 'OUTSIDE-URL';
  urlParams?: string;
  version?: string;
}

// url上传给表单的参数
export interface FormParam {
  paramType: boolean;
  paramKey: string;
  paramKeyVal: string;
}
