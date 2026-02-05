import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import sixsCategoryApi from '@/api/sixs/category';
import type {
  SixSCategory,
  SixSCategoryQuery,
} from '@/api/sixs/model/sixsModel';

/**
 * 6S 标准化分类 Hook
 * @param options 是否自动加载第一页
 */
function useCategory(options?: { autoLoad?: boolean }) {
  const autoLoad = options?.autoLoad ?? true;

  const list = ref<SixSCategory[]>([]);
  const loading = ref(false);
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const queryParams = ref<SixSCategoryQuery>({
    pageNo: 1,
    pageSize: 10,
  });

  /**
   * 分页查询分类列表
   */
  const fetchPage = async (params?: Partial<SixSCategoryQuery>) => {
    try {
      loading.value = true;
      const query: SixSCategoryQuery = {
        ...queryParams.value,
        ...params,
        pageNo: params?.pageNo ?? pagination.current,
        pageSize: params?.pageSize ?? pagination.pageSize,
      };
      const { data } = await sixsCategoryApi.getPage(query);
      if (data) {
        list.value = data.list || [];
        pagination.total = data.total || 0;
      }
    } catch (error) {
      Message.error('获取分类列表失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取分类详情
   */
  const fetchDetail = async (id: number): Promise<SixSCategory | null> => {
    try {
      loading.value = true;
      const { data } = await sixsCategoryApi.getById(id);
      return data || null;
    } catch (error) {
      Message.error('获取分类详情失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取分类列表（不分页，用于下拉等）
   */
  const fetchList = async (params?: SixSCategoryQuery) => {
    try {
      loading.value = true;
      const { data } = await sixsCategoryApi.getList(params);
      list.value = data || [];
      return list.value;
    } catch (error) {
      Message.error('获取分类列表失败');
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 新增分类
   */
  const save = async (form: SixSCategory): Promise<number | null> => {
    try {
      loading.value = true;
      const { data } = await sixsCategoryApi.save(form);
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
   * 修改分类
   */
  const update = async (form: SixSCategory): Promise<boolean> => {
    try {
      loading.value = true;
      await sixsCategoryApi.update(form);
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
   * 删除分类
   */
  const remove = async (id: number): Promise<boolean> => {
    try {
      loading.value = true;
      await sixsCategoryApi.deleteById(id);
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
  const removeBatch = async (ids: number[]): Promise<boolean> => {
    try {
      loading.value = true;
      await sixsCategoryApi.deleteBatch(ids);
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
  const setQuery = (params: Partial<SixSCategoryQuery>) => {
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
    setQuery,
    refresh,
  };
}

export default useCategory;
