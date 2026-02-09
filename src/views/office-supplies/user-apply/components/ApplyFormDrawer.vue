<template>
  <a-drawer
    :visible="visible"
    title="填写领用申请"
    width="800px"
    @cancel="$emit('update:visible', false)"
    @before-ok="handleBeforeOk"
  >
    <a-form ref="formRef" :model="form" layout="vertical">
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item field="userName" label="领用人">
            <a-input-search
              v-model="form.userName"
              placeholder="请选择领用人"
              readonly
              class="readonly-input"
              @click="openEmployeeSelector"
              @search="openEmployeeSelector"
            >
              <template #button-icon>
                <icon-user />
              </template>
            </a-input-search>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item field="userCode" label="领用人工号">
            <a-input
              v-model="form.userCode"
              placeholder="工号"
              readonly
              class="readonly-input"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item field="deptName" label="所属部门">
        <a-input
          v-model="form.deptName"
          placeholder="所属部门"
          readonly
          class="readonly-input"
        />
      </a-form-item>

      <a-form-item
        field="reason"
        label="领用事由"
        :rules="[{ required: true, message: '请输入领用事由' }]"
      >
        <a-textarea
          v-model="form.reason"
          placeholder="请输入领用事由，如：项目耗材、日常行政等"
          :auto-size="{ minRows: 4, maxRows: 6 }"
          class="reason-input"
        />
      </a-form-item>

      <div class="list-header">
        <div class="list-title">领用物品明细</div>
      </div>

      <a-table
        :data="selectedItems"
        :pagination="false"
        :bordered="{ wrapper: true, cell: true }"
        class="items-table"
      >
        <template #columns>
          <a-table-column title="物品信息">
            <template #cell="{ record }">
              <div class="item-info">
                <div class="item-name">{{ record.name }}</div>
                <div class="item-spec">{{ record.spec || '-' }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column
            title="单位"
            data-index="unit"
            :width="70"
            align="center"
          />
          <a-table-column title="数量" :width="150" align="center">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.applyQuantity"
                :min="1"
                :max="record.availableStock"
                placeholder="数量"
                hide-button
              >
                <template #suffix>
                  <span class="max-hint">/ {{ record.availableStock }}</span>
                </template>
              </a-input-number>
            </template>
          </a-table-column>
          <a-table-column title="操作" :width="80" align="center">
            <template #cell="{ record }">
              <a-button
                type="text"
                status="danger"
                size="small"
                @click="handleRemoveItem(record)"
              >
                <template #icon><icon-delete /></template>
              </a-button>
            </template>
          </a-table-column>
        </template>
        <template #empty>
          <div class="empty-state">
            <icon-empty :size="32" style="color: #c9cdd4; margin-bottom: 8px" />
            <div style="color: #86909c">暂无数据</div>
          </div>
        </template>
      </a-table>
    </a-form>

    <EmployeeSelectorModal
      v-model:visible="employeeSelectorVisible"
      :multiple="false"
      @submit="handleEmployeeSelected"
    />
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import type { SuppliesItemVO, SuppliesRequestVO } from '@/api/supplies';
  import { Message } from '@arco-design/web-vue';
  import { useUserStore } from '@/store';
  import EmployeeSelectorModal from '@/components/hr/EmployeeSelectorModal.vue';
  import useEmployeeList from '@/hooks/hr/employee';

  const props = defineProps<{
    visible: boolean;
    selectedItems: (SuppliesItemVO & { applyQuantity: number })[];
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', visible: boolean): void;
    (e: 'submit', data: SuppliesRequestVO): void;
    (
      e: 'update:selectedItems',
      items: (SuppliesItemVO & { applyQuantity: number })[]
    ): void;
  }>();

  const userStore = useUserStore();
  const { fetchEmployeeDetail } = useEmployeeList({ autoLoad: false });

  const formRef = ref();
  const form = ref({
    reason: '',
    userName: '',
    userCode: '',
    deptName: '',
  });

  const employeeSelectorVisible = ref(false);

  watch(
    () => props.visible,
    async (val) => {
      if (val) {
        form.value.reason = '';
        // 默认设置为当前登录用户
        form.value.userName = userStore.username || '';
        form.value.userCode = userStore.userCode || '';
        form.value.deptName = ''; // 先置空

        // 给初始数量赋值，默认1
        props.selectedItems.forEach((item) => {
          if (!item.applyQuantity) {
            item.applyQuantity = 1;
          }
        });

        // 尝试获取当前用户的部门信息
        if (form.value.userCode) {
          try {
            const detail = await fetchEmployeeDetail(form.value.userCode);
            if (detail) {
              form.value.deptName = detail.departmentName || '';
            }
          } catch (e) {
            // console.error('Fetch employee detail failed', e);
          }
        }
      }
    }
  );

  const openEmployeeSelector = () => {
    employeeSelectorVisible.value = true;
  };

  const handleEmployeeSelected = (employees: any[]) => {
    if (employees && employees.length > 0) {
      const emp = employees[0];
      form.value.userName = emp.userName;
      form.value.userCode = emp.userCode;
      form.value.deptName = emp.departmentName || '';
    }
  };

  const handleRemoveItem = (record: any) => {
    const index = props.selectedItems.indexOf(record);
    if (index > -1) {
      const newItems = [...props.selectedItems];
      newItems.splice(index, 1);
      emit('update:selectedItems', newItems);
    }
  };

  const handleBeforeOk = async () => {
    const res = await formRef.value?.validate();
    if (res) return false;

    if (!form.value.userCode) {
      Message.error('请选择领用人');
      return false;
    }

    if (props.selectedItems.length === 0) {
      Message.error('请至少选择一个物品');
      return false;
    }

    // 校验数量
    const invalidItem = props.selectedItems.find(
      (it) =>
        !it.applyQuantity ||
        it.applyQuantity < 1 ||
        it.applyQuantity > (it.availableStock || 0)
    );
    if (invalidItem) {
      Message.error(`物品 [${invalidItem.name}] 的领用数量不合法`);
      return false;
    }

    const submitData: SuppliesRequestVO = {
      reason: form.value.reason,
      userCode: form.value.userCode,
      userName: form.value.userName,
      items: props.selectedItems.map((it) => ({
        itemId: String(it.id || ''),
        quantity: it.applyQuantity,
      })),
    };

    emit('submit', submitData);
    return true;
  };
</script>

<style scoped lang="less">
  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
    margin-bottom: 12px;
  }
  .list-title {
    font-weight: 600;
    color: #1d2129;
    font-size: 15px;
  }

  .item-info {
    .item-name {
      font-weight: 500;
      color: #1d2129;
    }
    .item-spec {
      font-size: 12px;
      color: #86909c;
    }
  }

  /* 给输入框统一的只读背景色感 */
  .readonly-input :deep(.arco-input-wrapper),
  .reason-input :deep(.arco-textarea-wrapper) {
    background-color: #f7f8fa;
    border: none;
  }

  .readonly-input :deep(.arco-input-wrapper:hover),
  .reason-input :deep(.arco-textarea-wrapper:hover) {
    background-color: #f2f3f5;
  }

  .items-table {
    margin-top: 12px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px 0;
  }

  .max-hint {
    font-size: 12px;
    color: #c9cdd4;
  }
</style>
