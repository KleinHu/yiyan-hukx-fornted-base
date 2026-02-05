<template>
  <div
    class="account-card"
    :class="statusInfo.type"
    @click="$emit('click', item)"
  >
    <div class="card-content">
      <div class="card-top">
        <div class="user-profile">
          <div class="avatar-wrap" :style="{ backgroundColor: avatarBgColor }">
            {{ item.userName ? item.userName.charAt(0) : '?' }}
          </div>
          <div class="user-info">
            <div class="user-name">{{ item.userName }}</div>
            <div class="department">{{ item.departmentName }}</div>
          </div>
        </div>
        <div class="right-actions">
          <div class="score-text">
            {{ item.totalScore ?? 100 }}
          </div>
          <div class="action-icon">
            <icon-right />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { IconRight } from '@arco-design/web-vue/es/icon';
  import type { SixSAccount } from '@/api/sixs/model/sixsModel';

  const props = defineProps<{
    item: SixSAccount;
  }>();

  defineEmits(['click']);

  // 头像背景色 - 匹配 p2 中的浅蓝
  const avatarBgColor = computed(() => '#f0f4ff');

  const statusInfo = computed(() => {
    const score = props.item.totalScore || 0;
    if (score >= 100) {
      return { label: '优秀', type: 'excellent' };
    }
    if (score >= 85) {
      return { label: '警告', type: 'warning' };
    }
    return { label: '严重', type: 'serious' };
  });
</script>

<style scoped>
  .account-card {
    background: var(--color-bg-2);
    border-radius: 12px;
    padding: 12px 20px;
    border: 1px solid var(--color-border-2);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.34, 0.69, 0.1, 1);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.01);
  }

  /* 状态背景色 */
  .account-card.excellent {
    background-color: #e8ffea;
    border-color: #aff0b5;
  }
  .account-card.warning {
    background-color: #fff7e8;
    border-color: #ffe4ba;
  }
  .account-card.serious {
    background-color: #fff2f0;
    border-color: #ffd8d4;
  }

  .account-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.04);
  }
  .account-card.excellent:hover {
    border-color: #00b42a;
  }
  .account-card.warning:hover {
    border-color: #ff7d00;
  }
  .account-card.serious:hover {
    border-color: #f53f3f;
  }

  .card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .right-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .avatar-wrap {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 600;
    background-color: #ffffff !important;
    border: 2px solid #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  .excellent .avatar-wrap {
    color: #00b42a;
  }
  .warning .avatar-wrap {
    color: #ff7d00;
  }
  .serious .avatar-wrap {
    color: #f53f3f;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 1.5px;
  }

  .user-name {
    font-size: 16px;
    font-weight: 700;
    color: #1d2129;
  }

  .department {
    font-size: 12px;
    color: #4e5969;
  }

  .score-text {
    font-size: 26px;
    font-weight: 700;
    font-family: 'Inter', -apple-system, system-ui;
    color: #1d2129;
  }

  .action-icon {
    font-size: 14px;
    color: #86909c;
    margin-left: 4px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
  }

  .account-card:hover .action-icon {
    transform: translateX(3px);
  }
  .account-card.excellent:hover .action-icon {
    color: #00b42a;
  }
  .account-card.warning:hover .action-icon {
    color: #ff7d00;
  }
  .account-card.serious:hover .action-icon {
    color: #f53f3f;
  }
</style>
