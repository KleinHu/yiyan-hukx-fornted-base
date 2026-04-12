import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import * as documentApi from '@/api/documents/document';
import type { DocumentCategoryRecord } from '@/api/documents/document';

/**
 * 文档分类 Hook
 */
export default function useDocumentCategory() {
  const loading = ref(false);
  const categoryTree = ref<DocumentCategoryRecord[]>([]);

  /**
   * 获取分类树
   */
  const fetchTree = async () => {
    try {
      loading.value = true;
      const { data } = await documentApi.getDocumentCategoryTree();
      categoryTree.value = data || [];
    } catch (error) {
      Message.error('获取分类列表失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 保存或更新分类
   */
  const saveOrUpdate = async (form: Partial<DocumentCategoryRecord>) => {
    try {
      loading.value = true;
      if (form.id) {
        await documentApi.updateDocumentCategory(form);
      } else {
        await documentApi.addDocumentCategory(form);
      }
      Message.success('操作成功');
      return true;
    } catch (error) {
      Message.error('操作失败');
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
      await documentApi.deleteDocumentCategory(id);
      Message.success('删除成功');
      return true;
    } catch (error) {
      Message.error('删除分类失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    categoryTree,
    fetchTree,
    saveOrUpdate,
    remove,
  };
}
