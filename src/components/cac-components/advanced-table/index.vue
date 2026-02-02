<!--通用组件：自动填充密级字段的表格-->
<template>
  <div>
    <a-table
      :columns="displayColumns"
      :data="data"
      :bordered="bordered"
      :hoverable="hoverable"
      :stripe="stripe"
      :loading="loading"
      :scroll="scroll"
      :row-selection="rowSelection"
      :row-key="rowKey"
      :column-resizable="columnResizable"
      :selected-keys="selectedKeys"
      :default-selected-keys="defaultSelectedKeys"
      :expandable="expandable"
      :expanded-keys="expandedKeys"
      :default-expanded-keys="defaultExpandedKeys"
      :default-expand-all-rows="defaultExpandAllRows"
      :pagination="pagination === true ? displayPagination : pagination"
      @update:selected-keys="onUpdateSelectedKeys"
      @select="onSelect"
      @select-all="onSelectAll"
      @update:expanded-keys="onUpdateExpandedKeys"
      @expand="onExpand"
      @expand-all="onExpandAll"
      @page-change="onPageChange"
      @page-size-change="onPageSizeChange"
    >
      <template
        v-for="item in (slotColumns as any[])"
        :key="item.slotName"
        #[item.slotName]="{ record, column, rowIndex }"
      >
        <slot
          :name="item.slotName"
          :record="record"
          :column="column"
          :row-index="rowIndex"
        />
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts" name="AdvancedTable">
  import { computed, onMounted, PropType, reactive, ref } from 'vue';
  import { Pagination } from '@/types/global';
  import {
    TableColumnData,
    TableRowSelection,
    PaginationProps,
    TableData,
    TableExpandable,
  } from '@arco-design/web-vue';
  import { DictDataRecord } from '@/api/system/model/dictDataModel';
  import { queryDictDataRecordList } from '@/api/system/dictionary';

  const props = defineProps({
    // 是否显示密级
    showSecretLevel: { type: Boolean, default: true },
    // 是否显示序号
    showIndex: { type: Boolean, default: true },

    // a-table props
    columns: { type: Array as PropType<TableColumnData[]>, default: () => [] },
    data: { type: Array as PropType<any[]>, default: () => [] },
    bordered: { type: Boolean, default: true },
    hoverable: { type: Boolean, default: true },
    stripe: { type: Boolean, default: false },
    pagination: {
      type: [Object, Boolean] as PropType<boolean | PaginationProps>,
      default: () => true,
    },
    size: {
      type: String as PropType<'mini' | 'small' | 'medium' | 'large'>,
      default: 'large',
    },
    loading: { type: Boolean, default: false },
    columnResizable: { type: Boolean, default: false },
    rowSelection: {
      type: Object as PropType<TableRowSelection>,
      default: undefined,
    },
    selectedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: undefined,
    },
    defaultSelectedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: undefined,
    },
    expandable: {
      type: Object as PropType<TableExpandable>,
      default: undefined,
    },
    expandedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: undefined,
    },
    defaultExpandedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: undefined,
    },
    defaultExpandAllRows: { type: Boolean, default: false },
    rowKey: { type: String, default: 'key' },
    scroll: {
      type: Object as PropType<{
        x?: number | string;
        y?: number | string;
        minWidth?: number | string;
        maxHeight?: number | string;
      }>,
      default: undefined,
    },
  });
  const emits = defineEmits([
    'pageChange',
    'pageSizeChange',
    'update:selectedKeys',
    'select',
    'selectAll',
    'update:expandedKeys',
    'expand',
    'expandAll',
  ]);

  const secretLevelList = ref<any[]>([]);
  const getSecretList = async () => {
    const params: DictDataRecord = {
      dictType: 'secretLevelData',
    };
    try {
      const { data } = await queryDictDataRecordList(params);
      secretLevelList.value = data;
    } finally {
      // empty
    }
  };
  onMounted(() => {
    getSecretList();
  });

  const displayColumns = computed(() => {
    const { columns, showSecretLevel, showIndex } = props;
    let list = [...columns];
    if (showSecretLevel) {
      list = [
        {
          title: '密级',
          dataIndex: 'secretLevel',
          fixed: 'left',
          width: 70,
          align: 'center',
          render: ({ record }) => {
            return (
              secretLevelList.value.find(
                (elem) => elem.value === String(record.secretLevel)
              )?.label || '-'
            );
          },
        },
        ...list,
      ];
    }
    if (showIndex) {
      list = [
        {
          title: '序号',
          dataIndex: 'index',
          width: 70,
          fixed: 'left',
          align: 'center',
          render: ({ rowIndex }) => {
            const { pagination } = props;
            if (pagination === false) {
              return rowIndex + 1;
            }
            if (pagination === true) {
              return (
                rowIndex +
                1 +
                (displayPagination.current - 1) * displayPagination.pageSize
              );
            }
            return (
              rowIndex +
              1 +
              ((pagination?.current || 1) - 1) * (pagination?.pageSize || 10)
            );
          },
        },
        ...list,
      ];
    }
    return list;
  });
  const slotColumns = computed(() => {
    const { columns } = props;
    return columns.filter((elem) => elem.slotName);
  });

  // 多选相关
  const onSelect = (
    rowKeys: (string | number)[],
    rowKey: string | number,
    record: TableData
  ) => {
    emits('select', rowKeys, rowKey, record);
  };
  const onSelectAll = (checked: boolean) => {
    emits('selectAll', checked);
  };
  const onUpdateSelectedKeys = (rowKeys: (string | number)[]) => {
    emits('update:selectedKeys', rowKeys);
  };

  // 树状展开相关
  const onExpand = (
    rowKey: string | number | (string | number)[],
    checked: boolean
  ) => {
    emits('expand', rowKey, checked);
  };
  const onExpandAll = (checked: boolean) => {
    emits('expandAll', checked);
  };
  const onUpdateExpandedKeys = (rowKeys: (string | number)[]) => {
    emits('update:expandedKeys', rowKeys);
  };

  // 分页查询相关配置
  const basePagination: Pagination = {
    current: 1,
    pageSize: 10,
    showPageSize: true,
    showTotal: true,
  };
  const displayPagination = reactive({
    ...basePagination,
  });
  const onPageChange = (current: number) => {
    if (props.pagination === true) {
      displayPagination.current = current;
    }
    emits('pageChange', current);
  };
  const onPageSizeChange = (pageSize: number) => {
    if (props.pagination === true) {
      displayPagination.pageSize = pageSize;
    }
    emits('pageSizeChange', pageSize);
  };
</script>
