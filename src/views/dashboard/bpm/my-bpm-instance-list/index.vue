<!--我的申请-->
<template>
  <div class="list-card-container">
    <a-card :bordered="false" class="general-card bpm-dashboard-card">
      <template #title>
        <div class="card-header">
          <icon-list class="header-icon" />
          <span class="header-text">我的申请</span>
        </div>
      </template>
      <div class="bpm-tree-wrapper">
        <div class="bpm-tree-operator">
          <BpmCategoryTree
            cat-key="BPM"
            read-key="inst.read"
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
            <template #status="{ record }">
              <a-tag
                :color="statusMap[record.status].color"
                bordered
                size="small"
              >
                <span>{{ statusMap[record.status].text }}</span>
              </a-tag>
            </template>
            <template #assignee="{ record }">
              <a-space :size="4">
                <a-tag
                  v-for="taskExe in record.taskExecutors"
                  :key="taskExe.id"
                  size="small"
                  color="blue"
                  bordered
                >
                  <template #icon>
                    <icon-user v-if="taskExe.type === 'user'" />
                    <icon-user-group v-else />
                  </template>
                  {{ taskExe.name }}
                </a-tag>
              </a-space>
            </template>
            <template #action="{ record }">
              <a-space>
                <a-button type="text" size="small" @click="gotoDetail(record)">
                  <template #icon><icon-eye /></template>
                  明细
                </a-button>
                <a-button
                  v-if="record.status === 'DRAFTED'"
                  type="text"
                  size="small"
                  @click="startFlow(record)"
                >
                  <template #icon><icon-play-arrow /></template>
                  启动
                </a-button>
                <a-button
                  v-else-if="record.status === 'SUPSPEND'"
                  type="text"
                  size="small"
                  @click="restoreInst(record)"
                >
                  <template #icon><icon-refresh /></template>
                  恢复
                </a-button>
                <a-button
                  v-else-if="record.status === 'RUNNING'"
                  type="text"
                  size="small"
                  @click="supspendInst(record)"
                >
                  <template #icon><icon-pause /></template>
                  暂停
                </a-button>
                <a-button v-else type="text" size="small" disabled>
                  <template #icon><icon-pause /></template>
                  暂停
                </a-button>
                <a-dropdown>
                  <a-button type="text" size="small">
                    <template #icon><icon-more /></template>
                    更多
                  </a-button>
                  <template #content>
                    <a-doption
                      v-if="
                        record.status !== 'DRAFT' &&
                        record.status !== 'CANCEL' &&
                        record.status !== 'ARCHIVED'
                      "
                      @click="openCancel(record.instId)"
                      >作废</a-doption
                    >
                    <a-doption @click="delById(record.instId)">
                      删除
                    </a-doption>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </a-table>
        </div>
      </div>
    </a-card>

    <!--对话框：流程作废-->
    <ModalInstanceancel
      v-model:visible="visibleCancel"
      :inst-id="cancelInstId"
      @after-submit="handleSearch"
    />
  </div>
</template>

