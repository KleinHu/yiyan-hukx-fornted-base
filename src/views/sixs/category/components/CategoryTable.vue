<template>
  <a-table
    :data="data"
    :loading="loading"
    :pagination="{
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
      showTotal: true,
      showPageSize: true,
    }"
    row-key="id"
    @page-change="emit('pageChange', $event)"
    @page-size-change="emit('pageSizeChange', $event)"
  >
    <template #columns>
      <a-table-column title="序号" :width="70" align="center">
        <template #cell="{ rowIndex }">
          {{ (pagination.current - 1) * pagination.pageSize + rowIndex + 1 }}
        </template>
      </a-table-column>
      <a-table-column title="分类名称" data-index="name" :width="120" />
      <a-table-column title="分类编码" data-index="code" :width="100" />
      <a-table-column
        title="默认扣分"
        data-index="defaultScore"
        :width="90"
        align="center"
      />
      <a-table-column
        title="操作类型"
        data-index="operationType"
        :width="90"
        align="center"
      >
        <template #cell="{ record }">
          <a-tag :color="record.operationType === 1 ? 'green' : 'orange'">
            {{ record.operationType === 1 ? '加分' : '减分' }}
          </a-tag>
        </template>
      </a-table-column>
      <a-table-column
        title="排序"
        data-index="sort"
        :width="70"
        align="center"
      />
      <a-table-column
        title="状态"
        data-index="status"
        :width="80"
        align="center"
      >
        <template #cell="{ record }">
          <a-tag :color="record.status === 1 ? 'green' : 'red'">
            {{ record.status === 1 ? '启用' : '禁用' }}
          </a-tag>
        </template>
      </a-table-column>
      <a-table-column title="描述" data-index="description" ellipsis tooltip />
      <a-table-column title="操作" :width="180" fixed="right">
        <template #cell="{ record }">
          <a-space>
            <a-button type="text" size="small" @click="emit('edit', record)">
              编辑
            </a-button>
            <a-popconfirm
              content="确定删除该分类吗？"
              @ok="emit('delete', record.id)"
            >
              <a-button type="text" size="small" status="danger">
                删除
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-table-column>
    </template>
  </a-table>
</template>

<script setup lang="ts">
  import type { SixSCategory } from '@/api/sixs/model/sixsModel';

  defineProps<{
    data: SixSCategory[];
    loading: boolean;
    pagination: { current: number; pageSize: number; total: number };
  }>();

  const emit = defineEmits<{
    (e: 'pageChange', current: number): void;
    (e: 'pageSizeChange', pageSize: number): void;
    (e: 'edit', record: SixSCategory): void;
    (e: 'delete', id: number): void;
  }>();
</script>
