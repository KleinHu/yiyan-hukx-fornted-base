<!--created by yuyupeng-->
<!--2024/06/12-->
<!-- 部门维护对话框-->
<template>
  <div>
    <a-modal
      :width="width"
      :title="title"
      title-align="start"
      :visible="visOfDeptSelectModal"
      :mask-closable="maskClosable"
      :unmount-on-close="unmountOnClose"
      :ok-button-props="okButtonProps"
      :cancel-button-props="cancelButtonProps"
      @ok="submitDeptSelectModal"
      @cancel="closeDeptSelectModal"
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
                  v-model="searchTreeKey"
                  style="margin-bottom: 5px"
                  placeholder="请输入部门名称"
                  @input="searchTreeData"
                />
                <!-- 多选模式 -->
                <a-tree
                  v-if="onlyChosenOneDept === false"
                  v-model:selected-keys="selectedTreeKeys"
                  v-model:expanded-keys="expandedTreeKeys"
                  block-node
                  :checked-keys="checkedNodeKeys"
                  :data="treeDataFilter"
                  checkable
                  check-strictly
                  :field-names="{
                    key: 'id',
                    title: 'name',
                    children: 'children',
                  }"
                  @check="onCheck"
                  @select="onSelectTreeNode"
                  @expand="onExpandTreeNode"
                >
                  <template #title="nodeData">
                    <span v-if="nodeData?.name.indexOf(searchTreeKey) > -1">
                      {{
                        nodeData?.name.substr(
                          0,
                          nodeData?.name.indexOf(searchTreeKey)
                        )
                      }}
                      <span style="color: red">{{ searchTreeKey }}</span>
                      {{
                        nodeData?.name.substr(
                          nodeData?.name.indexOf(searchTreeKey) +
                            searchTreeKey?.length
                        )
                      }}
                    </span>
                    <span v-else>{{ nodeData?.name }}</span>
                  </template>
                </a-tree>
                <!-- 单选模式 -->
                <a-tree
                  v-else-if="onlyChosenOneDept === true"
                  v-model:selected-keys="selectedTreeKeys"
                  v-model:expanded-keys="expandedTreeKeys"
                  block-node
                  :data="treeDataFilter"
                  :field-names="{
                    key: 'id',
                    title: 'name',
                    children: 'children',
                  }"
                  @select="onSelectTreeNode"
                  @expand="onExpandTreeNode"
                >
                  <template #title="nodeData">
                    <span v-if="nodeData?.name.indexOf(searchTreeKey) > -1">
                      {{
                        nodeData?.name.substr(
                          0,
                          nodeData?.name.indexOf(searchTreeKey)
                        )
                      }}
                      <span style="color: red">{{ searchTreeKey }}</span>
                      {{
                        nodeData?.name.substr(
                          nodeData?.name.indexOf(searchTreeKey) +
                            searchTreeKey?.length
                        )
                      }}
                    </span>
                    <span v-else>{{ nodeData?.name }}</span>
                  </template>
                </a-tree>
              </div>
            </a-scrollbar>
          </a-card>
        </pane>
        <pane min-size="50" size="75">
          <a-card title="选中的部门" class="general-card">
            <template #title>
              选中的部门({{ checkedNodeData.length }})
            </template>
            <template #extra>
              <a-popover content="清空">
                <icon-delete @click="removeChosenDeptAll" />
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
                          @click="removeChosenDept(item)"
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
  import { ref, onMounted, defineExpose, toRefs, watch, computed } from 'vue';
  import { Splitpanes, Pane } from 'splitpanes';
  import 'splitpanes/dist/splitpanes.css';
  import { queryDeptRecordTreeList } from '@/api/system/dept';
  // import SwitchOrgModal from '@/views/system/user/components/switch-org-modal.vue';

  const props = defineProps({
    width: { type: String, default: '1200px' }, // 对话框宽度
    title: { type: String, default: '部门对话框' }, // 对话标题
    okText: { type: String, default: '提交' }, // 按钮文字
    required: { type: Boolean, default: false }, // 是否至少选一个部门
    onlyChosenOneDept: { type: Boolean, default: false }, // 是否只选择一个部门，如果true，则出现单选框，如果false，则出现复选框
    maskClosable: { type: Boolean, default: false }, // 控制是否允许点击蒙层关闭弹窗
    // cancelText: { type: String, default: '取消' }, // 按钮文字
    submitWithClose: { type: Boolean, default: true }, // 用于控制submit回调时，是否进行close操作
    unmountOnClose: { type: Boolean, default: true }, // 关闭时销毁 Modal 里的子元素
    // okLoading: { type: Boolean, default: false }, // 确定按钮 loading
    okButtonProps: { type: Object, default: () => {} },
    cancelButtonProps: { type: Object, default: () => {} },
    defaultCheckedDeptList: { type: Array, default: () => [] }, // 默认选中的部门节点列表，例如[{id: 1, name: '部门管理'}]
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
    onlyChosenOneDept, // 是否只选择一个部门，如果true，则单选，如果false，则出现复选框
    unmountOnClose, // 关闭时销毁 Modal 里的子元素
    // okLoading, // 确定按钮 loading
    okButtonProps,
    cancelButtonProps,
    defaultCheckedDeptList, // 默认选中的部门工号列表，例如['1']
  } = toRefs(props); // 根据props创建多个 ref 对象
  const treeData = ref<any[]>([]); // 树
  const treeDataFilter = ref<any[]>([]); // 用于搜索的过滤树
  // const authList = ref<string[]>([]);
  const searchTreeKey = ref<string>(); // 树顶上的搜索框关键字
  const dataList = ref<any[]>([]); // treeData的所有key:title
  const parentKeys = ref<number[]>([]); // 用于存储点击的树节点的所有父节点的key
  const filterKeySet = new Set(); // 定义一个集合，用于记录过滤keys
  const visOfDeptSelectModal = ref<boolean>(false); // 控制部门对话框是否弹出
  const treeDataLoading = ref<boolean>(false); // 指示树形组件是否正在加载中
  const expandedTreeKeys = ref<number[]>([]); // 已展开的树节点keys
  const selectedTreeKeys = ref<number[]>([]); // 已选中的树节点keys
  const otherParamsList = ref<any[]>([]); // 其他附加参数
  const checkedNodeKeys = ref<number[]>([]); // 选中的树节点keys
  const checkedNodeData = ref<any[]>([]); // 选中的树节点数据
  const loading = computed(() => {
    return treeDataLoading.value;
  });
  /**
   * @description 监听loading，树加载完了就执行buildAuthTree()
   */
  watch(
    () => loading,
    (val) => {
      if (!val) {
        // buildAuthTree();
      }
    }
  );
  /**
   * @description 监听parentKeys, 一有变化就
   */
  watch(
    () => parentKeys,
    (val) => {
      if (val) {
        val.value.forEach((element: any) => {
          filterKeySet.add(element);
        });
        // 进行过滤操作
        treeDataFilter.value = treeData.value.filter((item) =>
          filterKeySet.has(item.id)
        );
        expandedTreeKeys.value = [...filterKeySet] as number[];
      }
    },
    { deep: true, immediate: true }
  );
  /**
   * func
   */
  /**
   * @description 部门树勾选触发
   * @param checkedKeys
   * @param halfCheckedKeys
   */
  const onCheck = (
    checkedKeys: (number | string)[],
    { checkedNodes }: { checkedNodes: any[] }
  ) => {
    const currentOrgCheckedKeys = [] as number[]; // 当前组织机构下被选中的部门id数组
    const currentOrgCkeckedNodes = [] as any[]; // 当前组织机构下被选中的部门node数组
    const otherOrgCheckedKeys = [] as number[]; // 其他组织机构下被选中的部门id数组
    const otherOrgCkeckedNodes = [] as any[]; // 其他组织机构下被选中的部门node数组
    checkedKeys.forEach((key) => {
      if (dataList.value.filter((e) => e.key === key).length === 0) {
        otherOrgCheckedKeys.push(key as number);
        otherOrgCkeckedNodes.push(
          checkedNodeData.value.filter((e) => e.id === key)[0]
        );
      } else {
        currentOrgCheckedKeys.push(key as number);
        const node = checkedNodes.filter((e) => e.id === key)[0];
        currentOrgCkeckedNodes.push(node);
      }
    });
    checkedNodeKeys.value = [...currentOrgCheckedKeys, ...otherOrgCheckedKeys];
    checkedNodeData.value = [
      ...currentOrgCkeckedNodes,
      ...otherOrgCkeckedNodes,
    ];
  };
  /**
   * @description 获取部门的树形结构信息
   */
  const getTreeData = async () => {
    treeDataLoading.value = true;
    treeData.value = [];
    treeDataFilter.value = [];
    try {
      const { data } = await queryDeptRecordTreeList({});
      treeData.value = data;
      treeDataFilter.value = data;
      dataList.value = [];
      generateList(treeData.value);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Notification.error({
        content: `出现异常！${error}`,
        closable: true,
        duration: 20000,
      });
    } finally {
      treeDataLoading.value = false;
    }
  };
  /**
   * @description 构建treeData的所有 { key: title } 数组
   * @param data 树节点数据
   */
  const generateList = (data: any) => {
    // 创建dataList 递归调用
    data.forEach((item: any) => {
      const node = item;
      const key = node.id;
      item.isLeaf = true;
      dataList.value.push({ key, title: node.name });
      if (node.children && node.children.length > 0) {
        item.isLeaf = false;
        generateList(node.children);
      }
    });
  };
  /**
   * @description 根据子节点的key获取父节点的key
   * @param key key
   * @param tree 树节点
   */
  const getParentKey = (key: string, tree: any) => {
    let parentKey;
    tree.forEach((elem: any) => {
      const node = elem;
      if (node.children) {
        if (node.children.some((item: any) => item.id === key)) {
          parentKey = node.id;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    });
    return parentKey;
  };
  /**
   * @description 获取完整地父节点的key数组 递归调用
   * @param key
   */
  const getWholeParentKeys = (key: string) => {
    const temp = getParentKey(key, treeData.value);
    if (temp !== undefined) {
      parentKeys.value.push(temp);
      getWholeParentKeys(temp);
    }
  };
  /**
   * @description 树形结构上面的搜索框发生改变会触发此函数
   * @param value
   */
  const searchTreeData = (val: any) => {
    const value = val.replaceAll(' ', '');
    filterKeySet.clear();
    // 进行搜索操作
    const expandedKeysTemp = [] as any[];
    dataList.value.forEach((item) => {
      if (item.title && item.title.indexOf(value) > -1) {
        expandedKeysTemp.push(item.key);
      }
    });
    parentKeys.value = [];
    // 必须要有下面这个forEach，否则只能查到2层数据，因为超过了2层后匹配不到更上层的父id，进而导致搜索不出结果
    console.log(expandedKeysTemp);
    expandedKeysTemp.forEach((item: string) => {
      filterKeySet.add(item);
      getWholeParentKeys(item); // 把原始的expandedKeysTemp中的每个key对应的完整父key都放进parentKeys保存
    });
    expandedTreeKeys.value =
      value.trim().length === 0 ? [] : ([...filterKeySet] as number[]);
    searchTreeKey.value = value;
    // 进行过滤操作
    treeDataFilter.value = treeData.value.filter((item) =>
      filterKeySet.has(item.id)
    );
  };
  /**
   * 点击树节点触发
   * @param newSelectedKeys
   * @param event
   */
  const onSelectTreeNode = (newSelectedKeys: any, event: any) => {
    // console.log('select: ', newSelectedKeys, event);
    selectedTreeKeys.value = newSelectedKeys;
    if (event.node.children) {
      let flag = false;
      expandedTreeKeys.value.forEach((item: number) => {
        if (item === newSelectedKeys[0]) {
          flag = true;
        }
      });
      if (!flag) {
        expandedTreeKeys.value.push(newSelectedKeys[0]);
      }
    }
    // 如果是单选模式，针对结点的选中事件需要记录下checkedNodeData和checkedNodeKeys
    if (onlyChosenOneDept?.value === true) {
      checkedNodeKeys.value = [newSelectedKeys[0]];
      checkedNodeData.value = [event.node];
    }
  };
  /**
   * 展开树节点触发
   * @param newExpandedKeys
   * @param event
   */
  const onExpandTreeNode = (newExpandedKeys: any, event: any) => {
    console.log('expand: ', newExpandedKeys, event);
  };
  /**
   * @description 部门对话框提交触发
   */
  const submitDeptSelectModal = () => {
    if (props.required === true && checkedNodeData.value.length === 0) {
      Notification.warning({
        content: '至少要选1个部门！',
        closable: true,
        duration: 1000,
      });
    } else {
      emits('submit', checkedNodeData.value, otherParamsList.value); // submit回调返回选中的部门信息和其他参数
      visOfDeptSelectModal.value = false;
    }
  };
  /**
   * @description 部门对话框打开触发
   * @param otherParams 其他参数
   */
  const openDeptSelectModal = async (otherParams = []) => {
    // 每次打开部门对话框时都做一系列的重置操作
    resetDeptSelectModal();
    otherParamsList.value = otherParams;
    await getTreeData();
    visOfDeptSelectModal.value = true;
    if (defaultCheckedDeptList.value.length !== 0) {
      // 如果有默认选中的需求
      checkedNodeData.value = defaultCheckedDeptList.value;
      const defaultCheckedNodeKeys = [] as number[];
      defaultCheckedDeptList.value.forEach((item: any) => {
        defaultCheckedNodeKeys.push(item.id);
        // getWholeParentKeys(item.id); // 不加这个，会触发parentKey的watch监听，导致部门树数据不全
      });
      if (onlyChosenOneDept?.value === true) {
        // 单选模式
        selectedTreeKeys.value = defaultCheckedNodeKeys;
      } else {
        // 多选模式
        checkedNodeKeys.value = defaultCheckedNodeKeys;
      }
    }
    emits('open');
  };
  /**
   * @description 部门对话框关闭触发
   */
  const closeDeptSelectModal = () => {
    visOfDeptSelectModal.value = false;
    emits('close');
  };
  /**
   * @description 移除已选中的部门
   * @param item 点击的部门item
   */
  const removeChosenDept = (item: any) => {
    checkedNodeKeys.value = checkedNodeKeys.value.filter((e) => e !== item.id);
    checkedNodeData.value = checkedNodeData.value.filter(
      (e) => e.id !== item.id
    );
  };
  /**
   * @description 清空所有已选中的部门
   */
  const removeChosenDeptAll = () => {
    checkedNodeKeys.value = [];
    checkedNodeData.value = [];
    selectedTreeKeys.value = [];
  };
  /**
   * @description 一系列的重置操作
   */
  const resetDeptSelectModal = () => {
    defaultCheckedDeptList.value = [];
    checkedNodeKeys.value = [];
    searchTreeKey.value = undefined;
    selectedTreeKeys.value = [];
    expandedTreeKeys.value = [];
    parentKeys.value = [];
    removeChosenDeptAll();
  };
  /**
   * onMounted
   */
  onMounted(() => {});
  defineExpose({ openDeptSelectModal, closeDeptSelectModal }); // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
</script>
