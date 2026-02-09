import { ref, reactive } from 'vue';
import { Message } from '@arco-design/web-vue';
import * as suppliesApi from '@/api/supplies';
import type { SuppliesRequestVO, RequestQuery } from '@/api/supplies';
import { useUserStore } from '@/store';
import useEmployeeList from '@/hooks/hr/employee';

/**
 * 办公用品领用管理 Hook
 */
export default function useSuppliesRequest() {
  const userStore = useUserStore();
  const { fetchEmployeeDetail } = useEmployeeList({ autoLoad: false });
  const list = ref<SuppliesRequestVO[]>([]);
  const loading = ref(false);

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
  });

  const queryParams = ref<RequestQuery>({
    pageNo: 1,
    pageSize: 10,
    auditStatus: -1,
  });

  /**
   * 分页查询领用记录
   */
  const fetchPage = async (params?: Partial<RequestQuery>) => {
    try {
      loading.value = true;
      const query: any = {
        ...queryParams.value,
        ...params,
        pageNo: params?.pageNo ?? pagination.current,
        pageSize: params?.pageSize ?? pagination.pageSize,
      };

      // 过滤无效参数
      if (
        query.auditStatus === null ||
        query.auditStatus === undefined ||
        query.auditStatus === -1
      ) {
        delete query.auditStatus;
      }
      const { data } = await suppliesApi.getRequestPage(query);
      if (data) {
        list.value = data.list || [];
        pagination.total = data.total || 0;
        pagination.current = query.pageNo || 1;
        pagination.pageSize = query.pageSize || 10;
      }
    } catch (error) {
      Message.error('获取领用记录失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 提交领用申请
   */
  const apply = async (form: SuppliesRequestVO) => {
    try {
      loading.value = true;

      // 如果没有传领用人信息，则默认为当前登录人
      const finalUserCode = form.userCode || userStore.userCode || '';
      const finalUserName = form.userName || userStore.username || '';
      let finalDeptName = form.deptName || '';

      // 如果有工号但没部门，尝试通过 HR 模块获取
      if (finalUserCode && !finalDeptName) {
        const employee = await fetchEmployeeDetail(finalUserCode);
        finalDeptName = employee?.departmentName || '';
      }

      const fullForm: SuppliesRequestVO = {
        ...form,
        userCode: finalUserCode,
        userName: finalUserName,
        deptName: finalDeptName,
      };

      await suppliesApi.submitRequest(fullForm);
      Message.success('申请提交成功');
      return true;
    } catch (error) {
      Message.error('申请提交失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 审核领用申请
   */
  const audit = async (
    id: string,
    status: number,
    remark?: string,
    items?: any[],
    operatorName?: string,
    operatorCode?: string
  ) => {
    try {
      loading.value = true;
      const finalOperatorName =
        operatorName || userStore.nickname || userStore.username;
      const finalOperatorCode = operatorCode || userStore.userCode;

      await suppliesApi.auditRequest(
        id,
        status,
        remark,
        items,
        finalOperatorName,
        finalOperatorCode
      );
      Message.success('审核操作成功');
      await fetchPage();
      return true;
    } catch (error) {
      Message.error('审核操作失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    list,
    loading,
    pagination,
    queryParams,
    fetchPage,
    apply,
    audit,
  };
}
