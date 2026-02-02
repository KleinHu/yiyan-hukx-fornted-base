<!-- 我的待办 -->
<template>
  <a-spin :loading="loading" style="width: 100%">
    <TableSearch
      ref="searchRef"
      :data-source="SEARCH_FORM"
      @change="handleSearch"
    />
    <a-table
      v-model:selectedKeys="selectedKeys"
      :data="list"
      :columns="COLUMNS"
      row-key="instId"
      :row-selection="rowSelection"
      @selection-change="onSelectChange"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
    >
      <template #status="{ record }">
        <a-tag v-if="record.status == 'UNHANDLE'" color="red">待办</a-tag>
        <a-tag v-else-if="record.status == 'HANDLE'" color="green"
          >处理中</a-tag
        >
      </template>
      <template #assignee="{ record }">
        <a-tag v-for="taskExe in record.taskExecutors" :key="taskExe.id">
          <a-icon :type="taskExe.type" />
          {{ taskExe.name }}
        </a-tag>
      </template>
    </a-table>
  </a-spin>
</template>

<script lang="ts" setup>
  import { TableColumnData } from '@arco-design/web-vue';
  import { ref, reactive, onMounted } from 'vue';
  import { Pagination } from '@/types/global';
  import TableSearch from '@/components/cac-components/advanced-search/index.vue';
  import { BpmMyTaskParams } from '@/api/bpm/model/bpmTaskModel';
  import { queryBpmMyTaskPage } from '@/api/bpm/bpm-task';

  interface TableRowSelection {
    type?: 'checkbox' | 'radio';
    selectedRowKeys?: any[];
    defaultSelectedRowKeys?: any[];
    showCheckedAll?: boolean;
    title?: string;
    width?: number;
    fixed?: boolean;
    checkStrictly?: boolean;
    onlyCurrent?: boolean;
  }
  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
    showPageSize: true,
    showTotal: true,
  };
  const pagination = reactive({
    ...basePagination,
  });
  const selectedKeys = ref<string[]>([]);
  const selectedRows = ref<any[]>([]);

  const rowSelection: TableRowSelection = reactive({
    type: 'checkbox',
    showCheckedAll: true,
  });
  const searchRef = ref<any>();
  const SEARCH_FORM: any[] = [
    { fieldName: 'Q_t.SUBJECT__S_LK', labelText: '事项标题', type: 'text' },
    { fieldName: 'Q_v.BILL_NO__S_LK', labelText: '业务单号', type: 'text' },
  ];
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
  const getMyTaskKeys = () => {
    return selectedRows.value.map((item) => {
      return { name: item.subject, id: item.instId };
    });
  };
  const onSelectChange = (rowKeys: any) => {
    selectedKeys.value = rowKeys;
    const allList = [...selectedRows.value, ...list.value];
    selectedRows.value = allList.filter((item: any) =>
      selectedKeys.value.includes(item.instId)
    );
  };
  //   func: 查询
  const handleSearch = async (reqdata?: BpmMyTaskParams) => {
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
      const { data } = await queryBpmMyTaskPage(params);
      list.value = data.result.data;
      pagination.total = Number(data.result.totalCount);
    } finally {
      loading.value = false;
    }
  };
  const COLUMNS: TableColumnData[] = [
    {
      title: '事项标题',
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
  ];
  defineExpose({ getMyTaskKeys }); // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
</script>

<style scoped lang="less">
  .general-card {
    min-height: 395px;
  }

  :deep(.arco-table-tr) {
    height: 44px;

    .arco-typography {
      margin-bottom: 0;
    }
  }

  .increases-cell {
    display: flex;
    align-items: center;

    span {
      margin-right: 4px;
    }
  }

  .text-ellipsis {
    width: 480px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
</style>
