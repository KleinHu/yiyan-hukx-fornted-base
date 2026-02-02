// 组织机构记录
export interface OrgRecord {
  id?: number; // 分布式id
  orgName?: string; // 组织机构名称
  orgCode?: string; // 组织机构编号
  parentId?: string; // 父结点id
  sort?: string; // 排序
  remark?: string; // 备用字段
  creator?: string; //
  createTime?: string; //
  updater?: string; //
  updateTime?: string; //
  updateIp?: string; //
  deleted?: string; //
  version?: string; //
  secretLevel?: string; // 数据密级(1:公开,2普通商密,3核心商密,4内部,5秘密,6机密,7绝密)
  departmentInfo?: OrgRecord; // 主管部门信息
}

// 分页查询的参数
export interface OrgParams extends Partial<OrgRecord> {
  page: number;
  limit: number;
  // Partial携带具体查询条件
}

// 列表值
export interface OrgListRes {
  list: OrgRecord[];
  total: number;
}
