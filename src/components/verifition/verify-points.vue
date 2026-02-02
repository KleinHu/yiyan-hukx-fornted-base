<template>
  <div style="position: relative">
    <div class="verify-img-out">
      <div
        class="verify-img-panel"
        :style="{
          width: `${setSize.imgWidth}px`,
          height: `${setSize.imgHeight}px`,
          backgroundSize: `${setSize.imgWidth}px ${setSize.imgHeight}px`,
          marginBottom: `${vSpace}px`,
        }"
      >
        <div
          v-show="showRefresh"
          style="z-index: 3"
          class="verify-refresh"
          @click="refresh"
        >
          <icon-refresh />
        </div>
        <img
          ref="canvas"
          :src="'data:image/png;base64,' + pointBackImgBase"
          alt=""
          style="display: block; width: 100%; height: 100%"
          @click="bindingClick ? canvasClick($event) : undefined"
        />

        <div
          v-for="(tempPoint, index) in tempPoints"
          :key="index"
          class="point-area"
          :style="{
            backgroundColor: '#1abd6c',
            color: '#fff',
            zIndex: 9999,
            width: '20px',
            height: '20px',
            textAlign: 'center',
            lineHeight: '20px',
            borderRadius: '50%',
            position: 'absolute',
            top: tempPoint.y - 10 + 'px',
            left: tempPoint.x - 10 + 'px',
          }"
        >
          {{ index + 1 }}
        </div>
      </div>
    </div>
    <div
      class="verify-bar-area"
      :style="{
        width: `${setSize.imgWidth}px`,
        color: barAreaColor,
        borderColor: barAreaBorderColor,
        lineHeight: barSize.height,
      }"
    >
      <span class="verify-msg">{{ text }}</span>
    </div>
  </div>
</template>

