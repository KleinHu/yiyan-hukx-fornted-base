<template>
  <a-card :bordered="false" class="content-card">
    <a-calendar
      :model-value="dayjs(currentDate).toDate()"
      class="custom-calendar"
      :day-start="1"
      @change="(val: any) => $emit('change', dayjs(val).format('YYYY-MM-DD'))"
      @panel-change="(val: any) => $emit('change', dayjs(val).format('YYYY-MM-DD'))"
    >
      <template #default="{ year, month, date }">
        <div
          class="date-cell-wrapper"
          @click="$emit('cellClick', year, month, date)"
        >
          <div class="cell-header">
            <div
              class="date-number"
              :class="{ 'is-today': isToday(year, month, date) }"
            >
              {{ date }}
            </div>
          </div>
          <div class="cell-content">
            <div
              v-if="getSchedulesByDate(year, month, date).length > 0"
              class="duty-summaries"
            >
              <div
                v-for="group in getGroupedSchedules(year, month, date)"
                :key="group.groupId"
                class="summary-item"
              >
                <span class="group-tag"
                  >{{ group.groupName }} ({{ group.users.length }}人)</span
                >
                <span class="names">{{
                  group.users.map((u: any) => u.userName).join('、')
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </a-calendar>
  </a-card>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs';
  import { DutyScheduleVO } from '@/api/oa/duty';

  const props = defineProps<{
    currentDate: string;
    scheduleList: DutyScheduleVO[];
    getGroupName: (id: string) => string;
  }>();

  defineEmits(['change', 'cellClick']);

  const isToday = (year: number, month: number, date: number) => {
    return dayjs()
      .year(year)
      .month(month - 1)
      .date(date)
      .isSame(dayjs(), 'day');
  };

  const getSchedulesByDate = (year: number, month: number, date: number) => {
    const dateStr = dayjs()
      .year(year)
      .month(month - 1)
      .date(date)
      .format('YYYY-MM-DD');
    return props.scheduleList.filter((item) => item.dutyDate === dateStr);
  };

  const getGroupedSchedules = (year: number, month: number, date: number) => {
    const daySchedules = getSchedulesByDate(year, month, date);
    const groups: any[] = [];
    const groupMap = new Map();

    daySchedules.forEach((item) => {
      if (!groupMap.has(item.groupId)) {
        groupMap.set(item.groupId, {
          groupId: item.groupId,
          groupName: props.getGroupName(item.groupId),
          users: [],
        });
        groups.push(groupMap.get(item.groupId));
      }
      groupMap.get(item.groupId).users.push(item);
    });

    return groups;
  };
</script>

<style scoped lang="less">
  .content-card {
    height: 100%;
    border-radius: 12px;
    :deep(.arco-card-body) {
      padding: 0;
      height: 100%;
    }
  }

  .custom-calendar {
    height: 100%;
    border: none;
  }

  .date-cell-wrapper {
    position: relative;
    height: 100%;
    padding: 4px;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .cell-header {
      height: 24px;
      flex-shrink: 0;

      .date-number {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        color: #4e5969;
        font-size: 12px;
        border-radius: 50%;
        z-index: 10;

        &.is-today {
          background-color: #165dff;
          color: #fff;
          box-shadow: 0 2px 6px rgba(22, 93, 255, 0.3);
        }
      }
    }

    .cell-content {
      flex: 1;
      overflow-y: auto;
      padding: 0 2px 2px 2px;

      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-thumb {
        background: #e5e6eb;
        border-radius: 4px;
      }

      .duty-summaries {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .summary-item {
          font-size: 12px;
          line-height: 1.4;
          display: flex;
          flex-direction: column;
          padding: 4px;
          background: #f0f7ff;
          border-radius: 4px;

          .group-tag {
            color: #165dff;
            font-weight: 700;
            font-size: 11px;
            margin-bottom: 2px;
          }

          .names {
            color: #4e5969;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
</style>
