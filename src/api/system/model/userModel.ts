// 用户记录
export interface UserRecord {
  id?: string; // 主键
  username?: string; // 用户账号
  userCode?: string; // 用户工号
  nickname?: string; // 用户昵称
  avatar?: string; // 头像地址
  category?: string; // 人员类别
  gender?: string; // 性别
  secretLevel?: number; // 数据密级(0:公开,5内部,6秘密,7机密,8绝密)
  idNumber?: string; // 身份证号
  degree?: string; // 学历
  mobile?: string; // 联系电话
  email?: string; // 用户邮箱
  deptCode?: string; // 部门编码
  birthday?: string; // 出生日期
  entryTime?: string; // 入职日期
  polity?: string; // 政治面貌
  title?: string; // 职称
  address?: string; // 地址
  activated?: string; // 是否激活
  status?: number; // 人员状态，默认0，正常
  remark?: string; // 备注
  orgId?: number; // 所属组织机构ID(多组织机构时需要,非必须)
  deptId?: string; // 所属部门ID(非必须)
  creator?: string; // 创建者
  createTime?: string; // 创建时间
  updater?: string; // 更新者
  updateTime?: string; // 更新时间
  updateIp?: string; // 更新ip
  deleted?: string; // 是否删除(非必须)
  version?: string; // 乐观锁
  tenantId?: string; // 租户编号
}

// 分页查询的参数
export interface UserParams extends Partial<UserRecord> {
  page: number;
  limit: number;
  // Partial携带具体查询条件
}

// 列表值
export interface UserListRes {
  list: UserRecord[];
  total: number;
}

// 修改密码实体
export interface UserPasswordReq {
  password: string;
  newPassword: string;
  id: string;
}

// 根据密级过滤人员
export interface UserFilterParams {
  secretLevel: number;
  userCodes: string;
}
