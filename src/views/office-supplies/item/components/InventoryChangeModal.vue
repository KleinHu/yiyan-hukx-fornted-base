<template>
  <a-modal
    :visible="visible"
    title="库存调拨"
    @cancel="$emit('update:visible', false)"
    @before-ok="handleBeforeOk"
  >
    <a-form :model="form" auto-label-width>
      <a-form-item label="物品">
        <span style="font-weight: bold">{{ itemName }}</span>
      </a-form-item>
      <a-form-item field="scenario" label="变动原因" required>
        <a-select v-model="form.scenario" placeholder="请选择原因">
          <a-option :value="1">采购入库</a-option>
          <a-option :value="3">盘点调增</a-option>
          <a-option :value="4">退库入库</a-option>
          <a-option :value="5">报损出库</a-option>
        </a-select>
      </a-form-item>
      <a-form-item
        field="quantity"
        label="变动数量"
        required
        help="增加库存填正数，核减库存填负数"
      >
        <a-input-number v-model="form.quantity" placeholder="请输入变动数量" />
      </a-form-item>
      <a-form-item field="remark" label="备注">
        <a-textarea v-model="form.remark" placeholder="请输入备注信息" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
  import { reactive, watch } from 'vue';
  import type { InventoryChangeRequest } from '@/api/supplies';

  const props = defineProps<{
    visible: boolean;
    itemId: number;
    itemName: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', visible: boolean): void;
    (e: 'submit', data: InventoryChangeRequest): void;
  }>();

  const form = reactive<InventoryChangeRequest>({
    itemId: 0,
    quantity: 1,
    scenario: 1,
    remark: '',
  });

  watch(
    () => props.itemId,
    (val) => {
      form.itemId = val;
      form.quantity = 1;
      form.scenario = 1;
      form.remark = '';
    }
  );

  const handleBeforeOk = async () => {
    emit('submit', { ...form });
    return true;
  };
</script>
