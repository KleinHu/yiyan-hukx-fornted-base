<template>
  <div class="container">
    <Breadcrumb :items="['企业文化', '我的文章']" />

    <div class="layout-content">
      <a-card class="general-card" title="我的发布库">
        <template #extra>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            发布新文章
          </a-button>
        </template>

        <!-- 我的文章概览统计 - 重构高级感看板 -->
        <div class="stats-grid">
          <div class="stat-card published">
            <div class="stat-icon-wrapper">
              <icon-check-circle-fill class="stat-icon" />
            </div>
            <div class="stat-info">
              <div class="stat-label">已发布稿件</div>
              <div class="stat-value">{{ stats.published }}</div>
            </div>
            <div class="card-bg-icon"><icon-check-circle-fill /></div>
          </div>

          <div class="stat-card auditing">
            <div class="stat-icon-wrapper">
              <icon-clock-circle class="stat-icon" />
            </div>
            <div class="stat-info">
              <div class="stat-label">正在审核中</div>
              <div class="stat-value">{{ stats.auditing }}</div>
            </div>
            <div class="card-bg-icon"><icon-clock-circle /></div>
          </div>

          <div class="stat-card draft">
            <div class="stat-icon-wrapper">
              <icon-edit class="stat-icon" />
            </div>
            <div class="stat-info">
              <div class="stat-label">草稿/被驳回</div>
              <div class="stat-value">{{ stats.draft }}</div>
            </div>
            <div class="card-bg-icon"><icon-edit /></div>
          </div>

          <div class="stat-card views">
            <div class="stat-icon-wrapper">
              <icon-eye class="stat-icon" />
            </div>
            <div class="stat-info">
              <div class="stat-label">累计阅读量</div>
              <div class="stat-value">{{ stats.viewCount }}</div>
            </div>
            <div class="card-bg-icon"><icon-eye /></div>
          </div>
        </div>

        <a-divider />

        <!-- 搜索与过滤 -->
        <a-row style="margin-bottom: 16px">
          <a-col :span="24">
            <a-space>
              <a-input
                v-model="queryParams.title"
                placeholder="搜索文章标题..."
                style="width: 280px"
                allow-clear
                @press-enter="handleSearch"
                @clear="handleSearch"
              >
                <template #prefix>
                  <icon-search />
                </template>
              </a-input>
              <a-select
                v-model="queryParams.status"
                placeholder="按状态过滤"
                style="width: 160px"
                allow-clear
                @change="handleSearch"
              >
                <a-option :value="0">草稿</a-option>
                <a-option :value="1">待审核</a-option>
                <a-option :value="2">已发布</a-option>
                <a-option :value="3">被驳回</a-option>
                <a-option :value="4">已下线</a-option>
                <a-option :value="5">下线审批中</a-option>
                <a-option :value="6">定时发布</a-option>
              </a-select>
              <a-button type="primary" @click="handleSearch">
                <template #icon><icon-search /></template>
                查询
              </a-button>
              <a-button @click="resetQuery">
                <template #icon><icon-refresh /></template>
                重置
              </a-button>
            </a-space>
          </a-col>
        </a-row>

        <!-- 文章列表表格 -->
        <a-table
          row-key="id"
          :loading="loading"
          :data="articleList"
          :pagination="{
            current: queryParams.pageNo,
            pageSize: queryParams.pageSize,
            total,
            showTotal: true,
          }"
          @page-change="onPageChange"
        >
          <template #columns>
            <a-table-column title="文章标题" ellipsis tooltip>
              <template #cell="{ record }">
                <a-space>
                  <a-tag v-if="record.isTop === 1" color="red" size="small">
                    置顶
                  </a-tag>
                  <a-tag
                    v-if="record.isMustRead === 1"
                    color="orange"
                    size="small"
                  >
                    必读
                  </a-tag>
                  <span class="link-title" @click="handlePreview(record)">
                    {{ record.title }}
                  </span>
                </a-space>
              </template>
            </a-table-column>
            <a-table-column title="所属专栏" align="center" :width="150">
              <template #cell="{ record }">
                {{ getColumnName(record.columnId) }}
              </template>
            </a-table-column>
            <a-table-column title="状态" :width="120" align="center">
              <template #cell="{ record }">
                <ArticleStatusTag :status="record.status" />
              </template>
            </a-table-column>
            <a-table-column
              title="阅读量"
              data-index="viewCount"
              align="center"
              :width="90"
            />
            <a-table-column
              title="点赞数"
              data-index="likeCount"
              align="center"
              :width="100"
            >
              <template #cell="{ record }">
                {{ record.likeCount || 0 }}
              </template>
            </a-table-column>
            <a-table-column
              title="收藏数"
              data-index="favoriteCount"
              align="center"
              :width="100"
            >
              <template #cell="{ record }">
                {{ record.favoriteCount || 0 }}
              </template>
            </a-table-column>
            <a-table-column title="最后修改" :width="180">
              <template #cell="{ record }">
                {{ formatDate(record.updateTime || record.createTime) }}
              </template>
            </a-table-column>
            <a-table-column title="操作" align="center" :width="300">
              <template #cell="{ record }">
                <a-space>
                  <!-- 草稿、驳回、下线可以编辑 -->
                  <a-button
                    v-if="[0, 3, 4].includes(record.status)"
                    type="text"
                    size="small"
                    @click="handleEdit(record)"
                  >
                    编辑
                  </a-button>

                  <!-- 已发布的文章支持申请下线 -->
                  <a-popconfirm
                    v-if="record.status === 2"
                    content="下线操作需要管理员审批，确定要提交下线申请吗？"
                    @ok="handleApplyOffline(record.id)"
                  >
                    <a-button type="text" size="small" status="warning">
                      申请下线
                    </a-button>
                  </a-popconfirm>

                  <!-- 待审核状态（含发布审核与下线审核）可以撤回 -->
                  <a-popconfirm
                    v-if="[1, 5].includes(record.status)"
                    content="确定要撤回该申请吗？"
                    @ok="handleWithdraw(record.id)"
                  >
                    <a-button type="text" size="small" status="warning">
                      撤回
                    </a-button>
                  </a-popconfirm>

                  <!-- 对已发布为浏览，未发布的为预览模式 -->
                  <a-button
                    type="text"
                    size="small"
                    @click="handlePreview(record)"
                  >
                    {{ record.status === 2 ? '浏览' : '预览' }}
                  </a-button>

                  <a-dropdown>
                    <a-button type="text" size="small">
                      <icon-more />
                    </a-button>
                    <template #content>
                      <!-- 草稿、驳回、下线 -> 提交送审 -->
                      <a-doption
                        v-if="[0, 3, 4].includes(record.status)"
                        @click="handleSubmitAudit(record.id)"
                      >
                        <template #icon><icon-check-circle /></template>
                        <span style="color: var(--color-success-6)"
                          >提交送审</span
                        >
                      </a-doption>

                      <!-- 已发布/下线状态 -> 浏览明细 -->
                      <a-doption
                        v-if="[2, 4].includes(record.status)"
                        @click="handleShowViewRecords(record.id)"
                      >
                        <template #icon><icon-bar-chart /></template>
                        <span>浏览情况</span>
                      </a-doption>

                      <a-doption
                        v-if="[0, 3, 4].includes(record.status)"
                        @click="handleDelete(record.id)"
                      >
                        <template #icon><icon-delete /></template>
                        <span style="color: var(--color-danger-6)"
                          >彻底删除</span
                        >
                      </a-doption>
                    </template>
                  </a-dropdown>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 浏览情况抽屉 (已抽离复用) -->
    <ViewRecordsDrawer
      v-model:visible="recordsVisible"
      :article-id="currentArticleId"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    IconPlus,
    IconSearch,
    IconRefresh,
    IconClockCircle,
    IconCheckCircleFill,
    IconCheckCircle,
    IconEye,
    IconDelete,
    IconEdit,
    IconMore,
    IconBarChart,
  } from '@arco-design/web-vue/es/icon';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import { useUserStore } from '@/store';
  import useArticle from '@/hooks/article/useArticle';
  import useArticleColumn from '@/hooks/article/useArticleColumn';
  import { formatDate } from '@/utils/date';
  import { getMyArticleStats } from '@/api/article';
  import type { ArticleVO, ArticleQuery } from '@/api/article';
  import ArticleStatusTag from '@/components/article/ArticleStatusTag.vue';
  import ViewRecordsDrawer from '@/components/article/ViewRecordsDrawer.vue';

  const router = useRouter();
  const userStore = useUserStore();
  const {
    loading,
    articleList,
    total,
    fetchPage,
    remove,
    withdraw,
    applyOffline,
    submitAudit,
  } = useArticle();
  const { fetchActiveColumns, getColumnName } = useArticleColumn();

  const queryParams = reactive<ArticleQuery>({
    title: undefined,
    status: undefined,
    authorCode: userStore.userCode, // 按照作者工号进行过滤
    pageNo: 1,
    pageSize: 10,
  });

  const stats = reactive({
    published: 0,
    auditing: 0,
    draft: 0,
    viewCount: 0,
  });

  const computeStats = async () => {
    try {
      const { data } = await getMyArticleStats(userStore.userCode as string);
      stats.published = data.published || 0;
      stats.auditing = data.auditing || 0;
      stats.draft = data.draft || 0;
      stats.viewCount = data.viewCount || 0;
    } catch (err) {
      // 容错处理
    }
  };

  const handleSearch = async () => {
    queryParams.pageNo = 1;
    await fetchPage(queryParams);
    computeStats();
  };

  const resetQuery = () => {
    queryParams.title = undefined;
    queryParams.status = undefined;
    handleSearch();
  };

  const onPageChange = (current: number) => {
    queryParams.pageNo = current;
    fetchPage(queryParams);
  };

  const handleAdd = () => {
    router.push({ name: 'article-user-edit' });
  };

  const handleEdit = (record: ArticleVO) => {
    router.push({ name: 'article-user-edit', query: { id: record.id } });
  };

  const handlePreview = (record: ArticleVO) => {
    const query: Record<string, any> = { id: record.id };
    // 只有非已发布状态，才添加 preview=1 参数走预览通道
    if (record.status !== 2) {
      query.preview = '1';
    }
    router.push({
      name: 'article-protal-detail',
      query,
    });
  };

  const handleSubmitAudit = async (id?: string) => {
    if (!id) return;
    const success = await submitAudit(id);
    if (success) handleSearch();
  };

  const handleApplyOffline = async (id?: string) => {
    if (!id) return;
    const success = await applyOffline(id);
    if (success) handleSearch();
  };

  // ========== 浏览情况抽屉逻辑 ==========
  const recordsVisible = ref(false);
  const currentArticleId = ref<string>();

  const handleShowViewRecords = (id: string) => {
    currentArticleId.value = id;
    recordsVisible.value = true;
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const success = await remove(id);
    if (success) handleSearch();
  };

  const handleWithdraw = async (id?: string) => {
    if (!id) return;
    const success = await withdraw(id);
    if (success) handleSearch();
  };

  onMounted(async () => {
    await fetchActiveColumns();
    handleSearch();
  });
