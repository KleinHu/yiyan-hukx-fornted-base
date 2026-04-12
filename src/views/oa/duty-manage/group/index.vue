<template>
  <div class="container">
    <Breadcrumb :items="['值班管理', '分组配置']" />
    <div class="layout-content">
      <a-card class="general-card" title="值班分组管理">
        <template #extra>
          <a-button type="primary" @click="handleAdd">
            <template #icon><icon-plus /></template>
            新增分组
          </a-button>
        </template>

        <a-table
          row-key="id"
          :loading="loading"
          :data="groupTree"
          :pagination="false"
          :default-expand-all-rows="true"
          :hide-expand-button-on-empty="true"
        >
          <template #columns>
            <a-table-column title="分组名称" data-index="name" />
            <a-table-column title="层级" data-index="level">
              <template #cell="{ record }">
                <a-tag v-if="record.level === 1" color="arcoblue">科室级</a-tag>
                <a-tag v-else-if="record.level === 2" color="green"
                  >班组级</a-tag
                >
                <a-tag v-else color="gray">其他</a-tag>
              </template>
            </a-table-column>
            <a-table-column title="关联HR科室" data-index="departmentName">
              <template #cell="{ record }">
                {{ record.departmentName || '-' }}
              </template>
            </a-table-column>
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
            <a-table-column title="操作" :width="200" align="center">
              <template #cell="{ record }">
                <a-space>
                  <a-button
                    v-if="record.level === 1"
                    type="text"
                    size="small"
                    @click="handleAddChild(record)"
                  >
                    添加班组
                  </a-button>
                  <a-button
                    type="text"
                    size="small"
                    @click="handleEdit(record)"
                  >
                    编辑
                  </a-button>
                  <a-popconfirm
                    content="确定要删除该分组吗？"
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

    <!-- 编辑/新增弹窗 (待创建) -->
    <GroupEditModal
      v-model:visible="modalVisible"
      :initial-data="formData"
      @submit="handleSearch"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import useDutyGroup from '@/hooks/oa/duty/useDutyGroup';
  import type { DutyGroupVO } from '@/api/oa/duty';
  import GroupEditModal from './components/GroupEditModal.vue';

  const { loading, groupTree, fetchTree, remove, saveOrUpdate } =
    useDutyGroup();

  const modalVisible = ref(false);
  const formData = ref<Partial<DutyGroupVO>>({});

  const handleSearch = () => {
    fetchTree();
  };

  const handleAdd = () => {
    formData.value = {
      parentId: '0',
      level: 1,
      status: 1,
    };
    modalVisible.value = true;
  };

  const handleAddChild = (record: DutyGroupVO) => {
    formData.value = {
      parentId: record.id,
      level: 2,
      status: 1,
    };
    modalVisible.value = true;
  };

  const handleEdit = (record: DutyGroupVO) => {
    formData.value = { ...record };
    modalVisible.value = true;
  };

  const handleDelete = async (id: string) => {
    const success = await remove(id);
    if (success) {
      handleSearch();
    }
  };

  const handleStatusChange = async (record: DutyGroupVO, val: boolean) => {
    const newStatus = val ? 1 : 0;
    const success = await saveOrUpdate({ ...record, status: newStatus });
    if (success) {
      record.status = newStatus;
    }
  };

  onMounted(() => {
    handleSearch();
  });
</script>

<script lang="ts">
  export default {
    name: 'DutyGroupManage',
  };
</script>

<style scoped lang="less">
  .container {
    padding: 16px 20px 20px 20px;
    background-color: #f7f9fb;
    height: calc(100vh - 120px);
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

      .arco-card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        padding: 16px;
        overflow: auto;
      }
    }
  }
</style>
