<template>
  <a-card class="general-card news-card" :bordered="false" title="本月快讯">
    <template #extra>
      <a-link @click="goPortal">更多 <icon-right /></a-link>
    </template>

    <!-- 轮播新闻图片 -->
    <div class="carousel-wrapper">
      <a-carousel
        v-if="carouselNews.length > 0"
        :auto-play="true"
        animation-name="fade"
        show-arrow="hover"
        class="news-carousel"
      >
        <a-carousel-item v-for="item in carouselNews" :key="item.id">
          <div class="carousel-image-wrapper" @click="goDetail(item.id)">
            <img :src="item.coverUrl" class="carousel-image" alt="cover" />
            <div class="carousel-overlay">
              <div class="carousel-title">{{ item.title }}</div>
            </div>
          </div>
        </a-carousel-item>
      </a-carousel>
      <!-- 无封面图时的缺省展示 -->
      <div
        v-else-if="!initialLoading"
        class="carousel-placeholder"
        @click="goPortal"
      >
        <div class="placeholder-content">
          <icon-common class="placeholder-icon" />
          <div class="placeholder-text">易研 OA · 资讯中心</div>
        </div>
      </div>
      <!-- 加载中骨架屏 -->
      <a-skeleton v-else :animation="true" class="carousel-skeleton">
        <a-skeleton-shape shape="square" />
      </a-skeleton>
    </div>

    <!-- 栏目切换 Tabs -->
    <a-tabs
      v-model:active-key="currentTab"
      type="rounded"
      size="small"
      class="column-tabs"
      @change="handleTabChange"
    >
      <a-tab-pane key="all">
        <template #title>
          <span style="white-space: nowrap; display: flex; align-items: center">
            最新动态
            <a-badge
              :count="countsMap['all'] || 0"
              :show-zero="true"
              style="margin-left: 4px"
            />
          </span>
        </template>
      </a-tab-pane>
      <a-tab-pane v-for="col in columns" :key="col.id">
        <template #title>
          <span style="white-space: nowrap; display: flex; align-items: center">
            {{ col.name }}
            <a-badge
              :count="countsMap[col.id!] || 0"
              :show-zero="true"
              style="margin-left: 4px"
            />
          </span>
        </template>
      </a-tab-pane>
    </a-tabs>

    <!-- 文章列表（a-scrollbar 限高滚动） -->
    <a-spin :loading="loading" class="article-spin">
      <a-scrollbar
        v-if="textNews.length > 0"
        style="height: 180px; overflow: auto"
      >
        <div class="article-list">
          <div
            v-for="item in textNews"
            :key="item.id"
            class="article-item"
            @click="goDetail(item.id)"
          >
            <icon-file class="article-icon" />
            <div class="article-info">
              <div class="article-title">
                <a-tag
                  v-if="item.isTop === 1"
                  color="red"
                  size="small"
                  style="margin-right: 4px; flex-shrink: 0"
                  >置顶</a-tag
                >
                <span class="title-text">{{ item.title }}</span>
              </div>
              <div class="article-meta">
                <span class="meta-views"
                  ><icon-eye /> {{ item.viewCount || 0 }}</span
                >
                <span class="meta-dot">·</span>
                <span>{{ formatDate(item.publishTime) }}</span>
              </div>
            </div>
          </div>
        </div>
      </a-scrollbar>
      <a-empty
        v-else
        description="本月暂无动态"
        style="margin: 20px 0; padding: 34px 0; flex: 1"
      />
    </a-spin>
  </a-card>
</template>

