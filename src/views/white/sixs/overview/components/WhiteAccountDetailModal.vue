<template>
  <a-modal
    v-model:visible="visible"
    title="积分明细"
    :footer="false"
    width="95%"
    class="white-detail-modal"
    @cancel="handleCancel"
  >
    <div class="modal-content">
      <!-- 1. Header Section - 保持原有 Premium 样式 -->
      <div class="header-section">
        <div class="user-profile">
          <div class="avatar-box">
            <a-avatar :size="64" class="user-avatar">
              <span class="avatar-text">{{
                (accountDetail?.userName || item.userName)?.slice(0, 1)
              }}</span>
            </a-avatar>
          </div>
          <div class="profile-main">
            <div class="name-row">
              <span class="user-name">{{
                accountDetail?.userName || item.userName
              }}</span>
              <a-tag
                :color="
                  getStatusColor(accountDetail?.totalScore ?? item.totalScore)
                "
                class="status-tag"
                bordered
                size="small"
              >
                {{
                  getStatusText(accountDetail?.totalScore ?? item.totalScore)
                }}
                {{ accountDetail?.totalScore ?? item.totalScore }}分
              </a-tag>
            </div>
            <div class="info-row">
              <div class="info-item">
                <span class="label">部门：</span>
                <span class="value">{{
                  accountDetail?.departmentName || item.departmentName
                }}</span>
              </div>
              <div class="info-divider"></div>
              <div class="info-item">
                <span class="label">工号：</span>
                <span class="value">{{
                  accountDetail?.userCode || item.userCode || '-'
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Body Section - 仅展示图表和列表 -->
      <div class="scroll-body">
        <div class="main-content">
          <!-- 分数趋势图 -->
          <div class="chart-card">
            <div class="card-title">分数趋势图</div>
            <div class="chart-wrapper">
              <Chart :options="chartOptions" height="220px" />
            </div>
          </div>

          <!-- 积分变动明细 -->
          <div class="records-section">
            <div class="card-title">积分变动明细</div>
            <a-list
              :bordered="false"
              :loading="recordLoading"
              class="record-list"
            >
              <a-list-item
                v-for="record in recordList"
                :key="record.id"
                class="record-item"
              >
                <div class="record-content">
                  <div
                    class="record-icon"
                    :class="record.scoreDeducted < 0 ? 'minus' : 'plus'"
                  >
                    <icon-minus-circle v-if="record.scoreDeducted < 0" />
                    <icon-plus-circle v-else />
                  </div>
                  <div class="record-info">
                    <div class="record-title-row">
                      <span class="record-title">
                        {{ record.checkerName || '未知' }}
                        <span
                          v-if="record.checkerCode"
                          style="
                            font-size: 13px;
                            color: var(--color-text-3);
                            margin-left: 4px;
                            font-weight: normal;
                          "
                          >({{ record.checkerCode }})</span
                        >
                      </span>
                      <a-tag size="small" class="category-tag">{{
                        record.categoryName || '待分类'
                      }}</a-tag>
                    </div>
                    <div v-if="record.problemDescription" class="record-desc">
                      {{ record.problemDescription }}
                    </div>
                    <div class="record-time">
                      {{ formatTime(record.checkDate) }}
                    </div>
                  </div>
                  <div
                    class="record-score"
                    :class="record.scoreDeducted < 0 ? 'minus' : 'plus'"
                  >
                    {{ record.scoreDeducted < 0 ? '-' : '+'
                    }}{{ Math.abs(record.scoreDeducted) }}
                  </div>
                </div>
              </a-list-item>
              <template #empty>
                <a-empty description="暂无变动明细" />
              </template>
            </a-list>
          </div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import dayjs from 'dayjs';
  import type {
    SixSAccount,
    SixSAccountTrend,
  } from '@/api/sixs/model/sixsModel';
  import useAccount from '@/hooks/sixs/useAccount';
  import useCheckRecord from '@/hooks/sixs/useCheckRecord';
  import Chart from '@/components/chart/index.vue';

  const props = defineProps<{
    visible: boolean;
    item: SixSAccount;
  }>();

  const emit = defineEmits(['update:visible']);

  const visible = ref(props.visible);

  const {
    trendList,
    fetchTrend,
    fetchDetail,
    detail: accountDetail,
  } = useAccount({ autoLoad: false });

  const {
    list: recordList,
    fetchPage: fetchRecords,
    loading: recordLoading,
  } = useCheckRecord({ autoLoad: false });

  watch(
    () => props.visible,
    (val) => {
      visible.value = val;
      if (val && props.item.id) {
        fetchTrend(props.item.id);
        fetchDetail(props.item.id);
        fetchRecords({ accountId: props.item.id, pageNo: 1, pageSize: 20 });
      }
    }
  );

  const handleCancel = () => {
    emit('update:visible', false);
  };

  const formatTime = (time: string) => {
    return dayjs(time).isValid()
      ? dayjs(time).format('YYYY/M/D HH:mm:ss')
      : time;
  };

  const getStatusColor = (score?: number) => {
    if (score === undefined) return 'gray';
    if (score >= 100) return 'green';
    if (score >= 85) return 'orange';
    return 'red';
  };

  const getStatusText = (score?: number) => {
    if (score === undefined) return '-';
    if (score >= 100) return '优秀';
    if (score >= 85) return '警告';
    return '严重';
  };

  const chartOptions = computed(() => {
    const dates = trendList.value.map((d: SixSAccountTrend) => {
      const dt = dayjs(d.checkDate);
      return dt.isValid() ? dt.format('M月D日') : d.checkDate;
    });
    const scores = trendList.value.map((d: SixSAccountTrend) => d.score);

    return {
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '10%',
        containLabel: true,
      },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: dates.length ? dates : ['-', '-', '-'],
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#86909c', fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        min: (value: any) => Math.floor(Math.max(0, value.min - 5) / 5) * 5,
        max: 100,
        splitLine: { lineStyle: { type: 'dashed', color: '#f2f3f5' } },
        axisLabel: { color: '#86909c', fontSize: 10 },
      },
      series: [
        {
          name: '台账积分',
          type: 'line',
          smooth: true,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 8,
          itemStyle: { color: '#165dff', borderWidth: 2, borderColor: '#fff' },
          lineStyle: { width: 3, color: '#165dff' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(22, 93, 255, 0.12)' },
                { offset: 1, color: 'rgba(22, 93, 255, 0)' },
              ],
            },
          },
          data: scores.length ? scores : [100, 100, 100],
          markLine: {
            silent: true,
            symbol: 'none',
            data: [
              {
                yAxis: 100,
                lineStyle: { color: '#00b42a', type: 'dashed', opacity: 0.4 },
                label: { show: false },
              },
              {
                yAxis: 85,
                lineStyle: { color: '#ff7d00', type: 'dashed', opacity: 0.4 },
                label: { show: false },
              },
            ],
          },
        },
      ],
    };
  });
