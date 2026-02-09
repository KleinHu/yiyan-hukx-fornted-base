<template>
  <a-grid :cols="24" :col-gap="12" :row-gap="12">
    <a-grid-item
      v-for="(item, index) in data"
      :key="index"
      :span="{ xs: 12, sm: 12, md: 12, lg: 6, xl: 6, xxl: 6 }"
    >
      <a-card :loading="loading" class="stat-card">
        <div class="stat-content">
          <div class="stat-icon" :style="{ backgroundColor: item.bgColor }">
            <component :is="item.icon" :style="{ color: item.color }" />
          </div>
          <div class="stat-info">
            <div class="stat-label">{{ item.title }}</div>
            <div class="stat-value">{{ item.value }}</div>
          </div>
        </div>
      </a-card>
    </a-grid-item>
  </a-grid>
</template>

<script setup lang="ts">
  defineProps<{
    data: any[];
    loading: boolean;
  }>();
</script>

<style scoped lang="less">
  .stat-card {
    border-radius: 8px;
    background-color: #fff;
    border: 1px solid #e5e6eb;
    transition: all 0.3s;
    height: 104px;
    display: flex;
    flex-direction: column;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    :deep(.arco-card-body) {
      flex: 1;
      width: 100%;
      padding: 0 24px;
      display: flex;
      align-items: center;
    }
  }

  .stat-content {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 16px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
  }

  .stat-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .stat-label {
    font-size: 14px;
    color: #86909c;
    margin-bottom: 4px;
    line-height: 1.2;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #1d2129;
    font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
