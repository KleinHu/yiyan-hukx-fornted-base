<!--组件：流转情况-->
<template>
  <div>
    <a-button type="outline" @click="open">流转情况</a-button>
    <a-modal v-model:visible="visible" title="流转情况" :width="800">
      <a-table
        :columns="COLUMNS"
        :data="list"
        size="small"
        :loading="loading"
        :pagination="false"
      >
        <template #status="{ record }">
          <a-tag :color="statusMap[record.status].color">
            <span>{{ statusMap[record.status].text }}</span>
          </a-tag>
        </template>
        <template #assignee="{ record }">
          <UsernameTag :user-id="record.assignee" />
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { TableColumnData } from '@arco-design/web-vue';
  import { queryBpmTaskRoam } from '@/api/bpm/bpm-task';
  import UsernameTag from '@/components/bpm/username-tag.vue';

  const props = defineProps({
    taskId: { type: String, required: true },
  });

  const statusMap: any = {
    UNHANDLE: { color: 'red', text: '待办' },
    HANDLE: { color: 'green', text: '处理中' },
    LOCKED: { color: 'orange', text: '已锁定' },
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
      title: '流转人',
      dataIndex: 'assignee',
      width: 180,
      ellipsis: false,
      slotName: 'assignee',
    },
    {
      title: '流转时间',
      dataIndex: 'createTime',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      slotName: 'status',
    },
    {
      title: '流转意见',
      dataIndex: 'remark',
      width: 100,
    },
  ];
  const list = ref<any[]>([]);
  const loading = ref<boolean>(false);
  const listRoams = async () => {
    loading.value = true;
    try {
      const { data } = await queryBpmTaskRoam(props.taskId);
      list.value = data.data;
    } finally {
      loading.value = false;
    }
  };

  const visible = ref(false);
  const open = () => {
    listRoams();
    visible.value = true;
  };
</script>
