import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import * as suppliesApi from '@/api/supplies';
import type { SuppliesCategoryVO } from '@/api/supplies';

/**
 * 办公用品分类管理 Hook
 */
export default function useSuppliesCategory() {
  const treeData = ref<SuppliesCategoryVO[]>([]);
  const loading = ref(false);

  /**
   * 获取分类树
   */
  const fetchTree = async () => {
    try {
      loading.value = true;
      const { data } = await suppliesApi.getCategoryTree();
      // 添加“全部分类”节点
      const allNode: SuppliesCategoryVO = {
        id: '0',
        name: '全部分类',
        children: [],
        parentId: '-1',
      };
      treeData.value = [allNode, ...(data || [])];
    } catch (error) {
      Message.error('获取分类树失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 保存分类 (新增或修改)
   */
  const save = async (form: SuppliesCategoryVO) => {
    try {
      loading.value = true;
      if (form.id) {
        await suppliesApi.updateCategory(form);
      } else {
        await suppliesApi.saveCategory(form);
      }
      Message.success('保存成功');
      await fetchTree();
      return true;
    } catch (error) {
      Message.error('保存分类失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除分类
   */
  const remove = async (id: string) => {
    try {
      loading.value = true;
      await suppliesApi.deleteCategory(id);
      Message.success('删除成功');
      await fetchTree();
      return true;
    } catch (error) {
      Message.error('删除分类失败');
      return false;
    } finally {
      loading.value = false;
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
