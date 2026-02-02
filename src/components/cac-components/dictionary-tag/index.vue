<!-- 数据字典显示标签组件 -->
<!--created by yuyupeng-->
<!--2023/03/23-->
<!--
由于数据字典的值通常为英文，需要有个通用组件根据数据字典的value转成label，方便页面展示
-->
<template>
  <a-tag
    v-if="showTag"
    :color="tagColor ? tagColor : tagColorArr[dictSort % tagColorArr.length]"
  >
    {{ dictLabel }}
  </a-tag>
</template>

<!--新script-->
<script lang="ts" setup>
  import { DictDataParamsSort } from '@/api/system/model/dictDataModel';
  import { queryDictDataRecordList } from '@/api/system/dictionary';
  import { ref, onMounted, toRefs } from 'vue';
  import { Notification } from '@arco-design/web-vue';

  const props = defineProps({
    tagColor: {
      // 标签颜色
      type: String,
    },
    dictType: {
      // 数据字典类型编码
      type: String,
      required: true,
    },
    dictValue: {
      // 数据字典详情编码
      type: String,
      required: true,
    },
    dictDataSource: {
      // 数据字典缓存，这样就不用每次都请求后端了，那样严重影响性能
      type: Array,
    },
  });
  /**
   * data
   */
  const { tagColor, dictType, dictValue, dictDataSource } = toRefs(props); // 根据props创建多个 ref 对象
  const dictLabel = ref<string>(); // 数据字典标签内容
  const dictSort = ref<number>(0); // 数据字典排序值
  const tagColorArr = [
    // tag颜色数组
    'pinkpurple',
    'purple',
    'arcoblue',
    'blue',
    'cyan',
    'green',
    'lime',
  ];
  const showTag = ref<boolean>(false); // 控制是否展示数据字典标签
  /**
   * func
   */
  /**
   * @method
   * @description 根据获取数据字典详情
   */
  const getDictDataRecord = async () => {
    if (
      dictValue.value === undefined ||
      dictValue.value === null ||
      dictValue.value === ''
    ) {
      showTag.value = false;
    } else {
      let haveFlag = false;
      dictDataSource?.value?.forEach((item: any) => {
        if (item.value === dictValue.value) {
          haveFlag = true; // 直接用父组件传过来的数据字典数据源，不用再从后端接口要
          dictLabel.value = item.label as string;
          dictSort.value = Number(item.sort);
          showTag.value = true;
        }
      });
      if (!haveFlag) {
        // 父组件传过来的数据字典数据源没有要找的字典数据，只能用接口调
        const params: DictDataParamsSort = {
          dictType: dictType.value,
          value: dictValue.value,
          orderField: 'sort', // 对sort字段进行排序
          order: 'asc', // 排序方式，分为asc升序 desc降序
        };
        try {
          const { data } = await queryDictDataRecordList(params);
          if (data.length > 0) {
            dictLabel.value = data[0].label as string;
            dictSort.value = Number(data[0].sort);
            showTag.value = true;
          } else {
            dictLabel.value = '';
            showTag.value = false;
          }
        } catch (error) {
          showTag.value = false;
          Notification.error({
            content: `出现异常！${error}`,
            closable: true,
          });
        }
      }
    }
  };
  /**
   * onMounted
   */
  onMounted(() => {
    getDictDataRecord();
  });
</script>

<style>
  .tooltip-text {
    cursor: pointer;
  }
</style>
