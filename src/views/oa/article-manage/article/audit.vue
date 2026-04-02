<template>
  <div class="container">
    <Breadcrumb :items="['文章管理', '文章审核详情']" />

    <div class="layout-content">
      <!-- 左侧：文章内容预览 -->
      <div class="main-preview">
        <a-card class="general-card preview-card" :bordered="false">
          <a-spin :loading="loading" style="width: 100%; min-height: 400px">
            <template v-if="article">
              <div class="article-header">
                <h1 class="title">{{ article.title }}</h1>
                <div class="meta">
                  <span class="column-tag">
                    <a-tag color="blue" size="small">
                      {{ getColumnName(article.columnId) }}
                    </a-tag>
                  </span>
                  <span class="author">
                    <icon-user />
                    {{ article.authorName || '系统发布' }}
                  </span>
                  <span class="time">
                    <icon-clock-circle />
                    {{ formatDate(article.publishTime || article.createTime) }}
                  </span>
                </div>
                <!-- 标签展示 -->
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

              <!-- 摘要 -->
              <div v-if="article.summary" class="article-summary">
                <strong>摘要：</strong>{{ article.summary }}
              </div>

              <!-- 正文内容 (渲染 HTML) -->
              <!-- eslint-disable-next-line vue/no-v-html -->
              <div class="article-content" v-html="article.content"></div>

              <!-- 附件下载区 -->
              <div
                v-if="attachments && attachments.length"
                class="article-attachments"
              >
                <div class="attachment-title">
                  附件资料 ({{ attachments.length }})
                </div>
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
            </template>
          </a-spin>
        </a-card>
      </div>

      <!-- 右侧：审核操作表单 -->
      <div class="side-audit-form">
        <a-card
          class="general-card audit-card"
          title="审批决策"
          :bordered="false"
        >
          <a-form :model="auditForm" layout="vertical">
            <a-form-item label="审批结论" required>
              <a-radio-group
                v-model="auditForm.pass"
                type="button"
                size="large"
                style="width: 100%"
              >
                <a-radio :value="true" class="radio-pass">通过</a-radio>
                <a-radio :value="false" class="radio-reject">驳回</a-radio>
              </a-radio-group>
            </a-form-item>

            <a-form-item label="审批意见">
              <a-textarea
                v-model="auditForm.opinion"
                placeholder="请输入详细的审批说明..."
                :max-length="500"
                show-word-limit
                :auto-size="{ minRows: 4, maxRows: 6 }"
              />
            </a-form-item>

            <template v-if="auditForm.pass && article?.status !== 5">
              <a-divider />
              <a-form-item label="定时发布设置">
                <a-space>
                  <span>开启定时</span>
                  <a-switch v-model="auditForm.isReleaseTimed" />
                </a-space>
                <div v-if="auditForm.isReleaseTimed" style="margin-top: 12px">
                  <a-date-picker
                    v-model="auditForm.releaseTime"
                    show-time
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="不选则立即发布"
                    style="width: 100%"
                  />
                </div>
              </a-form-item>

              <a-form-item label="定时下线设置">
                <a-space>
                  <span>开启定时</span>
                  <a-switch v-model="auditForm.isOfflineTimed" />
                </a-space>
                <div v-if="auditForm.isOfflineTimed" style="margin-top: 12px">
                  <a-date-picker
                    v-model="auditForm.offlineTime"
                    show-time
                    format="YYYY-MM-DD HH:mm:ss"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    placeholder="不选则长期有效"
                    style="width: 100%"
                  />
                </div>
              </a-form-item>

              <a-divider />
              <a-form-item label="是否必读设置">
                <a-space>
                  <span>设为必读项</span>
                  <a-switch
                    v-model="auditForm.isMustRead"
                    :checked-value="1"
                    :unchecked-value="0"
                  />
                </a-space>
              </a-form-item>

              <a-divider />
              <a-form-item label="是否置顶发布">
                <a-switch
                  v-model="auditForm.isTop"
                  :checked-value="1"
                  :unchecked-value="0"
                />
              </a-form-item>
              <a-form-item v-if="auditForm.isTop === 1" label="置顶截止时间">
                <a-date-picker
                  v-model="auditForm.topExpireTime"
                  show-time
                  format="YYYY-MM-DD HH:mm:ss"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="到期自动取消置顶"
                  style="width: 100%"
                />
              </a-form-item>
            </template>

            <div class="footer-actions">
              <a-button @click="handleCancel">返回列表</a-button>
              <a-button
                type="primary"
                :loading="submitLoading"
                @click="handleAuditSubmit"
              >
                确认提交
              </a-button>
            </div>
          </a-form>
        </a-card>

        <!-- 文章信息卡片 -->
        <a-card
          class="general-card info-card"
          title="投稿信息"
          :bordered="false"
        >
          <a-descriptions :column="1" size="small">
            <a-descriptions-item label="投稿人">
              {{ article?.authorName }} ({{ article?.authorCode }})
            </a-descriptions-item>
            <a-descriptions-item label="投稿时间">
              {{ formatDate(article?.createTime) }}
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import dayjs from 'dayjs';
  import { Message, Modal } from '@arco-design/web-vue';
  import { useTabBarStore } from '@/store';
  import {
    IconUser,
    IconClockCircle,
    IconFile,
    IconDownload,
  } from '@arco-design/web-vue/es/icon';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import useArticle from '@/hooks/article/useArticle';
  import useArticleColumn from '@/hooks/article/useArticleColumn';
  import type { ArticleVO } from '@/api/article';

  const route = useRoute();
  const router = useRouter();
  const tabBarStore = useTabBarStore();
  const { loading, getDetail, audit } = useArticle();
  const { activeColumns, fetchActiveColumns } = useArticleColumn();

  const article = ref<ArticleVO | null>(null);
  const attachments = ref<any[]>([]);
  const submitLoading = ref(false);

  const auditForm = reactive({
    id: '',
    pass: true,
    opinion: '',
    isTop: 0,
    topExpireTime: '',
    isReleaseTimed: false,
    releaseTime: '',
    isOfflineTimed: false,
    offlineTime: '',
    isMustRead: 0,
  });

  const formatDate = (date?: string | Date) => {
    if (!date) return '-';
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  };

  const getColumnName = (columnId: string) => {
    const col = activeColumns.value.find((c) => c.id === columnId);
    return col ? col.name : '未知专栏';
  };

  const handleAuditSubmit = async () => {
    if (!auditForm.id) return;

    // 1. 定时开关开启时的必填校验
    if (auditForm.pass) {
      if (auditForm.isReleaseTimed && !auditForm.releaseTime) {
        Message.warning('开启定时发布后必须选择发布时间');
        return;
      }
      if (auditForm.isOfflineTimed && !auditForm.offlineTime) {
        Message.warning('开启定时下线后必须选择下线时间');
        return;
      }
    }

    // 2. 校验下线时间是否过期 (如果开启了下线定时)
    if (auditForm.pass && auditForm.isOfflineTimed && auditForm.offlineTime) {
      if (!dayjs(auditForm.offlineTime).isAfter(dayjs())) {
        Modal.confirm({
          title: '下线时间已过期提醒',
          content:
            '您设置或保留的“定时下线时间”早于当前时刻。如果继续提交，文章通过审批后将立即进入“已下线”状态。是否继续？',
          okText: '继续提交(熔断下线)',
          cancelText: '取消(返回修改)',
          onOk: () => doSubmit(),
        });
        return;
      }
    }

    await doSubmit();
  };

  const doSubmit = async () => {
    submitLoading.value = true;
    try {
      const success = await audit(auditForm.id, {
        pass: auditForm.pass,
        opinion: auditForm.opinion,
        isTop: auditForm.isTop,
        topExpireTime: auditForm.topExpireTime
          ? dayjs(auditForm.topExpireTime).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
        isReleaseTimed: auditForm.isReleaseTimed,
        releaseTime: auditForm.releaseTime
          ? dayjs(auditForm.releaseTime).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
        isOfflineTimed: auditForm.isOfflineTimed,
        offlineTime: auditForm.offlineTime
          ? dayjs(auditForm.offlineTime).format('YYYY-MM-DD HH:mm:ss')
          : undefined,
        isMustRead: auditForm.isMustRead,
      });
      if (success) {
        tabBarStore.deleteTagByFullPath(route.fullPath);
        router.back();
      }
    } finally {
      submitLoading.value = false;
    }
  };

  const handleCancel = () => {
    tabBarStore.deleteTagByFullPath(route.fullPath);
    router.back();
  };

  onMounted(async () => {
    await fetchActiveColumns();
    const id = route.query.id as string;
    if (id) {
      auditForm.id = id;
      const data = await getDetail(id);
      article.value = data;
      if (data) {
        // 解析附件
        if (data.attachments) {
          try {
            attachments.value = JSON.parse(data.attachments);
          } catch (e) {
            console.error('解析附件失败:', e);
          }
        }
        auditForm.isReleaseTimed = data.isReleaseTimed || false;
        auditForm.releaseTime = data.releaseTime || '';
        auditForm.isOfflineTimed = data.isOfflineTimed || false;
        auditForm.offlineTime = data.offlineTime || '';
        auditForm.isMustRead = data.isMustRead || 0;
      }
    }
  });
