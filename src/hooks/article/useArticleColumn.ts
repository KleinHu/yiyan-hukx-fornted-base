import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import * as articleApi from '@/api/article';
import type { ArticleColumnVO, ArticleColumnQuery } from '@/api/article';

/**
 * 文章专栏管理 Hook
 */
export default function useArticleColumn() {
  const loading = ref(false);
  const columnList = ref<ArticleColumnVO[]>([]);
  const total = ref(0);

  // 活跃专栏（下拉用）
  const activeColumns = ref<ArticleColumnVO[]>([]);
  const columnTree = ref<ArticleColumnVO[]>([]);

  /**
   * 获取专栏树
   */
  const fetchTree = async (params: ArticleColumnQuery = {}) => {
    try {
      loading.value = true;
      const { data } = await articleApi.getColumnListTree(params);
      columnTree.value = data || [];
    } catch (error) {
      Message.error('获取专栏树失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 分页获取专栏
   */
  const fetchPage = async (params: ArticleColumnQuery) => {
    try {
      loading.value = true;
      const { data } = await articleApi.getColumnPage(params);
      columnList.value = data?.list || [];
      total.value = data?.total || 0;
    } catch (error) {
      Message.error('获取专栏列表失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取所有启用专栏
   */
  const fetchActiveColumns = async () => {
    try {
      const { data } = await articleApi.getColumnListAll();
      activeColumns.value = data || [];
    } catch (error) {
      Message.error('获取有效专栏列表失败');
    }
  };

  /**
   * 保存或更新专栏
   */
  const saveOrUpdate = async (form: ArticleColumnVO) => {
    try {
      loading.value = true;
      if (form.id) {
        await articleApi.updateColumn(form);
      } else {
        await articleApi.saveColumn(form);
      }
      Message.success('保存专栏成功');
      return true;
    } catch (error) {
      Message.error('保存专栏失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除专栏
   */
  const remove = async (id: string) => {
    try {
      loading.value = true;
      await articleApi.deleteColumn(id);
      Message.success('删除成功');
      return true;
    } catch (error) {
      Message.error('删除失败，可能该专栏下仍有文章');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 变更状态
   */
  const changeStatus = async (id: string, status: number) => {
    try {
      loading.value = true;
      await articleApi.updateColumnStatus(id, status);
      Message.success('状态变更成功');
      return true;
    } catch (error) {
      Message.error('状态变更失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 根据 ID 获取专栏名称
   */
  const getColumnName = (id?: string) => {
    const col = activeColumns.value.find((c) => c.id === id);
    return col ? col.name : '未知专栏';
  };

  return {
    loading,
    columnList,
    total,
    activeColumns,
    columnTree,
    fetchPage,
    fetchActiveColumns,
    fetchTree,
    saveOrUpdate,
    remove,
    changeStatus,
    getColumnName,
  };
}
