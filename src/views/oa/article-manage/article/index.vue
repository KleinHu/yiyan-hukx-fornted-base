<template>
  <div class="container">
    <Breadcrumb :items="['文章管理', '文章发布列表']" />
    <div class="layout-content">
      <a-card class="general-card" title="文章管理">
        <template #extra>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            新建文章
          </a-button>
        </template>

        <a-row style="margin-bottom: 16px">
          <a-col :span="24">
            <a-space>
              <a-input
                v-model="queryParams.title"
                placeholder="搜索文章标题"
                style="width: 200px"
                allow-clear
              />
              <a-tree-select
                v-model="queryParams.columnId"
                :data="columnTree"
                placeholder="归属专栏"
                style="width: 200px"
                allow-clear
                allow-search
                :field-names="{
                  key: 'id',
                  title: 'name',
                  children: 'children',
                }"
              />
              <a-select
                v-model="queryParams.status"
                placeholder="文章状态"
                style="width: 150px"
                allow-clear
              >
                <a-option :value="0">草稿</a-option>
                <a-option :value="1">待审核</a-option>
                <a-option :value="2">已发布</a-option>
                <a-option :value="3">审核驳回</a-option>
                <a-option :value="4">已下线</a-option>
                <a-option :value="5">下线审批中</a-option>
                <a-option :value="6">定时发布</a-option>
              </a-select>
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
                  ((queryParams.pageNo || 1) - 1) * (queryParams.pageSize || 10)
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
            >
              <template #cell="{ record }">
                <a-space>
                  <a-tag v-if="record.isTop === 1" color="red" size="small">
                    置顶
                  </a-tag>
                  <span>{{ record.title }}</span>
                </a-space>
              </template>
            </a-table-column>
            <a-table-column title="专栏" :width="150" align="center">
              <template #cell="{ record }">
                <span>{{ getColumnName(record.columnId) }}</span>
              </template>
            </a-table-column>
            <a-table-column title="作者" data-index="authorName" :width="80" />
            <a-table-column title="状态" :width="120" align="center">
              <template #cell="{ record }">
                <ArticleStatusTag :status="record.status" />
              </template>
            </a-table-column>
            <a-table-column
              title="阅读量"
              data-index="viewCount"
              :width="90"
              align="center"
            >
              <template #cell="{ record }">
                <a-link @click="handleShowViewRecords(record.id)">
                  {{ record.viewCount || 0 }}
                </a-link>
              </template>
            </a-table-column>
            <a-table-column
              title="点赞量"
              data-index="likeCount"
              :width="90"
              align="center"
            >
              <template #cell="{ record }">
                <span style="color: var(--color-text-2)">
                  {{ record.likeCount || 0 }}
                </span>
              </template>
            </a-table-column>
            <a-table-column
              title="收藏量"
              data-index="favoriteCount"
              :width="90"
              align="center"
            >
              <template #cell="{ record }">
                <span style="color: var(--color-text-2)">
                  {{ record.favoriteCount || 0 }}
                </span>
              </template>
            </a-table-column>
            <a-table-column
              title="发布时间"
              data-index="publishTime"
              :width="180"
            >
              <template #cell="{ record }">
                {{ formatDate(record.publishTime) }}
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="160" align="center">
              <template #cell="{ record }">
                <a-space>
                  <!-- 已发布状态：显示下线 (外展主按钮) -->
                  <a-button
                    v-if="record.status === 2"
                    type="text"
                    size="small"
                    status="warning"
                    @click="handleOffline(record.id)"
                  >
                    下线
                  </a-button>

                  <!-- 已下线或定时发布状态：显示上线 (快速恢复或强制发布) -->
                  <a-button
                    v-if="[4, 6].includes(record.status)"
                    type="text"
                    size="small"
                    status="success"
                    @click="handlePublish(record.id)"
                  >
                    上线
                  </a-button>

                  <!-- 其他操作收纳到更多 -->
                  <a-dropdown>
                    <a-button type="text" size="small">
                      更多 <icon-down />
                    </a-button>
                    <template #content>
                      <!-- 预览 -->
                      <a-doption
                        v-if="record.status !== 0"
                        @click="handlePreview(record)"
                      >
                        <template #icon><icon-eye /></template>
                        预览
                      </a-doption>

                      <!-- 提交送审 (针对草稿/驳回) -->
                      <a-doption
                        v-if="record.status === 0 || record.status === 3"
                        @click="handleSubmitAudit(record.id)"
                      >
                        <template #icon><icon-send /></template>
                        <span style="color: var(--color-primary-6)">
                          提交送审
                        </span>
                      </a-doption>

                      <!-- 编辑 -->
                      <a-doption
                        v-if="[0, 3, 4].includes(record.status)"
                        @click="handleEdit(record)"
                      >
                        <template #icon><icon-edit /></template>
                        编辑
                      </a-doption>

                      <!-- 置顶 (已发布) -->
                      <a-doption
                        v-if="record.status === 2"
                        @click="handleToggleTop(record.id)"
                      >
                        <template #icon><icon-up-circle /></template>
                        {{ record.isTop === 1 ? '取消置顶' : '置顶' }}
                      </a-doption>

                      <!-- 阅读记录 (已发布) -->
                      <a-doption
                        v-if="record.status === 2"
                        @click="handleShowViewRecords(record.id)"
                      >
                        <template #icon><icon-list /></template>
                        浏览记录
                      </a-doption>

                      <!-- 查看回执 (已发布 且 为必读) -->
                      <a-doption
                        v-if="record.status === 2 && record.isMustRead === 1"
                        @click="handleShowReceipts(record.id)"
                      >
                        <template #icon><icon-user-group /></template>
                        <span style="color: var(--color-primary-6)"
                          >回执记录</span
                        >
                      </a-doption>

                      <!-- 下线 (已发布) -->
                      <a-doption
                        v-if="record.status === 2"
                        @click="handleOffline(record.id)"
                      >
                        <template #icon><icon-stop /></template>
                        <span style="color: var(--color-warning-6)">下线</span>
                      </a-doption>

                      <!-- 删除 -->
                      <a-doption @click="handleDelete(record.id)">
                        <template #icon><icon-delete /></template>
                        <span style="color: var(--color-danger-6)">删除</span>
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

    <!-- 阅读记录抽屉 (已抽离) -->
    <ViewRecordsDrawer
      v-model:visible="recordsVisible"
      :article-id="currentArticleId"
    />

    <!-- 已阅回执抽屉 -->
    <ViewReceiptsDrawer
      v-model:visible="receiptsVisible"
      :article-id="currentArticleId"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { Modal } from '@arco-design/web-vue';
  import {
    IconPlus,
    IconSearch,
    IconRefresh,
    IconEdit,
    IconDelete,
    IconEye,
    IconSend,
    IconDown,
    IconUpCircle,
    IconImage,
    IconList,
    IconStop,
  } from '@arco-design/web-vue/es/icon';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import useArticle from '@/hooks/article/useArticle';
  import useArticleColumn from '@/hooks/article/useArticleColumn';
  import { formatDate } from '@/utils/date';
  import type { ArticleQuery, ArticleVO } from '@/api/article';
  import ArticleStatusTag from '@/components/article/ArticleStatusTag.vue';
  import ViewRecordsDrawer from '@/components/article/ViewRecordsDrawer.vue';
  import ViewReceiptsDrawer from '@/components/article/ViewReceiptsDrawer.vue';
  import { IconUserGroup } from '@arco-design/web-vue/es/icon';

  const router = useRouter();
  const {
    loading,
    articleList,
    total,
    fetchPage,
    remove,
    submitAudit,
    offline,
    publish,
    toggleTop,
  } = useArticle();

  const { columnTree, fetchTree, activeColumns, fetchActiveColumns } =
    useArticleColumn();

  const queryParams = reactive<ArticleQuery>({
    title: '',
    columnId: undefined,
    status: undefined,
    pageNo: 1,
    pageSize: 10,
  });

  const handleSearch = () => {
    queryParams.pageNo = 1;
    fetchPage(queryParams);
  };

  const resetQuery = () => {
    queryParams.title = '';
    queryParams.columnId = undefined;
    queryParams.status = undefined;
    handleSearch();
  };

  const onPageChange = (current: number) => {
    queryParams.pageNo = current;
    fetchPage(queryParams);
  };

  const onPageSizeChange = (size: number) => {
    queryParams.pageSize = size;
    handleSearch();
  };

  // 根据专栏ID映射名称
  const getColumnName = (columnId: string) => {
    const col = activeColumns.value.find((c) => c.id === columnId);
    return col ? col.name : '未知专栏';
  };

  const handleAdd = () => {
    router.push({ name: 'article-edit' });
  };

  const handleEdit = (record: ArticleVO) => {
    router.push({
      name: 'article-edit',
      query: { id: record.id },
    });
  };

  const handlePreview = (record: ArticleVO) => {
    router.push({
      name: 'article-protal-detail',
      query: { id: record.id, preview: '1' },
    });
  };

  const handleSubmitAudit = async (id: string) => {
    const success = await submitAudit(id);
    if (success) fetchPage(queryParams);
  };

  const handleOffline = async (id: string) => {
    const success = await offline(id);
    if (success) fetchPage(queryParams);
  };

  const handlePublish = async (id: string) => {
    const success = await publish(id);
    if (success) fetchPage(queryParams);
  };

  const handleToggleTop = async (id: string) => {
    const success = await toggleTop(id);
    if (success) fetchPage(queryParams);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该文章吗？删除后将无法恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const success = await remove(id);
        if (success) {
          if (
            articleList.value.length === 1 &&
            queryParams.pageNo &&
            queryParams.pageNo > 1
          ) {
            queryParams.pageNo -= 1;
          }
          fetchPage(queryParams);
        }
      },
    });
  };

  // ========== 阅读记录逻辑 ==========
  const recordsVisible = ref(false);
  const currentArticleId = ref<string>();

  const handleShowViewRecords = (id: string) => {
    currentArticleId.value = id;
    recordsVisible.value = true;
  };

  // ========== 必读回执逻辑 ==========
  const receiptsVisible = ref(false);

  const handleShowReceipts = (id: string) => {
    currentArticleId.value = id;
    receiptsVisible.value = true;
  };

  onMounted(async () => {
    await Promise.all([
      fetchActiveColumns(),
      fetchTree({ status: 1 }),
      fetchPage(queryParams),
    ]);
  });
</script>

<style scoped lang="less">
  .container {
    padding: 16px 20px 20px 20px;
    background-color: #f7f9fb;
    display: flex;
    flex-direction: column;
  }

  .layout-content {
    :deep(.arco-card) {
      border-radius: 8px;
      border: 1px solid #e5e6eb;

      .arco-card-body {
        padding: 16px;
      }
    }
  }
</style>
