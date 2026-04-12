import { ref } from 'vue';
import { Message } from '@arco-design/web-vue';
import dayjs from 'dayjs';
import { useUserStore } from '@/store';
import * as dutyApi from '@/api/oa/duty';
import type { DutyScheduleVO, DutyScheduleQuery } from '@/api/oa/duty';

/**
 * 值班排班管理 Hook
 */
export default function useDutySchedule() {
  const loading = ref(false);
  const scheduleList = ref<DutyScheduleVO[]>([]);

  /**
   * 获取排班列表
   */
  const fetchList = async (params: DutyScheduleQuery) => {
    try {
      loading.value = true;
      const { data } = await dutyApi.getDutyScheduleList(params);
      scheduleList.value = data || [];
    } catch (error) {
      // 错误已由拦截器处理
    } finally {
      loading.value = false;
    }
  };

  /**
   * 保存或更新排班
   */
  const saveOrUpdate = async (form: DutyScheduleVO) => {
    try {
      loading.value = true;
      await dutyApi.saveDutySchedule(form);
      Message.success('保存成功');
      return true;
    } catch (error) {
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 批量保存排班
   */
  const saveBatch = async (list: DutyScheduleVO[]) => {
    try {
      loading.value = true;
      await dutyApi.saveDutyScheduleBatch(list);
      Message.success('保存成功');
      return true;
    } catch (error) {
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 删除排班
   */
  const remove = async (id: string) => {
    try {
      loading.value = true;
      await dutyApi.deleteDutySchedule(id);
      Message.success('删除成功');
      return true;
    } catch (error) {
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 批量删除排班
   */
  const removeBatch = async (ids: string[]) => {
    try {
      loading.value = true;
      await dutyApi.deleteDutyScheduleBatch(ids);
      Message.success('批量删除成功');
      return true;
    } catch (error) {
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取当前用户的最新值班提醒
   */
  const getMyLatestDuty = async () => {
    const userStore = useUserStore();
    try {
      loading.value = true;
      const { data } = await dutyApi.getDutyScheduleList({
        userKey: userStore.userCode || '',
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
      });

      if (data && data.length > 0) {
        const today = dayjs().startOf('day');

        // 1. 查找今天的排班
        const todayRecord = data.find((item) =>
          dayjs(item.dutyDate).isSame(today, 'day')
        );

        // 2. 查找最近的未来排班（排除今天）
        const futureSchedules = data
          .filter((item) => dayjs(item.dutyDate).isAfter(today, 'day'))
          .sort((a, b) => dayjs(a.dutyDate).unix() - dayjs(b.dutyDate).unix());
        const nextRecord = futureSchedules[0];

        if (todayRecord || nextRecord) {
          return {
            todayDuty: !!todayRecord,
            nextDutyDays: nextRecord
              ? dayjs(nextRecord.dutyDate).diff(today, 'day')
              : null,
          };
        }
      }
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    scheduleList,
    fetchList,
    saveOrUpdate,
    saveBatch,
    remove,
    removeBatch,
    getMyLatestDuty,
  };
}
