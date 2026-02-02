<!--组件：流程加签-->
<template>
  <div>
    <a-button type="outline" :disabled="disabled" @click="open">加签</a-button>

    <a-modal :visible="visible" title="加签" @cancel="close" @ok="submit">
      <a-space direction="vertical" style="width: 100%">
        <a-form ref="formRef" :model="formModel" :rules="rules">
          <a-form-item label="加签人员" field="toUser">
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
      </a-space>

      <!-- 对话框：选人 -->
      <EmployeeSelectModal
        ref="userSelectRef"
        :secret-level-filter="formSecretLevel"
        @submit="selectUser"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { Message, TagData } from '@arco-design/web-vue';
  import { addSignUser } from '@/api/bpm/bpm-task';
  import EmployeeSelectModal from '@/components/cac-components/employee-select-modal/index.vue';

  const props = defineProps({
    taskId: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    formSecretLevel: { type: Number, default: 0 },
  });
  const emits = defineEmits(['update:visible', 'afterSubmit']);

  const formRef = ref();
  const formModel = ref<{
    toUser: TagData[];
    opinion: string;
  }>({
    toUser: [],
    opinion: '',
  });
  const rules = {
    toUser: [{ required: true, message: '请选择加签人' }],
    opinion: [{ required: true, message: '请填写用户意见' }],
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
  const submit = async () => {
    const error = await formRef.value.validate();
    if (!error) {
      try {
        const { opinion, toUser } = formModel.value;
        const userIds = toUser.map((user) => {
          return user.id;
        });
        const { data } = await addSignUser({
          taskId: props.taskId,
          opinion,
          toUserIds: userIds.join(','),
        });
        Message.success(data.message);
        emits('afterSubmit');
      } finally {
        close();
      }
    }
  };
</script>
