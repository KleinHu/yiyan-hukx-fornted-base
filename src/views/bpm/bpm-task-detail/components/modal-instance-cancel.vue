<!--组件：流程实例作废（仅对话框本身）-->
<template>
  <div>
    <a-modal :visible="visible" title="流程作废" @cancel="close" @ok="submit">
      <a-space direction="vertical" style="width: 100%">
        <a-alert type="warning">该操作不可恢复</a-alert>
        <a-form :model="formModel">
          <a-form-item label="作废原因">
            <a-textarea
              v-model:model-value="formModel.reason"
              placeholder="填写作废原因"
            />
          </a-form-item>
        </a-form>
      </a-space>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { cancelBpmInst } from '@/api/bpm/bpm-instance';

  const props = defineProps({
    visible: { type: Boolean, default: false },
    instId: { type: String, required: true },
  });
  const emits = defineEmits(['update:visible', 'afterSubmit']);

  const formModel = ref<{ reason: string }>({ reason: '' });

  const close = () => {
    emits('update:visible');
  };
  const submit = async () => {
    try {
      const { data } = await cancelBpmInst({
        reason: formModel.value.reason,
        instId: props.instId,
      });
      Message.success(data.message);
      emits('afterSubmit');
    } finally {
      close();
    }
  };
</script>
