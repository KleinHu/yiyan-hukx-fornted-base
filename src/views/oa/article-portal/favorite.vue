<template>
  <div class="container">
    <Breadcrumb :items="['企业文化', '我的收藏']" />

    <div class="layout-content">
      <a-card class="general-card" title="我的收藏">
        <template #extra>
          <a-input-search
            v-model="queryParams.title"
            placeholder="在收藏中搜索标题..."
            style="width: 240px"
            allow-clear
            @search="handleSearch"
          />
        </template>

        <a-table
          :loading="loading"
          :data="articleList"
          :pagination="{
            total: total,
            current: queryParams.pageNo,
            pageSize: queryParams.pageSize,
            showTotal: true,
          }"
          :bordered="false"
          @page-change="onPageChange"
        >
          <template #columns>
            <a-table-column title="文章标题" :width="400">
              <template #cell="{ record }">
                <div class="title-cell" @click="goToDetail(record.id)">
                  <a-link>{{ record.title }}</a-link>
                  <a-tag
                    v-if="record.isTop"
                    color="red"
                    size="small"
                    style="margin-left: 8px"
                    >置顶</a-tag
                  >
                </div>
              </template>
            </a-table-column>
            <a-table-column title="所属专栏">
              <template #cell="{ record }">
                {{ getColumnName(record.columnId) }}
              </template>
            </a-table-column>
            <a-table-column title="作者" data-index="authorName" />
            <a-table-column title="状态" align="center">
              <template #cell="{ record }">
                <ArticleStatusTag :status="record.status" />
              </template>
            </a-table-column>
            <a-table-column title="浏览/点赞/收藏" align="center" :width="150">
              <template #cell="{ record }">
                <a-space>
                  <span><icon-eye /> {{ record.viewCount || 0 }}</span>
                  <span><icon-thumb-up /> {{ record.likeCount || 0 }}</span>
                  <span><icon-star /> {{ record.favoriteCount || 0 }}</span>
                </a-space>
              </template>
            </a-table-column>
            <a-table-column title="最后更新" :width="180">
              <template #cell="{ record }">
                {{ formatDate(record.updateTime || record.createTime) }}
              </template>
            </a-table-column>
            <a-table-column title="操作" align="center" :width="150">
              <template #cell="{ record }">
                <a-space>
                  <a-button
                    type="text"
                    size="small"
                    @click="goToDetail(record.id)"
                  >
                    阅读
                  </a-button>
                  <a-popconfirm
                    content="确定要取消收藏吗？"
                    @ok="handleUnfavorite(record.id)"
                  >
                    <a-button type="text" size="small" status="danger">
                      取消收藏
                    </a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import useArticle from '@/hooks/article/useArticle';
  import useArticleColumn from '@/hooks/article/useArticleColumn';
  import { formatDate } from '@/utils/date';
  import type { ArticleQuery } from '@/api/article';
  import ArticleStatusTag from '@/components/article/ArticleStatusTag.vue';

  const router = useRouter();
  const { loading, articleList, total, fetchFavoritePage, favoriteArticle } =
    useArticle();
  const { fetchActiveColumns, getColumnName } = useArticleColumn();

  const queryParams = reactive<ArticleQuery>({
    title: undefined,
    pageNo: 1,
    pageSize: 10,
  });

  const handleSearch = () => {
    queryParams.pageNo = 1;
    fetchFavoritePage(queryParams);
  };

  const onPageChange = (current: number) => {
    queryParams.pageNo = current;
    fetchFavoritePage(queryParams);
  };

  const handleUnfavorite = async (id: string) => {
    // 收藏接口本身是 toggle 属性
    const success = await favoriteArticle(id);
    if (success) {
      handleSearch();
    }
  };

  const goToDetail = (id: string) => {
    router.push({
      name: 'article-protal-detail',
      query: { id },
    });
  };

  onMounted(() => {
    fetchActiveColumns();
    handleSearch();
  });
</script>

<style scoped lang="less">
  .container {
    padding: 16px 20px 20px 20px;
  }
  .title-cell {
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
</style>
