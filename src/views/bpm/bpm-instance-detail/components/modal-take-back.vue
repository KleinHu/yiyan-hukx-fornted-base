<!--组件：取回任务-->
<template>
  <div>
    <a-button type="outline" @click="open">取回任务</a-button>

    <a-modal :visible="visible" title="取回任务" @cancel="close" @ok="valid">
      <a-form ref="formRef" :model="formModel" :rules="rules">
        <a-form-item label="任务名称">
          {{ subject }}
        </a-form-item>
        <a-form-item label="意见" field="opinion">
          <a-textarea v-model:model-value="formModel.opinion" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { revokeBpmProcess } from '@/api/bpm/bpm-instance';

  const props = defineProps({
    instId: { type: String, required: true },
    subject: { type: String, default: '' },
  });
  const emits = defineEmits(['afterSubmit']);

  const visible = ref(false);

  const formRef = ref();
  const formModel = ref<{ opinion: string }>({
    opinion: '',
  });
  const rules = {
    opinion: [
      { required: true, message: '请填写意见' },
      { max: 300, message: '长度不超过300字' },
    ],
  };

  const open = () => {
    visible.value = true;
  };
  const close = () => {
    visible.value = false;
  };
  const submit = async () => {
    try {
      const { data } = await revokeBpmProcess({
        instId: props.instId,
        opinion: formModel.value.opinion,
        from: '',
      });
      Message.success(data.message);
    } finally {
      emits('afterSubmit');
    }
  };
  const valid = async () => {
    const errors = await formRef.value.validate();
    if (!errors) {
      submit();
    }
  };
</script>
