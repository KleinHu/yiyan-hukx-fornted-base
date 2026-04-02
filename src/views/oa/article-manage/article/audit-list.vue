<template>
  <div class="container">
    <Breadcrumb :items="['文章管理', '文章审批列表']" />
    <div class="layout-content">
      <a-row :gutter="16">
        <!-- 左侧专栏分类 -->
        <a-col :span="5">
          <a-card class="general-card sidebar-card" :bordered="false">
            <template #title>
              <div class="card-title">
                <icon-apps class="title-icon" />
                <span>文章专栏</span>
              </div>
            </template>
            <div class="sidebar-menu">
              <div
                class="menu-item"
                :class="{ active: !queryParams.columnId }"
                @click="handleSelectColumn(undefined)"
              >
                <icon-layers />
                <span>全部分类</span>
              </div>
              <a-tree
                block-node
                :data="columnTree"
                :field-names="{
                  key: 'id',
                  title: 'name',
                  children: 'children',
                }"
                @select="onTreeSelect"
              >
                <template #icon>
                  <icon-file />
                </template>
              </a-tree>
            </div>
          </a-card>
        </a-col>

        <!-- 右侧审批列表 -->
        <a-col :span="19">
          <a-card class="general-card table-card" :bordered="false">
            <template #title>
              <div class="card-title">
                <icon-check-circle-fill class="title-icon" />
                <span>审批列表</span>
              </div>
            </template>
            <a-row style="margin-bottom: 16px">
              <a-col :span="24">
                <a-space wrap>
                  <a-input
                    v-model="queryParams.title"
                    placeholder="搜索文章标题"
                    style="width: 260px"
                    allow-clear
                    @press-enter="handleSearch"
                  />
                  <a-button type="primary" @click="handleSearch">
                    <template #icon><icon-search /></template>查询
                  </a-button>
                  <a-button @click="resetQuery">
                    <template #icon><icon-refresh /></template>重置
                  </a-button>
                </a-space>
              </a-col>
            </a-row>

            <a-table
              row-key="id"
              :loading="loading"
              :data="articleList"
              :pagination="{
                current: queryParams.pageNo,
                pageSize: queryParams.pageSize,
                total,
                showTotal: true,
                showPageSize: true,
                size: 'medium',
              }"
              @page-change="onPageChange"
              @page-size-change="onPageSizeChange"
            >
              <template #columns>
                <a-table-column title="序号" :width="70" align="center">
                  <template #cell="{ rowIndex }">
                    {{
                      rowIndex +
                      1 +
                      ((queryParams.pageNo || 1) - 1) *
                        (queryParams.pageSize || 10)
                    }}
                  </template>
                </a-table-column>
                <a-table-column title="封面" :width="80" align="center">
                  <template #cell="{ record }">
                    <a-image
                      v-if="record.coverUrl"
                      :src="record.coverUrl"
                      width="40"
                      height="40"
                      fit="cover"
                    />
                    <icon-image
                      v-else
                      style="font-size: 24px; color: var(--color-text-3)"
                    />
                  </template>
                </a-table-column>
                <a-table-column
                  title="标题"
                  data-index="title"
                  :width="200"
                  ellipsis
                  tooltip
                />
                <a-table-column
                  title="作者"
                  data-index="authorName"
                  :width="100"
                />
                <a-table-column title="状态" :width="120" align="center">
                  <template #cell="{ record }">
                    <ArticleStatusTag :status="record.status" />
                  </template>
                </a-table-column>
                <a-table-column
                  title="发布时间"
                  data-index="publishTime"
                  :width="170"
                >
                  <template #cell="{ record }">
                    {{ formatDate(record.publishTime) }}
                  </template>
                </a-table-column>
                <a-table-column title="操作" :width="120" align="center">
                  <template #cell="{ record }">
                    <a-space>
                      <a-button
                        v-if="[1, 5].includes(record.status)"
                        type="text"
                        size="small"
                        @click="handleAudit(record)"
                      >
                        审批
                      </a-button>
                      <a-button
                        type="text"
                        size="small"
                        @click="handlePreview(record)"
                      >
                        预览
                      </a-button>
                    </a-space>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    IconSearch,
    IconRefresh,
    IconImage,
    IconApps,
    IconLayers,
    IconFile,
    IconCheckCircleFill,
  } from '@arco-design/web-vue/es/icon';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import useArticle from '@/hooks/article/useArticle';
  import useArticleColumn from '@/hooks/article/useArticleColumn';
  import { formatDate } from '@/utils/date';
  import type { ArticleQuery, ArticleVO } from '@/api/article';
  import ArticleStatusTag from '@/components/article/ArticleStatusTag.vue';

  const router = useRouter();
  const { loading, articleList, total, fetchAuditPage } = useArticle();

  const { columnTree, fetchTree, fetchActiveColumns } = useArticleColumn();

  const queryParams = reactive<ArticleQuery>({
    title: '',
    columnId: undefined,
    status: undefined,
    pageNo: 1,
    pageSize: 10,
  });

  const handleSearch = () => {
    queryParams.pageNo = 1;
    fetchAuditPage(queryParams);
  };

  const resetQuery = () => {
    queryParams.title = '';
    queryParams.columnId = undefined;
    handleSearch();
  };

  const onPageChange = (current: number) => {
    queryParams.pageNo = current;
    fetchAuditPage(queryParams);
  };

  const onPageSizeChange = (size: number) => {
    queryParams.pageSize = size;
    handleSearch();
  };

  const onTreeSelect = (selectedKeys: (string | number)[]) => {
    if (selectedKeys.length > 0) {
      queryParams.columnId = selectedKeys[0] as string;
    } else {
      queryParams.columnId = undefined;
    }
    handleSearch();
  };

  const handleSelectColumn = (id: string | undefined) => {
    queryParams.columnId = id;
    handleSearch();
  };

  const handlePreview = (record: ArticleVO) => {
    router.push({
      name: 'article-protal-detail',
      query: { id: record.id, preview: '1' },
    });
  };

  // ========== 审核逻辑 ==========
  const handleAudit = (record: ArticleVO) => {
    router.push({
      name: 'article-audit',
      query: { id: record.id },
    });
  };

  onMounted(async () => {
    await Promise.all([
      fetchActiveColumns(),
      fetchTree({ status: 1 }),
      fetchAuditPage(queryParams),
    ]);
  });
