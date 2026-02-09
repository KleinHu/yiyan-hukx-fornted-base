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
                'is-low-stock':
                  (item.availableStock || 0) < (item.minStock || 0),
              }"
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
              <!-- 内容保持不变 ... -->
              <div class="status-badge">
                <div v-if="item.status === 1" class="is-active">
                  <span class="dot"></span> 启用
                </div>
                <div v-else class="is-disabled">
                  <span class="dot"></span> 禁用
                </div>
                <div
                  v-if="(item.availableStock || 0) < (item.minStock || 0)"
                  class="is-warning"
                >
                  <icon-exclamation-circle-fill /> 库存紧缺
                </div>
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
                <div class="label-row">
                  <span class="label">实际库存: {{ item.stock || 0 }}</span>
                  <span class="label">待领用: {{ item.lockStock || 0 }}</span>
                </div>
                <div class="available-title">可领用库存</div>
                <div class="progress-wrapper">
                  <div class="progress-track">
                    <div
                      class="progress-bar"
                      :style="{
                        width: getProgressWidth(item.availableStock) + '%',
                        background:
                          (item.availableStock || 0) < (item.minStock || 0)
                            ? '#f53f3f'
                            : '#165dff',
                      }"
                    >
                      <div class="progress-handle"></div>
                    </div>
                  </div>
                  <span class="stock-val">{{ item.availableStock || 0 }}</span>
                </div>
              </div>
              <div class="card-actions">
                <a-popconfirm
                  content="确定删除吗？"
                  @ok="item.id && $emit('delete', item.id)"
                >
                  <div class="action-item delete-trigger">
                    <icon-delete />
                  </div>
                </a-popconfirm>
                <div class="right-btns">
                  <a-button
                    size="small"
                    class="edit-btn"
                    @click="$emit('edit', item)"
                  >
                    <template #icon><icon-edit /></template>
                    编辑
                  </a-button>
                  <a-button
                    type="primary"
                    size="small"
                    class="stock-btn"
                    @click="$emit('inventoryChange', item)"
                  >
                    出入库
                  </a-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页器固定在底部 -->
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

  defineProps<{
    data: SuppliesItemVO[];
    loading: boolean;
    pagination: any;
  }>();

  defineEmits<{
    (e: 'pageChange', current: number): void;
    (e: 'pageSizeChange', size: number): void;
    (e: 'edit', record: SuppliesItemVO): void;
    (e: 'inventoryChange', record: SuppliesItemVO): void;
    (e: 'delete', id: string): void;
  }>();

  const getProgressWidth = (stock?: number) => {
    if (!stock) return 0;
    const max = 100; // 假设满格是100，或者根据业务逻辑调整
    const percent = (stock / max) * 100;
    return Math.min(percent, 100);
  };
</script>

<style scoped lang="less">
  .card-list-wrapper {
    padding-top: 8px;
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
    height: 0; /* 促使 flex 子元素由容器分配高度 */
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 4px;

    /* 美化原生滚动条 */
    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: #e5e6eb;
      border-radius: 3px;
    }
    &::-webkit-scrollbar-thumb:hover {
      background: #c9cdd4;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
    padding: 4px 12px 16px 4px;
  }

  .item-card {
    position: relative;
    background: #fff;
    border-radius: 16px;
    border: 1px solid #f2f3f5;
    padding: 20px;
    transition: all 0.3s cubic-bezier(0.34, 0.69, 0.1, 1);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);

    /* 序号角标 */
    .card-index {
      position: absolute;
      top: 0;
      left: 0;
      background: linear-gradient(135deg, #165dff 0%, #722ed1 100%);
      color: #fff;
      font-size: 11px;
      padding: 2px 8px 4px 6px;
      border-radius: 16px 0 16px 0;
      font-weight: 700;
      font-family: 'Oswald', sans-serif;
      z-index: 10;
      box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.06);
      border-color: #e5e6eb;
    }

    &.is-low-stock {
      border-color: #f53f3f;
      background-color: #fffafa;
      box-shadow: 0 0 0 1px #f53f3f;

      .card-index {
        background: linear-gradient(135deg, #f53f3f 0%, #ff7d00 100%);
      }
    }

    /* 状态标识 */
    .status-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;

      div {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
      }

      .is-active {
        background: #eaffee;
        color: #00b42a;
        .dot {
          background: #00b42a;
        }
      }
      .is-disabled {
        background: #f2f3f5;
        color: #86909c;
        .dot {
          background: #86909c;
        }
      }
      .is-warning {
        background: #f53f3f;
        color: #fff;
        border: 1px solid #f53f3f;
        box-shadow: 0 2px 8px rgba(245, 63, 63, 0.3);

        /* 覆盖 dot */
        .dot {
          display: none;
        }
      }
    }

    /* 图标 */
    .card-icon {
      margin-bottom: 0px;
      .icon-inner {
        width: 48px;
        height: 48px;
        background: #f0f5ff;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #165dff;
      }
    }

    /* 标题信息 */
    .card-info {
      margin-bottom: 16px;
      .title {
        margin: 0 0 6px 0;
        font-size: 18px;
        font-weight: 600;
        color: #1d2129;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .category {
        display: inline-block;
        font-size: 12px;
        color: #86909c;
        background: #f2f3f5;
        padding: 2px 8px;
        border-radius: 4px;
      }
    }

    /* 规格单位 */
    .specs-box {
      display: flex;
      gap: 32px;
      margin-bottom: 8px;

      .spec-col {
        display: flex;
        flex-direction: column;
        gap: 4px;
        .label {
          font-size: 12px;
          color: #c9cdd4;
        }
        .value {
          font-size: 14px;
          color: #4e5969;
          font-weight: 500;
        }
      }
    }

    .divider {
      height: 1px;
      background: #f2f3f5;
      margin: 0 -20px 10px -20px;
      border-top: 1px dashed #e5e6eb;
    }

    /* 库存进度条 */
    .stock-box {
      margin-bottom: 8px;
      .label-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
        .label {
          font-size: 11px;
          color: #86909c;
        }
      }
      .available-title {
        font-size: 12px;
        color: #1d2129;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .progress-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;

        .progress-track {
          flex: 1;
          height: 6px;
          background: #f2f3f5;
          border-radius: 3px;
          position: relative;

          .progress-bar {
            height: 100%;
            height: 100%;
            background: #165dff;
            border-radius: 3px;
            position: relative;
            transition: width 0.3s ease;

            .progress-handle {
              position: absolute;
              right: -5px;
              top: 50%;
              transform: translateY(-50%);
              width: 10px;
              height: 10px;
              background: #165dff;
              border-radius: 50%;
              border: 2px solid #fff;
              border: 2px solid #fff;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              cursor: default;
            }
          }
        }

        .stock-val {
          font-size: 18px;
          font-weight: 700;
          font-weight: 700;
          color: #1d2129;
          font-family: 'Oswald', sans-serif;
        }
      }
    }

    /* 底部按钮 */
    .card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .delete-trigger {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #86909c;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s;
        &:hover {
          color: #f53f3f;
          background: #fff2f0;
        }
      }

      .right-btns {
        display: flex;
        gap: 10px;

        .edit-btn {
          border-radius: 8px;
          color: #4e5969;
          font-weight: 500;
        }
        .stock-btn {
          border-radius: 8px;
          padding: 0 16px;
          box-shadow: 0 4px 10px rgba(22, 93, 255, 0.2);
        }
      }
    }
  }

  .pagination-container {
    flex: none; /* 防止分页器被压缩 */
    display: flex;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid var(--color-border-2);
    background-color: var(--color-bg-2);
    margin-top: auto;
  }
</style>
