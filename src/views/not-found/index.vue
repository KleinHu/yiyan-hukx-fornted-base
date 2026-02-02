<template>
  <div class="content">
    <a-result class="result" status="404" :subtitle="'not found'"> </a-result>
    <div class="operation-row">
      <a-button key="back" type="primary" @click="back"> back </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import { useAppStore } from '@/store';

  const router = useRouter();
  const appStore = useAppStore();
  const back = () => {
    if (appStore.menuPattern !== 1) {
      router.push({ name: 'Workplace' });
    } else {
      router.push({ name: 'rootMenu' });
    }
    // warning： Go to the node that has the permission
  };
</script>

<style scoped lang="less">
  .content {
    // padding-top: 100px;
    position: absolute;
    top: 50%;
    left: 50%;
    margin-top: -121px;
    margin-left: -95px;
    text-align: center;
  }
</style>
