<script setup lang="ts">
  import { ref, onMounted, reactive, nextTick } from 'vue';
  import { PageAgentCore } from '@page-agent/core';
  import { PageController } from '@page-agent/page-controller';
  import { Message } from '@arco-design/web-vue';
  import {
    IconRobot,
    IconUpload,
    IconFile,
    IconSend,
    IconClose,
  } from '@arco-design/web-vue/es/icon';
  import * as XLSX from 'xlsx';

  const visible = ref(false);
  const agent = ref<PageAgentCore | null>(null);
  const logList = ref<any[]>([]);
  const userPrompts = ref<any[]>([]);
  const status = ref<'idle' | 'running' | 'completed' | 'error'>('idle');
  const activity = reactive({
    thought: '',
    actionName: '',
    status: 'idle',
  });

  const userInput = ref('');
  const excelData = ref<any[]>([]);
  const fileName = ref('');
  const logContainer = ref<HTMLElement | null>(null);

  // 初始化 Agent
  const initAgent = () => {
    try {
      const pageController = new PageController({ enableMask: true });
      const agentCore = new PageAgentCore({
        pageController,
        model: 'qwen3.5-plus', // 官方推荐模型，例如 'gpt-4o', 'qwen-plus' 等
        apiKey: 'sk-sp-f09efd68400b43b28bebfbdb55921b7f', // 在此处填入您的 API Key
        baseURL: '/dashscope-api/v1', // 使用本地代理路径规避跨域限制
        language: 'zh-CN',
      });
      agent.value = agentCore;

      // 监听历史记录变化
      agentCore.addEventListener('historychange', () => {
        // 合并用户原始指令和 AI 的执行步进
        logList.value = [...userPrompts.value, ...(agentCore.history || [])];
        scrollToBottom();
      });

      // 监听实时活动
      agentCore.addEventListener('activity', (event: any) => {
        const data = event.detail;
        if (data) {
          activity.status = data.type;
          activity.thought = data.message || data.thought || '';
          activity.actionName = data.tool || data.actionName || '';
        }
      });

      // 监听状态改变
      agentCore.addEventListener('statuschange', () => {
        status.value = agentCore.status;
      });
    } catch (err) {
      Message.error(`助手初始化失败: ${err}`);
    }
  };

  // 处理文件上传并解析 Excel
  const handleUpload = (fileItemList: any[]) => {
    const file = fileItemList[0]?.file;
    if (!file) return;
    fileName.value = file.name;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      excelData.value = json;
      Message.success(`Excel 辅助数据载入成功，共 ${json.length} 条数据`);
    };
    reader.readAsArrayBuffer(file);
  };

  // 清除 Excel 数据
  const clearExcel = () => {
    excelData.value = [];
    fileName.value = '';
  };

  // 执行任务（通用入口）
  const handleSend = async () => {
    if (!agent.value || status.value === 'running') return;

    let finalCommand = userInput.value.trim();

    // 如果有 Excel 数据，且用户没有输入指令，或者指令需要配合 Excel
    if (excelData.value.length > 0) {
      const excelContext = `检测到已上传 Excel 数据（JSON 格式）: ${JSON.stringify(
        excelData.value
      )}。`;
      if (!finalCommand) {
        finalCommand = `${excelContext} 请根据这些数据，自动填充页面上的表单。每填完一组数据，请点击提交或保存按钮，然后继续下一组。`;
      } else {
        finalCommand = `${excelContext} 请结合这些数据执行以下指令: ${finalCommand}`;
      }
    }

    if (!finalCommand) {
      Message.warning('请输入指令或上传 Excel 文件');
      return;
    }

    try {
      // 记录用户原始 Prompt 用于展示
      userPrompts.value.push({
        type: 'prompt',
        content: userInput.value || '执行 Excel 自动化填单',
        timestamp: Date.now(),
      });

      const currentTask = finalCommand;
      userInput.value = ''; // 清空输入
      // 手动触发一次日志同步
      logList.value = [...userPrompts.value, ...(agent.value?.history || [])];
      scrollToBottom();

      await agent.value.execute(currentTask);
    } catch (err) {
      Message.error(`执行出错: ${err}`);
    }
  };

  const scrollToBottom = () => {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight;
      }
    });
  };

  onMounted(() => {
    initAgent();
  });
</script>

