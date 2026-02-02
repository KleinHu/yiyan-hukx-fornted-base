// 部门记录
export interface DeptRecord {
  id?: string; // 部门id
  name?: string; // 部门名称
  code?: string; // 部门编码
  parentId?: string; // 父部门id
  pids?: string; // 父级部门索引
  sort?: string; // 显示顺序
  leaderUserId?: string; // 负责人
  status?: string; // 部门状态（0正常 1停用）
  deptId?: string; // 所属部门ID(非必须)
  orgId?: string; // 所属组织机构ID(非必须)
  creator?: string; // 创建者
  createTime?: string; // 创建时间
  updater?: string; // 更新者
  updateTime?: string; // 更新时间
  updateIp?: string; // 更新ip
  deleted?: string; // 是否删除(非必须)
  secretLevel?: string; // 数据密级(非必须)(0:公开,5内部,6秘密,7机密,8绝密)
  version?: string; // 乐观锁
  tenantId?: string; // 租户编号
}

// 分页查询的参数
export interface DeptParams extends Partial<DeptRecord> {
  page: number;
  limit: number;
  // Partial携带具体查询条件
}

// 列表值
export interface DeptListRes {
  list: DeptRecord[];
  total: number;
}
