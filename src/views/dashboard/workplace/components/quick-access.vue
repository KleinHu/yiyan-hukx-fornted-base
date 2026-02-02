<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card
      class="general-card"
      :bordered="false"
      :header-style="{ paddingBottom: '0' }"
      :body-style="{ padding: '16px 20px' }"
    >
      <template #title>
        <div class="card-title">
          <icon-apps class="title-icon" />
          <span>快捷入口</span>
        </div>
      </template>
      <template #extra>
        <a-space>
          <a-space v-if="pagedActions.length > 1" size="small">
            <a-button
              type="text"
              size="small"
              :disabled="currentPage === 0"
              @click="prevPage"
            >
              <template #icon><icon-left /></template>
            </a-button>
            <a-button
              type="text"
              size="small"
              :disabled="currentPage === pagedActions.length - 1"
              @click="nextPage"
            >
              <template #icon><icon-right /></template>
            </a-button>
          </a-space>
          <a-link @click="openMenuSelectModal">
            <template #icon><icon-settings /></template>
          </a-link>
        </a-space>
      </template>
      <div class="quick-access-wrapper">
        <a-carousel
          v-if="quickAccessDataList.length > 0"
          ref="carouselRef"
          v-model:current="currentPage"
          :auto-play="false"
          indicator-type="none"
          show-arrow="never"
          animation-name="slide"
          class="quick-access-carousel"
        >
          <a-carousel-item
            v-for="(page, pageIdx) in pagedActions"
            :key="pageIdx"
          >
            <div class="quick-actions-grid">
              <div
                v-for="(item, index) in page"
                :key="index"
                class="action-item"
                @click="toMenu(item)"
              >
                <div
                  class="action-icon-wrapper"
                  :style="{ backgroundColor: getIconBgColor(item) }"
                >
                  <component
                    :is="item.icon"
                    :style="{ color: getIconColor(item) }"
                  />
                </div>
                <div class="action-label">{{ item.label }}</div>
              </div>
            </div>
          </a-carousel-item>
        </a-carousel>
        <a-empty v-else />
      </div>
    </a-card>
    <MenuSelectModal
      ref="menuSelectModalRef"
      :mask-closable="true"
      :exclude-names="excludeNames"
      :default-checked-menu-list="quickAccessDataList"
      @submit="submitMenuSelectModal"
    />
  </a-spin>
</template>

<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';

  import { useRouter } from 'vue-router';
  import { Notification } from '@arco-design/web-vue';
  import useLoading from '@/hooks/loading';
  import { useUserStore } from '@/store';
  import MenuSelectModal from '@/components/cac-components/menu-select-modal/index.vue';
  import {
    queryQuickAccessRecordList,
    updateQuickAccessRecord,
  } from '@/api/system/quickAccess';

  defineProps({
    excludeNames: { type: Array<string>, default: () => [] },
  });

  const { loading, setLoading } = useLoading();
  const router = useRouter();
  const quickAccessDataList = ref<any[]>([]);
  const menuSelectModalRef = ref<any>();
  const carouselRef = ref<any>();
  const currentPage = ref(0);

  // 固定的配色方案
  const colors = [
    { color: '#1890ff', bgColor: '#e8f3ff' },
    { color: '#722ed1', bgColor: '#f3f0ff' },
    { color: '#52c41a', bgColor: '#e8ffea' },
    { color: '#fa8c16', bgColor: '#fff7e8' },
    { color: '#f5222d', bgColor: '#fff1f0' },
    { color: '#13c2c2', bgColor: '#e6fffb' },
  ];

  const getIconColor = (item: any) =>
    colors[item.originalIdx % colors.length].color;
  const getIconBgColor = (item: any) =>
    colors[item.originalIdx % colors.length].bgColor;

  const actions = computed(() => {
    return quickAccessDataList.value.map((item, index) => ({
      label: item.title,
      icon: item.alternateField1 || 'icon-apps',
      name: item.name,
      originalIdx: index,
    }));
  });

  // 每页 16 个 (4x4 布局)
  const pagedActions = computed(() => {
    const pages = [];
    for (let i = 0; i < actions.value.length; i += 16) {
      pages.push(actions.value.slice(i, i + 16));
    }
    return pages;
  });

  const prevPage = () => {
    if (currentPage.value > 0) {
      currentPage.value -= 1;
      carouselRef.value?.toIndex(currentPage.value);
    }
  };

  const nextPage = () => {
    if (currentPage.value < pagedActions.value.length - 1) {
      currentPage.value += 1;
      carouselRef.value?.toIndex(currentPage.value);
    }
  };
  /**
   * fun
   */
  const openMenuSelectModal = () => {
    menuSelectModalRef.value.openMenuSelectModal();
  };
  const getQuickAccessList = async () => {
    setLoading(true);
    const userStore = useUserStore();
    try {
      const { data } = await queryQuickAccessRecordList({
        pageNo: 1,
        pageSize: 10000,
        personCode: userStore.userCode,
        orderField: 'weight', // 对weight字段进行排序
        order: 'asc', // 排序方式，分为asc升序 desc降序
      });
      quickAccessDataList.value = data.list.map((item: any) => ({
        name: item.path,
        title: item.name,
        alternateField1: item.alternateField1,
        chineseTitle: item.name,
        meta: { title: item.name, icon: item.alternateField1 },
      }));
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Notification.error({
        content: `出现异常！${error}`,
        closable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  const submitMenuSelectModal = async (chosenMenuList: any) => {
    const userStore = useUserStore();
    const reqdata = chosenMenuList.map((item: any, index: number) => ({
      name: item.meta.title || item.name,
      path: item.name,
      personCode: userStore.userCode,
      weight: String(index + 1),
      alternateField1: item.meta.icon,
    }));
    try {
      const res = (await updateQuickAccessRecord(reqdata)) as any;
      if (res.code === 200) {
        Notification.success({ content: '操作成功！' });
      }
    } finally {
      getQuickAccessList();
    }
  };

  const toMenu = (item: any) => {
    if (item.name) {
      router.push({ name: item.name }).catch(() => {
        Notification.info({ content: `功能「${item.label}」正在接入中...` });
      });
    }
  };
  onMounted(() => {
    getQuickAccessList();
  });
</script>

<script lang="ts">
  export default {
    name: 'QuickAccess',
  };
</script>

<style scoped lang="less">
  .general-card {
    border-radius: 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;

    .title-icon {
      color: rgb(var(--arcoblue-6));
    }
  }

  .quick-access-wrapper {
    height: 280px;
    flex: 1;
  }

  .quick-access-carousel {
    height: 100%;
    position: relative;

    :deep(.arco-carousel-item) {
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    :deep(.arco-carousel-indicator-wrapper) {
      display: none !important;
    }
  }

  .quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 12px;
    padding: 8px 4px;
  }

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    padding: 8px;
    border-radius: 8px;

    &:hover {
      background-color: var(--color-fill-2);
      transform: translateY(-2px);

      .action-icon-wrapper {
        transform: scale(1.1);
      }
    }
  }

  .action-icon-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    margin-bottom: 6px;
    transition: transform 0.3s;
  }

  .action-label {
    font-size: 12px;
    color: var(--color-text-1);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
    font-weight: 500;
  }
</style>
