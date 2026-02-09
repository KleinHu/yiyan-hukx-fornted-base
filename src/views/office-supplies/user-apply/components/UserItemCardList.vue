<template>
  <div class="card-list-wrapper">
    <a-spin :loading="loading" class="list-spin">
      <div v-if="data.length > 0" class="list-content-inner">
        <div class="scroll-container">
          <div class="card-grid">
            <div
              v-for="(item, index) in data"
              :key="item.id"
              class="item-card"
              :class="{
                'is-selected': isSelected(item.id),
                'is-disabled': (item.availableStock || 0) <= 0,
              }"
              @click="toggleSelect(item)"
            >
              <!-- 序号角标 -->
              <div class="card-index">
                {{
                  ((pagination.current || 1) - 1) *
                    (pagination.pageSize || 10) +
                  index +
                  1
                }}
              </div>

              <!-- 选中标识 -->
              <div class="selection-box">
                <a-checkbox
                  :model-value="isSelected(item.id)"
                  :disabled="(item.availableStock || 0) <= 0"
                />
              </div>

              <div class="card-icon">
                <div class="icon-inner">
                  <icon-common :size="20" />
                </div>
              </div>

              <a-space>
                <h3 class="title" :title="item.name">{{ item.name }}</h3>
                <a-tag class="category">{{
                  item.categoryName || '默认分类'
                }}</a-tag>
              </a-space>

              <div class="specs-box">
                <div class="spec-col">
                  <span class="label">规格型号</span>
                  <span class="value">{{ item.spec || '通用型' }}</span>
                </div>
                <div class="spec-col">
                  <span class="label">单位</span>
                  <span class="value">{{ item.unit || '个' }}</span>
                </div>
              </div>

              <div class="stock-box">
                <div class="available-title">可领用库存</div>
                <div class="progress-wrapper">
                  <div class="progress-track">
                    <div
                      class="progress-bar"
                      :style="{
                        width: getProgressWidth(item.availableStock) + '%',
                      }"
                    >
                      <div class="progress-handle"></div>
                    </div>
                  </div>
                  <span class="stock-val">{{ item.availableStock || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="pagination-container">
          <a-pagination
            v-bind="pagination"
            @change="(page: number) => $emit('pageChange', page)"
            @page-size-change="(size: number) => $emit('pageSizeChange', size)"
          />
        </div>
      </div>
      <a-empty v-if="!loading && data.length === 0" />
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import type { SuppliesItemVO } from '@/api/supplies';

  const props = defineProps<{
    data: SuppliesItemVO[];
    loading: boolean;
    pagination: any;
    selectedItems: SuppliesItemVO[];
  }>();

  const emit = defineEmits<{
    (e: 'pageChange', current: number): void;
    (e: 'pageSizeChange', size: number): void;
    (e: 'update:selectedItems', items: SuppliesItemVO[]): void;
  }>();

  const isSelected = (id: string | undefined) => {
    if (!id) return false;
    return props.selectedItems.some((item) => String(item.id) === String(id));
  };

  const toggleSelect = (item: SuppliesItemVO) => {
    if (!item.id) return;
    if ((item.availableStock || 0) <= 0) return;

    const newItems = [...props.selectedItems];
    const index = newItems.findIndex((i) => i.id === item.id);
    if (index > -1) {
      newItems.splice(index, 1);
    } else {
      newItems.push(item);
    }
    emit('update:selectedItems', newItems);
  };

  const getProgressWidth = (stock?: number) => {
    if (!stock) return 0;
    const max = 100;
    return Math.min((stock / max) * 100, 100);
  };
</script>

<style scoped lang="less">
  .card-list-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .list-spin {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    min-height: 0;
    overflow: hidden;

    :deep(.arco-spin-children) {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }
  }

  .list-content-inner {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-height: 0;
  }

  .scroll-container {
    flex: 1;
    height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;

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

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    padding: 12px;
  }

  .item-card {
    position: relative;
    background: #fff;
    border-radius: 12px;
    border: 1px solid #e5e6eb;
    padding: 20px;
    transition: all 0.2s ease;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);

    &:hover {
      border-color: #165dff;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }

    &.is-selected {
      border-color: #165dff;
      background-color: #f0f5ff;
      box-shadow: 0 0 0 1px #165dff;
    }

    &.is-disabled {
      cursor: not-allowed;
      background-color: #f7f8fa;
      border-color: #e5e6eb;
      opacity: 0.7;

      &:hover {
        border-color: #e5e6eb;
        box-shadow: none;
      }

      .title,
      .spec-col .value,
      .stock-box .stock-val {
        color: #c9cdd4;
      }

      .icon-inner {
        background-color: #f2f3f5;
        color: #c9cdd4;
      }
    }

    .card-index {
      position: absolute;
      top: 0;
      left: 0;
      background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
      color: #fff;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 12px 0 12px 0;
      font-weight: 700;
      z-index: 2;
    }

    .selection-box {
      position: absolute;
      top: 12px;
      right: 12px;
    }

    .card-icon {
      margin-bottom: 12px;
      .icon-inner {
        width: 40px;
        height: 40px;
        background: #f0f5ff;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #165dff;
      }
    }

    .title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1d2129;
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .specs-box {
      display: flex;
      gap: 24px;
      margin: 16px 0;

      .spec-col {
        display: flex;
        flex-direction: column;
        gap: 2px;
        .label {
          font-size: 12px;
          color: #86909c;
        }
        .value {
          font-size: 13px;
          color: #4e5969;
          font-weight: 500;
        }
      }
    }

    .stock-box {
      .available-title {
        font-size: 12px;
        color: #86909c;
        margin-bottom: 8px;
      }
      .progress-wrapper {
        display: flex;
        align-items: center;
        gap: 8px;
        .progress-track {
          flex: 1;
          height: 8px;
          background: #f2f3f5;
          border-radius: 4px;
          overflow: hidden;
          .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #165dff, #34d399);
            border-radius: 4px;
            transition: width 0.3s;
          }
        }
        .stock-val {
          font-size: 16px;
          font-weight: 700;
          color: #165dff;
          width: 32px;
          text-align: right;
        }
      }
    }
  }

  .pagination-container {
    flex: none;
    display: flex;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid var(--color-border-2);
    background-color: var(--color-bg-2);
    margin-top: auto;
  }
</style>
