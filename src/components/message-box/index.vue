<template>
  <a-spin style="display: block" :loading="loading">
    <a-tabs
      v-model:activeKey="messageType"
      type="rounded"
      destroy-on-hide
      @tab-click="fetchSourceData"
    >
      <a-tab-pane v-for="item in tabList" :key="item.key">
        <template #title>
          <span> {{ item.title }} </span>
        </template>
        <a-result v-if="!renderList.length" status="404">
          <template #subtitle> {{ $t('messageBox.noContent') }} </template>
        </a-result>
        <a-scrollbar style="max-height: calc(80vh - 180px); overflow: auto">
          <list :render-list="renderList" @item-click="handleItemClick" />
        </a-scrollbar>
      </a-tab-pane>
      <template #extra>
        <a-space>
          <!--          <a-button type="text"> 全部已读 </a-button>-->
          <a-button type="text" @click="toMessageCenter"> 查看更多 </a-button>
        </a-space>
      </template>
    </a-tabs>
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  // import { useI18n } from 'vue-i18n';
  import useLoading from '@/hooks/loading';
  import { useUserStore } from '@/store';
  import {
    queryTodoRecordListByPage,
    readeTodoRecord,
  } from '@/api/system/todo';
  import { Notification } from '@arco-design/web-vue';
  import { TodoRecord } from '@/api/system/model/todoModel';
  import { ToReadParams, ToReadRecord } from '@/api/system/model/toReadModel';
  import {
    queryToReadRecordListByPage,
    readeToReadRecord,
  } from '@/api/system/toRead';
  import { useRouter } from 'vue-router';
  import List from './list.vue';

  interface TabItem {
    key: string;
    title: string;
    avatar?: string;
  }
  const router = useRouter(); // 路由
  const { loading, setLoading } = useLoading(true);
  const messageType = ref('todo');
  const todoMessageList = ref<TodoRecord[]>([]); // 待办数据list
  const toReadMessageList = ref<ToReadRecord[]>([]); // 待阅数据list
  const tabList: TabItem[] = [
    {
      key: 'toRead',
      title: '待阅',
    },
    {
      key: 'todo',
      title: '待办',
    },
  ];
  /**
   * @description 根据userId查询他的所有消息数据
   */
  const fetchSourceData = async () => {
    setLoading(true);
    const userStore = useUserStore();
    try {
      if (messageType.value === 'todo') {
        const params: ToReadParams = {
          page: 1,
          limit: 10000,
        };
        const { data } = await queryTodoRecordListByPage(
          userStore.userCode as string,
          params
        );
        todoMessageList.value = data.list;
      } else if (messageType.value === 'toRead') {
        const params: ToReadParams = {
          page: 1,
          limit: 10000,
        };
        const { data } = await queryToReadRecordListByPage(
          userStore.userCode as string,
          params
        );
        toReadMessageList.value = data.list;
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Notification.error({
        content: `出现异常！${error}`,
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  const renderList = computed(() => {
    /* return messageData.messageList.filter(
      (item) => messageType.value === item.type
    ); */
    if (messageType.value === 'todo') {
      return todoMessageList.value;
    }
    if (messageType.value === 'toRead') {
      return toReadMessageList.value;
    }
    return [];
  });
  const handleItemClick = async (item: any) => {
    try {
      if (messageType.value === 'todo') {
        const userStore = useUserStore();
        const { data } = await readeTodoRecord(
          item.id as string,
          userStore.userCode as string
        ); // 调用阅读待办接口
        window.open(data.url, '_blank');
        fetchSourceData(); // 跳转url的同时刷新一下待办待阅数据
      } else if (messageType.value === 'toRead') {
        const { data } = await readeToReadRecord(item.id); // 调用阅读待阅接口
        window.open(data.url, '_blank');
        fetchSourceData(); // 跳转url的同时刷新一下待办待阅数据
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Notification.error({
        content: `出现异常！${error}`,
        closable: true,
      });
    }
  };
  /**
   * @description 跳转到消息中心
   */
  const toMessageCenter = () => {
    router.push({ name: 'messageCenter' });
  };
  fetchSourceData();
</script>
