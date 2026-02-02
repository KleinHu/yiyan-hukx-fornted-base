// 角色记录
export interface RoleRecord {
  id?: string;
  name?: string;
  code?: string;
  remark?: string;
  dataScope?: string;
  orgId?: number;
  dataScopeDeptIds?: string[];
}

// 角色数据权限参数
export interface DataAuthParam {
  roleId?: string;
  dataScopeDeptIds?: string[];
  dataScope?: string;
}

// 分页查询的参数
export interface RoleParams extends Partial<RoleRecord> {
  page: number;
  limit: number;
  // Partial携带具体查询条件
}

// 列表值
export interface RoleListRes {
  list: RoleRecord[];
  total: number;
}
