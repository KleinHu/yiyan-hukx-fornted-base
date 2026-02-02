<!-- 递归实现菜单 -->
<!--created by lx 2023/5/15-->
<template>
  <div class="circle-sub-menu">
    <a-sub-menu
      v-if="item.children.length > 0"
      :title="getMenuTitle(item as RouteRecordRaw)"
    >
      <template v-if="item?.meta?.icon" #icon>
        <StandardIcon :element="item" />
      </template>
      <StandardSubMenu
        v-for="element in item.children"
        :key="element?.name"
        :item="element"
      />
    </a-sub-menu>
    <a-menu-item v-else @click="goto(item as RouteRecordRaw)">
      <template v-if="item?.meta?.icon" #icon>
        <StandardIcon :element="item" />
      </template>
      {{ getMenuTitle(item as RouteRecordRaw) }}
    </a-menu-item>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute, useRouter, RouteRecordRaw } from 'vue-router';
  import type { RouteMeta } from 'vue-router';
  import { listenerRouteChange } from '@/utils/route-listener';
  import { openWindow, regexUrl } from '@/utils';
  import StandardIcon from './standard-icon.vue';
  import useMenuTree from '../menu/use-menu-tree';

  defineProps({
    item: {
      type: Object,
      required: true,
    },
  });

  const emits = defineEmits(['change']);

  const { t } = useI18n();
  const route = useRoute();
  const router = useRouter();
  const { menuTree } = useMenuTree();

  const selectedKey = ref<string[]>([]);

  const findMenuOpenKeys = (target: string) => {
    const result: string[] = [];
    let isFind = false;
    const backtrack = (item: RouteRecordRaw, keys: string[]) => {
      if (item.name === target) {
        isFind = true;
        result.push(...keys);
        return;
      }
      if (item.children?.length) {
        item.children.forEach((el) => {
          backtrack(el, [...keys, el.name as string]);
        });
      }
    };
    menuTree.value.forEach((el: RouteRecordRaw) => {
      if (isFind) return; // Performance optimization
      backtrack(el, [el.name as string]);
    });
    return result;
  };
  listenerRouteChange((newRoute) => {
    const { requiresAuth, activeMenu, hideInMenu } = newRoute.meta;
    if (requiresAuth && (!hideInMenu || activeMenu)) {
      const menuOpenKeys = findMenuOpenKeys(
        (activeMenu || newRoute.name) as string
      );
      // const keySet = new Set([...menuOpenKeys, ...openKeys.value]);
      // openKeys.value = [...keySet];

      selectedKey.value = [activeMenu || menuOpenKeys[menuOpenKeys.length - 1]];
    }
  }, true);

  // selectedKey变化时推给父组件
  watch(selectedKey, (value) => {
    emits('change', value);
  });

  const goto = (item: RouteRecordRaw) => {
    // Open external link
    if (regexUrl.test(item.path)) {
      openWindow(item.path);
      selectedKey.value = [item.name as string];
      return;
    }
    // Eliminate external link side effects
    const { hideInMenu, activeMenu } = item.meta as RouteMeta;
    if (route.name === item.name && !hideInMenu && !activeMenu) {
      selectedKey.value = [item.name as string];
      return;
    }
    // Trigger router change
    router.push({
      name: item.name,
    });
  };

  const getMenuTitle = (item: RouteRecordRaw) => {
    return item?.meta?.title || t(item?.meta?.locale || '');
  };
</script>

<style lang="less" scoped>
  .circle-sub-menu {
    &:not(.arco-trigger-has-icon) {
      :deep(.arco-icon) {
        color: #fff;
        font-size: 14px;
      }
    }

    :deep(.arco-menu-inline-header) {
      &:hover {
        background-color: var(--cac-transparent-2);

        .arco-icon {
          color: #fff;
        }
      }
    }

    :deep(.arco-menu-item) {
      &:hover {
        background-color: var(--cac-transparent-2);

        .arco-icon {
          color: #fff;
        }
      }
    }

    :deep(.arco-menu-pop) {
      &:hover {
        background-color: var(--cac-transparent-2);

        .arco-icon {
          color: #fff;
        }
      }
    }
  }
</style>
