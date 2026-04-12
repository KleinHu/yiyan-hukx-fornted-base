import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import * as documentApi from '@/api/documents/document';
import type {
  DocumentRecord,
  DocumentQuery,
  ChangeVersionReq,
} from '@/api/documents/document';

/**
 * 文档管理 Hook
 */
export default function useDocument() {
  const loading = ref(false);
  const documentList = ref<DocumentRecord[]>([]);
  const total = ref(0);

  /**
   * 分页获取文档列表
   */
  const fetchPage = async (params: DocumentQuery) => {
    try {
      loading.value = true;
      const { data } = await documentApi.getDocumentPage(params);
      documentList.value = data?.list || [];
      total.value = data?.total || 0;
    } catch (error) {
      Message.error('获取文档列表失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 保存或更新文档
   */
  const saveOrUpdate = async (form: Partial<DocumentRecord>) => {
    try {
      loading.value = true;
      if (form.id) {
        await documentApi.updateDocument(form);
      } else {
        await documentApi.addDocument(form);
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
   * 换版
   */
  const changeVersion = async (req: ChangeVersionReq) => {
    try {
      loading.value = true;
      await documentApi.changeDocumentVersion(req);
      Message.success('换版成功');
      return true;
    } catch (error) {
      Message.error('换版失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 物理删除历史版本
   */
  const remove = async (id: string) => {
    try {
      loading.value = true;
      await documentApi.deleteDocument(id);
      Message.success('删除成功');
      return true;
    } catch (error) {
      Message.error('删除文章失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    documentList,
    total,
    fetchPage,
    saveOrUpdate,
    changeVersion,
    remove,
  };
}
