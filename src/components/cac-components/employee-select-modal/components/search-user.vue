<!--搜索用户组件，基于用户管理简化而来，专门服务与选人组件用的-->
<!--created by yuyupeng-->
<!--2024/07/26-->
<template>
  <div style="background-color: white">
    <splitpanes class="default-theme">
      <pane min-size="20" size="20">
        <a-card title="组织机构树" class="general-card">
          <a-scrollbar style="height: 100%; overflow: auto">
            <a-skeleton v-if="deptTreeData.length === 0" animation>
              <!-- 还在加载的时候用骨架屏先占个位子，好看点 -->
              <a-skeleton-line :rows="10" />
            </a-skeleton>
            <div v-else>
              <a-input-search
                v-model="searchTreeKey"
                style="margin-bottom: 5px"
                placeholder="请输入组织机构名称"
                @input="searchDeptTreeData"
              />
              <a-tree
                v-model:selected-keys="selectedTreeKeys"
                v-model:expanded-keys="expandedTreeKeys"
                block-node
                :field-names="{
                  key: 'id',
                  title: 'name',
                  children: 'children',
                }"
                :data="deptTreeDataFilter"
                @select="onSelectTreeNode"
              >
                <template #icon>
                  <icon-home />
                </template>
                <template #title="nodeData">
                  <span v-if="nodeData?.name.indexOf(searchTreeKey) > -1">
                    {{
                      nodeData?.name.substr(
                        0,
                        nodeData?.name.indexOf(searchTreeKey)
                      )
                    }}
                    <span style="color: #f50">{{ searchTreeKey }}</span>
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
      <pane min-size="40" size="55">
        <a-card class="general-card">
          <!-- 查询表单 -->
          <AdvancedSearch
            ref="searchRef"
            :data-source="searchItemList"
            @change="searchByParams"
            @reset="resetAdvancedSearch"
          />
          <!-- 表格 -->
          <a-table
            v-model:selectedKeys="selectedKeys"
            row-key="id"
            column-resizable
            :columns="tbCols"
            :data="tbData"
            :row-selection="rowSelection"
            :pagination="pagination"
            :loading="tbLoading"
            :scroll="{ x: '100%', y: 600 }"
            :scrollbar="true"
            @page-change="onPageChange"
            @page-size-change="onPageSizeChange"
            @select="(_rowKeys, _rowKey, record) => rowClick(record)"
            @select-all="selectAll"
            @row-click="rowClick"
          >
            <!-- 插槽-密级 -->
            <template #secretLevel="{ record }">
              <dictionary-tag
                v-if="secretLevelDictDataSource.length > 0"
                :key="record.secretLevel"
                dict-type="secretLevelUser"
                :dict-value="record.secretLevel"
                :dict-data-source="secretLevelDictDataSource"
              />
            </template>
            <!-- 插槽-一键复制 -->
            <template #quickCopyToolTip="{ record, column }">
              <quick-copy-tool-tip
                :show-text="record[column['dataIndex']]"
                show-btn
              />
            </template>
          </a-table>
        </a-card>
      </pane>
      <pane min-size="25" size="25">
        <a-card title="选中的人员" class="general-card">
          <template #title> 选中的人员({{ chosenEmployees.length }}) </template>
          <template #extra>
            <a-popover content="清空">
              <icon-delete @click="removeChosenEmployeeAll" />
            </a-popover>
          </template>
          <a-scrollbar style="height: calc(80vh - 180px); overflow: auto">
            <a-row :gutter="[5, 5]" style="margin-top: 5px">
              <a-col v-for="item in chosenEmployees" :key="item.id" :span="6">
                <a-popover>
                  <template #content>
                    {{ item.userCode }}<br />
                    {{ item.username }}<br />
                    {{ setDeptName(item.deptId) }}
                  </template>
                  <a-space direction="vertical" size="mini">
                    <a-badge>
                      <template #content>
                        <icon-close-circle
                          style="color: red"
                          @click="removeChosenEmployee(item)"
                        />
                      </template>
                      <a-avatar
                        shape="square"
                        :style="{ backgroundColor: '#168CFF' }"
                      >
                        <img
                          v-if="item.avatar"
                          alt="avatar"
                          :src="item.avatar"
                        />
                        <span v-else>{{ item.username }}</span>
                      </a-avatar>
                    </a-badge>
                    <span style="font-size: 12px">{{ item.username }}</span>
                  </a-space>
                </a-popover>
              </a-col>
            </a-row>
          </a-scrollbar>
        </a-card>
      </pane>
    </splitpanes>
  </div>
</template>

