/**
 * 6S 积分台账模块类型定义
 */

/** 分页结果（易研平台） */
export interface SixSPageResult<T> {
  list: T[];
  total: number;
}

/** 6S 积分台账 */
export interface SixSAccount {
  id?: number;
  userCode: string;
  userName: string;
  departmentId?: string;
  departmentName?: string;
  year?: number;
  totalScore?: number;
  status?: number;
  remark?: string;
}

/** 6S 积分台账统计 */
export interface SixSAccountStatistics {
  totalCount: number;
  excellentCount: number;
  warningCount: number;
  seriousCount: number;
}

/** 6S 积分台账查询参数 */
export interface SixSAccountQuery {
  pageNo?: number;
  pageSize?: number;
  userCode?: string;
  userName?: string;
  departmentName?: string;
  departmentIds?: string[];
  year?: number;
  status?: number;
  scoreLevel?: string;
}

export interface SixSAccountTrend {
  checkDate: string;
  score: number;
}

/** 操作类型：1加分 2减分 */
export const OPERATION_TYPE_ADD = 1;
export const OPERATION_TYPE_DEDUCT = 2;

/** 6S 标准化分类 */
export interface SixSCategory {
  id?: number;
  name: string;
  code: string;
  defaultScore?: number;
  /** 操作类型：1加分 2减分，默认 1 */
  operationType?: number;
  description?: string;
  sort?: number;
  status?: number;
}

/** 6S 分类查询参数 */
export interface SixSCategoryQuery {
  pageNo?: number;
  pageSize?: number;
  name?: string;
  status?: number;
  operationType?: number;
}

/** 6S 检查记录（含积分） */
export interface SixSCheckRecord {
  id?: string | number;
  accountId: string | number;
  categoryId: string | number;
  categoryName?: string;
  checkDate: string;
  problemDescription: string;
  checkerCode: string;
  checkerName: string;
  images?: string;
  scoreDeducted: number;
  beforeScore?: number;
  afterScore?: number;
}

/** 6S 检查记录查询参数 */
export interface SixSCheckRecordQuery {
  pageNo?: number;
  pageSize?: number;
  accountId?: string | number;
  categoryId?: string | number;
  checkDate?: [string, string];
}