<script lang="ts" setup>
  import { TableColumnData, Message, Modal } from '@arco-design/web-vue';
  import { ref, reactive, onMounted } from 'vue';
  import { Pagination } from '@/types/global';
  import TableSearch from '@/components/cac-components/advanced-search/index.vue';
  import {
    BpmInstRecord,
    BpmMyEventPageParams,
  } from '@/api/bpm/model/bpmInstanceModel';
  import {
    removeBpmInst,
    updateBpmInstStatus,
    getInfoByDefKeyInstId,
    queryBpmMyEventPage,
  } from '@/api/bpm/bpm-instance';
  import { openDetail, openDraft, startProcess } from '@/utils/bpm/bpm-util';
  import { BpmDefRecord } from '@/api/bpm/model/bpmDefineModel';
  import BpmCategoryTree from '@/components/bpm/tree-category.vue';
  import ModalInstanceancel from '@/views/bpm/bpm-task-detail/components/modal-instance-cancel.vue';

  // FIXME: 搜索选项中运行状态与表格不对应
  const SEARCH_FORM: any[] = [
    { fieldName: 'Q_i.BILL_NO__S_EQ', labelText: '业务单号', type: 'text' },
    {
      fieldName: 'Q_i.STATUS__S_EQ',
      labelText: '运行状态',
      type: 'select',
      options: [
        { label: '草稿', value: 'DRAFTED' },
        { label: '运行', value: 'RUNNING' },
        { label: '暂停', value: 'SUPSPEND' },
        { label: '结束', value: 'SUCCESS_END' },
      ],
    },
    {
      fieldName: 'Q_i.VERSION__I_EQ',
      labelText: '版本',
      type: 'number',
      initialValue: 1,
    },
    { fieldName: 'Q_SUBJECT__S_LK', labelText: '标题', type: 'text' },
    {
      fieldName: 'Q_i.CREATE_TIME__D_GE',
      labelText: '任务创建开始时间',
      type: 'datetime',
      showtime: false,
      format: 'YYYY-MM-DD',
    },
    {
      fieldName: 'Q_i.CREATE_TIME__D_LE',
      labelText: '任务创建结束时间',
      type: 'datetime',
      showtime: false,
      format: 'YYYY-MM-DD',
    },
  ];
  const statusMap: any = {
    DRAFTED: { color: 'gray', text: '草稿' },
    LOCKED: { color: 'black', text: '锁定' },
    INVOKE_TO_STARTOR: { color: 'red', text: '撤回(发起人)' },
    RUNNING: { color: 'red', text: '运行中' }, // 运行
    SUPSPEND: { color: 'black', text: '暂停' }, // 运行
    CANCEL: { color: 'red', text: '作废' }, // 作废
    SUCCESS_END: { color: 'green', text: '成功' }, // 成功结束
    ERROR_END: { color: 'red', text: '异常结束' }, // 异常结束
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
    table: 'BPM_INST t left join BPM_DEF d on t.DEF_ID_ = d.DEF_ID_',
    field: 't.TREE_ID_',
    whereConf: [
      {
        name: 'CREATE_BY_',
        alias: 't.CREATE_BY_',
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
  const handleSearch = async (reqdata?: BpmMyEventPageParams) => {
    const { CREATE_TIME__D_GE, CREATE_TIME__D_LE, ...res } = reqdata || {};
    let startTime;
    let endTime;
    if (CREATE_TIME__D_GE) {
      startTime = new Date(CREATE_TIME__D_GE);
    }
    if (CREATE_TIME__D_LE) {
      endTime = new Date(CREATE_TIME__D_LE);
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
      const { data } = await queryBpmMyEventPage(params);
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
        'Q_i.TREE_ID__S_EQ': treeId?.[0],
      },
      //   sortField: '',
      //   sortOrder: 'asc',
    };
    loading.value = true;
    try {
      const { data } = await queryBpmMyEventPage(params);
      list.value = data.result.data;
      // console.log('list', list.value);
      pagination.total = Number(data.result.totalCount);
    } finally {
      loading.value = false;
    }
  };
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
      title: '标题',
      dataIndex: 'subject',
      width: 180,
      ellipsis: false,
    },
    {
      title: '业务单号',
      dataIndex: 'billNo',
      width: 100,
    },
    {
      title: '运行状态',
      dataIndex: 'status',
      slotName: 'status',
      width: 100,
    },
    {
      title: '所属应用',
      dataIndex: 'appId',
      width: 140,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
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
  const doUpdateInstanceStatus = async (instId: string, status: string) => {
    try {
      const { data } = await updateBpmInstStatus({ instId, status });
      Message.success(data.message);
    } finally {
      handleSearch();
    }
  };
  const doRemoveInstance = async (instId: string) => {
    try {
      const { data } = await removeBpmInst(instId);
      Message.success(data.message);
    } finally {
      handleSearch();
    }
  };

  // 明细
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
  // 跳转到流程启动页面
  const startFlow = (record: BpmDefRecord) => {
    startProcess(record.key);
  };
  // 暂停
  const supspendInst = (record: BpmInstRecord) => {
    const { instId } = record;
    doUpdateInstanceStatus(instId, 'SUPSPEND');
  };
  // 恢复
  const restoreInst = (record: BpmInstRecord) => {
    const { instId } = record;
    doUpdateInstanceStatus(instId, 'RUNNING');
  };
  // 删除
  const delById = (instId: string) => {
    Modal.warning({
      title: '警告',
      content: '您确定需要删除选中的记录吗？',
      hideCancel: false,
      onOk: () => doRemoveInstance(instId),
    });
  };
  const visibleCancel = ref(false);
  const cancelInstId = ref('');
  // 作废
  const openCancel = (instId: string) => {
    visibleCancel.value = true;
    cancelInstId.value = instId;
  };
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
