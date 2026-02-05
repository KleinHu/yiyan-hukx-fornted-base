import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import sixsAccountApi from '@/api/sixs/account';
import type {
  SixSAccount,
  SixSAccountQuery,
  SixSAccountStatistics,
  SixSAccountTrend,
} from '@/api/sixs/model/sixsModel';

/**
 * 6S 积分台账 Hook
 * 台账编辑时部门选择请配合 useDepartmentTree（HR 部门树）使用
 * @param options 是否自动加载第一页
 */
function useAccount(options?: { autoLoad?: boolean }) {
  const autoLoad = options?.autoLoad ?? true;

  const list = ref<SixSAccount[]>([]);
  const detail = ref<SixSAccount | null>(null);
  const trendList = ref<SixSAccountTrend[]>([]);
  const stats = reactive<SixSAccountStatistics>({
    totalCount: 0,
    excellentCount: 0,
    warningCount: 0,
    seriousCount: 0,
  });
  const loading = ref(false);
  const trendLoading = ref(false);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const queryParams = ref<SixSAccountQuery>({
    pageNo: 1,
    pageSize: 10,
    year: new Date().getFullYear(),
  });

  /**
   * 分页查询台账列表
   */
  const fetchPage = async (params?: Partial<SixSAccountQuery>) => {
    try {
      loading.value = true;
      const query: SixSAccountQuery = {
        ...queryParams.value,
        ...params,
        pageNo: params?.pageNo ?? pagination.current,
        pageSize: params?.pageSize ?? pagination.pageSize,
      };
      const { data } = await sixsAccountApi.getPage(query);
      if (data) {
        list.value = data.list || [];
        pagination.total = data.total || 0;
      }
    } catch (error) {
      Message.error('获取台账列表失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取统计数据
   */
  const fetchStatistics = async (year?: number) => {
    try {
      const targetYear =
        year ?? queryParams.value.year ?? new Date().getFullYear();
      const { data } = await sixsAccountApi.getStatistics(targetYear);
      if (data) {
        Object.assign(stats, data);
      }
    } catch (error) {
      // 捕获统计异常，不中断主流程
    }
  };

  /**
   * 获取台账详情
   */
  const fetchDetail = async (
    id: string | number
  ): Promise<SixSAccount | null> => {
    try {
      loading.value = true;
      const { data } = await sixsAccountApi.getById(id);
      detail.value = data || null;
      return data || null;
    } catch (error) {
      Message.error('获取台账详情失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取分数趋势
   */
  const fetchTrend = async (id: string | number) => {
    try {
      trendLoading.value = true;
      const { data } = await sixsAccountApi.getTrend(id);
      trendList.value = data || [];
    } catch (error) {
      Message.error('获取分数趋势失败');
    } finally {
      trendLoading.value = false;
    }
  };

  /**
   * 获取台账列表（不分页，用于下拉等）
   */
  const fetchList = async (params?: SixSAccountQuery) => {
    try {
      loading.value = true;
      const { data } = await sixsAccountApi.getList(params);
      return data || [];
    } catch (error) {
      Message.error('获取台账列表失败');
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 新增台账
   */
  const save = async (form: SixSAccount): Promise<number | null> => {
    try {
      loading.value = true;
      const { data } = await sixsAccountApi.save(form);
      Message.success('新增成功');
      await fetchPage();
      return data ?? null;
    } catch (error) {
      Message.error('新增失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 批量新增台账（需传 year 指定台账年份）
   */
  const saveBatch = async (params: {
    year: number;
    list: SixSAccount[];
  }): Promise<boolean> => {
    try {
      loading.value = true;
      const { data } = await sixsAccountApi.saveBatch(params);
      Message.success('批量新增成功');
      await fetchPage();
      return data ?? false;
    } catch (error) {
      Message.error('批量新增失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 修改台账
   */
  const update = async (form: SixSAccount): Promise<boolean> => {
    try {
      loading.value = true;
      await sixsAccountApi.update(form);
      Message.success('修改成功');
      await fetchPage();
      return true;
    } catch (error) {
      Message.error('修改失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除台账
   */
  const remove = async (id: string | number): Promise<boolean> => {
    try {
      loading.value = true;
      await sixsAccountApi.deleteById(id);
      Message.success('删除成功');
      await fetchPage();
      return true;
    } catch (error) {
      Message.error('删除失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 批量删除
   */
  const removeBatch = async (ids: (string | number)[]): Promise<boolean> => {
    try {
      loading.value = true;
      await sixsAccountApi.deleteBatch(ids);
      Message.success('删除成功');
      await fetchPage();
      return true;
    } catch (error) {
      Message.error('删除失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 设置查询参数并刷新
   */
  const setQuery = (params: Partial<SixSAccountQuery>) => {
    queryParams.value = { ...queryParams.value, ...params };
  };

  /**
   * 刷新当前页
   */
  const refresh = () => fetchPage();

  if (autoLoad) {
    onMounted(() => {
      fetchPage();
    });
  }

  return {
    list,
    detail,
    trendList,
    stats,
    loading,
    trendLoading,
    pagination,
    queryParams,
    fetchPage,
    fetchStatistics,
    fetchDetail,
    fetchTrend,
    fetchList,
    save,
    saveBatch,
    update,
    remove,
    removeBatch,
    setQuery,
    refresh,
  };
}

export default useAccount;
