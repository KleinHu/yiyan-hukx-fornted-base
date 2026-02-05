<template>
  <a-drawer
    :visible="visible"
    :title="initial?.id ? '编辑台账' : '新增台账'"
    width="520px"
    unmount-on-close
    @ok="handleOk"
    @cancel="emit('update:visible', false)"
  >
    <a-form ref="formRef" :model="form" :rules="formRules" layout="vertical">
      <a-form-item
        v-if="!initial?.id"
        label="选择员工"
        field="selectedEmployees"
        class="employee-form-item"
      >
        <div class="employee-selector-layout">
          <div class="action-check">
            <a-button
              class="select-btn"
              type="outline"
              long
              @click="emit('openEmployeeSelect')"
            >
              <template #icon><icon-user /></template>
              {{
                (form.selectedEmployees?.length ?? 0) > 0
                  ? `已选 ${form.selectedEmployees?.length ?? 0} 人`
                  : '点击选择员工'
              }}
            </a-button>
          </div>
          <div class="selected-list">
            <a-tag
              v-for="emp in form.selectedEmployees ?? []"
              :key="emp.userCode"
              closable
              class="emp-tag"
              @close="removeEmployee(emp)"
            >
              {{ emp.userName }} ({{ emp.userCode }})
            </a-tag>
            <div
              v-if="(form.selectedEmployees?.length ?? 0) === 0"
              class="empty-tip"
            >
              暂未选择员工
            </div>
          </div>
        </div>
      </a-form-item>
      <template v-if="initial?.id">
        <a-form-item label="工号">
          <a-input v-model="form.userCode" disabled />
        </a-form-item>
        <a-form-item label="姓名">
          <a-input v-model="form.userName" disabled />
        </a-form-item>
        <a-form-item label="部门" field="departmentId">
          <a-tree-select
            v-model="form.departmentId"
            :data="departmentOptions"
            placeholder="请选择部门"
            allow-clear
            :field-names="{ key: 'deptId', value: 'deptId', title: 'deptName' }"
            style="width: 100%"
            @change="onDepartmentChange"
          />
        </a-form-item>
      </template>
      <a-form-item label="台账年份" field="year">
        <a-date-picker
          v-model="yearDate"
          placeholder="请选择年份"
          mode="year"
          style="width: 100%"
          class="gray-input"
          @change="onYearChange"
        />
      </a-form-item>
      <a-form-item label="状态" field="status">
        <a-radio-group v-model="form.status">
          <a-radio :value="1">启用</a-radio>
          <a-radio :value="0">禁用</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="备注" field="remark">
        <a-textarea
          v-model="form.remark"
          placeholder="选填"
          :auto-size="{ minRows: 2 }"
          class="gray-input"
        />
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import type { FormInstance } from '@arco-design/web-vue';
  import type { SixSAccount } from '@/api/sixs/model/sixsModel';
  import type { DepartmentTreeNode, Employee } from '@/api/hr/types';

  const props = defineProps<{
    visible: boolean;
    initial?: SixSAccount | null;
    departmentOptions: DepartmentTreeNode[];
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', v: boolean): void;
    (e: 'submit', data: SixSAccount | SixSAccount[]): void;
    (e: 'openEmployeeSelect'): void;
  }>();

  const formRef = ref<FormInstance>();
  const currentYear = new Date().getFullYear();
  const yearDate = ref<Date | string | number>(new Date());

  const form = reactive<SixSAccount & { selectedEmployees?: Employee[] }>({
    userCode: '',
    userName: '',
    departmentId: '',
    departmentName: '',
    year: currentYear,
    totalScore: 100,
    status: 1,
    remark: '',
    selectedEmployees: [],
  });

  const formRules = {
    selectedEmployees: [
      {
        validator: (
          value: Employee[] | undefined,
          cb: (msg?: string) => void
        ) => {
          if (!props.initial?.id && (!value || value.length === 0)) {
            cb('请至少选择一名员工');
          } else {
            cb();
          }
        },
      },
    ],
  };

  watch(
    () => props.initial,
    (v) => {
      if (v) {
        form.userCode = v.userCode;
        form.userName = v.userName;
        form.departmentId = v.departmentId ?? '';
        form.departmentName = v.departmentName ?? '';
        form.year = v.year ?? currentYear;
        form.totalScore = v.totalScore ?? 100;
        form.status = v.status ?? 1;
        form.remark = v.remark ?? '';
        form.id = v.id;
      } else {
        form.userCode = '';
        form.userName = '';
        form.departmentId = '';
        form.departmentName = '';
        form.year = currentYear;
        form.totalScore = 100;
        form.status = 1;
        form.remark = '';
        form.id = undefined;
        form.selectedEmployees = [];
      }
    },
    { immediate: true }
  );

  watch(
    () => props.visible,
    (val) => {
      if (!val) {
        formRef.value?.resetFields();
        form.selectedEmployees = [];
        yearDate.value = new Date();
        form.year = currentYear;
      } else if (form.year) {
        yearDate.value = new Date(form.year, 0, 1);
      }
    }
  );

  function onYearChange(val: any) {
    if (val) {
      const y = new Date(val).getFullYear();
      form.year = y;
    } else {
      form.year = currentYear;
    }
  }

  defineExpose({
    form,
    fillEmployees(employees: Employee[]) {
      form.selectedEmployees = employees;
    },
    fillEmployee(emp: Employee) {
      form.selectedEmployees = [emp];
    },
  });

  function removeEmployee(emp: Employee) {
    form.selectedEmployees = (form.selectedEmployees || []).filter(
      (e) => e.userCode !== emp.userCode
    );
  }

  function onDepartmentChange(
    _value: string,
    node: { key: string; title: string } | undefined
  ) {
    if (node?.title) {
      form.departmentName = node.title as string;
    }
  }

  async function handleOk() {
    const valid = await formRef.value?.validate();
    if (valid) return;
    if (props.initial?.id) {
      const { selectedEmployees: _se, ...rest } = form;
      emit('submit', rest as SixSAccount);
    } else {
      const employees = form.selectedEmployees ?? [];
      if (employees.length === 0) return;
      const accounts: SixSAccount[] = employees.map((emp) => ({
        userCode: emp.userCode,
        userName: emp.userName,
        departmentId: emp.departmentId ?? '',
        departmentName: emp.departmentName ?? '',
        year: form.year ?? currentYear,
        totalScore: 100,
        status: form.status ?? 1,
        remark: form.remark ?? '',
      }));
      emit('submit', accounts);
    }
    emit('update:visible', false);
  }
