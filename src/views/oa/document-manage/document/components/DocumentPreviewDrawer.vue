<template>
  <a-drawer
    v-model:visible="visible"
    :title="`文件预览 - ${fileName}`"
    width="80%"
    unmount-on-close
    :footer="false"
  >
    <div class="preview-container">
      <!-- Word 预览 -->
      <DocxPreview v-if="fileType === 'docx'" :src="fileUrl" @error="onError" />

      <!-- Excel 预览 -->
      <ExcelPreview
        v-else-if="fileType === 'xlsx'"
        :src="fileUrl"
        @error="onError"
      />

      <!-- PPT 预览 -->
      <PptxPreview
        v-else-if="fileType === 'pptx'"
        :src="fileUrl"
        @error="onError"
      />

      <!-- PDF 预览 -->
      <PdfPreview
        v-else-if="fileType === 'pdf'"
        :src="fileUrl"
        @error="onError"
      />

      <!-- 不支持的格式 -->
      <div v-else class="unsupported-type">
        <a-result status="warning" title="暂不支持预览该文件格式">
          <template #subtitle>
            仅支持 docx, xlsx, pptx 和 pdf 格式的在线预览
          </template>
          <template #extra>
            <a-button type="primary" @click="handleDownload">下载查看</a-button>
          </template>
        </a-result>
      </div>
    </div>
  </a-drawer>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  // 引入通用预览组件
  import {
    DocxPreview,
    ExcelPreview,
    PptxPreview,
    PdfPreview,
  } from '@/components/common/office';
  import useFileTransfer from '@/hooks/common/useFileTransfer';

  const visible = ref(false);
  const fileUrl = ref('');
  const fileName = ref('');
  const fileType = ref('');

  const open = (url: string, name: string) => {
    if (!url) {
      Message.error('文件地址无效');
      return;
    }
    fileUrl.value = url;
    fileName.value = name;

    // 获取文件后缀，先从文件名获取，如果没有再尝试从 URL 获取
    let extension = name.split('.').pop()?.toLowerCase() || '';
    if (extension === name.toLowerCase()) {
      extension = url.split('?')[0].split('.').pop()?.toLowerCase() || '';
    }
    fileType.value = extension;

    // 只有在支持预览的格式下才显示
    visible.value = true;
  };

  const onError = (e: any) => {
    // eslint-disable-next-line no-console
    console.error('文件渲染失败:', e);
    Message.error('渲染文件失败，请尝试下载后查看');
  };

  const { downloadFile } = useFileTransfer();

  const handleDownload = () => {
    if (!fileUrl.value) return;
    downloadFile(fileUrl.value, fileName.value);
  };

  defineExpose({
    open,
  });
</script>

<style scoped>
  .preview-container {
    width: 100%;
    min-height: 500px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .unsupported-type {
    margin-top: 100px;
  }
</style>
