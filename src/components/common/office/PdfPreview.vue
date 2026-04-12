<template>
  <div class="office-preview-pdf">
    <a-spin
      :loading="loading"
      tip="正在准备 PDF 预览..."
      style="width: 100%; height: 100%"
    >
      <div v-if="src" class="pdf-container">
        <!-- 使用 iframe 调用浏览器原生 PDF 解析器，这是最稳定且功能最全（支持打印、缩放）的方式 -->
        <iframe
          :src="src"
          class="pdf-iframe"
          @load="onLoad"
          @error="onError"
        ></iframe>
      </div>
      <div v-else class="empty-tip">未提供有效的 PDF 文档地址</div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';

  const props = defineProps({
    src: {
      type: String,
      required: true,
      default: '',
    },
  });

  const emit = defineEmits(['rendered', 'error']);

  const loading = ref(true);

  // 监听 src 变化
  watch(
    () => props.src,
    (newVal) => {
      if (newVal) {
        loading.value = true;
      }
    },
    { immediate: true }
  );

  const onLoad = () => {
    loading.value = false;
    emit('rendered');
  };

  const onError = (e: any) => {
    // eslint-disable-next-line no-console
    console.error('PDF 加载失败:', e);
    loading.value = false;
    emit('error', e);
  };
</script>

<style scoped>
  .office-preview-pdf {
    width: 100%;
    height: 100%;
    min-height: calc(100vh - 200px);
    background-color: var(--color-bg-2);
  }
  .pdf-container {
    width: 100%;
    height: 100%;
    min-height: calc(100vh - 200px);
  }
  .pdf-iframe {
    width: 100%;
    height: 100%;
    border: none;
    min-height: calc(100vh - 200px);
  }
  .empty-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 400px;
    color: var(--color-text-3);
  }
</style>
