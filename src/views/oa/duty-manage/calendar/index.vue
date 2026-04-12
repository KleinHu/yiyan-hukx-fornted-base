<template>
  <div class="calendar-page">
    <div class="main-layout">
      <!-- 左侧：组织树 -->
      <DutyGroupTree
        v-model:selectedKeys="selectedGroupKeys"
        :treeData="groupTree"
      />

      <!-- 右侧：主体区域 -->
      <div class="calendar-main">
        <!-- 工具栏 -->
        <DutyToolbar
          v-model:view-mode="viewMode"
          :current-date="currentDate"
          :week-range-text="weekRangeText"
          @prev="onPrev"
          @next="onNext"
          @date-change="onMonthChange"
        />

        <a-spin
          :loading="loading"
          tip="正在加载值班数据..."
          class="loading-wrapper"
        >
          <transition name="fade" mode="out-in">
            <!-- 月视图 -->
            <DutyMonthView
              v-if="viewMode === 'month'"
              :current-date="currentDate"
              :schedule-list="scheduleList"
              :get-group-name="getGroupName"
              @change="onMonthChange"
              @cell-click="handleCellClick"
            />

            <!-- 周视图 -->
            <DutyWeekView
              v-else
              :current-date="currentDate"
              :schedule-list="scheduleList"
              :get-group-name="getGroupName"
            />
          </transition>
        </a-spin>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import isoWeek from 'dayjs/plugin/isoWeek';
  import useDutyGroup from '@/hooks/oa/duty/useDutyGroup';
  import useDutySchedule from '@/hooks/oa/duty/useDutySchedule';

  // 引入拆分的组件
  import DutyGroupTree from './components/DutyGroupTree.vue';
  import DutyToolbar from './components/DutyToolbar.vue';
  import DutyMonthView from './components/DutyMonthView.vue';
  import DutyWeekView from './components/DutyWeekView.vue';

  // 配置插件
  dayjs.extend(isoWeek);
  dayjs.locale('zh-cn');

  const { groupTree, fetchTree: fetchGroups, getGroupName } = useDutyGroup();
  const { scheduleList, fetchList, loading } = useDutySchedule();

  // 核心状态
  const viewMode = ref<'month' | 'week'>('month');
  const currentDate = ref(dayjs().format('YYYY-MM-DD'));
  const selectedGroupKeys = ref<string[]>(['all']);

  // 计算周日期范围文字
  const weekRangeText = computed(() => {
    const start = dayjs(currentDate.value).startOf('isoWeek');
    const end = dayjs(currentDate.value).endOf('isoWeek');

    // 逻辑：如果周跨月，按照“归并到下个月”的原则，以周日所在的月份为准
    const targetDay = end; // 取周日作为归属判定点
    const weekNum = Math.ceil(targetDay.date() / 7);

    return `${targetDay.format('YYYY年MM月')} 第${weekNum}周 ${start.format(
      'DD号'
    )}-${end.format('DD号')}`;
  });

  // 数据获取逻辑
  const fetchSchedules = () => {
    const start =
      viewMode.value === 'month'
        ? dayjs(currentDate.value).startOf('month').format('YYYY-MM-DD')
        : dayjs(currentDate.value).startOf('isoWeek').format('YYYY-MM-DD');
    const end =
      viewMode.value === 'month'
        ? dayjs(currentDate.value).endOf('month').format('YYYY-MM-DD')
        : dayjs(currentDate.value).endOf('isoWeek').format('YYYY-MM-DD');

    const groupIds = selectedGroupKeys.value
      .filter((k) => k !== 'all')
      .join(',');

    fetchList({
      startDate: start,
      endDate: end,
      groupId: groupIds || undefined,
    });
  };

  // 事件处理
  const onMonthChange = (dateStr: string) => {
    currentDate.value = dateStr;
  };

  const handleCellClick = (year: number, month: number, date: number) => {
    currentDate.value = dayjs()
      .year(year)
      .month(month - 1)
      .date(date)
      .format('YYYY-MM-DD');
    viewMode.value = 'week';
  };

  const onPrev = () => {
    currentDate.value = dayjs(currentDate.value)
      .subtract(1, 'week')
      .format('YYYY-MM-DD');
  };

  const onNext = () => {
    currentDate.value = dayjs(currentDate.value)
      .add(1, 'week')
      .format('YYYY-MM-DD');
  };

  // 监听器
  watch([currentDate, selectedGroupKeys, viewMode], () => fetchSchedules());

  onMounted(() => {
    fetchGroups();
    fetchSchedules();
  });
</script>

<style scoped lang="less">
  .calendar-page {
    padding: 16px;
    height: calc(100vh - 64px); // 适配页面总高度
    background-color: #f4f7f9;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .main-layout {
      flex: 1;
      display: flex;
      gap: 16px;
      min-height: 0;
    }

    .calendar-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      height: 100%;

      .loading-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;

        :deep(.arco-spin-children) {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
      }
    }
  }

  /* 切换动画 */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
</style>
