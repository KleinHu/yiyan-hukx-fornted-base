<!--通用组件：文件上传-->
<!-- created by lx 2023/6/9-->
<template>
  <div>
    <a-spin :loading="loading" style="width: 100%">
      <a-upload
        :file-list="fileList"
        :draggable="draggable"
        :accept="accept"
        :disabled="disabled"
        :limit="limit"
        :auto-upload="false"
        :show-link="false"
        :on-before-remove="removeFile"
        :show-cancel-button="false"
        @change="onFileChange"
      >
        <template #file-name="{ fileItem }">
          {{ fileItem.name }}
          <div v-if="fileItem.status === 'done'">
            <a-space>
              <DictionaryTag
                dict-type="secretLevelData"
                :dict-value="String(fileItem.secretLevel || 1)"
              />
              <a-link
                icon
                :loading="loadingDownload"
                @click="handleDownload(fileItem)"
              >
                下载
              </a-link>
            </a-space>
          </div>
          <div v-else>
            <SecretLevelSelect
              v-model="fileItem.secretLevel"
              style="width: 100%"
              @change="(value) => updateSecretLevel(value, fileItem.uid)"
            />
          </div>
        </template>
      </a-upload>
    </a-spin>
  </div>
</template>

<script setup lang="ts" name="FileUpload">
  import { onMounted, ref, watch } from 'vue';
  import { FileItem, Message, Modal } from '@arco-design/web-vue';
  import { FileRecordReq } from '@/api/model/fileModel';
  import {
    uploadFile,
    queryFileRecordPage,
    deleteFile,
    downloadFile,
  } from '@/api/file';
  import DictionaryTag from '../dictionary-tag/index.vue';
  import SecretLevelSelect from '../secret-level-select/index.vue';

  interface FileSecretItem extends FileItem {
    type?: string;
    secretLevel?: number;
  }
  const props = defineProps({
    businessType: { type: String, default: '' },
    businessKey: { type: String, default: '' },
    // a-upload属性
    draggable: { type: Boolean, default: false },
    accept: { type: String, default: undefined },
    disabled: { type: Boolean, default: false },
    limit: { type: Number, default: 0 },
  });
  const fileList = ref<FileItem[]>([]);
  // const secretLevelList = ref<string[]>([]);

  const loading = ref<boolean>(false);

  const listFile = async () => {
    loading.value = true;
    try {
      const { data } = await queryFileRecordPage({
        pageNo: 1,
        pageSize: 20,
        businessKey: props.businessKey,
        businessType: props.businessType,
      });
      const list: FileSecretItem[] = [];
      data.list.forEach((elem) => {
        list.push({
          name: elem.path,
          url: elem.url,
          uid: elem.id,
          type: elem.type,
          secretLevel: elem.secretLevel,
        });
      });
      fileList.value = list;
    } finally {
      loading.value = false;
    }
  };

  const onFileChange = (files: FileItem[], file: FileItem) => {
    file.status = 'uploading';
    fileList.value = [...files];
  };

  onMounted(() => {
    if (props.businessKey !== '') {
      listFile();
    }
  });

  watch(
    () => props.businessKey,
    (val) => {
      if (val !== '') {
        listFile();
      }
    },
    {
      immediate: true,
    }
  );

  const secretLevelList = ref<{ uid: string; secretLevel: string }[]>([]);

  // 一个工具方法：从secretLevelList中找到相应file
  // 找到返回索引，未找到返回-1
  const findFile = (uid: string) => {
    return secretLevelList.value.findIndex((elem) => elem.uid === uid);
  };

  const parseSecretLevel = (uid: string) => {
    return secretLevelList.value.filter((elem) => elem.uid === uid)[0]
      .secretLevel;
  };

  // 一个数组单独存储上传各文件的密级
  const updateSecretLevel = (value: string, fileId: string) => {
    const index = findFile(fileId);
    if (index > -1) {
      // 列表中已有文件更新密级
      secretLevelList.value[index].secretLevel = value;
    } else {
      // 新增一个文件并设置密级
      secretLevelList.value.push({ uid: fileId, secretLevel: value });
    }
  };

  const validate = () => {
    if (fileList.value.length > 0) {
      return true;
    }
    return false;
  };

  // const validateSecretLevel = (): boolean => {
  //   fileList.value.forEach((file) => {
  //     if (file.file && file.status !== 'done' && findFile(file.uid) === -1) {
  //       return false;
  //     }
  //     return true;
  //   });
  //   return true;
  // };

  const handleSubmit = (id?: string) => {
    const params: FileRecordReq = {
      businessKey: id || props.businessKey,
      businessType: props.businessType,
    };
    fileList.value.forEach(async (file: FileSecretItem) => {
      if (file.file && file.status !== 'done') {
        const formData = new FormData();
        formData.append('file', file.file);
        try {
          await uploadFile(formData, {
            ...params,
            secretLevel: parseSecretLevel(file.uid),
            path: file.name,
          });
          Message.success(`文件${file.name}上传成功`);
        } catch {
          // empty
        }
      }
    });
  };

  const removeFile = (file: FileItem): Promise<boolean> => {
    return new Promise((resolve) => {
      if (file.status === 'done') {
        Modal.confirm({
          title: '删除文件',
          content: `该操作不可复原：确认删除文件${file.name}？`,
          modalStyle: { wordBreak: 'break-all' },
          okButtonProps: { status: 'danger' },
          onOk: async () => {
            try {
              await deleteFile(file.uid);
              Message.success('删除成功');
            } finally {
              resolve(true);
            }
          },
          onCancel: () => resolve(false),
        });
      } else {
        resolve(true);
      }
    });
  };

  // 下载等待
  const loadingDownload = ref(false);

  // 下载文件
  const handleDownload = async (file: FileSecretItem) => {
    try {
      loadingDownload.value = true;
      const { data, headers } = await downloadFile(file.uid);
      const filename = decodeURI(
        headers['content-disposition'].split('filename=')[1]
      );
      const fileType = file.type;
      const elink = document.createElement('a');
      elink.download = filename;
      elink.style.display = 'none';
      const blob = new Blob([data], { type: fileType });
      elink.href = URL.createObjectURL(blob);
      document.body.appendChild(elink);
      elink.click();
      document.body.removeChild(elink);
    } finally {
      loadingDownload.value = false;
    }
  };
  defineExpose({ handleSubmit, listFile, validate });
</script>
