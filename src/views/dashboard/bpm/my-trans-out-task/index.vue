<!--我的转办-->
<template>
  <div class="list-card-container">
    <a-card :bordered="false" class="general-card bpm-dashboard-card">
      <template #title>
        <div class="card-header">
          <icon-export class="header-icon" />
          <span class="header-text">我的转办</span>
        </div>
      </template>
      <div class="bpm-tree-wrapper">
        <div class="bpm-tree-operator">
          <BpmCategoryTree
            cat-key="BPM"
            read-key="task.read"
            :statistic-config="statisticConfig"
            @select="handleSearchByTreeId"
          />
        </div>
        <div class="bpm-tree-content">
          <TableSearch
            ref="searchRef"
            :data-source="SEARCH_FORM"
            @change="handleSearch"
          />
          <a-table
            :columns="COLUMNS"
            :data="list"
            :pagination="pagination"
            @page-change="onPageChange"
            @page-size-change="onPageSizeChange"
          >
            <template #type="{ record }">
              <a-tag :color="typeMap[record.type].color" bordered size="small">
                <span>{{ typeMap[record.type].text }}</span>
              </a-tag>
            </template>
            <template #action="{ record }">
              <a-space>
                <retrieveModal
                  type="button"
                  :subject="record.subject"
                  :task-id="record.taskId"
                  :layerid="record.layerid"
                  :lydata="record.lydata"
                  @after-submit="handleSearch"
                />
                <a-button type="text" size="small" @click="gotoDetail(record)">
                  <template #icon><icon-eye /></template>
                  明细
                </a-button>
              </a-space>
            </template>
          </a-table>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { TableColumnData } from '@arco-design/web-vue';
  import { ref, reactive, onMounted } from 'vue';
  import { Pagination } from '@/types/global';
  import TableSearch from '@/components/cac-components/advanced-search/index.vue';
  import { getInfoByDefKeyInstId } from '@/api/bpm/bpm-instance';
  import { openDetail, openDraft } from '@/utils/bpm/bpm-util';
  import { BpmInstRecord } from '@/api/bpm/model/bpmInstanceModel';
  import { BpmMyTransOutTaskParams } from '@/api/bpm/model/bpmTaskTransferModel';
  import { querMyTransOutTaskdPage } from '@/api/bpm/bpm-task-transfer';
  import BpmCategoryTree from '@/components/bpm/tree-category.vue';
  import retrieveModal from './components/retrieve-modal.vue';

  const SEARCH_FORM: any[] = [
    { fieldName: 'Q_SUBJECT__S_LK', labelText: '事项标题', type: 'text' },
    {
      fieldName: 'Q_CREATE_TIME__D_GE',
      labelText: '任务创建开始时间',
      type: 'datetime',
      showtime: false,
      format: 'YYYY-MM-DD',
    },
    {
      fieldName: 'Q_CREATE_TIME__D_LE',
      labelText: '任务创建结束时间',
      type: 'datetime',
      showtime: false,
      format: 'YYYY-MM-DD',
    },
  ];
  const typeMap: any = {
    transfer: { color: 'green', text: '转办' },
    agent: { color: 'red', text: '代理' },
  };
  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
    showPageSize: true,
    showTotal: true,
  };
  const pagination = reactive({
    ...basePagination,
  });
  const searchRef = ref<any>();
  const onPageChange = (current: number) => {
    pagination.current = current;
    searchRef.value.handleSubmit(); // 与搜索结果保持一致
  };
  const onPageSizeChange = (pageSize: number) => {
    pagination.pageSize = pageSize;
    searchRef.value.handleSubmit(); // 与搜索结果保持一致
  };
  const list = ref<any[]>([]);
  const loading = ref<boolean>(false);
  const statisticConfig: any = {
    type: 'static_bpm',
    table: 'BPM_TASK_TRANSFER',
    field: 'TREE_ID_',
    whereConf: [
      {
        name: 'OWNER_ID_',
        type: 'string',
        dateFormat: '',
        op: '=',
        value: 'curUserId',
        valueType: 'context',
      },
    ],
  };
  onMounted(() => {
    handleSearch();
  });
  // func: 查询
  const handleSearch = async (reqdata?: BpmMyTransOutTaskParams) => {
    const { Q_CREATE_TIME__D_GE, Q_CREATE_TIME__D_LE, ...res } = reqdata || {};
    let startTime;
    let endTime;
    if (Q_CREATE_TIME__D_GE) {
      startTime = new Date(Q_CREATE_TIME__D_GE);
    }
    if (Q_CREATE_TIME__D_LE) {
      endTime = new Date(Q_CREATE_TIME__D_LE);
    }
    const params: any = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      params: {
        ...res,
        CREATE_TIME__D_GE: startTime,
        CREATE_TIME__D_LE: endTime,
      },
      //   sortField: '',
      //   sortOrder: 'asc',
    };
    loading.value = true;
    try {
      const { data } = await querMyTransOutTaskdPage(params);
      list.value = data.result.data;
      // console.log('list', list.value);
      pagination.total = Number(data.result.totalCount);
    } finally {
      loading.value = false;
    }
  };
  // 根据流程分类查询
  const handleSearchByTreeId = async (treeId: string[]) => {
    if (treeId[0] === '0') {
      treeId[0] = '';
    }
    const params: any = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      params: {
        Q_TREE_ID__S_EQ: treeId?.[0],
      },
      //   sortField: '',
      //   sortOrder: 'asc',
    };
    loading.value = true;
    try {
      const { data } = await querMyTransOutTaskdPage(params);
      list.value = data.result.data;
      // console.log('list', list.value);
      pagination.total = Number(data.result.totalCount);
    } finally {
      loading.value = false;
    }
  };
  //   const doRemoveTracked = async (instId: string) => {
  //     try {
  //       const { data } = await removeTracked(instId);
  //       Message.success(data.message);
  //     } finally {
  //       handleSearch();
  //     }
  //   };
  const COLUMNS: TableColumnData[] = [
    {
      title: '序号',
      align: 'center',
      dataIndex: 'index',
      width: 80,
      render: ({ rowIndex }: { rowIndex: number }) => rowIndex + 1,
      fixed: 'left',
    },
    {
      title: '事项标题',
      dataIndex: 'subject',
      width: 180,
      ellipsis: false,
    },
    {
      title: '类型',
      dataIndex: 'type',
      slotName: 'type',
      width: 80,
    },
    {
      title: '发送时间',
      dataIndex: 'createTime',
      width: 100,
    },
    {
      title: '所属应用',
      dataIndex: 'appId',
      width: 120,
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: 100,
      fixed: 'right',
      slotName: 'action',
    },
  ];
  const gotoDetail = async (record: BpmInstRecord) => {
    const { appId, instId } = record;
    try {
      const { data } = await getInfoByDefKeyInstId({
        type: 'openDoc',
        id: instId,
        action: 'detail',
      });
      if (data.action === 'detail') {
        openDetail(appId, instId);
      }
      if (data.action === 'startDraft') {
        openDraft(data.defKey);
      }
    } finally {
      // empty
    }
  };
  //   const removeMyTracked = async (instId: string) => {
  //     Modal.warning({
  //       title: '警告',
  //       content: '确定取消跟踪吗',
  //       hideCancel: false,
  //       onOk: () => doRemoveTracked(instId),
  //     });
  //   };
</script>

<style scoped lang="less">
  .list-card-container {
    padding: 20px;
  }

  .bpm-dashboard-card {
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

    :deep(.arco-card-header) {
      border-bottom: 1px solid var(--color-border-1);
      padding: 16px 20px;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;

    .header-icon {
      font-size: 18px;
      color: var(--color-primary-light-4);
    }

    .header-text {
      font-weight: 600;
      font-size: 16px;
    }
  }

  .bpm-tree {
    &-wrapper {
      overflow: hidden;
      margin-top: 10px;
    }

    &-operator {
      float: left;
      width: 220px;
      height: 100%;
      border-right: 1px solid var(--color-border-1);
      padding-right: 16px;
    }

    &-content {
      margin-left: 236px;
      padding-left: 4px;
      min-height: 500px;
    }
  }

  :deep(.arco-table-th) {
    background-color: var(--color-fill-1);
    font-weight: 600;
  }
</style>
