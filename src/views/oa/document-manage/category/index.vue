<template>
  <div class="container">
    <a-card class="general-card" :bordered="false" title="分类管理">
      <template #extra>
        <a-space>
          <a-button type="outline" @click="toggleExpand">
            <template #icon>
              <icon-menu-unfold v-if="!isExpanded" />
              <icon-menu-fold v-else />
            </template>
            {{ isExpanded ? '折叠全部' : '展开全部' }}
          </a-button>
          <a-button type="primary" size="medium" @click="handleAddRoot">
            <template #icon><icon-plus /></template>
            新建根分类
          </a-button>
        </a-space>
      </template>
      <a-table
        ref="tableRef"
        row-key="id"
        :loading="loading"
        :data="categoryTree"
        :pagination="false"
        :bordered="false"
        :hoverable="true"
        :tree-props="{ children: 'children' }"
        size="large"
      >
        <template #columns>
          <a-table-column title="序号" :width="80" align="center">
            <template #cell="{ rowIndex }">
              {{ rowIndex + 1 }}
            </template>
          </a-table-column>
          <a-table-column title="分类名称" data-index="name">
            <template #cell="{ record }">
              <a-space>
                <icon-folder style="color: #165dff; font-size: 16px" />
                <span style="font-weight: 500">{{ record.name }}</span>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column
            title="排序"
            data-index="sort"
            :width="100"
            align="center"
          >
            <template #cell="{ record }">
              <a-tag color="gray" size="small">{{ record.sort }}</a-tag>
            </template>
          </a-table-column>
          <a-table-column
            title="必须审批"
            data-index="needApproval"
            :width="120"
            align="center"
          >
            <template #cell="{ record }">
              <a-tag :color="record.needApproval === 1 ? 'arcoblue' : 'gray'">
                <template #icon>
                  <icon-safe v-if="record.needApproval === 1" />
                  <icon-minus-circle v-else />
                </template>
                {{ record.needApproval === 1 ? '是' : '否' }}
              </a-tag>
            </template>
          </a-table-column>
          <a-table-column
            title="备注"
            data-index="remark"
            :ellipsis="true"
            :tooltip="true"
          ></a-table-column>
          <a-table-column title="操作" :width="280" align="center">
            <template #cell="{ record }">
              <a-space :size="5">
                <a-button
                  type="text"
                  size="small"
                  @click="handleAddSub(record)"
                >
                  <template #icon><icon-plus /></template>
                  子分类
                </a-button>
                <a-button type="text" size="small" @click="handleEdit(record)">
                  <template #icon><icon-edit /></template>
                  编辑
                </a-button>
                <a-popconfirm
                  content="您确定要删除该分类吗？"
                  type="warning"
                  @ok="handleDelete(record.id)"
                >
                  <a-button type="text" status="danger" size="small">
                    <template #icon><icon-delete /></template>
                    删除
                  </a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </a-card>

    <!-- 分类表单抽屉 -->
    <a-drawer
      :visible="visible"
      :title="isEdit ? '编辑分类' : '新增分类'"
      width="450px"
      @cancel="handleCancel"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
        <a-form-item label="分类名称" field="name">
          <a-input v-model="form.name" placeholder="请输入分类名称" />
        </a-form-item>
        <a-form-item label="父级分类" field="parentId">
          <a-tree-select
            v-model="form.parentId"
            :data="categoryTree"
            :field-names="{ key: 'id', title: 'name', children: 'children' }"
            placeholder="请选择父级分类（不选默认根节点）"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="必须审批" field="needApproval">
          <a-switch
            v-model="form.needApproval"
            :checked-value="1"
            :unchecked-value="0"
          />
          <template #extra>开启后，该分类下传的文件默认进入待审签状态</template>
        </a-form-item>
        <a-form-item label="排序" field="sort">
          <a-input-number v-model="form.sort" placeholder="排序号" />
        </a-form-item>
        <a-form-item label="备注" field="remark">
          <a-textarea v-model="form.remark" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </a-drawer>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import useDocumentCategory from '@/hooks/documents/useDocumentCategory';
  import type { DocumentCategoryRecord } from '@/api/documents/document';

  const { loading, categoryTree, fetchTree, saveOrUpdate, remove } =
    useDocumentCategory();

  const visible = ref(false);
  const isEdit = ref(false);
  const formRef = ref();

  // 控制表格展开/折叠
  const tableRef = ref();
  const isExpanded = ref(false);

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
    if (tableRef.value) {
      tableRef.value.expandAll(isExpanded.value);
    }
  };

  const defaultForm = (): Partial<DocumentCategoryRecord> => ({
    id: '',
    parentId: '0',
    name: '',
    sort: 0,
    needApproval: 0,
    remark: '',
  });

  const form = reactive<Partial<DocumentCategoryRecord>>(defaultForm());

  const rules = {
    name: [{ required: true, message: '请输入分类名称' }],
  };

  const handleAddRoot = () => {
    isEdit.value = false;
    Object.assign(form, defaultForm());
    visible.value = true;
  };

  const handleAddSub = (record: DocumentCategoryRecord) => {
    isEdit.value = false;
    Object.assign(form, defaultForm());
    form.parentId = record.id;
    visible.value = true;
  };

  const handleEdit = (record: DocumentCategoryRecord) => {
    isEdit.value = true;
    Object.assign(form, record);
    // 对于根节点处理
    if (!form.parentId || form.parentId === '0') {
      form.parentId = undefined;
    }
    visible.value = true;
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    fetchTree();
  };

  const handleCancel = () => {
    visible.value = false;
    formRef.value?.resetFields();
  };

  const handleSubmit = async () => {
    const errors = await formRef.value?.validate();
    if (errors) return;

    const payload = { ...form };
    if (!payload.parentId) {
      payload.parentId = '0';
    }

    const success = await saveOrUpdate(payload);
    if (success) {
      visible.value = false;
      fetchTree();
    }
  };

  onMounted(() => {
    fetchTree();
  });
</script>

<script lang="ts">
  export default {
    name: 'DocumentCategory',
  };
</script>

<style scoped>
  .container {
    padding: 20px;
  }
</style>
