<template>
  <div class="document-portal-container">
    <!-- 头部横幅区 -->
    <div class="portal-header">
      <div class="header-content">
        <h1 class="portal-title">制度与学习文件中心</h1>
        <p class="portal-subtitle">
          快速检索、查阅、下载公司内部核心文件与学习资料
        </p>
        <a-input-search
          v-model="queryParams.name"
          placeholder="输入文件名进行快速检索..."
          class="portal-search-bar"
          size="large"
          search-button
          @search="handleSearch"
        />
      </div>
    </div>

    <!-- 主体区域：左侧分类，右侧文件卡片网格 -->
    <div class="portal-main">
      <a-row :gutter="32">
        <!-- 左侧现代风格树形导航 -->
        <a-col :span="6">
          <div class="category-sidebar">
            <h3 class="sidebar-title">
              <icon-menu-fold style="margin-right: 8px" />
              文件分类
            </h3>
            <a-tree
              class="premium-tree"
              :data="displayTreeData"
              :field-names="{ key: 'id', title: 'name', children: 'children' }"
              default-expand-all
              @select="onTreeSelect"
            >
              <template #title="nodeData">
                <a-space :size="8">
                  <icon-apps style="color: #165dff" v-if="nodeData.id === ''" />
                  <icon-folder
                    style="color: #165dff"
                    v-else-if="
                      nodeData.children && nodeData.children.length > 0
                    "
                  />
                  <icon-folder style="color: #ffb400" v-else />
                  <span class="tree-node-title">{{ nodeData.name }}</span>
                  <a-tag
                    v-if="nodeData.needApproval"
                    color="orange"
                    size="small"
                    >需审签</a-tag
                  >
                </a-space>
              </template>
            </a-tree>
          </div>
        </a-col>

        <!-- 右侧文档卡片 -->
        <a-col :span="18">
          <a-spin :loading="loading" style="width: 100%; min-height: 300px">
            <div
              v-if="documentList.length === 0 && !loading"
              class="empty-state"
            >
              <a-empty description="该分类下暂无文件" />
            </div>

            <a-row v-else :gutter="[20, 20]" class="document-cards-wrap">
              <a-col v-for="doc in documentList" :key="doc.id" :span="8">
                <div class="document-card modern-hover">
                  <div class="doc-icon-wrap">
                    <icon-file-pdf class="doc-icon" />
                  </div>
                  <div class="doc-info">
                    <h4 class="doc-name" :title="doc.name">{{ doc.name }}</h4>
                    <span class="doc-version"
                      >当前版本：{{ doc.currentVersion || 'V1.0' }}</span
                    >
                    <span class="doc-date"
                      >更新于：{{
                        doc.updateTime
                          ? dayjs(doc.updateTime).format('YYYY-MM-DD')
                          : '-'
                      }}</span
                    >
                  </div>
                  <div class="doc-action">
                    <a-space>
                      <a-button
                        type="outline"
                        shape="round"
                        size="small"
                        @click="handlePreview(doc)"
                      >
                        <template #icon><icon-eye /></template>
                        立即预览
                      </a-button>
                      <a-button
                        type="primary"
                        shape="round"
                        size="small"
                        @click="handleDownload(doc)"
                      >
                        <template #icon><icon-download /></template>
                        立即获取
                      </a-button>
                    </a-space>
                  </div>
                </div>
              </a-col>
            </a-row>

            <div class="pagination-wrap" v-if="pagination.total > 0">
              <a-pagination
                :total="pagination.total"
                :current="pagination.current"
                :page-size="pagination.pageSize"
                show-total
                @change="onPageChange"
              />
            </div>
          </a-spin>
        </a-col>
      </a-row>
    </div>

    <!-- 子组件：预览抽屉 -->
    <DocumentPreviewDrawer ref="previewDrawerRef" />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, onMounted, computed, ref } from 'vue';
  import useDocumentCategory from '@/hooks/documents/useDocumentCategory';
  import useDocument from '@/hooks/documents/useDocument';
  import useFileTransfer from '@/hooks/common/useFileTransfer';
  import { DocumentQuery, DocumentRecord } from '@/api/documents/document';
  import dayjs from 'dayjs';
  import DocumentPreviewDrawer from '../document-manage/document/components/DocumentPreviewDrawer.vue';

  const { categoryTree, fetchTree } = useDocumentCategory();
  const { loading, documentList, total, fetchPage } = useDocument();
  const { downloadFile } = useFileTransfer();

  const previewDrawerRef = ref();

  const displayTreeData = computed(() => {
    return [
      {
        id: '', // 空字符串代表全部分类
        name: '全部分类',
        children: [],
      },
      ...categoryTree.value,
    ];
  });

  const queryParams = reactive<DocumentQuery>({
    pageNo: 1,
    pageSize: 12,
    categoryId: undefined,
    name: undefined,
    status: 2, // 门户端强管控，只需展示已发布的
  });

  const pagination = reactive({
    current: 1,
    pageSize: 12,
    total: 0,
  });

  const handleSearch = async () => {
    queryParams.pageNo = 1;
    pagination.current = 1;
    // 有关键词时清空分类限制，实现跨分类全局搜索
    if (queryParams.name && queryParams.name.trim()) {
      queryParams.categoryId = undefined;
      queryParams.categoryIds = undefined;
    }
    await fetchPage(queryParams);
    pagination.total = total.value;
  };

  const onTreeSelect = (selectedKeys: Array<string | number>) => {
    // 切换分类时清空搜索关键词
    queryParams.name = undefined;
    queryParams.categoryId =
      selectedKeys.length > 0 ? String(selectedKeys[0]) : undefined;
    handleSearch();
  };

  const onPageChange = async (current: number) => {
    queryParams.pageNo = current;
    pagination.current = current;
    await fetchPage(queryParams);
  };

  const handleDownload = (record: DocumentRecord) => {
    if (record.url) {
      downloadFile(record.url, record.name);
    }
  };

  const handlePreview = (record: DocumentRecord) => {
    if (record.url) {
      previewDrawerRef.value.open(record.url, record.name);
    }
  };

  onMounted(() => {
    fetchTree();
    handleSearch();
  });
