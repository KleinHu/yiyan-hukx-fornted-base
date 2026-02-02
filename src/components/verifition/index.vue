<template>
  <div v-show="showBox" :class="mode === 'pop' ? 'mask' : ''">
    <a-link @click="goBack">
      <icon-left />
      返回
    </a-link>
    <div
      :class="mode === 'pop' ? 'verifybox' : ''"
      :style="{ 'max-width': parseInt(imgSize.width) + 30 + 'px' }"
    >
      <div v-if="mode === 'pop'" class="verifybox-top">
        请完成安全验证
        <span class="verifybox-close" @click="closeBox">
          <icon-close />
        </span>
      </div>
      <div
        class="verifybox-bottom"
        :style="{ padding: mode === 'pop' ? '15px' : '0' }"
      >
        <!-- 验证码容器 -->
        <VerifySlide
          v-if="componentType === 'VerifySlide'"
          ref="instance"
          :type="verifyType"
          :figure="figure"
          :arith="arith"
          :mode="mode"
          :v-space="vSpace"
          :explain="explain"
          :img-size="imgSize"
          :block-size="blockSize"
          :bar-size="barSize"
        />
        <VerifyPoints
          v-if="componentType === 'VerifyPoints'"
          ref="instance"
          :type="verifyType"
          :figure="figure"
          :arith="arith"
          :mode="mode"
          :v-space="vSpace"
          :img-size="imgSize"
          :bar-size="barSize"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, toRefs, watchEffect } from 'vue';
  import VerifySlide from './verify-slide.vue';
  import VerifyPoints from './verify-points.vue';

  const props = defineProps({
    captchaType: {
      type: String,
      required: true,
    },
    figure: {
      type: Number,
    },
    arith: {
      type: Number,
    },
    mode: {
      type: String,
      default: 'pop',
    },
    vSpace: {
      type: Number,
    },
    explain: {
      type: String,
    },
    imgSize: {
      type: Object,
      default() {
        return {
          width: '310px',
          height: '155px',
        };
      },
    },
    blockSize: {
      type: Object,
    },
    barSize: {
      type: Object,
    },
  });
  const emits = defineEmits(['back']);
  const { captchaType, mode } = toRefs(props);
  const clickShow = ref(false);
  const verifyType = ref('');
  const componentType = ref('');

  const instance = ref();

  const showBox = computed(() => {
    if (mode.value === 'pop') {
      return clickShow.value;
    }
    return true;
  });
  /**
   * refresh
   * @description 刷新
   * */
  const refresh = () => {
    if (instance.value.refresh) {
      instance.value.refresh();
    }
  };
  const closeBox = () => {
    clickShow.value = false;
    refresh();
  };
  const show = () => {
    if (mode.value === 'pop') {
      clickShow.value = true;
    }
  };
  const goBack = () => {
    emits('back');
  };
  watchEffect(() => {
    switch (captchaType.value) {
      case 'blockPuzzle':
        verifyType.value = '2';
        componentType.value = 'VerifySlide';
        break;
      case 'clickWord':
        verifyType.value = '';
        componentType.value = 'VerifyPoints';
        break;
      default:
        break;
    }
  });
  defineExpose({ show });
</script>

<style>
  .verifybox {
    position: relative;
    top: 50%;
    left: 50%;
    box-sizing: border-box;
    background-color: #fff;
    border: 1px solid #e4e7eb;
    border-radius: 2px;
    box-shadow: 0 0 10px rgb(0 0 0 / 30%);
    transform: translate(-50%, -50%);
  }

  .verifybox-top {
    box-sizing: border-box;
    height: 50px;
    padding: 0 15px;
    color: #45494c;
    font-size: 16px;
    line-height: 50px;
    text-align: left;
    border-bottom: 1px solid #e4e7eb;
  }

  .verifybox-bottom {
    box-sizing: border-box;
    padding: 15px;
  }

  .verifybox-close {
    position: absolute;
    top: 13px;
    right: 9px;
    width: 24px;
    height: 24px;
    text-align: center;
    cursor: pointer;
  }

  .mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1001;
    width: 100%;
    height: 100vh;
    background: rgb(0 0 0 / 30%);

    /* display: none; */
    transition: all 0.5s;
  }

  .verify-tips {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30px;
    color: #fff;
    line-height: 30px;
  }

  .suc-bg {
    background-color: rgb(92 184 92 / 50%);
  }

  .err-bg {
    background-color: rgb(217 83 79 / 50%);
  }

  .tips-enter,
  .tips-leave-to {
    bottom: -30px;
  }

  .tips-enter-active,
  .tips-leave-active {
    transition: bottom 0.5s;
  }

  /* ---------------------------- */

  /* 常规验证码 */
  .verify-code {
    margin-bottom: 5px;
    font-size: 20px;
    text-align: center;
    border: 1px solid #ddd;
    cursor: pointer;
  }

  .cerify-code-panel {
    height: 100%;
    overflow: hidden;
  }

  .verify-code-area {
    float: left;
  }

  .verify-input-area {
    float: left;
    width: 60%;
    padding-right: 10px;
  }

  .verify-change-area {
    float: left;
    line-height: 30px;
  }

  .varify-input-code {
    display: inline-block;
    width: 100%;
    height: 25px;
  }

  .verify-change-code {
    color: #337ab7;
    cursor: pointer;
  }

  .verify-btn {
    width: 200px;
    height: 30px;
    margin-top: 10px;
    color: #fff;
    background-color: #337ab7;
    border: none;
  }

  /* 滑动验证码 */
  .verify-bar-area {
    position: relative;
    box-sizing: content-box;
    text-align: center;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  .verify-bar-area .verify-move-block {
    position: absolute;
    top: 0;
    left: 0;
    box-sizing: content-box;
    background: #fff;
    border-radius: 1px;
    box-shadow: 0 0 2px #888;
    cursor: pointer;
  }

  .verify-bar-area .verify-move-block:hover {
    color: #fff;
    background-color: rgb(var(--primary-6));
  }

  .verify-bar-area .verify-left-bar {
    position: absolute;
    top: -1px;
    left: -1px;
    box-sizing: content-box;
    background: #f0fff0;
    border: 1px solid #ddd;
    cursor: pointer;
  }

  .verify-img-panel {
    position: relative;
    box-sizing: content-box;
    margin: 0;
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    border-radius: 3px;
  }

  .verify-img-panel .verify-refresh {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    width: 25px;
    height: 25px;
    padding: 5px;
    text-align: center;
    cursor: pointer;
  }

  .verify-img-panel .icon-refresh {
    color: #fff;
    font-size: 20px;
  }

  .verify-img-panel .verify-gap {
    position: relative;
    z-index: 2;
    background-color: #fff;
    border: 1px solid #fff;
  }

  .verify-bar-area .verify-move-block .verify-sub-block {
    position: absolute;
    z-index: 3;
    text-align: center;

    /* border: 1px solid #fff; */
  }

  .verify-bar-area .verify-move-block .verify-icon {
    font-size: 18px;
  }

  .verify-bar-area .verify-msg {
    z-index: 3;
  }
</style>
