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
        <!-- 新增右侧值班提醒 -->
        <div v-if="myDutyInfo" class="duty-reminder-card" @click="goToCalendar">
          <div class="reminder-content">
            <!-- 今日提醒 -->
            <div v-if="myDutyInfo.todayDuty" class="duty-tag today">
              <icon-notification class="tag-icon pulse-red" />
              <span class="tag-text">今天值班</span>
            </div>
            <!-- 未来提醒 -->
            <div v-if="myDutyInfo.nextDutyDays" class="duty-tag future">
              <icon-calendar class="tag-icon" />
              <span class="tag-text">
                <span class="days">{{ myDutyInfo.nextDutyDays }}</span>
                天后需要值班
              </span>
            </div>
          </div>
          <icon-right class="arrow-icon" />
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

        <!-- 右侧：专题看板 & 部门新闻 & 快捷入口 -->
        <div class="news-area">
          <div class="duty-section">
            <DutyCard />
          </div>
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
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/store';
  import useDutySchedule from '@/hooks/oa/duty/useDutySchedule';
  import QuickAccess from '@/views/dashboard/workplace/components/quick-access.vue';
  import DataPanel from './components/data-panel.vue';
  import ArticleNews from './components/article-news.vue';
  import TodoContent from './components/todo-content.vue';
  import MyTask from './components/my-task.vue';
  import BusinessDashboard from './components/business-dashboard.vue';
  import DutyCard from './components/DutyCard.vue';

  const router = useRouter();
  const userStore = useUserStore();

  // ========== 值班提醒逻辑 ==========
  const { getMyLatestDuty } = useDutySchedule();
  const myDutyInfo = ref<any>(null);

  const fetchMyDuty = async () => {
    myDutyInfo.value = await getMyLatestDuty();
  };

  const goToCalendar = () => {
    router.push({ name: 'DutyCalendar' });
  };

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
    fetchMyDuty();
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
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .duty-reminder-card {
    background: rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    padding: 8px 16px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 4px 12px rgba(31, 38, 135, 0.05);

    &:hover {
      transform: scale(1.02);
      background: rgba(255, 255, 255, 0.6);
      box-shadow: 0 8px 24px rgba(31, 38, 135, 0.1);
    }

    .reminder-content {
      display: flex;
      align-items: center;
      gap: 12px;

      .duty-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 0 12px;
        height: 32px; // 强制高度一致
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        line-height: 1;

        &.today {
          background: #fff1f0;
          color: #ff4d4f;
          border: 1px solid rgba(255, 77, 79, 0.2);
        }

        &.future {
          background: #e6f7ff;
          color: #1677ff;
          border: 1px solid rgba(22, 119, 255, 0.2);
        }

        .tag-icon {
          font-size: 16px;
        }

        .days {
          font-size: 18px;
          margin: 0 2px;
        }
      }
    }

    .arrow-icon {
      color: var(--color-text-4);
      font-size: 14px;
    }
  }

  .pulse-red {
    animation: pulse-red 2s infinite;
  }

  @keyframes pulse-red {
    0% {
      box-shadow: 0 0 0 0 rgba(255, 77, 79, 0.4);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(255, 77, 79, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(255, 77, 79, 0);
    }
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
