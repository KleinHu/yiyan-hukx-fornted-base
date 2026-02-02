// 数据字典类型记录
export interface DictTypeRecord {
  id?: string; // 字典主键
  name?: string; // 字典名称
  type?: string; // 字典类型
  status?: string; // 状态（0正常 1停用）
  remark?: string; // 备注
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
}

// 分页查询的参数
export interface DictTypeParams extends Partial<DictTypeRecord> {
  page: number;
  limit: number;
  // Partial携带具体查询条件
}

// 列表值
export interface DictTypeListRes {
  list: DictTypeRecord[];
  total: number;
}
