<!--组件：任务流转-->
<template>
  <div>
    <a-button type="outline" @click="open">流转</a-button>

    <a-modal
      v-model:visible="visible"
      title="任务流转"
      @cancel="close"
      @ok="valid"
    >
      <a-form ref="formRef" :model="formModel" :rules="rules">
        <a-form-item label="任务名称">
          {{ subject }}
        </a-form-item>
        <a-form-item label="流转类型" field="transferType">
          <a-radio-group
            v-model="formModel.transferType"
            :options="transferOptions"
          />
        </a-form-item>
        <a-form-item label="流转人" field="toUser">
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
        <a-form-item label="流转类型" field="approveType">
          <a-radio-group
            v-model="formModel.approveType"
            :options="approveOptions"
          />
        </a-form-item>
        <a-form-item label="备注" field="opinion">
          <a-textarea v-model:model-value="formModel.opinion" />
        </a-form-item>

        <!--流转类型为并行时-->
        <a-row v-show="formModel.approveType === 'parallel'">
          <a-col :span="24">
            <a-form-item label="完成配置" field="completeType">
              <a-radio-group
                v-model="formModel.completeType"
                :options="completeOptions"
              />
            </a-form-item>
          </a-col>

          <!--完成配置为高级配置时-->
          <a-col v-show="formModel.completeType === 1" :span="24">
            <a-form-item label="计算类型" field="completeJudgeType">
              <a-radio-group
                v-model="formModel.completeJudgeType"
                :options="completeJudgeOptions"
              />
            </a-form-item>
          </a-col>
          <a-col v-show="formModel.completeType === 1" :span="24">
            <a-form-item label="投票数" field="completeSetting">
              <a-input-number
                v-model:model-value="formModel.completeSetting"
                hide-button
                :min="1"
                :max="
                  formModel.completeJudgeType === 'voteCount'
                    ? formModel.toUser.length
                    : 100
                "
              >
                <template #suffix>
                  {{ formModel.completeJudgeType === 'voteCount' ? '票' : '%' }}
                </template>
              </a-input-number>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>

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
  import EmployeeSelectModal from '@/components/cac-components/employee-select-modal/index.vue';
  import { roamBpmTask } from '@/api/bpm/bpm-task';

  const props = defineProps({
    taskId: { type: String, required: true },
    subject: { type: String, default: '' },
    formSecretLevel: { type: Number, default: 0 },
  });
  const emits = defineEmits(['afterSubmit']);

  const transferOptions = [
    { label: '返回', value: 'waitAllVoted' },
    { label: '审批下一步', value: 'jumpNext' },
  ];
  const approveOptions = [
    { label: '串行', value: 'sequential' },
    { label: '并行', value: 'parallel' },
  ];
  const completeOptions = [
    { label: '默认', value: 0 },
    { label: '高级配置', value: 1 },
  ];
  const completeJudgeOptions = [
    { label: '票数', value: 'voteCount' },
    { label: '百分比', value: 'votePercent' },
  ];

  const formRef = ref();
  const formModel = ref<{
    transferType: 'waitAllVoted' | 'jumpNext';
    toUser: TagData[];
    approveType: 'sequential' | 'parallel';
    opinion: string;
    completeType: number;
    completeJudgeType: 'voteCount' | 'votePercent';
    completeSetting: number;
  }>({
    transferType: 'waitAllVoted',
    toUser: [],
    approveType: 'sequential',
    opinion: '',
    completeType: 0,
    completeJudgeType: 'voteCount',
    completeSetting: 0,
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
      const { toUser, ...res } = formModel.value;
      const { data } = await roamBpmTask({
        ...res,
        msgTypes: [],
        msgType: '',
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
