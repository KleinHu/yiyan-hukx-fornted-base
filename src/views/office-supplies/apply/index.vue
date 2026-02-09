<template>
  <div class="container">
    <Breadcrumb :items="['办公用品管理', '领用审批']" />
    <a-card class="general-card" title="领用审批">
      <!-- 顶部操作与筛选 -->
      <a-row justify="space-between" align="center" style="margin-bottom: 20px">
        <a-col :span="16">
          <a-space>
            <a-button type="primary" @click="handleApply">
              <template #icon><icon-plus /></template>
              新建领用申请
            </a-button>
            <a-divider direction="vertical" />
            <a-radio-group
              v-model="queryParams.auditStatus"
              type="button"
              @change="fetchPage({ pageNo: 1 })"
            >
              <a-radio :value="-1">全部</a-radio>
              <a-radio :value="0">待审核</a-radio>
              <a-radio :value="3">已通过</a-radio>
              <a-radio :value="2">已驳回</a-radio>
            </a-radio-group>
          </a-space>
        </a-col>
        <a-col :span="8" style="text-align: right">
          <a-space>
            <a-input-search
              placeholder="搜索单号/申请人"
              style="width: 240px"
              allow-clear
            />
            <a-button @click="handleReset">
              <template #icon><icon-refresh /></template>
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <!-- 领用表格 -->
      <RequestTable
        :data="list"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        @audit="handleAuditTrigger"
        @view="handleViewTrigger"
      />
    </a-card>

    <!-- 申请抽屉 -->
    <ApplyDrawer v-model:visible="applyVisible" @submit="handleApplySubmit" />

    <!-- 审核抽屉 -->
    <AuditDrawer
      v-model:visible="auditVisible"
      :initial-data="currentItem"
      :loading="loading"
      @submit="handleAuditSubmit"
    />

    <!-- 详情弹窗 -->
    <a-modal
      v-model:visible="viewModalVisible"
      title="申请单详情"
      width="700px"
      :footer="false"
    >
      <a-descriptions
        :data="detailData"
        :column="2"
        bordered
        title="基础信息"
        size="small"
      />
      <div style="margin-top: 20px; font-weight: bold; margin-bottom: 10px">
        领用明细
      </div>
      <a-table
        :data="currentItem?.items"
        :pagination="false"
        :bordered="{ wrapper: true, cell: true }"
        size="small"
      >
        <template #columns>
          <a-table-column title="物品名称" data-index="itemName" />
          <a-table-column title="规格" data-index="spec" />
          <a-table-column
            title="数量"
            data-index="quantity"
            width="100"
            align="center"
          />
          <a-table-column
            title="单位"
            data-index="unit"
            width="80"
            align="center"
          />
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import useSuppliesRequest from '@/hooks/supplies/useSuppliesRequest';
  import ApplyDrawer from './components/ApplyDrawer.vue';
  import AuditDrawer from './components/AuditDrawer.vue';
  import RequestTable from './components/RequestTable.vue';

  const { list, loading, pagination, queryParams, fetchPage, apply, audit } =
    useSuppliesRequest();

  onMounted(() => {
    fetchPage();
  });

  const onPageChange = (current: number) => {
    fetchPage({ pageNo: current });
  };

  const onPageSizeChange = (size: number) => {
    fetchPage({ pageSize: size, pageNo: 1 });
  };

  const handleReset = () => {
    queryParams.value.auditStatus = -1;
    fetchPage({ pageNo: 1 });
  };

  // 申请逻辑
  const applyVisible = ref(false);
  const handleApply = () => {
    applyVisible.value = true;
  };
  const handleApplySubmit = async (data: any) => {
    const success = await apply(data);
    if (success) {
      applyVisible.value = false;
      fetchPage({ pageNo: 1 });
    }
  };

  // 审核逻辑
  const auditVisible = ref(false);
  const currentItem = ref<any>(null);
  const handleAuditTrigger = (record: any) => {
    currentItem.value = record;
    auditVisible.value = true;
  };
  const handleAuditSubmit = async (
    id: string,
    status: number,
    remark?: string,
    items?: any[],
    operatorName?: string
  ) => {
    const success = await audit(id, status, remark, items, operatorName);
    if (success) {
      auditVisible.value = false;
      fetchPage({ pageNo: 1 });
    }
  };

  // 详情逻辑
  const viewModalVisible = ref(false);
  const handleViewTrigger = (record: any) => {
    currentItem.value = record;
    viewModalVisible.value = true;
  };

  const detailData = computed(() => {
    if (!currentItem.value) return [];
    const item = currentItem.value;
    return [
      { label: '单号', value: item.orderNo },
      { label: '申请人', value: item.userName },
      { label: '工号', value: item.userCode },
      { label: '部门', value: item.deptName },
      { label: '申请时间', value: item.applyTime },
      { label: '状态', value: getStatusLabel(item.auditStatus) },
      { label: '事由', value: item.reason, span: 2 },
      { label: '审核人', value: item.auditorName || '-' },
      { label: '审核时间', value: item.auditTime || '-' },
      { label: '审核结论', value: item.remark || '-', span: 2 },
    ];
  });

  const getStatusLabel = (status: number) => {
    const map: Record<number, string> = {
      0: '待审核',
      1: '已通过',
      2: '已驳回',
      3: '已发放',
    };
    return map[status] || '未知';
  };
</script>

<style scoped lang="less">
  .container {
    padding: 16px 20px 20px 20px;
    background-color: #f7f9fb;
    min-height: calc(100vh - 60px);

    :deep(.arco-card) {
      border-radius: 8px;
      border: 1px solid #e5e6eb;
    }
  }
</style>
