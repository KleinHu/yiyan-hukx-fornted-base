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
            <span v-if="item.trend > 0" class="up">
              <icon-caret-up /> {{ item.trend }}%
            </span>
            <span v-else-if="item.trend < 0" class="down">
              <icon-caret-down /> {{ Math.abs(item.trend) }}%
            </span>
            <span v-else class="neutral"> 持平 </span>
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
  import { ref, computed, onMounted } from 'vue';
  import { getArticleDashboardStats } from '@/api/article';

  const publishedCount = ref(0);
  const recentPublishedCount = ref(0);
  const hotViewCount = ref(0);
  const columnCount = ref(0);

  const publishedTrend = ref(0);
  const recentPublishedTrend = ref(0);
  const hotViewTrend = ref(0);
  const columnTrend = ref(0);

  const statData = computed(() => [
    {
      title: '线上总文章',
      value: publishedCount.value,
      trend: publishedTrend.value,
      footer: '较上月新增比',
      icon: 'icon-file',
      iconColor: '#1890ff',
      bgColor: '#e8f3ff',
      chartColor: '#1890ff',
    },
    {
      title: '近一周上线',
      value: recentPublishedCount.value,
      trend: recentPublishedTrend.value,
      footer: '较上周产出比',
      icon: 'icon-drive-file',
      iconColor: '#722ed1',
      bgColor: '#f3f0ff',
      chartColor: '#722ed1',
    },
    {
      title: 'TOP10 活跃热度',
      value: hotViewCount.value,
      trend: hotViewTrend.value,
      footer: '较上周热度比',
      icon: 'icon-eye',
      iconColor: '#fa8c16',
      bgColor: '#fff7e8',
      chartColor: '#fa8c16',
    },
    {
      title: '启用文章专栏',
      value: columnCount.value,
      trend: columnTrend.value,
      footer: '结构稳定性',
      icon: 'icon-apps',
      iconColor: '#52c41a',
      bgColor: '#e8ffea',
      chartColor: '#52c41a',
    },
  ]);

  const fetchStats = async () => {
    try {
      const { data } = await getArticleDashboardStats();
      if (data) {
        publishedCount.value = data.publishedCount || 0;
        recentPublishedCount.value = data.recentPublishedCount || 0;
        hotViewCount.value = data.hotViewCount || 0;
        columnCount.value = data.columnCount || 0;

        publishedTrend.value = data.publishedTrend || 0;
        recentPublishedTrend.value = data.recentPublishedTrend || 0;
        hotViewTrend.value = data.hotViewTrend || 0;
        columnTrend.value = data.columnTrend || 0;
      }
    } catch (err) {
      // 容错处理
    }
  };

  onMounted(() => {
    fetchStats();
  });

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
    padding: 16px;
    background-color: var(--color-bg-2);
    border-radius: 10px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.3s;
    border: 1px solid var(--color-border-1);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
  }

  .stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .stat-icon-wrapper {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
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
    .neutral {
      color: #8c8c8c;
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
    font-size: 22px;
    font-weight: bold;
    color: var(--color-text-1);
    margin-bottom: 2px;
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
