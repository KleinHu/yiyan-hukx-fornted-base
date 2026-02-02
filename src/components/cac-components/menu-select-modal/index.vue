<!--created by yuyupeng-->
<!--2023/11/15-->
<!-- 菜单选择对话框，所有需要选择菜单的地方均可使用此组件-->
<template>
  <div>
    <a-modal
      :width="width"
      :title="title"
      title-align="start"
      :visible="visOfMenuSelectModal"
      :mask-closable="maskClosable"
      :unmount-on-close="unmountOnClose"
      :ok-button-props="okButtonProps"
      :cancel-button-props="cancelButtonProps"
      @ok="submitMenuSelectModal"
      @cancel="closeMenuSelectModal"
    >
      <splitpanes class="default-theme">
        <pane min-size="25" size="25">
          <a-card title="菜单树" class="general-card">
            <a-scrollbar style="height: calc(80vh - 180px); overflow: auto">
              <a-skeleton v-if="loading" animation>
                <!-- 还在加载的时候用骨架屏先占个位子，好看点 -->
                <a-skeleton-line :rows="10" />
              </a-skeleton>
              <div v-else>
                <a-input-search
                  v-model="searchTreeKey"
                  style="margin-bottom: 5px"
                  placeholder="请输入菜单名称"
                  @input="searchTreeData"
                />
                <a-tree
                  v-model:selected-keys="selectedTreeKeys"
                  v-model:expanded-keys="expandedTreeKeys"
                  block-node
                  :checked-keys="checkedNodeKeys"
                  :data="treeDataFilter"
                  checkable
                  :field-names="{
                    key: 'name',
                    title: 'chineseTitle',
                    children: 'children',
                  }"
                  @check="onCheck"
                  @select="onSelectTreeNode"
                >
                  <template #title="nodeData">
                    <span
                      v-if="nodeData?.chineseTitle.indexOf(searchTreeKey) > -1"
                    >
                      {{
                        nodeData?.chineseTitle.substr(
                          0,
                          nodeData?.chineseTitle.indexOf(searchTreeKey)
                        )
                      }}
                      <span style="color: red">{{ searchTreeKey }}</span>
                      {{
                        nodeData?.chineseTitle.substr(
                          nodeData?.chineseTitle.indexOf(searchTreeKey) +
                            searchTreeKey?.length
                        )
                      }}
                    </span>
                    <span v-else>{{ nodeData?.chineseTitle }}</span>
                  </template>
                  <template #icon="nodeData">
                    <template v-if="nodeData.node.meta.icon">
                      <MenuIcon :element="nodeData.node" />
                    </template>
                    <template v-else>
                      <icon-empty style="color: rgb(36, 103, 255, 0.8)" />
                    </template>
                  </template>
                </a-tree>
              </div>
            </a-scrollbar>
            <template #extra>
              <a-popover content="刷新菜单树">
                <icon-refresh @click="getTreeData" />
              </a-popover>
            </template>
          </a-card>
        </pane>
        <pane min-size="50" size="75">
          <a-card title="选中的菜单" class="general-card">
            <template #title>
              选中的菜单({{ checkedNodeData.length }})
            </template>
            <template #extra>
              <a-popover content="清空">
                <icon-delete @click="removeChosenMenuAll" />
              </a-popover>
            </template>
            <a-scrollbar style="height: calc(80vh - 180px); overflow: auto">
              <a-alert>支持长按拖动排序</a-alert>
              <a-row>
                <template
                  v-for="(item, index) in checkedNodeData"
                  :key="item.name"
                >
                  <div
                    style="display: inline-block; padding: 20px"
                    @dragstart="dragstartEvent($event, index)"
                    @dragover="dragoverEvent($event)"
                    @drop="dragdropEvent($event, index)"
                  >
                    <div draggable="true">
                      <a-row justify="center">
                        <a-col :span="12">
                          <a-badge>
                            <template #content>
                              <icon-close-circle
                                style="color: red"
                                @click="removeChosenMenu(item)"
                              />
                            </template>
                            <a-button v-if="item.meta.icon">
                              <template #icon>
                                <MenuIcon :element="item" :size="20" />
                              </template>
                            </a-button>
                            <a-button v-else>
                              <template #icon>
                                <icon-empty
                                  style="color: rgb(36, 103, 255, 0.8)"
                                  :size="20"
                                />
                              </template>
                            </a-button>
                          </a-badge>
                        </a-col>
                      </a-row>
                      <a-row justify="center">
                        <a-col :span="24">
                          <div style="font-size: 12px; text-align: center">
                            {{ item.chineseTitle }}
                          </div>
                        </a-col>
                      </a-row>
                    </div>
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

