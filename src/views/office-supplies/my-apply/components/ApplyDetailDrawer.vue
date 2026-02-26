<template>
  <a-drawer
    :visible="visible"
    title="申请单详情"
    width="640px"
    :footer="false"
    @cancel="handleCancel"
  >
    <div v-if="record" class="drawer-content">
      <!-- 申请信息 -->
      <div class="section-item">
        <div class="section-title">申请信息</div>
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="申请单号">
            {{ record.orderNo }}
          </a-descriptions-item>
          <a-descriptions-item label="申请时间">
            {{ record.applyTime }}
          </a-descriptions-item>
          <a-descriptions-item label="申请人">
            {{ record.userName }} ({{ record.userCode }})
          </a-descriptions-item>
          <a-descriptions-item label="所属部门">
            {{ record.deptName }}
          </a-descriptions-item>
          <a-descriptions-item label="申请原因" :span="2">
            {{ record.reason || '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </div>

      <!-- 申请明细清单 -->
      <div class="section-item">
        <div class="section-title">申请明细清单</div>
        <a-table
          :data="record.items"
          :pagination="false"
          :bordered="{ wrapper: true, cell: true }"
          size="small"
        >
          <template #columns>
            <a-table-column title="物品名称" data-index="itemName" />
            <a-table-column title="规格" data-index="spec" />
            <a-table-column
              title="申请数"
              data-index="quantity"
              :width="80"
              align="center"
            />
            <a-table-column
              title="实发数"
              data-index="issuedQuantity"
              :width="80"
              align="center"
            >
              <template #cell="{ record: item }">
                <span
                  :style="{
                    color: item.issuedQuantity > 0 ? '#168cff' : '#86909c',
                    fontWeight: item.issuedQuantity > 0 ? '500' : 'normal',
                  }"
                >
                  {{ item.issuedQuantity || 0 }}
                </span>
              </template>
            </a-table-column>
          </template>
        </a-table>
      </div>

      <!-- 审批详情 -->
      <div class="section-item">
        <div class="section-title">审批详情</div>
        <a-descriptions :column="2" bordered size="small">
          <a-descriptions-item label="结果">
            <a-tag :color="getStatusColor(record.auditStatus)">
              {{ getStatusLabel(record.auditStatus) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="审批人">
            {{ record.auditorName || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="审批时间">
            {{ record.auditTime || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="审批回复" :span="2">
            {{ record.remark || '-' }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  defineProps<{
    visible: boolean;
    record: any;
  }>();

  const emit = defineEmits(['update:visible']);

  const handleCancel = () => {
    emit('update:visible', false);
  };

  const getStatusLabel = (status: number) => {
    const map: Record<number, string> = {
      0: '待审核',
      1: '已通过',
      2: '已驳回',
      3: '已发放',
    };
    return map[status] || '未知';
  };

  const getStatusColor = (status: number) => {
    const map: Record<number, string> = {
      0: 'orange',
      1: 'green',
      2: 'red',
      3: 'blue',
    };
    return map[status] || 'gray';
  };
</script>

<style scoped lang="less">
  .drawer-content {
    padding: 0 4px;
  }

  .section-item {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-weight: 600;
    font-size: 14px;
    color: var(--color-text-1);

    &::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 16px;
      background-color: #165dff;
      margin-right: 8px;
      border-radius: 2px;
    }
  }

  :deep(.arco-descriptions-item-label) {
    width: 100px;
    background-color: #f7f8fa;
    color: #4e5969;
    font-weight: 500;
  }

  :deep(.arco-descriptions-item-value) {
    color: #1d2129;
  }

  :deep(.arco-table-th) {
    background-color: #f7f8fa;
    color: #4e5969;
    font-weight: 600;
  }
</style>
