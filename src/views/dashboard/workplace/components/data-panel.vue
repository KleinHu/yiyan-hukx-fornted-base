<template>
  <a-grid :cols="24" :col-gap="16" :row-gap="16" class="panel">
    <a-grid-item
      v-for="(item, index) in statData"
      :key="index"
      :span="{ xs: 12, sm: 12, md: 12, lg: 6, xl: 6, xxl: 6 }"
    >
      <div class="stat-card">
        <div class="stat-header">
          <div
            class="stat-icon-wrapper"
            :style="{ backgroundColor: item.bgColor }"
          >
            <component :is="item.icon" :style="{ color: item.iconColor }" />
          </div>
          <div class="stat-trend">
            <span :class="item.trend > 0 ? 'up' : 'down'">
              <icon-caret-up v-if="item.trend > 0" />
              <icon-caret-down v-else />
              {{ Math.abs(item.trend) }}%
            </span>
          </div>
        </div>
        <div class="stat-main">
          <div class="stat-info">
            <div class="stat-title">{{ item.title }}</div>
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-footer">{{ item.footer }}</div>
          </div>
          <div class="stat-chart">
            <Chart
              height="40px"
              width="80px"
              :option="getMiniChartOption(item.chartColor)"
            />
          </div>
        </div>
      </div>
    </a-grid-item>
  </a-grid>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const statData = computed(() => [
    {
      title: t('workplace.onlineContent'),
      value: '373.5',
      trend: 12.5,
      footer: '较上月',
      icon: 'icon-file',
      iconColor: '#1890ff',
      bgColor: '#e8f3ff',
      chartColor: '#1890ff',
    },
    {
      title: t('workplace.putIn'),
      value: '368',
      trend: -2.4,
      footer: '较昨日',
      icon: 'icon-drive-file',
      iconColor: '#722ed1',
      bgColor: '#f3f0ff',
      chartColor: '#722ed1',
    },
    {
      title: t('workplace.newDay'),
      value: '8,874',
      trend: 5.8,
      footer: '活跃互动',
      icon: 'icon-message',
      iconColor: '#fa8c16',
      bgColor: '#fff7e8',
      chartColor: '#fa8c16',
    },
    {
      title: t('workplace.newFromYesterday'),
      value: '2.8%',
      trend: 0.5,
      footer: '稳定增长',
      icon: 'icon-bar-chart',
      iconColor: '#52c41a',
      bgColor: '#e8ffea',
      chartColor: '#52c41a',
    },
  ]);

  const getMiniChartOption = (color: string) => {
    return {
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      xAxis: { type: 'category', show: false },
      yAxis: { type: 'value', show: false },
      series: [
        {
          data: [10, 22, 18, 25, 15, 20, 30],
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: { color, width: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${color}33` },
                { offset: 1, color: `${color}00` },
              ],
            },
          },
        },
      ],
    };
  };
</script>

<style lang="less" scoped>
  .panel {
    padding: 0;
    background-color: transparent;
  }

  .stat-card {
    padding: 20px;
    background-color: var(--color-bg-2);
    border-radius: 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .stat-icon-wrapper {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .stat-trend {
    font-size: 12px;
    font-weight: bold;

    .up {
      color: #52c41a;
    }
    .down {
      color: #f5222d;
    }
  }

  .stat-main {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .stat-info {
    flex: 1;
  }

  .stat-title {
    font-size: 12px;
    color: var(--color-text-3);
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: bold;
    color: var(--color-text-1);
    margin-bottom: 4px;
  }

  .stat-footer {
    font-size: 12px;
    color: var(--color-text-4);
  }

  .stat-chart {
    width: 80px;
    height: 40px;
  }
</style>
