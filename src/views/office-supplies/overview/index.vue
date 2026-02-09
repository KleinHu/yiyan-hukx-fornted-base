<template>
  <div class="container">
    <Breadcrumb :items="['办公用品管理', '统计看板']" />
    <div class="overview-content">
      <!-- 顶部统计面板 -->
      <a-grid
        :cols="{ xs: 1, sm: 2, md: 3, lg: 5, xl: 5, xxl: 5 }"
        :col-gap="12"
        :row-gap="12"
      >
        <!-- 年份选择卡片 -->
        <a-grid-item>
          <a-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" style="background-color: #f2f3f5">
                <icon-calendar style="color: #165dff" />
              </div>
              <div class="stat-info">
                <div class="stat-label">统计年份</div>
                <div class="stat-value">
                  <a-date-picker
                    v-model="selectedYear"
                    mode="year"
                    value-format="YYYY"
                    style="width: 100%"
                    :allow-clear="false"
                    @change="handleYearChange"
                  />
                </div>
              </div>
            </div>
          </a-card>
        </a-grid-item>

        <!-- 其他统计卡片 -->
        <a-grid-item v-for="(item, index) in stats" :key="index">
          <a-card :loading="loading" class="stat-card">
            <div class="stat-content">
              <div class="stat-icon" :style="{ backgroundColor: item.bgColor }">
                <component :is="item.icon" :style="{ color: item.color }" />
              </div>
              <div class="stat-info">
                <div class="stat-label">{{ item.title }}</div>
                <div class="stat-value" :title="String(item.value)">
                  {{ item.value }}
                </div>
              </div>
            </div>
          </a-card>
        </a-grid-item>
      </a-grid>

      <a-grid :cols="24" :col-gap="12" :row-gap="12" class="chart-row">
        <!-- 左侧：分类占比饼图 -->
        <a-grid-item :span="{ xs: 24, lg: 8 }">
          <a-card title="用品分类分布" class="overview-card">
            <Chart height="300px" :option="categoryChartOption" />
          </a-card>
        </a-grid-item>

        <!-- 中间：库存预警趋势或最近申领单 -->
        <a-grid-item :span="{ xs: 24, lg: 16 }">
          <a-card title="年度物品领用情况" class="overview-card">
            <Chart height="300px" :option="requestTrendOption" />
          </a-card>
        </a-grid-item>
      </a-grid>

      <a-grid :cols="24" :col-gap="12" :row-gap="12" class="bottom-row">
        <!-- 库存预警项 -->
        <a-grid-item :span="{ xs: 24, lg: 12 }">
          <a-card title="库存预警物品" class="overview-card">
            <template #extra>
              <a-link @click="$router.push('/office-supplies/item')"
                >查看更多</a-link
              >
            </template>
            <a-table
              :data="lowStockItems"
              :pagination="false"
              :loading="loading"
              size="small"
              :bordered="false"
            >
              <template #columns>
                <a-table-column title="物品名称" data-index="name" />
                <a-table-column title="规格" data-index="spec" />
                <a-table-column title="当前库存" data-index="stock">
                  <template #cell="{ record }">
                    <span style="color: #f53f3f; font-weight: bold">{{
                      record.stock
                    }}</span>
                  </template>
                </a-table-column>
                <a-table-column title="最低阈值" data-index="minStock" />
              </template>
            </a-table>
          </a-card>
        </a-grid-item>

        <!-- 最新申领单 -->
        <a-grid-item :span="{ xs: 24, lg: 12 }">
          <a-card title="最新申领动态" class="overview-card">
            <template #extra>
              <a-link @click="$router.push('/office-supplies/apply')"
                >查看更多</a-link
              >
            </template>
            <a-table
              :data="recentRequests"
              :pagination="false"
              :loading="loading"
              size="small"
              :bordered="false"
            >
              <template #columns>
                <a-table-column title="单号" data-index="orderNo" />
                <a-table-column title="申请人" data-index="userName" />
                <a-table-column title="时间" data-index="applyTime">
                  <template #cell="{ record }">
                    {{ formatTime(record.applyTime) }}
                  </template>
                </a-table-column>
                <a-table-column title="状态" data-index="auditStatus">
                  <template #cell="{ record }">
                    <a-tag :color="getStatusColor(record.auditStatus)">
                      {{ getStatusText(record.auditStatus) }}
                    </a-tag>
                  </template>
                </a-table-column>
              </template>
            </a-table>
          </a-card>
        </a-grid-item>
      </a-grid>

      <!-- 新增：科室领用分析表格 -->
      <div class="analysis-row" style="margin-top: 12px">
        <DeptConsumptionTable title="领用情况分析" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import * as suppliesApi from '@/api/supplies';
  import dayjs from 'dayjs';
  import DeptConsumptionTable from './components/DeptConsumptionTable.vue';

  const loading = ref(false);
  const dashboardData = ref<suppliesApi.SuppliesDashboardVO | null>(null);
  const selectedYear = ref(dayjs().year().toString());

  const stats = computed(() => [
    {
      title: '物品总数',
      value: dashboardData.value?.statistics.totalItems || 0,
      icon: 'icon-common',
      color: '#165DFF',
      bgColor: '#E8F3FF',
    },
    {
      title: '低库存预警',
      value: dashboardData.value?.statistics.lowStockCount || 0,
      icon: 'icon-notification',
      color: '#F53F3F',
      bgColor: '#FFECE8',
    },
    {
      title: '待审核申请',
      value: dashboardData.value?.statistics.pendingAuditCount || 0,
      icon: 'icon-schedule',
      color: '#FF7D00',
      bgColor: '#FFF7E8',
    },
    {
      title: `${selectedYear.value}年度申领`,
      value: `¥${(
        dashboardData.value?.statistics.yearlyTotalAmount || 0
      ).toLocaleString()}`,
      icon: 'icon-safe',
      color: '#00B42A',
      bgColor: '#E8FFEA',
    },
  ]);

  const lowStockItems = computed(
    () => dashboardData.value?.lowStockItems || []
  );
  const recentRequests = computed(
    () => dashboardData.value?.recentRequests || []
  );

  const categoryChartOption = computed(() => {
    const data = dashboardData.value?.categoryDistribution || [];

    return {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', right: 10, top: 'center' },
      series: [
        {
          name: '分类分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: {
            label: { show: true, fontSize: '18', fontWeight: 'bold' },
          },
          labelLine: { show: false },
          data,
        },
      ],
    };
  });

  const requestTrendOption = computed(() => {
    const trend = dashboardData.value?.applyTrend || { dates: [], values: [] };

    return {
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: { type: 'category', boundaryGap: false, data: trend.dates },
      yAxis: { type: 'value' },
      tooltip: { trigger: 'axis' },
      series: [
        {
          name: '申领单数',
          type: 'line',
          smooth: true,
          data: trend.values,
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(22, 93, 255, 0.3)' },
                { offset: 1, color: 'rgba(22, 93, 255, 0)' },
              ],
            },
          },
          lineStyle: { width: 3, color: '#165DFF' },
          itemStyle: { color: '#165DFF' },
        },
      ],
    };
  });

  const handleYearChange = () => {
    fetchData();
  };

  const fetchData = async () => {
    loading.value = true;
    try {
      const { data } = await suppliesApi.getDashboardData(selectedYear.value);
      dashboardData.value = data;
    } catch (error) {
      // 错误处理由拦截器统一处理
    } finally {
      loading.value = false;
    }
  };

  const formatTime = (time: string) =>
    time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-';

  const getStatusText = (status: number) => {
    const map: any = { 0: '待审核', 1: '通过', 2: '驳回', 3: '已发放' };
    return map[status] || '未知';
  };

  const getStatusColor = (status: number) => {
    const map: any = { 0: 'orange', 1: 'green', 2: 'red', 3: 'blue' };
    return map[status] || 'gray';
  };

  onMounted(() => {
    fetchData();
  });
</script>

<style scoped lang="less">
  .container {
    padding: 16px 20px 20px 20px;
    background-color: #f7f9fb;
    min-height: calc(100vh - 60px);
  }

  .overview-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  /* 统计卡片样式 */
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
    line-height: 32px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    :deep(.arco-picker) {
      background-color: transparent;
      border: none;
      padding: 0;
      height: 32px;
      line-height: 32px;
    }
    :deep(.arco-picker-input) {
      font-size: 24px;
      font-weight: 700;
      color: #1d2129;
      padding: 0;
      line-height: 32px;
    }
  }

  .overview-card {
    border-radius: 8px;
    border: 1px solid #e5e6eb;
    height: 100%;
  }

  :deep(.arco-card-header) {
    border-bottom: 1px solid var(--color-border-1);
    height: 48px;
  }
</style>
