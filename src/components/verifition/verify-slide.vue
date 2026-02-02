<template>
  <div style="position: relative">
    <div
      v-if="type === '2'"
      class="verify-img-out"
      :style="{ height: `${setSize.imgHeight + vSpace}px` }"
    >
      <div
        class="verify-img-panel"
        :style="{
          width: `${setSize.imgWidth}px`,
          height: `${setSize.imgHeight}px`,
        }"
      >
        <img
          :src="'data:image/png;base64,' + backImgBase"
          alt=""
          style="display: block; width: 100%; height: 100%"
        />
        <div v-show="showRefresh" class="verify-refresh" @click="refresh">
          <icon-refresh />
        </div>
        <transition name="tips">
          <span
            v-if="tipWords"
            class="verify-tips"
            :class="passFlag ? 'suc-bg' : 'err-bg'"
            >{{ tipWords }}</span
          >
        </transition>
      </div>
    </div>
    <!-- 公共部分 -->
    <div
      class="verify-bar-area"
      :style="{
        width: `${setSize.imgWidth}px`,
        height: barSize.height,
        lineHeight: barSize.height,
      }"
    >
      <span class="verify-msg">{{ text }}</span>
      <div
        class="verify-left-bar"
        :style="{
          width: leftBarWidth ?? barSize.height,
          height: barSize.height,
          borderColor: leftBarBorderColor,
          transition: transitionWidth,
        }"
      >
        <span class="verify-msg">{{ finishText }}</span>
        <div
          class="verify-move-block"
          :style="{
            width: barSize.height,
            height: barSize.height,
            backgroundColor: moveBlockBackgroundColor,
            left: moveBlockLeft,
            transition: transitionLeft,
          }"
          @touchstart="start"
          @mousedown="start"
        >
          <icon-right
            v-if="iconClass === 'icon-right'"
            :style="{ color: iconColor }"
          />
          <icon-check
            v-if="iconClass === 'icon-check'"
            :style="{ color: iconColor }"
          />
          <icon-close
            v-if="iconClass === 'icon-close'"
            :style="{ color: iconColor }"
          />
          <div
            v-if="type === '2'"
            class="verify-sub-block"
            :style="{
              width: Math.floor((setSize.imgWidth * 47) / 310) + 'px',
              height: `${setSize.imgHeight}px`,
              top: `-${setSize.imgHeight + vSpace}px`,
              backgroundSize: `${setSize.imgWidth}px ${setSize.imgHeight}px`,
            }"
          >
            <img
              :src="'data:image/png;base64,' + blockBackImgBase"
              alt=""
              style="display: block; height: 100%; -webkit-user-drag: none"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import {
    computed,
    onMounted,
    reactive,
    ref,
    watch,
    nextTick,
    toRefs,
    getCurrentInstance,
  } from 'vue';
  import { getCaptcha, checkCaptcha } from '@/api/verify';
  import aesEncrypt from './utils/ase';
  import { resetSize } from './utils/util';

  //  "captchaType":"blockPuzzle",
  export default {
    name: 'VerifySlide',
    props: {
      type: {
        type: String,
        default: '1',
      },
      // 弹出式pop，固定fixed
      mode: {
        type: String,
        default: 'fixed',
      },
      vSpace: {
        type: Number,
        default: 5,
      },
      explain: {
        type: String,
        default: '向右滑动完成验证',
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
        default() {
          return {
            width: '50px',
            height: '60px',
          };
        },
      },
      barSize: {
        type: Object,
        default() {
          return {
            width: '310px',
            height: '40px',
          };
        },
      },
    },
    setup(props) {
      const { mode, type, blockSize, explain } = toRefs(props);
      const captchaType = ref<'blockPuzzle'>('blockPuzzle');
      const { proxy } = getCurrentInstance() as any;
      const secretKey = ref(''); // 后端返回的ase加密秘钥
      const passFlag = ref(false); // 是否通过的标识
      const backImgBase = ref(''); // 验证码背景图片
      const blockBackImgBase = ref(''); // 验证滑块的背景图片
      const backToken = ref(''); // 后端返回的唯一token值
      const startMoveTime = ref(0); // 移动开始的时间
      const endMovetime = ref(0); // 移动结束的时间
      const tipsBackColor = ref(''); // 提示词的背景颜色
      const tipWords = ref('');
      const text = ref('');
      const finishText = ref('');
      const setSize = reactive<{
        imgHeight: number;
        imgWidth: number;
        barHeight: number;
        barWidth: number;
      }>({
        imgHeight: 0,
        imgWidth: 0,
        barHeight: 0,
        barWidth: 0,
      });
      const top = ref(0);
      const left = ref(0);
      const moveBlockLeft = ref<string>();
      const leftBarWidth = ref<string>();
      // 移动中样式
      const moveBlockBackgroundColor = ref<string>();
      const leftBarBorderColor = ref('#ddd');
      const iconColor = ref<string>();
      const iconClass = ref('icon-right');
      const status = ref(false); // 鼠标状态
      const isEnd = ref(false); // 是够验证完成
      const showRefresh = ref(true);
      const transitionLeft = ref('');
      const transitionWidth = ref('');
      const startLeft = ref(0);

      const barArea = computed(() => {
        return proxy.$el.querySelector('.verify-bar-area');
      });
      const init = () => {
        text.value = explain.value;
        getPictrue();
        nextTick(() => {
          const { imgHeight, imgWidth, barHeight, barWidth } = resetSize(proxy);
          setSize.imgHeight = imgHeight;
          setSize.imgWidth = imgWidth;
          setSize.barHeight = barHeight;
          setSize.barWidth = barWidth;
          proxy.$parent.$emit('ready', proxy);
        });

        window.removeEventListener('touchmove', move);
        window.removeEventListener('mousemove', move);

        // 鼠标松开
        window.removeEventListener('touchend', end);
        window.removeEventListener('mouseup', end);

        window.addEventListener('touchmove', move);
        window.addEventListener('mousemove', move);

        // 鼠标松开
        window.addEventListener('touchend', end);
        window.addEventListener('mouseup', end);
      };
      watch(type, () => {
        init();
      });
      onMounted(() => {
        // 禁止拖拽
        init();
        proxy.$el.onselectstart = () => false;
      });
      // 鼠标按下
      const start = (e: MouseEvent | TouchEvent) => {
        e = e || window.event;
        let x = 0;
        if (!(e as TouchEvent).touches) {
          // 兼容PC端
          x = (e as MouseEvent).clientX;
        } else {
          // 兼容移动端
          x = (e as TouchEvent).touches[0].pageX;
        }
        startLeft.value = Math.floor(
          x - barArea.value.getBoundingClientRect().left
        );
        startMoveTime.value = +new Date(); // 开始滑动的时间
        if (isEnd.value === false) {
          text.value = '';
          // moveBlockBackgroundColor.value = '#337ab7';
          moveBlockBackgroundColor.value = 'rgb(var(--primary-6))';
          leftBarBorderColor.value = '#337AB7';
          iconColor.value = '#fff';
          e.stopPropagation();
          status.value = true;
        }
      };
      // 鼠标移动
      const move = (e: TouchEvent | MouseEvent) => {
        e = e || window.event;
        let x = 0;
        if (status.value && isEnd.value === false) {
          if (!(e as TouchEvent).touches) {
            // 兼容PC端
            x = (e as MouseEvent).clientX;
          } else {
            // 兼容移动端
            x = (e as TouchEvent).touches[0].pageX;
          }
          const barAreaLeft = barArea.value.getBoundingClientRect().left;
          let mbl = x - barAreaLeft; // 小方块相对于父元素的left值
          const bsw = Number(blockSize.value.width.replace('px', ''));
          if (mbl >= barArea.value.offsetWidth - bsw / 2 - 2) {
            mbl = barArea.value.offsetWidth - bsw / 2 - 2;
          }
          if (mbl <= 0) {
            mbl = bsw / 2;
          }
          // 拖动后小方块的left值
          moveBlockLeft.value = `${mbl - startLeft.value}px`;
          leftBarWidth.value = `${mbl - startLeft.value}px`;
        }
      };

      // 鼠标松开
      const end = async () => {
        endMovetime.value = +new Date();
        // 判断是否重合
        if (status.value && isEnd.value === false) {
          let moveLeftDistance = parseInt(
            (moveBlockLeft.value || '').replace('px', ''),
            10
          );
          const imgW = parseInt(
            (setSize.imgWidth.toString() || '').replace('px', ''),
            10
          );
          moveLeftDistance = (moveLeftDistance * 310) / imgW;
          const req = {
            captchaType: captchaType.value,
            pointJson: secretKey.value
              ? aesEncrypt(
                  JSON.stringify({ x: moveLeftDistance, y: 5.0 }),
                  secretKey.value
                )
              : JSON.stringify({ x: moveLeftDistance, y: 5.0 }),
            token: backToken.value,
          };
          try {
            await checkCaptcha(req);
            moveBlockBackgroundColor.value = '#5cb85c';
            leftBarBorderColor.value = '#5cb85c';
            iconColor.value = '#fff';
            iconClass.value = 'icon-check';
            showRefresh.value = false;
            isEnd.value = true;
            if (mode.value === 'pop') {
              setTimeout(() => {
                proxy.$parent.clickShow = false;
                refresh();
              }, 1500);
            }
            passFlag.value = true;
            tipWords.value = `${(
              (endMovetime.value - startMoveTime.value) /
              1000
            ).toFixed(2)}s验证成功`;
            const captchaVerification = secretKey.value
              ? aesEncrypt(
                  `${backToken.value}---${JSON.stringify({
                    x: moveLeftDistance,
                    y: 5.0,
                  })}`,
                  secretKey.value
                )
              : `${backToken.value}---${JSON.stringify({
                  x: moveLeftDistance,
                  y: 5.0,
                })}`;
            setTimeout(() => {
              tipWords.value = '';
              // proxy.$parent.closeBox();
              proxy.$parent.$emit('success', captchaVerification);
            }, 1000);
          } catch {
            moveBlockBackgroundColor.value = '#d9534f';
            leftBarBorderColor.value = '#d9534f';
            iconColor.value = '#fff';
            iconClass.value = 'icon-close';
            passFlag.value = false;
            setTimeout(() => {
              refresh();
            }, 1000);
            proxy.$parent.$emit('error', proxy);
            tipWords.value = '验证失败';
            setTimeout(() => {
              tipWords.value = '';
            }, 1000);
          } finally {
            status.value = false;
          }
        }
      };

      const refresh = () => {
        showRefresh.value = true;
        finishText.value = '';

        transitionLeft.value = 'left .3s';
        moveBlockLeft.value = '0';

        leftBarWidth.value = undefined;
        transitionWidth.value = 'width .3s';

        leftBarBorderColor.value = '#ddd';
        moveBlockBackgroundColor.value = '#fff';
        iconColor.value = '#000';
        iconClass.value = 'icon-right';
        isEnd.value = false;

        getPictrue();
        setTimeout(() => {
          transitionWidth.value = '';
          transitionLeft.value = '';
          text.value = explain.value;
        }, 300);
      };

      // 请求背景图片和验证图片
      const getPictrue = async () => {
        const { data } = await getCaptcha({ captchaType: captchaType.value });
        if (data.repCode === '0000') {
          backImgBase.value = data.repData.originalImageBase64;
          blockBackImgBase.value = data.repData.jigsawImageBase64;
          backToken.value = data.repData.token;
          secretKey.value = data.repData.secretKey;
        } else {
          tipWords.value = data.repMsg;
        }
      };
      return {
        secretKey, // 后端返回的ase加密秘钥
        passFlag, // 是否通过的标识
        backImgBase, // 验证码背景图片
        blockBackImgBase, // 验证滑块的背景图片
        backToken, // 后端返回的唯一token值
        startMoveTime, // 移动开始的时间
        endMovetime, // 移动结束的时间
        tipsBackColor, // 提示词的背景颜色
        tipWords,
        text,
        finishText,
        setSize,
        top,
        left,
        moveBlockLeft,
        leftBarWidth,
        // 移动中样式
        moveBlockBackgroundColor,
        leftBarBorderColor,
        iconColor,
        iconClass,
        status, // 鼠标状态
        isEnd, // 是够验证完成
        showRefresh,
        transitionLeft,
        transitionWidth,
        barArea,
        refresh,
        start,
      };
    },
  };
</script>
