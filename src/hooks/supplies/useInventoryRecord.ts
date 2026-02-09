import { ref, reactive } from 'vue';
import * as suppliesApi from '@/api/supplies';
import type { SuppliesRecordVO, RecordQuery } from '@/api/supplies';

/**
 * 办公用品库存流水 Hook
 */
export default function useInventoryRecord() {
  const list = ref<SuppliesRecordVO[]>([]);
  const loading = ref(false);

  const queryParams = reactive<RecordQuery>({
    pageNo: 1,
    pageSize: 10,
    itemName: '',
    type: undefined,
    scenario: undefined,
  });

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
  });

  const fetchPage = async (params: RecordQuery = {}) => {
    try {
      loading.value = true;
      const finalParams = { ...queryParams, ...params };
      if (params.pageNo) queryParams.pageNo = params.pageNo;
      if (params.pageSize) queryParams.pageSize = params.pageSize;
      const { data } = await suppliesApi.getRecordPage(finalParams);
      list.value = data.list;
      pagination.total = data.total;
      pagination.current = finalParams.pageNo || 1;
      pagination.pageSize = finalParams.pageSize || 10;
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
  };
}
