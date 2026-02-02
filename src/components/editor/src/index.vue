<!-- 组件wangeditor -->
<!-- 使用方式 <Editor v-model="text" /> -->
<template>
  <div
    class="border-1 border-solid border-[var(--tags-view-border-color)] z-10"
  >
    <!-- 工具栏 -->
    <Toolbar
      :editor="editorRef"
      :editor-id="editorId"
      class="border-0 b-b-1 border-solid border-[var(--tags-view-border-color)]"
    />
    <!-- 编辑器 -->
    <Editor
      v-model="valueHtml"
      :default-config="editorConfig"
      :editor-id="editorId"
      :style="editorStyle"
      @on-change="handleChange"
      @on-created="handleCreated"
    />
  </div>
</template>

<script lang="ts" setup>
  import {
    PropType,
    unref,
    computed,
    shallowRef,
    ref,
    onBeforeUnmount,
    watch,
    nextTick,
  } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
  import {
    i18nChangeLanguage,
    IDomEditor,
    IEditorConfig,
  } from '@wangeditor/editor';
  import { isNumber } from '@/utils/is';
  import { getToken } from '@/utils/auth';

  defineOptions({ name: 'Editor' });

  type InsertFnType = (url: string, alt: string, href: string) => void;

  i18nChangeLanguage('zh-CN');

  const props = defineProps({
    editorId: { type: String, default: 'wangeEditor-1' },
    height: { type: [String, Number], default: '500px' },
    editorConfig: {
      type: Object as PropType<Partial<IEditorConfig>>,
      default: () => undefined,
    },
    readonly: { type: Boolean, default: false },
    modelValue: { type: String, default: '' },
  });

  const emit = defineEmits(['change', 'update:modelValue']);

  // 编辑器实例，必须用 shallowRef
  const editorRef = shallowRef<IDomEditor>();

  const valueHtml = ref('');

  watch(
    () => props.modelValue,
    (val: string) => {
      if (val === unref(valueHtml)) return;
      valueHtml.value = val;
    },
    {
      immediate: true,
    }
  );

  // 监听
  watch(
    () => valueHtml.value,
    (val: string) => {
      emit('update:modelValue', val);
    }
  );

  const handleCreated = (editor: IDomEditor) => {
    editorRef.value = editor;
  };

  // 编辑器配置
  const editorConfig = computed((): IEditorConfig => {
    return {
      ...props,
      placeholder: '请输入内容...',
      readOnly: props.readonly,
      // uploadImgShowBase64: true,
      customAlert: (s: string, t: string) => {
        switch (t) {
          case 'success':
            Message.success(s);
            break;
          case 'info':
            Message.info(s);
            break;
          case 'warning':
            Message.warning(s);
            break;
          case 'error':
            Message.error(s);
            break;
          default:
            Message.info(s);
            break;
        }
      },
      autoFocus: false,
      scroll: true,
      MENU_CONF: {
        // eslint-disable-next-line no-useless-computed-key
        ['uploadImage']: {
          server: import.meta.env.VITE_UPLOAD_URL,
          // 单个文件的最大体积限制，默认为 2M
          maxFileSize: 5 * 1024 * 1024,
          // 最多可上传几个文件，默认为 100
          maxNumberOfFiles: 10,
          // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
          allowedFileTypes: ['image/*'],
          // 自定义增加 http  header
          headers: {
            Accept: '*',
            Authorization: `Bearer${getToken()}`,
          },
          // 超时时间，默认为 10 秒
          timeout: 5 * 1000, // 5 秒
          // form-data fieldName，后端接口参数名称，默认值wangeditor-uploaded-image
          fieldName: 'file',
          // 上传之前触发
          onBeforeUpload(file: File) {
            // console.log(file)
            return file;
          },
          // 上传进度的回调函数
          onProgress(progress: number) {
            // progress 是 0-100 的数字
            console.log('progress', progress);
          },
          onSuccess(file: File, res: any) {
            console.log('onSuccess', file, res);
          },
          onFailed(file: File, res: any) {
            console.log('onFailed', file, res);
          },
          onError(file: File, err: any, res: any) {
            console.error('onError', file, err, res);
          },
          // 自定义插入图片
          customInsert(res: any, insertFn: InsertFnType) {
            insertFn(res.data, 'image', res.data);
          },
        },
        // eslint-disable-next-line no-useless-computed-key
        ['uploadVideo']: {
          server: import.meta.env.VITE_UPLOAD_URL,
          // 单个文件的最大体积限制，默认为 10M
          maxFileSize: 10 * 1024 * 1024,
          // 最多可上传几个文件，默认为 100
          maxNumberOfFiles: 10,
          // 选择文件时的类型限制，默认为 ['video/*'] 。如不想限制，则设置为 []
          allowedFileTypes: ['video/*'],
          // 自定义增加 http  header
          headers: {
            Accept: '*',
            Authorization: `Bearer${getToken()}`,
          },
          // 超时时间，默认为 30 秒
          timeout: 15 * 1000, // 15 秒
          // form-data fieldName，后端接口参数名称，默认值wangeditor-uploaded-image
          fieldName: 'file',
          // 上传之前触发
          onBeforeUpload(file: File) {
            // console.log(file)
            return file;
          },
          // 上传进度的回调函数
          onProgress(progress: number) {
            // progress 是 0-100 的数字
            console.log('progress', progress);
          },
          onSuccess(file: File, res: any) {
            console.log('onSuccess', file, res);
          },
          onFailed(file: File, res: any) {
            Message.error(res.message);
            console.log('onFailed', file, res);
          },
          onError(file: File, err: any, res: any) {
            Message.error(res.message);
            console.error('onError', file, err, res);
          },
          // 自定义插入图片
          customInsert(res: any, insertFn: InsertFnType) {
            insertFn(res.data, 'mp4', res.data);
          },
        },
      },
    };
  });

  const editorStyle = computed(() => {
    return {
      height: isNumber(props.height) ? `${props.height}px` : props.height,
    };
  });

  // 回调函数
  const handleChange = (editor: IDomEditor) => {
    emit('change', editor);
  };

  // 组件销毁时，及时销毁编辑器
  onBeforeUnmount(() => {
    const editor = unref(editorRef.value);

    // 销毁，并移除 editor
    editor?.destroy();
  });

  const getEditorRef = async (): Promise<IDomEditor> => {
    await nextTick();
    return unref(editorRef.value) as IDomEditor;
  };

  defineExpose({
    getEditorRef,
  });
</script>

<style src="@wangeditor/editor/dist/css/style.css"></style>
