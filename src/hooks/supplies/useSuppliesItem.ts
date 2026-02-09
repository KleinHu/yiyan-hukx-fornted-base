import { ref, reactive } from 'vue';
import { Message } from '@arco-design/web-vue';
import * as suppliesApi from '@/api/supplies';
import type { SuppliesItemVO, SuppliesQuery } from '@/api/supplies';

/**
 * 办公用品档案管理 Hook
 */
export default function useSuppliesItem() {
  const list = ref<SuppliesItemVO[]>([]);
  const loading = ref(false);

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: true,
    showPageSize: true,
  });

  const queryParams = ref<SuppliesQuery>({
    pageNo: 1,
    pageSize: 10,
  });

  /**
   * 分页查询物品列表
   */
  const fetchPage = async (params?: Partial<SuppliesQuery>) => {
    try {
      loading.value = true;
      const query: SuppliesQuery = {
        ...queryParams.value,
        ...params,
        pageNo: params?.pageNo ?? pagination.current,
        pageSize: params?.pageSize ?? pagination.pageSize,
      };
      const { data } = await suppliesApi.getItemPage(query);
      if (data) {
        list.value = data.list || [];
        pagination.total = data.total || 0;
        pagination.current = query.pageNo || 1;
        pagination.pageSize = query.pageSize || 10;
      }
    } catch (error) {
      Message.error('获取物品列表失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 保存物品档案
   */
  const save = async (form: SuppliesItemVO) => {
    try {
      loading.value = true;
      if (form.id) {
        await suppliesApi.updateItem(form);
      } else {
        await suppliesApi.saveItem(form);
      }
      Message.success('保存成功');
      await fetchPage();
      return true;
    } catch (error) {
      Message.error('保存物品档案失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除物品档案
   */
  const remove = async (id: string) => {
    try {
      loading.value = true;
      await suppliesApi.deleteItem(id);
      Message.success('删除成功');
      await fetchPage();
      return true;
    } catch (error) {
      Message.error('删除物品失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 按分类列表筛选
   */
  const setCategoryIds = (ids?: string[]) => {
    queryParams.value.categoryIds = ids;
    fetchPage({ pageNo: 1 });
  };

  return {
    list,
    loading,
    pagination,
    queryParams,
    fetchPage,
    save,
    remove,
    setCategoryIds,
  };
}
