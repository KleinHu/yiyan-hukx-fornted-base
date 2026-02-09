import { ref } from 'vue';
import {
  getDeptItemConsumption,
  getConsumptionDetails,
  type DeptItemConsumptionVO,
  type UserConsumptionDetailVO,
  type ConsumptionParams,
} from '@/api/supplies';

/**
 * 部门物品领用分析 Hook
 */
export default function useConsumption() {
  const deptLoading = ref(false);
  const deptConsumptionList = ref<DeptItemConsumptionVO[]>([]);

  const userLoading = ref(false);
  const userConsumptionList = ref<UserConsumptionDetailVO[]>([]);

  /**
   * 拉取部门物品领用汇总
   */
  const fetchDeptConsumption = async (params: ConsumptionParams) => {
    deptLoading.value = true;
    try {
      const { data } = await getDeptItemConsumption(params);
      deptConsumptionList.value = data || [];
    } catch (e) {
      deptConsumptionList.value = [];
    } finally {
      deptLoading.value = false;
    }
  };

  /**
   * 拉取人员领用明细
   */
  const fetchUserConsumption = async (
    params: ConsumptionParams & { deptName: string; itemId: string }
  ) => {
    userLoading.value = true;
    try {
      const { data } = await getConsumptionDetails(params);
      userConsumptionList.value = data || [];
    } catch (e) {
      userConsumptionList.value = [];
    } finally {
      userLoading.value = false;
    }
  };

  return {
    deptLoading,
    deptConsumptionList,
    userLoading,
    userConsumptionList,
    fetchDeptConsumption,
    fetchUserConsumption,
  };
}
