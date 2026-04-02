<template>
  <a-tag :color="statusConfig.color">
    <template #icon>
      <component :is="statusConfig.icon" />
    </template>
    {{ statusConfig.text }}
  </a-tag>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import {
    IconFile,
    IconClockCircle,
    IconCheckCircle,
    IconCloseCircle,
    IconMinusCircle,
    IconThunderbolt,
    IconSchedule,
  } from '@arco-design/web-vue/es/icon';

  const props = defineProps<{
    status: number | undefined;
  }>();

  const statusConfig = computed(() => {
    switch (props.status) {
      case 0:
        return { text: '草稿', color: 'gray', icon: IconFile };
      case 1:
        return { text: '待审核', color: 'orange', icon: IconClockCircle };
      case 2:
        return { text: '已发布', color: 'green', icon: IconCheckCircle };
      case 3:
        return { text: '已驳回', color: 'red', icon: IconCloseCircle };
      case 4:
        return { text: '已下线', color: 'gray', icon: IconMinusCircle };
      case 5:
        return { text: '下线确认中', color: 'cyan', icon: IconThunderbolt };
      case 6:
        return { text: '定时发布', color: 'arcoblue', icon: IconSchedule };
      default:
        return { text: '未知', color: 'gray', icon: IconMinusCircle };
    }
  });
</script>
