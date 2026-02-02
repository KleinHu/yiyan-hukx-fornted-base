<template>
  <div>
    <a-button v-if="type === 'button'" type="outline" @click="open">
      取回
    </a-button>
    <a-link v-if="type === 'link'" @click="open">取回</a-link>
    <a-modal
      v-model:visible="visible"
      :title="`${subject}取回任务`"
      :width="600"
      @cancel="close"
      @ok="submit"
    >
      <a-form ref="formRef" :model="formModel" :rules="rules" auto-label-width>
        <a-row>
          <a-col :span="24">
            <a-form-item label="名称" field="name">
              <span>任务名称：{{ subject }}</span>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="意见" field="opinion">
              <a-textarea
                v-model:model-value="formModel.opinion"
                placeholder="意见"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="通知方式" field="msgTypes">
              <a-checkbox-group
                v-model:model-value="formModel.msgTypes"
                :options="msgOptions"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { PropType, ref } from 'vue';
  import {
    queryFileConfigRecordPage,
    doRetrieveTask,
  } from '@/api/bpm/bpm-task-transfer';
  import { CheckboxOption, Message } from '@arco-design/web-vue';

  const formRef = ref();
  const rules = {
    name: [{ required: true, message: '请输入名称' }],
    alias: [{ required: true, message: '请输入别名' }],
    categoryId: [{ required: true, message: '请选择表单分类' }],
    component: [{ required: true, message: '请输入外部url' }],
  };
  const loading = ref(false);
  const visible = ref(false);
  const list = ref<any[]>([]);
  const emits = defineEmits(['afterSubmit']);
  const open = () => {
    visible.value = true;
    // console.log('visible', visible);
    handleSearch();
  };
  const props = defineProps({
    subject: { type: String },
    taskId: { type: String },
    layerid: { type: String },
    lydata: { type: String },
    type: { type: String as PropType<'button' | 'link'>, default: 'button' },
  });
  const formModel = ref<{
    opinion: string;
    msgTypes: string[];
  }>({
    opinion: '',
    msgTypes: [],
  });
  const msgOptions = ref<CheckboxOption[]>([]);
  const handleSearch = async () => {
    loading.value = true;
    try {
      const { data } = await queryFileConfigRecordPage();
      list.value = data;
      list.value.forEach((element) => {
        msgOptions.value.push({ label: element.name, value: element.type });
      });
      msgOptions.value = list.value.map((elem) => {
        return { label: elem.name, value: elem.type };
      });
    } finally {
      loading.value = false;
    }
  };
  const submit = async () => {
    try {
      const { msgTypes, ...res } = formModel.value;
      const params: any = {
        ...res,
        msgTypes: msgTypes.join(','),
        taskId: props.taskId,
      };
      // console.log('params', params);
      const { data } = await doRetrieveTask(params);
      Message.success(data.message);
      emits('afterSubmit');
    } finally {
      close();
    }
  };
  const close = () => {
    list.value = [];
    formRef.value.resetFields();
    visible.value = false;
  };
</script>
