<template>
  <div class="bpm-detail-header">
    <div class="header-top">
      <div class="header-left">
        <div class="bill-info">
          <a-tag color="arcoblue" size="small">{{ instance?.billNo }}</a-tag>
          <a-tag v-if="task?.priority === '紧急'" color="red" size="small">
            <template #icon><icon-exclamation-circle-fill /></template>
            紧急
          </a-tag>
        </div>
        <h1 class="header-title">{{ instance?.subject }}</h1>
      </div>
      <div class="header-right">
        <div class="status-stamp">
          <InstanceStatus :status="instance?.status || ''" />
        </div>
      </div>
    </div>
    <div class="header-info-grid">
      <div class="info-item">
        <div class="info-label">申请部门</div>
        <div class="info-value">
          <icon-home class="info-icon" />
          {{ instance?.startDepFull || '---' }}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">申请人</div>
        <div class="info-value">
          <icon-user class="info-icon" />
          {{ instance?.applicantName || '---' }}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">申请日期</div>
        <div class="info-value">
          <icon-calendar class="info-icon" />
          {{ instance?.createTime || '---' }}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">当前节点</div>
        <div class="info-value">
          <span class="node-dot"></span>
          <span class="node-name">{{ task?.name || '已结束' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { PropType } from 'vue';
  import { BpmInstRecord } from '@/api/bpm/model/bpmInstanceModel';
  import { BpmTaskRecord } from '@/api/bpm/model/bpmTaskModel';
  import InstanceStatus from '@/components/bpm/instance-status.vue';

  defineProps({
    instance: {
      type: Object as PropType<BpmInstRecord>,
    },
    task: {
      type: Object as PropType<BpmTaskRecord>,
    },
  });
</script>

<style scoped lang="less">
  .bpm-detail-header {
    background: #fff;
    padding: 24px 32px;
    border-radius: 15px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    position: relative;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .bill-info {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .header-title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--color-text-1);
  }

  .header-right {
    position: relative;
  }

  .status-stamp {
    position: absolute;
    top: -20px;
    right: 0;
    transform: scale(0.8);
    opacity: 0.8;
  }

  .header-info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  .info-item {
    .info-label {
      font-size: 13px;
      color: var(--color-text-3);
      margin-bottom: 4px;
    }
    .info-value {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: var(--color-text-1);

      .info-icon {
        margin-right: 6px;
        color: var(--color-text-4);
        font-size: 16px;
      }
    }
  }

  .node-dot {
    width: 8px;
    height: 8px;
    background: #165dff;
    border-radius: 50%;
    margin-right: 8px;
  }

  .node-name {
    color: #165dff;
    font-weight: 500;
  }
</style>
