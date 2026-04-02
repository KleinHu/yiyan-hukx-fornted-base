<template>
  <div class="container article-detail-container">
    <Breadcrumb :items="['企业文化', '文章阅读']" />

    <div class="layout-content">
      <a-card class="general-card detail-card" :bordered="false">
        <a-spin :loading="loading" style="width: 100%; min-height: 400px">
          <template v-if="article">
            <!-- 预览模式横幅 -->
            <a-alert
              v-if="isPreview"
              type="warning"
              banner
              closable
              style="margin-bottom: 16px; border-radius: 4px"
            >
              当前为预览模式，文章尚未正式发布，仅作者和管理人员可见。
            </a-alert>

            <!-- 头部信息 -->
            <div class="article-header">
              <h1 class="title">
                <a-tag
                  v-if="article.isMustRead === 1"
                  color="orange"
                  size="large"
                  style="vertical-align: middle; margin-right: 12px"
                >
                  <template #icon><icon-notification /></template>
                  必读
                </a-tag>
                <span style="vertical-align: middle">{{ article.title }}</span>
              </h1>
              <div class="meta">
                <span class="column-tag">
                  <a-tag color="blue" size="small">
                    {{ getColumnName(article.columnId) }}
                  </a-tag>
                </span>
                <span class="author">
                  <icon-user />
                  {{ article.authorName || '系统发布' }}
                  <template v-if="article.authorCode">
                    / {{ article.authorCode }}
                    <template v-if="authorDetail?.departmentName">
                      / {{ authorDetail.departmentName }}
                    </template>
                  </template>
                </span>
                <span class="time">
                  <icon-clock-circle />
                  {{ formatDate(article.publishTime || article.createTime) }}
                </span>
                <span class="view">
                  <icon-eye />
                  {{ article.viewCount || 0 }} 阅读
                </span>
                <span class="like">
                  <icon-thumb-up />
                  {{ article.likeCount || 0 }}
                </span>
                <span class="favorite">
                  <icon-star />
                  {{ article.favoriteCount || 0 }}
                </span>
              </div>
              <div v-if="article.tags" class="article-tags">
                <a-space wrap>
                  <a-tag
                    v-for="tag in article.tags.split(',').filter((t) => !!t)"
                    :key="tag"
                    color="arcoblue"
                    size="small"
                  >
                    {{ tag }}
                  </a-tag>
                </a-space>
              </div>
            </div>

            <!-- 摘要（如果有） -->
            <div v-if="article.summary" class="article-summary">
              <strong>摘要：</strong>{{ article.summary }}
            </div>

            <!-- 正文内容 (渲染 HTML) -->
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="article-content" v-html="article.content"></div>

            <!-- 附件下载 -->
            <div v-if="attachments.length" class="article-attachments">
              <div class="section-title">附件下载</div>
              <div class="attachment-list">
                <div
                  v-for="(file, index) in attachments"
                  :key="index"
                  class="attachment-item"
                >
                  <div class="file-info">
                    <icon-file class="file-icon" />
                    <span class="file-name">{{ file.name }}</span>
                  </div>
                  <a :href="file.url" target="_blank" class="download-link">
                    <icon-download /> 下载
                  </a>
                </div>
              </div>
            </div>

            <!-- 点赞与互动 -->
            <div v-if="!isPreview" class="article-actions">
              <div class="action-item like-section" @click="handleLike">
                <div
                  class="action-btn like-btn"
                  :class="{ 'is-liked': isLiked }"
                >
                  <icon-thumb-up-fill v-if="isLiked" />
                  <icon-thumb-up v-else />
                </div>
                <div class="action-count like-count">
                  {{ article.likeCount || 0 }} 人觉得很赞
                </div>
              </div>

              <div class="action-item favorite-section" @click="handleFavorite">
                <div
                  class="action-btn favorite-btn"
                  :class="{ 'is-favorited': isFavorited }"
                >
                  <icon-star-fill v-if="isFavorited" />
                  <icon-star v-else />
                </div>
                <div class="action-count favorite-count">
                  {{ isFavorited ? '已收藏' : '收藏本文' }}
                </div>
              </div>
            </div>

            <!-- 评论区 -->
            <div v-if="!isPreview" class="comment-section">
              <div class="section-title">全部评论 ({{ commentTotal }})</div>

              <!-- 发表评论 -->
              <div class="comment-input-wrapper">
                <a-textarea
                  v-model="commentContent"
                  placeholder="写下你的评论..."
                  :max-length="200"
                  show-word-limit
                  :auto-size="{ minRows: 3, maxRows: 5 }"
                />
                <div class="submit-btn-row">
                  <a-button
                    type="primary"
                    :loading="commentLoading"
                    @click="handleSubmitComment"
                  >
                    发表评论
                  </a-button>
                </div>
              </div>

              <!-- 评论列表 -->
              <a-list :bordered="false" :loading="commentsLoading">
                <a-list-item v-for="item in commentList" :key="item.id">
                  <div class="comment-item">
                    <div class="comment-user">
                      <a-avatar :size="32" style="background-color: #3370ff">
                        {{ (item.userName || 'U')[0] }}
                      </a-avatar>
                      <div class="user-info">
                        <div class="name">
                          {{ item.userName }} - {{ item.userCode }}
                          <a-tag
                            v-if="item.userCode === article.authorCode"
                            color="arcoblue"
                            size="small"
                            style="margin-left: 8px"
                            >作者</a-tag
                          >
                        </div>
                        <div class="time">
                          {{ formatDate(item.createTime) }}
                        </div>
                      </div>
                      <div class="item-actions">
                        <a-popconfirm
                          v-if="canDeleteComment(item)"
                          content="确定要删除这条评论吗？"
                          type="warning"
                          @ok="handleDeleteComment(item.id!)"
                        >
                          <a-button type="text" status="danger" size="small">
                            删除
                          </a-button>
                        </a-popconfirm>
                      </div>
                    </div>
                    <div class="comment-content">
                      {{ item.content }}
                    </div>
                  </div>
                </a-list-item>
                <template #empty>
                  <div
                    style="
                      padding: 40px 0;
                      text-align: center;
                      color: var(--color-text-3);
                    "
                  >
                    暂无评论，快来抢沙发吧~
                  </div>
                </template>
              </a-list>

              <!-- 分页 -->
              <div
                v-if="commentTotal > commentParams.pageSize"
                class="pagination-wrapper"
              >
                <a-pagination
                  v-model:current="commentParams.pageNo"
                  :total="commentTotal"
                  :page-size="commentParams.pageSize"
                  simple
                  @change="onCommentPageChange"
                />
              </div>
            </div>
            <div v-else class="preview-footer-tip">
              预览模式下暂不支持发表评论和点赞互动
            </div>
          </template>

          <template v-else-if="loading">
            <!-- 加载中的骨架屏占位 -->
            <div style="padding: 24px">
              <a-skeleton animation>
                <a-space direction="vertical" :size="24" style="width: 100%">
                  <a-skeleton-line
                    :rows="1"
                    :widths="['50%']"
                    :line-height="32"
                  />
                  <a-skeleton-line :rows="1" :widths="['40%']" />
                  <a-skeleton-line :rows="10" />
                </a-space>
              </a-skeleton>
            </div>
          </template>

          <a-empty
            v-else
            description="文章不存在或已被删除"
            style="margin-top: 100px"
          >
            <template #extra>
              <a-button type="primary" @click="$router.back()">
                返回上一级
              </a-button>
            </template>
          </a-empty>
        </a-spin>
      </a-card>
    </div>

    <!-- 必读已阅回执悬浮栏 -->
    <transition name="slide-up">
      <div
        v-if="isMustReadVisible"
        class="must-read-bar"
        :class="{
          'is-active': canConfirmRead && !receiptLoading,
          'is-done': hasRead && !receiptLoading,
        }"
      >
        <a-spin :loading="receiptLoading" style="width: 100%">
          <div
            class="must-read-content"
            :style="{ visibility: receiptLoading ? 'hidden' : 'visible' }"
          >
            <div class="left-info">
              <icon-info-circle-fill class="info-icon" />
              <span v-if="!hasRead" class="text"
                >此类文章为必读项，请仔细阅读后确认知晓</span
              >
              <span v-else class="text">您已完成阅读确认，感谢配合</span>
            </div>
            <div class="right-action">
              <a-button
                v-if="!hasRead"
                type="primary"
                :disabled="!canConfirmRead"
                :loading="confirmReading"
                @click="handleConfirmRead"
              >
                <template v-if="canConfirmRead">我已阅读并知晓</template>
                <template v-else
                  >请仔细阅读文章内容 ({{ readCountdown }}s)</template
                >
              </a-button>
              <a-tag v-else color="green" size="large">
                <template #icon><icon-check-circle-fill /></template>
                已阅确认
              </a-tag>
            </div>
          </div>
        </a-spin>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import { useUserStore } from '@/store';
  import useArticle from '@/hooks/article/useArticle';
  import useArticleColumn from '@/hooks/article/useArticleColumn';
  import employeeApi from '@/api/hr/employee';
  import { formatDate } from '@/utils/date';
  import * as articleApi from '@/api/article';
  import type { ArticleVO, ArticleCommentVO } from '@/api/article';

  const route = useRoute();
  const userStore = useUserStore();
  const {
    loading,
    getDetail,
    recordView,
    likeArticle,
    hasLiked,
    favoriteArticle,
    hasFavorited,
  } = useArticle();
  const { fetchActiveColumns, getColumnName } = useArticleColumn();

  const article = ref<ArticleVO | null>(null);
  const authorDetail = ref<any>(null);
  const attachments = ref<any[]>([]);

  // 必读回执相关
  const hasRead = ref(false);
  const receiptLoading = ref(false);
  const readCountdown = ref(15);
  const canConfirmRead = ref(false);
  const confirmReading = ref(false);
  let countdownTimer: any = null;

  const isMustReadVisible = computed(() => {
    return article.value?.isMustRead === 1 && !isPreview.value;
  });

  // 互动相关
  const isLiked = ref(false);
  const isFavorited = ref(false);

  // 预览模式判断：非发布状态 (status !== 2) 即为预览
  const isPreview = computed(() => {
    return article.value && article.value.status !== 2;
  });

  // 评论相关
  const commentList = ref<ArticleCommentVO[]>([]);
  const commentTotal = ref(0);
  const commentsLoading = ref(false);
  const commentLoading = ref(false);
  const commentContent = ref('');
  const commentParams = reactive({
    pageNo: 1,
    pageSize: 10,
    articleId: '',
  });

  const loadArticle = async () => {
    loading.value = true;
    await fetchActiveColumns();

    const id = route.query.id as string;
    if (id) {
      const data = await getDetail(id);
      article.value = data;

      // 解析附件
      if (data?.attachments) {
        try {
          attachments.value = JSON.parse(data.attachments);
        } catch (e) {
          attachments.value = [];
        }
      }

      // 记录阅读 (非预览模式 且 已发布状态)
      if (!isPreview.value && data && data.status === 2) {
        recordView(id, userStore.username || '', userStore.userCode || '');
      }

      // 如果有作者工号，去 HR 接口补全部门信息
      if (data?.authorCode) {
        try {
          const res = await employeeApi.getEmployeeByUserCode(data.authorCode);
          if (res.data) {
            authorDetail.value = res.data;
          }
        } catch (error) {
          // ignore
        }
      }

      // 查询初始互动状态
      checkStatus(id);

      // 加载评论
      commentParams.articleId = id;
      fetchComments();

      // 如果是必读文章，校验回执状态并可能倒计时
      if (data?.isMustRead === 1 && !isPreview.value) {
        checkMustReadStatus(id);
      }
    } else {
      loading.value = false;
    }
  };

  const checkMustReadStatus = async (id: string) => {
    if (!userStore.userCode) return;
    receiptLoading.value = true;
    try {
      const res = await articleApi.hasReadArticle(id, userStore.userCode);
      if (res.data) {
        hasRead.value = true;
      } else {
        startReadCountdown();
      }
    } catch (e) {
      //
    } finally {
      receiptLoading.value = false;
    }
  };

  const startReadCountdown = () => {
    readCountdown.value = 15;
    canConfirmRead.value = false;
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      readCountdown.value -= 1;
      if (readCountdown.value <= 0) {
        clearInterval(countdownTimer);
        canConfirmRead.value = true;
      }
    }, 1000);
  };

  const handleConfirmRead = async () => {
    if (!article.value?.id || !userStore.userCode) return;
    confirmReading.value = true;
    try {
      await articleApi.submitArticleReceipt(article.value.id, {
        articleId: article.value.id,
        userId: userStore.userCode,
        userName: userStore.username || '',
      });
      Message.success('回执提交成功，感谢阅读！');
      hasRead.value = true;
      canConfirmRead.value = false;
    } finally {
      confirmReading.value = false;
    }
  };

  const checkStatus = async (id: string) => {
    if (!userStore.userCode) return;
    const [liked, favorited] = await Promise.all([
      hasLiked(id),
      hasFavorited(id),
    ]);
    isLiked.value = liked;
    isFavorited.value = favorited;
  };

  const handleLike = async () => {
    if (!article.value?.id) return;
    const success = await likeArticle(article.value.id);
    if (success) {
      if (isLiked.value) {
        // 取消点赞
        if (article.value.likeCount) article.value.likeCount -= 1;
        Message.success('已取消点赞');
      } else {
        // 点赞
        article.value.likeCount = (article.value.likeCount || 0) + 1;
        Message.success('点赞成功');
      }
      isLiked.value = !isLiked.value;
    }
  };

  const handleFavorite = async () => {
    if (!article.value?.id) return;
    const success = await favoriteArticle(article.value.id);
    if (success) {
      isFavorited.value = !isFavorited.value;
      Message.success(isFavorited.value ? '收藏成功' : '已取消收藏');
    }
  };

  const fetchComments = async () => {
    commentsLoading.value = true;
    try {
      const res = await articleApi.articleCommentApi.list({
        articleId: commentParams.articleId,
        pageNum: commentParams.pageNo,
        pageSize: commentParams.pageSize,
      });
      if (res.data) {
        commentList.value = res.data.list || [];
        commentTotal.value = res.data.total || 0;
      }
    } finally {
      commentsLoading.value = false;
    }
  };

  const onCommentPageChange = (current: number) => {
    commentParams.pageNo = current;
    fetchComments();
  };

  const handleSubmitComment = async () => {
    if (!commentContent.value.trim()) {
      Message.warning('请输入评论内容');
      return;
    }
    commentLoading.value = true;
    try {
      const res = (await articleApi.articleCommentApi.create({
        articleId: article.value?.id,
        content: commentContent.value,
        userCode: userStore.userCode,
        userName: userStore.username,
      })) as any;
      if (res.code === 200) {
        Message.success('发表成功');
        commentContent.value = '';
        commentParams.pageNo = 1;
        fetchComments();
      }
    } finally {
      commentLoading.value = false;
    }
  };

  const canDeleteComment = (comment: ArticleCommentVO) => {
    const roles = userStore.roles || [];
    const isAdmin = roles.includes('admin');
    const isAuthor = article.value?.authorCode === userStore.userCode;
    const isCommenter = comment.userCode === userStore.userCode;
    return isAdmin || isAuthor || isCommenter;
  };

  const handleDeleteComment = async (id: string) => {
    const res = (await articleApi.articleCommentApi.delete(id)) as any;
    if (res.code === 200) {
      Message.success('删除成功');
      fetchComments();
    }
  };

  onMounted(() => {
    loadArticle();
  });

  onUnmounted(() => {
    if (countdownTimer) clearInterval(countdownTimer);
  });
