<template>
  <a-drawer
    v-model:visible="visible"
    :title="isUpdateVersion ? '版本更新' : '上传新文档'"
    width="500px"
    unmount-on-close
    @cancel="handleCancel"
  >
    <a-alert v-if="!isUpdateVersion" type="info" style="margin-bottom: 16px">
      温馨提示：需要审签的分类暂不支持在此直接上传，请前往流程中心发起申请。
    </a-alert>
    <a-form ref="formRef" :model="form" layout="vertical">
      <a-form-item
        field="name"
        label="文档名称"
        :rules="[{ required: true, message: '请输入文档名称' }]"
      >
        <a-input v-model="form.name" placeholder="请输入文档名称" />
      </a-form-item>
      <a-form-item
        v-if="!isUpdateVersion"
        field="categoryId"
        label="所属分类"
        :rules="[{ required: true, message: '请选择分类' }]"
      >
        <a-tree-select
          v-model="form.categoryId"
          :data="filteredCategoryTree"
          :field-names="{ key: 'id', title: 'name', children: 'children' }"
          placeholder="请选择分类"
        />
      </a-form-item>
      <a-form-item
        label="文件上传"
        field="url"
        :rules="[{ required: true, message: '请上传文件' }]"
      >
        <a-upload
          :limit="1"
          draggable
          :custom-request="customUploadRequest"
          @success="onUploadSuccess"
          @remove="onUploadRemove"
        />
      </a-form-item>
      <a-form-item v-if="isUpdateVersion" field="updateLog" label="更新日志">
        <a-textarea
          v-model="form.updateLog"
          placeholder="请输入本次更新的内容摘要"
        />
      </a-form-item>
    </a-form>
    <template #footer>
      <a-space>
        <a-button @click="handleCancel">取消</a-button>
        <a-button type="outline" :loading="loading" @click="handleConfirm(0)">
          保存草稿
        </a-button>
        <a-button type="primary" :loading="loading" @click="handleConfirm(2)">
          直接发布
        </a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import useFileTransfer from '@/hooks/common/useFileTransfer';
  import useDocument from '@/hooks/documents/useDocument';
  import { useUserStore } from '@/store';
  import type { DocumentRecord } from '@/api/documents/document';

  const props = defineProps<{
    categoryTree: any[];
  }>();

  const userStore = useUserStore();

  const filteredCategoryTree = computed(() => {
    const process = (list: any[]): any[] => {
      return list.map((item) => {
        const node = { ...item };
        // 审签分类在用户页面禁用选择，强制走流程
        if (node.needApproval === 1) {
          node.disabled = true;
        }
        if (node.children && node.children.length > 0) {
          node.children = process(node.children);
        }
        return node;
      });
    };
    return process(props.categoryTree);
  });

  const emit = defineEmits(['success']);

  const visible = ref(false);
  const isUpdateVersion = ref(false);
  const formRef = ref();
  const { loading, saveOrUpdate, changeVersion } = useDocument();

  const form = reactive<{
    id?: string;
    name: string;
    categoryId: string;
    url: string;
    size?: number;
    type?: string;
    updateLog?: string;
  }>({
    name: '',
    categoryId: '',
    url: '',
  });

  const open = (record?: DocumentRecord, categoryId?: string) => {
    isUpdateVersion.value = !!record;
    if (record) {
      form.id = record.id;
      form.name = record.name;
      form.categoryId = record.categoryId;
      form.url = '';
      form.updateLog = '';
    } else {
      form.id = undefined;
      form.name = '';
      form.categoryId = categoryId || '';
      form.url = '';
      form.updateLog = '';
    }
    visible.value = true;
  };

  const handleCancel = () => {
    visible.value = false;
    formRef.value?.resetFields();
  };

  const getCategoryNameById = (tree: any[], id: string): string => {
    let result = '';
    tree.some((node) => {
      if (node.id === id) {
        result = node.name;
        return true;
      }
      if (node.children && node.children.length > 0) {
        result = getCategoryNameById(node.children, id);
        if (result) return true;
      }
      return false;
    });
    return result;
  };

  const customUploadRequest = async (option: any) => {
    const { fileItem, onSuccess, onError } = option;

    if (!form.categoryId) {
      Message.warning('请先选择文档分类后再上传文件！');
      onError(new Error('未选择分类'));
      return;
    }

    const categoryName = getCategoryNameById(
      props.categoryTree,
      form.categoryId
    );
    const path = `/documents/${categoryName || form.categoryId}`;

    const { uploadFile } = useFileTransfer();

    try {
      const res = await uploadFile(fileItem.file as File, path);
      onSuccess(res);
    } catch (err) {
      onError(err);
    }
  };

  const onUploadSuccess = (fileItem: any) => {
    const data = fileItem?.response?.data ?? fileItem?.response ?? {};
    form.url = data.url || '';
    form.size = data.fileSize;
    form.type = data.contentType;
    if (!form.name) {
      form.name = data.fileName || '';
    }
    formRef.value?.clearValidate('url');
  };

  const onUploadRemove = () => {
    form.url = '';
  };

  const handleConfirm = async (status: number) => {
    const errors = await formRef.value?.validate();
    if (errors) return;

    let success = false;
    // 自动注入当前登录人作为 uploader
    const uploader = userStore.username || userStore.nickname;

    if (isUpdateVersion.value && form.id) {
      success = await changeVersion({
        documentId: form.id,
        newUrl: form.url,
        newFileName: form.name,
        newFileSize: form.size,
        updateLog: form.updateLog,
        uploader,
      });
    } else {
      success = await saveOrUpdate({
        name: form.name,
        categoryId: form.categoryId,
        url: form.url,
        size: form.size,
        type: form.type,
        status, // 0-草稿, 2-发布
        uploader,
      });
    }

    if (success) {
      visible.value = false;
      emit('success');
    }
  };

  defineExpose({ open });
</script>
