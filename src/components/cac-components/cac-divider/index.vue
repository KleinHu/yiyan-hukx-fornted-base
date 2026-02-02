<!-- 分割线组件 -->
<!--created by ljx | 2023/08/08-->
<template>
  <div class="divider" :style="{ backgroundColor: backgroundColor }">
    <span class="prefix" :style="{ backgroundColor: prefixColor }" />
    <span class="title">{{ title }}</span>
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
  // 相关属性
  defineProps({
    title: { type: String, default: '抽屉' }, // 分割线标题
    prefixColor: { type: String, default: '#165dff' }, // 分割线头部颜色
    backgroundColor: { type: String, default: '#eaedf4' }, // 分割线头背景颜色
  });
</script>

<style lang="less" scoped>
  .divider {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    height: 36px;
    background-color: #eaedf4;
    border: 1px solid #eee;
    border-radius: 4px;
    // margin: 5px 0 12px 0;
  }

  .prefix {
    width: 5px;
    height: 100%;
    margin-right: 10px;
    background-color: #165dff;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }

  .title {
    margin-right: 15px;
    font-weight: bold;
  }
</style>
