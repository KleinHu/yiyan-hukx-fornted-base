/**
 * 人事管理相关类型定义
 */
/* eslint-disable no-shadow */

/**
 * API响应基础结构
 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T | null;
  timestamp: number;
}

/**
 * 分页结果结构
 */
export interface PageResult<T = unknown> {
  list: T[];
  total: number;
}

/**
 * 员工信息接口（对应 employees 表）
 */
export interface Employee {
  userCode: string; // 工号（主键）
  userName: string; // 姓名
  jobTitle?: string; // 职位名称（如：高级Java开发工程师）
  departmentId?: string; // 所属科室ID（VARCHAR(36)）
  departmentName?: string; // 部门名称（关联查询）
  rankId?: string; // 当前职级ID（VARCHAR(36)）- 公司内部职级
  rankName?: string; // 职级名称（关联查询）
  professionalTitleId?: string; // 职称ID（VARCHAR(36)）- 专业技术职称
  professionalTitleName?: string; // 职称名称（如：工程师、高级工程师）
  officeLocation?: string; // 办公位置
  mobile?: string; // 手机号
  email?: string; // 企业邮箱
  idCardNo?: string; // 身份证号
  hireDate?: string; // 入职公司时间（DATE）
  transferDate?: string; // 调入专业厂时间（DATE）
  birthDate?: string; // 出生日期（DATE）
  gender?: number; // 性别: 1-男, 2-女
  genderName?: string; // 性别名称（前端展示用）
  maritalStatus?: number; // 婚姻状况: 1-未婚, 2-已婚, 3-离异, 4-丧偶
  maritalStatusName?: string; // 婚姻状况名称
  politicalStatus?: number; // 政治面貌: 1-党员, 2-积极分子, 3-群众
  politicalStatusName?: string; // 政治面貌名称
  status?: number; // 在职状态: 1-试用, 2-正式, 3-离职, 4-退休, 5-顶岗实习
  statusName?: string; // 状态名称
  isRepresentative?: boolean; // 是否职工代表
  isTeamLeader?: boolean; // 是否担任工组长
  sourceType?: number; // 来源类型（tinyint）：1-校园招聘 2-社会招聘 3-内部推荐 4-劳务派遣 5-其他
  sourceName?: string; // 来源地（展示用，关联查询或前端根据 sourceType 带出）
  // 兼容字段（保留旧字段以兼容现有代码）
  id?: number; // 兼容字段
  position?: string; // 兼容字段，等同于jobTitle
  level?: string; // 兼容字段，等同于rankName
  entryDate?: string; // 兼容字段，等同于hireDate
  workStatus?: number; // 兼容字段，等同于status
  workStatusName?: string; // 兼容字段，等同于statusName
  phone?: string; // 兼容字段，等同于mobile
  avatarUrl?: string; // 头像URL（业务扩展字段）
  idCardPhotoUrl?: string; // 证件照URL（业务扩展字段）
  address?: string; // 地址（业务扩展字段）
  emergencyContact?: string; // 兼容字段（应使用emergency_contacts表）
  emergencyPhone?: string; // 兼容字段（应使用emergency_contacts表）
  remark?: string; // 备注（业务扩展字段）
  officeFloor?: string; // 办公楼层（兼容字段）
  officeRoom?: string; // 办公室编号（兼容字段）
  creator?: string; // 创建人(user_code)
  createTime?: Date | string; // 创建时间
  updater?: string; // 更新人(user_code)
  updateTime?: Date | string; // 更新时间
  updateIp?: string; // 更新IP
  isDeleted?: number; // 逻辑删除: 0-未删, 1-已删
  creatorId?: number; // 兼容字段
  creatorName?: string; // 兼容字段
  updaterId?: number; // 兼容字段
  updaterName?: string; // 兼容字段
  deleted?: number; // 兼容字段，等同于isDeleted
}

/**
 * 员工列表简化项（用于列表展示,只包含必要字段）
 */
export interface EmployeeListItem {
  userCode: string; // 工号
  userName: string; // 姓名
  departmentName?: string; // 部门名称
  status?: number; // 在职状态: 1-试用, 2-正式, 3-离职, 4-退休, 5-顶岗实习
  statusName?: string; // 状态名称
  avatarUrl?: string; // 头像URL（可选）
}

/**
 * 员工分页查询参数
 */
export interface EmployeePageParams {
  pageNum?: number;
  pageSize?: number;
  userName?: string;
  userCode?: string;
  departmentId?: string;
  rankId?: string;
  jobTitle?: string;
  status?: number;
  mobile?: string;
  // 兼容字段
  position?: string;
  workStatus?: number;
}

/**
 * 员工创建请求参数
 */
