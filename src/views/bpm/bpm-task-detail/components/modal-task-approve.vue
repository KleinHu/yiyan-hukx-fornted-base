<!--组件：任务审批（仅对话框本身）-->
<template>
  <div>
    <a-modal :visible="visible" title="任务审批" @cancel="close">
      <template #footer>
        <a-button :loading="submitting" @click="saveTempOpinion"
          >暂存意见</a-button
        >
        <a-button
          type="primary"
          :loading="submitting"
          @click="handleCompleteCheck"
          >交办</a-button
        >
        <a-button @click="close">取消</a-button>
      </template>
      <div style="width: 100%; height: 100%; padding: 5px">
        <div class="opinion-common">
          <div class="opinion">
            <div :class="{ 'task-opinion': opinionRequired }">
              意见:
              <a-radio-group
                v-if="showOpinion()"
                v-model="checkType"
                @change="changeCheckType"
              >
                <a-radio
                  v-for="item in checkTypes"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.text }}
                </a-radio>
              </a-radio-group>
            </div>
            <div
              style="cursor: pointer"
              @click.stop="opinionShow = !opinionShow"
            >
              <icon-plus-circle />
              插入常用意见
            </div>
          </div>
          <!--插入意见弹窗 -->
          <div
            v-show="opinionShow"
            id="opinionShow"
            class="opinion-parenthesis"
          >
            <div class="opinion-parenthesis-triangle"></div>
            <div style="position: relative">
              <ul class="opinion-parenthesis-list">
                <li
                  v-for="item in commonOpinions"
                  :key="item.opText"
                  :value="item.opText"
                  :label="item.opText"
                >
                  <a-popconfirm
                    content="确定要删除此条意见吗？"
                    @ok="closeOpinion(item)"
                  >
                    <icon-minus-circle />
                  </a-popconfirm>
                  <div @click="handleChange(item.opText)">
                    {{ item.opText }}
                  </div>
                </li>
              </ul>
              <div
                class="opinion-parenthesis-add"
                @click.stop="addOpinionShow = !addOpinionShow"
              >
                <icon-plus-circle />
                新建常用意见
              </div>
              <!--新建常用意见弹窗-->
              <div v-show="addOpinionShow" class="opinion-common-add">
                <div style="position: relative">
                  <div class="opinion-common-add-triangle"></div>
                  <div style="margin: 15px 15px 0">常用意见</div>
                  <a-textarea
                    v-model="addOpinion"
                    placeholder="请输入意见作为常用意见"
                    style="width: 309px; height: 60px; margin: 15px"
                  ></a-textarea>
                  <div class="opinion-common-add-button">
                    <a-button @click="addOpinionShow = false">取消</a-button>
                    <a-button type="primary" @click="saveOpinion">
                      保存
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <a-textarea
            v-model="formopinion"
            placeholder="请填写意见，可保存为常用意见(限500字)"
            style="height: 100px; margin-top: 10px"
            :error="opinionError"
          />
          <div
            v-show="opinionRequired && opinionError"
            role="alert"
            class="arco-form-item-message"
          >
            请填写审批意见
          </div>
        </div>
        <div v-show="canShowNextTask()" class="bpm-more-common-executors">
          <executor-task
            ref="taskExecutors"
            :task-id="taskId"
            :system-hand="systemHand"
            :allow-select-executor="allowSelectExecutor"
            :allow-select-group="allowSelectGroup"
            :task-config="taskConfig"
            :process-config="processConfig"
            :form-json="formJson"
            :form-secret-level="formSecretLevel"
            style="flex: 1"
          >
          </executor-task>
        </div>
        <!--  更多收起  -->
        <div v-if="showMoreOptions" class="bpm-more-common">
          <a-collapse :default-active-key="['1']">
            <a-collapse-item key="1" header="更多选项">
              <a-form
                ref="formRef"
                :model="formModel"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <a-form-item label="抄送" field="copyUser">
                  <!-- <a-button @click="openOrgEmployeeSelectModal">
                    <icon-user />
                    选择用户
                  </a-button> -->
                  <div style="display: flex; width: 100%">
                    <a-input-tag
                      v-model:model-value="formModel.copyUser"
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
            </a-collapse-item>
          </a-collapse>
        </div>
      </div>
      <!-- 选人组件 -->
      <EmployeeSelectModal
        ref="employeeSelectModalRef"
        :default-selected-user-code-list="copyUsers"
        :secret-level-filter="formSecretLevel"
        @submit="submitEmployeeSelectModal"
      />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, toRefs, watch, computed } from 'vue';
  import { Message, TagData } from '@arco-design/web-vue';
  import {
    opinionSave,
    getOpinion,
    delOpinion,
    getTemporaryOpinion,
    saveTemporaryOpinion,
  } from '@/api/bpm/bpm-task';
  import { BpmTaskFormCompleteReq } from '@/api/bpm/model/bpmTaskModel';
  import ExecutorTask from '@/components/bpm/executor-task/index.vue';
  import EmployeeSelectModal from '@/components/cac-components/employee-select-modal/index.vue';

  const props = defineProps({
    visible: { type: Boolean, default: false },
    allowSelectExecutor: { type: Boolean, default: false },
    allowSelectGroup: { type: Boolean, default: false },
    systemHand: { type: Boolean },
    taskId: { type: String, required: true },
    processConfig: {
      type: Object,
      default: () => {
        return {};
      },
    },
    taskConfig: {
      type: Object,
      default: () => {
        return {};
      },
    },
    lydata: {
      type: Object,
      default: () => {
        return {};
      },
    },
    formJson: { type: String, required: true },
    formSecretLevel: { type: Number, default: 0 },
    submitting: { type: Boolean, default: false },
    showMoreOptions: { type: Boolean, default: false },
  });
  const {
    visible,
    allowSelectGroup,
    allowSelectExecutor,
    systemHand,
    taskId,
    taskConfig,
    processConfig,
    lydata,
  } = toRefs(props); // 根据props创建多个 ref 对象
  const checkType = ref('AGREE');
  const checkTypes = ref([
    { text: '通过', value: 'AGREE' },
    { text: '不通过', value: 'REFUSE' },
  ]);
  // const opinion = ref('');
  const addOpinion = ref('');
  const opinionName = ref('');
  const msgTypes = ref<any>([]);
  // const nodeExecutors = ref<any>([]);
  const temporaryOpinionObj = ref({ id: '' });
  const commonOpinions = ref([{ opText: '' }]);
  const opinionShow = ref(false);
  const addOpinionShow = ref(false);
  const formopinion = ref('');
  const formRef = ref();
  const formModel = ref<{ copyUser: TagData[] }>({
    copyUser: [],
  });

  const copyUsers = ref<string[]>([]); // 抄送人员
  const relInsts = ref<string[]>([]); // 关联流程
  const employeeSelectModalRef = ref<any>(); // 人员对话框的ref
  const taskExecutors = ref<any>(); // 执行人员的ref
  // const rules = {
  //   opinion: [
  //     { required: true, message: '意见必填', trigger: 'blur' },
  //     {
  //       type: 'string',
  //       max: 500,
  //       message: '长度不能大于500字符',
  //       trigger: 'blur',
  //     },
  //   ],
  // };
  const labelCol = { span: 3 };
  const wrapperCol = { span: 9 };
  const emits = defineEmits(['update:visible', 'submit']);

  const close = () => {
    emits('update:visible');
    opinionError.value = false;
    formRef.value.resetFields();
  };
  // const submit = () => {
  //   emits('update:visible');
  // };
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
    copyUsers.value = [];
    formModel.value.copyUser = chosenEmployees;
    if (chosenEmployees && chosenEmployees.length > 0) {
      copyUsers.value = chosenEmployees.map((item: any) => item.userCode);
    }
  };

  const opinionRequired = computed(() => {
    return taskConfig.value.switchOptions?.includes('opinionRequired');
  });

  // 获取暂存意见
  const getTempOpinion = async () => {
    if (taskId.value) {
      const { data } = await getTemporaryOpinion(taskId.value);
      formopinion.value = data.opinion || '';
      temporaryOpinionObj.value = data;
    }
  };
  const getCommonUserOpinions = async () => {
    const { data } = await getOpinion();
    commonOpinions.value = data;
  };

  const initCheckTypes = () => {
    if (
      taskConfig.value.multipleType !== 'normal' &&
      taskConfig.value.signConfig?.options
    ) {
      checkTypes.value = taskConfig.value.signConfig.options;
    }
    if (
      taskConfig.value.multipleType === 'normal' &&
      taskConfig.value.showOpinion
    ) {
      checkTypes.value = taskConfig.value.options;
    }
  };

  // const initUser = async () => {
  //   const { data } = await getTaskFlowNodesExecutors({
  //     taskId: taskId.value,
  //     checkType: 'AGREE',
  //     formData: {},
  //     // formData: JSON.parse(formJson.value),
  //     systemHand: systemHand.value,
  //   });
  //   nodeExecutors.value = data;
  // };

  const initForm = () => {
    // opinion.value = lydata.value.opinionObj.value;
    opinionName.value = lydata.value.opinionObj?.name || '';
    getTempOpinion();
    getCommonUserOpinions();
    // 初始化用户数据。
    // initUser();
    // 初始化意见
    initCheckTypes();
    // this.rules.opinion[0].required=this.checkType!="AGREE";
    // 加载节点选人框的初始数据
    taskExecutors.value.loadNodeExecutors(undefined, props.formJson);
  };

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        // 打开对话框才加载数据
        initForm();
      }
    }
  );

  const showOpinion = () => {
    if (taskConfig.value.signConfig) {
      // 普通任务节点
      if (
        taskConfig.value.multipleType === 'normal' &&
        taskConfig.value.showOpinion &&
        taskConfig.value.options &&
        taskConfig.value.options.length > 0
      ) {
        return true;
      }
      if (
        taskConfig.value.multipleType !== 'normal' &&
        taskConfig.value.signConfig.options
      ) {
        return true;
      }
      return false;
    }
    return false;
  };

  // 选择意见修改时，同步更改【即将流向】中展示的分支信息
  const changeCheckType = async (value: string | number | boolean) => {
    taskExecutors.value.loadNodeExecutors(value as string);
  };
  const closeOpinion = async (closeopinion: any) => {
    try {
      await delOpinion(closeopinion.opId);
      Message.success('删除成功');
    } catch (error) {
      Message.error('出现异常');
    } finally {
      getCommonUserOpinions();
    }
  };
  const handleChange = (value: string) => {
    formopinion.value += value;
    opinionShow.value = false;
  };
  const saveOpinion = async () => {
    if (!addOpinion.value) {
      Message.error('请填写需要保存的常用意见!');
      return;
    }
    try {
      const { data } = await opinionSave({ opText: addOpinion.value });
      Message.success(data.message);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Message.error('出现异常');
    } finally {
      getCommonUserOpinions();
      addOpinion.value = '';
      addOpinionShow.value = false;
    }
  };
  const saveTempOpinion = async () => {
    const id = temporaryOpinionObj.value.id || '';
    if (taskId.value) {
      try {
        const { data } = await saveTemporaryOpinion(
          taskId.value,
          formopinion.value,
          id
        );
        Message.success(data.message);
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Message.error('出现异常');
      } finally {
        close();
      }
    }
  };
  const canShowNextTask = () => {
    return !taskConfig.value.switchOptions.includes('shieldExecutePath');
  };

  watch(
    () => formopinion.value,
    (val) => {
      if (val.length > 0) {
        opinionError.value = false;
      }
    }
  );
  // 提交时若opinion为空则在textarea上进行错误提示
  const opinionError = ref(false);

  const handleCompleteCheck = () => {
    // 抄送用户
    const copyAccounts = getCopyUserAccounts();
    const noticeTypes = msgTypes.value.join(',');
    const nodeUserMap = taskExecutors.value.getNodeUserMap();
    const destNodeId = taskExecutors.value.getDestNodeId();
    const cmd: BpmTaskFormCompleteReq = {
      taskId: taskId.value,
      checkType: checkType.value,
      opinion: formopinion.value,
      msgTypes: noticeTypes,
      copyUserAccounts: copyAccounts,
      nodeExecutors: nodeUserMap,
      systemHand: systemHand.value,
      opinionName: opinionName.value,
      relInsts: JSON.stringify(relInsts.value),
    };
    // 设置目标节点。
    if (destNodeId) {
      cmd.destNodeId = destNodeId;
    }
    // 意见必填的情况下，不填写意见要报错提示禁止提交
    if (opinionRequired.value) {
      const opinionTxt = formopinion.value;
      if (opinionTxt?.length === 0) {
        opinionError.value = true;
        return;
      }
    }
    emits('submit', cmd); // submit回调返回cmd对象
  };
  /**
   * 获取抄送用户。
   * @returns {string}
   */
  const getCopyUserAccounts = () => {
    const accounts: string[] = [];
    if (copyUsers.value && copyUsers.value.length > 0) {
      copyUsers.value.forEach((item: string) => {
        accounts.push(item);
      });
    }
    return accounts.join(',');
  };
