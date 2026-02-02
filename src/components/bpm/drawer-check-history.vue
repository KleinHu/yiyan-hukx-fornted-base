<!--抽屉：审批历史-->
<template>
  <div>
    <a-button type="outline" @click="open">审批历史</a-button>

    <a-drawer v-model:visible="visible" title="审批历史" width="420px">
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
              <div v-if="item.jumpType == 'TRANSFER' && item.transferorName">
                {{ `${item.jumpTypeName} 给了 ${item.transferorName}` }}
              </div>

              <div>
                {{ `起止时间：${item.createTime} ~ ${item.completeTime}` }}
              </div>
              <div>
                {{ `审批意见：${item.remark === '' ? '无' : item.remark}` }}
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
                  <div>
                    {{ `起止时间：${child.createTime}` }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </a-step>
      </a-steps>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { BpmInstCheckRecord } from '@/api/bpm/model/bpmInstanceModel';
  import { getBpmInstCheckHistory } from '@/api/bpm/bpm-instance';

  interface BpmUnhandleCheckRecord extends BpmInstCheckRecord {
    children?: BpmInstCheckRecord[]; // 处理数据时使用
  }
  const props = defineProps({
    instId: { type: String, required: true },
  });

  const visible = ref(false);
  const open = () => {
    visible.value = true;
    getCheckHistory();
  };

  const checkHistories = ref<BpmInstCheckRecord[]>([]);
  const unhandleHistories = ref<BpmUnhandleCheckRecord[]>([]);
  const handleHistories = ref<BpmInstCheckRecord[]>([]);
  const getCheckHistory = async () => {
    try {
      const { data } = await getBpmInstCheckHistory(props.instId);
      checkHistories.value = data;
      generateUnhandleHistory();
    } finally {
      // empty
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
</script>

<style scoped lang="less">
  .step-description {
    &-head {
      display: flex;
      align-content: center;
      justify-content: space-between;
      width: 320px;
      margin-bottom: 14px;

      &-user {
        flex: 1;
        margin-top: 2px;
        margin-left: 4px;
      }
    }

    &-content {
      margin-bottom: 14px;
    }
  }
</style>
