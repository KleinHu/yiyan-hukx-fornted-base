<template>
  <div class="office-preview-docx">
    <a-spin
      :loading="loading"
      tip="正在加载 Word 文档..."
      style="width: 100%; height: 100%"
    >
      <vue-office-docx
        v-if="src"
        :src="src"
        style="height: 100%"
        @rendered="onRendered"
        @error="onError"
      />
      <div v-else class="empty-tip">未提供有效的文档地址</div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, onMounted } from 'vue';
  import VueOfficeDocx from '@vue-office/docx';
  import '@vue-office/docx/lib/index.css';

  const props = defineProps({
    src: {
      type: String,
      required: true,
      default: '',
    },
  });

  const emit = defineEmits(['rendered', 'error']);

  const loading = ref(true);

  // 监听 src 变化，重新触发加载状态
  watch(
    () => props.src,
    (newVal) => {
      if (newVal) {
        loading.value = true;
      }
    }
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
    console.error('Word渲染失败:', e);
    loading.value = false;
    emit('error', e);
  };
</script>

<style scoped>
  .office-preview-docx {
    width: 100%;
    height: 100%;
    min-height: 400px;
    background-color: var(--color-bg-2);
  }
  .empty-tip {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--color-text-3);
  }
</style>
