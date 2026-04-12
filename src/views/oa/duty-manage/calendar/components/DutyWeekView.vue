<template>
  <div class="week-view">
    <div class="week-grid">
      <div
        v-for="day in weekDays"
        :key="day.dateStr"
        class="day-card"
        :class="{ 'is-today': day.isToday }"
      >
        <div class="day-header">
          <div v-if="day.isToday" class="today-tag">TODAY</div>
          <span class="date">{{ day.dateStr }}</span>
          <span class="week">{{ day.weekName }}</span>
        </div>
        <div class="day-body custom-scrollbar">
          <a-empty
            v-if="getSchedulesByDate(day.dateStr).length === 0"
            description="暂无排班"
          />
          <div v-else class="duty-group-container">
            <div
              v-for="(groupSchedules, gId) in getGroupedSchedules(day.dateStr)"
              :key="gId"
              class="dept-sub-card"
            >
              <div class="dept-title">
                <icon-user-group />
                <span>{{ getGroupName(String(gId)) }}</span>
              </div>
              <div class="dept-users">
                <div
                  v-for="item in groupSchedules"
                  :key="item.id"
                  class="duty-item"
                >
                  <a-avatar :size="28" style="background-color: #165dff">
                    {{ item.userName.charAt(0) }}
                  </a-avatar>
                  <div class="info">
                    <div class="name">{{ item.userName }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="getSchedulesByDate(day.dateStr).length > 0"
          class="day-footer"
        >
          共 {{ getSchedulesByDate(day.dateStr).length }} 人值班
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import dayjs from 'dayjs';
  import 'dayjs/locale/zh-cn';
  import isoWeek from 'dayjs/plugin/isoWeek';
  import weekday from 'dayjs/plugin/weekday';
  import { DutyScheduleVO } from '@/api/oa/duty';

  // 配置插件
  dayjs.extend(isoWeek);
  dayjs.extend(weekday);
  dayjs.locale('zh-cn');

  const props = defineProps<{
    currentDate: string;
    scheduleList: DutyScheduleVO[];
    getGroupName: (id: string) => string;
  }>();

  // 计算本周的日期数组
  const weekDays = computed(() => {
    const startOfWeek = dayjs(props.currentDate).startOf('isoWeek');
    return Array.from({ length: 7 }).map((_, i) => {
      const date = startOfWeek.add(i, 'day');
      return {
        dateStr: date.format('YYYY-MM-DD'),
        weekName: date.format('dddd'),
        isToday: date.isSame(dayjs(), 'day'),
      };
    });
  });

  const getSchedulesByDate = (dateStr: string) => {
    return props.scheduleList.filter((item) => item.dutyDate === dateStr);
  };

  const getGroupedSchedules = (dateStr: string) => {
    const daySchedules = getSchedulesByDate(dateStr);
    const groups: Record<string, DutyScheduleVO[]> = {};
    daySchedules.forEach((item) => {
      if (!groups[item.groupId]) groups[item.groupId] = [];
      groups[item.groupId].push(item);
    });
    return groups;
  };
</script>

<style scoped lang="less">
  .week-view {
    padding: 20px;
    height: 100%;

    .week-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 16px;
      height: 100%;

      .day-card {
        background: #fff;
        border: 2px solid #e5e6eb;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        height: 700px;

        &:hover {
          transform: translateY(-12px);
          box-shadow: 0 16px 48px rgba(22, 93, 255, 0.12);
          border-color: #165dff;
          z-index: 10;
        }

        &.is-today {
          border-color: #165dff;
          background: #f0f7ff;
          .day-header {
            background: rgba(22, 93, 255, 0.03);
            .date {
              color: #165dff;
            }
          }
        }

        .day-header {
          padding: 24px 16px;
          text-align: center;
          border-bottom: 1px dashed #e5e6eb;
          display: flex;
          flex-direction: column;
          gap: 4px;

          .today-tag {
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: #165dff;
            color: #fff;
            padding: 2px 16px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 800;
            box-shadow: 0 4px 8px rgba(22, 93, 255, 0.3);
          }

          .date {
            font-size: 22px;
            font-weight: 800;
            color: #1d2129;
          }

          .week {
            font-size: 14px;
            font-weight: 600;
            color: #86909c;
            text-transform: uppercase;
          }
        }

        .day-body {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          min-height: 0;

          .duty-group-container {
            display: flex;
            flex-direction: column;
            gap: 16px;

            .dept-sub-card {
              background: #f8faff;
              border: 1px solid #e8f0ff;
              border-radius: 12px;
              padding: 12px;

              .dept-title {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
                color: #165dff;
                font-weight: 700;
                font-size: 13px;
              }

              .dept-users {
                display: flex;
                flex-direction: column;
                gap: 8px;
                .duty-item {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 10px;
                  background: #fff;
                  border-radius: 10px;
                  border: 1px solid #f2f3f5;

                  .name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #1d2129;
                  }
                }
              }
            }
          }
        }

        .day-footer {
          padding: 12px;
          text-align: center;
          background: #f8f9fa;
          border-top: 1px solid #f2f3f5;
          border-radius: 0 0 20px 20px;
          color: #86909c;
          font-size: 12px;
        }
      }
    }
  }

  .custom-scrollbar {
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: #e5e6eb;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &:hover::-webkit-scrollbar-thumb {
      background: #c9cdd4;
    }
  }
</style>
