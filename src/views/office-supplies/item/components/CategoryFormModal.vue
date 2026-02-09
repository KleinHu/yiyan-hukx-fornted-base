<template>
  <a-modal
    :visible="visible"
    :title="form.id ? '编辑分类' : '新增分类'"
    @cancel="$emit('update:visible', false)"
    @before-ok="handleBeforeOk"
  >
    <a-form :model="form" auto-label-width>
      <a-form-item field="name" label="分类名称" required>
        <a-input v-model="form.name" placeholder="请输入分类名称" />
      </a-form-item>
      <a-form-item field="parentId" label="上级分类">
        <a-tree-select
          v-model="form.parentId"
          :data="categoryTree"
          :field-names="{ key: 'id', title: 'name' }"
          placeholder="请选择上级分类（不选为一级分类）"
          allow-clear
        />
      </a-form-item>
      <a-form-item field="sort" label="排序">
        <a-input-number v-model="form.sort" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
  import { reactive, watch } from 'vue';
  import type { SuppliesCategoryVO } from '@/api/supplies';

  const props = defineProps<{
    visible: boolean;
    initialData: Partial<SuppliesCategoryVO> | null;
    categoryTree: SuppliesCategoryVO[];
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', visible: boolean): void;
    (e: 'submit', data: SuppliesCategoryVO): void;
  }>();

  const form = reactive<SuppliesCategoryVO>({
    name: '',
    parentId: undefined,
    sort: 0,
  });

  watch(
    () => props.initialData,
    (val) => {
      if (val) {
        Object.assign(form, {
          sort: 0,
          ...val,
          // 如果 parentId 为 0，前端展示为 undefined 从而显示 placeholder
          parentId: val.parentId === 0 ? undefined : val.parentId,
        });
      }
    },
    { immediate: true }
  );

  const handleBeforeOk = async () => {
    emit('submit', { ...form });
    return true;
  };
</script>