<template>
  <!-- 悬浮触控按钮 -->
  <transition name="btn-fade">
    <div v-show="!visible" class="agent-trigger" @click="visible = true">
      <div class="pulse-ring"></div>
      <icon-send class="fly-icon" />
      <span class="label">智能助手</span>
    </div>
  </transition>

  <!-- 悬浮聊天面板 -->
  <transition name="panel-fade">
    <div v-show="visible" class="floating-chat-panel">
      <!-- 自定义头部 -->
      <div class="panel-header">
        <div class="title-wrap">
          <icon-robot class="header-icon" />
          <span class="title-text">智能全能助手</span>
        </div>
        <icon-close class="close-icon" @click="visible = false" />
      </div>
      <div class="agent-panel-content">
        <!-- 状态指示 & Excel 辅助提示 -->
        <div class="header-tools">
          <div class="status-header" :class="status">
            <div class="status-dot"></div>
            <span>
              {{
                status === 'idle'
                  ? '助手就绪'
                  : status === 'running'
                  ? '正在操作页面...'
                  : '任务已完成'
              }}
            </span>
          </div>

          <!-- Excel 辅助模式标识 -->
          <div
            v-if="excelData.length > 0"
            class="excel-badge"
            @click="clearExcel"
          >
            <icon-file />
            <span>已挂载 Excel ({{ excelData.length }}条)</span>
            <span class="close-x">×</span>
          </div>
        </div>

        <!-- 执行日志记录 (对话流展示) -->
        <div ref="logContainer" class="log-section">
          <div class="log-list">
            <div v-if="logList.length === 0" class="welcome-msg">
              <icon-robot :style="{ fontSize: '32px', marginBottom: '12px' }" />
              <div class="title">您好！我是集成在 OA 中的智能助手</div>
              <div class="desc">
                您可以直接对我下达指令，例如：<br />
                • “帮我跳转到工作流设置页面”<br />
                • “提取当前表格中的所有用户名”<br />
                • “上传 Excel 辅助我大批量填单”
              </div>
            </div>

            <div
              v-for="(log, index) in logList"
              :key="index"
              class="log-item"
              :class="log.type"
            >
              <!-- 用户发送的消息 -->
              <div v-if="log.type === 'prompt'" class="user-msg">
                <div class="msg-body">{{ log.content }}</div>
              </div>

              <!-- AI 思考过程 -->
              <div v-else-if="log.type === 'step'" class="ai-msg">
                <div class="msg-header">AI 思考</div>
                <div class="msg-body">
                  {{ log.reflection?.next_goal || log.thought }}
                </div>
              </div>

              <!-- 系统观察/操作反馈 -->
              <div v-else-if="log.type === 'observation'" class="sys-msg">
                <div class="msg-body">{{ log.content }}</div>
              </div>

              <!-- 错误信息 -->
              <div v-else-if="log.type === 'error'" class="error-msg">
                <div class="msg-body">{{ log.message }}</div>
              </div>
            </div>

            <!-- 实时活动展示 -->
            <div v-if="status === 'running'" class="current-activity">
              <div class="thinking-loading">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
              </div>
              <div class="activity-text">
                {{
                  activity.actionName
                    ? '正在执行: ' + activity.actionName
                    : '正在规划下一步...'
                }}
              </div>
            </div>
          </div>
        </div>

        <!-- 底部交互区 -->
        <div class="footer-interaction">
          <!-- Excel 上传（可选） -->
          <div class="action-bar">
            <a-upload
              :auto-upload="false"
              :show-file-list="false"
              accept=".xlsx,.xls,.csv"
              @change="handleUpload"
            >
              <template #upload-button>
                <a-button size="mini" type="text" class="excel-upload-btn">
                  <template #icon><icon-upload /></template>
                  上传 Excel 辅助
                </a-button>
              </template>
            </a-upload>
          </div>

          <!-- 对话输入框 -->
          <div class="input-wrapper">
            <a-textarea
              v-model="userInput"
              placeholder="请输入您的指令..."
              :auto-size="{ minRows: 1, maxRows: 4 }"
              :disabled="status === 'running'"
              @press-enter="handleSend"
            />
            <a-button
              type="primary"
              class="send-btn"
              :loading="status === 'running'"
              @click="handleSend"
            >
              <template #icon><icon-send /></template>
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped lang="less">
  /* 悬浮聊天面板 */
  .floating-chat-panel {
    position: fixed;
    right: 40px;
    bottom: 120px;
    width: 380px;
    height: 600px;
    max-height: calc(100vh - 160px);
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid #e5e6eb;
    transform-origin: bottom right;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: #fdfdfd;
      border-bottom: 1px solid #f2f3f5;
      flex-shrink: 0;

      .title-wrap {
        display: flex;
        align-items: center;
        gap: 8px;

        .header-icon {
          color: #165dff;
          font-size: 18px;
        }

        .title-text {
          font-size: 16px;
          font-weight: 600;
          color: #1d2129;
        }
      }

      .close-icon {
        font-size: 18px;
        color: #86909c;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: #1d2129;
        }
      }
    }
  }

  .panel-fade-enter-active,
  .panel-fade-leave-active {
    transition: all 0.4s cubic-bezier(0.25, 1, 0.3, 1);
  }

  .panel-fade-enter-from,
  .panel-fade-leave-to {
    opacity: 0;
    transform: scale(0.85) translateY(40px);
  }

  .btn-fade-enter-active,
  .btn-fade-leave-active {
    transition: all 0.4s cubic-bezier(0.25, 1, 0.3, 1);
  }

  .btn-fade-enter-from,
  .btn-fade-leave-to {
    opacity: 0;
    transform: scale(0.4) translateY(20px);
  }

  .agent-trigger {
    position: fixed;
    right: 40px;
    bottom: 40px;
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #4080ff 0%, #165dff 100%);
    border-radius: 50%;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(22, 93, 255, 0.35);
    z-index: 1000;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:hover {
      transform: translateY(-4px) scale(1.05);
      box-shadow: 0 12px 32px rgba(22, 93, 255, 0.45);

      .fly-icon {
        transform: translate(2px, -3px) rotate(10deg) scale(1.1);
      }
    }

    .fly-icon {
      font-size: 26px;
      transition: all 0.3s ease;
      margin-bottom: 2px;
      margin-top: 2px;
    }

    .label {
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .pulse-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 2px solid rgba(22, 93, 255, 0.6);
      animation: pulse 2.5s cubic-bezier(0.25, 0.8, 0.25, 1) infinite;
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      opacity: 0.8;
    }

    100% {
      transform: scale(1.6);
      opacity: 0;
    }
  }

  .agent-panel-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    padding: 16px 20px;
    background: #fff;
  }

  .header-tools {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid #f2f3f5;
    margin-bottom: 12px;

    .status-header {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: #86909c;

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #c9cdd4;
      }

      &.running {
        color: #165dff;

        .status-dot {
          background: #165dff;
          box-shadow: 0 0 6px #165dff;
        }
      }
    }

    .excel-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      background: #eaffea;
      color: #00b42a;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      border: 1px solid #00b42a33;

      &:hover {
        background: #ffece8;
        color: #f53f3f;
        border-color: #f53f3f33;
      }

      .close-x {
        margin-left: 4px;
        font-weight: bold;
      }
    }
  }

  .log-section {
    flex: 1;
    overflow-y: auto;
    padding: 0 12px 20px 0;
    margin-bottom: 8px;

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 5px;
    }
    &::-webkit-scrollbar-thumb {
      background: #e5e6eb;
      border-radius: 10px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: #c9cdd4;
    }

    .welcome-msg {
      text-align: center;
      padding: 40px 20px;
      color: #86909c;

      .title {
        font-size: 16px;
        font-weight: 600;
        color: #1d2129;
        margin-bottom: 8px;
      }
      .desc {
        font-size: 13px;
        line-height: 1.8;
        text-align: left;
        background: #f8f9fa;
        padding: 12px;
        border-radius: 8px;
      }
    }

    .log-list {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .user-msg {
        align-self: flex-end;
        max-width: 85%;
        .msg-body {
          background: #165dff;
          color: #fff;
          padding: 10px 14px;
          border-radius: 12px 2px 12px 12px;
          font-size: 13px;
          line-height: 1.5;
        }
      }

      .ai-msg {
        align-self: flex-start;
        max-width: 90%;
        .msg-header {
          font-size: 10px;
          color: #86909c;
          margin-bottom: 4px;
        }
        .msg-body {
          background: #f2f3f5;
          padding: 10px 14px;
          border-radius: 2px 12px 12px 12px;
          font-size: 13px;
          color: #1d2129;
          line-height: 1.5;
        }
      }

      .sys-msg {
        align-self: center;
        .msg-body {
          background: #fdfdfd;
          border: 1px solid #f2f3f5;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          color: #4e5969;
        }
      }

      .error-msg {
        .msg-body {
          color: #f53f3f;
          background: #fff1f0;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
        }
      }
    }
  }

  .current-activity {
    margin-top: 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f0f7ff;
    border-radius: 8px;

    .thinking-loading {
      display: flex;
      gap: 4px;
      .dot {
        width: 4px;
        height: 4px;
        background: #165dff;
        border-radius: 50%;
        animation: loading-dot 1.4s infinite;
        &:nth-child(2) {
          animation-delay: 0.2s;
        }
        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
    }
    .activity-text {
      font-size: 12px;
      color: #165dff;
    }
  }

  @keyframes loading-dot {
    0%,
    80%,
    100% {
      transform: scale(0);
    }
    40% {
      transform: scale(1);
    }
  }

  .footer-interaction {
    padding-top: 16px;
    border-top: 1px solid #f2f3f5;

    .action-bar {
      margin-bottom: 8px;
    }

    .excel-upload-btn {
      color: #86909c;
      font-size: 12px;
      &:hover {
        color: #165dff;
      }
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: flex-end;
      gap: 10px;

      :deep(.arco-textarea) {
        border-radius: 8px;
        background: #f4f6f8;
        border: none;
        padding-right: 50px;
        &:focus {
          background: #fff;
          box-shadow: 0 0 0 2px #165dff33;
        }
      }

      .send-btn {
        height: 32px;
        width: 32px;
        padding: 0;
        border-radius: 8px;
        flex-shrink: 0;
        margin-bottom: 2px;
      }
    }
  }
</style>
