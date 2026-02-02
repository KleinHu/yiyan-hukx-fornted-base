<!-- 组件：我的待办 -->
<template>
  <a-card
    class="general-card"
    :bordered="false"
    :header-style="{ paddingBottom: '0' }"
    :body-style="{ padding: '16px 20px' }"
  >
    <template #title>
      <div class="card-title">
        <icon-branch class="title-icon" />
        <span>流程待办</span>
        <a-tag
          color="red"
          size="small"
          style="margin-left: 8px; border-radius: 10px"
        >
          {{ pendingCount }} 个待办
        </a-tag>
      </div>
    </template>
    <template #extra>
      <a-space>
        <a-link @click="handleSearch"><icon-refresh /></a-link>
        <a-link><icon-filter /></a-link>
      </a-space>
    </template>
    <div class="table-wrapper">
      <a-table
        :columns="COLUMNS"
        :data="list"
        :loading="loading"
        :pagination="pagination"
        :bordered="false"
        :scroll="{ x: 1200, y: 240 }"
        size="middle"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
      >
        <template #subject="{ record }">
          <div class="subject-cell">
            <div class="subject-icon">
              <icon-file style="color: #1890ff" />
            </div>
            <div class="subject-info">
              <div class="subject-title">{{ record.subject }}</div>
            </div>
          </div>
        </template>
        <template #status="{ record }">
          <a-tag
            :color="getStatusColor(record.status)"
            style="border-radius: 10px"
          >
            <template #icon>
              <icon-clock-circle v-if="record.status === 'UNHANDLE'" />
              <icon-check-circle v-else-if="record.status === 'DONE'" />
              <icon-close-circle v-else-if="record.status === 'REJECT'" />
            </template>
            {{ getStatusText(record.status) }}
          </a-tag>
        </template>
        <template #action="{ record }">
          <a-space size="small">
            <a-link @click="() => handleAction('handle', record)">办理</a-link>
            <a-link @click="() => handleAction('view', record)">查看</a-link>
          </a-space>
        </template>
      </a-table>
    </div>
  </a-card>
</template>

<script lang="ts" setup>
  import { TableColumnData } from '@arco-design/web-vue';
  import { ref, reactive, onMounted, computed } from 'vue';
  import { Pagination } from '@/types/global';
  // import { BpmTaskRecord } from '@/api/bpm/model/bpmTaskModel';
  import { getInfoByDefKeyInstId } from '@/api/bpm/bpm-instance';
  import { queryBpmMyTaskPage } from '@/api/bpm/bpm-task';
  import { openTask, openDraft, openDetail } from '@/utils/bpm/bpm-util';

  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
    showPageSize: true,
    showTotal: true,
  };
  const pagination = reactive({
    ...basePagination,
  });
  const onPageChange = (current: number) => {
    pagination.current = current;
    handleSearch();
  };
  const onPageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    handleSearch();
  };
  const list = ref<any[]>([]);
  const loading = ref<boolean>(false);

  const pendingCount = computed(() => {
    return list.value.filter((item) => item.status === 'UNHANDLE').length;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNHANDLE':
        return 'orange';
      case 'HANDLE':
        return 'blue';
      case 'DONE':
        return 'green';
      case 'REJECT':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'UNHANDLE':
        return '待处理';
      case 'HANDLE':
        return '审核中';
      case 'DONE':
        return '已通过';
      case 'REJECT':
        return '已拒绝';
      default:
        return status;
    }
  };

  onMounted(() => {
    handleSearch();
  });
  //   func: 查询
  const handleSearch = async () => {
    const params: any = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      params: {},
    };
    loading.value = true;
    try {
      const { data } = await queryBpmMyTaskPage(params);
      list.value = data.result.data;
      pagination.total = Number(data.result.totalCount);
    } finally {
      loading.value = false;
    }
  };
  const COLUMNS: TableColumnData[] = [
    {
      title: '流水号',
      dataIndex: 'billNo',
      width: 130,
    },
    { title: '标题', slotName: 'subject' },
    { title: '环节', dataIndex: 'name', width: 150 },
    {
      title: '提交人',
      dataIndex: 'applicantName',
      width: 120,
      render: ({ record }: { record: any }) => record.applicantName || '系统',
    },
    { title: '状态', slotName: 'status', width: 120 },
    {
      title: '应用',
      dataIndex: 'appId',
      width: 150,
    },
    { title: '时间', dataIndex: 'createTime', width: 180 },
    {
      title: '操作',
      slotName: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
    },
  ];

  const handleAction = async (key: string, record: any) => {
    const { instId, taskId, appId } = record;
    try {
      if (key === 'handle') {
        // 办理：打开任务详情页
        openTask(instId, taskId);
      } else if (key === 'view') {
        // 查看：打开流程实例详情页
        const { data } = await getInfoByDefKeyInstId({
          type: 'openDoc',
          id: instId,
          action: 'detail',
        });
        if (data.action === 'detail') {
          openDetail(appId || '', instId);
        }
        if (data.action === 'startDraft') {
          openDraft(data.defKey);
        }
      }
    } catch (error) {
      // empty
    }
  };
</script>

<style scoped lang="less">
  .general-card {
    border-radius: 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .table-wrapper {
    flex: 1;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;

    .title-icon {
      color: rgb(var(--arcoblue-6));
    }
  }

  .subject-cell {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .subject-icon {
    font-size: 16px;
    background-color: #f0f7ff;
    padding: 4px 6px;
    border-radius: 6px;
    border: 1px solid var(--color-border-2);
  }

  .subject-title {
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-1);
  }

  .subject-subtext {
    font-size: 12px;
    color: var(--color-text-4);
  }

  :deep(.arco-table-th) {
    background-color: var(--color-fill-1);
    color: var(--color-text-3);
    font-size: 11px;
    font-weight: bold;
    letter-spacing: 0.5px;
  }
</style>
