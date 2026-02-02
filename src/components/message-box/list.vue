<template>
  <template v-for="item in renderList" :key="item.id">
    <list-item :item-object="item" @click="() => onItemClick(item)" />
  </template>
</template>

<script lang="ts" setup>
  import { PropType, toRefs } from 'vue';
  import ListItem from '@/components/message-box/list-item.vue';

  const props = defineProps({
    renderList: {
      type: Array as PropType<any[]>,
      required: true,
    },
  });
  const emits = defineEmits(['itemClick']);
  const { renderList } = toRefs(props); // 根据props创建多个 ref 对象
  const onItemClick = (item: any) => {
    emits('itemClick', item);
  };
</script>

<style scoped lang="less">
  .title-style {
    width: 90%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 16px;
    font-weight: bold;
  }
</style>
