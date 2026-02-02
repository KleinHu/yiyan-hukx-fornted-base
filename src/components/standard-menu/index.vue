<!-- 标准菜单：带圆圈的菜单, usePattern = 1时使用 -->
<!-- created by lx 2023/5/12 -->
<template>
  <div
    :style="{
      width: '100%',
      height: collapsed ? 'calc(100% - 40px)' : 'calc(100% - 340px)',
    }"
  >
    <!-- <div v-show="!collapsed" style="margin-top: 10px">
      <img src="@/assets/img/switch-system.png" style="margin: 5px" />
      <el-select
        v-model="selectedModule"
        size="small"
        style="width: 120px"
        @change="switchModule"
      >
        <el-option
          v-for="item in modules"
          :key="item.name"
          :value="item.name"
          :label="item.meta.title"
        />
      </el-select>
    </div> -->
    <!--一级圆圈菜单-->
    <div
      :class="!collapsed ? 'menu-circle-head' : 'menu-circle-head-collapsed'"
    >
      <div v-show="!collapsed" class="menu-circle-left-top">
        <img style="width: 100%" :src="getMenuPic() as any" />
        <ul class="menu-circle-ul">
          <li
            v-for="(item, index) in visibleRoutes"
            :key="index"
            :title="getMenuTitle(item)"
            :class="getClassName(index)"
            @click="onSelectMenu(index)"
          >
            {{ `${index + 1}-${getMenuTitle(item)}` }}
          </li>
        </ul>
      </div>
    </div>

    <!--圆圈下一级及以下菜单-->
    <a-menu
      v-model:collapsed="collapsed"
      show-collapse-button
      auto-open-selected
      :selected-keys="selectedKey"
      mode="vertical"
      :class="!collapsed ? 'circle-menu' : 'circle-menu-collapsed'"
      :level-indent="34"
      style="width: 100%; height: 100%"
      @collapse="setCollapse"
    >
      <StandardSubMenu
        v-for="element in childMenus"
        :key="element.name"
        :item="element"
        @change="onSelectKey"
      />
    </a-menu>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { RouteRecordRaw } from 'vue-router';
  import { useAppStore } from '@/store';
  import useMenuTree from '../menu/use-menu-tree';
  import StandardSubMenu from './standard-sub-menu.vue';

  const { t } = useI18n();
  const { menuTree } = useMenuTree();

  const visibleRoutes = computed(() => menuTree.value);

  const appStore = useAppStore();
  const collapsed = computed({
    get() {
      if (appStore.device === 'desktop') return appStore.menuCollapse;
      return false;
    },
    set(value: boolean) {
      appStore.updateSettings({ menuCollapse: value });
    },
  });

  const selectedKey = ref<string[]>([]);

  const setCollapse = (val: boolean) => {
    if (appStore.device === 'desktop')
      appStore.updateSettings({ menuCollapse: val });
  };

  const picModules = import.meta.glob('/src/assets/images/secmenu/*.png', {
    eager: true,
    import: 'default',
  });
  // 计算带圈目录图片地址
  const getMenuPic = () => {
    const routes = visibleRoutes.value;
    const routesCount = Object.keys(routes).length;
    const path = `/src/assets/images/secmenu/secmeun${routesCount}.png`;
    if (routesCount > 14) {
      return picModules['/src/assets/images/secmenu/secmeun3.png'];
      // return '@/assets/images/secmenu/secmeun15.png';
    }
    return picModules[path];
    // return new URL(
    //   `/src/assets/images/secmenu/secmeun${routesCount}.png`,
    //   import.meta.url
    // ).href;
  };
  const getMenuTitle = (item: RouteRecordRaw) => {
    return item?.meta?.title || t(item?.meta?.locale || '');
  };

  const selectedMenuIndex = ref<number>(0);

  const selectedMenu = computed(() => {
    const routes = visibleRoutes.value;
    const index = selectedMenuIndex.value;
    return routes[index];
  });

  const childMenus = computed(() => {
    const menu = selectedMenu.value;
    if (menu) {
      return menu.children || [];
    }
    return [];
  });

  // 子菜单选择
  const onSelectKey = (value: string[]) => {
    selectedKey.value = value;
  };

  // 圆圈菜单选择
  const onSelectMenu = (index: number) => {
    selectedMenuIndex.value = index;
  };
  // 一级标题获取class
  const getClassName = (index: number) => {
    const counts = visibleRoutes.value.length;
    let groupNo = counts;
    switch (counts) {
      case 3:
      case 4:
      case 5:
      case 6:
        groupNo = 3;
        break;
      case 9:
      case 10:
      case 11:
      case 12:
        groupNo = 9;
        break;
      default:
        groupNo = counts > 15 ? 15 : counts;
    }
    if (selectedMenuIndex.value === index) {
      return `list-${groupNo}-${index} selected`;
    }
    return `list-${groupNo}-${index}`;
  };
