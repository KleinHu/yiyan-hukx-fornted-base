<template>
  <a-drawer
    :visible="visible"
    title="领用申请审核"
    width="800px"
    unmount-on-close
    :ok-loading="loading"
    @cancel="$emit('update:visible', false)"
    @before-ok="handleBeforeOk"
  >
    <a-form :model="form" layout="vertical">
      <a-descriptions :column="1" bordered size="small">
        <a-descriptions-item label="申请单号">{{
          initialData?.orderNo
        }}</a-descriptions-item>
        <a-descriptions-item label="申请人"
          >{{ initialData?.userName }} ({{
            initialData?.deptName
          }})</a-descriptions-item
        >
        <a-descriptions-item label="申请事由">{{
          initialData?.reason
        }}</a-descriptions-item>
      </a-descriptions>

      <div class="section-title">申请明细</div>
      <a-table
        :data="initialData?.items"
        :pagination="false"
        size="small"
        :bordered="{ wrapper: true, cell: true }"
      >
        <template #columns>
          <a-table-column title="物品名称" data-index="itemName" />
          <a-table-column title="规格" data-index="spec" />
          <a-table-column
            title="申请数量"
            data-index="quantity"
            width="100"
            align="center"
          />
          <a-table-column
            title="单位"
            data-index="unit"
            width="70"
            align="center"
          />
          <a-table-column
            v-if="form.status === 1"
            title="实发数量"
            width="120"
            align="center"
          >
            <template #cell="{ record }">
              <a-input-number
                v-model="record.issuedQuantity"
                :min="0"
                :max="record.quantity"
                size="small"
                placeholder="实发"
              />
            </template>
          </a-table-column>
        </template>
      </a-table>

      <div class="section-title">审核处理</div>
      <a-form-item field="status" label="审核结论" required>
        <a-radio-group v-model="form.status" type="button">
          <a-radio :value="1">通过</a-radio>
          <a-radio :value="2">驳回</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item field="remark" label="审核备注">
        <a-textarea
          v-model="form.remark"
          placeholder="请输入审核意见"
          :auto-size="{ minRows: 3 }"
        />
      </a-form-item>

      <a-alert
        v-if="form.status === 1"
        type="warning"
        show-icon
        style="margin-top: 16px"
      >
        审核通过将同步扣减实时库存。
      </a-alert>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
  import { reactive, watch } from 'vue';
  import { useUserStore } from '@/store';
  import type {
    SuppliesRequestVO,
    SuppliesRequestItemVO,
  } from '@/api/supplies';

  const props = defineProps<{
    visible: boolean;
    initialData: SuppliesRequestVO | null;
    loading: boolean;
  }>();

  const userStore = useUserStore();

  const emit = defineEmits<{
    (e: 'update:visible', visible: boolean): void;
    (
      e: 'submit',
      id: string,
      status: number,
      remark?: string,
      items?: SuppliesRequestItemVO[],
      operatorName?: string
    ): void;
  }>();

  const form = reactive({
    status: 1,
    remark: '',
  });

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        form.status = 1;
        form.remark = '';
        // 初始化实发数量默认等于申请数量
        if (props.initialData?.items) {
          props.initialData.items.forEach((item) => {
            if (!item.issuedQuantity) {
              item.issuedQuantity = item.quantity;
            }
          });
        }
      }
    }
  );

  const handleBeforeOk = async () => {
    if (props.initialData?.id) {
      emit(
        'submit',
        props.initialData.id,
        form.status,
        form.remark,
        props.initialData.items,
        userStore.username
      );
    }
    return false; // 由父组件控制关闭
  };
</script>

<style scoped lang="less">
  .section-title {
    margin-top: 24px;
    margin-bottom: 12px;
    font-weight: bold;
    font-size: 14px;
    color: var(--color-text-1);
  }
</style>
