<template>
  <a-drawer
    v-model:visible="visible"
    title="历史版本记录"
    width="800px"
    :footer="false"
  >
    <a-table :data="historyData" :pagination="false" :loading="loading">
      <template #columns>
        <a-table-column
          title="版本号"
          data-index="versionNum"
          :width="100"
        ></a-table-column>
        <a-table-column
          title="归档时间"
          data-index="createTime"
          :width="180"
        ></a-table-column>
        <a-table-column
          title="更新日志"
          data-index="updateLog"
        ></a-table-column>
        <a-table-column title="操作" :width="120" align="center">
          <template #cell="{ record }">
            <a-button type="text" size="small" @click="downloadUrl(record.url)"
              >下载</a-button
            >
          </template>
        </a-table-column>
      </template>
    </a-table>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { getDocumentVersionPage } from '@/api/documents/document';
  import type { DocumentVersionRecord } from '@/api/documents/document';

  const visible = ref(false);
  const historyData = ref<DocumentVersionRecord[]>([]);
  const loading = ref(false);

  const open = async (documentId: string) => {
    // 先弹出抽屉，展示 loading 骨架，无需等待请求
    historyData.value = [];
    visible.value = true;
    loading.value = true;
    try {
      const { data } = await getDocumentVersionPage({
        documentId,
        pageNo: 1,
        pageSize: 50,
      });
      historyData.value = data?.list || [];
    } catch (err) {
      Message.error('获取历史记录失败');
    } finally {
      loading.value = false;
    }
  };

  const downloadUrl = (url: string) => {
    window.open(url, '_blank');
  };

  defineExpose({ open });
</script>
