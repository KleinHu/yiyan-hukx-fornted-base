<template>
  <a-card class="overview-card" :title="title">
    <template #extra>
      <div class="filter-toolbar">
        <a-radio-group
          v-model="filterMode"
          type="button"
          size="mini"
          @change="handleModeChange"
        >
          <a-radio value="year">按年</a-radio>
          <a-radio value="range">区间</a-radio>
        </a-radio-group>
        <a-divider direction="vertical" />
        <a-tree-select
          v-model="selectedCategoryIds"
          :data="categoryTreeData"
          placeholder="物品分类（多选）"
          multiple
          tree-checkable
          allow-clear
          size="mini"
          style="width: 200px"
          :field-names="{
            key: 'id',
            title: 'name',
            children: 'children',
          }"
        />
        <a-input
          v-model="searchItemName"
          placeholder="搜索物品名称"
          size="mini"
          allow-clear
          style="width: 160px; margin-left: 8px"
        >
          <template #prefix>
            <icon-search />
          </template>
        </a-input>
        <a-divider direction="vertical" />
        <!-- 年度模式 -->
        <a-date-picker
          v-if="filterMode === 'year'"
          v-model="yearValue"
          mode="year"
          value-format="YYYY"
          size="mini"
          style="width: 100px"
          :allow-clear="false"
          @change="handleRefresh"
        />
        <!-- 区间模式 -->
        <a-range-picker
          v-else
          v-model="rangeValue"
          mode="month"
          value-format="YYYY-MM"
          size="mini"
          style="width: 220px"
          @change="handleRefresh"
        />
        <a-button
          type="text"
          size="mini"
          style="margin-left: 8px"
          @click="handleRefresh"
        >
          <template #icon><icon-refresh /></template>
        </a-button>
      </div>
    </template>

    <div class="consumption-container">
      <div class="org-tree-sider">
        <div class="tree-header">组织架构</div>
        <div class="tree-content">
          <a-tree
            v-model:selected-keys="selectedKeys"
            v-model:expanded-keys="expandedKeys"
            :data="treeData"
            :loading="treeLoading"
            :field-names="{
              key: 'deptId',
              title: 'deptName',
            }"
            size="small"
            block-node
            @select="handleSelect"
          />
        </div>
      </div>
      <div class="table-content">
        <a-table
          :loading="deptLoading"
          :data="filteredConsumptionList"
          :pagination="{ pageSize: 10 }"
          size="small"
          :bordered="false"
        >
          <template #columns>
            <a-table-column title="领用科室" data-index="deptName" />
            <a-table-column title="物品名称" data-index="itemName" />
            <a-table-column title="规格型号" data-index="spec">
              <template #cell="{ record }">
                {{ record.spec || '-' }}
              </template>
            </a-table-column>
            <a-table-column
              title="领用总量"
              data-index="totalQuantity"
              :width="120"
            >
              <template #cell="{ record }">
                <span
                  style="font-weight: bold; color: rgb(var(--arcoblue-6))"
                  >{{ record.totalQuantity }}</span
                >
              </template>
            </a-table-column>
            <a-table-column title="操作" :width="100">
              <template #cell="{ record }">
                <a-button
                  type="text"
                  size="small"
                  @click="handleShowDetail(record)"
                >
                  详情
                </a-button>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>
    </div>

    <!-- 人员明细抽屉 -->
    <UserConsumptionDrawer
      v-model:visible="drawerVisible"
      :dept-name="currentDept"
      :item-id="currentItemId"
      :item-name="currentItemName"
      :year="filterMode === 'year' ? yearValue : undefined"
      :start-month="filterMode === 'range' ? rangeValue[0] : undefined"
      :end-month="filterMode === 'range' ? rangeValue[1] : undefined"
    />
  </a-card>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, watch } from 'vue';
  import dayjs from 'dayjs';
  import * as suppliesApi from '@/api/supplies';
  import useConsumption from '@/hooks/supplies/useConsumption';
  import useDepartmentTree from '@/hooks/hr/department';
  import UserConsumptionDrawer from './UserConsumptionDrawer.vue';

  defineProps({
    title: {
      type: String,
      default: '科室领用分析',
    },
  });

  const {
    deptLoading,
    deptConsumptionList: rawConsumptionList,
    fetchDeptConsumption,
  } = useConsumption();

  const { departmentTreeData, loading: treeLoading } = useDepartmentTree({
    autoLoad: true,
  });

  // 筛选状态
  const filterMode = ref<'year' | 'range'>('year');
  const yearValue = ref(dayjs().year().toString());
  const rangeValue = ref<string[]>([]);
  const selectedCategoryIds = ref<string[]>([]);
  const categoryTreeData = ref<any[]>([]);
  const searchItemName = ref('');

  const fetchCategoryData = async () => {
    try {
      const { data } = await suppliesApi.getCategoryTree();
      categoryTreeData.value = data || [];
    } catch (error) {
      console.error('获取分类失败', error);
    }
  };

  // 树状选择状态
  const selectedKeys = ref<string[]>(['ALL']);
  const expandedKeys = ref<string[]>([]);

  /**
   * 递归获取所有 ID
   */
  const getAllKeys = (nodes: any[]): string[] => {
    let keys: string[] = [];
    nodes.forEach((node) => {
      if (node.deptId) keys.push(node.deptId);
      if (node.children) keys = keys.concat(getAllKeys(node.children));
    });
    return keys;
  };

  // 构建立带“全部”的树数据
  const treeData = computed(() => {
    return [
      {
        deptId: 'ALL',
        deptName: '全部部门',
        children: departmentTreeData.value,
      },
    ];
  });

  // 计算当前选中的部门名称列表（包含子部门）
  const currentSelectedDeptNames = computed(() => {
    const selectedKey = selectedKeys.value[0];
    if (!selectedKey || selectedKey === 'ALL') return [];

    const node = findNode(treeData.value, selectedKey);
    if (!node) return [];

    return [node.deptName, ...getAllChildDeptNames(node.children || [])].filter(
      (n) => !!n
    );
  });

  /**
   * 递归获取分类下的所有子级 ID
   */
  const getCategoryDescendants = (nodes: any[]): string[] => {
    let ids: string[] = [];
    nodes.forEach((node) => {
      if (node.id) ids.push(String(node.id));
      if (node.children && node.children.length > 0) {
        ids = ids.concat(getCategoryDescendants(node.children));
      }
    });
    return ids;
  };

  /**
   * 查找分类节点
   */
  const findCategoryNode = (nodes: any[], id: string): any => {
    let result = null;
    nodes.some((node) => {
      if (String(node.id) === String(id)) {
        result = node;
        return true;
      }
      if (node.children) {
        const res = findCategoryNode(node.children, id);
        if (res) {
          result = res;
          return true;
        }
      }
      return false;
    });
    return result;
  };

  // 计算所有需要包含的分类 ID（包括选中分类的子分类）
  const allTargetCategoryIds = computed(() => {
    if (!selectedCategoryIds.value || selectedCategoryIds.value.length === 0)
      return [];

    let allIds: string[] = [];
    selectedCategoryIds.value.forEach((id) => {
      allIds.push(String(id));
      const node = findCategoryNode(categoryTreeData.value, id);
      if (node && node.children) {
        allIds = allIds.concat(getCategoryDescendants(node.children));
      }
    });
    // 去重
    return Array.from(new Set(allIds));
  });

  // 前端实现实时过滤
  const filteredConsumptionList = computed(() => {
    let list = rawConsumptionList.value;

    // 1. 部门筛选
    const selectedDeptNames = currentSelectedDeptNames.value.map((n) =>
      n.trim()
    );
    if (selectedDeptNames.length > 0) {
      list = list.filter((item) =>
        item.deptName ? selectedDeptNames.includes(item.deptName.trim()) : false
      );
    }

    // 2. 分类筛选
    const targetIds = allTargetCategoryIds.value;
    if (targetIds.length > 0) {
      list = list.filter((item) => {
        if (!item.categoryId) return false;
        const itemCatId = String(item.categoryId).trim();
        return targetIds.includes(itemCatId);
      });
    }

    // 3. 物品名称模糊搜索
    if (searchItemName.value) {
      const keyword = searchItemName.value.toLowerCase();
      list = list.filter((item) =>
        item.itemName ? item.itemName.toLowerCase().includes(keyword) : false
      );
    }

    return list;
  });

  // 抽屉状态
  const drawerVisible = ref(false);
  const currentDept = ref('');
  const currentItemId = ref('');
  const currentItemName = ref('');

  const handleModeChange = () => {
    if (filterMode.value === 'year') {
      rangeValue.value = [];
    } else {
      const current = dayjs();
      rangeValue.value = [
        current.startOf('year').format('YYYY-MM'),
        current.format('YYYY-MM'),
      ];
    }
    handleRefresh();
  };

  /**
   * 递归获取节点下所有的 deptName
   */
  const getAllChildDeptNames = (nodes: any[]): string[] => {
    let names: string[] = [];
    nodes.forEach((node) => {
      if (node.deptName && node.deptId !== 'ALL') {
        names.push(node.deptName);
      }
      if (node.children && node.children.length > 0) {
        names = names.concat(getAllChildDeptNames(node.children));
      }
    });
    return names;
  };

  /**
   * 查找指定 ID 的节点
   */
  const findNode = (nodes: any[], key: string): any => {
    let result = null;
    nodes.some((node) => {
      if (node.deptId === key) {
        result = node;
        return true;
      }
      if (node.children) {
        const res = findNode(node.children, key);
        if (res) {
          result = res;
          return true;
        }
      }
      return false;
    });
    return result;
  };

  const handleSelect = (keys: any[]) => {
    if (keys.length === 0) {
      selectedKeys.value = ['ALL'];
    }
    // 前端计算过滤，不需要重新调用接口
  };

  /**
   * 只有时间维度变化才请求后端
   */
  const handleRefresh = () => {
    const params: any = {};
    if (filterMode.value === 'year') {
      params.year = yearValue.value;
    } else if (rangeValue.value && rangeValue.value.length === 2) {
      const [start, end] = rangeValue.value;
      params.startMonth = start;
      params.endMonth = end;
    }

    fetchDeptConsumption(params);
  };

  const handleShowDetail = (record: any) => {
    currentDept.value = record.deptName;
    currentItemId.value = record.itemId;
    currentItemName.value = record.itemName;
    drawerVisible.value = true;
  };

  // 监听树数据加载完成
  watch(departmentTreeData, (val) => {
    if (val && val.length > 0) {
      expandedKeys.value = getAllKeys(treeData.value);
      handleRefresh();
    }
  });

  onMounted(() => {
    fetchCategoryData();
    // 初始由 treeData 的 computed 触发或在此延迟刷新
    if (departmentTreeData.value.length > 0) {
      handleRefresh();
    }
  });
</script>

<style scoped lang="less">
  .filter-toolbar {
    display: flex;
    align-items: center;
  }
  .overview-card {
    border-radius: 8px;
    border: 1px solid #e5e6eb;
    height: 100%;
    :deep(.arco-card-header) {
      border-bottom: 1px solid var(--color-border-1);
      height: 48px;
    }
    :deep(.arco-card-body) {
      padding: 0;
    }
  }

  .consumption-container {
    display: flex;
    height: 500px; /* 固定高度，支持内部滚动 */

    .org-tree-sider {
      width: 240px;
      border-right: 1px solid var(--color-border-1);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;

      .tree-header {
        height: 40px;
        line-height: 40px;
        padding-left: 16px;
        font-weight: bold;
        background-color: var(--color-fill-1);
        border-bottom: 1px solid var(--color-border-1);
      }

      .tree-content {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
        position: relative;
      }

      .tree-loading-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        color: var(--color-text-3);
      }
    }

    .table-content {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
    }
  }
</style>
