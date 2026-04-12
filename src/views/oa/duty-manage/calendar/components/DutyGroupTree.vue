<template>
  <a-card :bordered="false" class="tree-side">
    <template #title>
      <div class="side-title">
        <icon-relation size="18" />
        <span>组织架构</span>
      </div>
    </template>

    <div class="tree-filter">
      <a-input-search
        v-model="searchKey"
        placeholder="搜索科室/班组..."
        allow-clear
      />
    </div>

    <div class="tree-scroll custom-scrollbar">
      <a-tree
        block-node
        :data="filteredData"
        :field-names="{ key: 'id', title: 'name' }"
        :selected-keys="selectedKeys"
        class="group-tree"
        @select="(keys: any) => $emit('update:selectedKeys', keys)"
      />
    </div>
  </a-card>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';

  const props = defineProps<{
    treeData: any[];
    selectedKeys: string[];
  }>();

  defineEmits(['update:selectedKeys']);

  const searchKey = ref('');

  const filteredData = computed(() => {
    const rawData = !searchKey.value
      ? props.treeData
      : searchData(props.treeData, searchKey.value);

    // 将“全部科室”作为数组的第一个平级节点，而不是包裹节点
    return [
      {
        id: 'all',
        name: '全部科室',
      },
      ...rawData,
    ];
  });

  const searchData = (data: any[], key: string) => {
    const res: any[] = [];
    data.forEach((item) => {
      if (item.name.toLowerCase().includes(key.toLowerCase())) {
        res.push({ ...item });
      } else if (item.children) {
        const filterData = searchData(item.children, key);
        if (filterData.length) {
          res.push({ ...item, children: filterData });
        }
      }
    });
    return res;
  };
</script>

<style scoped lang="less">
  .tree-side {
    width: 280px;
    flex-shrink: 0;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    height: 100%;

    :deep(.arco-card-header) {
      padding: 16px 20px;
      border-bottom: 1px solid #f2f3f5;
      .side-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 700;
        color: #1d2129;
      }
    }

    :deep(.arco-card-body) {
      padding: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .tree-filter {
      padding: 16px 16px 12px;
    }

    .tree-scroll {
      flex: 1;
      padding: 0 16px 16px;
      overflow-y: auto;
    }

    .group-tree {
      :deep(.arco-tree-node-title) {
        font-size: 14px;
        color: #4e5969;
        transition: all 0.2s;
        &:hover {
          color: #165dff;
        }
      }
      :deep(.arco-tree-node-selected .arco-tree-node-title) {
        color: #165dff;
        font-weight: 700;
        background-color: #f2f6ff;
      }
    }
  }

  .custom-scrollbar {
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: #e5e6eb;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }
</style>
