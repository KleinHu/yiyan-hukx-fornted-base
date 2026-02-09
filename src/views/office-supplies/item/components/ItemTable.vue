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
    <template #status="{ record }">
      <a-tag :color="record.status === 1 ? 'green' : 'red'">
        {{ record.status === 1 ? '启用' : '禁用' }}
      </a-tag>
    </template>
    <template #availableStock="{ record }">
      <span
        :style="{
          color:
            (record.availableStock || 0) < (record.minStock || 0)
              ? '#f53f3f'
              : 'inherit',
          fontWeight:
            (record.availableStock || 0) < (record.minStock || 0)
              ? 'bold'
              : 'normal',
        }"
      >
        {{ record.availableStock }}
      </span>
      <a-tag
        v-if="(record.availableStock || 0) < (record.minStock || 0)"
        color="red"
        size="small"
        style="
          margin-left: 8px;
          transform: scale(0.85);
          transform-origin: left center;
        "
      >
        紧缺
      </a-tag>
    </template>
    <template #operations="{ record }">
      <a-space>
        <a-button type="text" size="small" @click="$emit('edit', record)">
          编辑
        </a-button>
        <a-button
          type="text"
          size="small"
          @click="$emit('inventoryChange', record)"
        >
          出入库
        </a-button>
        <a-popconfirm
          content="确定删除该物品吗？"
          @ok="$emit('delete', record.id)"
        >
          <a-button type="text" status="danger" size="small">删除</a-button>
        </a-popconfirm>
      </a-space>
    </template>
  </a-table>
</template>

<script setup lang="ts">
  import type { SuppliesItemVO } from '@/api/supplies';

  const props = defineProps<{
    data: SuppliesItemVO[];
    loading: boolean;
    pagination: any;
  }>();

  defineEmits<{
    (e: 'pageChange', current: number): void;
    (e: 'pageSizeChange', size: number): void;
    (e: 'edit', record: SuppliesItemVO): void;
    (e: 'inventoryChange', record: SuppliesItemVO): void;
    (e: 'delete', id: string): void;
  }>();

  const columns = [
    {
      title: '序号',
      width: 70,
      align: 'center' as const,
      render: ({ rowIndex }: { rowIndex: number }) => {
        const { current = 1, pageSize = 10 } = props.pagination;
        return (current - 1) * pageSize + rowIndex + 1;
      },
    },
    { title: '分类', dataIndex: 'categoryName', width: 120 },
    { title: '物品名称', dataIndex: 'name' },
    { title: '规格', dataIndex: 'spec' },
    { title: '单位', dataIndex: 'unit', width: 80 },
    { title: '实际库存', dataIndex: 'stock', width: 100 },
    { title: '待领用', dataIndex: 'lockStock', width: 100 },
    {
      title: '可领用',
      dataIndex: 'availableStock',
      slotName: 'availableStock',
      width: 140,
    },
    { title: '状态', slotName: 'status', width: 80 },
    {
      title: '操作',
      slotName: 'operations',
      width: 220,
      fixed: 'right' as const,
    },
  ];
</script>
