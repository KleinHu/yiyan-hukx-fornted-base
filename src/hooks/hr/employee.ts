import { ref, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import employeeApi from '@/api/hr/employee';
import type { Employee, EmployeePageParams } from '@/api/hr/types';

/**
 * 员工管理 Hook（OA 用：选择员工、获取员工详情）
 * @param options 配置选项
 * @returns 员工相关数据和方法
 */
function useEmployeeList(options?: {
  autoLoad?: boolean; // 是否自动加载
  filterStatus?: number; // 过滤状态（如：2-正式员工）
  pageSize?: number; // 每页数量，默认1000（获取所有）
}) {
  const { autoLoad = true, filterStatus, pageSize = 1000 } = options || {};

  const employeeList = ref<Employee[]>([]);
  const loading = ref(false);
  const pagination = ref({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  /**
   * 获取员工列表（分页）
   * @param params 查询参数（可选，会与默认参数合并）
   * @param usePagination 是否使用分页，默认false（获取所有）
   */
  const fetchEmployeeList = async (
    params?: Partial<EmployeePageParams>,
    usePagination = false
  ) => {
    try {
      loading.value = true;
      const queryParams: EmployeePageParams = {
        pageNum: usePagination ? pagination.value.current : 1,
        pageSize: usePagination ? pagination.value.pageSize : pageSize,
        ...params,
      };

      if (filterStatus !== undefined && !params?.status) {
        queryParams.status = filterStatus;
      }

      const { data } = await employeeApi.getEmployeePage(queryParams);
      if (data) {
        employeeList.value = data.list || [];
        // 始终更新 total，便于界面显示「部门成员 (总数)」
        pagination.value.total = data.total ?? 0;
      }
    } catch (error) {
      Message.error('获取员工列表失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取员工详情
   * @param userCode 员工工号
   * @returns 员工详情
   */
  const fetchEmployeeDetail = async (
    userCode: string
  ): Promise<Employee | null> => {
    try {
      loading.value = true;
      const { data } = await employeeApi.getEmployeeByUserCode(userCode);
      return data || null;
    } catch (error) {
      Message.error('获取员工详情失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 根据工号查找员工（从本地列表）
   * @param userCode 员工工号
   * @returns 员工信息
   */
  const getEmployeeByCode = (userCode: string): Employee | undefined => {
    return employeeList.value.find((e) => e.userCode === userCode);
  };

  /**
   * 刷新员工列表
   */
  const refresh = () => {
    return fetchEmployeeList();
  };

  if (autoLoad) {
    onMounted(() => {
      fetchEmployeeList();
    });
  }

  return {
    employeeList,
    loading,
    pagination,
    fetchEmployeeList,
    fetchEmployeeDetail,
    getEmployeeByCode,
    refresh,
  };
}

export default useEmployeeList;
