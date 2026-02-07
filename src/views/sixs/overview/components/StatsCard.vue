<template>
  <div class="stats-container">
    <a-grid :cols="5" :col-gap="12" :row-gap="12">
      <!-- 年份统计卡片 -->
      <a-grid-item>
        <div class="stat-card year-card">
          <div class="stat-header">
            <span class="stat-label">当前年份</span>
            <div
              class="stat-icon-wrapper"
              style="background-color: rgba(var(--primary-6), 0.08)"
            >
              <IconCalendar
                class="stat-icon"
                style="color: rgb(var(--primary-6))"
              />
            </div>
          </div>
          <div class="stat-value year-select-wrap">
            <slot name="year-selector"></slot>
          </div>
        </div>
      </a-grid-item>

      <!-- 其它统计卡片 -->
      <a-grid-item v-for="item in statisticsItems" :key="item.type">
        <div
          class="stat-card"
          :class="[item.type, { active: modelValue === item.type }]"
          @click="handleClick(item.type)"
        >
          <div class="stat-header">
            <span class="stat-label">
              {{ item.label }}
              <span v-if="item.range" class="stat-range"
                >({{ item.range }})</span
              >
            </span>
            <div
              class="stat-icon-wrapper"
              :style="{ backgroundColor: item.bg }"
            >
              <component
                :is="item.icon"
                :style="{ color: item.color }"
                class="stat-icon"
              />
            </div>
          </div>
          <div class="stat-value" :style="{ color: item.color }">
            {{ item.value }}
          </div>
        </div>
      </a-grid-item>
    </a-grid>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import {
    IconUserGroup,
    IconTrophy,
    IconExclamationCircle,
    IconCloseCircle,
    IconCalendar,
  } from '@arco-design/web-vue/es/icon';

  const props = defineProps<{
    modelValue?: string; // 当前选中的类型：all, excellent, warning, serious
    total?: number;
    excellent?: number;
    warning?: number;
    serious?: number;
  }>();

  const emit = defineEmits(['update:modelValue', 'change']);

  const statisticsItems = computed(() => [
    {
      label: '台账总数',
      value: props.total || 0,
      icon: IconUserGroup,
      color: '#165dff',
      bg: 'rgba(22, 93, 255, 0.08)',
      range: '',
      type: 'all',
    },
    {
      label: '优秀',
      value: props.excellent || 0,
      icon: IconTrophy,
      color: '#00b42a',
      bg: 'rgba(0, 180, 42, 0.08)',
      range: '≥100',
      type: 'excellent',
    },
    {
      label: '警告',
      value: props.warning || 0,
      icon: IconExclamationCircle,
      color: '#ff7d00',
      bg: 'rgba(255, 125, 0, 0.08)',
      range: '85-99',
      type: 'warning',
    },
    {
      label: '严重',
      value: props.serious || 0,
      icon: IconCloseCircle,
      color: '#f53f3f',
      bg: 'rgba(245, 63, 63, 0.08)',
      range: '<85',
      type: 'serious',
    },
  ]);

  const handleClick = (type: string) => {
    const newValue = props.modelValue === type ? 'all' : type;
    emit('update:modelValue', newValue);
    emit('change', newValue);
  };
</script>

<style scoped>
  .stats-container {
    width: 100%;
    margin-bottom: 16px;
  }

  .stat-card {
    background: var(--color-bg-2);
    border-radius: 8px;
    padding: 12px 16px;
    height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.3s cubic-bezier(0.34, 0.69, 0.1, 1);
    border: 1px solid var(--color-border-2);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  }

  .stat-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  }

  /* 选中态样式 */
  .stat-card.active.all {
    border-color: #165dff;
    background-color: rgba(22, 93, 255, 0.02);
  }
  .stat-card.active.excellent {
    border-color: #00b42a;
    background-color: rgba(0, 180, 42, 0.02);
  }
  .stat-card.active.warning {
    border-color: #ff7d00;
    background-color: rgba(255, 125, 0, 0.02);
  }
  .stat-card.active.serious {
    border-color: #f53f3f;
    background-color: rgba(245, 63, 63, 0.02);
  }

  /* 年份卡片专属调整 */
  .year-card {
    cursor: default;
  }
  .year-card:hover {
    transform: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  }
  .year-select-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
  }
  /* 适配 a-year-picker 的样式 */
  :deep(.arco-picker) {
    background: transparent;
    padding: 0;
  }
  :deep(.arco-picker-input) {
    justify-content: center;
  }
  :deep(.arco-picker-input-inner) {
    font-size: 20px;
    font-weight: 700;
    color: var(--color-text-1);
    text-align: center;
    padding: 0;
  }
  :deep(.arco-picker-suffix) {
    font-size: 14px;
    color: var(--color-text-3);
    margin-left: 4px;
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 24px;
  }

  .stat-label {
    display: flex;
    align-items: center;
    font-size: 12px;
    color: var(--color-text-2);
    font-weight: 500;
    line-height: 1;
  }

  .stat-range {
    font-size: 11px;
    margin-left: 4px;
    font-weight: normal;
    color: var(--color-text-3);
  }

  /* 标签颜色跟随主体 */
  .excellent .stat-label {
    color: #00b42a;
  }
  .warning .stat-label {
    color: #ff7d00;
  }
  .serious .stat-label {
    color: #f53f3f;
  }

  .stat-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
  }

  .stat-icon {
    font-size: 14px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
    text-align: center;
    font-family: 'Inter', -apple-system, system-ui;
  }

  /* 小屏幕优化 - iframe 场景 */
  @media (max-width: 1200px) {
    .stat-card {
      height: 70px;
      padding: 10px 12px;
    }
    .stat-value {
      font-size: 20px;
    }
    .stat-label {
      font-size: 11px;
    }
    .stat-icon-wrapper {
      width: 20px;
      height: 20px;
    }
    .stat-icon {
      font-size: 12px;
    }
  }

  @media (max-width: 768px) {
    .stats-container {
      margin-bottom: 12px;
    }
    .stat-card {
      height: 60px;
      padding: 8px 10px;
      border-radius: 6px;
    }
    .stat-header {
      height: 20px;
    }
    .stat-value {
      font-size: 18px;
    }
    .stat-label {
      font-size: 10px;
    }
    .stat-range {
      font-size: 10px;
    }
    .year-select-wrap {
      height: 24px;
    }
    :deep(.arco-picker-input-inner) {
      font-size: 16px;
    }
  }
</style>
