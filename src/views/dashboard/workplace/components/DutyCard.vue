<template>
  <a-card class="duty-card" :bordered="false">
    <div class="card-header">
      <div class="header-left">
        <div class="icon-box">
          <icon-calendar />
        </div>
        <div class="title-info">
          <div class="main-title">{{ displayTitle }}</div>
          <div class="sub-title">今日值班概览</div>
        </div>
      </div>
      <a-tag color="blue" bordered size="small">{{ todayStr }}</a-tag>
    </div>

    <div class="card-body">
      <a-spin :loading="loading" style="width: 100%">
        <!-- 有值班数据 -->
        <div v-if="dutyUsers.length > 0" class="duty-users">
          <div v-for="user in dutyUsers" :key="user.userCode" class="user-item">
            <a-avatar :size="32" style="background-color: #165dff">
              {{ user.userName.charAt(0) }}
            </a-avatar>
            <div class="user-detail">
              <span class="user-name">{{ user.userName }}</span>
              <span class="user-dept">{{ user.userCode }}</span>
            </div>
          </div>
        </div>

        <!-- 暂无值班 -->
        <a-empty v-else-if="!loading" description="今日暂无排班记录" />
      </a-spin>
    </div>
  </a-card>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import dayjs from 'dayjs';
  import { getDutyScheduleList, getDutyGroupTree } from '@/api/oa/duty';

  /** ========================================================
   *  后期修改配置位置：
   *  如果您想更换展示的分组，只需修改下面的 targetGroupName 即可
   *  ======================================================== */
  const CONFIG = {
    targetGroupName: '干部专家值班', // 后期修改这里来定位指定分组
  };

  const loading = ref(false);
  const dutyUsers = ref<any[]>([]);
  const todayStr = ref(dayjs().format('YYYY年MM月DD日'));
  const currentGroup = ref<string>('');

  const displayTitle = computed(
    () => currentGroup.value || CONFIG.targetGroupName
  );

  // 递归查找指定名称的分组 ID（改用符合规范的递归方式）
  const findGroupIdByName = (tree: any[], name: string): string | null => {
    let result: string | null = null;
    tree.some((node) => {
      if (node.name === name) {
        result = node.id;
        return true;
      }
      if (node.children) {
        const id = findGroupIdByName(node.children, name);
        if (id) {
          result = id;
          return true;
        }
      }
      return false;
    });
    return result;
  };

  const fetchTodayDuty = async () => {
    loading.value = true;
    try {
      const today = dayjs().format('YYYY-MM-DD');

      // 1. 获取分组树并找到目标 ID
      const treeRes: any = await getDutyGroupTree();
      let targetId = '';
      if (treeRes.success && treeRes.data) {
        targetId =
          findGroupIdByName(treeRes.data, CONFIG.targetGroupName) || '';
      }

      if (!targetId) return;

      // 2. 获取该分组今日排班
      const res: any = await getDutyScheduleList({
        startDate: today,
        endDate: today,
        groupId: targetId,
      });

      if (res.success && res.data) {
        dutyUsers.value = res.data;
        currentGroup.value = CONFIG.targetGroupName;
      }
    } catch (error) {
      // 捕获异常但不直接打印，符合生产环境规范
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchTodayDuty();
  });
</script>

<style scoped lang="less">
  .duty-card {
    height: 100%;
    background: linear-gradient(135deg, #ffffff 0%, #f7f9ff 100%);
    border-radius: 12px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;

      .header-left {
        display: flex;
        gap: 12px;

        .icon-box {
          width: 40px;
          height: 40px;
          background-color: #e8f3ff;
          color: #165dff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .title-info {
          .main-title {
            font-size: 16px;
            font-weight: 700;
            color: #1d2129;
            line-height: 1.2;
          }
          .sub-title {
            font-size: 12px;
            color: #86909c;
            margin-top: 4px;
          }
        }
      }
    }

    .card-body {
      .duty-users {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;

        .user-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          background: #fff;
          border: 1px solid #f2f3f5;
          border-radius: 8px;
          min-width: 0; // 防止内容溢出

          .user-detail {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            .user-name {
              font-size: 14px;
              font-weight: 600;
              color: #1d2129;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .user-dept {
              font-size: 11px;
              color: #86909c;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }
    }
  }
</style>
