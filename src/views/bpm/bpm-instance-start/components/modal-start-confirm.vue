<!--对话框：流程启动确认，填写一些额外信息后提交启动流程-->
<template>
  <div>
    <a-modal
      :visible="visible"
      title="启动确认"
      :width="500"
      @ok="valid"
      @cancel="close"
    >
      <a-skeleton v-if="loading">
        <a-skeleton-line :rows="5" />
      </a-skeleton>
      <a-form v-else ref="formRef" :model="formModel">
        <div v-if="assignFlowUsers">
          <a-divider>指定人员</a-divider>
          <a-form-item
            field="nodeUser"
            :rules="userNodeRule"
            :content-flex="false"
            :merge-props="false"
            hide-label
            class="node-users"
          >
            <a-row v-for="(node, index) in formModel.userNodes" :key="index">
              <a-col :span="24">
                <a-form-item :label="node.nodeName" :field="node.nodeId">
                  <a-input-tag
                    v-model:model-value="node.users"
                    readonly
                    :field-names="{ label: 'username', value: 'id' }"
                  >
                    <template #tag="{ data }">
                      <icon-user />
                      {{ data.username }}
                    </template>
                  </a-input-tag>
                  <a-button type="dashed" @click="openSelectUserModal(node)">
                    <template #icon>
                      <icon-user-add />
                    </template>
                  </a-button>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form-item>
        </div>

        <a-form-item v-if="showRelInsts" label="关联流程">
          <a-button @click="openTaskSelectModal">
            <icon-branch />
            关联流程
          </a-button>
        </a-form-item>

        <div v-if="allowSelectPath">
          <a-divider>即将流向</a-divider>
          <a-form-item hide-label>
            <executor-task
              ref="taskExecutorsRef"
              :node-executors="initNodeExecutors"
              allow-select-executor
              :process-config="processConfig"
              :form-secret-level="formSecretLevel"
              style="flex: 1"
            />
          </a-form-item>
        </div>

        <a-form-item v-if="fillOpinion" label="提交说明">
          <a-textarea v-model="formModel.opinion" />
        </a-form-item>

        <a-form-item v-if="fillOpinion" label="附件">
          <a-upload disabled />
        </a-form-item>
      </a-form>

      <!-- 选人组件 -->
      <EmployeeSelectModal
        ref="userSelectRef"
        :secret-level-filter="formSecretLevel"
        @submit="selectUser"
      />
      <!-- 关联流程组件 -->
      <TaskListModal ref="taskSelectModalRef" @submit="submitTaskListModal" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { FieldRule, Message, TagData } from '@arco-design/web-vue';
  import {
    BpmStartNodeOption,
    BpmDefConfigRecord,
  } from '@/api/bpm/model/bpmDefineModel';
  import {
    getStartUserNodes,
    getFlowNodesExecutors,
  } from '@/api/bpm/bpm-define';

  import { getProcessonfigByDefKey } from '@/api/bpm/bpm-instance';
  import ExecutorTask from '@/components/bpm/executor-task/index.vue';
  import TaskListModal from '@/components/bpm/task-list-modal/index.vue';
  import EmployeeSelectModal from '@/components/cac-components/employee-select-modal/index.vue';

  const props = defineProps({
    visible: { type: Boolean, default: false },
    defKey: { type: String, required: true },
    instId: { type: String },
    formSecretLevel: { type: Number, default: 0 },
  });
  const emits = defineEmits(['submit', 'update:visible']);

  interface BpmUser {
    id: string;
    name: string;
  }

  const defId = ref('');
  const startNodeOptions = ref<BpmStartNodeOption[]>([]);
  const processConfig = ref<BpmDefConfigRecord>();
  const allowSelectPath = ref(false);

  const startConfirm = ref(false);
  const fillOpinion = ref(false);
  const assignFlowUsers = ref(false);
  const startCalFlowusers = ref(false);
  const showRelInsts = ref(false);

  const initNodeExecutors = ref([]);

  // 执行人员的ref
  const taskExecutorsRef = ref();

  const formRef = ref();
  const formModel = ref<{ userNodes: any[]; opinion: string }>({
    userNodes: [],
    opinion: '',
  });
  const nodeUserValidator = (_node: any, callback: (error: string) => void) => {
    const invalidNode = formModel.value.userNodes.find((uNode) => {
      if (uNode.users.length === 0) {
        return true;
      }
      return false;
    });
    if (invalidNode) {
      callback('有节点未选择人员');
    }
  };
  const userNodeRule = ref<FieldRule>({ validator: nodeUserValidator });

  const loading = ref(false);

  const loadProcessConfig = async () => {
    try {
      const { data } = await getProcessonfigByDefKey(props.defKey);
      defId.value = data.data.defId;
      processConfig.value = data.data;
      startNodeOptions.value = data.data.startNodeOptions;
      initForm(data.data);
    } finally {
      // empty
    }
  };

  const listStartUserNodes = async (alias?: string) => {
    if (!alias) {
      return;
    }
    loading.value = true;
    try {
      const { data } = await getStartUserNodes(defId.value, alias);
      formModel.value.userNodes = data.map((elem: any) => {
        const { nodeId, name, users, singleExecutor } = elem;
        return {
          nodeId,
          nodeName: name,
          users: users.map((user: BpmUser) => {
            return { username: user.name, id: user.id };
          }),
          single: singleExecutor,
        };
      });
    } finally {
      loading.value = false;
    }
  };
  const listFlowNodesExecutors = async (alias?: string) => {
    if (!alias) {
      return;
    }
    const { data } = await getFlowNodesExecutors(defId.value, alias);
    initNodeExecutors.value = data.map((elem: any, index: number) => {
      return {
        ...elem,
        selected: index === 0,
      };
    });
  };

  // 人员对话框的ref
  const userSelectRef = ref<any>();
  // 正在选人的流程节点
  const selectingUserNode = ref();
  // 暂存选人数据
  const selectedUsers = ref<string[]>([]);
  const openSelectUserModal = (instNode: any) => {
    selectingUserNode.value = instNode;
    selectedUsers.value = instNode.users.map((elem: TagData) => elem.userCode);
    userSelectRef.value.openOrgEmployeeSelectModal();
  };
  const selectUser = (users: any[]) => {
    selectingUserNode.value.users = users;
  };
  const initForm = (config: BpmDefConfigRecord) => {
    const options = config.startNodeOptions;
    allowSelectPath.value = config.allowSelectPath;

    fillOpinion.value = options.includes('fillOpinion');
    // 执行下一步用户。
    assignFlowUsers.value = options.includes('assignFlowUsers');
    startCalFlowusers.value = options.includes('startCalFlowusers');
    showRelInsts.value = options.includes('relInsts');
    startConfirm.value = options.includes('startConfirm');

    let alias;
    if (config.startForm.formpc && config.startForm.formpc[0]) {
      alias = config.startForm.formpc[0].alias;
    } else if (config.globalForm.formpc && config.globalForm.formpc[0]) {
      alias = config.globalForm.formpc[0].alias;
    }
    if (assignFlowUsers.value) {
      listStartUserNodes(alias);
    }
    if (allowSelectPath.value) {
      listFlowNodesExecutors(alias);
    }
  };

  // 关联流程对话框的ref
  const taskSelectModalRef = ref();
  // 关联流程
  const relInsts = ref<string[]>([]);
  // 打开关联流程的对话框
  const openTaskSelectModal = () => {
    taskSelectModalRef.value.openTaskListSelectModal();
  };
  // 选择关联流程后回填。
  const submitTaskListModal = (chosenTask: any) => {
    relInsts.value = chosenTask;
  };

  // 节点人员选择
  const collectNodeUsers = () => {
    const nodeUserObj = {} as any;
    formModel.value.userNodes.forEach(async (node) => {
      const ids = node.users.map((user: BpmUser) => user.id);
      nodeUserObj[node.nodeId] = ids.join(',');
      //   Object.defineProperty(nodeUserObj, node.nodeId, { value: ids.join(',') });
    });
    return nodeUserObj;
  };

  // 即将流向
  const collectNodeExectors = () => {
    const destNodeId = taskExecutorsRef.value.getDestNodeId();
    const nodeExecutors = taskExecutorsRef.value.getNodeUserMap();
    return { destNodeId, nodeExecutors };
  };
  const valid = async () => {
    if (assignFlowUsers.value) {
      const errors = await formRef.value.validate();
      if (!errors) {
        submit();
      }
    } else {
      Message.error('配置错误，请刷新重试');
    }
  };
  const submit = () => {
    let reqdata = {
      nodeUserIds: JSON.stringify(collectNodeUsers()),
      relInsts: JSON.stringify(relInsts.value),
      opinion: formModel.value.opinion,
      opFiles: JSON.stringify([]),
    };
    if (allowSelectPath.value) {
      // 即将流向
      reqdata = {
        ...reqdata,
        ...collectNodeExectors(),
      };
    }
    emits('submit', reqdata);
    close();
  };
  const close = () => {
    formRef.value.resetFields();
    emits('update:visible');
  };

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        // 打开对话框加载初始数据
        loadProcessConfig();
      }
    }
  );
</script>

<style lang="less" scoped>
  .node-users {
    :deep(.arco-form-item-message) {
      margin-left: 20%;
    }
  }
</style>
