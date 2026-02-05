<template>
  <a-modal
    :visible="visible"
    :title="initial?.id ? '编辑分类' : '新增分类'"
    width="500px"
    unmount-on-close
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form ref="formRef" :model="form" :rules="formRules" layout="vertical">
      <a-form-item label="分类名称" field="name">
        <a-input v-model="form.name" placeholder="请输入分类名称" />
      </a-form-item>
      <a-form-item label="分类编码" field="code">
        <a-input
          v-model="form.code"
          placeholder="请输入编码"
          :disabled="!!initial?.id"
        />
      </a-form-item>
      <a-form-item label="默认扣分值" field="defaultScore">
        <a-input-number
          v-model="form.defaultScore"
          :min="0"
          placeholder="默认5"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="操作类型" field="operationType">
        <a-radio-group v-model="form.operationType">
          <a-radio :value="1">加分</a-radio>
          <a-radio :value="2">减分</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="排序" field="sort">
        <a-input-number
          v-model="form.sort"
          :min="0"
          placeholder="0"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="状态" field="status">
        <a-radio-group v-model="form.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="描述" field="description">
        <a-textarea
          v-model="form.description"
          placeholder="选填"
          :auto-size="{ minRows: 2 }"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import type { FormInstance } from '@arco-design/web-vue';
  import type { SixSCategory } from '@/api/sixs/model/sixsModel';

  const props = defineProps<{
    visible: boolean;
    initial?: SixSCategory | null;
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', v: boolean): void;
    (e: 'submit', form: SixSCategory): void;
  }>();

  const formRef = ref<FormInstance>();
  const form = reactive<SixSCategory>({
    name: '',
    code: '',
    defaultScore: 5,
    operationType: 1,
    sort: 0,
    status: 1,
    description: '',
  });

  const formRules = {
    name: [{ required: true, message: '请输入分类名称' }],
    code: [{ required: true, message: '请输入分类编码' }],
  };

  watch(
    () => props.initial,
    (v) => {
      if (v) {
        form.name = v.name;
        form.code = v.code;
        form.defaultScore = v.defaultScore ?? 5;
        form.operationType = v.operationType ?? 1;
        form.sort = v.sort ?? 0;
        form.status = v.status ?? 1;
        form.description = v.description ?? '';
        form.id = v.id;
      } else {
        form.name = '';
        form.code = '';
        form.defaultScore = 5;
        form.operationType = 1;
        form.sort = 0;
        form.status = 1;
        form.description = '';
        form.id = undefined;
      }
    },
    { immediate: true }
  );

  async function handleOk() {
    const valid = await formRef.value?.validate();
    if (valid) return;
    emit('submit', { ...form });
    emit('update:visible', false);
  }

  function handleCancel() {
    emit('update:visible', false);
  }
</script>
