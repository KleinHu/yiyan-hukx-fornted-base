<template>
  <div class="container">
    <a-card :bordered="false" class="general-card">
      <template #title>6S 分类管理</template>
      <CategorySearchForm
        @search="handleSearch"
        @reset="handleReset"
        @add="openModal()"
      />
      <CategoryTable
        :data="list"
        :loading="loading"
        :pagination="pagination"
        @page-change="onPageChange"
        @page-size-change="onPageSizeChange"
        @edit="openModal"
        @delete="handleDelete"
      />
    </a-card>
    <CategoryFormModal
      v-model:visible="modalVisible"
      :initial="editRecord"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import useCategory from '@/hooks/sixs/useCategory';
  import type { SixSCategory } from '@/api/sixs/model/sixsModel';
  import CategorySearchForm from './components/CategorySearchForm.vue';
  import CategoryTable from './components/CategoryTable.vue';
  import CategoryFormModal from './components/CategoryFormModal.vue';

  const {
    list,
    loading,
    pagination,
    setQuery,
    fetchPage,
    fetchDetail,
    save,
    update,
    remove,
    refresh,
  } = useCategory({ autoLoad: true });

  const modalVisible = ref(false);
  const editRecord = ref<SixSCategory | null>(null);

  function handleSearch(query: { name?: string; status?: number }) {
    setQuery({ ...query, pageNo: 1 });
    pagination.current = 1;
    fetchPage();
  }

  function handleReset() {
    setQuery({ name: undefined, status: undefined, pageNo: 1 });
    pagination.current = 1;
    fetchPage();
  }

  function onPageChange(current: number) {
    pagination.current = current;
    fetchPage();
  }

  function onPageSizeChange(pageSize: number) {
    pagination.pageSize = pageSize;
    pagination.current = 1;
    fetchPage();
  }

  async function openModal(record?: SixSCategory) {
    editRecord.value = record ?? null;
    if (record?.id) {
      const detail = await fetchDetail(record.id);
      editRecord.value = detail ?? null;
    }
    modalVisible.value = true;
  }

  async function handleSubmit(form: SixSCategory) {
    if (form.id) {
      await update(form);
    } else {
      await save(form);
    }
    modalVisible.value = false;
    refresh();
  }

  async function handleDelete(id: number) {
    await remove(id);
    refresh();
  }
</script>

<style scoped lang="less">
  .container {
    padding: 16px;
  }
</style>
