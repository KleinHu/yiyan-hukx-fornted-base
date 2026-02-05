<template>
  <a-drawer
    :visible="visible"
    title="编辑检查记录"
    width="520px"
    unmount-on-close
    @ok="handleOk"
    @cancel="emit('update:visible', false)"
  >
    <a-form
      ref="formRef"
      :model="form"
      :rules="formRules"
      layout="vertical"
      class="record-form"
    >
      <!-- 类型选择器 -->
      <div class="type-selector">
        <div
          class="type-btn minus"
          :class="{ active: scoreType === 'minus' }"
          @click="scoreType = 'minus'"
        >
          <div class="symbol">－</div>
          <div class="label">扣分</div>
        </div>
        <div
          class="type-btn plus"
          :class="{ active: scoreType === 'plus' }"
          @click="scoreType = 'plus'"
        >
          <div class="symbol">＋</div>
          <div class="label">加分 / 奖励</div>
        </div>
      </div>

      <a-form-item
        :label="scoreType === 'minus' ? '违规分类' : '奖励分类'"
        field="categoryId"
      >
        <a-select
          v-model="form.categoryId"
          placeholder="请选择分类"
          :loading="categoryLoading"
        >
          <a-option
            v-for="cat in filteredCategoryList"
            :key="cat.id"
            :value="cat.id"
            :label="cat.name"
          />
        </a-select>
      </a-form-item>

      <a-form-item label="检查日期" field="checkDate">
        <a-date-picker
          v-model="form.checkDate"
          style="width: 100%"
          format="YYYY-MM-DD"
        />
      </a-form-item>

      <a-form-item label="检查人" field="checkerCode">
        <a-space fill>
          <a-input v-model="form.checkerCode" placeholder="工号" readonly />
          <a-input v-model="form.checkerName" placeholder="姓名" readonly />
          <a-button type="primary" @click="emit('openEmployeeSelect')">
            <template #icon><icon-user-group /></template>
            选择
          </a-button>
        </a-space>
      </a-form-item>

      <a-form-item label="分值" field="scoreDeducted">
        <a-input-number
          v-model="absScore"
          :min="1"
          placeholder="请输入分值"
          style="width: 100%"
        />
      </a-form-item>

      <a-form-item
        :label="scoreType === 'minus' ? '问题描述' : '奖励说明'"
        field="problemDescription"
      >
        <a-textarea
          v-model="form.problemDescription"
          placeholder="请输入详细说明"
          :auto-size="{ minRows: 3, maxRows: 6 }"
        />
      </a-form-item>
    </a-form>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, reactive, watch, computed } from 'vue';
  import type { FormInstance } from '@arco-design/web-vue';
  import { IconUserGroup } from '@arco-design/web-vue/es/icon';
  import {
    OPERATION_TYPE_ADD,
    OPERATION_TYPE_DEDUCT,
  } from '@/api/sixs/model/sixsModel';
  import type {
    SixSCheckRecord,
    SixSCategory,
  } from '@/api/sixs/model/sixsModel';
  import type { Employee } from '@/api/hr/types';

  const props = defineProps<{
    visible: boolean;
    initial: SixSCheckRecord;
    categoryOptions: SixSCategory[];
    categoryLoading?: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', v: boolean): void;
    (e: 'submit', form: SixSCheckRecord): void;
    (e: 'openEmployeeSelect'): void;
  }>();

  const scoreType = ref<'minus' | 'plus'>('minus');
  const absScore = ref(1);

  const filteredCategoryList = computed(() => {
    const opType =
      scoreType.value === 'minus' ? OPERATION_TYPE_DEDUCT : OPERATION_TYPE_ADD;
    return props.categoryOptions.filter((cat) => cat.operationType === opType);
  });

  watch(scoreType, () => {
    // 切换类型时，如果当前选择的分类不属于该类型，则清空
    const currentCat = props.categoryOptions.find(
      (c) => c.id === form.categoryId
    );
    const opType =
      scoreType.value === 'minus' ? OPERATION_TYPE_DEDUCT : OPERATION_TYPE_ADD;
    if (currentCat && currentCat.operationType !== opType) {
      form.categoryId = undefined as any;
    }
  });

  const formRef = ref<FormInstance>();
  const form = reactive<SixSCheckRecord>({
    accountId: '',
    categoryId: '',
    checkDate: '',
    problemDescription: '',
    scoreDeducted: 0,
    checkerCode: '',
    checkerName: '',
  });

  const formRules = {
    categoryId: [{ required: true, message: '请选择分类' }],
    checkDate: [{ required: true, message: '请选择检查日期' }],
    problemDescription: [{ required: true, message: '请输入详情说明' }],
  };

  watch(
    () => props.initial,
    (v) => {
      if (v) {
        form.accountId = v.accountId;
        form.categoryId = v.categoryId;
        form.checkDate = v.checkDate;
        form.problemDescription = v.problemDescription;
        const score = v.scoreDeducted ?? 0;
        scoreType.value = score < 0 ? 'minus' : 'plus';
        absScore.value = Math.abs(score) || 1;
        form.checkerCode = v.checkerCode ?? '';
        form.checkerName = v.checkerName ?? '';
        form.id = v.id;
      }
    },
    { immediate: true }
  );

  async function handleOk() {
    const valid = await formRef.value?.validate();
    if (valid) return;
    const submitData = {
      ...form,
      scoreDeducted:
        scoreType.value === 'minus' ? -absScore.value : absScore.value,
    };
    emit('submit', submitData as SixSCheckRecord);
  }

  function fillChecker(emp: Employee) {
    form.checkerCode = emp.userCode;
    form.checkerName = emp.userName;
  }

  defineExpose({ fillChecker });
</script>

<style scoped lang="less">
  .record-form {
    :deep(.arco-form-item-label) {
      font-weight: 600;
      color: var(--color-text-1);
      margin-bottom: 8px;
      font-size: 14px;
    }

    .type-selector {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      .type-btn {
        flex: 1;
        height: 80px;
        border: 2px solid var(--color-border-2);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        background-color: #fff;
        .symbol {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        .label {
          font-size: 14px;
          font-weight: 600;
        }
        &.minus {
          color: #f53f3f;
          &.active {
            border-color: #f53f3f;
            background-color: rgba(245, 63, 63, 0.04);
          }
        }
        &.plus {
          color: #86909c;
          &.active {
            color: #165dff;
            border-color: #165dff;
            background-color: rgba(22, 93, 255, 0.04);
          }
        }
      }
    }

    :deep(.arco-input-wrapper),
    :deep(.arco-select-view),
    :deep(.arco-textarea-wrapper) {
      background-color: #f2f3f5;
      border: 1px solid transparent;
      border-radius: 6px;
      transition: all 0.2s;
      &:hover {
        background-color: #e5e6eb;
      }
      &.arco-input-focus,
      &.arco-select-view-focus {
        background-color: #fff;
        border-color: var(--color-primary-light-3);
        box-shadow: 0 0 0 2px var(--color-primary-light-1);
      }
    }
  }
</style>
