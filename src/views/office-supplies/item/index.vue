<template>
  <div class="container">
    <Breadcrumb :items="['办公用品管理', '物品管理']" />
    <div class="layout-content">
      <!-- 左侧：分类树 -->
      <div class="left-panel">
        <CategoryTree
          :tree-data="categoryTree"
          :loading="categoryLoading"
          class="category-tree-card"
          @select="handleCategorySelect"
          @add="handleCategoryAdd"
          @edit="handleCategoryEdit"
          @delete="handleCategoryDelete"
        />
      </div>

      <!-- 右侧：物品列表 -->
      <div class="right-panel">
        <a-card class="general-card" title="物品列表 (V2)">
          <template #extra>
            <a-space>
              <a-radio-group v-model="viewMode" type="button">
                <a-radio value="table"><icon-list /></a-radio>
                <a-radio value="card"><icon-apps /></a-radio>
              </a-radio-group>
              <a-button type="primary" @click="handleItemAdd">
                <template #icon><icon-plus /></template>
                新增物品
              </a-button>
            </a-space>
          </template>

          <a-row style="margin-bottom: 16px">
            <a-col :span="24">
              <a-space>
                <a-input-search
                  v-model="queryParams.name"
                  placeholder="搜索物品名称/规格"
                  style="width: 300px"
                  search-button
                  @search="fetchPage({ pageNo: 1 })"
                />
                <a-checkbox
                  v-model="queryParams.lowStock"
                  @change="fetchPage({ pageNo: 1 })"
                >
                  <span :style="{ color: queryParams.lowStock ? 'red' : '' }">
                    仅显示库存紧缺
                  </span>
                </a-checkbox>
              </a-space>
            </a-col>
          </a-row>

          <keep-alive>
            <ItemTable
              v-if="viewMode === 'table'"
              :data="list"
              :loading="loading"
              :pagination="pagination"
              @page-change="onPageChange"
              @pageSizeChange="onPageSizeChange"
              @edit="handleItemEdit"
              @inventory-change="handleInventoryTrigger"
              @delete="remove"
            />
            <ItemCardList
              v-else
              :data="list"
              :loading="loading"
              :pagination="pagination"
              @pageChange="onPageChange"
              @pageSizeChange="onPageSizeChange"
              @edit="handleItemEdit"
              @inventoryChange="handleInventoryTrigger"
              @delete="remove"
            />
          </keep-alive>
        </a-card>
      </div>
    </div>

    <!-- 弹窗组件保持不变 -->
    <CategoryFormModal
      v-model:visible="categoryModalVisible"
      :initial-data="categoryForm"
      :category-tree="categoryTree"
      @submit="handleCategorySubmit"
    />
    <ItemFormModal
      v-model:visible="itemModalVisible"
      :initial-data="itemForm"
      :category-tree="categoryTree"
      @submit="handleItemSubmit"
    />
    <InventoryChangeModal
      v-model:visible="inventoryModalVisible"
      :item-id="inventoryTarget.id"
      :item-name="inventoryTarget.name"
      @submit="handleInventorySubmit"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import useSuppliesCategory from '@/hooks/supplies/useSuppliesCategory';
  import useSuppliesItem from '@/hooks/supplies/useSuppliesItem';
  import useInventory from '@/hooks/supplies/useInventory';

  import * as suppliesApi from '@/api/supplies';
  import CategoryTree from './components/CategoryTree.vue';
  import ItemTable from './components/ItemTable.vue';
  import ItemCardList from './components/ItemCardList.vue';
  import CategoryFormModal from './components/CategoryFormModal.vue';
  import ItemFormModal from './components/ItemFormModal.vue';
  import InventoryChangeModal from './components/InventoryChangeModal.vue';

  // ... (Hooks 和逻辑保持不变)
  const {
    treeData: categoryTree,
    loading: categoryLoading,
    fetchTree,
    save: saveCategory,
    remove: removeCategory,
  } = useSuppliesCategory();

  const {
    list,
    loading,
    pagination,
    queryParams,
    fetchPage,
    save: saveItem,
    remove,
    setCategoryIds,
  } = useSuppliesItem();

  const { changeStock } = useInventory();

  // 视图模式：'table' | 'card'
  const viewMode = ref('card');

  onMounted(() => {
    fetchTree();
    fetchPage();
  });

  const onPageSizeChange = (size: number) => {
    pagination.pageSize = size;
    fetchPage({ pageNo: 1, pageSize: size });
  };

  // 分类管理逻辑
  const categoryModalVisible = ref(false);
  const categoryForm = ref<any>(null);

  const handleCategoryAdd = () => {
    categoryForm.value = {
      id: undefined,
      name: '',
      parentId: undefined,
      sort: 0,
    };
    categoryModalVisible.value = true;
  };
  const handleCategoryEdit = (record: any) => {
    categoryForm.value = { ...record };
    categoryModalVisible.value = true;
  };
  const handleCategoryDelete = (id: string) => {
    removeCategory(id);
  };
  const handleCategorySubmit = async (data: any) => {
    const success = await saveCategory(data);
    if (success) categoryModalVisible.value = false;
  };

  /**
   * 递归获取分类及其所有子分类ID
   */
  const getAllCategoryIds = (
    id: string | undefined,
    tree: suppliesApi.SuppliesCategoryVO[]
  ): string[] => {
    if (id === undefined || id === '0') return [];
    const result: string[] = [id];

    const findNodeAndCollect = (
      nodes: suppliesApi.SuppliesCategoryVO[]
    ): boolean => {
      return nodes.some((node) => {
        if (node.id === id) {
          collectChildren(node);
          return true;
        }
        return !!(node.children && findNodeAndCollect(node.children));
      });
    };

    const collectChildren = (node: suppliesApi.SuppliesCategoryVO) => {
      if (node.children) {
        node.children.forEach((child: suppliesApi.SuppliesCategoryVO) => {
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

  // 物品管理逻辑
  const itemModalVisible = ref(false);
  const itemForm = ref<any>(null);

  const handleItemAdd = () => {
    const defaultCategoryId =
      queryParams.value.categoryIds && queryParams.value.categoryIds.length > 0
        ? queryParams.value.categoryIds[0]
        : undefined;

    itemForm.value = {
      id: undefined,
      categoryId: defaultCategoryId,
      name: '',
      spec: '',
      unit: '',
      price: 0,
      minStock: 0,
      status: 1,
    };
    itemModalVisible.value = true;
  };
  const handleItemEdit = (record: any) => {
    itemForm.value = { ...record };
    itemModalVisible.value = true;
  };
  const handleItemSubmit = async (data: any) => {
    const success = await saveItem(data);
    if (success) itemModalVisible.value = false;
  };
  const onPageChange = (current: number) => {
    fetchPage({ pageNo: current });
  };

  // 库存管理逻辑
  const inventoryModalVisible = ref(false);
  const inventoryTarget = ref({ id: 0, name: '' });

  const handleInventoryTrigger = (record: any) => {
    inventoryTarget.value = { id: record.id, name: record.name };
    inventoryModalVisible.value = true;
  };
  const handleInventorySubmit = async (data: any) => {
    const success = await changeStock(data);
    if (success) {
      inventoryModalVisible.value = false;
      fetchPage();
    }
  };
</script>

<style scoped lang="less">
  .container {
    padding: 16px 20px 20px 20px;
    background-color: #f7f9fb;
    height: calc(100vh - 90px); /* 扣除顶部导航栏和页签栏的高度 */
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

    :deep(.arco-card) {
      height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      border: 1px solid #e5e6eb;

      .arco-card-body {
        flex: 1;
        overflow-y: auto;
      }
    }
  }

  .right-panel {
    flex: 1;
    height: 100%;
    min-width: 0; /* 防止内容撑破 flex 容器 */

    :deep(.arco-card) {
      height: 100%;
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      border: 1px solid #e5e6eb;

      .arco-card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        overflow: hidden; /* 关键：防止 body 被内容撑高 */
        padding: 16px; /* 显式设置内边距保持一致性 */

        .arco-row {
          flex: none;
        }

        /* 针对 keep-alive 包裹的组件 (ItemTable 或 ItemCardList) */
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
