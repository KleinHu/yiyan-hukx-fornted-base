// 待阅记录
export interface ToReadRecord {
  id?: string; //
  userId?: string; // 用于关联用户的外键
  title?: string; // 待阅标题
  description?: string; // 待阅描述
  systemId?: string; // 用于关联系统的外键
  systemName?: string; // 关联的系统名称
  readStatus?: string; // 阅读状态 0 false 未读 1 true 已读
  url?: string; // 跳转URL
  creator?: string; //
  createTime?: string; //
  updater?: string; //
  updateTime?: string; //
  updateIp?: string; //
  deleted?: string; //
  version?: string; //
  secretLevel?: string; // 数据密级(1:公开,2普通商密,3核心商密,4内部,5秘密,6机密,7绝密)
}

// 分页查询的参数
export interface ToReadParams extends Partial<ToReadRecord> {
  page: number;
  limit: number;
  // Partial携带具体查询条件
}

// 列表值
export interface ToReadListRes {
  list: ToReadRecord[];
  total: number;
}
