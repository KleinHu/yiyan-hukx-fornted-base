<template>
  <a-drawer
    :visible="visible"
    title="流水详情说明"
    width="650px"
    @cancel="$emit('update:visible', false)"
    :footer="false"
  >
    <a-spin :loading="loading" style="width: 100%">
      <div v-if="record" class="detail-container">
        <div class="section-title">台账基本信息</div>
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="发生时间">
            {{ record.createTime }}
          </a-descriptions-item>
          <a-descriptions-item label="物品名称">
            {{ record.itemName }}
          </a-descriptions-item>
          <a-descriptions-item label="规格型号">
            {{ record.spec || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="变动类型">
            <a-tag :color="record.type === 1 ? 'green' : 'orange'">
              {{ record.type === 1 ? '入库' : '出库' }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="业务场景">
            {{ scenarioLabel(record.scenario) }}
          </a-descriptions-item>
          <a-descriptions-item label="变动数量">
            <span
              :style="{
                color: record.type === 1 ? '#00b42a' : '#ff7d00',
                fontWeight: 'bold',
              }"
            >
              {{ record.type === 1 ? '+' : '-' }}{{ record.quantity }}
            </span>
          </a-descriptions-item>
          <a-descriptions-item label="关联单号" :span="2">
            {{ record.relNo || '-' }}
          </a-descriptions-item>
          <a-descriptions-item label="操作人" :span="2">
            {{ record.creatorName }} ({{ record.creator }})
          </a-descriptions-item>
        </a-descriptions>

        <!-- 领用申请详情 (场景为领用时显示) -->
        <div
          v-if="record.scenario === 2 && requestDetail"
          style="margin-top: 24px"
        >
          <div class="section-title">申请信息</div>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="申请单号">
              {{ requestDetail.orderNo }}
            </a-descriptions-item>
            <a-descriptions-item label="申请时间">
              {{ requestDetail.applyTime }}
            </a-descriptions-item>
            <a-descriptions-item label="申请人">
              {{ requestDetail.userName }} ({{ requestDetail.userCode }})
            </a-descriptions-item>
            <a-descriptions-item label="所属部门">
              {{ requestDetail.deptName || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="申请原因" :span="2">
              {{ requestDetail.reason || '无' }}
            </a-descriptions-item>
          </a-descriptions>

          <div class="section-title" style="margin-top: 24px">申请明细清单</div>
          <a-table
            :data="requestDetail.items"
            :pagination="false"
            size="small"
            bordered
          >
            <template #columns>
              <a-table-column title="物品名称" data-index="itemName" />
              <a-table-column title="规格" data-index="spec" />
              <a-table-column
                title="申请数"
                data-index="quantity"
                :width="80"
              />
              <a-table-column
                title="实发数"
                data-index="issuedQuantity"
                :width="80"
              />
            </template>
          </a-table>

          <div class="section-title" style="margin-top: 24px">审批详情</div>
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="结果">
              <a-tag :color="statusColor(requestDetail.auditStatus)">
                {{ statusLabel(requestDetail.auditStatus) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="审批人">
              {{ requestDetail.auditorName || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="审批时间">
              {{ requestDetail.auditTime || '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="审批回复" :span="2">
              {{ requestDetail.remark || '-' }}
            </a-descriptions-item>
          </a-descriptions>
        </div>
      </div>
    </a-spin>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { getRequestByOrderNo, type SuppliesRequestVO } from '@/api/supplies';

  const props = defineProps<{
    visible: boolean;
    record: any;
  }>();

  defineEmits(['update:visible']);

  const loading = ref(false);
  const requestDetail = ref<SuppliesRequestVO | null>(null);

  const scenarioLabel = (scenario: number) => {
    const map: Record<number, string> = {
      1: '采购',
      2: '领用',
      3: '盘点',
      4: '退库',
      5: '报损',
    };
    return map[scenario] || '未知';
  };

  const statusLabel = (status?: number) => {
    const map: Record<number, string> = {
      0: '待审批',
      1: '通过',
      2: '驳回',
      3: '已发放',
    };
    return status !== undefined ? map[status] || '未知' : '-';
  };

  const statusColor = (status?: number) => {
    const map: Record<number, string> = {
      0: 'arcoblue',
      1: 'green',
      2: 'red',
      3: 'cyan',
    };
    return status !== undefined ? map[status] : 'gray';
  };

  watch(
    () => props.visible,
    async (val) => {
      if (
        val &&
        props.record &&
        props.record.scenario === 2 &&
        props.record.relNo
      ) {
        try {
          loading.value = true;
          const { data } = await getRequestByOrderNo(props.record.relNo);
          requestDetail.value = data;
        } catch (e) {
          requestDetail.value = null;
        } finally {
          loading.value = false;
        }
      } else if (val) {
        requestDetail.value = null;
      }
    }
  );
</script>

<style scoped lang="less">
  .detail-container {
    padding: 0 10px 20px 10px;
  }
  .section-title {
    margin-bottom: 12px;
    font-weight: bold;
    font-size: 15px;
    color: var(--color-text-1);
    border-left: 4px solid rgb(var(--arcoblue-6));
    padding-left: 10px;
    line-height: 1.5;
  }
</style>
