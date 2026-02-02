<!--created by yuyupeng-->
<!--2024/07/25-->
<!-- 角色选择对话框-->
<template>
  <div>
    <a-modal
      :width="width"
      :title="title"
      title-align="start"
      :visible="visOfRoleSelectModal"
      :mask-closable="maskClosable"
      :unmount-on-close="unmountOnClose"
      :ok-button-props="okButtonProps"
      :cancel-button-props="cancelButtonProps"
      @ok="submitRoleSelectModal"
      @cancel="closeRoleSelectModal"
    >
      <splitpanes class="default-theme">
        <pane min-size="25" size="25">
          <a-card class="general-card">
            <a-scrollbar style="height: calc(80vh - 180px); overflow: auto">
              <a-skeleton v-if="loading" animation>
                <!-- 还在加载的时候用骨架屏先占个位子，好看点 -->
                <a-skeleton-line :rows="10" />
              </a-skeleton>
              <div v-else>
                <a-input-search
                  v-model="searchKey"
                  style="margin-bottom: 5px"
                  placeholder="请输入角色名称"
                  @input="searchTreeData"
                />
                <!-- 多选模式 -->
                <a-checkbox-group
                  v-if="onlyChosenOneRole === false"
                  v-model:model-value="selectedRoleIds"
                  direction="vertical"
                  @change="changeCheckbox"
                >
                  <a-checkbox
                    v-for="item in roleListFilter"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }}
                  </a-checkbox>
                </a-checkbox-group>
                <!-- 单选模式 -->
                <a-radio-group
                  v-if="onlyChosenOneRole === true"
                  v-model:model-value="selectedRoleIds[0]"
                  direction="vertical"
                  @change="changeRadio"
                >
                  <a-radio
                    v-for="item in roleListFilter"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }}
                  </a-radio>
                </a-radio-group>
              </div>
            </a-scrollbar>
          </a-card>
        </pane>
        <pane min-size="50" size="75">
          <a-card title="选中的角色" class="general-card">
            <template #title>
              选中的角色({{ checkedNodeData.length }})
            </template>
            <template #extra>
              <a-popover content="清空">
                <icon-delete @click="removeChosenRoleAll" />
              </a-popover>
            </template>
            <a-scrollbar style="height: calc(80vh - 180px); overflow: auto">
              <a-row>
                <template v-for="item in checkedNodeData" :key="item.id">
                  <div style="display: inline-block; padding: 20px">
                    <a-badge>
                      <template #content>
                        <icon-close-circle
                          style="color: red"
                          @click="removeChosenRole(item)"
                        />
                      </template>
                      <a-tag color="blue">{{ item.name }}</a-tag>
                    </a-badge>
                  </div>
                </template>
              </a-row>
            </a-scrollbar>
          </a-card>
        </pane>
      </splitpanes>
    </a-modal>
  </div>
</template>