export interface EmployeeCreateRequest {
  userCode: string; // 工号（必填）
  userName: string; // 姓名（必填）
  jobTitle?: string; // 职位名称
  departmentId?: string; // 所属科室ID
  rankId?: string; // 当前职级ID（公司内部职级）
  professionalTitleId?: string; // 职称ID（专业技术职称）
  professionalTitleName?: string; // 职称名称（冗余字段）
  officeLocation?: string; // 办公位置
  mobile?: string; // 手机号
  email?: string; // 企业邮箱
  idCardNo?: string; // 身份证号
  hireDate?: string; // 入职公司时间
  transferDate?: string; // 调入专业厂时间
  birthDate?: string; // 出生日期
  gender?: number; // 性别: 1-男, 2-女
  maritalStatus?: number; // 婚姻状况: 1-未婚, 2-已婚, 3-离异, 4-丧偶
  politicalStatus?: number; // 政治面貌: 1-党员, 2-积极分子, 3-群众
  status?: number; // 在职状态: 1-试用, 2-正式, 3-离职, 4-退休, 5-顶岗实习
  isRepresentative?: boolean; // 是否职工代表
  isTeamLeader?: boolean; // 是否担任工组长
  // 兼容字段
  phone?: string;
  position?: string;
  level?: string;
  entryDate?: string;
  workStatus?: number;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  remark?: string;
}

/**
 * 员工更新请求参数
 */
export interface EmployeeUpdateRequest {
  userCode: string; // 工号（必填，用于定位）
  userName?: string; // 姓名
  jobTitle?: string; // 职位名称
  departmentId?: string; // 所属科室ID
  rankId?: string; // 当前职级ID（公司内部职级）
  professionalTitleId?: string; // 职称ID（专业技术职称）
  professionalTitleName?: string; // 职称名称（冗余字段）
  officeLocation?: string; // 办公位置
  mobile?: string; // 手机号
  email?: string; // 企业邮箱
  idCardNo?: string; // 身份证号
  hireDate?: string; // 入职公司时间
  transferDate?: string; // 调入专业厂时间
  birthDate?: string; // 出生日期
  gender?: number; // 性别: 1-男, 2-女
  maritalStatus?: number; // 婚姻状况: 1-未婚, 2-已婚, 3-离异, 4-丧偶
  politicalStatus?: number; // 政治面貌: 1-党员, 2-积极分子, 3-群众
  status?: number; // 在职状态: 1-试用, 2-正式, 3-离职, 4-退休, 5-顶岗实习
  isRepresentative?: boolean; // 是否职工代表
  isTeamLeader?: boolean; // 是否担任工组长
  // 兼容字段
  id?: number;
  phone?: string;
  departmentName?: string;
  position?: string;
  level?: string;
  entryDate?: string;
  workStatus?: number;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  remark?: string;
}

/**
 * 部门信息接口（对应 departments 表）
 */
export interface Department {
  deptId: string; // 部门ID（主键，VARCHAR(36)）
  deptName: string; // 部门名称
  parentId?: string; // 父部门ID（VARCHAR(36)）
  deptLevel: number; // 层级深度
  sortOrder: number; // 排序权重
  isActive: boolean; // 是否启用
  // MyBatis-Plus 通用字段
  creator?: string; // 创建人(user_code)
  createTime?: Date | string; // 创建时间
  updater?: string; // 更新人(user_code)
  updateTime?: Date | string; // 更新时间
  updateIp?: string; // 更新IP
  isDeleted?: number; // 逻辑删除: 0-未删, 1-已删
  // 兼容字段
  id?: number; // 兼容字段
  deptCode?: string; // 兼容字段（可选）
  deptPath?: string; // 兼容字段（可选，用于路径查询）
  managerId?: number; // 兼容字段（可选，部门负责人）
  managerName?: string; // 兼容字段
  description?: string; // 兼容字段（部门描述）
  status?: number; // 兼容字段（等同于isActive: true=1, false=0）
  creatorId?: number; // 兼容字段
  creatorName?: string; // 兼容字段
  updaterId?: number; // 兼容字段
  updaterName?: string; // 兼容字段
  deleted?: number; // 兼容字段，等同于isDeleted
}

/**
 * 部门树节点接口
 */
export interface DepartmentTreeNode {
  deptId: string; // 部门ID（VARCHAR(36)）
  deptName: string; // 部门名称
  parentId?: string; // 父部门ID（VARCHAR(36)）
  deptLevel: number; // 层级深度
  sortOrder: number; // 排序权重
  isActive: boolean; // 是否启用
  children: DepartmentTreeNode[]; // 子部门列表
  // 兼容字段
  id?: number;
  deptCode?: string;
  managerId?: number;
  managerName?: string;
  status?: number;
}

/**
 * 部门创建请求参数
 */
export interface DepartmentCreateRequest {
  deptId?: string; // 部门ID（可选，系统生成或手动指定）
  deptName: string; // 部门名称（必填）
  parentId?: string; // 父部门ID（VARCHAR(36)）
  deptLevel?: number; // 层级深度（系统自动计算）
  sortOrder?: number; // 排序权重
  isActive?: boolean; // 是否启用
  description?: string; // 部门描述（兼容字段）
  managerId?: number; // 部门负责人ID（兼容字段）
  managerName?: string; // 部门负责人姓名（兼容字段）
  // 兼容字段
  deptCode?: string;
}

/**
 * 部门更新请求参数
 */
export interface DepartmentUpdateRequest {
  deptId: string; // 部门ID（必填，用于定位）
  deptName?: string; // 部门名称
  parentId?: string; // 父部门ID
  deptLevel?: number; // 层级深度
  sortOrder?: number; // 排序权重
  isActive?: boolean; // 是否启用
  description?: string; // 部门描述（兼容字段）
  managerId?: number; // 部门负责人ID（兼容字段）
  managerName?: string; // 部门负责人姓名（兼容字段）
  // 兼容字段
  id?: number;
  status?: number;
}
