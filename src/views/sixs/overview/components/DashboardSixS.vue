<template>
  <div class="dashboard-sixs">
    <!-- 统计概览 - 复用 StatsCard 或直接展示内容 -->
    <div class="stats-overview">
      <div class="stat-item excellent">
        <div class="stat-label">优秀人员</div>
        <div class="stat-value">{{ stats.excellentCount }}</div>
      </div>
      <div class="stat-item warning">
        <div class="stat-label">警告人员</div>
        <div class="stat-value">{{ stats.warningCount }}</div>
      </div>
      <div class="stat-item serious">
        <div class="stat-label">严重人员</div>
        <div class="stat-value">{{ stats.seriousCount }}</div>
      </div>
    </div>

    <!-- 列表标题与数据量 -->
    <div class="list-summary">
      <div class="summary-text">
        共 {{ pagination.total }} 条积分记录 ({{ currentYear }}年)
      </div>
    </div>

    <!-- 卡片网格 -->
    <a-spin :loading="loading" style="width: 100%">
      <div class="card-grid-container">
        <a-grid
          :cols="{ xs: 1, sm: 1, md: 2, lg: 3 }"
          :col-gap="12"
          :row-gap="12"
        >
          <a-grid-item v-for="item in accountList" :key="item.id">
            <AccountCard :item="item" class="dashboard-card-item" />
          </a-grid-item>
        </a-grid>

        <div v-if="accountList.length === 0 && !loading" class="empty-status">
          <a-empty />
        </div>
      </div>

      <!-- 分页控制 -->
      <div class="pagination-wrapper">
        <a-pagination
          v-model:current="pagination.current"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          size="small"
          show-total
          @change="handlePageChange"
        />
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import dayjs from 'dayjs';
  import useAccount from '@/hooks/sixs/useAccount';
  import AccountCard from './AccountCard.vue';

  const currentYear = ref(dayjs().year());

  const {
    list: accountList,
    stats,
    loading,
    pagination,
    fetchPage,
    fetchStatistics,
  } = useAccount({ autoLoad: false });

  // 设定初始每页条数
  pagination.pageSize = 12;

  const fetchData = () => {
    fetchStatistics(currentYear.value);
    fetchPage({
      year: currentYear.value,
      status: 1,
    });
  };

  const handlePageChange = (current: number) => {
    pagination.current = current;
    fetchPage({ year: currentYear.value, status: 1 });
  };

  onMounted(() => {
    fetchData();
  });
</script>

<style scoped lang="less">
  .dashboard-sixs {
    padding: 0;
  }

  .stats-overview {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;

    .stat-item {
      flex: 1;
      padding: 16px;
      border-radius: 12px;
      text-align: center;
      transition: all 0.3s;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);

      .stat-label {
        font-size: 13px;
        color: var(--color-text-3);
        margin-bottom: 6px;
      }
      .stat-value {
        font-size: 24px;
        font-weight: 800;
        line-height: 1;
      }

      &.excellent {
        background-color: #e8ffea;
        color: #00b42a;
      }
      &.warning {
        background-color: #fff7e8;
        color: #ff7d00;
      }
      &.serious {
        background-color: #fff2f0;
        color: #f53f3f;
      }
    }
  }

  .list-summary {
    margin-bottom: 12px;
    .summary-text {
      font-size: 13px;
      color: var(--color-text-3);
    }
  }

  .card-grid-container {
    min-height: 200px;
  }

  .dashboard-card-item {
    // 首页保持只读，不显示箭头
    pointer-events: none;
    :deep(.action-icon) {
      display: none;
    }
  }

  .pagination-wrapper {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
  }

  .empty-status {
    padding: 40px 0;
  }
</style>
