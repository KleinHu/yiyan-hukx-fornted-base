<!--我的已办-->
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
      <template #jumpType="{ record }">
        <a-tag
          :color="
            opinionMap[record.jumpType] ? opinionMap[record.jumpType].color : ''
          "
        >
          <span>{{ opinionMap[record.jumpType].text }}</span>
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
  import { BpmMyApprovedParams } from '@/api/bpm/model/bpmInstanceModel';
  import { queryBpmMyApprovedPage } from '@/api/bpm/bpm-instance';

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
  const opinionMap: any = {
    AGREE: { color: 'green', text: '通过' },
    SKIP: { color: 'red', text: '跳过' },
    RECOVER: { color: 'red', text: '撤回' },
    REFUSE: { color: 'red', text: '反对' },
    RUNNING: { color: 'green', text: '运行' },
    SUPSPEND: { color: 'red', text: '暂停' },
    CANCEL: { color: 'red', text: '作废' },
    LINKUP: { color: 'red', text: '沟通' },
    COMMUNICATE: { color: 'red', text: '沟通' },
    BACK: { color: 'red', text: '驳回' },
    BACK_TO_STARTOR: { color: 'red', text: '驳回到发起人' },
    OVERTIME_AUTO_AGREE: { color: 'red', text: '超时审批' },
    TIMEOUT_SKIP: { color: 'red', text: '超时跳过' },
    CANCEL_COMMUNICATE: { color: 'red', text: '取消沟通' },
    BACK_SPEC: { color: 'red', text: '驳回节点' },
    BACK_GATEWAY: { color: 'red', text: '驳回网关' },
    ABSTAIN: { color: 'red', text: '弃权' },
    BACK_CANCEL: { color: 'red', text: '驳回撤销' },
    RECOVER_CANCEL: { color: 'red', text: '撤回撤销' },
    TRANSFER: { color: 'red', text: '转办' },
    INTERPOSE: { color: 'red', text: '干预' },
    LIVE: { color: 'red', text: '复活' },
    ROAM_TRANSFER: { color: 'red', text: '流转' },
    TRANS: { color: 'red', text: '转发' },
    TRANS_REPLY: { color: 'red', text: '回复转发' },
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
  const getMyApprovedKeys = () => {
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
  const handleSearch = async (reqdata?: BpmMyApprovedParams) => {
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
        Q_CREATE_TIME__D_GE: startTime,
        Q_CREATE_TIME__D_LE: endTime,
      },
      //   sortField: '',
      //   sortOrder: 'asc',
    };
    loading.value = true;
    try {
      const { data } = await queryBpmMyApprovedPage(params);
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
  ];
  defineExpose({ getMyApprovedKeys }); // 在<srcipt setup>的写法中，想要子组件中的方法可以被父组件调用，要通过defineExpose将方法暴露出去
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
