<!-- 对话框表单组件 （参考宇婷的AdvancedDrawer组件）-->
<!--created by ljx-->
<!--2021/12/09-->
<!-- 功能（思路）：
  底层使用FormByLjx组件：对话框相关配置+表单配置项items，生成相应表单对话框；
-->
<!--updated by ljx-->
<!--2022/04/10-->
<!--同步FormByLjx组件新增属性及功能，包括labelTextBold、layout、labelCol和wrapperCol表单参数-->
<!--updated by ljx-->
<!--2022/04/24-->
<!-- 新增submitWithClose配置项：控制提交是否关闭对话框 -->
<!-- 新增unmountOnClose配置项：控制关闭时是否销毁 Modal 里的子元素 -->
<!-- FormByLjx组件新增colon属性配置项 -->
<!--updated by ljx-->
<!--2022/04/26-->
<!-- 新增okLoading属性配置项 -->
<!--updated by ljx-->
<!--2022/05/04-->
<!-- 增加插槽内容，修复other配置项不生效的BUG -->
<!--updated by ljx-->
<!--2022/06/30-->
<!-- setValues函数简化 -->
<!--upated by yuyupeng-->
<!--2023/02/23-->
<!-- 原通途项目中崛雄哥写的的FormModalByLjx组件迁移到易研项目中，适配Arco Design、Vue3和TypeScript-->
<template>
  <div>
    <a-modal
      :width="width"
      :title="title"
      :ok-text="okText"
      :visible="visOfModal"
      :unmount-on-close="unmountOnClose"
      :mask-closable="maskClosable"
      :ok-loading="okLoading"
      :ok-button-props="okButtonProps"
      :cancel-button-props="cancelButtonProps"
      :render-to-body="renderToBody"
      :popup-container="popupContainer"
      :fullscreen="fullscreen"
      @ok="submit"
      @cancel="close"
    >
      <AdvancedForm
        ref="formInModal"
        :items="items"
        :initial-values="initialValues"
        :editable="editable"
        :rules="rules"
        :label-text-bold="labelTextBold"
        :layout="layout"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        :colon="colon"
        @change="onchange"
      >
        <!-- 对other配置项设置插槽，便于渲染父组件的相关内容 -->
        <template v-for="item in items" #[item.fieldName]
          ><slot
            v-if="item.type === 'other' || !item.type"
            :name="item.fieldName"
        /></template>
      </AdvancedForm>
    </a-modal>
  </div>
</template>

<!--新script-->
<script lang="ts" setup>
  import AdvancedForm from '@/components/cac-components/advanced-form/index.vue';
  import { ref, nextTick, toRefs, defineExpose } from 'vue';
  import type { PropType } from 'vue';

  const props = defineProps({
    width: { type: String, default: '800px' }, // 对话框宽度
    title: { type: String, default: '新增' }, // 对话标题
    okText: { type: String, default: '提交' }, // 按钮文字
    maskClosable: { type: Boolean, default: true }, // 控制是否允许点击蒙层关闭弹窗
    // cancelText: { type: String, default: '取消' }, // 按钮文字
    items: { type: Array<any>, default: () => [] }, // 表单项配置
    initialValues: { type: Object, default: () => undefined }, // 表单值初值
    rules: { type: Object, default: () => {} }, // 表单校验配置项
    editable: { type: Boolean, default: true }, // 表单可编辑状态
    labelTextBold: { type: Boolean, default: false }, // 表单项标签是否加粗
    layout: {
      type: [String, undefined] as PropType<
        'vertical' | 'inline' | 'horizontal' | undefined
      >,
      default: () => 'vertical',
    },
    labelCol: {
      type: Object,
      default: () => {
        return { span: 8 };
      },
    }, // 表单项总长划分24份，标签占比labelCol份
    wrapperCol: {
      type: Object,
      default: () => {
        return { span: 16 };
      },
    }, // 表单项总长划分24份，内容占比wrapperCol份
    colon: { type: Boolean, default: false }, // 表单项标题是否带冒号
    submitWithClose: { type: Boolean, default: true }, // 用于控制submit回调时，是否进行close操作
    unmountOnClose: { type: Boolean, default: true }, // 关闭时销毁 Modal 里的子元素
    okLoading: { type: Boolean, default: false }, // 确定按钮 loading
    okButtonProps: { type: Object, default: () => {} },
    cancelButtonProps: { type: Object, default: () => {} },
    fullscreen: { type: Boolean, default: false },
    renderToBody: { type: Boolean, default: true },
    popupContainer: {
      type: [String, HTMLElement],
      default: 'body',
    },
  });
  const emits = defineEmits(['change', 'ok', 'cancel']);
  /**
   * data
   */
  const {
    width, // 对话框宽度
    title, // 对话标题
    okText, // 按钮文字
    // cancelText, // 按钮文字
    items, // 表单项配置
    initialValues, // 表单值初值
    editable, // 表单可编辑状态
    labelTextBold, // 表单项标签是否加粗
    layout, // 布局参数：vertical || horizontal
    labelCol, // 表单项总长划分24份，标签占比labelCol份
    wrapperCol, // 表单项总长划分24份，内容占比wrapperCol份
    colon, // 表单项标题是否带冒号
    submitWithClose, // 用于控制submit回调时，是否进行close操作
    unmountOnClose, // 关闭时销毁 Modal 里的子元素
    okLoading, // 确定按钮 loading
    okButtonProps,
    cancelButtonProps,
  } = toRefs(props); // 根据props创建多个 ref 对象
  const visOfModal = ref<boolean>(false); // 控制对话框显示
  const formInModal = ref<any>();
  /**
   * fun
   */
  /**
   * @description 给表单设置指定值
   * @param values
   */
  const setValues = (values: any) => {
    // 应传入Json数据(例如:{xx:'a',yy:'b'})，遍历表单项，进行填充
    // console.log('values--', values)
    // console.log('this.$refs.formInModal--', this.$refs.formInModal)
    formInModal.value.setFormValues(values);
  };
  /**
   * @description 打开对话；若传入表单初值，则进行赋值；
   * @param formData
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const open = (formData = {}) => {
    visOfModal.value = true;
    nextTick(() => {
      if (Object.keys(formData).length !== 0) {
        setValues(formData);
      }
    });
  };
  /**
   * @description 表单发生改变
   * @param value
   * @param name
   */
  const onchange = (name: string, value: any) => {
    // 表单变化回调函数
    /* if (value === '') {
      // 针对【文本框】点击x清空时，设置焦点
      this.$refs[fieldName][0].focus();
    } */
    emits('change', name, value);
  };
  const close = () => {
    // 关闭，透出cancel事件
    visOfModal.value = false;
    emits('cancel');
  };
  const submit = () => {
    // 提交表单，透出ok事件
    // console.log('submit()----')
    formInModal.value.formObject.validate((errors: any) => {
      if (!errors) {
        // 校验成功
        // console.log(formInModal.value.form);
        emits('ok', formInModal.value.form);
        if (submitWithClose.value) close();
      }
    });
  };
  defineExpose({ open, setValues, close }); // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
</script>
