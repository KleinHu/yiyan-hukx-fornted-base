<template>
  <div class="main-toolbar">
    <div class="toolbar-left">
      <!-- 预留空间 -->
      <slot name="left"></slot>
    </div>

    <div class="toolbar-center">
      <template v-if="viewMode === 'week'">
        <a-button type="text" class="nav-btn" @click="$emit('prev')">
          <icon-left />
        </a-button>
        <span class="toolbar-week-range">{{ weekRangeText }}</span>
        <a-button type="text" class="nav-btn" @click="$emit('next')">
          <icon-right />
        </a-button>
      </template>
      <template v-else>
        <a-button
          type="text"
          class="nav-btn"
          @click="
            $emit(
              'dateChange',
              dayjs(currentDate).subtract(1, 'month').format('YYYY-MM-DD')
            )
          "
        >
          <icon-left />
        </a-button>
        <span class="toolbar-month-title">{{
          dayjs(currentDate).format('YYYY年MM月')
        }}</span>
        <a-button
          type="text"
          class="nav-btn"
          @click="
            $emit(
              'dateChange',
              dayjs(currentDate).add(1, 'month').format('YYYY-MM-DD')
            )
          "
        >
          <icon-right />
        </a-button>
      </template>
    </div>

    <div class="toolbar-right">
      <a-radio-group
        :model-value="viewMode"
        type="button"
        size="medium"
        @change="(val: any) => $emit('update:viewMode', val)"
      >
        <a-radio value="month">月视图</a-radio>
        <a-radio value="week">周视图</a-radio>
      </a-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs';

  defineProps<{
    viewMode: 'month' | 'week';
    currentDate: string;
    weekRangeText: string;
  }>();

  defineEmits(['update:viewMode', 'prev', 'next', 'dateChange']);
</script>

<style scoped lang="less">
  .main-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 24px;
    background: #fff;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);

    .toolbar-left,
    .toolbar-right {
      flex: 1;
      display: flex;
      align-items: center;
    }
    .toolbar-right {
      justify-content: flex-end;
    }

    .toolbar-center {
      flex: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;

      .nav-btn {
        width: 40px;
        height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: #165dff;
        background-color: #f2f3f5;
        transition: all 0.3s;
        cursor: pointer;
        border: none;

        &:hover {
          background-color: #e8f3ff;
          transform: scale(1.15);
        }

        :deep(.arco-icon) {
          font-size: 24px;
        }
      }

      .toolbar-week-range,
      .toolbar-month-title {
        font-size: 20px;
        font-weight: 800;
        color: #1d2129;
        min-width: 250px;
        text-align: center;
        letter-spacing: -0.5px;
      }
    }
  }
</style>