<script lang="ts" setup>
  import { TableColumnData, TableRowSelection } from '@arco-design/web-vue';
  import { queryDeptRecordTreeList } from '@/api/system/dept';
  import { querySecretUserRecordList } from '@/api/system/user';
  import {
    ref,
    onMounted,
    reactive,
    watch,
    defineExpose,
    PropType,
    toRefs,
    computed,
  } from 'vue';
  import AdvancedSearch from '@/components/cac-components/advanced-search/index.vue';
  import QuickCopyToolTip from '@/components/cac-components/quickcopy-tooltip/index.vue';
  import DictionaryTag from '@/components/cac-components/dictionary-tag/index.vue';
  import { useUserStore } from '@/store';
  import { Pagination } from '@/types/global';
  import { Splitpanes, Pane } from 'splitpanes';
  import 'splitpanes/dist/splitpanes.css';
  import { UserParams, UserRecord } from '@/api/system/model/userModel';
  import {
    DictDataParamsSort,
    DictDataRecord,
  } from '@/api/system/model/dictDataModel';
  import { queryDictDataRecordList } from '@/api/system/dictionary';
  import { OrgRecord } from '@/api/system/model/orgModel';
  import { queryOrgRecordTreeList } from '@/api/system/org';

  const props = defineProps({
    onlyChosenOneEmployee: { type: Boolean, default: false }, // 是否只选择一个人员，如果true，则出现单选框，如果false，则出现复选框
    defaultSelectedUserDataList: {
      type: Array as PropType<UserRecord[]>,
      default: () => [],
    }, // 默认选中的人员节点列表，例如[{id: '199439', userName: 'Mickey', userCode: '199439' }]
    // 密级过滤：传入此值会在人员搜索时筛选大于等于此密级的人员
    secretLevelFilter: { type: Number, default: 0 },
  });
  /**
   * data
   */
  const {
    onlyChosenOneEmployee, // 是否只选择一个人员，如果true，则出现单选框，如果false，则出现复选框
    defaultSelectedUserDataList, // 默认选中的人员节点列表，例如[{id: '199439', userName: 'Mickey', userCode: '199439' }]
  } = toRefs(props); // 根据props创建多个 ref 对象

  const userStore = useUserStore();

  /**
   * data
   */
  const orgTreeData = ref<OrgRecord[]>([]); // 组织机构树
  const deptTreeData = ref<any[]>([]); // 部门树
  const deptTreeDataFilter = ref<any[]>([]); // 用于搜索的过滤树
  const filterKeySet = new Set(); // 定义一个集合，用于记录过滤keys
  const searchTreeKey = ref<string>(); // 树顶上的搜索框关键字
  const dataList = ref<any[]>([]); // deptTreeData的所有key:title:id
  const parentKeys = ref<string[]>([]); // 用于存储点击的树节点的所有父节点的key
  const currentOrgId = ref<number | string>(0);
  const currentSelectDeptTreeNode = ref<any>(); // 记录当前选中的左侧部门树节点
  const secretLevelDictDataSource = ref<DictDataRecord[]>([]); // 人员密级数据字典数据源
  // 表格
  const tbData = ref<UserRecord[]>([]);
  const tbCols: TableColumnData[] = [
    {
      title: '序号',
      align: 'center',
      dataIndex: 'index',
      fixed: 'left',
      width: 60,
      render: (row: any) => row.rowIndex + 1,
    },
    {
      title: '密级',
      dataIndex: 'secretLevel',
      width: 150,
      ellipsis: true,
      align: 'center',
      tooltip: true,
      slotName: 'secretLevel',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      width: 150,
      align: 'center',
      tooltip: true,
      slotName: 'quickCopyToolTip',
    },
    {
      title: '用户工号',
      dataIndex: 'userCode',
      width: 150,
      ellipsis: true,
      align: 'center',
      tooltip: true,
      slotName: 'quickCopyToolTip',
    },
    {
      title: '部门',
      dataIndex: 'mainDept',
      width: 150,
      ellipsis: true,
      align: 'center',
      tooltip: true,
      render: ({ record }) => setDeptName(record.deptId),
    },
  ];
  const searchRef = ref<any>();
  const tbLoading = ref<boolean>(false);
  const currentSearchParams = ref<UserRecord>({}); // 记录当前的搜索条件
  const deptTreeDataLoading = ref<boolean>(false); // 指示树形组件是否正在加载中
  const expandedTreeKeys = ref<string[]>([]); // 已展开的树节点keys
  const selectedTreeKeys = ref<string[]>([]); // 已选中的树节点keys
  // 勾选框
  const selectedKeys = ref<string[]>([]);
  const chosenEmployees = ref<any[]>([]); // 选中的表格数据
  const rowSelection = computed((): TableRowSelection => {
    if (onlyChosenOneEmployee?.value === false) {
      // 单选模式
      return {
        type: 'checkbox',
        showCheckedAll: true,
        onlyCurrent: false,
      };
    }
    // 多选模式
    return {
      type: 'radio',
      showCheckedAll: false,
      onlyCurrent: false,
    };
  });
  // 分页，默认第1页，每页10条
  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
    showPageSize: true,
    showTotal: true,
  };
  const pagination = reactive({
    ...basePagination,
  });
  // 搜索项配置
  const searchItemList = [
    {
      type: 'text',
      labelText: '用户名',
      fieldName: 'username',
    },
    {
      type: 'text',
      labelText: '用户工号',
      fieldName: 'userCode',
    },
  ];
  const emits = defineEmits(['change']);
  /**
   * watch
   */
  watch(
    () => parentKeys,
    (val) => {
      if (val) {
        val.value.forEach((element: any) => {
          filterKeySet.add(element);
        });
        // 进行过滤操作
        deptTreeDataFilter.value = deptTreeData.value.filter((item) =>
          filterKeySet.has(item.id)
        );
        expandedTreeKeys.value = [...filterKeySet] as string[];
      }
    },
    { deep: true, immediate: true }
  );
  watch(
    () => defaultSelectedUserDataList.value,
    () => {
      selectedKeys.value = [];
      chosenEmployees.value = [];
      defaultSelectedUserDataList?.value.forEach((user) => {
        selectedKeys.value.push(user.id as string);
        chosenEmployees.value.push(user);
      });
    },
    { deep: true, immediate: true }
  );
  /**
   * func
   */
  /**
   * @description 获取部门的树形结构信息
   */
  const getDeptTreeData = async () => {
    deptTreeDataLoading.value = true;
    deptTreeData.value = [];
    deptTreeDataFilter.value = [];
    try {
      const { data } = await queryDeptRecordTreeList({
        orgId: currentOrgId.value,
      });
      deptTreeData.value = data;
      deptTreeDataFilter.value = data;
      dataList.value = [];
      generateList(deptTreeData.value);
    } finally {
      deptTreeDataLoading.value = false;
    }
  };
  /**
   * @description 构建deptTreeData的所有 { key: title: id } 数组
   * @param data 树节点数据
   */
  const generateList = (data: any) => {
    // 创建dataList 递归调用
    data.forEach((item: any) => {
      const node = item;
      const key = node.id;
      dataList.value.push({ key, title: node.name, id: node.id });
      if (node.children) {
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
    const temp = getParentKey(key, deptTreeData.value);
    if (temp !== undefined) {
      parentKeys.value.push(temp);
      getWholeParentKeys(temp);
    }
  };
  /**
   * @description 树形结构上面的搜索框发生改变会触发此函数
   * @param value
   */
  const searchDeptTreeData = (val: any) => {
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
    expandedKeysTemp.forEach((item: string) => {
      filterKeySet.add(item);
      getWholeParentKeys(item); // 把原始的expandedKeysTemp中的每个key对应的完整父key都放进parentKeys保存
    });
    expandedTreeKeys.value =
      value.trim().length === 0 ? [] : ([...filterKeySet] as string[]);
    searchTreeKey.value = value;
    // 进行过滤操作
    deptTreeDataFilter.value = deptTreeData.value.filter((item) =>
      filterKeySet.has(item.id)
    );
  };
  /**
   * @method
   * @description 获取表格数据
   */
  const getTbDataByPage = async () => {
    const params: UserParams = {
      page: pagination.current,
      limit: pagination.pageSize,
      ...currentSearchParams.value, // 按条件搜索，如果有的话
      secretLevel: props.secretLevelFilter,
    };
    tbLoading.value = true;
    try {
      const { data } = await querySecretUserRecordList(params);
      data.list.forEach((item: any) => {
        item.secretLevel = String(item.secretLevel); // 用户密级也要用单引号包一层，否则数据字典组件不认识number类型的值
      });
      tbData.value = data.list;
      pagination.total = Number(data.total); // 用Number函数转一下，否则f12控制台会有警告，很不好看
    } finally {
      tbLoading.value = false;
    }
  };
  /**
   * @method
   * @description 按条件搜索
   */
  const searchByParams = (reqdata: UserRecord = {}) => {
    pagination.current = 1;
    currentSearchParams.value = reqdata;
    getTbDataByPage();
  };
  /**
   * @method
   * @description 搜索组件清空后触发
   */
  const resetAdvancedSearch = () => {
    selectedTreeKeys.value = []; // 搜索组件清空会触发不带条件的搜素，因此要把已选中的树节点keys清空
    currentSelectDeptTreeNode.value = undefined; // 记录的当前选中的左侧部门树节点也要重置
  };
  /**
   * @method
   * @description 页码发生变化触发
   */
  const onPageChange = (current: number) => {
    pagination.current = current;
    getTbDataByPage();
  };
  /**
   * @method
   * @description 数据条数发生变化触发
   */
  const onPageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    getTbDataByPage();
  };

  /**
   * 点击树节点触发
   * @param newSelectedKeys
   * @param event
   */
  const onSelectTreeNode = (newSelectedKeys: any, event: any) => {
    selectedTreeKeys.value = newSelectedKeys;
    currentSelectDeptTreeNode.value = event.node;
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
    searchRef.value.setFormValues({ deptId: newSelectedKeys[0] }); // 给搜索组件设置对应的部门编码
    pagination.current = 1;
    currentSearchParams.value = { deptId: newSelectedKeys[0] };
    getTbDataByPage(); // 按条件查询，注意：这里不能用searchRef.value.handleSubmit();方法，会滞后一步，可能是setFormValues内部还没遍历结束就handleSubmit了一下
  };
  /**
   * @description 根据deptId给tbData设置部门名称
   */
  const setDeptName = (deptId?: string) => {
    const findDept = dataList.value.find((el) => el.key === deptId);
    if (deptId && findDept) {
      return findDept.title;
    }
    return '';
  };
  /**
   * @method
   * @description 获取组织机构树数据
   */
  const getOrgTreeData = async (reqdata: any = {}) => {
    if (userStore.mainOrgId) {
      currentOrgId.value = userStore.mainOrgId;
    } else {
      try {
        const { data } = await queryOrgRecordTreeList(reqdata);
        orgTreeData.value = data;
        if (data.length > 0) {
          currentOrgId.value = data[0].id;
        }
      } finally {
        //
      }
    }
  };
  /**
   * @description 点击表格数据行触发
   * @param record
   */
  const rowClick = (record: any) => {
    if (onlyChosenOneEmployee?.value === true) {
      // 单选模式
      selectedKeys.value = [record.id];
      chosenEmployees.value = [record];
    } else if (onlyChosenOneEmployee?.value === false) {
      // 多选模式
      if (selectedKeys.value.filter((e) => e === record.id).length > 0) {
        selectedKeys.value = selectedKeys.value.filter((e) => e !== record.id);
        chosenEmployees.value = chosenEmployees.value.filter(
          (e) => e.id !== record.id
        );
      } else {
        selectedKeys.value.push(record.id);
        chosenEmployees.value.push(record);
      }
    }
    emits('change', chosenEmployees.value);
  };
  /**
   * @description 选择全部
   */
  const selectAll = (checked: boolean) => {
    if (checked) {
      // 全部选中时，向已选清单中依次添加表格中尚未添加的全部选项
      const appendEmployees = tbData.value.filter(
        (elem) => !selectedKeys.value.find((key) => key === elem.id)
      );
      appendEmployees.forEach((record) => {
        selectedKeys.value.push(record.id as string);
        chosenEmployees.value.push(record);
      });
    } else {
      // 全部取消选择：从已选列表中去除表格中的全部数据
      tbData.value.forEach((record) => {
        selectedKeys.value = selectedKeys.value.filter((e) => e !== record.id);
        chosenEmployees.value = chosenEmployees.value.filter(
          (e) => e.id !== record.id
        );
      });
    }
    emits('change', chosenEmployees.value);
  };
  /**
   * @description 获取选择的人员数据
   */
  const getChosenEmployeeList = () => {
    return chosenEmployees.value;
  };
  /**
   * @description 移除已选中的人员
   * @param item 点击的人员列表的item
   */
  const removeChosenEmployee = (item: any) => {
    selectedKeys.value = selectedKeys.value.filter((e) => e !== item.id);
    chosenEmployees.value = chosenEmployees.value.filter(
      (elem: any) => elem.id !== item.id
    );
  };
  /**
   * @description 清空所有已选中的人员
   */
  const removeChosenEmployeeAll = () => {
    chosenEmployees.value = [];
    selectedKeys.value = [];
    chosenEmployees.value = [];
  };

  const getDictDataDataSource = async (dictType: string) => {
    const params: DictDataParamsSort = {
      dictType,
      orderField: 'sort', // 对sort字段进行排序
      order: 'asc', // 排序方式，分为asc升序 desc降序
    };
    try {
      const { data } = await queryDictDataRecordList(params);
      return data;
    } catch (_error) {
      return [];
    }
  };

  /**
   * onMounted
   */
  onMounted(async () => {
    await getOrgTreeData();
    await getDeptTreeData();
    await getTbDataByPage();
    const res = await getDictDataDataSource('secretLevelUser');
    secretLevelDictDataSource.value = res;
  });
  defineExpose({ getChosenEmployeeList }); // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
</script>
