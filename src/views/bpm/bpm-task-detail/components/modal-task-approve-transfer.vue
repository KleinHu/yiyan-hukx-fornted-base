<!--组件：任务审批（已流转）-->
<template>
  <div>
    <a-modal v-model:visible="visible" title="任务审批-"> </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  defineProps({
    taskId: { type: String, required: true },
  });

  const visible = ref(false);
</script>
