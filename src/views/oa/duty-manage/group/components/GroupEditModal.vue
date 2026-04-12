<template>
  <a-modal
    :visible="visible"
    :title="formData.id ? '编辑分组' : '新增分组'"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form :model="formData" :rules="rules" ref="formRef">
      <a-form-item field="name" label="分组名称">
        <a-input v-model="formData.name" placeholder="请输入分组名称" />
      </a-form-item>

      <a-form-item field="level" label="分组层级">
        <a-radio-group v-model="formData.level">
          <a-radio :value="1">科室级</a-radio>
          <a-radio :value="2">班组级</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item
        field="departmentId"
        label="关联HR科室"
        extra="选择科室后，会自动同步科室名称至上方“分组名称”输入框"
      >
        <a-tree-select
          v-model="formData.departmentId"
          :data="departmentTreeData"
          :loading="deptLoading"
          placeholder="请选择HR科室"
          :field-names="{
            key: 'deptId',
            title: 'deptName',
            children: 'children',
          }"
          allow-clear
          @change="onDeptChange"
        />
      </a-form-item>

      <a-form-item field="status" label="状态">
        <a-radio-group v-model="formData.status" type="button">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">停用</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import useDepartmentTree from '@/hooks/hr/department';
  import useDutyGroup from '@/hooks/oa/duty/useDutyGroup';
  import type { DutyGroupVO } from '@/api/oa/duty';

  const props = defineProps<{
    visible: boolean;
    initialData?: Partial<DutyGroupVO>;
  }>();

  const emit = defineEmits(['update:visible', 'submit']);

  const formRef = ref();
  const formData = ref<Partial<DutyGroupVO>>({});

  const {
    departmentTreeData,
    loading: deptLoading,
    fetchDepartmentTree,
  } = useDepartmentTree({ autoLoad: false });
  const { saveOrUpdate } = useDutyGroup();

  const rules = {
    name: [{ required: true, message: '请输入名称' }],
    level: [{ required: true, message: '请选择层级' }],
  };

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        formData.value = { ...props.initialData };
        fetchDepartmentTree();
      }
    }
  );

  const onDeptChange = (val: any) => {
    // 自动回填部门名称
    if (!val) {
      formData.value.departmentName = '';
      return;
    }
    const findNode = (nodes: any[], key: string): any => {
      let found = nodes.find((n) => n.deptId === key);
      if (found) return found;
      nodes.some((n) => {
        if (n.children) {
          found = findNode(n.children, key);
          return !!found;
        }
        return false;
      });
      return found;
    };
    const node = findNode(departmentTreeData.value, val);
    if (node) {
      formData.value.departmentName = node.deptName;
      // 优化：如果当前分组名称未填写，则自动同步科室名称
      if (!formData.value.name) {
        formData.value.name = node.deptName;
      }
    }
  };

  const handleOk = async () => {
    const res = await formRef.value?.validate();
    if (!res) {
      const success = await saveOrUpdate(formData.value as DutyGroupVO);
      if (success) {
        emit('submit');
        emit('update:visible', false);
      }
    }
  };

  const handleCancel = () => {
    emit('update:visible', false);
  };
</script>
