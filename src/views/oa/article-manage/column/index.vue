<template>
  <div class="container">
    <Breadcrumb :items="['文章管理', '专栏配置']" />
    <div class="layout-content">
      <a-card class="general-card" title="专栏管理">
        <template #extra>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            新增专栏
          </a-button>
        </template>

        <a-row style="margin-bottom: 16px">
          <a-col :span="24">
            <a-space>
              <a-input
                v-model="queryParams.name"
                placeholder="搜索专栏名称"
                style="width: 200px"
                allow-clear
              />
              <a-select
                v-model="queryParams.status"
                placeholder="专栏状态"
                style="width: 150px"
                allow-clear
              >
                <a-option :value="1">启用</a-option>
                <a-option :value="0">停用</a-option>
              </a-select>
              <a-button type="primary" @click="handleSearch">
                <template #icon><icon-search /></template>查询
              </a-button>
              <a-button @click="resetQuery">
                <template #icon><icon-refresh /></template>重置
              </a-button>
            </a-space>
          </a-col>
        </a-row>

        <a-table
          row-key="id"
          :loading="loading"
          :data="columnTree"
          :pagination="false"
          :default-expand-all-rows="true"
          :hide-expand-button-on-empty="true"
          :scroll="{ y: '100%' }"
        >
          <template #columns>
            <a-table-column title="序号" :width="70" align="center">
              <template #cell="{ rowIndex }">
                {{ rowIndex + 1 }}
              </template>
            </a-table-column>
            <a-table-column title="专栏名称" data-index="name" />
            <a-table-column
              title="简介"
              data-index="description"
              ellipsis
              tooltip
            />
            <a-table-column
              title="排序"
              data-index="sortOrder"
              :width="80"
              align="center"
            />
            <a-table-column title="状态" :width="100" align="center">
              <template #cell="{ record }">
                <a-switch
                  :model-value="record.status === 1"
                  @change="(val) => handleStatusChange(record, val as boolean)"
                >
                  <template #checked>启用</template>
                  <template #unchecked>停用</template>
                </a-switch>
              </template>
            </a-table-column>
            <!-- <a-table-column
              title="创建时间"
              data-index="createTime"
              :width="180"
            >
              <template #cell="{ record }">
                {{ formatDate(record.createTime) }}
              </template>
            </a-table-column> -->
            <a-table-column title="操作" :width="300" align="center">
              <template #cell="{ record }">
                <a-space>
                  <a-button
                    type="text"
                    size="small"
                    @click="handleAddChild(record)"
                  >
                    添加子项
                  </a-button>
                  <a-button
                    type="text"
                    size="small"
                    @click="handleEdit(record)"
                  >
                    编辑
                  </a-button>
                  <a-popconfirm
                    content="确定要删除该专栏吗？请确保专栏下没有关联文章。"
                    type="warning"
                    @ok="handleDelete(record.id)"
                  >
                    <a-button type="text" status="danger" size="small">
                      删除
                    </a-button>
                  </a-popconfirm>
                </a-space>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 新增/编辑弹窗 -->
    <EditModal
      v-model:visible="modalVisible"
      :initial-data="formData"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted } from 'vue';
  // import dayjs from 'dayjs';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import useArticleColumn from '@/hooks/article/useArticleColumn';
  import type { ArticleColumnQuery, ArticleColumnVO } from '@/api/article';
  import EditModal from './components/EditModal.vue';

  const { loading, columnTree, fetchTree, saveOrUpdate, remove, changeStatus } =
    useArticleColumn();

  const queryParams = reactive<ArticleColumnQuery>({
    name: '',
    status: undefined,
    pageNo: 1,
    pageSize: 10,
  });

  const modalVisible = ref(false);
  const formData = ref<Partial<ArticleColumnVO>>();

  const handleSearch = () => {
    fetchTree(queryParams);
  };

  const resetQuery = () => {
    queryParams.name = '';
    queryParams.status = undefined;
    handleSearch();
  };

  const handleAdd = () => {
    formData.value = {
      parentId: '0',
      status: 1, // 默认启用
      sortOrder: 0,
    };
    modalVisible.value = true;
  };

  const handleAddChild = (record: ArticleColumnVO) => {
    formData.value = {
      parentId: record.id,
      status: 1,
      sortOrder: 0,
    };
    modalVisible.value = true;
  };

  const handleEdit = (record: ArticleColumnVO) => {
    formData.value = { ...record };
    modalVisible.value = true;
  };

  const handleSubmit = async (data: ArticleColumnVO) => {
    const success = await saveOrUpdate(data);
    if (success) {
      modalVisible.value = false;
      fetchTree(queryParams);
    }
  };

  const handleDelete = async (id: string) => {
    const success = await remove(id);
    if (success) {
      fetchTree(queryParams);
    }
  };

  const handleStatusChange = async (record: ArticleColumnVO, val: boolean) => {
    const newStatus = val ? 1 : 0;
    if (record.id) {
      const success = await changeStatus(record.id, newStatus);
      if (success) {
        record.status = newStatus;
      }
    }
  };

  // const formatDate = (date?: string | Date) => {
  //   if (!date) return '-';
  //   return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
  // };

  onMounted(() => {
    fetchTree(queryParams);
  });
</script>

<style scoped lang="less">
  .container {
    padding: 16px 20px 20px 20px;
    background-color: #f7f9fb;
    height: calc(100vh - 146px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .layout-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    :deep(.arco-card) {
      flex: 1;
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      border: 1px solid #e5e6eb;

      .arco-card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
        padding: 16px;

        .arco-table {
          flex: 1;
        }
      }
    }
  }
</style>
