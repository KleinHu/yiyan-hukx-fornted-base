import queryString from 'query-string';
import request from '@/utils/request/request';

/**
 * 办公用品分类
 */
export interface SuppliesCategoryVO {
  /** 主键 */
  id?: string;
  /** 分类名称 */
  name: string;
  /** 父级ID */
  parentId?: string;
  /** 排序 */
  sort?: number;
  /** 子节点 */
  children?: SuppliesCategoryVO[];
}

/**
 * 办公用品档案
 */
export interface SuppliesItemVO {
  /** 主键 */
  id?: string;
  /** 分类ID */
  categoryId: string;
  /** 分类名称 (后端聚合) */
  categoryName?: string;
  /** 物品名称 */
  name: string;
  /** 规格型号 */
  spec?: string;
  /** 单位 */
  unit?: string;
  /** 价格 */
  price?: number;
  /** 预警库存 */
  minStock?: number;
  /** 当前库存 (后端聚合) */
  stock?: number;
  /** 锁定库存 (后端聚合) */
  lockStock?: number;
  /** 可领用库存 (后端聚合) */
  availableStock?: number;
  /** 状态 (1-启用, 0-禁用) */
  status?: number;
}

/**
 * 物品查询参数
 */
export interface SuppliesQuery {
  /** 物品名称 */
  name?: string;
  /** 分类ID列表 */
  categoryIds?: string[];
  /** 状态 */
  status?: number;
  /** 页码 */
  pageNo?: number;
  /** 每页大小 */
  pageSize?: number;
  /** 是否库存紧缺 */
  lowStock?: boolean;
}

/**
 * 库存变更请求
 */
export interface InventoryChangeRequest {
  /** 物品ID */
  itemId: string;
  /** 变动数量 (正数为增，负数为减) */
  quantity: number;
  /** 变动场景: 1-采购, 2-领用, 3-盘点, 4-退库, 5-报损 */
  scenario: number;
  /** 关联单号 */
  relNo?: string;
  /** 备注 */
  remark?: string;
  /** 操作人姓名 */
  operatorName?: string;
  /** 操作人工号 */
  operatorCode?: string;
}

/**
 * 分页数据响应
 */
export interface PageData<T> {
  list: T[];
  total: number;
}

/**
 * 获取物品分类树
 */
export function getCategoryTree() {
  return request.get<SuppliesCategoryVO[]>(
    '/api/240/oa/supplies/category/tree'
  );
}

/**
 * 保存分类
 */
export function saveCategory(data: SuppliesCategoryVO) {
  return request.post<boolean>('/api/240/oa/supplies/category', data);
}

/**
 * 更新分类
 */
export function updateCategory(data: SuppliesCategoryVO) {
  return request.put<boolean>('/api/240/oa/supplies/category', data);
}

/**
 * 删除分类
 */
export function deleteCategory(id: string) {
  return request.delete<boolean>(`/api/240/oa/supplies/category/${id}`);
}

/**
 * 分页查询物品档案
 */
export function getItemPage(params: SuppliesQuery) {
  return request.get<PageData<SuppliesItemVO>>(
    '/api/240/oa/supplies/item/page',
    {
      params,
      paramsSerializer: (obj) => {
        return queryString.stringify(obj);
      },
    }
  );
}

/**
 * 保存物品档案
 */
export function saveItem(data: SuppliesItemVO) {
  return request.post<boolean>('/api/240/oa/supplies/item', data);
}

/**
 * 更新物品档案
 */
export function updateItem(data: SuppliesItemVO) {
  return request.put<boolean>('/api/240/oa/supplies/item', data);
}

/**
 * 删除物品档案
 */
export function deleteItem(id: string) {
  return request.delete<boolean>(`/api/240/oa/supplies/item/${id}`);
}

/**
 * 库存流水记录
 */
export interface SuppliesRecordVO {
  id?: string;
  itemId: string;
  itemName?: string;
  spec?: string;
  /** 1-入库, 2-出库 */
  type: number;
  /** 1-采购, 2-领用, 3-盘点, 4-退库, 5-报损 */
  scenario: number;
  quantity: number;
  relNo?: string;
  creator?: string;
  creatorName?: string;
  createTime?: string;
}

/**
 * 流水查询参数
 */
export interface RecordQuery {
  itemId?: string;
  itemName?: string;
  type?: number;
  scenario?: number;
  startTime?: string;
  endTime?: string;
  pageNo?: number;
  pageSize?: number;
}

/**
 * 变更库存
 */