</script>

<script lang="ts">
  export default {
    name: 'DocumentPortal',
  };
</script>

<style scoped>
  .document-portal-container {
    min-height: calc(100vh - 100px);
    background-color: #f4f6fa;
    box-sizing: border-box;
  }

  /* 顶部横幅 */
  .portal-header {
    background: linear-gradient(135deg, #165dff 0%, #1043cc 100%);
    padding: 50px 40px;
    text-align: center;
    color: #fff;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(22, 93, 255, 0.15);
    margin-bottom: -40px; /* 沉浸式叠放效果 */
    z-index: 1;
  }

  .portal-header::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -10%;
    width: 60%;
    height: 200%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.1) 0%,
      transparent 70%
    );
    transform: rotate(30deg);
  }

  .portal-header::after {
    content: '';
    position: absolute;
    bottom: -50%;
    right: -10%;
    width: 60%;
    height: 150%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.08) 0%,
      transparent 60%
    );
    transform: rotate(-20deg);
    pointer-events: none;
  }

  .header-content {
    position: relative;
    z-index: 2;
  }

  .portal-title {
    font-size: 34px;
    font-weight: 700;
    margin: 0 0 12px 0;
    letter-spacing: 2px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
  }

  .portal-subtitle {
    font-size: 15px;
    opacity: 0.85;
    margin-bottom: 24px;
  }

  .portal-search-bar {
    width: 50%;
    max-width: 600px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border-radius: 100px;
    overflow: hidden;
    backdrop-filter: blur(10px);
  }

  /* 主体容器 */
  .portal-main {
    position: relative;
    z-index: 2;
    max-width: 1400px;
    margin: 0 auto;
    padding: 60px 20px 20px 20px;
  }

  /* 左侧栏 */
  .category-sidebar {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
    min-height: 500px;
  }

  .sidebar-title {
    font-size: 18px;
    font-weight: 600;
    color: #1d2129;
    margin-top: 0;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 12px;
  }

  .premium-tree :deep(.arco-tree-node-title) {
    font-size: 15px;
    color: #4e5969;
    transition: all 0.2s ease;
  }

  .premium-tree :deep(.arco-tree-node-selected .arco-tree-node-title) {
    color: #165dff;
    font-weight: 600;
  }

  /* 右侧文件卡片网格的相关布局（已移除 margin-top，通过外层 a-row 控制间距） */

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    border: 1px dashed #e5e6eb;
  }

  .document-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    height: 100%;
    border: 1px solid transparent;
  }

  .modern-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 30px rgba(22, 93, 255, 0.12);
    border-color: rgba(22, 93, 255, 0.1);
  }

  .doc-icon-wrap {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: rgba(22, 93, 255, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .doc-icon {
    font-size: 28px;
    color: #165dff;
  }

  .doc-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .doc-name {
    font-size: 16px;
    font-weight: 600;
    color: #1d2129;
    margin: 0 0 10px 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .doc-version,
  .doc-date {
    font-size: 13px;
    color: #86909c;
    line-height: 1.6;
  }

  .doc-action {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }

  .pagination-wrap {
    margin-top: 32px;
    display: flex;
    justify-content: flex-end;
    background: #fff;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
  }
</style>