</script>

<style scoped lang="less">
  .container {
    padding: 16px 20px 20px 20px;
    background-color: #f7f9fb;
    min-height: calc(100vh - 90px);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 24px;
    padding: 8px 0;
  }

  .stat-card {
    position: relative;
    padding: 24px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 20px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: default;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    &:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);

      .card-bg-icon {
        transform: scale(1.2) rotate(-10deg);
        opacity: 0.15;
      }
    }

    .stat-icon-wrapper {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      z-index: 2;

      .stat-icon {
        font-size: 26px;
      }
    }

    .stat-info {
      z-index: 2;

      .stat-label {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.85);
        margin-bottom: 4px;
        font-weight: 500;
        letter-spacing: 0.5px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: #fff;
        line-height: 1.2;
        font-family: 'Inter', system-ui, sans-serif;
      }
    }

    /* 装饰性大图标 */
    .card-bg-icon {
      position: absolute;
      right: -10px;
      bottom: -15px;
      font-size: 90px;
      color: #fff;
      opacity: 0.1;
      z-index: 1;
      transition: all 0.4s ease;
    }

    /* 不同状态的主题色 */
    &.published {
      background: linear-gradient(135deg, #23c993 0%, #05a677 100%);
      .stat-icon {
        color: #23c993;
      }
    }

    &.auditing {
      background: linear-gradient(135deg, #ff9d5c 0%, #ff7d26 100%);
      .stat-icon {
        color: #ff9d5c;
      }
    }

    &.draft {
      background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
      .stat-icon {
        color: #94a3b8;
      }
    }

    &.views {
      background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
      .stat-icon {
        color: #6366f1;
      }
    }
  }

  .link-title {
    color: var(--color-primary-6);
    cursor: pointer;
    font-weight: 500;
    &:hover {
      text-decoration: underline;
      color: var(--color-primary-7);
    }
  }

  .layout-content {
    :deep(.arco-card) {
      border-radius: 12px;
      border: none;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    }
  }

  .records-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
    padding: 8px 0;
  }

  .mini-stat {
    position: relative;
    padding: 24px 20px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    gap: 16px;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: default;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);

      .bg-icon {
        transform: scale(1.2) rotate(-10deg);
        opacity: 0.2;
      }
    }

    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
      z-index: 2;

      .stat-icon {
        font-size: 24px;
      }
    }

    .stat-info {
      z-index: 2;

      .label {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.85);
        margin-bottom: 4px;
        font-weight: 500;
        letter-spacing: 0.5px;
      }

      .value {
        font-size: 26px;
        font-weight: 700;
        color: #fff;
        line-height: 1.2;
        font-family: 'Inter', system-ui, sans-serif;
      }
    }

    .bg-icon {
      position: absolute;
      right: -10px;
      bottom: -15px;
      font-size: 80px;
      color: #fff;
      opacity: 0.1;
      z-index: 1;
      transition: all 0.4s ease;
    }

    &.views {
      background: linear-gradient(135deg, #6366f1 0%, #4338ca 100%);
      .stat-icon {
        color: #6366f1;
      }
    }

    &.users {
      background: linear-gradient(135deg, #23c993 0%, #05a677 100%);
      .stat-icon {
        color: #23c993;
      }
    }

    &.avg {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      .stat-icon {
        color: #f59e0b;
      }
    }
  }

  .table-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 12px;
    color: var(--color-text-1);
    padding-left: 8px;
    border-left: 4px solid var(--color-primary-6);
  }
</style>
