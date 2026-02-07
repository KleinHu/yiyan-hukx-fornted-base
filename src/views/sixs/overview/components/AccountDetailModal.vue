<template>
  <a-modal
    v-model:visible="visible"
    title="积分明细"
    :footer="false"
    width="900px"
    class="account-detail-modal"
    @cancel="handleCancel"
  >
    <div class="modal-content">
      <!-- Fixed Header Section with stable Layout -->
      <div class="header-section">
        <div class="user-profile">
          <div class="avatar-box">
            <a-avatar :size="72" class="user-avatar">
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
              >
                <template #icon
                  ><icon-check-circle-fill
                    v-if="
                      (accountDetail?.totalScore ?? item.totalScore ?? 0) >= 100
                    "
                /></template>
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

      <div class="body-section">
        <!-- Sidebar Nav -->
        <div class="side-nav">
          <div
            class="nav-item"
            :class="{ active: activeKey === 'overview' }"
            @click="activeKey = 'overview'"
          >
            <div class="nav-ink"></div>
            <icon-storage class="nav-icon" />
            <span class="nav-text">概览 & 台账</span>
          </div>
          <div
            v-if="!readonly"
            class="nav-item"
            :class="{ active: activeKey === 'add' }"
            @click="activeKey = 'add'"
          >
            <div class="nav-ink"></div>
            <icon-plus-circle-fill
              v-if="activeKey === 'add'"
              class="nav-icon"
            />
            <icon-plus v-else class="nav-icon" />
            <span class="nav-text">添加记录</span>
          </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Tab 1: Overview -->
          <div v-if="activeKey === 'overview'" class="overview-section">
            <div class="chart-card">
              <div class="card-title">分数趋势图</div>
              <div class="chart-wrapper">
                <Chart :options="chartOptions" height="260px" />
              </div>
            </div>

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
                      <div class="record-desc">
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
                    <!-- 编辑 & 删除 -->
                    <a-space v-if="!readonly" :size="4" class="actions-wrapper">
                      <div
                        class="edit-action"
                        @click="handleEditRecord(record)"
                      >
                        <icon-edit />
                      </div>
                      <a-popconfirm
                        content="确定要删除这条积分记录吗？"
                        type="warning"
                        @ok="record.id && handleDeleteRecord(record.id)"
                      >
                        <div class="delete-action">
                          <icon-delete />
                        </div>
                      </a-popconfirm>
                    </a-space>
                  </div>
                </a-list-item>
                <template #empty>
                  <a-empty description="暂无变动明细" />
                </template>
              </a-list>
            </div>
          </div>

          <!-- Tab 2: Add Record (p1 Style) -->
          <div v-else-if="activeKey === 'add'" class="add-record-section">
            <div class="form-title">新增 6S 记录</div>

            <div class="type-selector">
              <div
                class="type-btn minus"
                :class="{ active: form.scoreType === 'minus' }"
                @click="form.scoreType = 'minus'"
              >
                <div class="symbol">－</div>
                <div class="label">扣分</div>
              </div>
              <div
                class="type-btn plus"
                :class="{ active: form.scoreType === 'plus' }"
                @click="form.scoreType = 'plus'"
              >
                <div class="symbol">＋</div>
                <div class="label">加分 / 奖励</div>
              </div>
            </div>

            <a-form :model="form" layout="vertical" class="record-form">
              <a-form-item label="违规/奖励分类" required>
                <a-select
                  v-model="form.categoryId"
                  placeholder="请选择分类"
                  :loading="categoryLoading"
                >
                  <a-option
                    v-for="cat in displayCategoryList"
                    :key="cat.id"
                    :value="cat.id"
                    :label="cat.name"
                  />
                </a-select>
              </a-form-item>

              <a-form-item label="分值" required>
                <a-input-number
                  v-model="form.score"
                  :min="1"
                  :max="100"
                  placeholder="1"
                />
              </a-form-item>

              <a-form-item label="检查日期" required>
                <a-date-picker
                  v-model="form.checkDate"
                  placeholder="请选择日期"
                  style="width: 100%"
                />
              </a-form-item>

              <a-form-item label="检查人" required>
                <a-space fill>
                  <a-input
                    v-model="form.checkerCode"
                    placeholder="工号"
                    readonly
                  />
                  <a-input
                    v-model="form.checkerName"
                    placeholder="姓名"
                    readonly
                  />
                  <a-button
                    type="primary"
                    @click="employeeSelectVisible = true"
                  >
                    <template #icon><icon-user /></template>
                    选择
                  </a-button>
                </a-space>
              </a-form-item>

              <a-form-item label="原因 / 观察说明" required>
                <a-textarea
                  v-model="form.problemDescription"
                  placeholder="例如：工具使用后未归位，造成台面杂乱..."
                  :auto-size="{ minRows: 4, maxRows: 6 }"
                />
              </a-form-item>

              <div class="form-footer">
                <a-button
                  type="primary"
                  size="large"
                  block
                  :loading="recordLoading"
                  class="save-btn"
                  @click="handleSave"
                >
                  <template #icon><icon-save /></template>
                  保存记录
                </a-button>
              </div>
            </a-form>
          </div>

          <!-- AI Analytic Dummy -->
          <div v-else class="empty-placeholder">
            <a-empty description="AI 智能分析功能开发中..." />
          </div>
        </div>
      </div>
    </div>
  </a-modal>
  <EmployeeSelectorModal
    v-model:visible="employeeSelectVisible"
    :multiple="false"
    @submit="onEmployeeSelect"
  />

  <CheckRecordFormDrawer
    ref="editDrawerRef"
    v-model:visible="editVisible"
    :initial="editingRecord"
    :category-options="categoryList"
    :category-loading="categoryLoading"
    @submit="handleEditSubmit"
    @open-employee-select="employeeSelectVisible = true"
  />
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import dayjs from 'dayjs';
  import { Message } from '@arco-design/web-vue';
  import {
    OPERATION_TYPE_ADD,
    OPERATION_TYPE_DEDUCT,
  } from '@/api/sixs/model/sixsModel';
  import type {
    SixSAccount,
    SixSCategory,
    SixSAccountTrend,
    SixSCheckRecord,
  } from '@/api/sixs/model/sixsModel';
  import useAccount from '@/hooks/sixs/useAccount';
  import useCategory from '@/hooks/sixs/useCategory';
  import useCheckRecord from '@/hooks/sixs/useCheckRecord';
  import Chart from '@/components/chart/index.vue';
  import EmployeeSelectorModal from '@/components/hr/EmployeeSelectorModal.vue';
  import { useUserStore } from '@/store';
  import type { Employee } from '@/api/hr/types';
  import CheckRecordFormDrawer from './CheckRecordFormDrawer.vue';

  // 定义组件接口
  interface CheckRecordFormDrawerExposed {
    fillChecker(emp: Employee): void;
  }

  const props = withDefaults(
    defineProps<{
      visible: boolean;
      item: SixSAccount;
      readonly?: boolean;
    }>(),
    {
      readonly: false,
    }
  );

  const emit = defineEmits(['update:visible', 'success']);

  const activeKey = ref('overview');
  const visible = ref(props.visible);
  const employeeSelectVisible = ref(false);
  const userStore = useUserStore();

  // Use encapsulated Hooks
  const {
    trendList,
    fetchTrend,
    fetchDetail,
    detail: accountDetail,
  } = useAccount({
    autoLoad: false,
  });
  const {
    list: categoryList,
    fetchList: fetchCategories,
    loading: categoryLoading,
  } = useCategory({ autoLoad: false });
  const {
    list: recordList,
    fetchPage: fetchRecords,
    addRecord,
    remove: removeRecord,
    loading: recordLoading,
  } = useCheckRecord({ autoLoad: false });

  // Form State
  const form = ref({
    scoreType: 'minus', // 'minus' | 'plus'
    categoryId: undefined as number | undefined,
    score: 1,
    problemDescription: '',
    checkDate: dayjs().format('YYYY-MM-DD'),
    checkerCode: '',
    checkerName: '',
  });

  // 编辑逻辑状态
  const editVisible = ref(false);
  const editingRecord = ref<SixSCheckRecord>({} as SixSCheckRecord);
  const editDrawerRef = ref<CheckRecordFormDrawerExposed | null>(null);

  const displayCategoryList = computed(() => {
    const opType =
      form.value.scoreType === 'minus'
        ? OPERATION_TYPE_DEDUCT
        : OPERATION_TYPE_ADD;
    return categoryList.value.filter(
      (cat: SixSCategory) => cat.operationType === opType
    );
  });

  watch(
    () => form.value.scoreType,
    () => {
      form.value.categoryId = undefined;
    }
  );

  watch(
    () => props.visible,
    (val) => {
      visible.value = val;
      if (val && props.item.id) {
        fetchTrend(props.item.id);
        fetchCategories(); // Fetch all categories once
        fetchDetail(props.item.id);
        fetchRecords({ accountId: props.item.id, pageNo: 1, pageSize: 10 });
        // Reset form
        form.value = {
          scoreType: 'minus',
          categoryId: undefined,
          score: 1,
          problemDescription: '',
          checkDate: dayjs().format('YYYY-MM-DD'),
          checkerCode: userStore.userInfo.userCode || '',
          checkerName: userStore.userInfo.username || '',
        };
      }
    }
  );

  const handleCancel = () => {
    emit('update:visible', false);
  };

  const handleSave = async () => {
    if (!form.value.categoryId) {
      Message.warning('请选择分类');
      return;
    }
    if (!form.value.problemDescription) {
      Message.warning('请输入原因说明');
      return;
    }
    if (!form.value.checkerCode) {
      Message.warning('请选择检查人');
      return;
    }

    const accountId = props.item.id;
    if (!accountId) return;

    const success = await addRecord({
      accountId,
      categoryId: form.value.categoryId,
      score: form.value.score,
      scoreType: form.value.scoreType as 'plus' | 'minus',
      description: form.value.problemDescription,
      checkDate: form.value.checkDate,
      checkerCode: form.value.checkerCode,
      checkerName: form.value.checkerName,
    });

    if (success) {
      form.value = {
        scoreType: 'minus',
        categoryId: undefined,
        score: 1,
        problemDescription: '',
        checkDate: dayjs().format('YYYY-MM-DD'),
        checkerCode: userStore.userInfo.userCode || '',
        checkerName: userStore.userInfo.username || '',
      };
      activeKey.value = 'overview';
      // Refresh through Hooks
      fetchTrend(accountId);
      fetchDetail(accountId);
      fetchRecords({ accountId, pageNo: 1, pageSize: 10 });
      emit('success');
    }
  };

  const handleDeleteRecord = async (id: string | number) => {
    const accountId = props.item.id;
    const success = await removeRecord(id);
    if (success && accountId) {
      // 刷新图表和列表
      fetchTrend(accountId);
      fetchDetail(accountId);
      fetchRecords({ accountId, pageNo: 1, pageSize: 10 });
      // 触发外部刷新（如看板列表的分数）
      emit('success');
    }
  };

  const handleEditRecord = (record: SixSCheckRecord) => {
    editingRecord.value = { ...record };
    editVisible.value = true;
  };

  const { update: updateRecord } = useCheckRecord({ autoLoad: false });

  const handleEditSubmit = async (record: SixSCheckRecord) => {
    const accountId = props.item.id;
    const success = await updateRecord(record);
    if (success && accountId) {
      editVisible.value = false;
      fetchTrend(accountId);
      fetchDetail(accountId);
      fetchRecords({ accountId, pageNo: 1, pageSize: 10 });
      emit('success');
    }
  };

  const formatTime = (time: string) => {
    return dayjs(time).isValid()
      ? dayjs(time).format('YYYY/M/D HH:mm:ss')
      : time;
  };

  const getStatusColor = (score?: number) => {
    if (score === undefined || score === null) return 'gray';
    if (score >= 100) return 'green';
    if (score >= 85) return 'orange';
    return 'red';
  };

  const onEmployeeSelect = (employees: Employee[]) => {
    if (employees.length > 0) {
      const emp = employees[0];
      if (editVisible.value) {
        editDrawerRef.value?.fillChecker(emp);
      } else {
        form.value.checkerName = emp.userName;
        form.value.checkerCode = emp.userCode;
      }
    }
  };

  const getStatusText = (score?: number) => {
    if (score === undefined || score === null) return '-';
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
        axisLabel: { color: '#86909c' },
      },
      yAxis: {
        type: 'value',
        min: (value: any) => Math.floor(Math.max(0, value.min - 5) / 5) * 5,
        max: 100,
        splitLine: { lineStyle: { type: 'dashed', color: '#f2f3f5' } },
        axisLabel: { color: '#86909c' },
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
  .account-detail-modal {
    :deep(.arco-modal) {
      border-radius: 12px;
      overflow: hidden;
    }
    :deep(.arco-modal-header) {
      border-bottom: none;
      padding-top: 20px;
    }
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    height: 680px;
  }

  .header-section {
    padding: 0 32px 32px 32px;
    background-color: #fff;

    .user-profile {
      display: flex;
      align-items: center;
      gap: 24px;

      .avatar-box {
        flex-shrink: 0;
        .user-avatar {
          background-color: rgba(22, 93, 255, 0.08);
          box-shadow: 0 4px 12px rgba(22, 93, 255, 0.12);
          .avatar-text {
            font-size: 28px;
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
          gap: 12px;
          margin-bottom: 12px;

          .user-name {
            font-size: 28px;
            font-weight: 700;
            color: var(--color-text-1);
            line-height: 1.2;
          }

          .status-tag {
            border-radius: 4px;
            padding: 2px 10px;
            font-weight: 600;
          }
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 20px;

          .info-item {
            display: flex;
            align-items: center;
            font-size: 14px;
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
            height: 14px;
            background-color: var(--color-border-2);
          }
        }
      }
    }
  }

  .body-section {
    display: flex;
    flex: 1;
    overflow: hidden;

    .side-nav {
      width: 200px;
      border-right: 1px solid var(--color-border-2);
      padding: 16px 0;
      background-color: #fafafa;
      flex-shrink: 0;

      .nav-item {
        height: 52px;
        display: flex;
        align-items: center;
        padding: 0 24px;
        cursor: pointer;
        position: relative;
        transition: all 0.2s;
        gap: 12px;
        color: var(--color-text-2);

        &:hover,
        &.active {
          color: rgb(var(--primary-6));
          background-color: #fff;
          font-weight: 600;
          .nav-ink {
            opacity: 1;
          }
        }

        .nav-ink {
          position: absolute;
          left: 0;
          top: 16px;
          width: 4px;
          height: 20px;
          background-color: rgb(var(--primary-6));
          border-top-right-radius: 4px;
          border-bottom-right-radius: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .nav-text {
          font-size: 15px;
        }
        .nav-icon {
          font-size: 18px;
        }
      }
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 32px;
      background-color: #fff;
      min-width: 0;

      .card-title,
      .form-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--color-text-1);
        margin-bottom: 24px;
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

      .add-record-section {
        max-width: 600px;
        margin: 0 auto;

        .type-selector {
          display: flex;
          gap: 24px;
          margin-bottom: 32px;
          .type-btn {
            flex: 1;
            height: 100px;
            border: 2px solid var(--color-border-2);
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;
            background-color: #fff;
            .symbol {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 4px;
            }
            .label {
              font-size: 15px;
              font-weight: 600;
            }
            &.minus {
              color: #f53f3f;
              &.active {
                border-color: #f53f3f;
                background-color: rgba(245, 63, 63, 0.04);
              }
            }
            &.plus {
              color: #86909c; // Non-active gray
              &.active {
                color: rgb(var(--primary-6));
                border-color: rgb(var(--primary-6));
                background-color: rgba(22, 93, 255, 0.04);
              }
            }
          }
        }

        .record-form {
          :deep(.arco-form-item-label) {
            font-weight: 600;
            color: var(--color-text-1);
            margin-bottom: 8px;
            font-size: 15px;
          }
          :deep(.arco-input-wrapper),
          :deep(.arco-select-view),
          :deep(.arco-textarea-wrapper) {
            background-color: #fff;
            border: 1px solid var(--color-border-3);
            border-radius: 8px;
            &:hover,
            &.arco-input-focus {
              border-color: rgb(var(--primary-6));
            }
          }
          .form-footer {
            margin-top: 48px;
            .save-btn {
              height: 52px;
              font-size: 16px;
              font-weight: 600;
              border-radius: 12px;
              box-shadow: 0 8px 24px rgba(22, 93, 255, 0.25);
            }
          }
        }
      }

      .chart-card {
        background: #fbfcfe;
        border: 1px solid var(--color-border-1);
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 32px;
      }

      .record-list {
        .record-item {
          padding: 20px 0;
          border-bottom: 1px solid var(--color-fill-2);
          &:last-child {
            border-bottom: none;
          }
        }
        .record-content {
          display: flex;
          align-items: center;
          width: 100%;
          gap: 20px;
          .record-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
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
            .record-title-row {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 6px;
              .record-title {
                font-size: 16px;
                font-weight: 600;
                color: var(--color-text-1);
              }
              .category-tag {
                background-color: var(--color-fill-2);
                color: var(--color-text-3);
                font-size: 12px;
                border-radius: 4px;
                padding: 0 8px;
              }
            }
            .record-time {
              font-size: 13px;
              color: var(--color-text-4);
            }
            .record-desc {
              font-size: 14px;
              color: var(--color-text-2);
              margin-bottom: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
          .record-score {
            font-size: 22px;
            font-weight: 700;
            margin-right: 12px;
            &.minus {
              color: #f53f3f;
            }
            &.plus {
              color: #00b42a;
            }
          }
          .edit-action,
          .delete-action {
            opacity: 0;
            cursor: pointer;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            color: var(--color-text-3);
            transition: all 0.2s;
            &:hover {
              background-color: var(--color-fill-3);
              color: rgb(var(--primary-6));
            }
          }
          .delete-action:hover {
            color: #f53f3f;
          }
          &:hover {
            .actions-wrapper :deep(.edit-action),
            .actions-wrapper :deep(.delete-action) {
              opacity: 1;
            }
          }
        }
      }

      .empty-placeholder {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
