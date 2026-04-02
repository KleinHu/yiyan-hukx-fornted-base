<template>
  <a-drawer
    :visible="visible"
    title="已阅回执记录"
    width="800px"
    unmount-on-close
    :footer="false"
    @cancel="handleClose"
  >
    <div class="drawer-content">
      <div class="header-info">
        <a-alert type="info" show-icon>
          此处展示的是该必读文章的【已阅回执】记录。员工在详情页强制停留阅读后点击确认即会在此处留痕。
        </a-alert>
      </div>

      <!-- 详细流水 -->
      <a-table
        :data="records"
        :loading="loading"
        :pagination="pagination"
        size="small"
        :bordered="false"
        @page-change="onPageChange"
      >
        <template #columns>
          <a-table-column title="姓名" data-index="userName" :width="120" />
          <a-table-column title="工号" data-index="userId" :width="120" />
          <a-table-column title="部门" data-index="deptName" />
          <a-table-column title="确认时间" :width="200">
            <template #cell="{ record }">
              {{ formatDate(record.createTime) }}
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import { formatDate } from '@/utils/date';
  import { getReceiptPage, ArticleReceiptVO } from '@/api/article';

  const props = defineProps<{
    visible: boolean;
    articleId: string | undefined;
  }>();

  const emit = defineEmits(['update:visible']);

  const records = ref<ArticleReceiptVO[]>([]);
  const loading = ref(false);

  const pagination = reactive({
    current: 1,
    pageSize: 15,
    total: 0,
    showTotal: true,
  });

  const loadRecords = async () => {
    if (!props.articleId) return;
    loading.value = true;
    try {
      const res = await getReceiptPage(
        props.articleId,
        pagination.current,
        pagination.pageSize
      );
      if (res.data) {
        records.value = res.data.list || [];
        pagination.total = res.data.total || 0;
      }
    } finally {
      loading.value = false;
    }
  };

  const onPageChange = (current: number) => {
    pagination.current = current;
    loadRecords();
  };

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        pagination.current = 1;
        loadRecords();
      }
    }
  );

  const handleClose = () => {
    emit('update:visible', false);
  };
</script>

<style scoped lang="less">
  .drawer-content {
    padding: 16px 0;
  }
  .header-info {
    margin-bottom: 24px;
  }
</style>
