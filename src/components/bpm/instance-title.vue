<!--组件：流程实例简要信息，展示在流程明细和流程办理页面表单上方-->
<template>
  <div class="flow-header-titles">
    <div class="left-title">
      <span
        >本事项<b>{{ instance?.subject }}</b></span
      >
    </div>
    <div class="right-title">
      <span
        >单号: <b>{{ instance?.billNo }}</b></span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
  import { BpmInstRecord } from '@/api/bpm/model/bpmInstanceModel';
  import { PropType } from 'vue';

  defineProps({
    instance: { type: Object as PropType<BpmInstRecord> },
  });
</script>

<style scoped>
  .flow-header-titles {
    display: flex;
    padding: 10px;
  }

  .left-title {
    flex: 1;
    padding: 1%;
  }

  .left-title span {
    display: inline-block;
    margin-right: 10px;
    font-size: 17px;
  }

  .right-title {
    margin-right: 150px;
    padding: 1%;
    font-size: 17px;
  }
</style>
