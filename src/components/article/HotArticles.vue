<template>
  <a-card class="sidebar-card hot-card" :bordered="false">
    <div class="sidebar-header">
      <icon-fire />
      <span>热门文章</span>
    </div>
    <div class="hot-list">
      <a-spin :loading="loading" style="width: 100%">
        <div
          v-for="(item, index) in articleList"
          :key="item.id"
          class="hot-item"
          @click="goToDetail(item.id)"
        >
          <div class="rank-num" :class="`rank-${index + 1}`">
            {{ index + 1 }}
          </div>
          <div class="item-info">
            <div class="item-title">{{ item.title }}</div>
            <div class="item-meta">
              <span><icon-eye /> {{ item.viewCount || 0 }}</span>
              <span class="dot">·</span>
              <span><icon-thumb-up /> {{ item.likeCount || 0 }}</span>
              <span class="dot">·</span>
              <span><icon-star /> {{ item.favoriteCount || 0 }}</span>
            </div>
          </div>
        </div>
        <a-empty
          v-if="articleList.length === 0 && !loading"
          description="暂无热点"
        />
      </a-spin>
    </div>
  </a-card>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    IconFire,
    IconEye,
    IconThumbUp,
    IconStar,
  } from '@arco-design/web-vue/es/icon';
  import useArticle from '@/hooks/article/useArticle';

  const router = useRouter();
  const { loading, articleList, fetchPage } = useArticle();

  const fetchHot = () => {
    fetchPage({
      status: 2,
      hotSort: 1,
      pageNo: 1,
      pageSize: 8,
    });
  };

  const goToDetail = (id?: string) => {
    if (!id) return;
    router.push({
      name: 'article-protal-detail',
      query: { id },
    });
  };

  onMounted(() => {
    fetchHot();
  });
</script>

<style scoped lang="less">
  .hot-card {
    margin-top: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--color-border-2);
    font-size: 16px;
    font-weight: 600;
    color: var(--color-text-1);

    svg {
      color: #ff4d4f;
    }
  }

  .hot-list {
    padding: 8px 0;
  }

  .hot-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 16px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background-color: var(--color-fill-2);
      .item-title {
        color: var(--color-primary);
      }
    }

    .rank-num {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      border-radius: 4px;
      background-color: var(--color-fill-3);
      color: var(--color-text-3);
      margin-top: 2px;

      &.rank-1 {
        background-color: #ff4d4f;
        color: #fff;
      }
      &.rank-2 {
        background-color: #ff7d00;
        color: #fff;
      }
      &.rank-3 {
        background-color: #ffb400;
        color: #fff;
      }
    }

    .item-info {
      flex: 1;
      overflow: hidden;

      .item-title {
        font-size: 14px;
        color: var(--color-text-1);
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.4;
      }

      .item-meta {
        font-size: 12px;
        color: var(--color-text-4);
        display: flex;
        align-items: center;
        gap: 6px;

        .dot {
          font-weight: bold;
        }
      }
    }
  }
</style>
