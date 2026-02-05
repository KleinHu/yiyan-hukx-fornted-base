<template>
  <div class="container">
    <a-breadcrumb class="container-breadcrumb">
      <a-breadcrumb-item>6S 管理</a-breadcrumb-item>
      <a-breadcrumb-item>概览统计</a-breadcrumb-item>
    </a-breadcrumb>

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
          <a-button type="primary" status="success" @click="handleAdd">
            <template #icon>
              <icon-plus />
            </template>
            新增台账
          </a-button>
          <a-button type="outline" @click="handleRefresh">
            <template #icon>
              <icon-refresh :spin="listLoading" />
            </template>
            刷新
          </a-button>
        </a-space>
      </div>

      <a-spin :loading="listLoading" style="width: 100%">
        <a-grid
          :cols="{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5 }"
          :col-gap="16"
          :row-gap="16"
        >
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

    <!-- 人员详情弹窗 -->
    <AccountDetailModal
      v-model:visible="detailVisible"
      :item="selectedItem"
      @success="handleModalSuccess"
    />

    <!-- 新增台账抽屉 -->
    <AccountFormDrawer
      ref="formDrawerRef"
      v-model:visible="drawerVisible"
      :department-options="departmentOptions"
      @submit="handleDrawerSubmit"
      @open-employee-select="openEmployeeSelect"
    />

    <!-- 员工选择弹窗 -->
    <EmployeeSelectorModal
      v-model:visible="employeeSelectVisible"
      :default-selected-employees="defaultEmployeesForSelector"
      @submit="onEmployeeSelect"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import dayjs from 'dayjs';
  import useAccount from '@/hooks/sixs/useAccount';
  import useDepartmentTree from '@/hooks/hr/department';
  import type { SixSAccount } from '@/api/sixs/model/sixsModel';
  import type { Employee } from '@/api/hr/types';
  import EmployeeSelectorModal from '@/components/hr/EmployeeSelectorModal.vue';
  import StatsCard from './components/StatsCard.vue';
  import AccountCard from './components/AccountCard.vue';
  import AccountDetailModal from './components/AccountDetailModal.vue';
  import AccountFormDrawer from './components/AccountFormDrawer.vue';

  // 接口定义
  interface AccountFormDrawerExposed {
    form: {
      selectedEmployees?: Employee[];
    };
    fillEmployees(employees: Employee[]): void;
  }

  // 状态
  const detailVisible = ref(false);
  const selectedItem = ref<SixSAccount>({} as SixSAccount);

  // 新增相关状态
  const drawerVisible = ref(false);
  const employeeSelectVisible = ref(false);
  const formDrawerRef = ref<AccountFormDrawerExposed | null>(null);

  const {
    list: accountList,
    stats,
    loading: listLoading,
    pagination,
    save,
    saveBatch,
    fetchPage,
    fetchStatistics,
  } = useAccount({ autoLoad: false });
  pagination.pageSize = 30;

  const { departmentTreeData, findDepartmentById } = useDepartmentTree({
    autoLoad: true,
  });
  const departmentOptions = computed(() => departmentTreeData.value || []);

  const defaultEmployeesForSelector = computed(() => {
    return formDrawerRef.value?.form.selectedEmployees ?? [];
  });

  // 部门筛选
  const filterDeptId = ref<string>();
  const filterDepartmentIds = ref<string[]>([]);

  // 年份选择
  const currentYear = ref(dayjs().year().toString());

  // 筛选级别：all, excellent, warning, serious
  const activeLevel = ref('all');

  // 列表标题 - 匹配 p3
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

  // 统计数据 (已移至 Hook stats)

  // 列表数据 (已移至 Hook accountList, listLoading, pagination)

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

  const handleModalSuccess = () => {
    fetchStats();
    fetchList();
  };

  // 新增台账逻辑
  const handleAdd = () => {
    drawerVisible.value = true;
  };

  const handleDrawerSubmit = async (data: SixSAccount | SixSAccount[]) => {
    if (Array.isArray(data)) {
      const year = data[0]?.year ?? dayjs().year();
      await saveBatch({ year, list: data });
    } else {
      await save(data);
    }
    drawerVisible.value = false;
    handleRefresh();
  };

  const openEmployeeSelect = () => {
    employeeSelectVisible.value = true;
  };

  const onEmployeeSelect = (employees: Employee[]) => {
    formDrawerRef.value?.fillEmployees(employees);
  };

  onMounted(() => {
    fetchStats();
    fetchList();
  });
</script>

<style scoped>
  .container {
    padding: 0 24px 24px 24px;
    background-color: #f7f8fa; /* p2 背景色 */
    min-height: 100vh;
  }

  .header-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 16px 0 24px 0;
  }

  .title {
    font-size: 20px;
    font-weight: 700;
    color: #1d2129;
  }

  .list-section {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .list-title {
    font-size: 18px;
    font-weight: 700;
    color: #1d2129;
  }

  .list-count {
    font-size: 14px;
    color: #86909c;
  }

  .pagination-wrapper {
    margin-top: 32px;
    display: flex;
    justify-content: flex-end;
  }

  .empty-status {
    padding: 40px 0;
  }

  /* 适配面包屑样式 */
  .container-breadcrumb {
    margin: 16px 0;
  }
</style>
