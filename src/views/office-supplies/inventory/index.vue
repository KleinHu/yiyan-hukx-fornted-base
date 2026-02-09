<template>
  <div class="container">
    <Breadcrumb :items="['办公用品管理', '库存流水']" />
    <a-card class="general-card" title="库存台账 (出入库流水)">
      <!-- 搜索栏 -->
      <a-row style="margin-bottom: 24px">
        <a-col :span="24">
          <a-form
            :model="queryParams"
            label-align="left"
            :label-col-props="{ span: 6, offset: 0 }"
            :wrapper-col-props="{ span: 18, offset: 0 }"
            layout="inline"
            @submit="fetchPage({ pageNo: 1 })"
          >
            <a-form-item label="物品名称">
              <a-input
                v-model="queryParams.itemName"
                placeholder="名称/规格部分匹配"
                allow-clear
              />
            </a-form-item>
            <a-form-item label="变动类型">
              <a-select
                v-model="queryParams.type"
                placeholder="全部"
                allow-clear
                style="width: 140px"
              >
                <a-option :value="1">入库</a-option>
                <a-option :value="2">出库</a-option>
              </a-select>
            </a-form-item>
            <a-form-item label="变动场景">
              <a-select
                v-model="queryParams.scenario"
                placeholder="全部"
                allow-clear
                style="width: 160px"
              >
                <a-option :value="1">采购</a-option>
                <a-option :value="2">领用</a-option>
                <a-option :value="3">盘点</a-option>
                <a-option :value="4">退库</a-option>
                <a-option :value="5">报损</a-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="fetchPage({ pageNo: 1 })">
                  <template #icon><icon-search /></template>
                  查询
                </a-button>
                <a-button @click="handleReset">
                  <template #icon><icon-refresh /></template>
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-col>
      </a-row>

      <a-divider style="margin-top: 0" />

      <!-- 表格内容 -->
      <a-table
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="columns"
        :data="list"
        :bordered="{ wrapper: true, cell: true }"
        stripe
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      >
        <template #index="{ rowIndex }">
          {{ (pagination.current - 1) * pagination.pageSize + rowIndex + 1 }}
        </template>
        <template #type="{ record }">
          <a-tag :color="record.type === 1 ? 'green' : 'orange'" bordered>
            {{ record.type === 1 ? '入库' : '出库' }}
          </a-tag>
        </template>
        <template #scenario="{ record }">
          {{ scenarioLabel(record.scenario) }}
        </template>
        <template #quantity="{ record }">
          <span
            :style="{
              color: record.type === 1 ? '#00b42a' : '#ff7d00',
              fontWeight: 'bold',
            }"
          >
            {{ record.type === 1 ? '+' : '-' }}{{ record.quantity }}
          </span>
        </template>
        <template #creatorName="{ record }">
          {{ record.creatorName || '-' }}
          <span v-if="record.creator" style="color: #86909c; margin-left: 4px">
            ({{ record.creator }})
          </span>
        </template>
        <template #operations="{ record }">
          <a-button type="text" size="small" @click="handleShowDetail(record)">
            详情
          </a-button>
        </template>
      </a-table>
    </a-card>

    <!-- 详情说明抽屉 -->
    <RecordDetailDrawer
      v-model:visible="detailVisible"
      :record="currentRecord"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import useInventoryRecord from '@/hooks/supplies/useInventoryRecord';
  import { IconSearch, IconRefresh } from '@arco-design/web-vue/es/icon';
  import RecordDetailDrawer from './components/RecordDetailDrawer.vue';

  const { list, loading, pagination, queryParams, fetchPage } =
    useInventoryRecord();

  const detailVisible = ref(false);
  const currentRecord = ref<any>(null);

  const handleShowDetail = (record: any) => {
    currentRecord.value = record;
    detailVisible.value = true;
  };

  const columns = [
    { title: '序号', slotName: 'index', width: 60, align: 'center' },
    { title: '发生时间', dataIndex: 'createTime', width: 180 },
    { title: '物品名称', dataIndex: 'itemName' },
    { title: '规格', dataIndex: 'spec' },
    { title: '类型', slotName: 'type', width: 80, align: 'center' },
    { title: '场景', slotName: 'scenario', width: 100, align: 'center' },
    { title: '变动数量', slotName: 'quantity', width: 100, align: 'right' },
    { title: '关联单号', dataIndex: 'relNo', width: 180 },
    { title: '操作人', slotName: 'creatorName', width: 150 },
    { title: '操作', slotName: 'operations', width: 100, align: 'center' },
  ];

  const scenarioLabel = (scenario: number) => {
    const map: Record<number, string> = {
      1: '采购',
      2: '领用',
      3: '盘点',
      4: '退库',
      5: '报损',
    };
    return map[scenario] || '未知';
  };

  const handleReset = () => {
    queryParams.itemName = undefined;
    queryParams.type = undefined;
    queryParams.scenario = undefined;
    fetchPage({ pageNo: 1 });
  };

  const onPageChange = (current: number) => {
    fetchPage({ pageNo: current });
  };

  const onPageSizeChange = (size: number) => {
    fetchPage({ pageSize: size, pageNo: 1 });
  };

  onMounted(() => {
    fetchPage();
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
