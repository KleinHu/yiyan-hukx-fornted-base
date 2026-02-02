<!--组件：流程实例中的表单-->
<template>
  <div>
    <iframe
      v-if="formId && formUrl.indexOf('http') > -1"
      ref="frameRef"
      :src="frameUrl"
      frameborder="0"
      scrolling="auto"
      class="frame-container"
      @load="handleLoad"
    />
    <div v-else style="height: 100%; margin: 60px auto">
      <a-empty />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useUserStore } from '@/store';
  import { FormParam } from '@/api/form/model/formPcModel';
  import { getToken, isLogin } from '@/utils/auth';
  import { getFormPcById } from '@/api/form/form-pc';

  const props = defineProps({
    formId: { type: String },
    defId: { type: String },
    instId: { type: String },
    taskId: { type: String },
    nodeId: { type: String },
  });
  const userStore = useUserStore();

  const frameRef = ref();

  // 记录表单本身的url（不含参数）
  const formUrl = ref('');
  // 计算传给iframe加载表单用的url
  const frameUrl = computed(() => {
    let result = formUrl.value;
    if (isLogin()) {
      result = joinParam(result, 'authorization', getToken() as string);
    }
    frameParams.value.forEach((param) => {
      result = joinParam(result, param.paramKey, param.paramKeyVal);
    });
    return result;
  });

  const joinParam = (url: string, key: string, value?: string) => {
    if (!value) {
      // 传空值不拼
      return url;
    }
    if (url.indexOf('?') > -1) {
      // 已经拼接了一个及以上的参数，后面的参数用&进行拼接
      return `${url}&${key}=${value}`;
    }
    // 这是拼接的第一个参数，用?进行连接
    return `${url}?${key}=${value}`;
  };

  // 存储要传递给外部表单的参数数组
  const frameParams = ref<FormParam[]>([]);
  // 设置将要传给（外部）表单的参数
  const setFrameUrl = (paramsStr: string) => {
    const contextObj: any = {
      userId: userStore.id,
      defId: props.defId,
      instId: props.instId,
      taskId: props.taskId,
      nodeId: props.nodeId,
    };
    try {
      const paramsConfig: FormParam[] = JSON.parse(paramsStr);
      frameParams.value = paramsConfig.map((config) => {
        const result = {
          ...config,
        };
        if (config.paramType) {
          result.paramKeyVal = contextObj[config.paramKeyVal];
        }
        return result;
      });
    } catch {
      // epmty;
    }
  };

  // 加载流程表单的详情
  const loadForm = async (id?: string) => {
    if (id) {
      const { data } = await getFormPcById(id);
      if (data.data.component !== '') {
        formUrl.value = data.data.component;
        setFrameUrl(data.data.urlParams);
      }
    }
  };

  watch(
    () => props.formId,
    (val) => {
      loadForm(val);
    }
  );

  // 等待iframe返回消息的计数器
  const TIME_OUT_MAX = 50;

  const validResult = ref();
  const formResult = ref();
  const waitingMsg = ref(false);
  const valid = async () => {
    return new Promise((resolve) => {
      try {
        validResult.value = frameRef.value.contentWindow.valid();
        resolve(validResult.value);
      } catch {
        frameRef.value.contentWindow.postMessage('valid', '*');
        let counter = 0;
        waitingMsg.value = true;
        const timer = setInterval(() => {
          counter += 1;
          if (!waitingMsg.value || validResult.value) {
            // 已收到消息或上次超时后收到的消息
            resolve(validResult.value);
          } else if (counter > TIME_OUT_MAX) {
            // 最多计数TIME_OUT次，没能成功返回值
            resolve({ success: false, msg: '超时，请重试' });
            clearInterval(timer);
          }
        }, 100);
        // setTimeout(() => {
        //   resolve(validResult.value);
        // }, 100);
      }
    });
  };
  const getData = async () => {
    return new Promise((resolve) => {
      try {
        formResult.value = frameRef.value.contentWindow.getData();
        resolve(formResult.value);
      } catch {
        frameRef.value.contentWindow.postMessage('getData', '*');
        let counter = 0;
        waitingMsg.value = true;
        const timer = setInterval(() => {
          counter += 1;
          if (!waitingMsg.value || formResult.value) {
            // 已收到消息或上次超时后收到的消息
            resolve(formResult.value);
          } else if (counter > TIME_OUT_MAX) {
            // 最多计数TIME_OUT次，没能成功返回值
            resolve({ success: false, msg: '超时，请重试' });
            clearInterval(timer);
          }
        }, 100);
        // setTimeout(() => {
        //   resolve(formResult.value);
        // }, 100);
      }
    });
  };
  defineExpose({ getData, valid });

  const msgHandler = (event: any) => {
    waitingMsg.value = false;
    if (event.data.action === 'valid') {
      validResult.value = event.data.res;
    }
    if (event.data.action === 'getData') {
      formResult.value = event.data.res;
    }
  };
  window.addEventListener('message', msgHandler);

  const emits = defineEmits(['load']);
  const handleLoad = () => {
    emits('load');
  };
</script>

<style scoped lang="less">
  .frame-container {
    width: 100%;
    height: calc(100vh - 60px);
    margin-top: 60px;
  }
</style>
