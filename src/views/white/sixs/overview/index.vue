<template>
  <div class="container">
    <!-- 统计卡片 - 支持点击联动 & 内嵌年份选择 -->
    <StatsCard
      v-model="activeLevel"
      :total="stats.totalCount"
      :excellent="stats.excellentCount"
      :warning="stats.warningCount"
      :serious="stats.seriousCount"
      @change="handleLevelChange"
    >
      <template #year-selector>
        <a-date-picker
          v-model="currentYear"
          value-format="YYYY"
          style="width: 100%"
          mode="year"
          size="small"
          :bordered="false"
          placeholder="请选择"
          @change="handleYearChange"
        />
      </template>
    </StatsCard>

    <div class="list-section">
      <div class="list-header">
        <div class="list-title">{{ listTitle }}</div>
        <a-space>
          <div class="list-count">共找到 {{ pagination.total }} 条记录</div>
          <a-divider direction="vertical" />
          <a-tree-select
            v-model="filterDeptId"
            :data="departmentOptions"
            placeholder="筛选部门"
            allow-clear
            style="width: 220px"
            :field-names="{
              key: 'deptId',
              title: 'deptName',
              children: 'children',
            }"
            @change="handleDeptChange"
          />
          <a-button type="outline" @click="handleRefresh">
            <template #icon>
              <icon-refresh :spin="listLoading" />
            </template>
            刷新
          </a-button>
        </a-space>
      </div>

      <a-spin :loading="listLoading" style="width: 100%">
        <a-grid :cols="3" :col-gap="12" :row-gap="12">
          <a-grid-item v-for="item in accountList" :key="item.id">
            <AccountCard :item="item" @click="handleCardClick" />
          </a-grid-item>
        </a-grid>

        <div
          v-if="accountList.length === 0 && !listLoading"
          class="empty-status"
        >
          <a-empty />
        </div>

        <div class="pagination-wrapper">
          <a-pagination
            v-model:current="pagination.current"
            v-model:page-size="pagination.pageSize"
            :total="pagination.total"
            :page-size-options="[20, 30, 40, 60, 80, 100]"
            show-total
            show-jumper
            show-page-size
            @change="handlePageChange"
            @page-size-change="handlePageSizeChange"
          />
        </div>
      </a-spin>
    </div>

    <!-- 人员详情弹窗 - 开启简易展示模式 -->
    <WhiteAccountDetailModal
      v-model:visible="detailVisible"
      :item="selectedItem"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import dayjs from 'dayjs';
  import useAccount from '@/hooks/sixs/useAccount';
  import useDepartmentTree from '@/hooks/hr/department';
  import type { SixSAccount } from '@/api/sixs/model/sixsModel';

  // 引入原功能页面的组件
  import StatsCard from '@/views/sixs/overview/components/StatsCard.vue';
  import AccountCard from '@/views/sixs/overview/components/AccountCard.vue';
  import WhiteAccountDetailModal from './components/WhiteAccountDetailModal.vue';

  // 状态
  const detailVisible = ref(false);
  const selectedItem = ref<SixSAccount>({} as SixSAccount);

  const {
    list: accountList,
    stats,
    loading: listLoading,
    pagination,
    fetchPage,
    fetchStatistics,
  } = useAccount({ autoLoad: false });
  pagination.pageSize = 30;

  const { departmentTreeData, findDepartmentById } = useDepartmentTree({
    autoLoad: true,
  });
  const departmentOptions = computed(() => departmentTreeData.value || []);

  // 部门筛选
  const filterDeptId = ref<string>();
  const filterDepartmentIds = ref<string[]>([]);

  // 年份选择
  const currentYear = ref(dayjs().year().toString());

  // 筛选级别：all, excellent, warning, serious
  const activeLevel = ref('all');

  // 列表标题
  const listTitle = computed(() => {
    switch (activeLevel.value) {
      case 'excellent':
        return '优秀状态人员';
      case 'warning':
        return '警告状态人员';
      case 'serious':
        return '严重状态人员';
      default:
        return '所有人员';
    }
  });

  const fetchStats = () => fetchStatistics(Number(currentYear.value));

  const fetchList = () =>
    fetchPage({
      year: Number(currentYear.value),
      status: 1,
      scoreLevel: activeLevel.value === 'all' ? undefined : activeLevel.value,
      departmentIds:
        filterDepartmentIds.value.length > 0
          ? filterDepartmentIds.value
          : undefined,
    });

  const handleRefresh = () => {
    fetchStats();
    fetchList();
  };

  const handleYearChange = () => {
    pagination.current = 1;
    fetchStats();
    fetchList();
  };

  const handleDeptChange = (val: any) => {
    filterDeptId.value = val;
    if (!val) {
      filterDepartmentIds.value = [];
    } else {
      const node = findDepartmentById(val);
      if (node) {
        const ids: string[] = [];
        const collect = (n: any) => {
          ids.push(n.deptId);
          if (n.children && n.children.length > 0) {
            n.children.forEach(collect);
          }
        };
        collect(node);
        filterDepartmentIds.value = ids;
      } else {
        filterDepartmentIds.value = [];
      }
    }
    pagination.current = 1;
    fetchList();
  };

  const handleLevelChange = () => {
    pagination.current = 1;
    fetchList();
  };

  const handlePageChange = (current: number) => {
    pagination.current = current;
    fetchList();
  };

  const handlePageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchList();
  };

  const handleCardClick = (item: SixSAccount) => {
    selectedItem.value = item;
    detailVisible.value = true;
  };

  onMounted(() => {
    fetchStats();
    fetchList();
  });
