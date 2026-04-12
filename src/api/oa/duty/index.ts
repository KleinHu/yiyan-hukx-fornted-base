import queryString from 'query-string';
import request from '@/utils/request/request';

/**
 * 分页数据响应
 */
export interface PageData<T> {
  list: T[];
  total: number;
}

// ==========================================
// 值班分组相关接口
// ==========================================

export interface DutyGroupVO {
  id?: string;
  name: string;
  parentId?: string;
  level?: number;
  departmentId?: string;
  departmentName?: string;
  status?: number;
  createTime?: string;
  children?: DutyGroupVO[];
}

/**
 * 获取分组树
 */
export function getDutyGroupTree() {
  return request.get<DutyGroupVO[]>('/api/240/oa/duty-group/tree');
}

/**
 * 新增/修改分组
 */
export function saveDutyGroup(data: DutyGroupVO) {
  if (data.id) {
    return request.put<string>('/api/240/oa/duty-group', data);
  }
  return request.post<string>('/api/240/oa/duty-group', data);
}

/**
 * 删除分组
 */
export function deleteDutyGroup(id: string) {
  return request.delete<boolean>(`/api/240/oa/duty-group/${id}`);
}

// ==========================================
// 值班排班相关接口
// ==========================================

export interface DutyScheduleVO {
  id?: string;
  groupId: string;
  userCode: string;
  userName: string;
  dutyDate: string;
  sortOrder?: number;
  remark?: string;
  createTime?: string;
}

export interface DutyScheduleQuery {
  groupId?: string;
  userKey?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 获取排班列表
 */
export function getDutyScheduleList(params: DutyScheduleQuery) {
  return request.get<DutyScheduleVO[]>('/api/240/oa/duty-schedule/list', {
    params,
    paramsSerializer: (obj) => {
      return queryString.stringify(obj);
    },
  });
}

/**
 * 新增/修改排班
 */
export function saveDutySchedule(data: DutyScheduleVO) {
  if (data.id) {
    return request.put<string>('/api/240/oa/duty-schedule', data);
  }
  return request.post<string>('/api/240/oa/duty-schedule', data);
}

/**
 * 批量保存排班
 */
export function saveDutyScheduleBatch(data: DutyScheduleVO[]) {
  return request.post<boolean>('/api/240/oa/duty-schedule/batch', data);
}

/**
 * 删除排班
 */
export function deleteDutySchedule(id: string) {
  return request.delete<boolean>(`/api/240/oa/duty-schedule/${id}`);
}

/**
 * 批量删除排班
 */
export function deleteDutyScheduleBatch(ids: string[]) {
  return request.delete<boolean>('/api/240/oa/duty-schedule/batch', {
    data: ids,
  });
}
