import request from '@/utils/request/request';
import type { Employee, EmployeePageParams, PageResult } from '@/api/hr/types';

/**
 * 员工管理API（人事服务 /api/240/hr）
 */
const employeeApi = {
  /**
   * 分页查询员工列表
   * @param params 查询参数
   * @returns 员工列表分页数据
   */
  getEmployeePage(params: EmployeePageParams) {
    return request.get<PageResult<Employee>>('/api/240/hr/employees', {
      params,
    });
  },

  /**
   * 获取员工详情
   * @param userCode 员工工号
   * @returns 员工详情
   */
  getEmployeeByUserCode(userCode: string) {
    return request.get<Employee>(`/api/240/hr/employees/${userCode}`);
  },
};

export default employeeApi;