<script lang="ts" setup>
  import { TreeNodeData } from '@arco-design/web-vue';
  import { ref, defineExpose, toRefs, watch, computed } from 'vue';
  import { Splitpanes, Pane } from 'splitpanes';
  import 'splitpanes/dist/splitpanes.css';
  import useMenuTree from '@/components/menu/use-menu-tree';
  import MenuIcon from '@/components/cac-components/menu-select-modal/components/menu-icon.vue';

  const props = defineProps({
    width: { type: String, default: '1200px' }, // 对话框宽度
    title: { type: String, default: '菜单对话框' }, // 对话标题
    okText: { type: String, default: '提交' }, // 按钮文字
    onlyChosenOneEmployee: { type: Boolean, default: false }, // 是否只选择一个人员， 如果true，则出现单选框，如果false，则出现复选框
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
    defaultCheckedMenuList: { type: Array, default: () => [] }, // 默认选中的菜单节点列表，例如[{name: 'dept', title: '部门管理'}]
    // 允许主动排除一些菜单
    excludeNames: { type: Array<string>, default: () => [] },
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
    unmountOnClose, // 关闭时销毁 Modal 里的子元素
    // okLoading, // 确定按钮 loading
    okButtonProps,
    cancelButtonProps,
    defaultCheckedMenuList, // 默认选中的人员工号列表，例如['199439']
  } = toRefs(props); // 根据props创建多个 ref 对象
  const treeData = ref<any[]>([]); // 树
  const treeDataFilter = ref<any[]>([]); // 用于搜索的过滤树
  // const authList = ref<string[]>([]);
  const searchTreeKey = ref<string>(); // 树顶上的搜索框关键字
  const dataList = ref<any[]>([]); // treeData的所有key:title
  const parentKeys = ref<string[]>([]); // 用于存储点击的树节点的所有父节点的key
  const currentFilterKeys = ref<any>();
  const visOfMenuSelectModal = ref<boolean>(false); // 控制菜单对话框是否弹出
  const treeDataLoading = ref<boolean>(false); // 指示树形组件是否正在加载中
  const expandedTreeKeys = ref<string[]>([]); // 已展开的树节点keys
  const selectedTreeKeys = ref<string[]>([]); // 已选中的树节点keys
  const otherParamsList = ref<any[]>([]); // 其他附加参数
  const checkedNodeKeys = ref<string[]>([]); // 选中的树节点keys
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
    () => parentKeys.value,
    (val) => {
      if (val) {
        val.forEach((item) => {
          // this.selected = this.selected.filter(e => e !== item)
          if (expandedTreeKeys.value.filter((e) => e === item).length === 0) {
            expandedTreeKeys.value.push(item);
          }
        });
      }
    },
    { deep: true, immediate: true }
  );
  /**
   * func
   */
  /**
   * @description 菜单树勾选触发
   * @param checkedKeys
   * @param halfCheckedKeys
   */
  const onCheck = (
    checkedKeys: (string | number)[],
    { checkedNodes }: { checkedNodes: TreeNodeData[] }
  ) => {
    checkedNodeKeys.value = [...(checkedKeys as string[])];
    checkedNodeData.value = checkedNodes;
  };
  /**
   * @description 获取部门的树形结构信息
   */
  const getTreeData = async () => {
    treeDataLoading.value = true;
    treeData.value = [];
    treeDataFilter.value = [];
    try {
      const { menuTree } = useMenuTree();
      dataList.value = [];
      generateList(menuTree.value);
      treeData.value = menuTree.value;
      treeDataFilter.value = menuTree.value;

      // 根据在props传入的excludeNames排除一部分路由
      treeDataFilter.value = menuTree.value.filter(
        (elem: any) => !props.excludeNames.includes(elem.name)
      );
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
      const chineseTitle = node.meta.title ? node.meta.title : node.name;
      item.chineseTitle = chineseTitle;
      item.isLeaf = true;
      dataList.value.push({ key: node.name, title: chineseTitle });
      if (node.children && node.children.length > 0) {
        item.checkable = false;
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
      if (node.children && node.children.length > 0) {
        if (node.children.some((item: any) => item.name === key)) {
          parentKey = node.name;
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
    // 定义一个集合，用于记录过滤条件
    const filterKeys = new Set();
    // 进行搜索操作
    const expandedKeysTemp: any = dataList.value
      .map((item) => {
        if (item.title.indexOf(value) > -1) {
          filterKeys.add(item.key);
          return getParentKey(item.key, treeData.value);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    const expandedTreeKesySet = new Set();
    // 必须要有下面这个双层的forEach，否则只能查到2层数据，因为超过了2层后匹配不到更上层的父id，进而导致搜索不出结果
    expandedKeysTemp.forEach((item: string) => {
      expandedTreeKesySet.add(item);
      getWholeParentKeys(item); // 把原始的expandedKeysTemp中的每个key对应的完整父key都放进parentKeys保存
      parentKeys.value.forEach((elem: string) => {
        expandedTreeKesySet.add(elem);
      });
    });
    expandedTreeKeys.value =
      value.trim().length === 0 ? [] : ([...expandedTreeKesySet] as string[]);
    searchTreeKey.value = value;
    expandedTreeKeys.value.forEach((item: any) => {
      filterKeys.add(item);
    });
    currentFilterKeys.value = filterKeys;
    // 进行过滤操作
    treeDataFilter.value = treeData.value.filter((item) =>
      filterKeys.has(item.name)
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
      expandedTreeKeys.value.forEach((item: string) => {
        if (item === newSelectedKeys[0]) {
          flag = true;
        }
      });
      if (!flag) {
        expandedTreeKeys.value.push(newSelectedKeys[0]);
      }
    }
    if (event.node.isLeaf) {
      // 针对叶子结点的选中事件
      if (
        checkedNodeKeys.value.filter((item) => item === newSelectedKeys[0])
          .length > 0
      ) {
        // 如果checkedNodeKeys里面有当前节点的key，则把它删掉
        checkedNodeKeys.value = checkedNodeKeys.value.filter(
          (e) => e !== newSelectedKeys[0]
        );
        checkedNodeData.value = checkedNodeData.value.filter(
          (e) => e.name !== newSelectedKeys[0]
        );
      } else {
        // 如果checkedNodeKeys里面没有当前节点的key，则把它加进去
        checkedNodeKeys.value.push(newSelectedKeys[0]);
        checkedNodeData.value.push(event.node);
      }
    }
  };
  /**
   * @description 菜单对话框提交触发
   */
  const submitMenuSelectModal = () => {
    emits('submit', checkedNodeData.value, otherParamsList.value); // submit回调返回选中的菜单信息和其他参数
    visOfMenuSelectModal.value = false;
  };
  /**
   * @description 菜单对话框打开触发
   * @param otherParams 其他参数
   */
  const openMenuSelectModal = async (otherParams = []) => {
    // 每次打开人员对话框时都做一系列的重置操作
    resetMenuSelectModal();
    otherParamsList.value = otherParams;
    await getTreeData();
    visOfMenuSelectModal.value = true;
    if (defaultCheckedMenuList.value.length !== 0) {
      // 如果有默认选中的需求
      checkedNodeData.value = defaultCheckedMenuList.value;
      const defaultCheckedNodeKeys = [] as string[];
      defaultCheckedMenuList.value.forEach((item: any) => {
        defaultCheckedNodeKeys.push(item.name);
        getWholeParentKeys(item.name);
      });
      checkedNodeKeys.value = defaultCheckedNodeKeys;
    }
    emits('open');
  };
  /**
   * @description 菜单对话框关闭触发
   */
  const closeMenuSelectModal = () => {
    visOfMenuSelectModal.value = false;
    emits('close');
  };
  /**
   * @description 移除已选中的菜单
   * @param item 点击的菜单item
   */
  const removeChosenMenu = (item: any) => {
    checkedNodeKeys.value = checkedNodeKeys.value.filter(
      (e) => e !== item.name
    );
    checkedNodeData.value = checkedNodeData.value.filter(
      (e) => e.name !== item.name
    );
  };
  /**
   * @description 清空所有已选中的菜单
   */
  const removeChosenMenuAll = () => {
    checkedNodeKeys.value = [];
    checkedNodeData.value = [];
  };
  /**
   * @description 一系列的重置操作
   */
  const resetMenuSelectModal = () => {
    checkedNodeKeys.value = [];
    searchTreeKey.value = undefined;
    selectedTreeKeys.value = [];
    expandedTreeKeys.value = [];
    parentKeys.value = [];
    removeChosenMenuAll();
  };
  /**
   * 开始拖拉元素的值 索引位置
   */
  const dragstartEvent = (e: any, i: any) => {
    e.dataTransfer.setData('start', i);
  };
  /**
   * 元素经过某元素位置时，执行事件
   */
  const dragoverEvent = (e: any) => {
    e.preventDefault();
  };
  /**
   * 放开元素时执行
   */
  const dragdropEvent = (e: any, i: any) => {
    const startIndex = e.dataTransfer.getData('start');
    if (startIndex || startIndex === 0) {
      // 记录被拖动元素内容
      const startVal = checkedNodeData.value[startIndex];
      // 删除被拖动位置元素
      checkedNodeData.value.splice(startIndex, 1);
      // 将被拖动元素插入数组指定位置
      checkedNodeData.value.splice(i, 0, startVal);
      // 清除记录数据
      e.dataTransfer.clearData();
    }
  };
  defineExpose({ openMenuSelectModal, closeMenuSelectModal }); // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
</script>
