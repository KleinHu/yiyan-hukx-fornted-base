<!-- 流程明细：展示表单（重构版本） -->
<template>
  <div class="bpm-detail-layout">
    <!-- 顶部标题区域 -->
    <div class="bpm-detail-header-wrapper">
      <BpmDetailHeader :instance="bpmInst" :task="undefined" />
    </div>

    <!-- 内容区域 -->
    <div class="bpm-detail-body">
      <div class="bpm-detail-main">
        <a-tabs default-active-key="form" class="bpm-tabs">
          <a-tab-pane key="form" title="表单详情">
            <div class="form-container">
              <FormFrame
                ref="frameRef"
                :form-id="formId"
                :def-id="defId"
                :inst-id="instanceId"
                @load="handleLoad"
              />
            </div>
          </a-tab-pane>
          <a-tab-pane key="map" title="流程图">
            <ProcessMapInline :def-id="defId" :inst-id="instanceId" />
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 右侧边栏 -->
      <div class="bpm-detail-sidebar">
        <!-- 流程操作卡片 -->
        <div class="other-actions-card">
          <h3 class="card-title">流程操作</h3>
          <a-space direction="vertical" fill>
            <a-button v-if="canTrack" type="outline" long @click="trackInst">
              <template #icon>
                <icon-star-fill v-if="tracked === '1'" />
                <icon-star v-else />
              </template>
              {{ trackText }}流程
            </a-button>

            <a-button
              v-if="allowTransfer"
              type="outline"
              long
              @click="transferTo"
            >
              <template #icon><icon-send /></template>
              转发流程
            </a-button>

            <a-button
              v-if="allowTransReply"
              type="outline"
              long
              @click="transferReply"
            >
              <template #icon><icon-message /></template>
              回复转发
            </a-button>

            <!-- 取回操作 -->
            <ModalTakeBack
              v-if="canRevoke"
              :inst-id="bpmInst?.instId || ''"
              :subject="bpmInst?.subject"
              class="long-modal-btn"
              @after-submit="loadDetail"
            />

            <a-button type="outline" long @click="close()">
              <template #icon><icon-close /></template>
              关闭页面
            </a-button>
          </a-space>
        </div>

        <!-- 流转记录卡片 -->
        <div class="history-card">
          <h3 class="card-title">流转记录</h3>
          <div class="history-scroll-container">
            <CheckHistoryInline :inst-id="instanceId" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, unref, ref, onMounted } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { useRouter } from 'vue-router';
  import { BpmInstRecord } from '@/api/bpm/model/bpmInstanceModel';
  import { BpmDefConfigRecord } from '@/api/bpm/model/bpmDefineModel';
  import { getBpmInstDetail } from '@/api/bpm/bpm-instance';
  import { trackBpmInst } from '@/api/bpm/bpm-track';
  import FormFrame from '@/components/bpm/form-frame.vue';
  import ModalTakeBack from './components/modal-take-back.vue';

  // 引入复用组件
  import BpmDetailHeader from '../bpm-task-detail/components/BpmDetailHeader.vue';
  import CheckHistoryInline from '../bpm-task-detail/components/CheckHistoryInline.vue';
  import ProcessMapInline from '../bpm-task-detail/components/ProcessMapInline.vue';

  const props = defineProps({
    allowTransfer: {
      type: Boolean,
      default: false,
    },
    allowTransReply: {
      type: Boolean,
      default: false,
    },
    from: {
      // 来自页面(mydone:我完成的审批,mystart:我发起的流程)
      type: String,
      default: '',
    },
  });

  const router = useRouter();
  const instanceId = computed(() => {
    const { instId } = unref(router.currentRoute).query;
    return (instId as string) || '';
  });
  const defId = ref();
  const tracked = ref('0');
  const canRevoke = ref(false);
  const bpmInst = ref<BpmInstRecord>();
  const loadingBtn = ref(true);

  const trackText = computed(() => (tracked.value === '1' ? '已跟踪' : '跟踪'));
  const canTrack = computed(() => {
    return (
      bpmInst.value?.status === 'RUNNING' || bpmInst.value?.status === 'REVOKE'
    );
  });

  const formId = ref();
  const loadForm = async (config: BpmDefConfigRecord) => {
    let id;
    if (config.detailForm.formpc && config.detailForm.formpc[0]) {
      id = config.detailForm.formpc[0].id;
    } else if (config.globalForm.formpc && config.globalForm.formpc[0]) {
      id = config.globalForm.formpc[0].id;
    }
    formId.value = id;
  };

  const loadDetail = async () => {
    try {
      const { data } = await getBpmInstDetail({
        instId: instanceId.value,
        from: props.from,
      });
      bpmInst.value = data.bpmInst;
      tracked.value = data.tracked;
      canRevoke.value = data.canRevoke;
      defId.value = data.bpmInst.defId;
      // 根据流程定义查询其表单id
      loadForm(data.processConfig);
    } finally {
      // empty
    }
  };

  const trackInst = async () => {
    try {
      const { data } = await trackBpmInst(instanceId.value);
      tracked.value = data.data;
      Message.success(data.message);
    } finally {
      // loadDetail();
    }
  };
  const transferTo = () => {
    // empty
  };
  const transferReply = () => {
    // empty
  };
  const close = () => {
    window.close();
  };

  const frameRef = ref();
  const handleLoad = () => {
    loadingBtn.value = false;
  };

  onMounted(() => {
    loadDetail();
  });
</script>

<style scoped lang="less">
  .bpm-detail-layout {
    min-height: 100vh;
    background-color: #f2f3f5;
    display: flex;
    flex-direction: column;
  }

  .bpm-detail-header-wrapper {
    padding: 20px 32px 0;
  }

  .bpm-detail-body {
    display: flex;
    gap: 20px;
    padding: 20px 32px;
    height: calc(100vh - 240px);
    overflow: hidden;
  }

  .bpm-detail-main {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    min-width: 0;
    height: 100%;

    .bpm-tabs {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;

      :deep(.arco-tabs-content) {
        flex: 1;
        padding: 0;
        overflow: hidden;
      }

      :deep(.arco-tabs-pane) {
        height: 100%;
      }
    }
  }

  .form-container {
    padding: 0;
    height: 100%;

    :deep(div) {
      height: 100%;
    }
  }

  .bpm-detail-sidebar {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: 100%;
  }

  .other-actions-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid var(--color-border-2);
    flex-shrink: 0;

    .card-title {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-1);
    }
  }

  .history-card {
    background: #fff;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid var(--color-border-2);
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;

    .card-title {
      margin: 0 0 12px 0;
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-1);
    }

    .history-scroll-container {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;

      :deep(.check-history-inline) {
        padding: 0;
      }
    }
  }

  .long-modal-btn {
    width: 100%;
    :deep(.arco-btn) {
      width: 100%;
      justify-content: center;
      border-color: var(--color-border-3);
      color: var(--color-text-2);

      &:hover {
        background-color: var(--color-fill-1);
      }
    }
  }

  :deep(.arco-tabs-nav-tab) {
    padding-left: 20px;
  }
</style>
