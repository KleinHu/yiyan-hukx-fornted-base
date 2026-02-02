<!-- 消息项 -->
<!--created by yuyupeng 2024/5/9-->
<template>
  <div v-if="itemObject" style="cursor: pointer; margin: 10px">
    <div style="height: 60px" @click="() => onItemClick(itemObject)">
      <a-row style="margin-top: 5px">
        <div class="title-style">
          {{ itemObject.title }}
        </div>
      </a-row>
      <a-row>
        <a-space>
          <div style="color: #999999; margin-top: 5px">2024-1-29 11:26:14</div>
          <div style="color: #8c49f6; margin-top: 5px">
            <a-tag color="cyan" size="small">{{ itemObject.systemName }}</a-tag>
          </div>
        </a-space>
      </a-row>
    </div>
    <a-row>
      <div
        :style="{
          width: '100%',
          height: '0px',
          borderTop: '1px #e5e6eb dashed',
          marginTop: '5px',
          marginBottom: '5px',
        }"
      />
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { toRefs } from 'vue';

  const props = defineProps({
    itemObject: {
      type: Object,
      required: true,
    },
  });
  const emits = defineEmits(['itemClick']);
  /**
   * data
   */
  const { itemObject } = toRefs(props); // 根据props创建多个 ref 对象
  const onItemClick = (item: any) => {
    emits('itemClick', item);
  };
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .title-style {
    width: 90%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
    font-weight: bold;
  }

  .content-style {
    margin-top: 5px;
    width: 90%;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    font-size: 14px;
  }
</style>