export function changeInventory(data: InventoryChangeRequest) {
  return request.post<void>('/api/240/oa/supplies/item/inventory/change', data);
}

/**
 * 分页查询库存流水
 */
export function getRecordPage(params: RecordQuery) {
  return request.get<PageData<SuppliesRecordVO>>(
    '/api/240/oa/supplies/item/record/page',
    {
      params,
      paramsSerializer: (obj) => {
        return queryString.stringify(obj);
      },
    }
  );
}

// --- 领用管理 API ---

/**
 * 领用申请明细
 */
export interface SuppliesRequestItemVO {
  id?: string;
  requestId?: string;
  itemId: string;
  itemName?: string;
  spec?: string;
  unit?: string;
  quantity: number;
  issuedQuantity?: number;
}

/**
 * 领用申请单
 */
export interface SuppliesRequestVO {
  id?: string;
  orderNo?: string;
  userCode?: string;
  userName?: string;
  deptName?: string;
  applyTime?: string;
  reason?: string;
  auditStatus?: number; // 0待审核, 1通过, 2驳回, 3已发放
  auditorName?: string;
  auditTime?: string;
  remark?: string;
  items: SuppliesRequestItemVO[];
}

/**
 * 领用申请查询参数
 */
export interface RequestQuery {
  pageNo?: number;
  pageSize?: number;
  userCode?: string;
  auditStatus?: number;
  year?: string;
}

/**
 * 提交领用申请
 */
export function submitRequest(data: SuppliesRequestVO) {
  return request.post<boolean>('/api/240/oa/supplies/request', data);
}

/**
 * 分页查询领用记录
 */
export function getRequestPage(params: RequestQuery) {
  return request.get<PageData<SuppliesRequestVO>>(
    '/api/240/oa/supplies/request/page',
    {
      params,
      paramsSerializer: (obj) => {
        return queryString.stringify(obj);
      },
    }
  );
}

/**
 * 根据单号获取领用详情
 */
export function getRequestByOrderNo(orderNo: string) {
  return request.get<SuppliesRequestVO>(
    `/api/240/oa/supplies/request/${orderNo}`
  );
}

/**
 * 审核领用申请
 */
export function auditRequest(
  id: string,
  status: number,
  remark?: string,
  items?: SuppliesRequestItemVO[],
  operatorName?: string,
  operatorCode?: string
) {
  return request.post<boolean>(`/api/240/oa/supplies/request/audit`, {
    id,
    status,
    remark,
    items,
    operatorName,
    operatorCode,
  });
}

// --- 看板 API ---

/**
 * 看板聚合数据
 */
export interface SuppliesDashboardVO {
  statistics: {
    totalItems: number;
    lowStockCount: number;
    pendingAuditCount: number;
    yearlyTotalAmount: number;
  };
  categoryDistribution: Array<{ name: string; value: number }>;
  applyTrend: {
    dates: string[];
    values: number[];
  };
  lowStockItems: SuppliesItemVO[];
  recentRequests: SuppliesRequestVO[];
}

/**
 * 获取看板聚合数据
 */
export function getDashboardData(year: string) {
  return request.get<SuppliesDashboardVO>('/api/240/oa/supplies/dashboard', {
    params: { year },
  });
}

/**
 * 领用分析查询参数
 */
export interface ConsumptionParams {
  year?: string;
  startMonth?: string;
  endMonth?: string;
}

/**
 * 部门物品领用汇总
 */
export interface DeptItemConsumptionVO {
  deptName: string;
  itemId: string;
  itemName: string;
  spec: string;
  totalQuantity: number;
  categoryId?: string;
}

/**
 * 人员领用明细
 */
export interface UserConsumptionDetailVO {
  userName: string;
  userCode: string;
  orderNo: string;
  applyTime: string;
  quantity: number;
}

/**
 * 获取部门物品领用汇总
 */
export function getDeptItemConsumption(params: ConsumptionParams) {
  return request.get<DeptItemConsumptionVO[]>(
    '/api/240/oa/supplies/request/dashboard/dept-item-consumption',
    {
      params,
      paramsSerializer: (obj) => {
        return queryString.stringify(obj);
      },
    }
  );
}

/**
 * 获取人员领用明细
 */
export function getConsumptionDetails(
  params: ConsumptionParams & { deptName: string; itemId: string }
) {
  return request.get<UserConsumptionDetailVO[]>(
    '/api/240/oa/supplies/request/dashboard/consumption-details',
    {
      params,
      paramsSerializer: (obj) => {
        return queryString.stringify(obj);
      },
    }
  );
}
