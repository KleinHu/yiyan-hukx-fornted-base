// 数据字典详情记录
export interface DictDataRecord {
  id?: string; // 字典编码
  sort?: string; // 字典排序
  label?: string; // 字典标签
  value?: string; // 字典键值
  dictType?: string; // 字典类型
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
export interface DictDataParams extends Partial<DictDataRecord> {
  page: number;
  limit: number;
  // Partial携带具体查询条件
}

// 不分页查询的参数，带排序配置
export interface DictDataParamsSort extends Partial<DictDataRecord> {
  orderField: string; // 对哪个字段排序
  order: string; // 排序方式，分为asc升序 desc降序
  // Partial携带具体查询条件
}

// 列表值
export interface DictDataListRes {
  list: DictDataRecord[];
  total: number;
}