</script>

<style scoped lang="less">
  .container {
    padding: 16px 20px 20px 20px;
    background-color: #f7f9fb;
    min-height: calc(100vh - 90px);
  }

  .layout-content {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .main-preview {
    flex: 1;
    min-width: 0;

    .preview-card {
      border-radius: 8px;
      padding: 40px 60px;
      min-height: 800px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
    }
  }

  .side-audit-form {
    flex: 0 0 380px;
    position: sticky;
    top: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .audit-card,
    .info-card {
      border-radius: 8px;
    }

    .footer-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      button {
        flex: 1;
      }
    }

    .radio-pass {
      flex: 1;
      text-align: center;
    }
    .radio-reject {
      flex: 1;
      text-align: center;
    }
  }

  /* 文章排版样式 */
  .article-header {
    text-align: center;
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--color-border-2);

    .title {
      font-size: 26px;
      font-weight: 600;
      color: var(--color-text-1);
      margin-bottom: 16px;
    }

    .meta {
      display: flex;
      justify-content: center;
      gap: 24px;
      color: var(--color-text-3);
      font-size: 14px;
      span {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
  }

  .article-summary {
    background-color: var(--color-fill-2);
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 32px;
    font-size: 15px;
    line-height: 1.6;
    color: var(--color-text-2);
    border-left: 5px solid var(--color-primary-light-3);
  }

  .article-content {
    font-size: 16px;
    line-height: 1.8;
    color: var(--color-text-1);
    word-break: break-all;

    :deep(p) {
      margin-bottom: 1.2em;
    }
    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      display: block;
      margin: 16px auto;
    }
  }

  /* 附件区域样式 - 与 Portal 保持一致 */
  .article-attachments {
    margin-top: 40px;
    padding: 24px;
    background-color: var(--color-fill-1);
    border-radius: 8px;

    .attachment-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--color-text-1);
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
</style>