</script>

<style scoped lang="less">
  .container {
    padding: 12px;
    background-color: #f7f8fa;
    min-height: 100vh;
  }

  .list-section {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    margin-top: 12px;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .list-title {
    font-size: 16px;
    font-weight: 700;
    color: #1d2129;
  }

  .list-count {
    font-size: 13px;
    color: #86909c;
  }

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .empty-status {
    padding: 30px 0;
  }

  /* 响应式布局 - 适配 iframe 小窗口 */
  @media (max-width: 1200px) {
    .container {
      padding: 8px;
    }
    .list-section {
      padding: 12px;
      margin-top: 8px;
    }
    .list-header {
      margin-bottom: 12px;
    }
    .list-title {
      font-size: 14px;
    }
    .list-count {
      font-size: 12px;
    }
    /* 操作区域紧凑排列 */
    :deep(.arco-space) {
      gap: 8px !important;
    }
    :deep(.arco-tree-select) {
      width: 160px !important;
    }
  }

  @media (max-width: 768px) {
    .container {
      padding: 6px;
    }
    .list-section {
      padding: 10px;
      border-radius: 6px;
    }
    .list-title {
      font-size: 13px;
    }
    .list-count {
      font-size: 11px;
    }
    .list-header {
      gap: 6px;
    }
    :deep(.arco-tree-select) {
      width: 140px !important;
    }
    :deep(.arco-button) {
      padding: 0 12px !important;
    }
    .pagination-wrapper {
      margin-top: 12px;
      :deep(.arco-pagination) {
        flex-wrap: wrap;
        justify-content: center;
      }
    }
  }

  /* iframe 小窗口优化 - 保持操作栏在同一行 */
  @media (max-width: 600px) {
    .container {
      padding: 4px;
      min-height: auto;
    }
    .list-section {
      padding: 8px;
      margin-top: 6px;
    }
    .list-header {
      margin-bottom: 10px;
      gap: 4px;
    }
    .list-title {
      font-size: 12px;
      white-space: nowrap;
    }
    .list-count {
      display: none; /* 超小屏隐藏记录数 */
    }
    :deep(.arco-divider) {
      display: none; /* 隐藏分隔线 */
    }
    :deep(.arco-tree-select) {
      width: 120px !important;
      font-size: 12px !important;
    }
    :deep(.arco-button) {
      padding: 0 8px !important;
      font-size: 12px !important;
    }
  }
</style>
