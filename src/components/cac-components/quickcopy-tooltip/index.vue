<!-- 一键复制组件 -->
<!--created by lzb-->
<!--updated by ljx-->
<!--2022/05/05-->
<!-- 增加showColorText、textColor配置 -->
<!--upated by yuyupeng-->
<!--2023/02/20-->
<!-- 迁移到易研项目中，适配Arco Design、Vue3和TypeScript-->
<template>
  <a-tooltip :position="position as any">
    <template #content>
      <span class="tooltip-text">{{ showText }}</span>
      <a-link v-if="showBtn" style="margin-left: 5px" @click="copy">
        <template #icon>
          <icon-copy />
        </template>
        一键复制
      </a-link>
    </template>
    <template v-if="showTag">
      <a-tag :color="tagColor">
        {{ showText }}
      </a-tag>
    </template>
    <template v-else-if="showColorText">
      <span :style="{ color: textColor }">
        {{ showText }}
      </span>
    </template>
    <template v-else>
      <span>{{ showText }}</span>
    </template>
  </a-tooltip>
</template>

<!--新script-->
<script lang="ts" setup>
  import { toRefs } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import useClipboard from 'vue-clipboard3';

  const props = defineProps({
    showText: {
      type: [Number, String, Object],
      default: '',
    },
    showBtn: {
      type: Boolean,
      default: false,
    },
    showTag: {
      type: Boolean,
      default: false,
    },
    showColorText: {
      type: Boolean,
      default: false,
    },
    textColor: {
      type: String,
      default: 'black',
    },
    tagColor: {
      type: String,
      default: 'pink',
    },
    position: {
      type: String,
      default: 'top',
    },
  });
  /**
   * data
   */
  const {
    showText,
    showBtn,
    showTag,
    showColorText,
    textColor,
    tagColor,
    position,
  } = toRefs(props); // 根据props创建多个 ref 对象
  const { toClipboard } = useClipboard();
  /**
   * func
   */
  /**
   * @method
   * @description 复制到剪切板
   */
  const copy = async () => {
    try {
      await toClipboard(showText?.value as string);
      Message.success('复制成功');
    } catch (e) {
      Message.error('复制失败');
    }
  };
</script>

<style>
  .tooltip-text {
    cursor: pointer;
  }
</style>
