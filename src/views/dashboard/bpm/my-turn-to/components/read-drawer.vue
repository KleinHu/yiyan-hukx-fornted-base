<template>
  <div>
    <a-button v-if="type === 'button'" type="outline" @click="open">
      阅读情况
    </a-button>
    <a-link v-if="type === 'link'" @click="open">阅读情况</a-link>
    <a-drawer
      :visible="visible"
      title="阅读说明"
      :width="wide ? 900 : narrow ? 360 : 720"
      unmount-on-close
      @cancel="onClose"
      @ok="onClose"
    >
      <a-table :columns="COLUMNS" :data="list">
        <template #isRead="{ record }">
          <a-tag :color="readMap[record.instCp.isRead].color">
            <span>{{ readMap[record.instCp.isRead].text }}</span>
          </a-tag>
        </template>
        <template #userId="{ record }">
          <getUserName :user-id="record.instCp.userId" />
        </template>
      </a-table>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
  import { PropType, ref } from 'vue';
  import { getByInstId } from '@/api/bpm/bpm-instance-cc';
  import { TableColumnData } from '@arco-design/web-vue';
  import getUserName from '@/components/bpm/username-tag.vue';

  const loading = ref(false);
  const visible = ref(false);
  const list = ref<any[]>([]);
  //   const emits = defineEmits(['close']);
  const open = () => {
    visible.value = true;
    handleSearch();
  };
  const COLUMNS: TableColumnData[] = [
    {
      title: '接收人',
      align: 'center',
      dataIndex: 'userId',
      width: 120,
      // render: ({ record }) => record.instCp.userId,
      slotName: 'userId',
    },
    {
      title: '是否已读',
      dataIndex: 'isRead',
      width: 80,
      ellipsis: false,
      slotName: 'isRead',
    },
    {
      title: '阅读时间',
      dataIndex: 'updateTime',
      width: 80,
    },
  ];
  const readMap: any = {
    YES: { color: 'green', text: '已读' },
    NO: { color: 'red', text: '未读' },
  };
  const props = defineProps({
    type: { type: String as PropType<'button' | 'link'>, default: 'button' },
    // 控制抽屉宽度
    narrow: { default: false, type: Boolean },
    // 控制抽屉宽度
    wide: { default: false, type: Boolean },
    instId: { type: String, default: '' },
  });
  const handleSearch = async () => {
    loading.value = true;
    try {
      const { data } = await getByInstId(props.instId);
      list.value = data;
    } finally {
      loading.value = false;
    }
  };

  /**
   * @method
   * @description 关闭抽屉
   */
  const onClose = () => {
    visible.value = false;
    // console.log('visible', visible);
  };
</script>
