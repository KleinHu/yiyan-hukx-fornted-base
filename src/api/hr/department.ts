import request from '@/utils/request/request';
import type { Department, DepartmentTreeNode } from '@/api/hr/types';

/**
 * 部门管理API（人事服务 /api/240/hr）
 */
const departmentApi = {
  /**
   * 获取部门树结构
   * @returns 部门树数据
   */
  getDepartmentTree() {
    return request.get<DepartmentTreeNode[]>('/api/240/hr/department/tree');
  },

  /**
   * 获取所有部门列表（扁平结构）
   * @returns 部门列表
   */
  getDepartmentList() {
    return request.get<Department[]>('/api/240/hr/department/list');
  },

  /**
   * 获取部门详情
   * @param deptId 部门ID
   * @returns 部门详情
   */
  getDepartmentById(deptId: string) {
    return request.get<Department>(`/api/240/hr/department/${deptId}`);
  },
};

export default departmentApi;
