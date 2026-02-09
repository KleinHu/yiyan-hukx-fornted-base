<template>
  <a-drawer
    :visible="visible"
    title="新建领用申请"
    width="600px"
    unmount-on-close
    @cancel="$emit('update:visible', false)"
    @before-ok="handleBeforeOk"
  >
    <a-form :model="form" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="领用人" @click="handleOpenSelector">
            <a-input
              :model-value="form.userName"
              placeholder="请选择领用人"
              readonly
              style="cursor: pointer"
            >
              <template #suffix><icon-user /></template>
            </a-input>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="领用人工号" @click="handleOpenSelector">
            <a-input
              :model-value="form.userCode"
              placeholder="领用人工号"
              readonly
              style="cursor: pointer"
            />
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item v-if="form.deptName" label="所属部门">
        <a-input :model-value="form.deptName" readonly disabled />
      </a-form-item>

      <a-form-item
        field="reason"
        label="领用事由"
        :rules="[{ required: true, message: '请输入领用事由' }]"
      >
        <a-textarea
          v-model="form.reason"
          placeholder="请输入领用事由，如：项目耗材、日常行政等"
          :auto-size="{ minRows: 3 }"
        />
      </a-form-item>

      <div class="section-title">
        <span>领用物品明细</span>
        <a-button type="outline" size="mini" @click="handleSelectItem">
          <template #icon><icon-plus /></template>
          添加物品
        </a-button>
      </div>

      <a-table
        :data="form.items"
        :pagination="false"
        :bordered="{ wrapper: true, cell: true }"
      >
        <template #columns>
          <a-table-column title="物品信息">
            <template #cell="{ record }">
              <div class="item-info">
                <div class="name">{{ record.itemName }}</div>
                <div class="spec">{{ record.spec || '-' }}</div>
              </div>
            </template>
          </a-table-column>
          <a-table-column title="单位" data-index="unit" width="70" />
          <a-table-column title="数量" width="120">
            <template #cell="{ record }">
              <a-input-number
                v-model="record.quantity"
                :min="1"
                :max="record.availableStock"
                size="small"
              />
            </template>
          </a-table-column>
          <a-table-column title="操作" width="70" align="center">
            <template #cell="{ rowIndex }">
              <a-button
                type="text"
                status="danger"
                size="small"
                @click="handleRemoveItem(rowIndex)"
              >
                <template #icon><icon-delete /></template>
              </a-button>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-form>

    <!-- 内部物品选择器 (Modal) -->
    <a-modal
      v-model:visible="itemSelectorVisible"
      title="选择办公用品"
      width="800px"
      @before-ok="handleItemSelectSubmit"
    >
      <div class="selector-header">
        <a-input-search
          v-model="itemQueryParams.name"
          placeholder="搜索物品名称"
          style="width: 280px"
          @search="onItemSearch"
        />
      </div>
      <a-table
        v-model:selected-keys="selectedItemKeys"
        row-key="id"
        :data="itemList"
        :loading="itemLoading"
        :pagination="itemPagination"
        :row-selection="{
          type: 'checkbox',
          showCheckedAll: true,
          checkboxProps: (record: any) => ({
            disabled: (record.availableStock || 0) <= 0,
          }),
        }"
        @page-change="onItemPageChange"
      >
        <template #columns>
          <a-table-column title="分类" data-index="categoryName" />
          <a-table-column title="物品名称" data-index="name" />
          <a-table-column title="规格" data-index="spec" />
          <a-table-column title="单位" data-index="unit" width="80" />
          <a-table-column title="实际库存" data-index="stock" width="90" />
          <a-table-column
            title="可领用"
            data-index="availableStock"
            width="90"
          />
        </template>
      </a-table>
    </a-modal>
    <!-- 人员选择器 (Modal) -->
    <EmployeeSelectorModal
      v-model:visible="employeeSelectorVisible"
      :multiple="false"
      @submit="handleEmployeeSelect"
    />
  </a-drawer>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue';
  import { useUserStore } from '@/store';
  import type { SuppliesRequestVO } from '@/api/supplies';
  import type { Employee } from '@/api/hr/types';
  import useSuppliesItem from '@/hooks/supplies/useSuppliesItem';
  import useEmployeeList from '@/hooks/hr/employee';
  import EmployeeSelectorModal from '@/components/hr/EmployeeSelectorModal.vue';

  const props = defineProps<{
    visible: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', visible: boolean): void;
    (e: 'submit', data: SuppliesRequestVO): void;
  }>();

  const userStore = useUserStore();
  const { fetchEmployeeDetail } = useEmployeeList({ autoLoad: false });

  // 申请表单状态
  const form = reactive<any>({
    reason: '',
    items: [],
    // 领用人信息（支持代领）
    userCode: '',
    userName: '',
    deptName: '',
  });

  // 人员选择器状态
  const employeeSelectorVisible = ref(false);

  watch(
    () => props.visible,
    async (val) => {
      if (val) {
        form.reason = '';
        form.items = [];
        // 默认设置为当前登录人
        form.userCode = userStore.userCode;
        form.userName = userStore.username;

        // 尝试获取当前人的部门
        if (form.userCode) {
          const detail = await fetchEmployeeDetail(form.userCode);
          form.deptName = detail?.departmentName || '';
        }
      }
    }
  );

  const handleOpenSelector = () => {
    employeeSelectorVisible.value = true;
  };

  const handleEmployeeSelect = (employees: Employee[]) => {
    if (employees && employees.length > 0) {
      const emp = employees[0];
      form.userCode = emp.userCode;
      form.userName = emp.userName;
      form.deptName = emp.departmentName || '';
    }
  };

  const handleBeforeOk = async () => {
    if (form.items.length === 0) {
      // 提示：请选择至少一件物品
      return false;
    }
    if (!form.reason) return false;

    // 提交时带上领用人信息
    emit('submit', { ...form });
    return true;
  };

  const handleRemoveItem = (index: number) => {
    form.items.splice(index, 1);
  };

  // 物品选择器逻辑
  const {
    list: itemList,
    loading: itemLoading,
    pagination: itemPagination,
    queryParams: itemQueryParams,
    fetchPage: fetchItemPage,
  } = useSuppliesItem();

  const itemSelectorVisible = ref(false);
  const selectedItemKeys = ref<number[]>([]);

  const handleSelectItem = () => {
    selectedItemKeys.value = form.items.map((i: any) => i.itemId);
    fetchItemPage({ pageNum: 1 });
    itemSelectorVisible.value = true;
  };

  const onItemSearch = () => {
    fetchItemPage({ pageNum: 1 });
  };

  const onItemPageChange = (current: number) => {
    fetchItemPage({ pageNum: current });
  };

  const handleItemSelectSubmit = () => {
    const selectedItems = itemList.value.filter(
      (i) => i.id && selectedItemKeys.value.includes(i.id)
    );

    // 同步勾选状态到明细表
    selectedItems.forEach((item) => {
      const exists = form.items.find((i: any) => i.itemId === item.id);
      if (!exists) {
        form.items.push({
          itemId: item.id,
          itemName: item.name,
          spec: item.spec,
          unit: item.unit,
          quantity: 1,
          availableStock: item.availableStock,
        });
      }
    });

    // 移除未在勾选列表中的项
    form.items = form.items.filter((i: any) =>
      selectedItemKeys.value.includes(i.itemId)
    );

    return true;
  };
</script>

<style scoped lang="less">
  .section-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 24px;
    margin-bottom: 12px;
    font-weight: bold;
    font-size: 15px;
  }

  .item-info {
    .name {
      font-weight: 500;
      color: var(--color-text-1);
    }
    .spec {
      font-size: 12px;
      color: var(--color-text-3);
    }
  }

  .selector-header {
    margin-bottom: 16px;
  }
</style>
