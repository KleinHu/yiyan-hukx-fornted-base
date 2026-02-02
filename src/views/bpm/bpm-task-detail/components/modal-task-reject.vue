<!--组件：任务回退-->
<template>
  <div>
    <a-modal
      :visible="visible"
      title="任务回退"
      @ok="handleCompleteCheck"
      @cancel="close"
    >
      <div style="width: 100%; height: 100%; padding: 20px">
        <a-form ref="formRef" :model="backForm" :rules="rules" auto-label-width>
          <a-form-item
            v-if="rejectOptions?.length > 1"
            label="驳回方式"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-radio-group
              v-model="backForm.checkType"
              :options="rejectOptions"
              @change="intiReturnMode"
            />
          </a-form-item>
          <a-form-item
            v-if="
              (backForm.checkType === 'BACK_TO_STARTOR' &&
                (taskConfig.startReturnMode || 'both') === 'both') ||
              (backForm.checkType === 'BACK_SPEC' &&
                (taskConfig.specReturnMode || 'both') === 'both')
            "
            label="回退任务完成后"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-radio-group v-model="backForm.nextJumpType">
              <a-radio value="normal">正常执行</a-radio>
              <a-radio value="source">原路返回</a-radio>
            </a-radio-group>
          </a-form-item>

          <!--选择驳回到指定节点时，还需指定一个节点进行驳回-->
          <a-form-item
            v-if="backForm.checkType === 'BACK_SPEC'"
            label="指定节点"
          >
            <a-select
              v-model="backForm.destNodeId"
              :options="backNodes"
              placeholder="驳回到"
            />
          </a-form-item>

          <a-form-item
            label="意见"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            field="opinion"
          >
            <a-textarea v-model="backForm.opinion" placeholder="请填写意见" />
          </a-form-item>

          <!-- <a-form-item
            label="附件"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <FileUpload ref="fileRef" />
          </a-form-item> -->

          <a-form-item
            label="抄送"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <div style="display: flex; width: 100%">
              <a-input-tag
                v-model:model-value="backForm.copyUsers"
                readonly
                :field-names="{ label: 'username', value: 'id' }"
              >
                <template #tag="{ data }">
                  <icon-user />
                  {{ data.username }}
                </template>
              </a-input-tag>
              <a-button type="dashed" @click="openOrgEmployeeSelectModal">
                <template #icon>
                  <icon-user-add />
                </template>
              </a-button>
            </div>
          </a-form-item>
        </a-form>
      </div>
      <!-- 选人组件 -->
      <EmployeeSelectModal
        ref="employeeSelectModalRef"
        :default-selected-user-code-list="copyUsersArray"
        :secret-level-filter="formSecretLevel"
        @submit="submitEmployeeSelectModal"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, toRefs, watch } from 'vue';
  import { Message, TagData } from '@arco-design/web-vue';
  import EmployeeSelectModal from '@/components/cac-components/employee-select-modal/index.vue';
  import {
    BpmTaskFormCompleteReq,
    BpmTaskNodeRecord,
  } from '@/api/bpm/model/bpmTaskModel';
  import { queryBackNodes } from '@/api/bpm/bpm-task';
  // import FileUpload from '@/components/cac-components/file-upload/index.vue';

  interface BackFormModel {
    checkType: string; // 驳回方式
    nextJumpType: string; // 回退任务完成后
    opinion: string; // 意见
    fileList: File[]; // 附件
    copyUsers: TagData[]; // 抄送
    destNodeId?: string;
  }

  const props = defineProps({
    visible: { type: Boolean, default: false },
    taskId: { type: String, required: true },
    taskConfig: {
      type: Object,
      default: () => {
        return {};
      },
    },
    // layerid: { type: String, defalut: '' },
    // lydata: {
    //   type: Object,
    //   default: () => {
    //     return {};
    //   },
    // },
    // destroy: { type: Function },
    // backOptions: { type: Array, default: () => [] },
    opinionObj: {
      type: Object,
      default: () => {
        return { name: '', value: '' };
      },
    },
    formSecretLevel: { type: Number, default: 0 },
  });
  const emits = defineEmits(['update:visible', 'submit']);

  const {
    visible,
    taskId,
    // taskConfig,
    // layerid,
    // lydata,
    // destroy,
    // okLoading,
    // backOptions,
    opinionObj,
  } = toRefs(props); // 根据props创建多个 ref 对象

  const labelCol = { span: 4 };
  const wrapperCol = { span: 8 };
  const backs = [
    { label: '驳回上一步', value: 'BACK' },
    { label: '驳回到发起人', value: 'BACK_TO_STARTOR' },
    { label: '驳回到审批节点', value: 'BACK_SPEC' },
  ];
  const rejectOptions = ref<{ label: string; value: string }[]>([]);

  const backForm = ref<BackFormModel>({
    checkType: '',
    nextJumpType: 'normal',
    opinion: '',
    fileList: [],
    copyUsers: [],
    destNodeId: '',
  });

  const rules = {
    opinion: [{ required: true, message: '请填写意见' }],
  };
  const fileList = ref([]);
  const msgTypes = ref([]);
  const opinionName = ref('');
  const copyUsersArray = ref<string[]>([]); // 人员对话框的ref
  const employeeSelectModalRef = ref<any>(); // 人员对话框的ref

  const close = () => {
    emits('update:visible');
  };

  const backNodes = ref<{ label: string; value: string }[]>([]);
  const initBackNodes = async () => {
    const { data } = await queryBackNodes(taskId.value);
    backNodes.value = data.map((node: BpmTaskNodeRecord) => {
      const { nodeName, nodeId } = node;
      return { label: nodeName, value: nodeId };
    });
  };
  const intiReturnMode = () => {
    const startReturnMode = props.taskConfig.startReturnMode || 'both';
    const specReturnMode = props.taskConfig.specReturnMode || 'both';
    if (
      backForm.value.checkType === 'BACK_TO_STARTOR' &&
      startReturnMode !== 'both'
    ) {
      backForm.value.nextJumpType = startReturnMode;
    }
    if (backForm.value.checkType === 'BACK_SPEC' && specReturnMode !== 'both') {
      backForm.value.nextJumpType = specReturnMode;
    }
  };
  const init = () => {
    const backOptions = props.taskConfig.backOptions || [];
    if (backOptions.length === 0) {
      backOptions.push(...['BACK', 'BACK_TO_STARTOR', 'BACK_SPEC']);
    }
    const tmp = backs.filter((elem) => {
      return backOptions.includes(elem.value);
    });
    backForm.value.checkType = tmp[0].value;
    backForm.value.opinion = opinionObj.value.value;
    opinionName.value = opinionObj.value.name;
    rejectOptions.value = tmp;
    // initMessageHandler();
    initBackNodes();
    intiReturnMode();
  };

  watch(
    () => visible.value,
    (val) => {
      if (val) {
        // 打开对话框时初始化值
        init();
      }
    }
  );
  /**
   * @description 开启部门人员选择组件modal
   */
  const openOrgEmployeeSelectModal = () => {
    employeeSelectModalRef.value.openOrgEmployeeSelectModal();
  };

  /**
   * @description 选择用户后回填。
   */
  const submitEmployeeSelectModal = (chosenEmployees: any[]) => {
    backForm.value.copyUsers = chosenEmployees;
  };

  const formRef = ref();
  const submit = () => {
    const noticeTypes = msgTypes.value.join(',');
    const copyUsersArr = backForm.value.copyUsers.map((elem) => elem.userCode);
    const cmd: BpmTaskFormCompleteReq = {
      taskId: taskId.value,
      checkType: backForm.value.checkType,
      nextJumpType: backForm.value.nextJumpType,
      opinion: backForm.value.opinion,
      msgTypes: noticeTypes,
      copyUserAccounts: copyUsersArr.join(','),
      opinionName: opinionName.value,
      opFiles: JSON.stringify(fileList.value),
    };
    if (backForm.value.checkType === 'BACK_SPEC') {
      if (!backForm.value.destNodeId) {
        Message.error('请指定节点！');
        return;
      }
      cmd.destNodeId = backForm.value.destNodeId;
    }
    emits('submit', cmd); // submit回调返回cmd对象
  };
  /**
   * @description 提交驳回信息。
   */
  const handleCompleteCheck = async () => {
    const errors = await formRef.value.validate();
    if (!errors) {
      submit();
    }
  };
</script>