</script>

<style scoped lang="less">
  .white-detail-modal {
    :deep(.arco-modal) {
      border-radius: 12px;
      overflow: hidden;
    }
    :deep(.arco-modal-body) {
      padding: 0;
    }
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    max-height: 85vh;
  }

  /* 0. Header (From original AccountDetailModal) */
  .header-section {
    padding: 24px 20px;
    margin-top: -20px;
    background-color: #fff;
    border-bottom: 1px solid var(--color-border-1);

    .user-profile {
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;

      .avatar-box {
        flex-shrink: 0;
        .user-avatar {
          background-color: rgba(22, 93, 255, 0.08);
          box-shadow: 0 4px 12px rgba(22, 93, 255, 0.12);
          .avatar-text {
            font-size: 24px;
            font-weight: 700;
            color: rgb(var(--primary-6));
          }
        }
      }

      .profile-main {
        flex: 1;
        min-width: 0;

        .name-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;

          .user-name {
            font-size: 22px;
            font-weight: 700;
            color: var(--color-text-1);
          }
          .status-tag {
            font-weight: 600;
          }
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;

          .info-item {
            display: flex;
            align-items: center;
            font-size: 13px;
            .label {
              color: var(--color-text-3);
            }
            .value {
              color: var(--color-text-1);
              font-weight: 500;
            }
          }
          .info-divider {
            width: 1px;
            height: 12px;
            background-color: var(--color-border-2);
          }
        }
      }

      .close-btn-wrap {
        position: absolute;
        right: -8px;
        top: -12px;
        font-size: 20px;
        color: var(--color-text-4);
        cursor: pointer;
        padding: 8px;
        transition: all 0.2s;
        &:hover {
          color: var(--color-text-2);
        }
      }
    }
  }

  .scroll-body {
    flex: 1;
    overflow-y: auto;
    background-color: #fff;
    padding: 20px;
  }

  /* 1. Common Components (From original) */
  .card-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--color-text-1);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    &::before {
      content: '';
      width: 4px;
      height: 16px;
      background-color: rgb(var(--primary-6));
      margin-right: 10px;
      border-radius: 2px;
    }
  }

  .chart-card {
    background: #fbfcfe;
    border: 1px solid var(--color-border-1);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 24px;
  }

  /* 2. Record List (From original) */
  .record-list {
    .record-item {
      padding: 16px 0;
      border-bottom: 1px solid var(--color-fill-2);
      &:last-child {
        border-bottom: none;
      }
    }
    .record-content {
      display: flex;
      align-items: flex-start;
      width: 100%;
      gap: 16px;

      .record-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
        margin-top: 2px;
        &.minus {
          background-color: rgba(245, 63, 63, 0.08);
          color: #f53f3f;
        }
        &.plus {
          background-color: rgba(0, 180, 42, 0.08);
          color: #00b42a;
        }
      }

      .record-info {
        flex: 1;
        min-width: 0;
        .record-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
          .record-title {
            font-size: 15px;
            font-weight: 600;
            color: var(--color-text-1);
          }
          .category-tag {
            background-color: var(--color-fill-2);
            color: var(--color-text-3);
            font-size: 11px;
            border-radius: 4px;
            padding: 0 6px;
            font-weight: normal;
          }
        }
        .record-time {
          font-size: 12px;
          color: var(--color-text-4);
          margin-top: 6px;
        }
        .record-desc {
          font-size: 14px;
          color: var(--color-text-2);
          word-break: break-all;
        }
      }

      .record-score {
        font-size: 20px;
        font-weight: 700;
        flex-shrink: 0;
        margin-top: 2px;
        &.minus {
          color: #f53f3f;
        }
        &.plus {
          color: #00b42a;
        }
      }
    }
  }

  /* Responsive Fixes for Small iFrames */
  @media (max-width: 600px) {
    .header-section {
      padding: 16px 12px;
    }
    .header-section .user-profile .profile-main .user-name {
      font-size: 18px;
    }
    .header-section .user-profile .avatar-box .user-avatar {
      width: 48px !important;
      height: 48px !important;
    }
    .scroll-body {
      padding: 12px;
    }
    .chart-card {
      padding: 12px;
      margin-bottom: 16px;
    }
    .record-list .record-content {
      gap: 12px;
    }
    .record-list .record-content .record-icon {
      width: 36px;
      height: 36px;
    }
  }
</style>
