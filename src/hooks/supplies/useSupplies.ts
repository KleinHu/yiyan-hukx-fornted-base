import { ref, reactive, onMounted } from 'vue';
import { Message } from '@arco-design/web-vue';
import * as suppliesApi from '@/api/supplies';
import type {
  SuppliesCategoryVO,
  SuppliesItemVO,
  SuppliesQuery,
  InventoryChangeRequest,
} from '@/api/supplies';

/**
 * 办公用品管理 Hook
 * @param options 配置项
 */
export function useSuppliesCategory() {
  const treeData = ref<SuppliesCategoryVO[]>([]);
  const loading = ref(false);

  const fetchTree = async () => {
    try {
      loading.value = true;
      const { data } = await suppliesApi.getCategoryTree();
      treeData.value = data || [];
    } catch (error) {
      Message.error('获取分类树失败');
    } finally {
      loading.value = false;
    }
  };

  const save = async (form: SuppliesCategoryVO) => {
    try {
      await suppliesApi.saveCategory(form);
      Message.success('保存成功');
      await fetchTree();
      return true;
    } catch (error) {
      return false;
    }
  };

  const remove = async (id: string) => {
    try {
      await suppliesApi.deleteCategory(id);
      Message.success('删除成功');
      await fetchTree();
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    treeData,
    loading,
    fetchTree,
    save,
    remove,
  };
}

export function useSuppliesItem(autoLoad = true) {
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
      }
    } catch (error) {
      Message.error('获取物品列表失败');
    } finally {
      loading.value = false;
    }
  };

  const save = async (form: SuppliesItemVO) => {
    try {
      await (form.id
        ? suppliesApi.updateItem(form)
        : suppliesApi.saveItem(form));
      Message.success('保存成功');
      await fetchPage();
      return true;
    } catch (error) {
      return false;
    }
  };

  const remove = async (id: string) => {
    try {
      await suppliesApi.deleteItem(id);
      Message.success('删除成功');
      await fetchPage();
      return true;
    } catch (error) {
      return false;
    }
  };

  const changeStock = async (req: InventoryChangeRequest) => {
    try {
      await suppliesApi.changeInventory(req);
      Message.success('操作成功');
      await fetchPage();
      return true;
    } catch (error) {
      return false;
    }
  };

  if (autoLoad) {
    onMounted(() => fetchPage());
  }

  return {
    list,
    loading,
    pagination,
    queryParams,
    fetchPage,
    save,
    remove,
    changeStock,
  };
}
