<template>
  <a-table
    row-key="id"
    :loading="loading"
    :columns="columns"
    :data="data"
    :pagination="pagination"
    :row-selection="rowSelection"
    :selected-keys="computedSelectedKeys"
    @page-change="$emit('pageChange', $event)"
    @page-size-change="$emit('pageSizeChange', $event)"
    @selection-change="handleSelectionChange"
  >
    <template #status="{ record }">
      <a-tag :color="record.status === 1 ? 'green' : 'red'">
        {{ record.status === 1 ? '启用' : '禁用' }}
      </a-tag>
    </template>
  </a-table>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { SuppliesItemVO } from '@/api/supplies';
  import type { TableRowSelection } from '@arco-design/web-vue';

  const props = defineProps<{
    data: SuppliesItemVO[];
    loading: boolean;
    pagination: any;
    selectedItems: SuppliesItemVO[];
  }>();

  const emit = defineEmits<{
    (e: 'pageChange', current: number): void;
    (e: 'pageSizeChange', size: number): void;
    (e: 'update:selectedItems', items: SuppliesItemVO[]): void;
  }>();

  const computedSelectedKeys = computed(() => {
    return props.selectedItems
      .map((item) => item.id)
      .filter((id): id is number => !!id);
  });

  const handleSelectionChange = (rowKeys: (string | number)[]) => {
    // 1. 找出不在当前页的已选中项 (保留)
    const currentPageIds = props.data.map((item) => item.id);
    const otherPageItems = props.selectedItems.filter(
      (item) => !currentPageIds.includes(item.id)
    );

    // 2. 找出当前页被选中的项 (新增/更新)
    const currentPageSelectedItems = props.data.filter(
      (item) => item.id && rowKeys.includes(item.id)
    );

    // 3. 合并
    const newSelectedItems = [...otherPageItems, ...currentPageSelectedItems];
    emit('update:selectedItems', newSelectedItems);
  };

  const rowSelection: TableRowSelection = {
    type: 'checkbox',
    showCheckedAll: true,
    onlyCurrent: false,
  };

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
    { title: '可领用库存', dataIndex: 'availableStock', width: 120 },
    { title: '状态', slotName: 'status', width: 80 },
  ];
</script>
