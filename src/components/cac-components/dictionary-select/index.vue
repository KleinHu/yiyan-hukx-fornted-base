<!--created by yuyupeng-->
<!--2023/03/23-->
<!-- 数据字典-->
<template>
  <span>
    <a-select
      v-model="selected"
      :multiple="mode === 'multiple'"
      :allow-clear="allowClear"
      :allow-search="allowSearch"
      :disabled="disabled"
      :options="list"
      :style="styles"
      :placeholder="placeholder"
      :loading="loading"
      @change="triggerChange"
    />
  </span>
</template>

<script lang="ts" setup>
  import { DictDataRecord } from '@/api/system/model/dictDataModel';
  import { queryDictDataRecordList } from '@/api/system/dictionary';
  import { ref, onMounted, toRefs, watch } from 'vue';
  import { Notification } from '@arco-design/web-vue';

  const props = defineProps({
    initValue: { type: String, default: undefined },
    dictType: { required: true, type: String },
    mode: { default: 'default', type: String },
    disabled: { default: false, type: Boolean },
    placeholder: { default: '请选择', type: String },
    styles: { default: '', type: String },
    allowClear: { required: true, type: Boolean },
    allowSearch: { required: true, type: Boolean },
  });
  const emits = defineEmits(['update:modelValue', 'change']);

  /**
   * data
   */
  const {
    initValue,
    dictType,
    mode,
    disabled,
    placeholder,
    styles,
    allowClear,
    allowSearch,
  } = toRefs(props); // 根据props创建多个 ref 对象
  const list = ref<any[]>([]); // select组件options数据源

  // 绑定v-model
  const selected = ref<any>(initValue?.value || '');
  const loading = ref<boolean>(false);
  /**
   * fun
   */
  /**
   * @method
   * @description 获取数据字典详情下拉框
   */
  const getDictDataRecordList = async () => {
    const params: DictDataRecord = {
      dictType: dictType.value,
    };
    loading.value = true;
    try {
      const { data } = await queryDictDataRecordList(params);
      list.value = data;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Notification.error({
        content: `出现异常！${error}`,
        closable: true,
      });
    } finally {
      loading.value = false;
    }
  };
  const triggerChange = (changedValue: any) => {
    const listtar = [...list.value];
    // 后端定义好后，传后端所需要的值到表单中
    if (mode.value !== 'default') {
      const data: any = [];
      changedValue.forEach((element: any) => {
        const res = listtar.filter((item) => element === item.value)[0];
        data.push({
          label: res.label,
          value: res.value,
        });
      });
      // 触发change事件，使得组件数据可以被上层form表单接收
      emits('change', data);
    } else {
      const res = listtar.filter((item) => changedValue === item.value)[0];
      if (res !== null && res !== undefined) {
        emits('change', {
          label: res.label,
          value: res.value,
        });
      } else {
        emits('change', {
          label: '',
          value: '',
        });
      }
    }
  };
  /**
   * onMounted
   */
  onMounted(() => {
    getDictDataRecordList();
  });
  /**
   * watch
   */
  watch(
    () => initValue,
    (val) => {
      if (val) {
        // 给initValue添加一个监听，否则会渲染不及时
        selected.value = val.value;
      }
    },
    { deep: true, immediate: true }
  );
</script>
