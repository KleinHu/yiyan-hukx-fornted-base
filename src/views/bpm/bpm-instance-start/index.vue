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
                :inst-id="instId"
                @load="handleLoad"
              />
            </div>
          </a-tab-pane>
          <a-tab-pane key="map" title="流程图">
            <ProcessMapInline :def-id="defId" :inst-id="instId" />
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 右侧边栏 -->
      <div class="bpm-detail-sidebar">
        <!-- 流程操作卡片 -->
        <div class="other-actions-card">
          <h3 class="card-title">流程操作</h3>
          <a-space direction="vertical" fill>
            <a-button
              type="primary"
              long
              :disabled="loadingBtn"
              :loading="loadingStart"
              @click="startProcess"
            >
              <template #icon><icon-play-circle /></template>
              启动流程
            </a-button>
            <a-button
              type="outline"
              long
              :disabled="loadingBtn"
              :loading="loadingSave"
              @click="saveDraft"
            >
              <template #icon><icon-save /></template>
              保存草稿
            </a-button>
            <a-button type="outline" long @click="close()">
              <template #icon><icon-close /></template>
              关闭页面
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 弹窗组件 -->
    <ModalStartConfirm
      v-model:visible="startConfirmVisible"
      :def-key="defKey"
      :inst-id="instId"
      :form-secret-level="formSecretLevel"
      @submit="confirmStart"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, unref, ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    BpmDefConfigRecord,
    BpmStartNodeOption,
  } from '@/api/bpm/model/bpmDefineModel';
  import { BpmInstRecord } from '@/api/bpm/model/bpmInstanceModel';
  import {
    getProcessonfigByDefKey,
    getInfoByDefKeyInstId,
    saveBpmInstDraft,
    startBpmProcess,
  } from '@/api/bpm/bpm-instance';
  // import ModalBpmImage from '@/components/bpm/modal-bpm-image.vue';
  import FormFrame from '@/components/bpm/form-frame.vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import { reloadDraft, loadDetail } from '@/utils/bpm/bpm-util';
  import ModalStartConfirm from './components/modal-start-confirm.vue';

  // 引入复用组件
  import BpmDetailHeader from '../bpm-task-detail/components/BpmDetailHeader.vue';
  import ProcessMapInline from '../bpm-task-detail/components/ProcessMapInline.vue';

  const router = useRouter();
  const defineKey = computed(() => {
    const { defKey } = unref(router.currentRoute).query;
    return (defKey as string) || undefined;
  });
  const instanceId = computed(() => {
    const { query } = unref(router.currentRoute);
    return (query.instId as string) || undefined;
  });
  const defKey = ref('');
  const defId = ref('');
  const instId = ref('');
  const startNodeOptions = ref<BpmStartNodeOption[]>([]);
  const bpmInst = ref<BpmInstRecord>();

  const loadingSave = ref(false);
  const loadingStart = ref(false);
  const loadingBtn = ref(true);

  // 记录展示在frame中的表单id
  const formId = ref();
  // 加载流程表单的详情
  const loadForm = async (config: BpmDefConfigRecord) => {
    let id;
    if (config.startForm.formpc && config.startForm.formpc[0]) {
      id = config.startForm.formpc[0].id;
    } else if (config.globalForm.formpc && config.globalForm.formpc[0]) {
      id = config.globalForm.formpc[0].id;
    }
    formId.value = id;
  };

  // 发起流程上时是否需要额外操作
  const hasActions = ref(false);
  // 发起流程时需要确认
  const needsConfirm = ref(false);
  const allowSelectPath = ref(false);
  const checkActionBeforeStart = (config: BpmDefConfigRecord) => {
    const options = config.startNodeOptions;
    allowSelectPath.value = config.allowSelectPath;

    // startNodeOptions: 开始节点配置
    const fillOpinion = options.includes('fillOpinion');
    const assignFlowUsers = options.includes('assignFlowUsers');
    const startCalFlowusers = options.includes('startCalFlowusers');
    const relInsts = options.includes('relInsts');
    needsConfirm.value = options.includes('startConfirm');
    return (
      allowSelectPath.value ||
      fillOpinion ||
      assignFlowUsers ||
      startCalFlowusers ||
      relInsts
    );
  };
  const loadProcessConfig = async () => {
    try {
      defKey.value = defineKey.value as string;
      if (!defKey.value && instanceId.value) {
        // 打开一个草稿流程：先用实例id获取defkey再取得defId
        const { data } = await getInfoByDefKeyInstId({
          id: instanceId.value,
          type: 'openDoc',
        });
        defKey.value = data.defKey;
        instId.value = data.instId;
      }
      const { data } = await getProcessonfigByDefKey(defKey.value);
      defId.value = data.data.defId;
      startNodeOptions.value = data.data.startNodeOptions;
      hasActions.value = checkActionBeforeStart(data.data);

      // 模拟一个基础的实例信息供 Header 使用
      bpmInst.value = {
        subject: data.data.name || '发起流程',
        status: 'DRAFT',
        defId: data.data.defId,
      } as BpmInstRecord;

      // 根据流程信息查询表单
      loadForm(data.data);
    } finally {
      // empty
    }
  };
  const frameRef = ref();
  const handleLoad = () => {
    loadingBtn.value = false;
  };

  const doStartProcess = async (extra?: any) => {
    try {
      loadingStart.value = true;
      const jsonData = await frameRef.value.getData();
      const formJson = JSON.stringify(jsonData);
      const { data } = await startBpmProcess({
        formJson,
        checkType: 'AGREE',
        defId: defId.value,
        instId: instId.value,
        systemHand: false,
        ...extra,
      });
      // 重新加载至详情页
      loadDetail(data.data.instId);
    } finally {
      loadingStart.value = false;
    }
  };

  const startConfirmVisible = ref(false);
  const formSecretLevel = ref(0);

  const startProcess = async () => {
    try {
      const { success, msg } = await frameRef.value.valid();
      if (!success) {
        Message.error(msg);
      } else if (hasActions.value) {
        // 有额外操作需要填写后启动流程，打开对话框
        startConfirmVisible.value = true;
        const jsonData = await frameRef.value.getData();
        formSecretLevel.value = jsonData.secretLevel;
      } else if (needsConfirm.value) {
        // 没有额外操作需要执行，只用弹出提示框
        Modal.warning({
          title: '警告',
          content: '确认启动流程吗？',
          hideCancel: false,
          onOk: () => doStartProcess(),
        });
      } else {
        doStartProcess();
      }
    } finally {
      // empty
    }
  };
  const confirmStart = (req: any) => {
    doStartProcess(req);
  };
  const saveDraft = async () => {
    try {
      loadingSave.value = true;
      // 正确的返回值为{ success: true, msg: '' }
      const { success, msg } = await frameRef.value.valid();
      if (!success) {
        Message.error(msg);
      } else {
        const jsonData = await frameRef.value.getData();
        const formJson = JSON.stringify(jsonData);
        const { data } = await saveBpmInstDraft({
          formJson,
          defId: defId.value,
          systemHand: false,
        });
        // 用保存后得到的实例id重新加载页面
        reloadDraft(data.data.instId);
      }
    } finally {
      loadingSave.value = false;
    }
  };
  // const formPrint = () => {
  //   // empty
  // };
  const close = () => {
    window.close();
  };

  onMounted(() => {
    loadProcessConfig();
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

  :deep(.arco-tabs-nav-tab) {
    padding-left: 20px;
  }
</style>
