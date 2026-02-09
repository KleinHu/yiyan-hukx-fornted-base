<template>
  <div class="container">
    <Breadcrumb :items="['办公用品管理', '领用申请']" />
    <div class="layout-content">
      <!-- 左侧：分类树 -->
      <div class="left-panel">
        <UserCategoryTree
          :tree-data="categoryTree"
          :loading="categoryLoading"
          @select="handleCategorySelect"
        />
      </div>

      <!-- 右侧：物品列表与选购 -->
      <div class="right-panel">
        <a-card class="general-card" title="物品领用">
          <template #extra>
            <a-space style="padding: 8px 0px">
              <a-radio-group v-model="viewMode" type="button">
                <a-radio value="table">
                  <icon-list />
                </a-radio>
                <a-radio value="card">
                  <icon-apps />
                </a-radio>
              </a-radio-group>
              <a-badge
                :count="selectedItemsStore.length"
                :dot="false"
                style="margin-right: 25px"
              >
                <a-button
                  type="primary"
                  :disabled="selectedItemsStore.length === 0"
                  @click="handleOpenApply"
                >
                  <template #icon><icon-check-square /></template>
                  立即领用
                </a-button>
              </a-badge>
            </a-space>
          </template>

          <!-- 搜索区域 -->
          <a-row style="margin-bottom: 16px">
            <a-col :span="24">
              <a-input-search
                v-model="queryParams.name"
                placeholder="搜索物品名称/规格"
                style="width: 300px"
                search-button
                @search="fetchPage({ pageNo: 1 })"
              />
            </a-col>
          </a-row>

          <keep-alive>
            <UserItemTable
              v-if="viewMode === 'table'"
              :selected-items="selectedItemsStore"
              :data="list"
              :loading="loading"
              :pagination="pagination"
              @page-change="onPageChange"
              @page-size-change="onPageSizeChange"
              @update:selected-items="handleUpdateSelected"
            />
            <UserItemCardList
              v-else
              :selected-items="selectedItemsStore"
              :data="list"
              :loading="loading"
              :pagination="pagination"
              @page-change="onPageChange"
              @page-size-change="onPageSizeChange"
              @update:selected-items="handleUpdateSelected"
            />
          </keep-alive>
        </a-card>
      </div>
    </div>

    <!-- 领用申请表单 -->
    <!-- 领用申请表单 -->
    <ApplyFormDrawer
      v-model:visible="applyModalVisible"
      :selected-items="preparedSelectedItems"
      @update:selected-items="(val) => (preparedSelectedItems = val)"
      @submit="handleApplySubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import useSuppliesCategory from '@/hooks/supplies/useSuppliesCategory';
  import useSuppliesItem from '@/hooks/supplies/useSuppliesItem';
  import useSuppliesRequest from '@/hooks/supplies/useSuppliesRequest';

  import UserCategoryTree from './components/UserCategoryTree.vue';
  import UserItemTable from './components/UserItemTable.vue';
  import UserItemCardList from './components/UserItemCardList.vue';
  import ApplyFormDrawer from './components/ApplyFormDrawer.vue';

  // 1. 分类逻辑
  const {
    treeData: categoryTree,
    loading: categoryLoading,
    fetchTree,
  } = useSuppliesCategory();

  // 2. 物品列表逻辑
  const { list, loading, pagination, queryParams, fetchPage, setCategoryIds } =
    useSuppliesItem();

  // 3. 领用提交逻辑
  const { apply } = useSuppliesRequest();

  const viewMode = ref<'table' | 'card'>('card');
  // 修改为存储完整的 item 对象，支持跨页
  const selectedItemsStore = ref<any[]>([]);
  const applyModalVisible = ref(false);

  onMounted(() => {
    fetchTree();
    fetchPage({ status: 1 }); // 用户领用只看启用的
  });

  /**
   * 递归获取分类及其所有子分类ID
   */
  const getAllCategoryIds = (id: string | undefined, tree: any[]): string[] => {
    if (id === undefined || id === '0') return [];
    const result: string[] = [id];

    const findNodeAndCollect = (nodes: any[]): boolean => {
      return nodes.some((node) => {
        if (node.id === id) {
          collectChildren(node);
          return true;
        }
        return !!(node.children && findNodeAndCollect(node.children));
      });
    };

    const collectChildren = (node: any) => {
      if (node.children) {
        node.children.forEach((child: any) => {
          if (child.id) {
            result.push(child.id);
            collectChildren(child);
          }
        });
      }
    };

    findNodeAndCollect(tree);
    return result;
  };

  const handleCategorySelect = (id: string | undefined) => {
    if (!id || id === '0') {
      setCategoryIds(undefined);
    } else {
      const ids = getAllCategoryIds(id, categoryTree.value);
      setCategoryIds(ids);
    }
  };

  const onPageChange = (current: number) => {
    fetchPage({ pageNo: current });
  };

  const onPageSizeChange = (size: number) => {
    fetchPage({ pageSize: size, pageNo: 1 });
  };

  const handleUpdateSelected = (items: any[]) => {
    selectedItemsStore.value = items;
  };

  // 准备提交的数据
  // 准备提交的数据
  const preparedSelectedItems = ref<any[]>([]);

  const handleOpenApply = () => {
    const items = selectedItemsStore.value.map((item) => ({
      ...item,
      applyQuantity: 1,
    }));

    preparedSelectedItems.value = items;
    applyModalVisible.value = true;
  };

  const handleApplySubmit = async (data: any) => {
    const success = await apply(data);
    if (success) {
      applyModalVisible.value = false;
      selectedItemsStore.value = []; // 清空选中
      fetchPage(); // 刷新列表（库存可能变动）
    }
  };
</script>

<style scoped lang="less">
  .container {
    padding: 16px 20px 20px 20px;
    background-color: #f7f9fb;
    height: calc(100vh - 90px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .layout-content {
    flex: 1;
    display: flex;
    gap: 16px;
    min-height: 0;
  }

  .left-panel {
    flex: 0 0 280px;
    height: 100%;
  }

  .right-panel {
    flex: 1;
    height: 100%;
    min-width: 0;

    .general-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      border: 1px solid #e5e6eb;

      :deep(.arco-card-header) {
        border-bottom: 1px solid #e5e6eb;
        overflow: visible;
      }

      :deep(.arco-card-body) {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
        padding: 16px;

        .arco-row {
          flex: none;
        }

        & > :last-child,
        & > .arco-spin {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
        }
      }
    }
  }
</style>
