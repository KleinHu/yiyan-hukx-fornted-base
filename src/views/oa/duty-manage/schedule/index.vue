<template>
  <div class="calendar-page">
    <div class="main-layout">
      <!-- 左侧：组织树 -->
      <DutyGroupTree
        v-model:selected-keys="selectedGroupKeys"
        :tree-data="groupTree"
      />

      <!-- 右侧：维护主体 -->
      <div class="calendar-main">
        <!-- 工具栏 -->
        <DutyToolbar
          v-model:view-mode="viewMode"
          :current-date="currentDate"
          :week-range-text="weekRangeText"
          @prev="onPrev"
          @next="onNext"
          @date-change="onDateChange"
        >
          <template #left>
            <a-button type="primary" @click="handleAdd">
              <template #icon><icon-plus /></template>
              新增排班
            </a-button>
          </template>
        </DutyToolbar>

        <a-spin
          :loading="loading"
          tip="正在加载值班数据..."
          class="loading-wrapper"
        >
          <transition name="fade" mode="out-in">
            <!-- 直接重用月视图组件，但通过事件驱动维护逻辑 -->
            <DutyMonthView
              v-if="viewMode === 'month'"
              :current-date="currentDate"
              :schedule-list="scheduleList"
              :get-group-name="getGroupName"
              @change="onDateChange"
              @cell-click="handleCellClick"
            />

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

    <!-- 排班编辑抽屉 (保留核心逻辑) -->
    <a-drawer
      v-model:visible="editVisible"
      :title="editForm.id ? '编辑排班' : '新增排班'"
      width="600px"
      unmount-on-close
      :footer="true"
      :ok-loading="loading"
      @ok="handleEditSubmit"
      @cancel="editVisible = false"
    >
      <a-form :model="editForm" layout="vertical">
        <a-form-item label="值班分组" required>
          <a-tree-select
            v-model="editForm.groupId"
            :data="groupTree"
            placeholder="请选择分组"
            :field-names="{ key: 'id', title: 'name', children: 'children' }"
          />
        </a-form-item>
        <a-form-item required>
          <template #label>
            <span>值班人员 ({{ editForm.selectedUsers?.length || 0 }}人)</span>
          </template>
          <a-space direction="vertical" fill style="width: 100%">
            <a-button type="outline" long @click="selectorVisible = true">
              <template #icon><icon-plus /></template>
              {{
                editForm.selectedUsers?.length
                  ? '重选/增减人员'
                  : '选择值班人员'
              }}
            </a-button>
            <div
              v-if="editForm.selectedUsers?.length"
              class="selected-users-list"
            >
              <div
                v-for="(user, index) in editForm.selectedUsers"
                :key="user.userCode"
                class="user-item-row"
              >
                <div class="user-info">
                  <a-avatar :size="24" style="background-color: #165dff">{{
                    Number(index) + 1
                  }}</a-avatar>
                  <span class="name">{{ user.userName }}</span>
                  <span class="code">({{ user.userCode }})</span>
                </div>
                <div class="actions">
                  <a-button-group size="mini" type="text">
                    <a-button
                      :disabled="Number(index) === 0"
                      @click="moveUser(Number(index), -1)"
                      ><icon-up
                    /></a-button>
                    <a-button
                      :disabled="
                        Number(index) === editForm.selectedUsers.length - 1
                      "
                      @click="moveUser(Number(index), 1)"
                      ><icon-down
                    /></a-button>
                    <a-button status="danger" @click="removeUser(Number(index))"
                      ><icon-delete
                    /></a-button>
                  </a-button-group>
                </div>
              </div>
            </div>
          </a-space>
        </a-form-item>
        <a-form-item label="值班日期" required>
          <a-date-picker v-model="editForm.dutyDate" style="width: 100%" />
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model="editForm.remark" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-space justify="end">
          <a-popconfirm
            v-if="editForm.id"
            content="确定删除该日期下的这一组排班吗？"
            @ok="handleDelete"
          >
            <a-button status="danger">批量删除当日</a-button>
          </a-popconfirm>
          <a-button @click="editVisible = false">取消</a-button>
          <a-button type="primary" :loading="loading" @click="handleEditSubmit"
            >保存</a-button
          >
        </a-space>
      </template>
    </a-drawer>

    <!-- HR 人员选择器 -->
    <EmployeeSelectorModal
      v-model:visible="selectorVisible"
      :multiple="true"
      :default-dept-id="currentDeptId"
      :default-selected-employees="editForm.selectedUsers"
      @submit="onEmployeeSelect"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import dayjs from 'dayjs';
  import { Message } from '@arco-design/web-vue';
  import EmployeeSelectorModal from '@/components/hr/EmployeeSelectorModal.vue';
  import useDutyGroup from '@/hooks/oa/duty/useDutyGroup';
  import useDutySchedule from '@/hooks/oa/duty/useDutySchedule';
  import { DutyScheduleVO } from '@/api/oa/duty';

  // 复用看板组件
  import DutyGroupTree from '../calendar/components/DutyGroupTree.vue';
  import DutyToolbar from '../calendar/components/DutyToolbar.vue';
  import DutyMonthView from '../calendar/components/DutyMonthView.vue';
  import DutyWeekView from '../calendar/components/DutyWeekView.vue';

  const { groupTree, fetchTree: fetchGroups, getGroupName } = useDutyGroup();
  const { scheduleList, fetchList, loading, saveBatch, removeBatch } =
    useDutySchedule();

  // 计算当前选中分组关联的部门ID
  const currentDeptId = computed(() => {
    if (!editForm.value.groupId) return undefined;
    const find = (nodes: any[]): string | undefined => {
      let result: string | undefined;
      nodes.some((n) => {
        if (n.id === editForm.value.groupId) {
          result = n.departmentId;
          return true;
        }
        if (n.children) {
          result = find(n.children);
          return !!result;
        }
        return false;
      });
      return result;
    };
    return find(groupTree.value);
  });

  // 状态同步看板
  const viewMode = ref<'month' | 'week'>('month');
  const currentDate = ref(dayjs().format('YYYY-MM-DD'));
  const selectedGroupKeys = ref<string[]>(['all']);

  // 计算周文本
  const weekRangeText = computed(() => {
    const start = dayjs(currentDate.value).startOf('week');
    return `${start.format('YYYY年MM月')} 第${Math.ceil(start.date() / 7)}周`;
  });

  // 获取数据
  const fetchSchedules = () => {
    fetchList({
      startDate:
        viewMode.value === 'month'
          ? dayjs(currentDate.value).startOf('month').format('YYYY-MM-DD')
          : dayjs(currentDate.value).startOf('week').format('YYYY-MM-DD'),
      endDate:
        viewMode.value === 'month'
          ? dayjs(currentDate.value).endOf('month').format('YYYY-MM-DD')
          : dayjs(currentDate.value).endOf('week').format('YYYY-MM-DD'),
      groupId: selectedGroupKeys.value.includes('all')
        ? undefined
        : selectedGroupKeys.value.join(','),
    });
  };

  // 维护相关逻辑 (保留并升级)
  const editVisible = ref(false);
  const selectorVisible = ref(false);
  const editForm = ref<any>({ dutyDate: '', selectedUsers: [] });

  const handleAdd = () => {
    editForm.value = {
      groupId:
        selectedGroupKeys.value[0] === 'all'
          ? undefined
          : selectedGroupKeys.value[0],
      dutyDate: currentDate.value,
      remark: '',
      selectedUsers: [],
    };
    editVisible.value = true;
  };

  const handleCellClick = (year: number, month: number, date: number) => {
    const dateStr = dayjs()
      .year(year)
      .month(month - 1)
      .date(date)
      .format('YYYY-MM-DD');
    // 如果该日已有排班，则进入编辑模式
    const daySchedules = scheduleList.value.filter(
      (s) => s.dutyDate === dateStr
    );

    if (daySchedules.length > 0) {
      // 默认编辑第一个分组的排班 (维护页面的增强逻辑)
      const firstGroup = daySchedules[0];
      const sameGroupUsers = daySchedules.filter(
        (s) => s.groupId === firstGroup.groupId
      );
      editForm.value = {
        id: firstGroup.id, // 仅作为编辑标识
        groupId: firstGroup.groupId,
        dutyDate: dateStr,
        remark: firstGroup.remark,
        selectedUsers: sameGroupUsers.map((s) => ({
          userCode: s.userCode,
          userName: s.userName,
        })),
      };
    } else {
      editForm.value = {
        groupId:
          selectedGroupKeys.value[0] === 'all'
            ? undefined
            : selectedGroupKeys.value[0],
        dutyDate: dateStr,
        selectedUsers: [],
      };
    }
    editVisible.value = true;
  };

  const handleEditSubmit = async () => {
    if (
      !editForm.value.groupId ||
      !editForm.value.dutyDate ||
      !editForm.value.selectedUsers.length
    ) {
      Message.warning('请补全排班信息');
      return;
    }

    // 第一步：清理该日期、该分组下已有的所有排班记录 (防重复增量)
    const existingIds = scheduleList.value
      .filter(
        (s) =>
          s.dutyDate === editForm.value.dutyDate &&
          s.groupId === editForm.value.groupId
      )
      .map((s) => s.id)
      .filter(Boolean) as string[];

    if (existingIds.length > 0) {
      await removeBatch(existingIds);
    }

    // 第二步：保存新的整组排班
    const batchData: DutyScheduleVO[] = editForm.value.selectedUsers.map(
      (user: any, index: number) => ({
        groupId: editForm.value.groupId,
        dutyDate: editForm.value.dutyDate,
        userCode: user.userCode,
        userName: user.userName,
        sortOrder: index + 1,
        remark: editForm.value.remark,
      })
    );

    const success = await saveBatch(batchData);
    if (success) {
      editVisible.value = false;
      fetchSchedules();
      Message.success('排班保存成功');
    }
  };

  const handleDelete = async () => {
    const daySchedules = scheduleList.value.filter(
      (s) =>
        s.dutyDate === editForm.value.dutyDate &&
        s.groupId === editForm.value.groupId
    );
    const ids = daySchedules.map((s) => s.id).filter(Boolean) as string[];
    const success = await removeBatch(ids);
    if (success) {
      editVisible.value = false;
      fetchSchedules();
    }
  };

  // 辅助方法
  const moveUser = (idx: number, delta: number) => {
    const next = idx + delta;
    if (next < 0 || next >= editForm.value.selectedUsers.length) return;
    [editForm.value.selectedUsers[idx], editForm.value.selectedUsers[next]] = [
      editForm.value.selectedUsers[next],
      editForm.value.selectedUsers[idx],
    ];
  };
  const removeUser = (idx: number) =>
    editForm.value.selectedUsers.splice(idx, 1);
  const onEmployeeSelect = (emps: any[]) => {
    editForm.value.selectedUsers = emps.map((e) => ({
      userCode: e.userCode,
      userName: e.userName,
    }));
  };
  const onPrev = () => {
    currentDate.value = dayjs(currentDate.value)
      .subtract(1, viewMode.value === 'month' ? 'month' : 'week')
      .format('YYYY-MM-DD');
  };
  const onNext = () => {
    currentDate.value = dayjs(currentDate.value)
      .add(1, viewMode.value === 'month' ? 'month' : 'week')
      .format('YYYY-MM-DD');
  };
  const onDateChange = (d: string) => {
    currentDate.value = d;
  };

  watch([currentDate, selectedGroupKeys, viewMode], () => fetchSchedules());
  onMounted(() => {
    fetchGroups();
    fetchSchedules();
  });
</script>

<style scoped lang="less">
  .calendar-page {
    padding: 20px;
    height: calc(100vh - 64px);
    background-color: #f4f7f9;

    .main-layout {
      display: flex;
      gap: 16px;
      height: 100%;
    }

    .calendar-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;

      .loading-wrapper {
        flex: 1;
        :deep(.arco-spin-children) {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
      }
    }
  }

  .selected-users-list {
    margin-top: 12px;
    background: #f8faff;
    border: 1px solid #e8f0ff;
    border-radius: 8px;
    padding: 12px;

    .user-item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: #fff;
      border-radius: 8px;
      margin-bottom: 8px;
      border: 1px solid #f2f3f5;

      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        .name {
          font-weight: 700;
          color: #1d2129;
        }
        .code {
          color: #86909c;
          font-size: 12px;
        }
      }
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.3s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
    transform: translateY(10px);
  }
</style>