<script lang="ts">
  import {
    onMounted,
    reactive,
    ref,
    nextTick,
    toRefs,
    getCurrentInstance,
  } from 'vue';
  import { getCaptcha, checkCaptcha } from '@/api/verify';
  import { resetSize } from './utils/util';
  import aesEncrypt from './utils/ase';

  export default {
    name: 'VerifyPoints',
    props: {
      // 弹出式pop，固定fixed
      mode: {
        type: String,
        default: 'fixed',
      },
      // 间隔
      vSpace: {
        type: Number,
        default: 5,
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
      const { mode } = toRefs(props);
      const captchaType = ref<'clickWord'>('clickWord');
      const { proxy } = getCurrentInstance() as any;
      const secretKey = ref(''); // 后端返回的ase加密秘钥
      const checkNum = ref(3); // 默认需要点击的字数
      const fontPos = reactive([]); // 选中的坐标信息
      const checkPosArr = reactive<{ x: number; y: number }[]>([]); // 用户点击的坐标
      const num = ref(1); // 点击的记数
      const pointBackImgBase = ref(''); // 后端获取到的背景图片
      const poinTextList = ref<any[]>([]); // 后端返回的点击字体顺序
      const backToken = ref(''); // 后端返回的token值
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
      const tempPoints = reactive<{ x: number; y: number }[]>([]);
      const text = ref('');
      const barAreaColor = ref<string>();
      const barAreaBorderColor = ref<string>();
      const showRefresh = ref(true);
      const bindingClick = ref(true);

      const init = () => {
        // 加载页面
        fontPos.splice(0, fontPos.length);
        checkPosArr.splice(0, checkPosArr.length);
        num.value = 1;
        getPictrue();
        nextTick(() => {
          const { imgHeight, imgWidth, barHeight, barWidth } = resetSize(proxy);
          setSize.imgHeight = imgHeight;
          setSize.imgWidth = imgWidth;
          setSize.barHeight = barHeight;
          setSize.barWidth = barWidth;
          proxy.$parent.$emit('ready', proxy);
        });
      };
      onMounted(() => {
        // 禁止拖拽
        init();
        proxy.$el.onselectstart = () => false;
      });
      const canvas = ref(null);
      const canvasClick = (e: MouseEvent) => {
        checkPosArr.push(getMousePos(canvas, e));
        if (num.value === checkNum.value) {
          num.value = createPoint(getMousePos(canvas, e));
          // 按比例转换坐标值
          const arr = pointTransfrom(checkPosArr, setSize);
          checkPosArr.length = 0;
          checkPosArr.push(...arr);
          // 等创建坐标执行完
          setTimeout(async () => {
            // var flag = this.comparePos(this.fontPos, this.checkPosArr);
            // 发送后端请求
            const captchaVerification = secretKey.value
              ? aesEncrypt(
                  `${backToken.value}---${JSON.stringify(checkPosArr)}${
                    secretKey.value
                  }`
                )
              : `${backToken.value}---${JSON.stringify(checkPosArr)}`;
            const req = {
              captchaType: captchaType.value,
              pointJson: secretKey.value
                ? aesEncrypt(JSON.stringify(checkPosArr), secretKey.value)
                : JSON.stringify(checkPosArr),
              token: backToken.value,
            };
            try {
              await checkCaptcha(req);
              barAreaColor.value = '#4cae4c';
              barAreaBorderColor.value = '#5cb85c';
              text.value = '验证成功';
              bindingClick.value = false;
              if (mode.value === 'pop') {
                setTimeout(() => {
                  proxy.$parent.clickShow = false;
                  refresh();
                }, 1500);
              }
              proxy.$parent.$emit('success', captchaVerification);
            } catch {
              proxy.$parent.$emit('error', proxy);
              barAreaColor.value = '#d9534f';
              barAreaBorderColor.value = '#d9534f';
              text.value = '验证失败';
              setTimeout(() => {
                refresh();
              }, 700);
            }
          }, 400);
        }
        if (num.value < checkNum.value) {
          num.value = createPoint(getMousePos(canvas, e));
        }
      };
      // 获取坐标
      const getMousePos = (obj: any, e: MouseEvent) => {
        const x = e.offsetX;
        const y = e.offsetY;
        return { x, y };
      };
      // 创建坐标点
      const createPoint = (pos: { x: number; y: number }) => {
        tempPoints.push({ ...pos });
        return num.value + 1;
      };
      const refresh = () => {
        tempPoints.splice(0, tempPoints.length);
        barAreaColor.value = '#000';
        barAreaBorderColor.value = '#ddd';
        bindingClick.value = true;
        fontPos.splice(0, fontPos.length);
        checkPosArr.splice(0, checkPosArr.length);
        num.value = 1;
        getPictrue();
        text.value = '验证失败';
        showRefresh.value = true;
      };

      // 请求背景图片和验证图片
      const getPictrue = async () => {
        const { data } = await getCaptcha({ captchaType: captchaType.value });
        if (data.repCode === '0000') {
          pointBackImgBase.value = data.repData.originalImageBase64;
          backToken.value = data.repData.token;
          secretKey.value = data.repData.secretKey;
          poinTextList.value = data.repData.wordList;
          text.value = `请依次点击【${poinTextList.value.join(',')}】`;
        } else {
          text.value = data.repMsg;
        }
      };
      // 坐标转换函数
      const pointTransfrom = (pointArr: any[], imgSize: any) => {
        const newPointArr = pointArr.map((p) => {
          const x = Math.round((310 * p.x) / parseInt(imgSize.imgWidth, 10));
          const y = Math.round((155 * p.y) / parseInt(imgSize.imgHeight, 10));
          return { x, y };
        });
        return newPointArr;
      };
      return {
        secretKey,
        checkNum,
        fontPos,
        checkPosArr,
        num,
        pointBackImgBase,
        poinTextList,
        backToken,
        setSize,
        tempPoints,
        text,
        barAreaColor,
        barAreaBorderColor,
        showRefresh,
        bindingClick,
        init,
        canvas,
        canvasClick,
        getMousePos,
        createPoint,
        refresh,
        getPictrue,
        pointTransfrom,
      };
    },
  };
</script>
