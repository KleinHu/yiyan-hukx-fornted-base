<!--created by yuyupeng-->
<!--2023/03/10-->
<!-- 人员选择对话框，所有需要选择人员的地方均可使用此组件-->
<template>
  <div>
    <a-modal
      :width="width"
      :title="title"
      title-align="start"
      :visible="visOfTaskListSelectModal"
      @ok="submitTaskListSelectModal"
      @cancel="closeTaskListSelectModal"
    >
      <a-tabs default-active-key="1">
        <a-tab-pane key="1" title="我的申请">
          <MyInstanceList ref="InstanceListRef" />
        </a-tab-pane>
        <a-tab-pane key="2" title="我的待办">
          <MyTask ref="MyTaskRef" />
        </a-tab-pane>
        <a-tab-pane key="3" title="我的已办">
          <MyApproved ref="MyApprovedRef" />
        </a-tab-pane>
        <a-tab-pane key="4" title="我收到的转发"> </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<!--新script-->
<script lang="ts" setup>
  import { ref, toRefs, defineExpose } from 'vue';
  import MyTask from './my-task.vue';
  import MyApproved from './my-approved.vue';
  import MyInstanceList from './my-instance-list.vue';

  const props = defineProps({
    width: { type: String, default: '1200px' }, // 对话框宽度
    title: { type: String, default: '关联流程' }, // 对话标题
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
        return {};
      },
    },
    cancelButtonProps: {
      type: Object,
      default: () => {
        return {};
      },
    },
    defaultSelectedUserCodeList: { type: Array, default: () => [] }, // 默认选中的人员工号列表，例如['199439']
  });
  const emits = defineEmits(['open', 'close', 'submit']);
  /**
   * data
   */
  const {
    width, // 对话框宽度
    title, // 对话标题
    // onlyChosenOneEmployee, // 是否只选择一个人员，如果true，则出现单选框，如果false，则出现复选框
    // okText, // 按钮文字
    // maskClosable, // 控制是否允许点击蒙层关闭弹窗
    // cancelText, // 按钮文字
    // submitWithClose, // 用于控制submit回调时，是否进行close操作
    // unmountOnClose, // 关闭时销毁 Modal 里的子元素
    // okLoading, // 确定按钮 loading
    // okButtonProps,
    // cancelButtonProps,
  } = toRefs(props); // 根据props创建多个 ref 对象
  const visOfTaskListSelectModal = ref<boolean>(false); // 控制用户对话框是否弹出
  const InstanceListRef = ref();
  const MyTaskRef = ref();
  const MyApprovedRef = ref();

  /**
   * @description 用户对话框打开触发
   * @param otherParams 其他参数
   */
  const openTaskListSelectModal = async () => {
    visOfTaskListSelectModal.value = true;
    emits('open');
  };
  /**
   * @description 用户对话框提交触发
   */
  const submitTaskListSelectModal = () => {
    const MyTaskKeys = MyTaskRef.value.getMyTaskKeys();
    const MyApprovedKeys = MyApprovedRef.value.getMyApprovedKeys();
    const MyInstanceListKeys = InstanceListRef.value.getMyInstanceListKeys();
    const selectKeys = [
      ...MyTaskKeys,
      ...MyApprovedKeys,
      ...MyInstanceListKeys,
    ];
    emits('submit', selectKeys);
    visOfTaskListSelectModal.value = false;
  };
  /**
   * @description 用户对话框关闭触发
   */
  const closeTaskListSelectModal = () => {
    visOfTaskListSelectModal.value = false;
    emits('close');
  };
  defineExpose({ openTaskListSelectModal, closeTaskListSelectModal }); // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
</script>

<style lang="less" scoped></style>
