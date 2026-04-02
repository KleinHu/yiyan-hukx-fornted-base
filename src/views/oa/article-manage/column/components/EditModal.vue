<template>
  <a-modal
    :visible="visible"
    :title="isEdit ? '编辑专栏' : '新增专栏'"
    width="500px"
    unmount-on-close
    @cancel="handleCancel"
    @before-ok="handleBeforeOk"
  >
    <a-form ref="formRef" :model="formData" :rules="rules" auto-label-width>
      <a-form-item field="name" label="专栏名称" required>
        <a-input
          v-model="formData.name"
          placeholder="请输入专栏名称"
          :max-length="50"
          show-word-limit
        />
      </a-form-item>

      <a-form-item field="parentId" label="父级专栏">
        <a-tree-select
          v-model="formData.parentId"
          :data="treeData"
          placeholder="请选择父级专栏 (不选则为根专栏)"
          allow-clear
          allow-search
          :field-names="{
            key: 'id',
            title: 'name',
            children: 'children',
          }"
        />
      </a-form-item>

      <a-form-item field="description" label="描述简介">
        <a-textarea
          v-model="formData.description"
          placeholder="请输入专栏简介"
          :max-length="200"
          show-word-limit
          auto-size
        />
      </a-form-item>

      <a-form-item field="sortOrder" label="排序号">
        <a-input-number
          v-model="formData.sortOrder"
          placeholder="决定展示顺序，越小越靠前"
          :min="0"
          :max="999"
        />
      </a-form-item>

      <a-form-item field="status" label="状态">
        <a-switch
          v-model="formData.status"
          :checked-value="1"
          :unchecked-value="0"
        >
          <template #checked>启用</template>
          <template #unchecked>停用</template>
        </a-switch>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { FormInstance } from '@arco-design/web-vue';
  import useArticleColumn from '@/hooks/article/useArticleColumn';
  import type { ArticleColumnVO } from '@/api/article';

  const props = defineProps<{
    visible: boolean;
    initialData?: Partial<ArticleColumnVO>;
  }>();

  const emit = defineEmits<{
    (e: 'update:visible', visible: boolean): void;
    (e: 'submit', data: ArticleColumnVO): void;
  }>();

  const isEdit = ref(false);
  const formRef = ref<FormInstance | null>(null);
  const { columnTree, fetchTree } = useArticleColumn();

  const treeData = computed(() => {
    // 过滤掉当前正在编辑的节点，防止出现循环父级
    const filterSelf = (list: ArticleColumnVO[]): ArticleColumnVO[] => {
      return list
        .filter((item) => item.id !== formData.value.id)
        .map((item) => ({
          ...item,
          children: item.children ? filterSelf(item.children) : undefined,
        }));
    };
    return filterSelf(columnTree.value);
  });

  const defaultForm = (): Partial<ArticleColumnVO> => ({
    name: '',
    parentId: '0',
    description: '',
    sortOrder: 0,
    status: 1,
  });

  const formData = ref<Partial<ArticleColumnVO>>(defaultForm());

  const rules = {
    name: [
      { required: true, message: '专栏名称不能为空' },
      { maxLength: 50, message: '专栏名称最多50个字符' },
    ],
  };

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        fetchTree(); // 展开弹窗时加载最新树结构
        if (props.initialData && Object.keys(props.initialData).length > 2) {
          isEdit.value = true;
          formData.value = { ...props.initialData };
        } else {
          isEdit.value = false;
          // default props from parent might contain status and sortOrder
          formData.value = { ...defaultForm(), ...(props.initialData || {}) };
        }
      } else {
        formRef.value?.resetFields();
      }
    }
  );

  const handleCancel = () => {
    emit('update:visible', false);
  };

  const handleBeforeOk = async (done: (closed: boolean) => void) => {
    const res = await formRef.value?.validate();
    if (res) {
      done(false);
      return;
    }
    emit('submit', formData.value as ArticleColumnVO);
    done(false); // 控制弹窗由父组件通过更新 visible 属性负责关闭
  };
</script>
