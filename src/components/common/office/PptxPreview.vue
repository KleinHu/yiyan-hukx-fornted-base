<template>
  <div class="office-preview-pptx">
    <a-spin
      :loading="loading"
      tip="正在解析 PPT 演示文稿（可能需要较长时间）..."
      style="width: 100%; height: 100%"
    >
      <div v-if="localSrc" class="pptx-wrapper">
        <vue-office-pptx
          :src="localSrc"
          style="height: 100vh; width: 100%"
          @rendered="onRendered"
          @error="onError"
        />
      </div>
      <div v-else-if="!loading" class="empty-tip">未提供有效的演示文稿地址</div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, onMounted } from 'vue';
  import VueOfficePptx from '@vue-office/pptx';

  const props = defineProps({
    src: {
      type: String,
      required: true,
      default: '',
    },
  });

  const emit = defineEmits(['rendered', 'error']);

  const loading = ref(true);
  const localSrc = ref<string | ArrayBuffer>('');

  const loadFile = async (url: string) => {
    loading.value = true;
    try {
      // 通过 Fetch 把文件提取为 ArrayBuffer，这能解决绝大部分跨域、内容拦截或者部分解析加载异常引起的黑屏
      const response = await fetch(url);
      if (!response.ok) throw new Error('网络响应不可用');
      const buffer = await response.arrayBuffer();
      localSrc.value = buffer;
    } catch (error) {
      console.warn('PPT Fetch缓冲失败，采取直链加载:', error);
      // 降级使用原本的 URL 直链
      localSrc.value = url;
    }
  };

  // 监听 src 变化，重新触发加载状态
  watch(
    () => props.src,
    (newVal) => {
      if (newVal) {
        loadFile(newVal);
      }
    },
    { immediate: true }
  );

  onMounted(() => {
    if (!props.src) {
      loading.value = false;
    }
  });

  const onRendered = () => {
    loading.value = false;
    emit('rendered');
  };

  const onError = (e: any) => {
    // eslint-disable-next-line no-console
    console.error('PPT渲染失败:', e);
    loading.value = false;
    emit('error', e);
  };
</script>

<style scoped>
  .office-preview-pptx {
    width: 100%;
    height: 100%;
    min-height: 400px;
    background-color: #ffffff; /* 强制底色转白，防止因容器透明或暗黑模式导致全黑 */
  }
  .pptx-wrapper {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
  .empty-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-text-3);
  }
</style>
