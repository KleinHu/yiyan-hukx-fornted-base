<template>
  <div class="container">
    <div class="dashboard-content">
      <div class="stats-row">
        <DataPanel />
      </div>
      <a-grid :cols="24" :col-gap="20" :row-gap="20" class="main-row">
        <a-grid-item :span="{ xs: 24, sm: 24, md: 24, lg: 7, xl: 7, xxl: 7 }">
          <TodoContent />
        </a-grid-item>
        <a-grid-item
          :span="{ xs: 24, sm: 24, md: 24, lg: 10, xl: 10, xxl: 10 }"
        >
          <MyTask />
        </a-grid-item>

        <a-grid-item :span="{ xs: 24, sm: 24, md: 24, lg: 7, xl: 7, xxl: 7 }">
          <QuicklAccess :exclude-names="['Workplace']" />
        </a-grid-item>
      </a-grid>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import QuicklAccess from '@/views/dashboard/workplace/components/quick-access.vue';
  import DataPanel from './components/data-panel.vue';
  import TodoContent from './components/todo-content.vue';
  import MyTask from './components/my-task.vue';
</script>

<script lang="ts">
  export default {
    name: 'Dashboard',
  };
</script>

<style lang="less" scoped>
  .container {
    padding: 20px;
    background-color: #f7f9fb;
    min-height: 100vh;
  }

  .dashboard-content {
    width: 100%;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .main-row {
    align-items: stretch;
  }

  :deep(.arco-card) {
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }
  }
</style>
