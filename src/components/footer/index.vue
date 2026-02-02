<template>
  <a-layout-footer class="footer">{{ projectName }}</a-layout-footer>
</template>

<script lang="ts" setup>
  import { projectName } from '@/config/settings.json';
</script>

<style lang="less" scoped>
  .footer {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    color: var(--color-text-4);
    text-align: center;
  }
</style>
