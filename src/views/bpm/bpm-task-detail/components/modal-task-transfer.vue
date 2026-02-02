<!--组件：任务转办-->
<template>
  <div>
    <a-button type="outline" @click="open">转办</a-button>

    <a-modal :visible="visible" title="任务转办" @cancel="close" @ok="valid">
      <a-form ref="formRef" :model="formModel" :rules="rules">
        <a-form-item label="任务名称">
          {{ subject }}
        </a-form-item>
        <a-form-item label="转办人" field="toUser">
          <div style="display: flex; width: 100%">
            <a-input-tag
              v-model:model-value="formModel.toUser"
              readonly
              :field-names="{ label: 'username', value: 'id' }"
            >
              <template #tag="{ data }">
                <icon-user />
                {{ data.username }}
              </template>
            </a-input-tag>
            <a-button type="dashed" @click="openSelectUserModal">
              <template #icon>
                <icon-user-add />
              </template>
            </a-button>
          </div>
        </a-form-item>
        <a-form-item label="意见" field="opinion">
          <a-textarea v-model:model-value="formModel.opinion" />
        </a-form-item>
      </a-form>

      <!-- 对话框：选人 -->
      <EmployeeSelectModal
        ref="userSelectRef"
        only-chosen-one-employee
        :secret-level-filter="formSecretLevel"
        @submit="selectUser"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Message, TagData } from '@arco-design/web-vue';
  import EmployeeSelectModal from '@/components/cac-components/employee-select-modal/index.vue';
  import { transferBpmTask } from '@/api/bpm/bpm-task';

  const props = defineProps({
    taskId: { type: String, required: true },
    subject: { type: String, default: '' },
    formSecretLevel: { type: Number, default: 0 },
  });
  const emits = defineEmits(['afterSubmit']);

  const formRef = ref();
  const formModel = ref<{
    toUser: TagData[];
    opinion: string;
  }>({
    toUser: [],
    opinion: '',
  });
  const rules = {
    toUser: [{ required: true, message: '请选择转办人' }],
  };

  const userSelectRef = ref();
  const openSelectUserModal = () => {
    userSelectRef.value.openOrgEmployeeSelectModal();
  };
  const selectUser = async (users: any[]) => {
    formModel.value.toUser = users;
  };

  const visible = ref(false);
  const open = () => {
    visible.value = true;
  };
  const close = () => {
    formRef.value.resetFields();
    visible.value = false;
  };
  const valid = async () => {
    const errors = await formRef.value.validate();
    if (!errors) {
      submit();
    }
  };
  const submit = async () => {
    try {
      const { opinion, toUser } = formModel.value;
      const { data } = await transferBpmTask({
        msgTypes: [],
        msgType: '',
        opinion,
        toUser: toUser.map((user) => {
          const { username, id } = user;
          return { id, name: username };
        }),
        subject: props.subject,
        taskId: props.taskId,
      });
      Message.success(data.message);
      emits('afterSubmit');
    } finally {
      close();
    }
  };
</script>
