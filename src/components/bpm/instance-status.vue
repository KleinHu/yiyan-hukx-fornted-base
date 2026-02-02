<!--组件：流程实例状态，展示在流程明细和流程办理页面表单上方-->
<template>
  <div class="img-pad">
    <div class="status-img" :class="['status-' + kebabStatus]"></div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps({
    status: { type: String, default: '' },
  });
  const kebabStatus = computed(() => {
    const suffic = '_END';
    if (props.status.endsWith(suffic)) {
      const baseStatus = props.status.slice(0, -suffic.length);
      return `${baseStatus.replace(/_/g, '-').toLowerCase()}`;
    }
    return props.status.toLowerCase();
  });
</script>

<style scoped>
  .img-pad {
    padding-top: 8px;
    padding-right: 12px;
  }

  .status-img {
    width: 120px;
    height: 107px;
  }

  .status-running {
    background: url('@/assets/images/bpm/processStatus.png') no-repeat scroll -240px
      0;
  }

  .status-drafted {
    background: url('@/assets/images/bpm/processStatus.png') no-repeat scroll -120px
      0;
  }

  .status-success-end {
    background: url('@/assets/images/bpm/processStatus.png') no-repeat scroll 0
      0;
  }

  .status-cancel {
    background: url('@/assets/images/bpm/processStatus.png') no-repeat scroll -120px -110px;
  }

  .status-delete {
    background: url('@/assets/images/bpm/processStatus.png') no-repeat scroll -240px -220px;
  }

  .status-abort-end,
  .status-error-end {
    background: url('@/assets/images/bpm/processStatus.png') no-repeat scroll -240px -110px;
  }

  .status-submit {
    background: url('@/assets/images/bpm/processStatus.png') no-repeat scroll -120px -220px;
  }

  .status-locked {
    background: url('@/assets/images/bpm/processStatus.png') no-repeat scroll 0 -220px;
  }

  .status-supspend {
    background: url('@/assets/images/bpm/processStatus.png') no-repeat scroll 0 -110px;
  }

  .status-pending {
    background: url('@/assets/images/bpm/processStatus.png') no-repeat scroll 0 -330px;
  }
</style>
