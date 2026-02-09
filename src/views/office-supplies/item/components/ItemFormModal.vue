<template>
  <a-modal
    :visible="visible"
    :title="form.id ? '编辑物品' : '新增物品'"
    @cancel="$emit('update:visible', false)"
    @before-ok="handleBeforeOk"
  >
    <a-form :model="form" auto-label-width>
      <a-form-item field="categoryId" label="所属分类" required>
        <a-tree-select
          v-model="form.categoryId"
          :data="categoryTree"
          :field-names="{ key: 'id', title: 'name' }"
          placeholder="请选择分类"
        />
      </a-form-item>
      <a-form-item field="name" label="物品名称" required>
        <a-input v-model="form.name" placeholder="请输入物品名称" />
      </a-form-item>
      <a-form-item field="spec" label="规格型号">
        <a-input v-model="form.spec" placeholder="如：黑色, 0.5mm" />
      </a-form-item>
      <a-form-item field="unit" label="单位">
        <a-input v-model="form.unit" placeholder="如：个, 支, 包" />
      </a-form-item>
      <a-form-item field="price" label="参考单价">
        <a-input-number v-model="form.price" :precision="2" />
      </a-form-item>
      <a-form-item field="minStock" label="库存预警值">
        <a-input-number v-model="form.minStock" />
      </a-form-item>
      <a-form-item field="status" label="状态">
        <a-radio-group v-model="form.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
  import { reactive, watch } from 'vue';
  import type { SuppliesItemVO, SuppliesCategoryVO } from '@/api/supplies';

  const props = defineProps<{
    visible: boolean;
    initialData: Partial<SuppliesItemVO> | null;
    categoryTree: SuppliesCategoryVO[];
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', visible: boolean): void;
    (e: 'submit', data: SuppliesItemVO): void;
  }>();

  const form = reactive<SuppliesItemVO>({
    categoryId: 0,
    name: '',
    spec: '',
    unit: '',
    price: 0,
    minStock: 0,
    status: 1,
  });

  watch(
    () => props.initialData,
    (val) => {
      if (val) {
        Object.assign(form, {
          status: 1, // 默认开启
          ...val,
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