</script>

<style scoped lang="less">
  .opinion-common {
    position: relative;
  }

  .opinion-parenthesis {
    position: absolute;
    top: 28px;
    right: 0;
    z-index: 9999;
    width: 337px;
    background-color: #fff;
    border: solid 1px #eee;
    border-radius: 4px;
    box-shadow: 0 0 13px 0 rgb(6 0 1 / 17%);

    &-triangle {
      position: absolute;
      top: -17px;
      right: 36px;
      width: 0;
      height: 5px;
      border: 10px solid;
      border-color: transparent transparent white;
    }

    &-list {
      margin-top: 20px;
      padding: 0;
    }

    &-add {
      display: flex;
      align-items: center;
      height: 35px;
      padding-left: 12px;
      color: #444;
      line-height: 35px;
      border-top: solid 1px #d9d9d9;
      cursor: pointer;
    }
  }

  .opinion-common-add {
    position: absolute;
    bottom: -185px;
    left: 0;
    z-index: 9999;
    box-sizing: border-box;
    width: 337px;
    height: 178px;
    background-color: #fff;
    border: solid 1px #eee;
    border-radius: 4px;
    box-shadow: 0 0 13px 0 rgb(6 0 1 / 17%);

    &-triangle {
      position: absolute;
      top: -35px;
      left: 57px;
      width: 0;
      height: 5px;
      border: 10px solid;
      border-color: transparent transparent white;
    }

    &-button {
      text-align: right;
      border-top: solid 1px #d9d9d9;
    }
  }

  .opinion-parenthesis-triangle-list li {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    padding: 0 12px;
    color: #444;
    line-height: 30px;
    cursor: pointer;
  }

  .opinion-parenthesis-triangle-add i {
    margin-right: 5px;
    font-size: 18px;
  }

  .opinion-common-add-button button {
    margin-top: 5px;
    margin-right: 15px;
  }

  .opinion-parenthesis-triangle-list li i {
    margin-right: 5px;
    font-size: 18px;
  }

  .opinion-parenthesis-triangle-list li div {
    display: -webkit-box;
    flex: 1;
    padding-left: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .opinion {
    display: flex;
    color: #444;
    font-size: 14px;

    div:nth-child(1) {
      flex: 1;
      color: #303030;
    }

    div:nth-child(2) i {
      margin-right: 5px;
      font-size: 17px;
    }
  }

  .opinion-parenthesis-list li {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 30px;
    padding: 0 12px;
    color: #444;
    line-height: 30px;
    cursor: pointer;
  }

  .opinion-parenthesis-list li i {
    margin-right: 5px;
    font-size: 18px;
  }

  .opinion-parenthesis-list li i:hover {
    color: #4285f4;
  }

  .opinion-parenthesis-list li div {
    display: -webkit-box;
    flex: 1;
    padding-left: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }

  .opinion-parenthesis-list li div:hover {
    background-color: #f2f3f6;
    border-radius: 4px;
  }

  .task-opinion::before {
    content: '*';
    color: red;
    margin-right: 5px;
  }

  .bpm-more-common-executors {
    display: flex;
    align-items: center;
    margin-top: 20px;
  }

  .bpm-more-common {
    margin-top: 20px;
  }

  .bpm-more-common :deep(.arco-collapse-item-content) {
    background-color: white;
  }
</style>
