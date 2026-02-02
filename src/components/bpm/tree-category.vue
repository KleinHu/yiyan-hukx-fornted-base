<template>
  <div>
    <a-empty v-if="treeDataFilter.length === 0" />
    <a-tree
      v-else
      v-model:selected-keys="selectedTreeKeys"
      v-model:expanded-keys="expandedNodes"
      block-node
      :field-names="{
        key: 'key',
        title: 'name',
        children: 'children',
      }"
      style="padding-right: 10px"
      :data="treeDataFilter"
      @expand="handleExpand"
      @select="onSelectTreeNode"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, watch } from 'vue';
  import {
    getTreeCatByKey,
    getTopNodesByCatKey,
    getCatByParentId,
  } from '@/api/bpm/bpm-category-tree';
  // import { TreeNodeData } from '@arco-design/web-vue';

  const treeDataFilter = ref<any[]>([]); // 用于搜索的过滤树
  // const treeData = ref<any[]>([]);
  const expandedNodes = ref<(string | number)[]>([]);
  const selectedTreeKeys = ref<string[]>([]); // 已选中的树节点keys
  const childrenData = ref<any[]>([]);
  const emits = defineEmits(['select']);
  const props = defineProps({
    catKey: { type: String, default: 'BPM' },
    initOnLoad: {
      type: Boolean,
      default: true,
    },
    readKey: {
      type: String,
      default: 'read',
    },
    statisticConfig: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });
  /**
   * 点击树节点触发
   * @param newSelectedKeys
   */
  const onSelectTreeNode = (newSelectedKeys: any) => {
    selectedTreeKeys.value = newSelectedKeys;
    emits('select', [...newSelectedKeys]);
  };
  /**
   * onMounted
   */
  onMounted(() => {
    getTreeCat();
  });
  watch(childrenData, (newVal, oldVal) => {
    if (newVal !== oldVal) {
      treeDataFilter.value[0].children = childrenData;
      expandedNodes.value = treeDataFilter.value[0].key === 0 ? ['0'] : [];
      //   loadedKeys.value = treeDataFilter.value[0].key === 0 ? ['0'] : [];
    }
  });
  // 获取系统分类
  const getTreeCat = async () => {
    const { data } = await getTreeCatByKey(props.catKey);
    const root = {
      catKey: data.key,
      treeId: '0',
      parentId: '-1',
      key: '0',
      value: '0',
      children: [],
      name: JSON.parse(data.name)['zh-CN'],
    };
    treeDataFilter.value.push(root);
    if (props.initOnLoad) {
      getTreeData();
    }
  };
  const transData = (data: any, name: string, key: string) => {
    if (!data) {
      data = [];
      return;
    }
    data.forEach((elem: any) => {
      const row = elem;
      handRow(row, name, key);
    });
  };
  const handRow = (row: any, name: string, key: string) => {
    const isLeaf = row.childAmount === 0;
    const obj = {
      title: row[name],
      key: row[key],
      isLeaf,
    };
    Object.assign(row, obj);
  };
  const getTreeData = async () => {
    const data = getTopNodesByCatKey({
      catKey: props.catKey,
      readKey: props.readKey,
      isAdmin: false,
      isGrant: false,
      appId: '',
      statisticConfig: encodeURIComponent(
        JSON.stringify(props.statisticConfig)
      ),
    });
    transData((await data).data, 'name', 'treeId');
    const child = sortData((await data).data, 'sn');
    childrenData.value = child;
    getCatChildByParentId(childrenData.value);
  };
  const getCatChildByParentId = async (parentData: any) => {
    parentData.forEach(async (elem: any) => {
      if (elem.childAmount !== 0) {
        const parentId = elem.treeId;
        const childData = await getCatByParentId({
          parentId,
          catKey: props.catKey,
          readKey: props.readKey,
          isAdmin: false,
          isGrant: false,
        });
        transData(childData.data, 'name', 'treeId');
        const childSortData = sortData(childData.data, 'sn');
        elem.children = childSortData;
      }
    });
  };
  const sortData = (data: any, str: string) => {
    data.sort((a: any, b: any) => {
      return a[str] - b[str];
    });
    return data;
  };
  const handleExpand = (newExpandedKeys: any) => {
    // if (!expandKey) {
    //   return;
    // }
    if (expandedNodes.value.find((elem: any) => elem === newExpandedKeys)) {
      // 已展开，则收起
      expandedNodes.value = expandedNodes.value.filter(
        (elem: any) => elem !== newExpandedKeys
      );
    } else {
      // 未展开，则展开
      expandedNodes.value = [...expandedNodes.value, newExpandedKeys];
    }
  };
</script>
