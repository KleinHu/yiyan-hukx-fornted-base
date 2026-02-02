<!-- 待办内容 -->
<!--created by yuyupeng 2023/6/25-->
<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card
      class="general-card"
      :bordered="false"
      :header-style="{ paddingBottom: '0' }"
      :body-style="{ padding: '16px 20px' }"
    >
      <template #title>
        <div class="card-title">
          <icon-check-circle-fill class="title-icon" />
          <span>系统待办</span>
          <a-tag
            color="red"
            size="small"
            style="margin-left: 8px; border-radius: 10px"
          >
            {{ todoDataList.length }} 个待办
          </a-tag>
        </div>
      </template>
      <template #extra>
        <a-dropdown>
          <a-link><icon-more /></a-link>
          <template #content>
            <a-doption @click="getTodoList">刷新</a-doption>
          </template>
        </a-dropdown>
      </template>
      <div class="todo-list-wrapper">
        <div class="todo-list">
          <div
            v-for="item in todoDataList"
            :key="item.id"
            class="todo-item"
            @click="toTodoDetail(item)"
          >
            <div class="todo-left">
              <div class="todo-icon-wrapper">
                <icon-clock-circle style="color: #ffb400" />
              </div>
              <div class="todo-info">
                <div class="todo-title-row">
                  <span class="todo-title">{{ item.title }}</span>
                  <span class="todo-time">{{ item.createTime || '今日' }}</span>
                </div>
              </div>
            </div>
            <div class="todo-actions" @click.stop>
              <a-popconfirm
                content="确定删除吗？"
                type="warning"
                @ok="deleteTodo(item)"
              >
                <a-button
                  type="text"
                  size="small"
                  class="delete-btn"
                  :style="{ color: '#ff4d4f' }"
                >
                  <template #icon>
                    <icon-delete />
                  </template>
                </a-button>
              </a-popconfirm>
            </div>
          </div>
        </div>
      </div>
    </a-card>
  </a-spin>
</template>

<script lang="ts" setup>
  // import { ref } from 'vue';
  import useLoading from '@/hooks/loading';
  import { Notification } from '@arco-design/web-vue';
  import { onMounted, ref } from 'vue';
  import {
    queryTodoRecordListByPage,
    deleteTodoRecord,
    readeTodoRecord,
  } from '@/api/system/todo';
  import { TodoRecord } from '@/api/system/model/todoModel';
  import { useUserStore } from '@/store';
  import { ToReadParams } from '@/api/system/model/toReadModel';

  const { loading, setLoading } = useLoading(); // 控制是否加载中
  const todoDataList = ref<TodoRecord[]>([]); // 待办数据
  /**
   * fun
   */
  /**
   * @description 转到待办详情，通过url跳转
   * @param item 点击的待办信息
   */
  const toTodoDetail = async (item: TodoRecord) => {
    const userStore = useUserStore();
    const { data } = await readeTodoRecord(
      item.id as string,
      userStore.userCode as string
    ); // 调用阅读待办接口
    window.open(data.url, '_blank');
    getTodoList(); // 跳转url的同时刷新一下待办数据
  };
  /**
   * @description 删除待办
   * @param item 点击的待办信息
   */
  const deleteTodo = async (item: TodoRecord) => {
    try {
      const { data } = await deleteTodoRecord(item.id as string);
      if (data) {
        getTodoList(); // 重新获取待办信息
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
   * @description 根据userId查询他的所有待办数据
   */
  const getTodoList = async () => {
    setLoading(true);
    const userStore = useUserStore();
    try {
      const params: ToReadParams = {
        page: 1,
        limit: 10000,
      };
      const { data } = await queryTodoRecordListByPage(
        userStore.userCode as string,
        params
      );
      todoDataList.value = data.list;
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
  /**
   * onMounted
   */
  onMounted(() => {
    getTodoList();
  });
</script>

<style scoped lang="less">
  .general-card {
    border-radius: 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .todo-list-wrapper {
    height: 280px;
    overflow-y: auto;
    flex: 1;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;

    .title-icon {
      color: rgb(var(--arcoblue-6));
    }
  }

  .todo-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 0;
  }

  .todo-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 8px;
    cursor: pointer;
    transition: all 0.2s;
    border-radius: 4px;
    border-bottom: 1px solid var(--color-border-2);

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: var(--color-fill-2);
      .todo-title {
        color: rgb(var(--arcoblue-6));
      }
      .todo-actions {
        opacity: 1;
      }
    }
  }

  .todo-actions {
    flex-shrink: 0;
    margin-left: 8px;
    opacity: 0;
    transition: opacity 0.2s;

    .delete-btn {
      padding: 4px;
      font-size: 14px;

      &:hover {
        background-color: #fff1f0;
      }
    }
  }

  .todo-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    overflow: hidden;
  }

  .todo-icon-wrapper {
    font-size: 16px;
    flex-shrink: 0;
  }

  .todo-info {
    flex: 1;
    overflow: hidden;
  }

  .todo-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .todo-title {
    font-size: 14px;
    color: var(--color-text-1);
    transition: all 0.2s;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.completed {
      text-decoration: line-through;
      color: var(--color-text-4);
    }
  }

  .todo-time {
    font-size: 12px;
    color: var(--color-text-4);
    flex-shrink: 0;
  }

  .add-task {
    border-top: 1px solid var(--color-fill-2);
    padding-top: 8px;

    :deep(.arco-btn) {
      color: rgb(var(--arcoblue-6));
      background-color: #f0f7ff;
      border-radius: 6px;

      &:hover {
        background-color: #e0efff;
      }
    }
  }
</style>
