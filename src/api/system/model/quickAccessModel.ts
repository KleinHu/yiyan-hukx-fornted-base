// 快捷入口记录

export interface QuickAccessRecord {
  id?: string; //
  name?: string; // 菜单中文名称
  path?: string; // 菜单路径
  personCode?: string; // 人员工号
  weight?: string; // 权重
  alternateField1?: string; // 备用字段1，存了icon名称
  alternateField2?: string; // 备用字段2
  alternateField3?: string; // 备用字段3
  creator?: string; // 创建者
  createTime?: string; // 创建时间
  updater?: string; // 更新者
  updateTime?: string; // 更新时间
  updateIp?: string; // 更新ip
  deleted?: string; // 是否删除(非必须)
  secretLevel?: string; // 数据密级(1:公开,2普通商密,3核心商密,4内部,5秘密,6机密,7绝密)
  version?: string; // 乐观锁
}

// 分页查询的参数
export interface QuickAccessParams extends Partial<QuickAccessRecord> {
  pageNo: number;
  pageSize: number;
  orderField: string; // 对哪个字段排序
  order: string; // 排序方式，分为asc升序 desc降序
  // Partial携带具体查询条件
}

// 列表值
export interface QuickAccessListRes {
  list: QuickAccessRecord[];
  total: number;
}