<script setup lang="ts">
  import { ref, onMounted, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import dayjs from 'dayjs';
  import * as articleApi from '@/api/article';
  import type { ArticleVO, ArticleColumnVO } from '@/api/article';

  const router = useRouter();
  const loading = ref(false); // 右侧列表加载状态
  const initialLoading = ref(true); // 首次加载（控制骨架屏）
  const columns = ref<ArticleColumnVO[]>([]);
  const currentTab = ref('all');
  const countsMap = reactive<Record<string, number>>({});

  // 轮播新闻（最新5条有封面的文章）
  const carouselNews = ref<ArticleVO[]>([]);
  // 文章列表
  const textNews = ref<ArticleVO[]>([]);

  const formatDate = (date?: string | Date) => {
    if (!date) return '';
    return dayjs(date).format('YYYY-MM-DD');
  };

  /**
   * 获取各分类在本月的文章数量
   */
  const fetchCounts = async (cols: ArticleColumnVO[]) => {
    const monthStart = dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss');
    // 构建待查询列表
    const queryIds = ['all', ...cols.map((c) => c.id!)];

    try {
      // 并行请求获取总数
      const requests = queryIds.map((id) =>
        articleApi.getArticlePage({
          columnId: id === 'all' ? undefined : id,
          status: 2,
          beginTime: monthStart,
          pageNo: 1,
          pageSize: 1, // 只拿 total
        })
      );
      const results = await Promise.all(requests);
      queryIds.forEach((id, index) => {
        countsMap[id] = results[index].data?.total || 0;
      });
    } catch (e) {
      // 容错处理
    }
  };

  const loadColumns = async () => {
    try {
      const { data } = await articleApi.getColumnListTree({ status: 1 });
      const flatList: ArticleColumnVO[] = [];
      (data || []).forEach((col) => {
        if (col.children && col.children.length > 0) {
          flatList.push(...col.children);
        } else {
          flatList.push(col);
        }
      });
      columns.value = flatList;
      // 加载完成后异步拉取各个分类的数量
      fetchCounts(flatList);
    } catch (err) {
      // 捕获异常
    }
  };

  const loadData = async (columnId?: string) => {
    loading.value = true;
    try {
      const monthStart = dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss');
      const params: any = {
        status: 2,
        columnId: columnId === 'all' ? undefined : columnId,
        beginTime: monthStart, // 强制检索当前月
        pageNo: 1,
        pageSize: 30,
        hotSort: 0, // 按照最新到老排序
      };

      const { data } = await articleApi.getArticlePage(params);
      const list = data?.list || [];

      // 更新轮播图
      if (columnId === 'all' || !columnId) {
        carouselNews.value = list.filter((item) => !!item.coverUrl).slice(0, 5);
      }

      // 文章列表
      textNews.value = list;
    } catch (err) {
      // 查无数据
    } finally {
      loading.value = false;
      initialLoading.value = false;
    }
  };

  const handleTabChange = (key: string | number) => {
    currentTab.value = key as string;
    loadData(key as string);
  };

  const goPortal = () => {
    router.push({ name: 'article-portal' });
  };

  const goDetail = (id?: string) => {
    if (!id) return;
    router.push({ name: 'article-protal-detail', query: { id } });
  };

  onMounted(() => {
    loadColumns();
    loadData('all');
  });
</script>

<style scoped lang="less">
  .news-card {
    height: 100%;
    display: flex;
    flex-direction: column;

    :deep(.arco-card-body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      padding: 12px 20px 16px;
    }
  }

  /* ========== 轮播新闻 & 占位图 ========== */
  .carousel-wrapper {
    width: 100%;
    height: 180px;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 12px;
    flex-shrink: 0;
    position: relative;
  }

  .carousel-placeholder {
    width: 100%;
    height: 100%;
    background-color: var(--color-fill-2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: var(--color-fill-3);
    }

    .placeholder-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--color-text-3);
    }

    .placeholder-icon {
      font-size: 32px;
      opacity: 0.5;
    }

    .placeholder-text {
      font-size: 14px;
      font-weight: 500;
    }
  }

  .news-carousel {
    width: 100%;
    height: 100%;
  }

  .carousel-image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;

    .carousel-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    &:hover .carousel-image {
      transform: scale(1.05);
    }
  }

  .carousel-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.8) 0%,
      transparent 100%
    );
    padding: 28px 14px 10px;
    pointer-events: none;
  }

  .carousel-title {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 骨架屏占位 */
  .carousel-skeleton {
    width: 100%;
    height: 100%;

    :deep(.arco-skeleton-shape) {
      width: 100% !important;
      height: 100% !important;
      border-radius: 10px;
    }
  }

  /* ========== 栏目 Tabs & Badge ========== */
  .column-tabs {
    flex-shrink: 0;
    margin-bottom: 4px;

    :deep(.arco-tabs-nav) {
      margin-bottom: 4px;
    }

    :deep(.arco-tabs-nav-tab) {
      font-weight: 500;
      font-size: 13px;
    }

    :deep(.arco-badge-number) {
      font-size: 10px;
      padding: 0 4px;
      height: 14px;
      line-height: 14px;
      min-width: 14px;
      transform: scale(1);
      transform-origin: center;
      border-radius: 10px;
    }
  }

  /* ========== 文章列表（a-scrollbar 限高滚动） ========== */
  .article-spin {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .article-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .article-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 8px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
    border-bottom: 1px solid var(--color-border-2);
    flex-shrink: 0;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: var(--color-fill-1);

      .title-text {
        color: rgb(var(--arcoblue-6));
      }
    }

    .article-icon {
      color: rgb(var(--arcoblue-6));
      font-size: 16px;
      margin-top: 2px;
      flex-shrink: 0;
    }

    .article-info {
      flex: 1;
      min-width: 0;
    }

    .article-title {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: var(--color-text-1);
      line-height: 1.4;
      margin-bottom: 4px;

      .title-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: color 0.2s;
      }
    }

    .article-meta {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--color-text-4);

      .meta-column {
        color: var(--color-text-3);
      }

      .meta-dot {
        color: var(--color-text-4);
      }
    }
  }
</style>