</script>

<script lang="ts">
  export default {
    name: 'ArticleAuditList',
  };
</script>

<style scoped lang="less">
  .container {
    padding: 16px 20px 20px 20px;
    background-color: #f7f9fb;
    display: flex;
    flex-direction: column;
    min-height: 100%;
  }

  .layout-content {
    flex: 1;

    .sidebar-card {
      height: 100%;
      min-height: 600px;
      border-radius: 8px;

      .sidebar-menu {
        .menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          margin-bottom: 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          color: var(--color-text-1);

          &:hover {
            background-color: var(--color-fill-2);
          }

          &.active {
            background-color: var(--color-primary-light-1);
            color: var(--color-primary-6);
            font-weight: 500;
          }

          svg {
            font-size: 16px;
          }
        }

        :deep(.arco-tree) {
          .arco-tree-node-title {
            font-size: 14px;
            color: var(--color-text-2);

            &:hover {
              background-color: var(--color-fill-2);
            }
          }

          .arco-tree-node-selected .arco-tree-node-title {
            color: var(--color-primary-6);
            background-color: transparent;
            font-weight: 500;
          }

          .arco-tree-node-indent-block {
            width: 12px;
          }
        }
      }
    }

    .table-card {
      border-radius: 8px;

      :deep(.arco-card-header) {
        border-bottom: 1px solid var(--color-fill-3);
      }
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;

      .title-icon {
        color: rgb(var(--arcoblue-6));
        font-size: 18px;
      }
    }
  }
</style>