</script>

<style lang="less" scoped>
  .circle-menu {
    background-color: transparent;

    :deep(.arco-menu-inner) {
      padding: 4px 34px;
    }

    :deep(.arco-menu-inline-header) {
      margin: 16px 0;
      color: #fff;
      background-color: var(--cac-transparent-1);
    }

    :deep(.arco-menu-item) {
      margin: 12px 0;
      color: #fff;
      background-color: var(--cac-transparent-1);
    }

    &-collapsed {
      background-color: transparent;

      :deep(.arco-menu-inner) {
        padding: 4px;
      }

      :deep(.arco-menu-pop) {
        margin: 12px 0;
        color: #fff;
        background-color: var(--cac-transparent-1);
      }

      :deep(.arco-menu-item) {
        color: #fff;
        background-color: var(--cac-transparent-1);
      }
    }
  }

  .menu-circle-head {
    position: relative;
    height: 295px;
    margin-top: 43px;
    padding: 3px 3px 26px;

    &-collapsed {
      height: 32px;
    }
  }

  .menu-circle-left-top {
    position: relative;
    height: 286px;
    padding-left: 0;
  }

  .menu-circle-ul {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 4px;
    left: 0;

    li {
      position: absolute;
      width: 85px;
      overflow: hidden;
      color: #fff;
      font-size: 6px;
      white-space: nowrap;
      text-overflow: ellipsis;
      list-style-type: none;
      cursor: pointer;
    }

    .selected {
      color: #00fff0;
      font-weight: bold;
      font-size: 6px;
    }

    .list-1-0 {
      right: 10px;
      bottom: 82%;
      left: 71%;
    }

    .list-2-0 {
      top: 30%;
      left: 3%;
    }

    .list-2-1 {
      right: 10px;
      bottom: 82%;
      left: 71%;
    }

    /* 菜单数3-6 */
    .list-3-0 {
      bottom: 45%;
      left: 20%;
    }

    .list-3-1 {
      top: 30%;
      left: 3%;
    }

    .list-3-2 {
      right: 10px;
      bottom: 82%;
      left: 71%;
    }

    .list-3-3 {
      right: 10px;
      bottom: 69%;
      left: 71%;
    }

    .list-3-4 {
      right: 10px;
      bottom: 57%;
      left: 71%;
    }

    .list-3-5 {
      right: 10px;
      bottom: 45%;
      left: 71%;
    }

    /* 7菜单 */
    .list-7-0 {
      bottom: 45%;
      left: 20%;
    }

    .list-7-1 {
      top: 30%;
      left: 3%;
    }

    .list-7-2 {
      top: 16%;
      left: 3%;
    }

    .list-7-3 {
      right: 10px;
      bottom: 82%;
      left: 71%;
    }

    .list-7-4 {
      right: 10px;
      bottom: 69%;
      left: 71%;
    }

    .list-7-5 {
      right: 10px;
      bottom: 57%;
      left: 71%;
    }

    .list-7-6 {
      right: 10px;
      bottom: 45%;
      left: 71%;
    }

    /* 8菜单 */
    .list-8-0 {
      bottom: 45%;
      left: 20%;
    }

    .list-8-1 {
      top: 30%;
      left: 3%;
    }

    .list-8-2 {
      top: 16%;
      left: 3%;
    }

    .list-8-3 {
      top: 5%;
      left: 3%;
    }

    .list-8-4 {
      right: 10px;
      bottom: 82%;
      left: 71%;
    }

    .list-8-5 {
      right: 10px;
      bottom: 69%;
      left: 71%;
    }

    .list-8-6 {
      right: 10px;
      bottom: 56%;
      left: 71%;
    }

    .list-8-7 {
      right: 10px;
      bottom: 45%;
      left: 71%;
    }

    /* 9-12菜单 */
    .list-9-0 {
      bottom: 40%;
      left: 20%;
    }

    .list-9-1 {
      top: 34%;
      left: 3%;
    }

    .list-9-2 {
      top: 21%;
      left: 3%;
    }

    .list-9-3 {
      top: 9%;
      left: 3%;
    }

    .list-9-4 {
      top: -5%;
      left: 16%;
    }

    .list-9-5 {
      right: 10px;
      bottom: 78%;
      left: 71%;
    }

    .list-9-6 {
      right: 10px;
      bottom: 64%;
      left: 71%;
    }

    .list-9-7 {
      right: 10px;
      bottom: 52%;
      left: 71%;
    }

    .list-9-8 {
      right: 10px;
      bottom: 40%;
      left: 71%;
    }

    .list-9-9 {
      right: 10px;
      bottom: 27%;
      left: 71%;
    }

    .list-9-10 {
      right: 10px;
      bottom: 15%;
      left: 71%;
    }

    .list-9-11 {
      right: 10px;
      bottom: 3%;
      left: 71%;
    }

    /* 13菜单 */
    .list-13-0 {
      bottom: 26%;
      left: 18%;
    }

    .list-13-1 {
      bottom: 40%;
      left: 18%;
    }

    .list-13-2 {
      top: 34%;
      left: 3%;
    }

    .list-13-3 {
      top: 21%;
      left: 3%;
    }

    .list-13-4 {
      top: 9%;
      left: 3%;
    }

    .list-13-5 {
      top: -6%;
      left: 16%;
    }

    .list-13-6 {
      right: 10px;
      bottom: 78%;
      left: 72%;
    }

    .list-13-7 {
      right: 10px;
      bottom: 64%;
      left: 72%;
    }

    .list-13-8 {
      right: 10px;
      bottom: 52%;
      left: 72%;
    }

    .list-13-9 {
      right: 10px;
      bottom: 40%;
      left: 72%;
    }

    .list-13-10 {
      right: 10px;
      bottom: 27%;
      left: 72%;
    }

    .list-13-11 {
      right: 10px;
      bottom: 15%;
      left: 72%;
    }

    .list-13-12 {
      right: 10px;
      bottom: 1%;
      left: 72%;
    }

    /* 14菜单 */
    .list-14-0 {
      bottom: 13%;
      left: 18%;
    }

    .list-14-1 {
      bottom: 26%;
      left: 18%;
    }

    .list-14-2 {
      bottom: 40%;
      left: 18%;
    }

    .list-14-3 {
      top: 34%;
      left: 3%;
    }

    .list-14-4 {
      top: 21%;
      left: 3%;
    }

    .list-14-5 {
      top: 9%;
      left: 3%;
    }

    .list-14-6 {
      top: -6%;
      left: 16%;
    }

    .list-14-7 {
      right: 10px;
      bottom: 78%;
      left: 72%;
    }

    .list-14-8 {
      right: 10px;
      bottom: 64%;
      left: 72%;
    }

    .list-14-9 {
      right: 10px;
      bottom: 52%;
      left: 72%;
    }

    .list-14-10 {
      right: 10px;
      bottom: 40%;
      left: 72%;
    }

    .list-14-11 {
      right: 10px;
      bottom: 27%;
      left: 72%;
    }

    .list-14-12 {
      right: 10px;
      bottom: 15%;
      left: 72%;
    }

    .list-14-13 {
      right: 10px;
      bottom: 1%;
      left: 72%;
    }

    /* 15菜单 */
    .list-15-0 {
      bottom: 0;
      left: 18%;
    }

    .list-15-1 {
      bottom: 13%;
      left: 18%;
    }

    .list-15-2 {
      bottom: 26%;
      left: 18%;
    }

    .list-15-3 {
      bottom: 40%;
      left: 18%;
    }

    .list-15-4 {
      top: 34%;
      left: 3%;
    }

    .list-15-5 {
      top: 21%;
      left: 3%;
    }

    .list-15-6 {
      top: 9%;
      left: 3%;
    }

    .list-15-7 {
      top: -6%;
      left: 16%;
    }

    .list-15-8 {
      right: 10px;
      bottom: 78%;
      left: 72%;
    }

    .list-15-9 {
      right: 10px;
      bottom: 64%;
      left: 72%;
    }

    .list-15-10 {
      right: 10px;
      bottom: 52%;
      left: 72%;
    }

    .list-15-11 {
      right: 10px;
      bottom: 40%;
      left: 72%;
    }

    .list-15-12 {
      right: 10px;
      bottom: 27%;
      left: 72%;
    }

    .list-15-13 {
      right: 10px;
      bottom: 15%;
      left: 72%;
    }

    .list-15-14 {
      right: 10px;
      bottom: 1%;
      left: 72%;
    }
  }
</style>
