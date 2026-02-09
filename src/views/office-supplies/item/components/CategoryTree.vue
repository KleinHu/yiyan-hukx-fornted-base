<template>
  <a-card title="物品分类" :header-style="{ border: 'none' }">
    <template #extra>
      <a-button type="text" size="mini" @click="$emit('add')">新增</a-button>
    </template>
    <a-spin :loading="loading" style="width: 100%">
      <a-tree
        :data="treeData"
        :field-names="{ key: 'id', title: 'name' }"
        block-node
        @select="handleSelect"
      >
        <template #extra="nodeData">
          <a-space v-if="nodeData.id !== '0'">
            <a-button
              type="text"
              size="mini"
              shape="circle"
              @click.stop="$emit('edit', nodeData)"
            >
              <template #icon><icon-edit style="color: #165dff" /></template>
            </a-button>
            <a-popconfirm
              content="确定删除分类及其子分类吗？"
              @ok="$emit('delete', nodeData.id)"
            >
              <a-button type="text" size="mini" shape="circle" @click.stop>
                <template #icon
                  ><icon-delete style="color: #f53f3f"
                /></template>
              </a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </a-tree>
    </a-spin>
  </a-card>
</template>

<script setup lang="ts">
  import type { SuppliesCategoryVO } from '@/api/supplies';

  defineProps<{
    treeData: SuppliesCategoryVO[];
    loading: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'add'): void;
    (e: 'edit', record: SuppliesCategoryVO): void;
    (e: 'delete', id: string): void;
    (e: 'select', id: string | undefined): void;
  }>();

  const handleSelect = (selectedKeys: (string | number)[]) => {
    emit('select', selectedKeys[0] as string);
  };
</script>
