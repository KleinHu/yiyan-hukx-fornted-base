<template>
  <div class="container">
    <Breadcrumb :items="['企业文化', '公司动态']" />

    <div class="layout-content">
      <div class="portal-layout">
        <!-- 左侧栏目导览 -->
        <div class="column-sidebar">
          <a-card class="sidebar-card" :bordered="false">
            <div class="sidebar-header">
              <icon-apps />
              <span>文章专栏</span>
            </div>
            <div class="sidebar-tree-wrapper">
              <a-spin :loading="columnLoading" style="width: 100%">
                <a-tree
                  v-if="fullTreeData.length > 1 || !columnLoading"
                  block-node
                  :data="fullTreeData"
                  :selected-keys="selectedKeys"
                  :field-names="{
                    key: 'id',
                    title: 'name',
                    children: 'children',
                  }"
                  @select="onTreeSelect"
                >
                  <template #title="node">
                    <div class="custom-node">
                      <icon-layers v-if="node.id === 'all'" />
                      <icon-folder v-else-if="node.children?.length" />
                      <icon-file v-else />
                      <span class="node-text">{{ node.name }}</span>
                    </div>
                  </template>
                </a-tree>
                <a-empty
                  v-if="columnTree.length === 0 && !columnLoading"
                  description="暂无专栏"
                />
              </a-spin>
            </div>
          </a-card>

          <!-- 个人空间入口 -->
          <a-card class="sidebar-card personal-card" :bordered="false">
            <div class="sidebar-header">
              <icon-user />
              <span>个人空间</span>
            </div>
            <div class="personal-links">
              <div
                class="link-item"
                @click="router.push({ name: 'article-person' })"
              >
                <icon-edit />
                <span>我的投稿</span>
              </div>
              <div
                class="link-item"
                @click="router.push({ name: 'ArticleFavorite' })"
              >
                <icon-star />
                <span>我的收藏</span>
              </div>
            </div>
          </a-card>

          <!-- 热门文章推荐 -->
          <HotArticles />
        </div>

        <div class="article-container">
          <a-card class="article-card" :bordered="false">
            <!-- 头部筛选区域 -->
            <div class="article-filter-bar">
              <div class="filter-left">
                <a-input
                  v-model="queryParams.title"
                  placeholder="搜索文章标题..."
                  style="width: 240px"
                  size="large"
                  allow-clear
                  @press-enter="handleSearch"
                  @clear="handleSearch"
                >
                  <template #prefix>
                    <icon-search />
                  </template>
                </a-input>
                <a-range-picker
                  v-model="publishTimeRange"
                  style="width: 300px"
                  size="large"
                  @change="handleDateChange"
                  @clear="handleDateChange"
                />
                <a-button type="primary" size="large" @click="handleSearch">
                  <template #icon><icon-search /></template>
                  查询
                </a-button>
                <a-button size="large" @click="resetQuery">
                  <template #icon><icon-refresh /></template>
                  重置
                </a-button>
              </div>
              <div class="filter-right">
                <span class="sort-label">排序依据：</span>
                <a-radio-group
                  v-model="sortType"
                  type="button"
                  size="medium"
                  @change="handleSortChange"
                >
                  <a-radio value="new">最新发布</a-radio>
                  <a-radio value="hot">最多点击</a-radio>
                </a-radio-group>
              </div>
            </div>

            <a-spin
              :loading="articleLoading"
              style="width: 100%; min-height: 400px"
            >
              <div v-if="articleList.length > 0" class="article-list">
                <div
                  v-for="item in articleList"
                  :key="item.id"
                  class="article-item"
                  @click="goToDetail(item.id)"
                >
                  <div v-if="item.coverUrl" class="item-cover">
                    <img :src="item.coverUrl" alt="cover" />
                  </div>
                  <div class="item-content">
                    <div class="item-header">
                      <a-space :size="4">
                        <a-tag v-if="item.isTop === 1" color="red" size="small">
                          置顶
                        </a-tag>
                        <a-tag
                          v-if="item.isMustRead === 1"
                          color="orange"
                          size="small"
                        >
                          <template #icon>
                            <icon-notification />
                          </template>
                          必读
                        </a-tag>
                        <span class="item-title">{{ item.title }}</span>
                      </a-space>
                    </div>
                    <div class="item-summary">{{ item.summary }}</div>
                    <div class="item-meta">
                      <span class="author">
                        <icon-user />
                        {{ item.authorName || '系统发布' }}
                      </span>
                      <span class="time">
                        <icon-clock-circle />
                        {{ formatDate(item.publishTime || item.createTime) }}
                      </span>
                      <span class="view">
                        <icon-eye />
                        {{ item.viewCount || 0 }} 次阅读
                      </span>
                      <span class="like">
                        <icon-thumb-up />
                        {{ item.likeCount || 0 }}
                      </span>
                      <span class="favorite">
                        <icon-star />
                        {{ item.favoriteCount || 0 }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 分页 -->
                <div class="pagination-wrapper">
                  <a-pagination
                    :total="total"
                    :current="queryParams.pageNo"
                    :page-size="queryParams.pageSize"
                    show-total
                    @change="onPageChange"
                  />
                </div>
              </div>
              <a-empty
                v-else-if="!articleLoading"
                description="该专栏下暂无文章"
                style="margin-top: 80px"
              />
            </a-spin>
          </a-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import dayjs from 'dayjs';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import useArticle from '@/hooks/article/useArticle';
  import useArticleColumn from '@/hooks/article/useArticleColumn';
  import type { ArticleQuery } from '@/api/article';
  import HotArticles from '@/components/article/HotArticles.vue';

  const router = useRouter();
  const {
    loading: articleLoading,
    articleList,
    total,
    fetchPage,
  } = useArticle();
  const { loading: columnLoading, columnTree, fetchTree } = useArticleColumn();

  // 拼接“全部分类”到树数据中
  const fullTreeData = computed(() => {
    return [{ id: 'all', name: '全部分类' }, ...columnTree.value];
  });

  const selectedKeys = ref<string[]>(['all']);

  const activeTab = ref<string>('');
  const sortType = ref('new');
  const publishTimeRange = ref<any[]>([]);

  const queryParams = reactive<ArticleQuery>({
    title: undefined,
    columnId: undefined,
    status: 2, // 只查已发布的
    hotSort: 0,
    beginTime: undefined,
    endTime: undefined,
    pageNo: 1,
    pageSize: 10,
  });

  const formatDate = (date?: string | Date) => {
    if (!date) return '-';
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  };

  const loadData = async () => {
    columnLoading.value = true;
    articleLoading.value = true;
    await fetchTree({ status: 1 });
    // 默认选中“全部分类”
    selectedKeys.value = ['all'];
    handleColumnChange('all');
  };

  const onTreeSelect = (keys: any[]) => {
    if (keys.length > 0) {
      handleColumnChange(keys[0]);
    }
  };

  const handleColumnChange = (key: string) => {
    selectedKeys.value = [key];
    activeTab.value = key;
    // 如果 key 为 all，则清空 columnId 过滤，查询全部文章
    // 否则直接按专栏 ID 过滤（后端已支持父专栏查询下属所有文章，或者按精确 ID 匹配）
    queryParams.columnId = key === 'all' ? undefined : key;
    queryParams.pageNo = 1;
    fetchPage(queryParams);
  };

  const handleSearch = () => {
    queryParams.pageNo = 1;
    fetchPage(queryParams);
  };

  const resetQuery = () => {
    queryParams.title = undefined;
    queryParams.beginTime = undefined;
    queryParams.endTime = undefined;
    publishTimeRange.value = [];
    handleSearch();
  };

  const handleDateChange = (values: any) => {
    if (values && values.length === 2) {
      queryParams.beginTime = values[0] ? `${values[0]} 00:00:00` : undefined;
      queryParams.endTime = values[1] ? `${values[1]} 23:59:59` : undefined;
    } else {
      queryParams.beginTime = undefined;
      queryParams.endTime = undefined;
    }
    handleSearch();
  };

  const handleSortChange = (val: string | number | boolean) => {
    queryParams.hotSort = val === 'hot' ? 1 : 0;
    queryParams.pageNo = 1;
    fetchPage(queryParams);
  };

  const onPageChange = (current: number) => {
    queryParams.pageNo = current;
    fetchPage(queryParams);
  };

  const goToDetail = (id?: string) => {
    if (!id) return;
    router.push({
      name: 'article-protal-detail',
      query: { id },
    });
  };

  onMounted(async () => {
    await loadData();
  });
</script>

<script lang="ts">
  export default {
    name: 'article-portal',
  };
</script>

<style scoped lang="less">
  .container {
    padding: 16px 20px 20px 20px;
    background-color: #f7f9fb;
    min-height: calc(100vh - 90px);
  }

  .portal-layout {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }

  /* 左侧栏目样式 */
  .column-sidebar {
    width: 280px;
    flex-shrink: 0;

    .sidebar-card {
      border-radius: 8px;
      padding: 12px 0;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px 16px 16px;
      border-bottom: 1px solid var(--color-border-2);
      margin-bottom: 8px;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-1);

      span {
        letter-spacing: 1px;
      }
    }

    .sidebar-tree-wrapper {
      padding: 0 8px;

      :deep(.arco-tree-node) {
        border-radius: 6px;
        line-height: 36px;
        margin-bottom: 2px;
        transition: all 0.2s;

        &:hover {
          background-color: var(--color-fill-2);
        }

        .custom-node {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: var(--color-text-2);

          svg {
            color: var(--color-text-3);
            font-size: 16px;
          }

          .node-text {
            flex: 1;
          }
        }

        &.arco-tree-node-selected {
          background-color: var(--color-primary-light-1);
          .custom-node {
            color: var(--color-primary);
            font-weight: 500;
            svg {
              color: var(--color-primary);
            }
          }
        }
      }

      :deep(.arco-tree-node-title) {
        &:hover {
          background-color: transparent;
        }
      }
    }
  }

  /* 右侧文章列表容器 */
  .article-container {
    flex: 1;
    min-width: 0;

    .article-card {
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
    }
  }

  /* 筛选条样式 */
  .article-filter-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 0 24px 0;
    margin-bottom: 8px;
    border-bottom: 1px dashed var(--color-border-2);

    .filter-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .filter-right {
      display: flex;
      align-items: center;

      .sort-label {
        font-size: 14px;
        color: var(--color-text-3);
        margin-right: 12px;
      }
    }
  }

  .article-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .article-item {
    display: flex;
    gap: 24px;
    padding: 24px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    background: var(--color-bg-2);
    border: 1px solid var(--color-border-2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

    &:hover {
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      border-color: var(--color-primary-light-3);
      transform: translateY(-5px);

      .item-title {
        color: var(--color-primary);
      }
    }

    .item-cover {
      width: 220px;
      height: 130px;
      flex-shrink: 0;
      border-radius: 6px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s;
      }
    }

    &:hover .item-cover img {
      transform: scale(1.08);
    }

    .item-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .item-header {
        margin-bottom: 12px;
        .item-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-1);
          line-height: 1.4;
          transition: color 0.3s;
        }
      }

      .item-summary {
        font-size: 14px;
        color: var(--color-text-3);
        line-height: 1.6;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        overflow: hidden;
        margin-bottom: 20px;
      }

      .item-meta {
        font-size: 13px;
        color: var(--color-text-4);
        display: flex;
        gap: 24px;

        span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }
    }
  }

  .sidebar-card {
    margin-bottom: 20px;
    border-radius: 4px;
    &.personal-card {
      margin-top: 16px;
    }
  }

  .personal-links {
    margin-top: 12px;
    .link-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      margin-bottom: 4px;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;
      color: var(--color-text-2);

      span {
        margin-left: 10px;
        font-size: 14px;
      }

      &:hover {
        background-color: var(--color-fill-2);
        color: var(--color-primary-light-4);
      }

      &:active {
        background-color: var(--color-fill-3);
      }
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 32px;
    padding-bottom: 16px;
  }
</style>
