<template>
  <div class="container">
    <Breadcrumb :items="['办公用品管理', '我的领用']" />
    <a-card class="general-card" title="我的领用申请">
      <template #extra>
        <a-button type="primary" @click="handleGoApply">
          <template #icon><icon-plus /></template>
          物品领用
        </a-button>
      </template>

      <!-- 筛选区域 -->
      <a-row style="margin-bottom: 20px">
        <a-col :span="24">
          <a-space>
            <a-radio-group
              v-model="queryParams.auditStatus"
              type="button"
              size="small"
              @change="onFilterChange"
            >
              <a-radio :value="-1">全部</a-radio>
              <a-radio :value="0">待审核</a-radio>
              <a-radio :value="1">已通过</a-radio>
              <a-radio :value="3">已发放</a-radio>
              <a-radio :value="2">已驳回</a-radio>
            </a-radio-group>
            <a-input-search
              v-model="queryParams.orderNo"
              placeholder="搜索单号"
              style="width: 240px"
              size="small"
              allow-clear
              @search="onFilterChange"
            />
            <a-button size="small" @click="handleReset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </a-col>
      </a-row>

      <!-- 表格区域 -->
      <a-table
        row-key="id"
        :loading="loading"
        :columns="columns"
        :data="list"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      >
        <template #index="{ rowIndex }">
          {{ (pagination.current - 1) * pagination.pageSize + rowIndex + 1 }}
        </template>
        <template #items="{ record }">
          <span v-if="record.items && record.items.length">
            <template v-for="(item, index) in record.items" :key="index">
              {{ item.itemName }}
              <span v-if="item.spec" style="color: #86909c">
                ({{ item.spec }})
              </span>
              x{{ item.quantity }}
              <span v-if="index < record.items.length - 1">，</span>
            </template>
          </span>
          <span v-else>-</span>
        </template>
        <template #auditStatus="{ record }">
          <a-tag :color="getStatusColor(record.auditStatus)">
            {{ getStatusLabel(record.auditStatus) }}
          </a-tag>
        </template>
        <template #operations="{ record }">
          <a-button type="text" size="small" @click="handleViewDetail(record)">
            详情
          </a-button>
        </template>
      </a-table>
    </a-card>

    <!-- 详情抽屉 -->
    <apply-detail-drawer
      v-model:visible="detailVisible"
      :record="currentRecord"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import useSuppliesRequest from '@/hooks/supplies/useSuppliesRequest';
  import ApplyDetailDrawer from './components/ApplyDetailDrawer.vue';

  const router = useRouter();
  const { list, loading, pagination, queryParams, fetchMyPage } =
    useSuppliesRequest();

  const columns = [
    {
      title: '序号',
      slotName: 'index',
      width: 70,
      align: 'center',
    },
    { title: '申请单号', dataIndex: 'orderNo', width: 200 },
    {
      title: '领用物品',
      slotName: 'items',
      ellipsis: true,
      tooltip: true,
    },
    { title: '状态', slotName: 'auditStatus', width: 100 },
    { title: '申请时间', dataIndex: 'applyTime', width: 180 },

    {
      title: '操作',
      slotName: 'operations',
      width: 100,
      fixed: 'right' as const,
    },
  ];

  const onFilterChange = () => {
    fetchMyPage({ pageNo: 1 });
  };

  const onPageChange = (current: number) => {
    fetchMyPage({ pageNo: current });
  };

  const onPageSizeChange = (size: number) => {
    fetchMyPage({ pageSize: size, pageNo: 1 });
  };

  const handleReset = () => {
    queryParams.value.auditStatus = -1;
    queryParams.value.orderNo = '';
    onFilterChange();
  };

  const handleGoApply = () => {
    router.push({ name: 'item-apply-20260111' });
  };

  // 详情逻辑
  const detailVisible = ref(false);
  const currentRecord = ref<any>(null);

  const handleViewDetail = (record: any) => {
    currentRecord.value = record;
    detailVisible.value = true;
  };

  const getStatusLabel = (status: number) => {
    const map: Record<number, string> = {
      0: '待审核',
      1: '已通过',
      2: '已驳回',
      3: '已发放',
    };
    return map[status] || '未知';
  };

  const getStatusColor = (status: number) => {
    const map: Record<number, string> = {
      0: 'orange',
      1: 'green',
      2: 'red',
      3: 'blue',
    };
    return map[status] || 'gray';
  };

  onMounted(() => {
    fetchMyPage();
  });
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
