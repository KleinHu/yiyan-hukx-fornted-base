<template>
  <div class="container">
    <div class="dashboard-content">
      <!-- 顶部问候语 -->
      <div class="greeting-section">
        <div class="greeting-info">
          <h2 class="greeting-title">{{ greetingText }}, {{ userName }} 👋</h2>
          <p class="greeting-subtitle">
            今天你有
            <span class="highlight">{{ flowCount }}</span> 个流程待办，
            <span class="highlight">{{ todoCount }}</span> 个任务待办
          </p>
        </div>
      </div>

      <!-- 统计看板 -->
      <div class="stats-row">
        <DataPanel />
      </div>

      <!-- 主内容区：左右结构 -->
      <div class="main-content">
        <!-- 左侧：工作台 (Tab 切换：流程待办 / 任务待办) -->
        <div class="work-area">
          <a-card :bordered="false" class="work-card">
            <template #title>
              <a-tabs
                v-model:active-key="workTab"
                type="rounded"
                size="medium"
                class="work-tabs"
              >
                <a-tab-pane key="flow">
                  <template #title>
                    <a-badge :count="flowCount" :offset="[10, -2]">
                      <span class="tab-label"> <icon-branch /> 流程待办 </span>
                    </a-badge>
                  </template>
                </a-tab-pane>
                <a-tab-pane key="todo">
                  <template #title>
                    <a-badge :count="todoCount" :offset="[10, -2]">
                      <span class="tab-label">
                        <icon-check-circle-fill /> 任务待办
                      </span>
                    </a-badge>
                  </template>
                </a-tab-pane>
              </a-tabs>
            </template>
            <!-- Tab 内容区 -->
            <div class="work-content">
              <MyTask v-show="workTab === 'flow'" ref="myTaskRef" />
              <TodoContent v-show="workTab === 'todo'" ref="todoRef" />
            </div>
          </a-card>

          <!-- 下方：业务看板专栏 -->
          <div class="business-section" style="margin-top: 16px">
            <BusinessDashboard />
          </div>
        </div>

        <!-- 右侧：部门新闻 & 快捷入口 -->
        <div class="news-area">
          <div class="news-section">
            <ArticleNews />
          </div>
          <div class="quick-section">
            <QuickAccess :exclude-names="['Workplace']" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useUserStore } from '@/store';
  import QuickAccess from '@/views/dashboard/workplace/components/quick-access.vue';
  import DataPanel from './components/data-panel.vue';
  import ArticleNews from './components/article-news.vue';
  import TodoContent from './components/todo-content.vue';
  import MyTask from './components/my-task.vue';
  import BusinessDashboard from './components/business-dashboard.vue';

  const userStore = useUserStore();

  // ========== 问候语 ==========
  const userName = computed(
    () => userStore.nickname || userStore.username || '用户'
  );
  const greetingText = computed(() => {
    const hour = new Date().getHours();
    if (hour < 6) return '夜深了';
    if (hour < 12) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  });

  // ========== 工作台 Tab 切换 ==========
  const workTab = ref('flow');
  const myTaskRef = ref<any>();
  const todoRef = ref<any>();

  // 从子组件获取待办数量（用于 Badge 展示）
  const flowCount = computed(() => myTaskRef.value?.pendingCount || 0);
  const todoCount = computed(() => todoRef.value?.todoCount || 0);

  // ========== 自动切换已关闭 ==========
  onMounted(() => {
    // 之前这里有 startAutoSwitch()
  });

  onUnmounted(() => {
    // 之前这里有 stopAutoSwitch()
  });
</script>

<script lang="ts">
  export default {
    name: 'Workplace',
  };
</script>

<style lang="less" scoped>
  .container {
    padding: 16px;
    background-color: #f7f9fb;
    min-height: 100vh;
  }

  .dashboard-content {
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ========== 问候语 ========== */
  .greeting-section {
    padding: 20px 24px;
    background: linear-gradient(135deg, #e8f3ff 0%, #f0ecff 100%);
    border-radius: 12px;
  }

  .greeting-title {
    font-size: 22px;
    font-weight: 700;
    color: var(--color-text-1);
    margin: 0 0 4px;
  }

  .greeting-subtitle {
    font-size: 14px;
    color: var(--color-text-3);
    margin: 0;

    .highlight {
      color: rgb(var(--arcoblue-6));
      font-weight: 600;
    }
  }

  /* ========== 主内容区：左右结构 ========== */
  .main-content {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .work-area {
    flex: 1;
    min-width: 0;
  }

  .news-area {
    width: 380px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ========== 工作台卡片 ========== */
  .work-card {
    height: 100%;

    :deep(.arco-card-header) {
      height: auto;
      min-height: 64px;
      padding: 0 20px !important;
      border-bottom: 0px solid var(--color-border-2);
      display: flex;
      align-items: center;
    }
  }

  .work-tabs {
    margin-top: 20px; // 强制下移
    :deep(.arco-tabs-nav-tab) {
      font-weight: 500;
    }
  }

  .tab-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    padding: 0 4px;
  }

  /* 隐藏内嵌子组件自带的卡片头部和外壳 */
  .work-content {
    min-height: 380px; // 统一高度
    display: flex;
    flex-direction: column;

    :deep(.arco-card-header) {
      display: none !important; // 核心：隐藏子组件自带的蓝色或其他标题
    }

    :deep(.arco-card-body) {
      padding: 0 !important;
      flex: 1;
    }

    :deep(.arco-card) {
      box-shadow: none !important;
      border-radius: 0 !important;
      background: transparent;
      height: 100%;
    }
  }

  /* ========== 全局卡片样式 ========== */
  :deep(.arco-card) {
    border: none;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }
  }

  /* ========== 响应式适配 ========== */
  @media (max-width: 1200px) {
    .main-content {
      flex-direction: column;
    }

    .news-area {
      width: 100%;
    }
  }
</style>
