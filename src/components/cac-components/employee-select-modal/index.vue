<!--created by yuyupeng-->
<!--2023/03/10-->
<!-- 人员选择对话框，所有需要选择人员的地方均可使用此组件-->
<template>
  <div>
    <a-modal
      :width="width"
      :title="title"
      title-align="start"
      :visible="visOfOrgEmployeeSelectModal"
      :mask-closable="maskClosable"
      :unmount-on-close="unmountOnClose"
      :ok-button-props="okButtonProps"
      :cancel-button-props="cancelButtonProps"
      @ok="submitOrgEmployeeSelectModal"
      @cancel="closeOrgEmployeeSelectModal"
    >
      <a-tabs default-active-key="1">
        <a-tab-pane key="1">
          <template #title> <icon-user-group /> 从组织架构选择 </template>
          <search-user
            ref="searchUserRef"
            :only-chosen-one-employee="onlyChosenOneEmployee"
            :secret-level-filter="secretLevelFilter"
            :default-selected-user-data-list="defaultSelectedUserDataList"
          />
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<!--新script-->
<script lang="ts" setup>
  import { ref, toRefs, PropType } from 'vue';
  import { UserRecord } from '@/api/system/model/userModel';
  import SearchUser from './components/search-user.vue';

  const props = defineProps({
    width: { type: String, default: '1500px' }, // 对话框宽度
    title: { type: String, default: '用户对话框' }, // 对话标题
    okText: { type: String, default: '提交' }, // 按钮文字
    onlyChosenOneEmployee: { type: Boolean, default: false }, // 是否只选择一个人员，如果true，则出现单选框，如果false，则出现复选框
    maskClosable: { type: Boolean, default: false }, // 控制是否允许点击蒙层关闭弹窗
    // cancelText: { type: String, default: '取消' }, // 按钮文字
    submitWithClose: { type: Boolean, default: true }, // 用于控制submit回调时，是否进行close操作
    unmountOnClose: { type: Boolean, default: true }, // 关闭时销毁 Modal 里的子元素
    // okLoading: { type: Boolean, default: false }, // 确定按钮 loading
    okButtonProps: {
      type: Object,
      default: () => {
        // empty
      },
    },
    cancelButtonProps: {
      type: Object,
      default: () => {
        // empty
      },
    },
    defaultSelectedUserDataList: {
      type: Array as PropType<UserRecord[]>,
      default: () => [],
    }, // 默认选中的人员节点列表，例如[{id: '199439', userName: 'Mickey', userCode: '199439' }]
    secretLevelFilter: { type: Number, default: 0 },
  });
  const emits = defineEmits(['open', 'close', 'submit']);
  /**
   * data
   */
  const {
    width, // 对话框宽度
    title, // 对话标题
    onlyChosenOneEmployee, // 是否只选择一个人员，如果true，则出现单选框，如果false，则出现复选框
    // okText, // 按钮文字
    maskClosable, // 控制是否允许点击蒙层关闭弹窗
    // cancelText, // 按钮文字
    // submitWithClose, // 用于控制submit回调时，是否进行close操作
    unmountOnClose, // 关闭时销毁 Modal 里的子元素
    // okLoading, // 确定按钮 loading
    okButtonProps,
    cancelButtonProps,
    defaultSelectedUserDataList, // 默认选中的人员节点列表，例如[{id: '199439', userName: 'Mickey', userCode: '199439' }]
  } = toRefs(props); // 根据props创建多个 ref 对象
  const visOfOrgEmployeeSelectModal = ref<boolean>(false); // 控制用户对话框是否弹出
  const otherParamsList = ref<any[]>([]); // 其他附加参数
  /**
   * @description 用户对话框提交触发
   */
  const submitOrgEmployeeSelectModal = () => {
    emits(
      'submit',
      searchUserRef.value.getChosenEmployeeList(),
      otherParamsList.value
    ); // submit回调返回选中的人员信息和其他参数
    visOfOrgEmployeeSelectModal.value = false;
  };
  /**
   * @description 用户对话框打开触发
   * @param otherParams 其他参数
   */
  const openOrgEmployeeSelectModal = async (otherParams = []) => {
    visOfOrgEmployeeSelectModal.value = true;
    otherParamsList.value = otherParams;
    emits('open');
  };
  /**
   * @description 用户对话框关闭触发
   */
  const closeOrgEmployeeSelectModal = () => {
    visOfOrgEmployeeSelectModal.value = false;
    emits('close');
  };
  const searchUserRef = ref<any>();
  defineExpose({ openOrgEmployeeSelectModal, closeOrgEmployeeSelectModal }); // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
</script>
