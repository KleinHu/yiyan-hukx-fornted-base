<!--我的申请-->
<template>
  <a-spin :loading="loading" style="width: 100%">
    <TableSearch
      ref="searchRef"
      :data-source="SEARCH_FORM"
      @change="handleSearch"
    />
    <a-table
      v-model:selectedKeys="selectedKeys"
      :columns="COLUMNS"
      :data="list"
      row-key="instId"
      :row-selection="rowSelection"
      @selection-change="onSelectChange"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
    >
      <template #status="{ record }">
        <a-tag :color="statusMap[record.status].color">
          <span>{{ statusMap[record.status].text }}</span>
        </a-tag>
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
  import { BpmMyEventPageParams } from '@/api/bpm/model/bpmInstanceModel';
  import { queryBpmMyEventPage } from '@/api/bpm/bpm-instance';

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
  // FIXME: 搜索选项中运行状态与表格不对应
  const SEARCH_FORM: any[] = [
    { fieldName: 'Q_t.SUBJECT__S_LK', labelText: '事项标题', type: 'text' },
    { fieldName: 'Q_v.BILL_NO__S_LK', labelText: '业务单号', type: 'text' },
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
  const rowSelection: TableRowSelection = reactive({
    type: 'checkbox',
    showCheckedAll: true,
  });
  const searchRef = ref<any>();
  const selectedKeys = ref<string[]>([]);
  const selectedRows = ref<any[]>([]);

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
  const getMyInstanceListKeys = () => {
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
  const COLUMNS: TableColumnData[] = [
    {
      title: '序号',
      align: 'center',
      dataIndex: 'index',
      width: 80,
      render: ({ rowIndex }) => rowIndex + 1,
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
  ];
  // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
  defineExpose({ getMyInstanceListKeys });
</script>

<style scoped lang="less">
  .list-card-container {
    padding: 20px;
    border-right: 1px var(--border-radius-default);
  }

  .bpm-tree {
    &-wrapper {
      overflow-y: hidden;
    }

    &-operator {
      float: left;
      width: 240px;
    }

    &-content {
      padding-left: 14px;
      overflow: auto;
      border-left: 1px solid var(--color-border-1);
    }
  }
</style>
