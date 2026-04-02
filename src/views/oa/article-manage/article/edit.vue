<template>
  <div class="container">
    <Breadcrumb :items="['文章管理', isEdit ? '编辑文章' : '新增文章']" />

    <div class="layout-content">
      <!-- 左侧主要内容区：标题与正文 -->
      <div class="main-editor">
        <a-card
          class="general-card"
          :bordered="false"
          style="display: flex; flex-direction: column"
        >
          <div class="title-input-wrapper">
            <a-input
              v-model="formData.title"
              placeholder="请输入文章标题 (不超过200字)"
              size="large"
              :max-length="200"
              allow-clear
              class="title-input"
            />
          </div>

          <div class="editor-wrapper">
            <Editor v-model="formData.content" height="auto" />
          </div>
        </a-card>
      </div>

      <!-- 右侧设置区 -->
      <div class="side-settings">
        <a-card
          class="general-card settings-card"
          title="发布设置"
          :bordered="false"
        >
          <a-form ref="formRef" :model="formData" layout="vertical">
            <a-form-item field="columnId" label="所属专栏" required>
              <a-tree-select
                v-model="formData.columnId"
                :data="columnTree"
                placeholder="请选择专栏"
                :loading="columnLoading"
                allow-search
                :field-names="{
                  key: 'id',
                  title: 'name',
                  children: 'children',
                }"
              />
            </a-form-item>

            <a-form-item field="authorName" label="作者">
              <a-input-group style="width: 100%">
                <a-input
                  v-model="formData.authorName"
                  placeholder="请输入作者名称"
                  readonly
                  allow-clear
                  @click="openEmployeeSelector"
                />
                <a-button type="primary" @click="openEmployeeSelector">
                  <template #icon><icon-search /></template>
                  选择
                </a-button>
              </a-input-group>
            </a-form-item>

            <a-form-item field="coverUrl" label="封面图片">
              <a-upload
                action="/api/240/hr/file/upload"
                :headers="uploadHeaders"
                :file-list="fileList"
                :limit="1"
                image-preview
                list-type="picture-card"
                @success="handleUploadSuccess"
                @remove="handleUploadRemove"
              />
            </a-form-item>

            <a-form-item field="summary" label="文章摘要">
              <a-textarea
                v-model="formData.summary"
                placeholder="选填，若不填会自动截取正文前一段字作为摘要"
                :max-length="500"
                show-word-limit
                :auto-size="{ minRows: 4, maxRows: 6 }"
              />
            </a-form-item>

            <a-form-item
              field="isMustRead"
              label="设为必读项"
              tooltip="勾选后，会在阅读详情页强制要求留痕【已阅回执】"
            >
              <a-switch
                v-model="formData.isMustRead"
                :checked-value="1"
                :unchecked-value="0"
              />
            </a-form-item>

            <a-divider orientation="left" style="font-size: 14px"
              >时间轴</a-divider
            >

            <a-form-item field="isReleaseTimed" label="启用定时发布">
              <a-switch v-model="formData.isReleaseTimed" />
            </a-form-item>

            <a-form-item
              v-if="formData.isReleaseTimed"
              field="releaseTime"
              label="发布时间"
            >
              <a-date-picker
                v-model="formData.releaseTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                placeholder="请选择发布时间"
              />
            </a-form-item>

            <a-form-item field="isOfflineTimed" label="启用定时下线">
              <a-switch v-model="formData.isOfflineTimed" />
            </a-form-item>

            <a-form-item
              v-if="formData.isOfflineTimed"
              field="offlineTime"
              label="下线时间"
            >
              <a-date-picker
                v-model="formData.offlineTime"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                placeholder="请选择下线时间"
              />
            </a-form-item>

            <a-form-item field="tags" label="文章标签">
              <a-input-tag
                v-model="tagList"
                placeholder="输入标签后按回车"
                allow-clear
              />
            </a-form-item>

            <a-form-item field="attachments" label="文章附件">
              <a-upload
                v-model:file-list="attachmentList"
                :action="'/api/bpm/file/upload'"
                :headers="uploadHeaders"
                multiple
                :show-link="true"
                @success="handleAttachmentSuccess"
              />
            </a-form-item>
          </a-form>
        </a-card>

        <!-- 底部操作按钮 -->
        <div class="action-bar">
          <div v-if="lastSaveTime" class="auto-save-tip">
            最近保存: {{ lastSaveTime }}
          </div>
          <a-space direction="vertical" fill style="width: 100%">
            <a-button class="action-btn" long @click="handleCancel"
              >取消</a-button
            >
            <a-button class="action-btn" long @click="handleSaveDraft(true)">
              保存草稿
            </a-button>
            <a-button
              v-if="isAdmin"
              type="primary"
              :loading="submitLoading"
              class="action-btn"
              long
              @click="handleDirectPublish"
            >
              直接发布
            </a-button>
            <a-button
              v-else
              type="primary"
              :loading="submitLoading"
              class="action-btn"
              long
              @click="handleSubmit"
            >
              提交审批
            </a-button>
          </a-space>
        </div>
      </div>
    </div>

    <!-- 用户选择弹窗 -->
    <EmployeeSelectorModal
      v-model:visible="employeeSelectorVisible"
      :multiple="false"
      @submit="handleEmployeeSelect"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { Message, FormInstance, FileItem } from '@arco-design/web-vue';
  import type { ArticleVO } from '@/api/article';
  import type { Employee } from '@/api/hr/types';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import { Editor } from '@/components/editor';
  import EmployeeSelectorModal from '@/components/hr/EmployeeSelectorModal.vue';
  import { getToken } from '@/utils/auth';
  import { useUserStore } from '@/store';
  import useArticle from '@/hooks/article/useArticle';
  import useArticleColumn from '@/hooks/article/useArticleColumn';
  import { formatDate } from '@/utils/date';

  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();

  const { getDetail, saveOrUpdate } = useArticle();
  const { loading: columnLoading, columnTree, fetchTree } = useArticleColumn();

  const isEdit = computed(() => !!route.query.id);
  const isAdmin = computed(() => userStore.roles?.includes('admin') || false);
  const submitLoading = ref(false);
  const formRef = ref<FormInstance>();
  const lastSaveTime = ref('');
  let autoSaveTimer: any = null;

  const uploadHeaders = computed(() => {
    return { Authorization: `Bearer ${getToken()}` };
  });

  const formData = ref<Partial<ArticleVO>>({
    title: '',
    columnId: '',
    content: '',
    authorName: '',
    authorCode: '',
    coverUrl: '',
    summary: '',
    releaseTime: '',
    offlineTime: '',
    isReleaseTimed: false,
    isOfflineTimed: false,
    isMustRead: 0,
    status: 0,
  });

  const employeeSelectorVisible = ref(false);
  const openEmployeeSelector = () => {
    employeeSelectorVisible.value = true;
  };

  const handleEmployeeSelect = (employees: Employee[]) => {
    if (employees && employees.length > 0) {
      const emp = employees[0];
      formData.value.authorName = emp.userName;
      formData.value.authorCode = emp.userCode;
    }
  };

  const fileList = ref<FileItem[]>([]);
  const tagList = ref<string[]>([]);
  const attachmentList = ref<FileItem[]>([]);

  const extractSummary = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.substring(0, 200).trim();
  };

  const loadData = async () => {
    await fetchTree({ status: 1 });

    const id = route.query.id as string;
    if (id) {
      const data = await getDetail(id);
      if (data) {
        formData.value = { ...data };
        // 处理封面图
        if (data.coverUrl) {
          fileList.value = [
            { uid: '-1', name: 'cover.png', url: data.coverUrl },
          ];
        }
        // 处理标签
        if (data.tags) {
          tagList.value = data.tags.split(',').filter((t) => !!t);
        }
        // 处理附件
        if (data.attachments) {
          try {
            const list = JSON.parse(data.attachments);
            attachmentList.value = list.map((item: any, index: number) => ({
              uid: `-${index + 2}`,
              name: item.name,
              url: item.url,
              status: 'done',
              response: { code: 200, data: { url: item.url } },
            }));
          } catch (e) {
            // 解析失败不打断主流程
          }
        }
      }
    } else {
      formData.value.authorName = userStore.username || '';
      formData.value.authorCode = userStore.userCode || '';
    }
  };

  const startAutoSave = () => {
    if (autoSaveTimer) clearInterval(autoSaveTimer);
    autoSaveTimer = setInterval(() => {
      if (
        formData.value.title &&
        formData.value.content &&
        formData.value.content !== '<p><br></p>'
      ) {
        handleSaveDraft(false);
      }
    }, 60000);
  };

  onMounted(async () => {
    await loadData();
    startAutoSave();
  });

  onUnmounted(() => {
    if (autoSaveTimer) clearInterval(autoSaveTimer);
  });

  const handleUploadSuccess = (fileItem: FileItem) => {
    const { response } = fileItem;
    if (response && response.code === 200 && response.data?.url) {
      formData.value.coverUrl = response.data.url;
    }
  };

  const handleUploadRemove = () => {
    formData.value.coverUrl = '';
    fileList.value = [];
  };

  const handleAttachmentSuccess = (_fileItem: FileItem) => {
    // 附件列表由 v-model:file-list 自动维护
  };

  const validateForm = async () => {
    const res = await formRef.value?.validate();
    if (res) return false;

    if (!formData.value.title?.trim()) {
      Message.warning('文章标题不能为空');
      return false;
    }
    if (
      !formData.value.content?.trim() ||
      formData.value.content === '<p><br></p>'
    ) {
      Message.warning('文章正文不能为空');
      return false;
    }

    // 同步标签
    formData.value.tags = tagList.value.join(',');

    // 同步附件 (只保存已成功上传的)
    const attachments = attachmentList.value
      .filter((item: FileItem) => item.status === 'done' || item.url)
      .map((item: FileItem) => ({
        name: item.name,
        url: item.url || item.response?.data?.url,
      }));
    formData.value.attachments = JSON.stringify(attachments);

    // 定时相关校验
    if (formData.value.isReleaseTimed && !formData.value.releaseTime) {
      Message.warning('开启定时发布后必须选择发布时间');
      return false;
    }
    if (formData.value.isOfflineTimed && !formData.value.offlineTime) {
      Message.warning('开启定时下线后必须选择下线时间');
      return false;
    }

    if (!formData.value.summary && formData.value.content) {
      formData.value.summary = extractSummary(formData.value.content);
    }

    return true;
  };

  const handleSaveDraft = async (showMsg = true) => {
    formData.value.status = 0;
    try {
      const result = await saveOrUpdate(formData.value as ArticleVO);
      if (result.success) {
        if (result.id) {
          formData.value.id = result.id;
        }
        lastSaveTime.value = formatDate(new Date(), 'HH:mm:ss');
        if (showMsg) Message.success('保存草稿成功');
      }
    } catch (e) {
      if (showMsg) Message.error('自动保存异常');
    }
  };

  const handleSubmit = async () => {
    formData.value.status = 1;
    await doSubmit();
  };

  const handleDirectPublish = async () => {
    formData.value.status = 2; // 直接发布
    await doSubmit();
  };

  const doSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    submitLoading.value = true;
    try {
      const result = await saveOrUpdate(formData.value as ArticleVO);
      if (result.success) {
        Message.success('操作成功');
        router.push({ name: 'ArticleManage' });
      }
    } finally {
      submitLoading.value = false;
    }
  };

  const handleCancel = () => {
    router.back();
  };
</script>

<style scoped lang="less">
  .container {
    padding: 16px 20px 20px 20px;
    background-color: #f7f9fb;
  }

  .layout-content {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .main-editor {
    flex: 1;
    min-width: 0;

    .title-input-wrapper {
      padding: 16px 20px 0;
    }

    .title-input {
      border: none;
      border-bottom: 2px solid var(--color-border-2);
      border-radius: 0;
      background-color: transparent;
      padding: 10px 0;
      font-size: 24px;
      font-weight: bold;

      &:focus {
        border-color: var(--color-primary);
      }
    }

    .editor-wrapper {
      margin-top: 16px;
      :deep(.w-e-text-container) {
        height: auto !important;
        min-height: 450px;
      }
    }
  }

  .side-settings {
    flex: 0 0 350px;
    position: sticky;
    top: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    .action-bar {
      margin-top: 16px;
      padding: 16px;
      background: var(--color-bg-2);
      border-radius: 4px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

      .auto-save-tip {
        font-size: 12px;
        color: var(--color-text-3);
        text-align: center;
        margin-bottom: 8px;
      }
    }
  }
</style>
