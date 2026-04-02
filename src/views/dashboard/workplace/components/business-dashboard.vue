<template>
  <a-card
    class="general-card dashboard-card"
    :bordered="false"
    title="业务看板"
  >
    <a-tabs v-model:active-key="activeKey" type="line" size="medium">
      <a-tab-pane key="6s" title="6S 积分概览">
        <div class="dashboard-content">
          <!-- 直接引用 6S 模块下的看板子组件 (支持分页、只读) -->
          <DashboardSixS />
        </div>
      </a-tab-pane>

      <a-tab-pane key="summary" title="其它业务汇总">
        <div class="empty-placeholder">
          <a-empty description="暂无业务汇总数据" />
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-card>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import DashboardSixS from '@/views/sixs/overview/components/DashboardSixS.vue';

  const activeKey = ref('6s');
</script>

<style scoped lang="less">
  .dashboard-card {
    border-radius: 12px;
    height: 100%;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

    :deep(.arco-card-header) {
      border-bottom: 1px solid var(--color-border-2);
      padding: 16px 20px;
    }
    :deep(.arco-card-body) {
      padding: 16px 20px;
    }
  }

  .dashboard-content {
    min-height: 400px;
  }

  .empty-placeholder {
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