</script>

<style scoped lang="less">
  .article-detail-container {
    padding: 16px 20px 20px 20px;
    background-color: #f7f9fb;
    min-height: calc(100vh - 90px);
    position: relative;
    padding-bottom: 80px; /* 为必读栏留出空间 */
  }

  .detail-card {
    min-height: 600px;
    border-radius: 8px;
    border: 1px solid #e5e6eb;

    /* 限制文章最大宽度，提升阅读体验 */
    :deep(.arco-card-body) {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 24px;
    }
  }

  .article-header {
    text-align: center;
    margin-bottom: 32px;
    border-bottom: 1px solid var(--color-border-2);
    padding-bottom: 24px;

    .title {
      font-size: 28px;
      font-weight: 600;
      color: var(--color-text-1);
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .meta {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 24px;
      color: var(--color-text-3);
      font-size: 14px;

      span {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    .article-tags {
      margin-top: 12px;
      display: flex;
      justify-content: center;
    }
  }

  .article-summary {
    background-color: var(--color-fill-2);
    padding: 16px;
    border-radius: 4px;
    margin-bottom: 32px;
    font-size: 14px;
    color: var(--color-text-2);
    line-height: 1.6;
    border-left: 4px solid var(--color-primary-light-3);

    strong {
      color: var(--color-text-1);
    }
  }

  /* 富文本内容样式重置，确保在 Arco 体系下显示正常 */
  .article-content {
    font-size: 16px;
    color: var(--color-text-1);
    line-height: 1.8;
    word-wrap: break-word;

    :deep(p) {
      margin-bottom: 1em;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 16px 0;
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5) {
      margin: 1.5em 0 0.5em;
      color: var(--color-text-1);
      font-weight: 600;
      line-height: 1.4;
    }

    :deep(a) {
      color: var(--color-primary-light-4);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }

    :deep(ul),
    :deep(ol) {
      padding-left: 2em;
      margin-bottom: 1em;
    }

    :deep(blockquote) {
      border-left: 4px solid var(--color-border-3);
      padding-left: 1em;
      color: var(--color-text-3);
      margin: 1em 0;
      background-color: var(--color-fill-1);
      padding: 10px 16px;
    }

    :deep(table) {
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 1em;

      th,
      td {
        border: 1px solid var(--color-border-2);
        padding: 8px 12px;
      }

      th {
        background-color: var(--color-fill-2);
      }
    }
  }

  /* 附件区域 */
  .article-attachments {
    margin-top: 40px;
    padding: 24px;
    background-color: var(--color-fill-1);
    border-radius: 8px;

    .section-title {
      font-size: 16px !important;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--color-text-1);
      padding-left: 0 !important;
      border-left: none !important;
    }

    .attachment-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .attachment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background-color: var(--color-bg-2);
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        background-color: var(--color-fill-2);
      }

      .file-info {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--color-text-2);

        .file-icon {
          font-size: 20px;
          color: var(--color-primary);
        }

        .file-name {
          font-size: 14px;
        }
      }

      .download-link {
        display: flex;
        align-items: center;
        gap: 4px;
        color: var(--color-primary);
        text-decoration: none;
        font-size: 14px;
        font-weight: 500;

        &:hover {
          color: var(--color-primary-light-4);
        }
      }
    }
  }

  /* 底部互动区 */
  .article-actions {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 64px;
    margin: 48px 0;
    padding-bottom: 48px;
    border-bottom: 1px solid var(--color-border-1);

    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s;

      .action-btn {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background-color: var(--color-fill-3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        color: var(--color-text-3);
        margin-bottom: 12px;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;

        &:hover {
          transform: scale(1.1);
          background-color: var(--color-fill-4);
        }
      }

      .action-count {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-2);
        line-height: 1.4;
      }

      /* 点赞激活态 */
      &.like-section {
        .like-btn.is-liked {
          background-color: #ff4d4f !important;
          color: #fff !important;
          box-shadow: 0 4px 12px rgba(255, 77, 79, 0.4);
        }
        &:hover:not(.is-liked) .like-btn {
          background-color: rgba(255, 77, 79, 0.1);
          color: #ff4d4f;
        }
      }

      /* 收藏激活态 */
      &.favorite-section {
        .favorite-btn.is-favorited {
          background-color: #ffb400 !important;
          color: #fff !important;
          box-shadow: 0 4px 12px rgba(255, 180, 0, 0.4);
        }
        &:hover:not(.is-favorited) .favorite-btn {
          background-color: rgba(255, 180, 0, 0.1);
          color: #ffb400;
        }
      }
    }
  }

  .comment-section {
    margin-top: 32px;

    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 24px;
      padding-left: 12px;
      border-left: 4px solid var(--color-primary);
    }

    .comment-input-wrapper {
      margin-bottom: 32px;
      background: var(--color-fill-1);
      padding: 16px;
      border-radius: 8px;

      .submit-btn-row {
        margin-top: 12px;
        display: flex;
        justify-content: flex-end;
      }
    }

    .comment-item {
      padding: 8px 0;

      .comment-user {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .user-info {
          flex: 1;
          .name {
            font-weight: 500;
            font-size: 14px;
            color: var(--color-text-1);
          }
          .time {
            font-size: 12px;
            color: var(--color-text-4);
          }
        }
      }

      .comment-content {
        padding-left: 44px;
        font-size: 14px;
        color: var(--color-text-2);
        line-height: 1.6;
        white-space: pre-wrap;
      }
    }

    .pagination-wrapper {
      margin-top: 24px;
      display: flex;
      justify-content: center;
    }
  }

  /* 必读回执浮窗横幅 */
  .must-read-bar {
    position: fixed;
    bottom: 0;
    left: 240px; /* 侧边栏宽度，视系统布局可调 */
    right: 0;
    height: 72px;
    background-color: #fff;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &.is-active {
      background-color: #e8f3ff;
      border-top: 2px solid #165dff;
    }

    &.is-done {
      background-color: #e8ffea;
      border-top: 2px solid #00b42a;
    }

    .must-read-content {
      width: 100%;
      max-width: 900px;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .left-info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 500;
        color: var(--color-text-1);

        .info-icon {
          font-size: 20px;
          color: #ff7d00;
        }
      }
    }

    &.is-done .left-info .info-icon {
      color: #00b42a;
    }
  }

  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: all 0.3s ease-out;
  }
  .slide-up-enter-from,
  .slide-up-leave-to {
    transform: translateY(100%);
    opacity: 0;
  }
</style>
