<template>
  <a-drawer
    :visible="visible"
    title="文章阅读数据概览"
    width="800px"
    unmount-on-close
    :footer="false"
    @cancel="handleClose"
  >
    <div v-if="!loading" class="drawer-content">
      <!-- 统计面板 -->
      <div class="records-stats">
        <div class="mini-stat views">
          <div class="stat-icon-wrapper">
            <icon-eye class="stat-icon" />
          </div>
          <div class="stat-info">
            <div class="label">累计阅读量</div>
            <div class="value">{{ records.length }}</div>
          </div>
          <icon-eye class="bg-icon" />
        </div>
        <div class="mini-stat users">
          <div class="stat-icon-wrapper">
            <icon-user class="stat-icon" />
          </div>
          <div class="stat-info">
            <div class="label">独立访客</div>
            <div class="value">{{ uniqueReaders }}</div>
          </div>
          <icon-user class="bg-icon" />
        </div>
        <div class="mini-stat avg">
          <div class="stat-icon-wrapper">
            <icon-bar-chart class="stat-icon" />
          </div>
          <div class="stat-info">
            <div class="label">人均阅读</div>
            <div class="value">
              {{ avgReadCount }}
              <span style="font-size: 14px; font-weight: normal; opacity: 0.8"
                >次</span
              >
            </div>
          </div>
          <icon-bar-chart class="bg-icon" />
        </div>
      </div>

      <a-divider style="margin: 20px 0" />

      <!-- 详细流水 -->
      <div class="table-title">阅读流水详情</div>
      <a-table
        :data="records"
        :pagination="{ pageSize: 15, showTotal: true }"
        size="small"
        :bordered="false"
      >
        <template #columns>
          <a-table-column title="阅读者" data-index="userName" />
          <a-table-column title="工号" data-index="userCode" />
          <a-table-column title="阅读时间" :width="180">
            <template #cell="{ record }">
              {{ formatDate(record.viewTime) }}
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
    <div v-else style="padding: 40px; text-align: center">
      <a-spin tip="加载中..." />
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import {
    IconEye,
    IconUser,
    IconBarChart,
  } from '@arco-design/web-vue/es/icon';
  import { formatDate } from '@/utils/date';
  import useArticle from '@/hooks/article/useArticle';

  const props = defineProps<{
    visible: boolean;
    articleId: string | undefined;
  }>();

  const emit = defineEmits(['update:visible']);

  const { fetchViewRecords } = useArticle();
  const records = ref<any[]>([]);
  const loading = ref(false);

  const uniqueReaders = computed(() => {
    const set = new Set(records.value.map((r) => r.userCode));
    return set.size;
  });

  const avgReadCount = computed(() => {
    if (uniqueReaders.value === 0) return 0;
    return (records.value.length / uniqueReaders.value).toFixed(1);
  });

  const loadRecords = async () => {
    if (!props.articleId) return;
    loading.value = true;
    try {
      const data = await fetchViewRecords(props.articleId);
      records.value = data || [];
    } finally {
      loading.value = false;
    }
  };

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        loadRecords();
      }
    }
  );

  const handleClose = () => {
    emit('update:visible', false);
  };
</script>

<style scoped lang="less">
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
