<template>
  <a-table
    row-key="id"
    :loading="loading"
    :columns="columns"
    :data="data"
    :pagination="pagination"
    @page-change="$emit('pageChange', $event)"
    @page-size-change="$emit('pageSizeChange', $event)"
  >
    <template #index="{ rowIndex }">
      {{ (pagination.current - 1) * pagination.pageSize + rowIndex + 1 }}
    </template>
    <template #auditStatus="{ record }">
      <a-tag :color="getStatusColor(record.auditStatus)">
        {{ getStatusLabel(record.auditStatus) }}
      </a-tag>
    </template>
    <template #operations="{ record }">
      <a-space>
        <a-button
          v-if="record.auditStatus === 0"
          type="text"
          size="small"
          @click="$emit('audit', record)"
        >
          审核
        </a-button>
        <a-button type="text" size="small" @click="$emit('view', record)">
          查看
        </a-button>
      </a-space>
    </template>
  </a-table>
</template>

<script setup lang="ts">
  import type { SuppliesRequestVO } from '@/api/supplies';

  defineProps<{
    data: SuppliesRequestVO[];
    loading: boolean;
    pagination: any;
  }>();

  defineEmits<{
    (e: 'pageChange', current: number): void;
    (e: 'pageSizeChange', size: number): void;
    (e: 'audit', record: SuppliesRequestVO): void;
    (e: 'view', record: SuppliesRequestVO): void;
  }>();

  const columns = [
    {
      title: '序号',
      slotName: 'index',
      width: 60,
      align: 'center',
      fixed: 'left' as const,
    },
    { title: '单号', dataIndex: 'orderNo', width: 200 },
    { title: '领用人', dataIndex: 'userName', width: 120 },
    { title: '部门', dataIndex: 'deptName' },
    { title: '申请时间', dataIndex: 'applyTime', width: 180 },
    { title: '状态', slotName: 'auditStatus', width: 100 },
    {
      title: '操作',
      slotName: 'operations',
      width: 150,
      fixed: 'right' as const,
    },
  ];

  const getStatusLabel = (status: number) => {
    const map: Record<number, string> = {
      0: '待审核',
      1: '已通过',
      2: '已驳回',
      3: '已发放',
    };
    return map[status] || '未知';
  };

  const getStatusColor = (status: number) => {
    const map: Record<number, string> = {
      0: 'orange',
      1: 'green',
      2: 'red',
      3: 'blue',
    };
    return map[status] || 'gray';
  };
</script>
