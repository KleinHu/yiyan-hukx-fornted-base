<template>
  <a-card title="物品分类" class="user-category-card">
    <a-spin :loading="loading" style="width: 100%">
      <a-tree
        :data="treeData"
        :field-names="{ key: 'id', title: 'name' }"
        block-node
        @select="handleSelect"
      />
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
    (e: 'select', id: string | undefined): void;
  }>();

  const handleSelect = (selectedKeys: (string | number)[]) => {
    emit('select', selectedKeys[0] as string);
  };
</script>

<style scoped lang="less">
  .user-category-card {
    height: 100%;
    border-radius: 8px;
    border: 1px solid #e5e6eb;
    display: flex;
    flex-direction: column;

    :deep(.arco-card-header) {
      border-bottom: 1px solid #e5e6eb;
    }

    :deep(.arco-card-body) {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }
  }
</style>