<!--新script-->
<script lang="ts" setup>
  import { Notification } from '@arco-design/web-vue';
  import { ref, onMounted, defineExpose, toRefs } from 'vue';
  import { Splitpanes, Pane } from 'splitpanes';
  import 'splitpanes/dist/splitpanes.css';
  import { RoleRecord } from '@/api/system/model/roleModel';
  import { queryRoleRecordList } from '@/api/system/role';

  const props = defineProps({
    width: { type: String, default: '1200px' }, // 对话框宽度
    title: { type: String, default: '角色对话框' }, // 对话标题
    okText: { type: String, default: '提交' }, // 按钮文字
    required: { type: Boolean, default: false }, // 是否至少选一个角色
    onlyChosenOneRole: { type: Boolean, default: false }, // 是否只选择一个角色，如果true，则出现单选框，如果false，则出现复选框
    maskClosable: { type: Boolean, default: false }, // 控制是否允许点击蒙层关闭弹窗
    // cancelText: { type: String, default: '取消' }, // 按钮文字
    submitWithClose: { type: Boolean, default: true }, // 用于控制submit回调时，是否进行close操作
    unmountOnClose: { type: Boolean, default: true }, // 关闭时销毁 Modal 里的子元素
    // okLoading: { type: Boolean, default: false }, // 确定按钮 loading
    okButtonProps: { type: Object, default: () => {} },
    cancelButtonProps: { type: Object, default: () => {} },
    defaultCheckedRoleList: { type: Array, default: () => [] }, // 默认选中的角色节点列表，例如[{id: 1, name: '角色1'}]
  });
  const emits = defineEmits(['open', 'close', 'submit']);
  /**
   * data
   */
  const {
    width, // 对话框宽度
    title, // 对话标题
    // okText, // 按钮文字
    maskClosable, // 控制是否允许点击蒙层关闭弹窗
    // cancelText, // 按钮文字
    // submitWithClose, // 用于控制submit回调时，是否进行close操作
    onlyChosenOneRole, // 是否只选择一个角色，如果true，则单选，如果false，则出现复选框
    unmountOnClose, // 关闭时销毁 Modal 里的子元素
    // okLoading, // 确定按钮 loading
    okButtonProps,
    cancelButtonProps,
    defaultCheckedRoleList, // 默认选中的角色节点列表，例如[{id: '1', name: '角色1‘}]
  } = toRefs(props); // 根据props创建多个 ref 对象
  // const authList = ref<string[]>([]);
  const searchKey = ref<string>(); // 搜索框关键字
  const visOfRoleSelectModal = ref<boolean>(false); // 控制角色对话框是否弹出
  const loading = ref<boolean>(false); // 指示是否正在加载中
  const checkedNodeData = ref<any[]>([]); // 选中的角色节点数据
  const selectedRoleIds = ref<string[]>([]); // 选中的角色id数组
  const roleList = ref<RoleRecord[]>([]); // 角色列表
  const roleListFilter = ref<RoleRecord[]>([]); // 过滤后的角色列表
  /**
   * @description 获取角色数据源
   */
  const getRoleList = async () => {
    loading.value = true;
    try {
      const { data } = await queryRoleRecordList({});
      roleList.value = data;
      roleListFilter.value = data;
    } finally {
      loading.value = false;
    }
  };
  /**
   * @description 搜索框发生改变会触发此函数
   * @param value
   */
  const searchTreeData = (val: any) => {
    roleListFilter.value = roleList.value.filter((e) => {
      if (e.name) {
        return e.name.indexOf(val) > -1;
      }
      return false;
    });
  };
  /**
   * @description 角色对话框提交触发
   */
  const submitRoleSelectModal = () => {
    if (props.required === true && checkedNodeData.value.length === 0) {
      Notification.warning({
        content: '至少要选1个角色！',
        closable: true,
        duration: 1000,
      });
    } else {
      emits('submit', checkedNodeData.value); // submit回调返回选中的角色信息和其他参数
      visOfRoleSelectModal.value = false;
    }
  };
  /**
   * @description 角色对话框打开触发
   * @param otherParams 其他参数
   */
  const openRoleSelectModal = async () => {
    // 每次打开角色对话框时都做一系列的重置操作
    resetRoleSelectModal();
    await getRoleList();
    visOfRoleSelectModal.value = true;
    if (defaultCheckedRoleList.value.length !== 0) {
      // 如果有默认选中的需求
      checkedNodeData.value = defaultCheckedRoleList.value;
      const defaultCheckedNodeKeys = [] as string[];
      defaultCheckedRoleList.value.forEach((item: any) => {
        defaultCheckedNodeKeys.push(item.id);
      });
      if (onlyChosenOneRole?.value === true) {
        // 单选模式
        selectedRoleIds.value = defaultCheckedNodeKeys;
      } else {
        // 多选模式
        selectedRoleIds.value = defaultCheckedNodeKeys;
      }
    }
    emits('open');
  };
  /**
   * @description 角色对话框关闭触发
   */
  const closeRoleSelectModal = () => {
    visOfRoleSelectModal.value = false;
    emits('close');
  };
  /**
   * @description 移除已选中的角色
   * @param item 点击的角色item
   */
  const removeChosenRole = (item: any) => {
    selectedRoleIds.value = selectedRoleIds.value.filter((e) => e !== item.id);
    checkedNodeData.value = checkedNodeData.value.filter(
      (e) => e.id !== item.id
    );
  };
  /**
   * @description 清空所有已选中的角色
   */
  const removeChosenRoleAll = () => {
    selectedRoleIds.value = [];
    checkedNodeData.value = [];
  };
  /**
   * @description 一系列的重置操作
   */
  const resetRoleSelectModal = () => {
    defaultCheckedRoleList.value = [];
    searchKey.value = undefined;
    selectedRoleIds.value = [];
    removeChosenRoleAll();
  };
  /**
   * @description 复选框勾选变化触发
   */
  const changeCheckbox = (ids: (string | number | boolean)[]) => {
    checkedNodeData.value = [];
    ids.forEach((id) => {
      checkedNodeData.value.push(roleList.value.filter((e) => e.id === id)[0]);
    });
  };
  /**
   * @description 单选框勾选变化触发
   */
  const changeRadio = (id: string | number | boolean) => {
    checkedNodeData.value = [];
    checkedNodeData.value.push(roleList.value.filter((e) => e.id === id)[0]);
  };
  /**
   * onMounted
   */
  onMounted(() => {});
  defineExpose({ openRoleSelectModal, closeRoleSelectModal }); // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
</script>
