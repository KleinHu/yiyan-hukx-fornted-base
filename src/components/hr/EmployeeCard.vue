<template>
  <div :class="['employee-card-v2', { checked: checked }]" @click="handleClick">
    <div class="card-body">
      <div class="avatar-box">
        <a-avatar :size="36" :style="{ backgroundColor: avatarBgColor }">
          <img
            v-if="employee.avatarUrl"
            :src="employee.avatarUrl"
            alt="avatar"
          />
          <span v-else>{{ displayInitial }}</span>
        </a-avatar>
      </div>
      <div class="info-box">
        <div class="name-row">
          <span class="name">{{ employee.userName }}</span>
          <span class="divider">|</span>
          <span
            class="title"
            :title="employee.jobTitle || employee.departmentName"
          >
            {{ employee.jobTitle || employee.departmentName || '职员' }}
          </span>
        </div>
      </div>
      <div class="check-box">
        <div class="inner-check">
          <icon-check v-if="checked" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { Employee } from '@/api/hr/types';
  import { IconCheck } from '@arco-design/web-vue/es/icon';

  const props = defineProps<{
    employee: Employee;
    checked: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'select', employee: Employee): void;
  }>();

  // 获取姓名最后一个字作为头像文本
  const displayInitial = computed(() => {
    const name = props.employee.userName || '';
    return name.length > 0 ? name.charAt(name.length - 1) : '?';
  });

  // 软萌配色方案
  const avatarBgColor = computed(() => {
    if (props.employee.gender === 2) return '#f53f3f'; // 红色系
    if (props.employee.gender === 1) return '#165dff'; // 蓝色系
    return '#86909c'; // 灰系
  });

  const handleClick = () => {
    emit('select', props.employee);
  };
</script>

<style scoped lang="less">
  .employee-card-v2 {
    width: 100%;
    height: 64px;
    background: #ffffff;
    border: 1px solid #e5e6eb;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    user-select: none;

    &:hover {
      border-color: #165dff;
      background-color: rgba(22, 93, 255, 0.02);
    }

    &.checked {
      border-color: #165dff;
      background-color: rgba(22, 93, 255, 0.05);

      .check-box .inner-check {
        background-color: #165dff;
        border-color: #165dff;
        color: #fff;
      }
    }

    .card-body {
      display: flex;
      align-items: center;
      padding: 0 12px;
      height: 100%;
    }

    .avatar-box {
      flex-shrink: 0;
      margin-right: 12px;
    }

    .info-box {
      flex: 1;
      min-width: 0;
      margin-right: 8px;

      .name-row {
        display: flex;
        align-items: center;
        white-space: nowrap;
        overflow: hidden;

        .name {
          font-size: 14px;
          font-weight: 500;
          color: #1d2129;
          flex-shrink: 0;
        }

        .divider {
          margin: 0 6px;
          color: #e5e6eb;
          font-size: 12px;
        }

        .title {
          font-size: 12px;
          color: #86909c;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .check-box {
      flex-shrink: 0;
      .inner-check {
        width: 18px;
        height: 18px;
        border: 1px solid #e5e6eb;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: transparent;
        transition: all 0.2s;
      }
    }
  }
</style>