</script>

<style scoped lang="less">
  .employee-selector-layout {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;

    .action-check {
      width: 100%;
      .select-btn {
        height: 40px;
        border-color: rgb(var(--primary-6));
        color: rgb(var(--primary-6));
        background-color: rgba(var(--primary-6), 0.05);
        border-radius: 4px;
        font-size: 14px;
      }
    }

    .selected-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      max-height: 200px;
      overflow-y: auto;
      padding: 0;

      .emp-tag {
        background-color: #f2f3f5;
        border: none;
        color: #1d2129;
        font-size: 13px;
        padding: 4px 12px;
        height: 28px;
        line-height: 20px;
        border-radius: 4px;
        :deep(.arco-icon-close) {
          color: #86909c;
          &:hover {
            color: #1d2129;
            background: transparent;
          }
        }
      }

      .empty-tip {
        color: #c9cdd4;
        font-size: 14px;
        line-height: 32px;
      }
    }
  }

  .gray-input {
    :deep(.arco-input),
    :deep(.arco-textarea) {
      background-color: #f2f3f5;
      border: none;
    }
    :deep(.arco-input-wrapper),
    :deep(.arco-textarea-wrapper) {
      background-color: #f2f3f5;
      border: 1px solid transparent;
      &:hover,
      &:focus-within {
        background-color: #f2f3f5;
        border-color: rgb(var(--primary-6));
      }
    }
  }
</style>
