<template>
  <div class="container">
    <a-row :gutter="24" class="content-row">
      <!-- 左侧分类树 -->
      <a-col :span="6">
        <a-card class="general-card" title="文档分类">
          <a-spin
            :loading="categoryLoading"
            style="width: 100%; min-height: 100px"
          >
            <a-tree
              v-if="displayTreeData.length > 0"
              :data="displayTreeData"
              :field-names="{ key: 'id', title: 'name', children: 'children' }"
              default-expand-all
              @select="onTreeSelect"
            >
              <template #title="nodeData">
                <a-space>
                  <span>{{ nodeData.name }}</span>
                  <a-tag
                    v-if="nodeData.needApproval === 1"
                    color="orange"
                    size="small"
                  >
                    需审签
                  </a-tag>
                </a-space>
              </template>
            </a-tree>
            <div v-else-if="!categoryLoading" style="padding: 20px 0">
              <a-empty description="暂无分类数据" />
            </div>
          </a-spin>
        </a-card>
      </a-col>

      <!-- 右侧文档列表 -->
      <a-col :span="18">
        <a-card class="general-card" title="文件管理">
          <!-- 查询栏 -->
          <a-form
            :model="queryParams"
            layout="inline"
            style="margin-bottom: 20px"
          >
            <a-form-item label="文件名">
              <a-input
                v-model="queryParams.name"
                placeholder="搜索文件名称"
                allow-clear
              />
            </a-form-item>
            <a-form-item label="状态">
              <a-select
                v-model="queryParams.status"
                placeholder="全部状态"
                allow-clear
                style="width: 150px"
              >
                <a-option :value="0">草稿</a-option>
                <a-option :value="1">待审签</a-option>
                <a-option :value="2">已发布</a-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" @click="handleSearch">查询</a-button>
                <a-button @click="handleReset">重置</a-button>
              </a-space>
            </a-form-item>
            <a-form-item>
              <a-button
                type="primary"
                status="success"
                @click="handleUploadClick"
              >
                <template #icon><icon-upload /></template>
                上传新文档
              </a-button>
            </a-form-item>
          </a-form>

          <!-- 数据区 -->
          <a-table
            row-key="id"
            :loading="loading"
            :data="documentList"
            :pagination="pagination"
            @page-change="onPageChange"
          >
            <template #columns>
              <a-table-column
                title="文件名称"
                data-index="name"
              ></a-table-column>
              <a-table-column
                title="当前版本"
                data-index="currentVersion"
                :width="100"
              ></a-table-column>
              <a-table-column title="状态" data-index="status" :width="120">
                <template #cell="{ record }">
                  <a-tag :color="getStatusColor(record.status)">{{
                    record.statusName || getStatusTag(record.status)
                  }}</a-tag>
                </template>
              </a-table-column>
              <a-table-column
                title="上传人"
                data-index="uploader"
                :width="120"
              ></a-table-column>
              <a-table-column title="更新时间" :width="180">
                <template #cell="{ record }">
                  {{ dayjs(record.updateTime).format('YYYY-MM-DD') }}
                </template>
              </a-table-column>
              <a-table-column title="操作" :width="320" align="center">
                <template #cell="{ record }">
                  <a-space>
                    <a-button
                      type="text"
                      size="small"
                      @click="handlePreview(record)"
                      >预览</a-button
                    >
                    <a-button
                      type="text"
                      size="small"
                      @click="handleDownload(record)"
                      >下载</a-button
                    >
                    <a-button
                      type="text"
                      size="small"
                      @click="handleChangeVersion(record)"
                      >换版</a-button
                    >
                    <a-button
                      type="text"
                      size="small"
                      @click="handleViewHistory(record)"
                      >历史</a-button
                    >
                    <a-popconfirm
                      content="确定彻底删除?"
                      @ok="handleDelete(record.id)"
                    >
                      <a-button type="text" status="danger" size="small"
                        >删除</a-button
                      >
                    </a-popconfirm>
                  </a-space>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-card>
      </a-col>
    </a-row>

    <!-- 子组件：上传抽屉 -->
    <DocumentUploadDrawer
      ref="uploadDrawerRef"
      :category-tree="categoryTree"
      @success="handleSearch"
    />

    <!-- 子组件：历史版本抽屉 -->
    <DocumentHistoryDrawer ref="historyDrawerRef" />

    <!-- 子组件：预览抽屉 -->
    <DocumentPreviewDrawer ref="previewDrawerRef" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted, computed } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import useDocument from '@/hooks/documents/useDocument';
  import useDocumentCategory from '@/hooks/documents/useDocumentCategory';
  import type { DocumentRecord, DocumentQuery } from '@/api/documents/document';
  import dayjs from 'dayjs';
  import useFileTransfer from '@/hooks/common/useFileTransfer';
  import DocumentUploadDrawer from './components/DocumentUploadDrawer.vue';
  import DocumentHistoryDrawer from './components/DocumentHistoryDrawer.vue';
  import DocumentPreviewDrawer from './components/DocumentPreviewDrawer.vue';

  const {
    categoryTree,
    loading: categoryLoading,
    fetchTree,
  } = useDocumentCategory();
  const { loading, documentList, total, fetchPage, remove } = useDocument();
  const { downloadFile } = useFileTransfer();

  const displayTreeData = computed(() => {
    return [
      {
        id: '',
        name: '全部分类',
      },
      ...categoryTree.value,
    ];
  });

  const queryParams = reactive<DocumentQuery>({
    pageNo: 1,
    pageSize: 10,
    categoryId: undefined,
    name: undefined,
    status: undefined,
  });

  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 组件引用
  const uploadDrawerRef = ref();
  const historyDrawerRef = ref();
  const previewDrawerRef = ref();

  const currentCategoryRef = ref<any>(null);

  const findCategory = (tree: any[], id: string): any => {
    let result = tree.find((node) => node.id === id);
    if (!result) {
      tree.some((node) => {
        if (node.children) {
          result = findCategory(node.children, id);
          return !!result;
        }
        return false;
      });
    }
    return result;
  };

  // 递归收集节点自身及所有子孙节点的 ID
  const collectAllIds = (node: any): string[] => {
    if (!node) return [];
    const ids: string[] = [String(node.id)];
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        ids.push(...collectAllIds(child));
      });
    }
    return ids;
  };

  const onTreeSelect = (selectedKeys: Array<string | number>) => {
    const id =
      selectedKeys && selectedKeys.length > 0
        ? String(selectedKeys[0])
        : undefined;
    currentCategoryRef.value = id ? findCategory(categoryTree.value, id) : null;

    if (!id) {
      // 点击「全部分类」，清空所有分类过滤
      queryParams.categoryId = undefined;
      queryParams.categoryIds = undefined;
    } else if (
      currentCategoryRef.value?.children &&
      currentCategoryRef.value.children.length > 0
    ) {
      // 点击编有子分类的父节点，收集全部子孙 ID 使用 IN 查询
      queryParams.categoryId = undefined;
      queryParams.categoryIds = collectAllIds(currentCategoryRef.value);
    } else {
      // 点击叶子节点，直接精确查询
      queryParams.categoryId = id;
      queryParams.categoryIds = undefined;
    }
    handleSearch();
  };

  const handleSearch = async () => {
    queryParams.pageNo = 1;
    pagination.current = 1;
    await fetchPage(queryParams);
    pagination.total = total.value;
  };

  const handleReset = async () => {
    queryParams.name = undefined;
    queryParams.status = undefined;
    queryParams.categoryId = undefined;
    queryParams.categoryIds = undefined;
    currentCategoryRef.value = null;
    await handleSearch();
  };

  const onPageChange = async (current: number) => {
    queryParams.pageNo = current;
    pagination.current = current;
    await fetchPage(queryParams);
  };

  const getStatusTag = (status: number) => {
    const map: Record<number, string> = {
      0: '草稿',
      1: '待审签',
      2: '已发布',
    };
    return map[status] || String(status);
  };

  const getStatusColor = (status: number) => {
    const map: Record<number, string> = {
      0: 'gray',
      1: 'orange',
      2: 'green',
    };
    return map[status] || 'blue';
  };

  const handleDownload = (record: DocumentRecord) => {
    if (record.url) {
      downloadFile(record.url, record.name);
    } else {
      Message.warning('该文档无可用文件');
    }
  };

  const handlePreview = (record: DocumentRecord) => {
    if (record.url && record.name) {
      previewDrawerRef.value?.open(record.url, record.name);
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    if (await remove(id)) handleSearch();
  };

  const handleUploadClick = () => {
    // 拦截审签分类
    if (currentCategoryRef.value?.needApproval === 1) {
      Message.warning('该分类需要审签，请通过流程页面发起申请');
      return;
    }
    uploadDrawerRef.value?.open(undefined, queryParams.categoryId);
  };

  const handleChangeVersion = (record: DocumentRecord) => {
    // 换版也要拦截所属分类的审签状态
    const category = findCategory(categoryTree.value, record.categoryId);
    if (category?.needApproval === 1) {
      Message.warning('该文档所属分类需要审签，请通过流程页面发起版本更新申请');
      return;
    }
    uploadDrawerRef.value?.open(record);
  };

  const handleViewHistory = (record: DocumentRecord) => {
    if (record.id) historyDrawerRef.value?.open(record.id);
  };

  onMounted(() => {
    fetchTree();
    handleSearch();
  });
</script>

<script lang="ts">
  export default {
    name: 'DocumentManage',
  };
</script>

<style scoped>
  .container {
    padding: 20px;
  }
  .content-row {
    display: flex;
    align-items: flex-start;
  }
</style>
