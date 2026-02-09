<template>
  <a-drawer
    :visible="visible"
    title="人员领用明细"
    width="800px"
    @cancel="$emit('update:visible', false)"
    :footer="false"
  >
    <div class="drawer-header-info">
      <a-descriptions :column="2" size="small">
        <a-descriptions-item label="科室">{{ deptName }}</a-descriptions-item>
        <a-descriptions-item label="物品">{{ itemName }}</a-descriptions-item>
      </a-descriptions>
    </div>

    <a-table
      :loading="userLoading"
      :data="userConsumptionList"
      :pagination="false"
      size="small"
      style="margin-top: 16px"
    >
      <template #columns>
        <a-table-column title="领用人" data-index="userName">
          <template #cell="{ record }">
            {{ record.userName }} ({{ record.userCode }})
          </template>
        </a-table-column>
        <a-table-column title="领用时间" data-index="applyTime">
          <template #cell="{ record }">
            {{ formatTime(record.applyTime) }}
          </template>
        </a-table-column>
        <a-table-column title="申请单号" data-index="orderNo" />
        <a-table-column title="领用数量" data-index="quantity" :width="100">
          <template #cell="{ record }">
            <span style="font-weight: bold; color: var(--color-text-1)">{{
              record.quantity
            }}</span>
          </template>
        </a-table-column>
      </template>
    </a-table>
  </a-drawer>
</template>

<script setup lang="ts">
  import { watch } from 'vue';
  import useConsumption from '@/hooks/supplies/useConsumption';
  import dayjs from 'dayjs';

  const props = defineProps<{
    visible: boolean;
    deptName: string;
    itemId: string;
    itemName: string;
    year?: string;
    startMonth?: string;
    endMonth?: string;
  }>();

  defineEmits(['update:visible']);

  const { userLoading, userConsumptionList, fetchUserConsumption } =
    useConsumption();

  const formatTime = (time: string) =>
    time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-';

  watch(
    () => props.visible,
    (val) => {
      if (val && props.deptName && props.itemId) {
        fetchUserConsumption({
          year: props.year,
          startMonth: props.startMonth,
          endMonth: props.endMonth,
          deptName: props.deptName,
          itemId: props.itemId,
        });
      }
    }
  );
</script>

<style scoped lang="less">
  .drawer-header-info {
    background-color: var(--color-fill-1);
    padding: 12px 16px;
    border-radius: 4px;
  }
</style>
