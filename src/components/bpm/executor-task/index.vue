<template>
  <div class="bpm-task-executors">
    <a-spin :loading="loading" style="width: 100%">
      <table class="bpm-table">
        <tr>
          <th style="width: 200px">执行路径</th>
          <th>执行人</th>
        </tr>
        <!--一个节点 -->
        <tr v-if="nodeExecutors.length == 1">
          <td>{{ nodeExecutors[0].nodeName }}</td>
          <td>
            <div
              v-if="nodeExecutors[0].nodeType == 'UserTask'"
              class="bpm-task-executors-nodetype"
            >
              <!-- 用户  -->
              <div
                v-if="
                  nodeExecutors[0].users.length > 0 ||
                  (nodeExecutors[0].users.length == 0 &&
                    (!nodeExecutors[0].groups ||
                      nodeExecutors[0].groups.length == 0))
                "
                class="bpm-task-executors-tag"
              >
                <executor-select
                  v-model:value="nodeExecutors[0].users"
                  :filter="nodeExecutors[0].userFilter"
                  :single="nodeExecutors[0].single"
                  :readonly="isReadonly(nodeExecutors[0])"
                  :form-secret-level="formSecretLevel"
                ></executor-select>
              </div>
              <!-- 部门  -->
              <!-- <div v-else class="bpm-task-executors-tag">
              <rx-group-component
                v-model="nodeExecutors[0].groups"
                :filter="nodeExecutors[0].groupFilter"
                :single="singleExecutor"
                :readonly="!allowSelectGroup"
              ></rx-group-component>
            </div> -->
            </div>
            <!--   -->
            <div v-else>
              <div
                v-for="(subNodeExe, index) in nodeExecutors[0].outcomeNodeUsers"
                :key="index"
                class="bpm-task-executors-user"
              >
                <span>{{ subNodeExe.nodeName }}</span>
                <div
                  v-if="subNodeExe.nodeType == 'UserTask'"
                  class="bpm-task-executors-nodetype"
                >
                  <!-- 用户  -->
                  <div
                    v-if="
                      (subNodeExe.users || []).length > 0 ||
                      (subNodeExe.users?.length === 0 &&
                        (!subNodeExe.groups || subNodeExe.groups.length === 0))
                    "
                    class="bpm-task-executors-tag"
                  >
                    <executor-select
                      v-model:value="subNodeExe.users"
                      :filter="subNodeExe.userFilter"
                      :single="subNodeExe.single"
                      :readonly="isReadonly(subNodeExe)"
                      :form-secret-level="formSecretLevel"
                    ></executor-select>
                  </div>
                  <!-- 部门  -->
                  <!-- <div v-else class="bpm-task-executors-tag">
                  <rx-group-component
                    v-model="subNodeExe.groups"
                    :filter="subNodeExe.groupFilter"
                    :single="singleExecutor"
                    :readonly="!allowSelectGroup"
                  ></rx-group-component>
                </div> -->
                </div>
              </div>
            </div>
          </td>
        </tr>
        <!--多个节点-->
        <template v-else>
          <tr v-for="(node, idx) in nodeExecutors" :key="node.nodeId">
            <td>
              <span class="label">
                <a-radio
                  :model-value="modelValue"
                  :value="idx"
                  @change="onChange"
                >
                </a-radio>
              </span>
              <span>{{ node.nodeName }}</span>
            </td>
            <td>
              <div
                v-if="node.nodeType == 'UserTask'"
                class="bpm-task-executors-nodetype"
              >
                <!-- 用户  -->
                <div
                  v-if="
                    node.users.length > 0 ||
                    (node.users.length == 0 &&
                      (!node.groups || node.groups.length == 0))
                  "
                  class="bpm-task-executors-tag"
                >
                  <executor-select
                    v-model:value="node.users"
                    :filter="node.userFilter"
                    :single="node.single"
                    :readonly="isReadonly(node)"
                    :node-checked="node.selected"
                    :form-secret-level="formSecretLevel"
                  ></executor-select>
                </div>
                <!-- 部门  -->
                <!-- <div v-else class="bpm-task-executors-tag">
                <rx-group-component
                  v-model="node.groups"
                  :filter="node.groupFilter"
                  :single="singleExecutor"
                  :readonly="!allowSelectGroup"
                  :nodeChecked="node.selected"
                ></rx-group-component>
              </div> -->
              </div>
              <div v-else>
                <div
                  v-for="subNodeExe in node.outcomeNodeUsers"
                  :key="subNodeExe.nodeName"
                  class="bpm-task-executors-user"
                >
                  <span>{{ subNodeExe.nodeName }}</span>
                  <div
                    v-if="subNodeExe.nodeType == 'UserTask'"
                    class="bpm-task-executors-nodetype"
                  >
                    <!-- 用户  -->
                    <div
                      v-if="
                        subNodeExe.users.length > 0 ||
                        (subNodeExe.users.length == 0 &&
                          (!subNodeExe.groups || subNodeExe.groups.length == 0))
                      "
                      class="bpm-task-executors-tag"
                    >
                      <executor-select
                        v-model:value="subNodeExe.users"
                        :filter="subNodeExe.userFilter"
                        :single="subNodeExe.single"
                        :readonly="isReadonly(subNodeExe)"
                        :node-checked="node.selected"
                        :form-secret-level="formSecretLevel"
                      ></executor-select>
                    </div>
                    <!-- 部门  -->
                    <!-- <div v-else class="bpm-task-executors-tag">
                    <rx-group-component
                      v-model="subNodeExe.groups"
                      :filter="subNodeExe.groupFilter"
                      :single="singleExecutor"
                      :readonly="!allowSelectGroup"
                      :nodeChecked="node.selected"
                    ></rx-group-component>
                  </div> -->
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </template>
      </table>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import {
    ref,
    toRefs,
    // watch,
    // PropType
  } from 'vue';
  import { getTaskFlowNodesExecutors } from '@/api/bpm/bpm-task';
  import { filterUserRecordList, transUserFromeRoles } from '@/api/system/user';
  import ExecutorSelect from '../executor-select/index.vue';

  interface oItem {
    executors?: any;
    users?: any;
    groups?: any;
    nodeType?: any;
    outcomeNodeUsers?: any;
  }

  const props = defineProps({
    // nodeExecutors: { type: Array as PropType<any[]>, default: () => [] },
    taskConfig: {
      type: Object,
      default: () => {
        return {};
      },
    },
    processConfig: {
      type: Object,
      default: () => {
        return {};
      },
    },
    // 用于人员查询
    formJson: { type: String, default: '' },
    formSecretLevel: { type: Number, default: 0 },
    taskId: { type: String, default: '' },
    systemHand: { type: Boolean },
    allowSelectExecutor: { type: Boolean, default: false },
    allowSelectGroup: { type: Boolean, default: false },
  });
  const {
    // nodeExecutors,
    taskId,
    systemHand,
    taskConfig,
    processConfig,
    allowSelectExecutor,
    // allowSelectGroup,
  } = toRefs(props); // 根据props创建多个 ref 对象
  const singleExecutor = ref<boolean>(false);
  const modelValue = ref<any>();

  const nodeExecutors = ref<any>([]);
  const loading = ref(false);
  const initUser = async (checkType?: string, formJson?: string) => {
    loading.value = true;
    const { data } = await getTaskFlowNodesExecutors({
      taskId: taskId.value,
      checkType: checkType || 'AGREE',
      formData: JSON.parse(formJson || props.formJson),
      systemHand: systemHand.value,
    });
    loading.value = false;
    nodeExecutors.value = data;
    convertLocal();
  };

  // 可以主动触发查询
  const loadNodeExecutors = (checkType?: string, formJson?: string) => {
    initUser(checkType, formJson);
  };

  const onChange = (e: any) => {
    const len = nodeExecutors.value.length;
    modelValue.value = e;
    for (let i = 0; i < len; i += 1) {
      const obj = nodeExecutors.value[i];
      const val = e;
      obj.selected = val === i;
    }
  };

  const convertToLocalExecutors = async (o: oItem) => {
    let users: any[] = [];
    let groups: any[] = [];
    const { executors } = o;
    users = executors.filter((elem: any) => elem.type === 'user');
    groups = executors.filter((elem: any) => elem.type !== 'user');

    // 将group的人员转换为user人员
    if (groups.length > 0) {
      const groupIds = groups.map((elem) => elem.id);
      const { data } = await transUserFromeRoles(groupIds.join(','));
      const groupUsers = data.filter(
        (elem: any) => !users.find((user) => user.id === elem.id)
      );
      const formatUsers = groupUsers.map((elem: any) => {
        const { id, userCode, username } = elem;
        return {
          type: 'user',
          id,
          account: userCode,
          name: username,
        };
      });
      users = [...users, ...formatUsers];
    }

    // 根据表单密级筛选人员
    const codes = users
      .filter((elem) => elem.type === 'user')
      .map((elem) => elem.account);
    if (
      codes.length > 0 &&
      props.formSecretLevel &&
      props.formSecretLevel > 0
    ) {
      let legalUsers = users;
      try {
        const { data } = await filterUserRecordList({
          userCodes: codes.join(','),
          secretLevel: props.formSecretLevel,
        });
        legalUsers = legalUsers.filter((elem) =>
          data.find((code: any) => elem.account === code)
        );
      } finally {
        users = legalUsers;
      }
    }

    o.users = users;
    // groups被展开为users了所以清除它的值
    // o.groups = groups;
    o.groups = [];
  };

  const convertLocalRow = (o: oItem) => {
    if (o.nodeType === 'UserTask') {
      convertToLocalExecutors(o);
    } else if (
      o.nodeType.indexOf('Gateway') ||
      o.nodeType.indexOf('SubProcess')
    ) {
      const rows = o.outcomeNodeUsers;
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        convertToLocalExecutors(row);
      }
    }
  };

  const convertLocal = () => {
    if (nodeExecutors.value) {
      if (modelValue.value === undefined) {
        modelValue.value = 0;
      }
      (nodeExecutors.value || []).forEach((o: any, index: number) => {
        if (o.selected === undefined) {
          o.selected = index === 0;
        }
        convertLocalRow(o);
      });
    }
    // 允许选择执行人 获取是否只允许单选
    if (allowSelectExecutor.value) {
      let rtn = false;
      if (
        taskConfig.value &&
        taskConfig.value.switchOptions &&
        taskConfig.value.switchOptions.includes('singleExecutor')
      ) {
        rtn = true;
      } else if (
        processConfig.value &&
        processConfig.value.switchOptions &&
        processConfig.value.switchOptions.includes('singleExecutor')
      ) {
        rtn = true;
      }
      singleExecutor.value = rtn;
    }
  };

  const convertUsers = (o: any) => {
    delete o.executors;
    const executors: any[] = [];

    if (o.users) {
      for (let i = 0; i < o.users.length; i += 1) {
        const user = o.users[i];
        user.type = 'user';
        executors.push(user);
      }
    }

    if (o.groups) {
      for (let i = 0; i < o.groups.length; i += 1) {
        const group = o.groups[i];
        group.type = 'group';
        executors.push(group);
      }
    }

    o.executors = executors;
  };
  const convertData = () => {
    for (let i = 0; i < nodeExecutors.value.length; i += 1) {
      const o = nodeExecutors.value[i];
      if (o.nodeType === 'UserTask') {
        convertUsers(o);
      } else if (
        o.nodeType.indexOf('Gateway') !== -1 ||
        o.nodeType.indexOf('SubProcess') !== -1
      ) {
        const rows = o.outcomeNodeUsers;
        for (let j = 0; j < rows.length; j += 1) {
          const row = rows[j];
          if (row.nodeType === 'UserTask') {
            convertUsers(row);
          }
        }
      }
    }
  };

  const getDestNodeId = () => {
    if (nodeExecutors.value.length === 1) {
      if (
        taskConfig.value &&
        taskConfig.value.nextHandMode &&
        taskConfig.value.nextHandMode === 'condition'
      ) {
        return nodeExecutors.value[0].nodeId;
      }
      return '';
    }
    let nodeId = '';
    nodeExecutors.value.forEach((item: any) => {
      if (item.selected) {
        nodeId = item.nodeId;
      }
    });
    return nodeId;
  };

  const getNodeUserMap = () => {
    convertData();
    const nodeUserMap: any = {};
    nodeExecutors.value.forEach((item: any) => {
      if (
        item.nodeType === 'UserTask' &&
        item.executors &&
        item.executors.length > 0
      ) {
        nodeUserMap[item.nodeId] = item.executors;
      }
      if (item.outcomeNodeUsers && item.outcomeNodeUsers.length > 0) {
        for (let i = 0; i < item.outcomeNodeUsers.length; i += 1) {
          const obj = item.outcomeNodeUsers[i];
          if (
            obj.nodeType === 'UserTask' &&
            obj.executors &&
            obj.executors.length > 0
          ) {
            nodeUserMap[obj.nodeId] = obj.executors;
          }
        }
      }
    });
    return nodeUserMap;
  };

  // 不允许选择执行人
  const isReadonly = (node: any) => {
    return !node.allowSelectExecutor || node.multipleType === 'batch';
  };

  // watch(
  //   () => nodeExecutors.value,
  //   (val) => {
  //     if (val) {
  //       // console.log('changenodeExecutors');
  //       convertLocal();
  //     }
  //   },
  //   { deep: true, immediate: true }
  // );
  defineExpose({ getNodeUserMap, getDestNodeId, loadNodeExecutors }); // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
</script>

<style scoped>
  .bpm-task-executors .bpm-table {
    width: 100%;
    background-color: #fff;
    border: 1px solid #d9d9d9;
    border-bottom: none;
  }

  .bpm-task-executors .bpm-table th,
  td {
    height: 38px;
    padding: 10px;
    color: #444;
    font-weight: normal;
    font-size: 14px;
    background-color: #f8f8f8;
    border-right: 1px solid #d9d9d9;

    /* border-radius: 4px 4px 0px 0px; */
    border-bottom: 1px solid #d9d9d9;
  }

  .bpm-task-executors .bpm-table th:last-child {
    border-right: none;
  }

  .bpm-task-executors .bpm-table td {
    color: #46494d;
    background-color: white;
    border-right: 1px solid #d9d9d9;
  }
</style>
