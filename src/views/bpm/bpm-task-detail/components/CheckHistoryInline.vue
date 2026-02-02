<template>
  <div class="check-history-inline">
    <a-spin :loading="loading" style="width: 100%">
      <a-steps :current="handleHistories.length" direction="vertical" small>
        <a-step
          v-for="item in handleHistories"
          :key="item.hisId"
          :title="item.nodeName"
        >
          <template #description>
            <div class="step-description-head">
              <a-avatar
                :size="24"
                shape="square"
                style="background-color: var(--color-primary-light-3)"
              >
                <icon-user />
              </a-avatar>
              <div class="step-description-head-user">
                {{ item.handlerUserName }}
              </div>
              <div class="step-description-head-extra">
                <a-tag v-if="item.jumpType === 'SKIP'" color="red">
                  {{ item.jumpTypeName }}
                </a-tag>
                <a-tag v-else-if="item.jumpType === 'AGREE'" color="#00b42a">
                  {{ item.jumpTypeName }}
                </a-tag>
                <a-tag
                  v-else-if="
                    item.jumpType === 'BACK' ||
                    item.jumpType === 'BACK_SPEC' ||
                    item.jumpType === 'BACK_TO_STARTOR'
                  "
                  color="#f53f3f"
                >
                  {{ item.jumpTypeName }}
                </a-tag>
                <a-tag v-else>{{ item.jumpTypeName }}</a-tag>
              </div>
            </div>

            <div class="step-description-content">
              <div
                v-if="item.jumpType == 'TRANSFER' && item.transferorName"
                class="transfer-info"
              >
                {{ `${item.jumpTypeName} 给了 ${item.transferorName}` }}
              </div>

              <div class="time-info">
                <div class="label">起止时间：</div>
                <div class="value-range">
                  <div class="time-item">{{ item.createTime }}</div>
                  <div class="time-separator">~</div>
                  <div class="time-item">{{ item.completeTime }}</div>
                </div>
              </div>
              <div class="opinion-info">
                <span class="label">审批意见：</span>
                <span class="value">{{
                  item.remark === '' ? '无' : item.remark
                }}</span>
              </div>
            </div>
          </template>
        </a-step>
        <a-step
          v-for="item in unhandleHistories"
          :key="item.hisId"
          :title="item.nodeName"
        >
          <template #description>
            <div v-if="item.children">
              <div v-for="child in item.children" :key="child.hisId">
                <div class="step-description-head">
                  <a-avatar :size="24" shape="square">
                    <icon-user />
                  </a-avatar>
                  <div class="step-description-head-user">
                    <div v-for="user in child.taskExecutors" :key="user.id">
                      {{ user.name }}
                    </div>
                  </div>
                </div>
                <div class="step-description-content">
                  <div class="time-info">
                    <span class="label">开始时间：</span>
                    <span class="value">{{ child.createTime }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </a-step>
      </a-steps>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { BpmInstCheckRecord } from '@/api/bpm/model/bpmInstanceModel';
  import { getBpmInstCheckHistory } from '@/api/bpm/bpm-instance';

  interface BpmUnhandleCheckRecord extends BpmInstCheckRecord {
    children?: BpmInstCheckRecord[];
  }

  const props = defineProps({
    instId: { type: String, required: true },
  });

  const loading = ref(false);
  const checkHistories = ref<BpmInstCheckRecord[]>([]);
  const unhandleHistories = ref<BpmUnhandleCheckRecord[]>([]);
  const handleHistories = ref<BpmInstCheckRecord[]>([]);

  const getCheckHistory = async () => {
    try {
      loading.value = true;
      const res = await getBpmInstCheckHistory(props.instId);
      // 兼容两种情况：一种是拦截器已经处理了 .data，一种是没处理的
      const realData = res.data?.data || res.data || res;

      checkHistories.value = Array.isArray(realData) ? realData : [];

      generateUnhandleHistory();
    } finally {
      loading.value = false;
    }
  };

  const generateUnhandleHistory = () => {
    handleHistories.value = checkHistories.value.filter(
      (elem) => elem.checkStatus !== 'UNHAND'
    );
    const unhandleArr = checkHistories.value.filter(
      (elem) => elem.checkStatus === 'UNHAND'
    );
    const tempObj: any = {};
    const tempArr: BpmUnhandleCheckRecord[] = [];
    unhandleArr.forEach((elem) => {
      if (elem.actTaskId) {
        tempObj[elem.actTaskId] = tempObj[elem.actTaskId] || [];
        tempObj[elem.actTaskId].push(elem);
      }
    });
    Object.keys(tempObj).forEach((key) => {
      tempArr.push({ ...tempObj[key][0], children: tempObj[key] });
    });
    unhandleHistories.value = tempArr;
  };

  onMounted(() => {
    getCheckHistory();
  });
</script>

<style scoped lang="less">
  .check-history-inline {
    padding: 0;
    background: #fff;
  }

  :deep(.arco-steps-item-description) {
    width: 100%;
    padding-bottom: 12px;
  }

  :deep(.arco-steps-item-content) {
    min-width: 0;
    flex: 1;
  }

  .step-description {
    &-head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
      width: 100%;
      margin-bottom: 6px;

      &-user {
        flex: 1;
        min-width: 0;
        font-weight: 500;
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &-extra {
        flex-shrink: 0;
        margin-left: auto;

        :deep(.arco-tag) {
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    &-content {
      margin-bottom: 12px;
      font-size: 12px;
      color: var(--color-text-3);
      line-height: 1.5;
      word-break: break-all;

      .time-info,
      .opinion-info,
      .transfer-info {
        margin-bottom: 4px;

        .label {
          color: var(--color-text-4);
          display: block; // 标签也占用一行，给内容留出全部宽度
          margin-bottom: 2px;
        }

        .value {
          color: var(--color-text-2);
          display: block;
        }

        .value-range {
          display: flex;
          flex-direction: column;
          color: var(--color-text-2);

          .time-separator {
            padding: 0 4px;
            color: var(--color-text-4);
            display: none; // 纵向排版不需要波浪号
          }

          .time-item {
            font-family: monospace;
            line-height: 1.4;
          }
        }
      }
    }
  }
</style>
