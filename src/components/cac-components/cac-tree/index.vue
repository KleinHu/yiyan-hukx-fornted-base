<!-- 树形组件 -->
<!--created by ljx | 2023/06/12-->
<!--updated by ljx | 2023/06/25 | 增加 url 传参内部加载数据，增加回车、清空事件处理 -->
<!--updated by ljx | 2023/07/06 | 增加 defaultParams 默认搜索条件 + getSltNodes() 获取选中节点方法  -->

<template>
  <div>
    <a-spin style="width: 100%" :loading="loading" dot>
      <!-- 搜索提示 -->
      <a-row style="margin-bottom: 15px">
        【查询条件】=>
        <sapn v-if="searchKey" style="color: red">
          {{ searchKey }}
        </sapn>
        <sapn v-else style="color: red">【未设置】</sapn>
      </a-row>
      <!-- 搜索框 -->
      <a-input-search
        allow-clear
        style="width: 100%; margin-bottom: 15px"
        :placeholder="searchPlaceholder"
        search-button
        @search="onSearchChange"
        @press-enter="pressEnter"
        @clear="onSearchChange('')"
      />
      <!-- 【展开/折叠】功能按钮 -->
      <a-row style="width: 100%; margin-bottom: 15px" justify="space-between">
        <a-col :span="11">
          <a-button
            style="width: 100%"
            type="primary"
            @click="RefTree.expandAll(false)"
            >折叠（全部）</a-button
          >
        </a-col>
        <a-col :span="11">
          <a-button
            style="width: 100%"
            type="primary"
            @click="RefTree.expandAll(true)"
            >展开（全部）</a-button
          >
        </a-col>
      </a-row>

      <!-- 树组件 -->
      <a-tree
        ref="RefTree"
        v-model:expanded-keys="expKeys"
        v-model:selected-keys="sltKeys"
        class="orgtree"
        :data="filterTreeData"
        :field-names="fieldNames"
        :show-line="showLine"
        @expand="onExpand"
        @select="onSelect"
      >
        <!-- 插槽-标题显示（搜索关键字标注） -->
        <template #title="nodeData">
          <!-- 匹配搜索，划分3段显示，中间匹配段 -->
          <span v-if="nodeData?.[fieldNames.title].indexOf(searchKey) > -1">
            {{
              nodeData?.[fieldNames.title]?.substr(
                0,
                nodeData?.[fieldNames.title].indexOf(searchKey)
              )
            }}
            <span style="color: #f50"> {{ searchKey }}</span>
            {{
              nodeData?.[fieldNames.title]?.substr(
                nodeData?.[fieldNames.title].indexOf(searchKey) +
                  searchKey.length
              )
            }}
          </span>
          <!-- 不匹配搜索 -->
          <span v-else>{{ nodeData?.[fieldNames.title] }}</span>
        </template>
      </a-tree>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import request from '@/utils/request/request';

  import { ref, toRefs, nextTick, onMounted } from 'vue';

  /** 定义 emits * */
  const emits = defineEmits(['select']);

  /** 定义props * */
  const props = defineProps({
    url: { type: String, default: '' }, // 加载的url
    showLine: { type: Boolean, default: false }, //  是否展示连接线
    // 替换 treeNode 中 title,key,children 字段为 treeData 中对应的字段
    fieldNames: {
      type: Object,
      default: () => {
        return { children: 'children', title: 'title', key: 'key' };
      },
    },
    showSearch: { type: Boolean, default: true }, // 是否显示搜索框
    searchPlaceholder: { type: String, default: '关键字' }, // 搜索框提示内容
    defaultParams: { type: Object, default: () => {} }, // 默认搜索条件
  });

  const { fieldNames, url, defaultParams } = toRefs(props); // 根据props创建多个 ref 对象

  const treeData = ref([]); //  原始树数据
  const filterTreeData = ref([]); //  搜索结果树
  const RefTree = ref(); // 树组件 ref 对象
  const searchKey = ref<string>(''); // 搜索关键字
  const expKeys = ref([]); // 展开节点keys
  const sltKeys = ref([]); // 选中节点keys
  const loading = ref<boolean>(false); // 树加载状态

  // 定义 mounted
  onMounted(() => {
    if (url.value !== '') getTreeData();
  });

  // 清空方法
  function clr() {
    treeData.value = [];
    filterTreeData.value = [];
    expKeys.value = [];
    sltKeys.value = [];
  }
  // 获取树数据方法
  async function getTreeData(srchParams = {}) {
    const params = { ...srchParams, ...defaultParams.value };
    loading.value = true;
    clr();
    try {
      const { data } = await request.get(url.value, { params });
      loading.value = false;
      treeData.value = data;
      onSearchChange(searchKey.value);
      // console.log('treeData', treeData.value);
    } finally {
      loading.value = false;
    }
  }

  // 展开回调
  function onExpand(newExpandedKeys: any) {
    expKeys.value = newExpandedKeys;
  }
  // 搜索回调
  function onSearchChange(value = '') {
    searchKey.value = value.trim();
    filterTreeData.value = deepSearch(treeData.value, searchKey.value);
    // nextTick函数：将回调推迟到下一个 DOM 更新周期之后执行
    nextTick(() => {
      RefTree.value.expandAll(true);
    });
  }
  // 回车回调
  function pressEnter(KeyboardEvent: any) {
    onSearchChange(KeyboardEvent.target.value);
  }

  /**
   * @description 深度遍历树，过滤出包含关键字的节点树
   * @param tree 原始树数据
   * @param key 搜索关键字
   */
  function deepSearch(tree: Array<any>, key: string) {
    const result: any = [];
    tree.forEach((node: any) => {
      if (
        node[fieldNames.value.title].toLowerCase().indexOf(key.toLowerCase()) >
        -1
      ) {
        result.push({ ...node });
      } else if (node[fieldNames.value.children]) {
        const filterData = deepSearch(node[fieldNames.value.children], key);
        if (filterData.length) {
          result.push({ ...node, [fieldNames.value.children]: filterData });
        }
      }
    });
    return result;
  }

  // 获取当前的展开节点数组
  function getExpandedNodes() {
    return RefTree.value.getExpandedNodes();
  }
  /* ------------ 选中回调 ------------------- */
  function onSelect(selectedKeys: Array<string | number>, data: any) {
    // console.log('onSelect--selectedKeys', selectedKeys);
    emits('select', selectedKeys, data);
  }
  // 获取选中节点
  function getSltNodes() {
    // console.log(RefTree.value.getSelectedNodes());
    return RefTree.value.getSelectedNodes();
  }
  // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
  defineExpose({
    treeData,
    filterTreeData,
    clr,
    getTreeData,
    onSearchChange,
    getExpandedNodes,
    getSltNodes,
  });
</script>

<style scoped>
  .orgtree {
    height: calc(100vh - 400px); /* 100vh 等于viewport（可视窗口）高的的100% */
    overflow: auto; /* 如果内容被修剪，则浏览器会显示滚动条以便查看其余的内容。 */
  }
</style>
