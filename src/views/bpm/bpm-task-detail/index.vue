<!-- 流程明细：展示表单（重构版本） -->
<template>
  <div class="bpm-detail-layout">
    <!-- 顶部标题区域 -->
    <div class="bpm-detail-header-wrapper">
      <BpmDetailHeader :instance="bpmInst" :task="bpmTask" />
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
                :def-id="bpmInst?.defId"
                :inst-id="bpmInst?.instId"
                :node-id="bpmTask?.key"
                @load="handleLoad"
              />
            </div>
          </a-tab-pane>
          <a-tab-pane key="map" title="流程图">
            <ProcessMapInline
              :inst-id="bpmInst?.instId"
              :def-id="bpmInst?.defId"
            />
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 右侧边栏 -->
      <div class="bpm-detail-sidebar">
        <!-- 其他操作按钮（原顶部按钮转移至此） -->
        <div class="other-actions-card">
          <h3 class="card-title">流程操作</h3>
          <a-space direction="vertical" fill>
            <a-button
              v-if="allowApprove"
              type="primary"
              long
              :disabled="loadingBtn"
              @click="approve"
            >
              <template #icon><icon-check-circle /></template>
              常规审批
            </a-button>
            <a-button
              type="outline"
              long
              :disabled="loadingBtn"
              :loading="loadingSave"
              @click="saveData"
            >
              <template #icon><icon-save /></template>
              保存单据
            </a-button>
            <a-button
              v-if="candicate != -1 && !isTransferRoam"
              type="outline"
              long
              :disabled="loadingBtn"
              @click="lockTask()"
            >
              <template #icon
                ><icon-lock v-if="lockStatus === '锁定任务'" /><icon-unlock
                  v-else
              /></template>
              {{ lockStatus }}
            </a-button>
            <a-button type="outline" long @click="trackInst">
              <template #icon>
                <icon-star-fill v-if="tracked === '1'" />
                <icon-star v-else />
              </template>
              {{ trackText }}流程
            </a-button>

            <!-- 复杂操作（保留原Modal触发按钮） -->
            <ModalAddSign
              v-if="canAddAsign && !isTransferRoam"
              :task-id="bpmTaskId"
              :disabled="loadingBtn"
              :form-secret-level="formSecretLevel"
              class="long-modal-btn"
            />

            <a-button
              v-if="canRefuse && !isTransferRoam"
              type="outline"
              long
              :disabled="loadingBtn"
              @click="openRejectModal"
            >
              <template #icon><icon-reply /></template>
              常规驳回
            </a-button>

            <ModalTaskTransfer
              v-if="canTransfer && !loadingBtn"
              :task-id="bpmTaskId"
              :subject="bpmTask?.subject"
              :form-secret-level="formSecretLevel"
              class="long-modal-btn"
              @after-submit="loadDetail(bpmInst?.instId || '')"
            />

            <ModalTaskRoam
              v-if="!isCanRoamTransfer && !loadingBtn"
              :task-id="bpmTaskId"
              :subject="bpmTask?.subject"
              :form-secret-level="formSecretLevel"
              class="long-modal-btn"
              @after-submit="loadTaskDetail"
            />

            <ModalTaskRoamList
              v-if="isCanRoamTransfer && !loadingBtn"
              :task-id="bpmTaskId"
              class="long-modal-btn"
            />

            <a-button
              v-if="isCanRoamTransfer && !loadingBtn"
              type="outline"
              long
              @click="cancelRoamTransfer"
            >
              取消流转
            </a-button>

            <a-button
              :disabled="loadingBtn"
              type="outline"
              long
              status="danger"
              @click="openCancel"
            >
              <template #icon><icon-delete /></template>
              作废流程
            </a-button>

            <a-button type="outline" long @click="close()">
              <template #icon><icon-close /></template>
              关闭页面
            </a-button>
          </a-space>
        </div>

        <!-- 流转记录卡片（移动至右侧） -->
        <div class="history-card">
          <h3 class="card-title">流转记录</h3>
          <div class="history-scroll-container">
            <CheckHistoryInline :inst-id="bpmInst?.instId || ''" />
          </div>
        </div>
      </div>
    </div>

    <!-- 隐藏的对话框组件（保持原有逻辑） -->
    <ModalTaskApprove
      v-if="allowApprove"
      v-model:visible="visibleApprove"
      :allow-select-executor="allowSelectExecutor"
      :allow-select-group="allowSelectGroup"
      :opinion-obj="bpmTaskId"
      :system-hand="false"
      :task-id="bpmTaskId"
      :task-config="taskConfig"
      :show-more-options="approveShowMoreOptions"
      :form-json="currentFormJson"
      :form-secret-level="formSecretLevel"
      :submitting="loadingApprove"
      @submit="approveData"
    />

    <ModalTaskApproveTransfer
      v-model:visible="visibleApproveTransfer"
      :task-id="bpmTaskId"
      :task-config="taskConfig"
    />

    <ModalTaskReject
      v-model:visible="visibleReject"
      :task-id="bpmTaskId"
      :task-config="taskConfig"
      :form-secret-level="formSecretLevel"
      @submit="rejectData"
    />

    <ModalInstanceCancel
      v-model:visible="visibleCancel"
      :inst-id="bpmInst?.instId || ''"
      @after-submit="loadDetail(bpmInst?.instId || '')"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, unref, ref, onMounted } from 'vue';
  import { Message, Modal } from '@arco-design/web-vue';
  import { useRouter } from 'vue-router';
  import { BpmDefConfigRecord } from '@/api/bpm/model/bpmDefineModel';
  import {
    BpmTaskRecord,
    BpmTaskFormCompleteReq,
    BpmTaskConfigRecord,
  } from '@/api/bpm/model/bpmTaskModel';
  import {
    getBpmTaskDetail,
    updateBpmTaskLocked,
    cancelBpmTaskRoam,
    saveBpmTrackForm,
    completeTask,
  } from '@/api/bpm/bpm-task';
  import { trackBpmInst } from '@/api/bpm/bpm-track';
  import { BpmInstRecord } from '@/api/bpm/model/bpmInstanceModel';
  import { loadDetail } from '@/utils/bpm/bpm-util';
  import FormFrame from '@/components/bpm/form-frame.vue';

  // 新引入的重构组件
  import BpmDetailHeader from './components/BpmDetailHeader.vue';
  import CheckHistoryInline from './components/CheckHistoryInline.vue';
  import ProcessMapInline from './components/ProcessMapInline.vue';

  // 原有弹窗组件
  import ModalTaskTransfer from './components/modal-task-transfer.vue';
  import ModalAddSign from './components/modal-add-sign.vue';
  import ModalTaskRoam from './components/modal-task-roam.vue';
  import ModalTaskRoamList from './components/modal-task-roam-list.vue';
  import ModalTaskReject from './components/modal-task-reject.vue';
  import ModalTaskApprove from './components/modal-task-approve.vue';
  import ModalTaskApproveTransfer from './components/modal-task-approve-transfer.vue';
  import ModalInstanceCancel from './components/modal-instance-cancel.vue';

  defineProps({
    backNodeId: {
      // 在流程明细中进行回退时指定的目标节点
      type: String,
    },
    allowTransfer: {
      type: Boolean,
      default: false,
    },
    allowTransReply: {
      type: Boolean,
      default: false,
    },
  });

  const router = useRouter();
  const bpmTaskId = computed(() => {
    const { taskId } = unref(router.currentRoute).query;
    return (taskId as string) || '';
  });

  const allowApprove = ref(false);
  const isTransferRoam = ref(false);
  const isCanRoamTransfer = ref(false);
  const canTransfer = ref(false);
  const canAddAsign = ref(false);
  const canRefuse = ref(false);
  const allowSelectExecutor = ref(false);
  const allowSelectGroup = ref(false);
  const bpmTask = ref<BpmTaskRecord>();
  const bpmInst = ref<BpmInstRecord>();
  const instStatus = ref('');

  const tracked = ref('0');
  const taskConfig = ref<BpmTaskConfigRecord>();
  const trackText = computed(() => (tracked.value === '1' ? '已跟踪' : '跟踪'));
  const approveShowMoreOptions = ref(false);

  const lockStatus = computed(() => {
    if (bpmTask.value?.hasCandicate) {
      return bpmTask.value.assignee ? '释放任务' : '锁定任务';
    }
    return '';
  });
  const candicate = computed(() => {
    if (bpmTask.value?.hasCandicate) {
      return bpmTask.value.assignee ? 1 : 2;
    }
    return -1;
  });
  const quickApprove = computed(() => {
    return taskConfig.value?.switchOptions.includes('quickApprove');
  });

  // 记录展示在frame中的表单id
  const formId = ref();
  // 加载流程表单的详情
  const loadForm = async (processConfig: BpmDefConfigRecord) => {
    let id;
    if (taskConfig.value?.form.formpc && taskConfig.value.form.formpc[0]) {
      id = taskConfig.value.form.formpc[0].id;
    } else if (
      processConfig.globalForm.formpc &&
      processConfig.globalForm.formpc[0]
    ) {
      id = processConfig.globalForm.formpc[0].id;
    }
    formId.value = id;
  };

  const loadTaskDetail = async () => {
    try {
      const { data } = await getBpmTaskDetail(bpmTaskId.value);
      bpmTask.value = data.data.bpmTask;
      bpmInst.value = data.data.bpmInst;
      instStatus.value = data.data.bpmInst.status;
      allowApprove.value = data.data.allowApprove.success;
      tracked.value = data.data.tracked;
      isTransferRoam.value = data.data.isTransferRoam;
      isCanRoamTransfer.value = data.data.isCanRoamTransfer;
      canTransfer.value = data.data.canTransfer;
      canAddAsign.value = data.data.canAddSign;
      canRefuse.value = data.data.isCanBack;
      taskConfig.value = data.data.taskConfig;
      allowSelectExecutor.value = data.data.taskConfig.switchOptions.includes(
        'allowSelectExecutor'
      );
      allowSelectGroup.value =
        data.data.taskConfig.switchOptions.includes('allowSelectGroup');
      approveShowMoreOptions.value = showMoreOptions(data.data.processConfig);
      // 根据流程信息查询表单
      loadForm(data.data.processConfig);
    } finally {
      // empty
    }
  };

  // 更多选项
  const showMoreOptions = (processConfig?: BpmDefConfigRecord) => {
    if (taskConfig.value?.switchOptions.includes('showMoreOptions')) {
      return true;
    }
    return !!processConfig?.switchOptions?.includes('showMoreOptions');
  };

  const loadingSave = ref(false);

  const visibleReject = ref(false);
  const visibleApprove = ref(false);
  const visibleApproveTransfer = ref(false);

  // 打开审批对话框的时候加载表单数据一起传入，用于查询受表单值影响的后续节点审批人信息
  const currentFormJson = ref('{}');
  const formSecretLevel = ref(0);

  const setSecretLevel = async () => {
    const jsonData = await frameRef.value.getData();
    formSecretLevel.value = jsonData.secretLevel
      ? Number(jsonData.secretLevel)
      : 0;
  };

  // 快速审批
  const doQuickApprove = async () => {
    const cmd = {
      taskId: bpmTaskId.value,
      checkType: 'AGREE',
      opinion: '',
      systemHand: true,
    };
    await approveData(cmd);
  };
  const approve = async () => {
    const { success, msg } = await frameRef.value.valid();
    if (!success) {
      Message.error(msg);
    } else if (isCanRoamTransfer.value) {
      Message.error('当前任务正在流转，请取消流转后重试');
    } else if (quickApprove.value) {
      Modal.confirm({
        title: '流程审批',
        content: '确认审批流程吗？',
        onOk: () => doQuickApprove(),
      });
    } else {
      openApproveModal();
    }
  };
  const openApproveModal = async () => {
    // 校验通过才打开对话框
    const jsonData = await frameRef.value.getData();
    formSecretLevel.value = jsonData.secretLevel
      ? Number(jsonData.secretLevel)
      : 0;
    currentFormJson.value = JSON.stringify(jsonData);
    visibleApprove.value = true;
  };
  const openRejectModal = () => {
    visibleReject.value = true;
  };
  const doLock = async () => {
    try {
      const { data } = await updateBpmTaskLocked(bpmTaskId.value);
      Message.success(data.message);
    } finally {
      loadTaskDetail();
    }
  };
  const doCancelTransfer = async () => {
    try {
      const { data } = await cancelBpmTaskRoam(bpmTaskId.value);
      Message.success(data.message);
      window.location.reload();
    } finally {
      // loadTaskDetail();
    }
  };
  const trackInst = async () => {
    try {
      const { data } = await trackBpmInst(bpmInst.value?.instId || '');
      tracked.value = data.data;
      Message.success(data.message);
    } finally {
      // loadTaskDetail();
    }
  };

  const lockTask = () => {
    const content = candicate.value === 1 ? '释放任务吗' : '锁定任务吗';
    Modal.info({
      title: '提示',
      content,
      hideCancel: false,
      onOk: () => doLock(),
    });
  };
  const cancelRoamTransfer = () => {
    Modal.info({
      title: '提示',
      content: '确认取消流转任务吗？',
      hideCancel: false,
      onOk: () => doCancelTransfer(),
    });
  };
  // 作废
  const visibleCancel = ref(false);
  const openCancel = () => {
    visibleCancel.value = true;
  };

  const frameRef = ref();

  const saveData = async () => {
    try {
      loadingSave.value = true;
      // 正确的返回值为{ success: true, msg: '' }
      const { success, msg } = await frameRef.value.valid();
      if (!success) {
        Message.error(msg);
      } else {
        const jsonData = await frameRef.value.getData();
        const formJson = JSON.stringify(jsonData);
        const { data } = await saveBpmTrackForm({
          formJson,
          taskId: bpmTaskId.value,
          systemHand: false,
        });
        Message.success(data.message);
        // 用保存后得到的实例id重新加载页面
        loadTaskDetail();
      }
    } finally {
      loadingSave.value = false;
    }
  };

  /**
   * @description 提交驳回信息。
   */
  const rejectData = async (cmd: BpmTaskFormCompleteReq) => {
    const jsonData = await frameRef.value.getData();
    const formJson = JSON.stringify(jsonData);
    try {
      const { data } = await completeTask({
        ...cmd,
        formJson,
        systemHand: false,
      });
      Message.success(data.message);
      if (bpmInst.value?.instId) {
        loadDetail(bpmInst.value?.instId);
      }
    } finally {
      visibleReject.value = false;
    }
  };

  const loadingApprove = ref(false);
  /**
   * @description 提交审批信息。
   */
  const approveData = async (cmd: BpmTaskFormCompleteReq) => {
    const jsonData = await frameRef.value.getData();
    const formJson = JSON.stringify(jsonData);
    cmd.formJson = formJson;
    try {
      loadingApprove.value = true;
      const { data } = await completeTask(cmd);
      Message.success(data.message);
      if (bpmInst.value?.instId) {
        loadDetail(bpmInst.value?.instId);
      }
    } finally {
      loadingApprove.value = false;
      visibleApprove.value = false;
    }
  };
  const close = () => {
    window.close();
  };

  const loadingBtn = ref(true);
  const handleLoad = () => {
    loadingBtn.value = false;
    setSecretLevel();
  };

  onMounted(() => {
    loadTaskDetail();
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
    height: calc(100vh - 240px); // 减去头部预估高度，使底部对齐
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
    flex: 1; // 自动填充剩余高度，实现与左侧持平
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
        padding: 0; // 内部 padding 由外部卡片统一控制
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
