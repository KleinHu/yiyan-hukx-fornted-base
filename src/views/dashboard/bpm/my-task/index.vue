<!--我的待办-->
<template>
  <div class="list-card-container">
    <a-card :bordered="false" class="general-card bpm-dashboard-card">
      <template #title>
        <div class="card-header">
          <icon-schedule class="header-icon" />
          <span class="header-text">流程待办</span>
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
            <template #status="{ record }">
              <a-tag v-if="record.status == 'UNHANDLE'" color="red" bordered>
                <template #icon><icon-clock-circle /></template>
                待办
              </a-tag>
              <a-tag
                v-else-if="record.status == 'HANDLE'"
                color="orange"
                bordered
              >
                <template #icon><icon-sync /></template>
                处理中
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
              <a-button type="text" size="small" @click="handleTask(record)">
                <template #icon><icon-edit /></template>
                办理
              </a-button>
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
  import {
    BpmMyTaskPageParams,
    BpmMyTaskFormParams,
    BpmTaskRecord,
  } from '@/api/bpm/model/bpmTaskModel';
  import { getInfoByDefKeyInstId } from '@/api/bpm/bpm-instance';
  import { queryBpmMyTaskPage } from '@/api/bpm/bpm-task';
  import { openTask, openDraft } from '@/utils/bpm/bpm-util';
  import BpmCategoryTree from '@/components/bpm/tree-category.vue';

  const SEARCH_FORM: any[] = [
    { fieldName: 'Q_v.SUBJECT__S_LK', labelText: '事项标题', type: 'text' },
    { fieldName: 'Q_v.BILL_NO__S_LK', labelText: '单号', type: 'text' },
    { fieldName: 'Q_v.NAME__S_LK', labelText: '审批环节', type: 'text' },
    {
      fieldName: 'Q_v.CREATE_TIME__D_GE',
      labelText: '任务创建开始时间',
      type: 'datetime',
      showtime: false,
      format: 'YYYY-MM-DD',
    },
    {
      fieldName: 'Q_v.CREATE_TIME__D_LE',
      labelText: '任务创建结束时间',
      type: 'datetime',
      showtime: false,
      format: 'YYYY-MM-DD',
    },
  ];
  const statisticConfig: any = {
    type: 'static_bpm',
    // appIdPrefix: 't.',
    // table: 'BPM_CHECK_HISTORY',
    table: `( SELECT
t.* 
FROM
	BPM_TASK t 
WHERE
	ASSIGNEE_ = #{w.curUserId} AND t.TENANT_ID_ = #{w.curTenantId} AND t.STATUS_ != 'COMPLETED'
	
	AND t.STATUS_ != 'LOCKED' 
	AND t.STATUS_ != 'PENDING' 
	AND ( t.BATCH_TASK_TYPE_ != 'BATCH_SUB' OR t.BATCH_TASK_TYPE_ IS NULL ) UNION
SELECT
	t.* 
FROM
	BPM_TASK t
	LEFT JOIN BPM_TASK_USER u ON t.TASK_ID_ = u.TASK_ID_ 
WHERE
	t.ASSIGNEE_ IS NULL 
	AND t.STATUS_ != 'COMPLETED' 
	AND t.STATUS_ != 'LOCKED' 
	AND t.STATUS_ != 'PENDING' 
	AND (
u.USER_ID_ = #{w.curUserId} AND t.TENANT_ID_ = #{w.curTenantId} OR u.GROUP_ID_ IN (\${w.curUserRoles}))) t`,
    tableParams: [
      {
        name: 'curUserId',
        type: 'string',
        value: 'curUserId',
        valueType: 'context',
      },
      {
        name: 'curTenantId',
        type: 'string',
        value: 'curTenantId',
        valueType: 'context',
      },
      {
        name: 'curUserRoles',
        type: 'string',
        value: 'curUserRoles',
        valueType: 'context',
      },
    ],
    field: 't.TREE_ID_',
    // field: 't.TREE_ID_',
    whereConf: [],
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
  onMounted(() => {
    handleSearch();
  });
  // 根据流程分类查询
  const handleSearchByTreeId = async (treeId: string[]) => {
    if (treeId[0] === '0') {
      treeId[0] = '';
    }
    const params: any = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      params: {
        'Q_v.TREE_ID__S_EQ': treeId?.[0],
      },
      //   sortField: '',
      //   sortOrder: 'asc',
    };
    loading.value = true;
    // console.log('params', params);
    try {
      const { data } = await queryBpmMyTaskPage(params);
      list.value = data.result.data;
      // console.log('list', list.value);
      pagination.total = Number(data.result.totalCount);
    } finally {
      loading.value = false;
    }
  };
  // func: 查询
  const handleSearch = async (reqdata?: BpmMyTaskFormParams) => {
    const { CREATE_TIME__D_GE, CREATE_TIME__D_LE, ...res } = reqdata || {};
    let startTime;
    let endTime;
    if (CREATE_TIME__D_GE) {
      startTime = new Date(CREATE_TIME__D_GE);
    }
    if (CREATE_TIME__D_LE) {
      endTime = new Date(CREATE_TIME__D_LE);
    }
    const params: BpmMyTaskPageParams = {
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      params: {
        ...res,
        'Q_v.CREATE_TIME__D_GE': startTime,
        'Q_v.CREATE_TIME__D_LE': endTime,
      },
      //   sortField: '',
      //   sortOrder: 'asc',
    };
    loading.value = true;
    try {
      const { data } = await queryBpmMyTaskPage(params);
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
      title: '事项标题',
      dataIndex: 'subject',
      width: 180,
      ellipsis: false,
    },
    {
      title: '单号',
      dataIndex: 'billNo',
      width: 100,
    },
    {
      title: '审批环节',
      dataIndex: 'name',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      slotName: 'status',
      width: 120,
    },
    {
      title: '所属应用',
      dataIndex: 'appId',
      width: 140,
    },
    {
      title: '发送时间',
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
  // 办理流程
  const handleTask = async (record: BpmTaskRecord) => {
    const { instId, taskId } = record;
    try {
      const { data } = await getInfoByDefKeyInstId({
        type: 'openDoc',
        id: instId,
        taskId,
        action: 'task',
      });
      if (data.action === 'task') {
        openTask(instId, taskId);
      }
      if (data.action === 'startDraft') {
        openDraft(data.defKey);
      }
    } finally {
      // empty
    }
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
