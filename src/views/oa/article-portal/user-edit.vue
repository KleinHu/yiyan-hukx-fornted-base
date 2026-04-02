<template>
  <div class="container">
    <Breadcrumb :items="['文章浏览', isEdit ? '修改稿件' : '创作投稿']" />

    <div class="layout-content">
      <!-- 左侧内容编辑 -->
      <div class="main-editor">
        <a-card class="general-card" :bordered="false">
          <div class="title-input-wrapper">
            <a-input
              v-model="formData.title"
              placeholder="在这里输入标题..."
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

      <!-- 右侧设置与操作 -->
      <div class="side-settings">
        <a-card
          class="general-card settings-card"
          title="发布至专栏"
          :bordered="false"
        >
          <a-form ref="formRef" :model="formData" layout="vertical">
            <a-form-item field="columnId" label="选择专栏" required>
              <a-tree-select
                v-model="formData.columnId"
                :data="columnTree"
                placeholder="请选择"
                :loading="columnLoading"
                :field-names="{
                  key: 'id',
                  title: 'name',
                  children: 'children',
                }"
              />
            </a-form-item>

            <a-form-item field="coverUrl" label="封面图片 (选填)">
              <a-upload
                v-model:file-list="fileList"
                action="/api/240/hr/file/upload"
                :headers="uploadHeaders"
                :limit="1"
                image-preview
                list-type="picture-card"
                @success="handleUploadSuccess"
                @remove="handleUploadRemove"
              />
            </a-form-item>

            <a-form-item field="tags" label="文章标签">
              <a-input-tag
                v-model="tagList"
                placeholder="键入标签后按回车(多标签)"
                allow-clear
              />
            </a-form-item>

            <a-form-item field="summary" label="摘要说明">
              <a-textarea
                v-model="formData.summary"
                placeholder="若不填写，系统将自动从正文中截取..."
                :max-length="500"
                show-word-limit
                :auto-size="{ minRows: 4, maxRows: 6 }"
              />
            </a-form-item>

            <a-form-item field="attachments" label="附件资料">
              <a-upload
                v-model:file-list="attachmentList"
                action="/api/240/hr/file/upload"
                :headers="uploadHeaders"
                multiple
                @success="handleAttachmentSuccess"
                @remove="handleAttachmentRemove"
              >
                <template #upload-button>
                  <a-button type="outline" size="small">
                    <template #icon><icon-upload /></template>
                    上传附件 (可多选)
                  </a-button>
                </template>
              </a-upload>
            </a-form-item>

            <a-divider
              orientation="left"
              style="margin-top: 24px; font-size: 14px"
            >
              时间轴设置
            </a-divider>

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
                placeholder="请选择发布时间"
                style="width: 100%"
              />
              <template #extra>
                审核通过后，文章将在该时间点自动转为“已发布”。
              </template>
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
                placeholder="请选择下线时间"
                style="width: 100%"
              />
              <template #extra>
                到达该时间后，文章将自动变更为“已下线”状态。
              </template>
            </a-form-item>
          </a-form>
        </a-card>

        <div class="action-bar">
          <div v-if="lastSaveTime" class="auto-save-tip">
            最近自动保存: {{ lastSaveTime }}
          </div>
          <a-space direction="vertical" fill style="width: 100%">
            <a-button class="action-btn" long @click="handleCancel"
              >取消</a-button
            >
            <a-button
              class="action-btn"
              long
              :loading="submitLoading"
              @click="handleSaveDraft(true)"
            >
              存为草稿
            </a-button>
            <a-button
              type="primary"
              class="action-btn"
              long
              :loading="submitLoading"
              @click="handleSubmit"
            >
              提交送审
            </a-button>
          </a-space>
        </div>

        <a-alert
          v-if="formData.auditOpinion"
          type="error"
          class="opinion-alert"
        >
          <template #title>退回意见</template>
          {{ formData.auditOpinion }}
        </a-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { Message, FormInstance, FileItem } from '@arco-design/web-vue';
  import type { ArticleVO } from '@/api/article';
  import Breadcrumb from '@/components/breadcrumb/index.vue';
  import { Editor } from '@/components/editor';
  import { getToken } from '@/utils/auth';
  import { useUserStore, useTabBarStore } from '@/store';
  import useArticle from '@/hooks/article/useArticle';
  import useArticleColumn from '@/hooks/article/useArticleColumn';
  import { formatDate } from '@/utils/date';

  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();
  const tabBarStore = useTabBarStore();
  const { getDetail, saveOrUpdate } = useArticle();
  const { loading: columnLoading, columnTree, fetchTree } = useArticleColumn();

  const isEdit = computed(() => !!route.query.id);
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
    authorName: userStore.username || '',
    authorCode: userStore.userCode || '',
    coverUrl: '',
    summary: '',
    releaseTime: '',
    offlineTime: '',
    isReleaseTimed: false,
    isOfflineTimed: false,
    isMustRead: 0,
    status: 0,
    tags: '',
    attachments: '',
  });

  const fileList = ref<FileItem[]>([]);
  const tagList = ref<string[]>([]);
  const attachmentList = ref<FileItem[]>([]);

  const loadData = async () => {
    await fetchTree({ status: 1 });
    const id = route.query.id as string;
    if (id) {
      const data = await getDetail(id);
      if (data) {
        formData.value = { ...data };
        if (data.coverUrl) {
          fileList.value = [
            { uid: '-1', name: 'cover.png', url: data.coverUrl },
          ];
        }
        // 解析标签
        if (data.tags) {
          tagList.value = data.tags.split(',').filter((t) => !!t);
        }
        // 解析附件
        if (data.attachments) {
          try {
            const list = JSON.parse(data.attachments);
            attachmentList.value = list.map((item: any, index: number) => ({
              uid: `-${index + 2}`,
              name: item.name,
              url: item.url,
            }));
          } catch (e) {
            // 解析失败不影响主流程
          }
        }
      }
    }
  };

  /**
   * 自动保存逻辑
   */
  const startAutoSave = () => {
    if (autoSaveTimer) clearInterval(autoSaveTimer);
    autoSaveTimer = setInterval(() => {
      // 只有在有标题和正文时自动保存
      if (
        formData.value.title &&
        formData.value.content &&
        formData.value.content !== '<p><br></p>'
      ) {
        handleSaveDraft(false); // 静默保存
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
    fileList.value = [];
  };

  /**
   * 附件上传处理
   */
  const handleAttachmentSuccess = (fileItem: FileItem) => {
    // a-upload 已经通过 v-model:file-list 自动维护了 attachmentList
    // 我们只需要在保存前统一同步到 formData.attachments 即可
  };

  const handleAttachmentRemove = (fileItem: FileItem) => {
    // 同上，UI 层会自动移除
  };

  /**
   * 同步附件和标签数据到 formData
   */
  const syncFormData = () => {
    // 序列化标签
    formData.value.tags = tagList.value.join(',');

    // 序列化附件
    const attachments = attachmentList.value
      .filter((f: FileItem) => f.status === 'done' || (f.url && !f.status))
      .map((f: FileItem) => ({
        name: f.name,
        url: f.url || f.response?.data?.url,
      }));
    formData.value.attachments = attachments.length
      ? JSON.stringify(attachments)
      : '';
  };

  const extractSummary = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.substring(0, 200).trim();
  };

  const validateForm = async () => {
    const res = await formRef.value?.validate();
    if (res) return false;
    if (!formData.value.title?.trim()) {
      Message.warning('请输入标题');
      return false;
    }
    if (
      !formData.value.content?.trim() ||
      formData.value.content === '<p><br></p>'
    ) {
      Message.warning('请输入正文内容');
      return false;
    }
    // 定时时间必填校验
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
    // 同步标签与附件
    syncFormData();

    return true;
  };

  const handleSaveDraft = async (showMsg = true) => {
    formData.value.status = 0;
    // 保存草稿前也需要同步一下附件和标签，否则附件数据会丢失
    syncFormData();
    try {
      const result = await saveOrUpdate(formData.value as ArticleVO);
      if (result.success) {
        if (result.id) {
          formData.value.id = result.id;
        }
        lastSaveTime.value = formatDate(new Date(), 'HH:mm:ss');
        if (showMsg) Message.success('保存成功（草稿模式）');
      }
    } catch (e) {
      if (showMsg) Message.error('草稿保存失败');
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    formData.value.status = 1; // 送审
    await doSubmit();
  };

  const doSubmit = async () => {
    submitLoading.value = true;
    try {
      const result = await saveOrUpdate(formData.value as ArticleVO);
      if (result.success) {
        Message.success('提交成功');
        tabBarStore.deleteTagByFullPath(route.fullPath);
        router.push({ name: 'article-person' });
      }
    } finally {
      submitLoading.value = false;
    }
  };

  const handleCancel = () => {
    tabBarStore.deleteTagByFullPath(route.fullPath);
    router.back();
  };
</script>

<script lang="ts">
  export default {
    name: 'ArticleUserEdit',
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
