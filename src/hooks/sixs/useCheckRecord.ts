import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import sixsCheckRecordApi from '@/api/sixs/check-record';
import type {
  SixSCheckRecord,
  SixSCheckRecordQuery,
} from '@/api/sixs/model/sixsModel';

/**
 * 6S 检查记录 Hook
 * 检查人/操作人选择可配合 useEmployeeList（HR 员工列表）使用
 * @param options 是否自动加载第一页、是否按台账 ID 查积分明细
 */
function useCheckRecord(options?: {
  autoLoad?: boolean;
  accountId?: string | number; // 传入则按台账查积分明细
}) {
  const autoLoad = options?.autoLoad ?? true;
  const accountIdFilter = options?.accountId;

  const list = ref<SixSCheckRecord[]>([]);
  const loading = ref(false);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const queryParams = ref<SixSCheckRecordQuery>({
    pageNo: 1,
    pageSize: 10,
    accountId: accountIdFilter,
  });

  /**
   * 分页查询检查记录（可传 accountId 查积分明细）
   */
  const fetchPage = async (params?: Partial<SixSCheckRecordQuery>) => {
    try {
      loading.value = true;
      const query: SixSCheckRecordQuery = {
        ...queryParams.value,
        ...params,
        pageNo: params?.pageNo ?? pagination.current,
        pageSize: params?.pageSize ?? pagination.pageSize,
        accountId:
          params?.accountId ?? accountIdFilter ?? queryParams.value.accountId,
      };
      const { data } = await sixsCheckRecordApi.getPage(query);
      if (data) {
        list.value = data.list || [];
        pagination.total = data.total || 0;
      }
    } catch (error) {
      Message.error('获取检查记录失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取检查记录详情
   */
  const fetchDetail = async (
    id: string | number
  ): Promise<SixSCheckRecord | null> => {
    try {
      loading.value = true;
      const { data } = await sixsCheckRecordApi.getById(id);
      return data || null;
    } catch (error) {
      Message.error('获取检查记录详情失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取检查记录列表（不分页，如按台账查积分明细）
   */
  const fetchList = async (params?: SixSCheckRecordQuery) => {
    try {
      loading.value = true;
      const { data } = await sixsCheckRecordApi.getList(params);
      return data || [];
    } catch (error) {
      Message.error('获取检查记录失败');
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 新增检查记录（后端自动扣分、更新台账总积分）
   */
  const save = async (form: SixSCheckRecord): Promise<number | null> => {
    try {
      loading.value = true;
      const { data } = await sixsCheckRecordApi.save(form);
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
   * 修改检查记录
   */
  const update = async (form: SixSCheckRecord): Promise<boolean> => {
    try {
      loading.value = true;
      await sixsCheckRecordApi.update(form);
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
   * 删除检查记录
   */
  const remove = async (id: string | number): Promise<boolean> => {
    try {
      loading.value = true;
      await sixsCheckRecordApi.deleteById(id);
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
      await sixsCheckRecordApi.deleteBatch(ids);
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
   * 按台账 ID 查询积分明细（扣分总计可由前端对 list 中 scoreDeducted 求和）
   */
  const setAccountId = (accountId: string | number | undefined) => {
    queryParams.value.accountId = accountId;
  };

  /**
   * 设置查询参数并刷新
   */
  const setQuery = (params: Partial<SixSCheckRecordQuery>) => {
    queryParams.value = { ...queryParams.value, ...params };
  };

  /**
   * 刷新当前页
   */
  const refresh = () => fetchPage();

  /**
   * 新增检查记录（业务方法）
   */
  const addRecord = async (params: {
    accountId: number | string;
    categoryId: number | string;
    score: number;
    scoreType: 'plus' | 'minus';
    description: string;
    checkDate: string;
    checkerCode: string;
    checkerName: string;
  }) => {
    const form: SixSCheckRecord = {
      accountId: params.accountId,
      categoryId: params.categoryId,
      scoreDeducted:
        params.scoreType === 'minus' ? -params.score : params.score,
      problemDescription: params.description,
      checkDate: params.checkDate,
      checkerCode: params.checkerCode,
      checkerName: params.checkerName,
    };
    return save(form);
  };

  if (autoLoad) {
    onMounted(() => {
      fetchPage();
    });
  }

  return {
    list,
    loading,
    pagination,
    queryParams,
    fetchPage,
    fetchDetail,
    fetchList,
    save,
    update,
    remove,
    removeBatch,
    setAccountId,
    setQuery,
    refresh,
    addRecord,
  };
}

export default useCheckRecord;
