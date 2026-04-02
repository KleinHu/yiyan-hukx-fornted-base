import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import { useUserStore } from '@/store';
import * as articleApi from '@/api/article';
import type { ArticleVO, ArticleQuery } from '@/api/article';

/**
 * 文章管理 Hook
 */
export default function useArticle() {
  const loading = ref(false);
  const articleList = ref<ArticleVO[]>([]);
  const total = ref(0);

  const userStore = useUserStore();

  /**
   * 分页获取文章
   */
  const fetchPage = async (params: ArticleQuery) => {
    try {
      loading.value = true;
      const { data } = await articleApi.getArticlePage(params);
      articleList.value = data?.list || [];
      total.value = data?.total || 0;
    } catch (error) {
      Message.error('获取文章列表失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 分页获取待审批文章
   */
  const fetchAuditPage = async (params: ArticleQuery) => {
    try {
      loading.value = true;
      const { data } = await articleApi.getArticleAuditPage(params);
      articleList.value = data?.list || [];
      total.value = data?.total || 0;
    } catch (error) {
      Message.error('获取审批列表失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 分页获取我的收藏
   */
  const fetchFavoritePage = async (params: ArticleQuery) => {
    try {
      loading.value = true;
      const { data } = await articleApi.getFavoriteArticlePage({
        ...params,
        authorCode: userStore.userCode, // 使用 authorCode 字段传递当前用户工号
      });
      articleList.value = data?.list || [];
      total.value = data?.total || 0;
    } catch (error) {
      Message.error('获取收藏列表失败');
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取详情
   */
  const getDetail = async (id: string) => {
    try {
      loading.value = true;
      const { data } = await articleApi.getArticleDetail(id);
      return data;
    } catch (error) {
      Message.error('获取文章详情失败');
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 保存或更新草稿
   */
  const saveOrUpdate = async (form: ArticleVO) => {
    try {
      loading.value = true;
      // 强制转换数据类型，确保传给后端的是 Integer 而非 Boolean
      const submitData = {
        ...form,
        isMustRead: form.isMustRead ? 1 : 0,
      };

      let newId: string | undefined;
      if (form.id) {
        await articleApi.updateArticle(submitData as ArticleVO);
      } else {
        const { data } = await articleApi.saveArticle(submitData);
        newId = data;
      }
      Message.success('保存草稿成功');
      return { success: true, id: newId };
    } catch (error) {
      Message.error('操作失败');
      return { success: false };
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除文章
   */
  const remove = async (id: string) => {
    try {
      loading.value = true;
      await articleApi.deleteArticle(id);
      Message.success('删除成功');
      return true;
    } catch (error) {
      Message.error('删除文章失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 提交送审
   */
  const submitAudit = async (id: string) => {
    try {
      loading.value = true;
      await articleApi.submitArticleAudit(id);
      Message.success('提交送审成功');
      return true;
    } catch (error) {
      Message.error('提交失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 撤回审批
   */
  const withdraw = async (id: string) => {
    try {
      loading.value = true;
      await articleApi.withdrawArticle(id);
      Message.success('撤回成功');
      return true;
    } catch (error) {
      Message.error('撤回失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 审核
   */
  const audit = async (
    id: string,
    params: {
      pass: boolean;
      opinion?: string;
      isTop?: number;
      topExpireTime?: string;
      isReleaseTimed?: boolean;
      releaseTime?: string;
      isOfflineTimed?: boolean;
      offlineTime?: string;
      isMustRead?: number;
    }
  ) => {
    try {
      loading.value = true;
      await articleApi.auditArticle(id, params);
      Message.success('审核操作成功');
      return true;
    } catch (error) {
      Message.error('审核失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 重新发布/上线
   */
  const publish = async (id: string) => {
    try {
      loading.value = true;
      await articleApi.publishArticle(id);
      Message.success('文章已重新上线');
      return true;
    } catch (error) {
      Message.error('发布失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 下线（直接下线）
   */
  const offline = async (id: string) => {
    try {
      loading.value = true;
      await articleApi.offlineArticle(id);
      Message.success('下线成功');
      return true;
    } catch (error) {
      Message.error('下线失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 申请下线（需审批）
   */
  const applyOffline = async (id: string) => {
    try {
      loading.value = true;
      await articleApi.applyOfflineArticle(id);
      Message.success('已提交下线申请，请等待审批');
      return true;
    } catch (error) {
      Message.error('申请下线失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 置顶开关
   */
  const toggleTop = async (id: string) => {
    try {
      loading.value = true;
      await articleApi.toggleArticleTop(id);
      Message.success('置顶状态修改成功');
      return true;
    } catch (error) {
      Message.error('置顶修改失败');
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 记录阅读
   */
  const recordView = async (id: string, userName: string, userCode: string) => {
    try {
      await articleApi.recordArticleView(id, { userName, userCode });
    } catch (error) {
      // 记录阅读失败不打断主业务
    }
  };

  /**
   * 获取阅读记录
   */
  const fetchViewRecords = async (id: string) => {
    try {
      loading.value = true;
      const { data } = await articleApi.getArticleViewRecords(id);
      return data || [];
    } catch (error) {
      Message.error('获取阅读记录失败');
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 点赞文章
   */
  const likeArticle = async (id: string) => {
    try {
      if (!userStore.userCode) return false;
      await articleApi.likeArticle(id, userStore.userCode);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * 查询是否已点赞
   */
  const hasLiked = async (id: string) => {
    try {
      if (!userStore.userCode) return false;
      const { data } = await articleApi.hasLikedArticle(id, userStore.userCode);
      return data;
    } catch (error) {
      return false;
    }
  };

  /**
   * 收藏文章
   */
  const favoriteArticle = async (id: string) => {
    try {
      if (!userStore.userCode) return false;
      await articleApi.favoriteArticle(id, userStore.userCode);
      return true;
    } catch (error) {
      return false;
    }
  };

  /**
   * 查询是否已收藏
   */
  const hasFavorited = async (id: string) => {
    try {
      if (!userStore.userCode) return false;
      const { data } = await articleApi.hasFavoritedArticle(
        id,
        userStore.userCode
      );
      return data;
    } catch (error) {
      return false;
    }
  };

  return {
    loading,
    articleList,
    total,
    fetchPage,
    fetchAuditPage,
    fetchFavoritePage,
    getDetail,
    saveOrUpdate,
    remove,
    submitAudit,
    withdraw,
    audit,
    publish,
    offline,
    applyOffline,
    toggleTop,
    recordView,
    fetchViewRecords,
    likeArticle,
    hasLiked,
    favoriteArticle,
    hasFavorited,
  };
}
