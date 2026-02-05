<template>
  <a-form layout="inline" :model="form" class="sixs-search-form">
    <a-form-item label="分类名称">
      <a-input
        v-model="form.name"
        placeholder="请输入"
        allow-clear
        style="width: 160px"
      />
    </a-form-item>
    <a-form-item label="状态">
      <a-select
        v-model="form.status"
        placeholder="全部"
        allow-clear
        style="width: 120px"
      >
        <a-option :value="1">启用</a-option>
        <a-option :value="0">禁用</a-option>
      </a-select>
    </a-form-item>
    <a-form-item>
      <a-space>
        <a-button type="primary" @click="emit('search', getQuery())">
          <template #icon><icon-search /></template>
          查询
        </a-button>
        <a-button @click="handleReset">重置</a-button>
        <a-button type="primary" status="success" @click="emit('add')">
          <template #icon><icon-plus /></template>
          新增
        </a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';

  export interface CategorySearchQuery {
    name?: string;
    status?: number;
  }

  const emit = defineEmits<{
    (e: 'search', query: CategorySearchQuery): void;
    (e: 'reset'): void;
    (e: 'add'): void;
  }>();

  const form = reactive({
    name: '',
    status: undefined as number | undefined,
  });

  function getQuery(): CategorySearchQuery {
    return {
      name: form.name || undefined,
      status: form.status,
    };
  }

  function handleReset() {
    form.name = '';
    form.status = undefined;
    emit('reset');
  }
</script>

<style scoped lang="less">
  .sixs-search-form {
    margin-bottom: 16px;
  }
</style>
