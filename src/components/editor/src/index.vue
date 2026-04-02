<!-- 组件wangeditor -->
<!-- 使用方式 <Editor v-model="text" /> -->
<template>
  <div class="editor-container">
    <!-- 工具栏 -->
    <Toolbar
      :editor="editorRef"
      :editor-id="editorId"
      :default-config="toolbarConfig"
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
    IToolbarConfig,
    Boot,
  } from '@wangeditor/editor';
  import attachmentModule from '@wangeditor/plugin-upload-attachment';
  import request from '@/utils/request/request';
  import { isNumber } from '@/utils/is';

  // 注册附件上传插件 (增加全局标记防止多页面/多实例重复注册导致报错)
  if (!(window as any).WANG_EDITOR_ATTACHMENT_REGISTERED) {
    Boot.registerModule(attachmentModule);
    (window as any).WANG_EDITOR_ATTACHMENT_REGISTERED = true;
  }

  defineOptions({ name: 'Editor' });

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
        uploadImage: {
          // 自定义上传：直接调用接口，绕过 Uppy 队列，解决重复文件报错
          async customUpload(file: File, insertFn: any) {
            const formData = new FormData();
            formData.append('file', file);
            try {
              const res: any = await request.post(
                '/api/240/hr/file/upload',
                formData,
                {
                  headers: { 'Content-Type': 'multipart/form-data' },
                }
              );
              if (res.code === 200) {
                const url = res.data?.url || res.data;
                if (url) {
                  insertFn(url, file.name, url);
                } else {
                  Message.error('服务器未返回图片地址');
                }
              }
            } catch (err: any) {
              Message.error('图片预览上传失败');
            }
          },
        },
        uploadVideo: {
          async customUpload(file: File, insertFn: any) {
            const formData = new FormData();
            formData.append('file', file);
            try {
              const res: any = await request.post(
                '/api/240/hr/file/upload',
                formData,
                {
                  headers: { 'Content-Type': 'multipart/form-data' },
                }
              );
              if (res.code === 200) {
                const url = res.data?.url || res.data;
                if (url) {
                  insertFn(url, '');
                } else {
                  Message.error('服务器未返回视频地址');
                }
              }
            } catch (err: any) {
              Message.error('视频预览上传失败');
            }
          },
        },
        // 附件上传配置
        uploadAttachment: {
          async customUpload(file: File, insertFn: any) {
            const formData = new FormData();
            formData.append('file', file);
            try {
              const res: any = await request.post(
                '/api/240/hr/file/upload',
                formData,
                {
                  headers: { 'Content-Type': 'multipart/form-data' },
                }
              );
              if (res.code === 200) {
                const url = res.data?.url || res.data;
                if (url) {
                  // 插入附件：url, 附件名
                  insertFn(file.name, url);
                } else {
                  Message.error('服务器未返回附件地址');
                }
              }
            } catch (err: any) {
              Message.error('附件上传失败');
            }
          },
        },
      },
    };
  });

  // 工具栏配置
  const toolbarConfig = computed((): Partial<IToolbarConfig> => {
    return {
      insertKeys: {
        index: 22, // 插入在视频后面
        keys: ['uploadAttachment'],
      },
      excludeKeys: [
        'fullScreen', // 已经外层封装全屏或不需要
      ],
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

<style lang="less">
  .editor-container {
    border: 1px solid var(--color-border-2);
    z-index: 10;
  }

  /* 解决 WangEditor 全屏模式下自适应和层级问题 */
  .w-e-full-screen-container {
    z-index: 10000 !important;
  }
</style>
<style src="@wangeditor/editor/dist/css/style.css"></style>
