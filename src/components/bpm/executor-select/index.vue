<template>
  <div class="bpm-executors">
    <!--编辑-->
    <EmployeeSelectModal
      ref="employeeSelectModalRef"
      :default-selected-user-data-list="params.data"
      :secret-level-filter="formSecretLevel"
      :only-chosen-one-employee="single"
      @submit="submitEmployeeSelectModal"
    />
    <!-- 多选-->
    <div v-if="!single">
      <div class="bpm-executors-checkbox-head">
        <div>
          <a-checkbox v-model="selectAll" @change="selectAllChange(selectAll)">
            全选
          </a-checkbox>
        </div>
        <div class="bpm-executors-checkbox-head-delt" @click="empty">
          <!-- <my-icon type="iconqingchu"></my-icon> -->
          清空
        </div>
      </div>
      <a-checkbox-group
        v-model="selectUsers"
        :options="userOptions"
        @change="selectChange"
      >
        <template #label="{ data }">
          {{ `${data.label}(${data.key})` }}
        </template>
      </a-checkbox-group>
      <a v-if="!readonly" class="select-user" @click="openUserDialog">
        <icon-plus />
        选择用户
      </a>
    </div>
    <!-- 单选-->
    <div v-else>
      <a-radio-group v-model="selectUser" :options="userOptions">
        <template #label="{ data }">
          {{ `${data.label}(${data.key})` }}
        </template>
      </a-radio-group>
      <a v-if="!readonly" class="select-user" @click="openUserDialog">
        <icon-plus />
        选择用户
      </a>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, toRefs, watch, PropType } from 'vue';
  import EmployeeSelectModal from '@/components/cac-components/employee-select-modal/index.vue';

  interface paramsItem {
    single?: boolean;
    showDimId?: boolean;
    groupId?: string;
    orgconfig?: string;
    groups?: any;
    dimId?: any;
    initRankLevel?: any;
    data?: any;
  }

  const props = defineProps({
    // executors
    value: { type: Array as PropType<any[]>, default: () => [] },
    filter: {
      type: Object,
      default: () => {
        return {};
      },
    },
    single: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    nodeChecked: { type: Boolean, default: true },
    formSecretLevel: { type: Number, default: 0 },
  });
  const emits = defineEmits(['update:value']);
  /**
   * data
   */
  const { value, filter, single, readonly } = toRefs(props); // 根据props创建多个 ref 对象
  const params = ref<paramsItem>({ single: single.value, showDimId: false });
  const userOptions = ref<any[]>([]);
  // 缓存初始化的候选人，在重新选择用户后使用缓存进行清空操作
  const cacheUsers = ref<any[]>([]);
  const selectUsers = ref<any[]>([]);
  const selectUser = ref<string>('');
  const selectAll = ref<boolean>(false);
  // const readOnly = ref<boolean>(false);
  const employeeSelectModalRef = ref<any>(); // 人员对话框的ref

  const initFilter = () => {
    if (!filter.value) {
      return;
    }
    if (filter.value.orgConfig === 'selOrg') {
      const groupId = JSON.parse(filter.value.group).value;
      params.value.orgconfig = 'selOrg';
      params.value.groupId = groupId;
    } else if (filter.value.orgConfig === 'curOrg') {
      params.value.orgconfig = 'curOrg';
      params.value.groupId = 'curOrg';
    } else if (filter.value.orgConfig === 'allOrg') {
      params.value.orgconfig = 'allOrg';
      if (!filter.value.dimId) {
        params.value.showDimId = true;
      }
      if (filter.value.groups) {
        params.value.groups = filter.value.groups;
      }
      params.value.dimId = filter.value.dimId;
      params.value.initRankLevel = filter.value.initRankLevel;
    }
  };

  const initUsers = () => {
    userOptions.value = [];
    selectUsers.value = [];
    selectAll.value = false;

    // 构建用户数组
    value.value.forEach((user: any) => {
      userOptions.value.push({
        label: user.name,
        key: user.account,
        value: user.id,
      });
    });
    cacheUsers.value = userOptions.value;
    // 默认选中
    if (value.value.length) {
      if (single.value) {
        selectUser.value = value.value[0].id;
      } else {
        value.value.forEach((user: any) => {
          selectUsers.value.push(user.id);
        });
        selectAll.value = true;
      }
    }
  };

  const init = () => {
    initFilter();
    initUsers();
    // readOnly.value = !nodeChecked.value || readonly.value;
  };
  init();

  const empty = () => {
    userOptions.value = [];
    selectUsers.value = [];
    selectAll.value = false;

    // prop.value因为绑定了v-model已经发生了变化，需要缓存初始值使用
    userOptions.value = cacheUsers.value;
    // 默认选中
    if (single.value) {
      selectUser.value = userOptions.value[0].value;
    } else {
      userOptions.value.forEach((user: any) => {
        selectUsers.value.push(user.value);
      });
      selectAll.value = true;
    }
  };

  const openUserDialog = () => {
    const inUsers = [];
    params.value = params.value ? params.value : {};
    if (single.value) {
      const user = userOptions.value.find(
        (item) => selectUser.value === item.value
      );
      if (user) {
        inUsers.push({
          id: user.value,
          username: user.label,
          userCode: user.key,
        });
      }
    } else {
      selectUsers.value.forEach((elem) => {
        const user = userOptions.value.find((item) => elem === item.value);
        if (user) {
          inUsers.push({
            id: user.value,
            username: user.label,
            userCode: user.key,
          });
        }
      });
    }
    params.value.data = inUsers;
    employeeSelectModalRef.value.openOrgEmployeeSelectModal();
  };

  const submitEmployeeSelectModal = (users: any) => {
    if (users.length === 0) {
      return;
    }
    if (single.value) {
      const [user] = users;
      const res = userOptions.value.find((item) => user.id === item.value);
      if (!res) {
        userOptions.value.push({
          label: user.username,
          key: user.userCode,
          value: user.id,
        });
      }
      selectUser.value = user.id;
    } else {
      const newselectUsers: any[] = [];
      users.forEach((user: any) => {
        newselectUsers.push(user.id);
        const res = userOptions.value.find((item) => user.id === item.value);
        if (!res) {
          userOptions.value.push({
            label: user.username,
            key: user.userCode,
            value: user.id,
          });
        }
      });
      selectUsers.value = newselectUsers;
    }
  };

  // 全选变化
  const selectAllChange = (newvalue: any) => {
    if (!newvalue) {
      selectUsers.value = [];
    } else {
      const nowselectUsers: any[] = [];
      userOptions.value.forEach((item) => {
        nowselectUsers.push(item.value);
      });
      selectUsers.value = nowselectUsers;
    }
  };

  // 多选变化
  const selectChange = (ary: any) => {
    if (ary.length === userOptions.value.length) {
      selectAll.value = true;
    } else {
      selectAll.value = false;
    }
  };

  const getSelectUser = () => {
    const executors = [];
    if (single.value) {
      const user = userOptions.value.find(
        (item) => selectUser.value === item.value
      );
      if (user) {
        executors.push({ id: user.value, name: user.label, type: 'user' });
      }
    } else {
      for (let i = 0; i < selectUsers.value.length; i += 1) {
        const user = userOptions.value.find(
          (item) => selectUsers.value[i] === item.value
        );
        if (user) {
          executors.push({ id: user.value, name: user.label, type: 'user' });
        }
      }
    }
    if (value.value !== executors) {
      emits('update:value', executors);
    }
  };
  watch(
    () => selectUsers,
    (val) => {
      if (val) {
        getSelectUser();
      }
    },
    { deep: true, immediate: true }
  );

  watch(
    () => selectUser,
    (val) => {
      if (val) {
        getSelectUser();
      }
    },
    { deep: true, immediate: true }
  );

  // watch(
  //   () => nodeChecked,
  //   (val) => {
  //     if (val) {
  //       readOnly.value = !val;
  //     }
  //   },
  //   { deep: true, immediate: true }
  // );
</script>

<style scoped>
  .bpm-executors-checkbox-head {
    display: flex;
    height: 30px;
    margin-bottom: 10px;
    line-height: 22px;
    border-bottom: solid 1px #c7c7c7;
  }

  .bpm-executors-checkbox-head > div:nth-child(1) {
    flex: 1;
  }

  .bpm-executors-checkbox-head-delt {
    color: #f94765;
    cursor: pointer;
  }

  .select-user {
    color: #1890ff;
    font-size: 14px;
    cursor: pointer;
  }
</style>
