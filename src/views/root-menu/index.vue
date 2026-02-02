<!-- 主菜单 -->
<!-- created by lx 2023/5/11 -->
<template>
  <div class="nav-bar-body">
    <!-- 头部logo标签 -->
    <div class="logo">
      <img alt="logo" src="@/assets/LOGO.png" width="23" />
      <div class="logo-text">易研DxE</div>
    </div>

    <!--右上密级-->
    <div class="secret-level">
      <icon-star-fill />
      {{ SecretLevel[secretLevel] }}
    </div>
    <!-- 脚部菜单 -->
    <div class="nav-bar-container">
      <!-- 菜单栏 -->
      <div ref="scroller" class="nav-bar-scroll">
        <div
          class="nav-bar-nav"
          :style="{ transform: `translateX(${slidPosition}px)` }"
        >
          <div ref="menu" style="display: inline">
            <div
              v-for="item in menuList"
              :key="item.name"
              class="nav-bar-item"
              @click="toPath(item)"
            >
              <div style="margin-bottom: 4px">
                <a-avatar
                  shape="square"
                  :size="90"
                  style="background-color: var(--cac-transparent-2)"
                  class="nav-bar-icon"
                >
                  <component :is="renderIcon(item.meta.icon || '')" />
                </a-avatar>
              </div>
              {{ item.meta.title }}
            </div>
          </div>
        </div>
      </div>
      <!-- 滑动按钮 -->
      <span class="nav-bar-btn nav-bar-btn-left">
        <icon-left style="cursor: pointer" @click="transLeft" />
      </span>
      <span class="nav-bar-btn nav-bar-btn-right">
        <icon-right style="cursor: pointer" @click="transRight" />
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import usePermissionStore from '@/store/modules/permission';
  import { useRouter } from 'vue-router';
  import { useAppStore } from '@/store';
  import {
    computed,
    h,
    compile,
    onBeforeMount,
    onBeforeUnmount,
    onMounted,
    ref,
  } from 'vue';
  import { SecretLevel } from '@/constants';

  const permissionStore = usePermissionStore();
  const router = useRouter();
  const appStore = useAppStore();

  // 主菜单列表
  const menuList = computed(() => permissionStore.modules);

  // 系统密级
  const secretLevel = computed(() => appStore.secretLevel);

  const menu = ref<any>();
  const scroller = ref<any>();

  const slidPosition = ref<number>(0);
  const windowWith = ref<number>(0);
  const menuWidth = ref<number>(0);

  const minPos = computed(() => windowWith.value - menuWidth.value);
  const maxPos = ref<number>(0);

  const scrollable = computed(() => windowWith.value < menuWidth.value);

  const slidLen = computed(
    () => parseInt(String(windowWith.value / 128), 10) * 128
  );

  const resizeMenu = () => {
    menuWidth.value = menu.value.offsetWidth;
    windowWith.value = scroller.value.offsetWidth;

    // 重新定位menu显示项
    if (windowWith.value >= menuWidth.value) {
      slidPosition.value = (windowWith.value - menuWidth.value) / 2;
    } else {
      const offset = slidPosition.value;
      if (menuWidth.value + offset < windowWith.value) {
        const moveX = windowWith.value - offset - menuWidth.value;
        slidPosition.value += moveX;
      }
    }
  };

  onMounted(() => {
    resizeMenu();
  });

  onBeforeMount(() => {
    window.addEventListener('resize', resizeMenu);
  });
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resizeMenu);
  });

  // 右滑按钮：窗口不动，内容向左
  const transRight = () => {
    if (!scrollable.value) {
      return;
    }
    const newPos = slidPosition.value - slidLen.value;
    slidPosition.value = newPos > minPos.value ? newPos : minPos.value;
  };

  // 左滑按钮：窗口不动，内容向右
  const transLeft = () => {
    if (!scrollable.value) {
      return;
    }
    const newPos = slidPosition.value + slidLen.value;
    slidPosition.value = newPos > maxPos.value ? maxPos.value : newPos;
  };

  // 点击主菜单项跳转
  const toPath = async (item: any) => {
    permissionStore.switchModules(item.name, router);
    router.push({
      name: 'Workplace',
    });
  };

  // 渲染icon
  const renderIcon = (iconType: string) => {
    if (iconType) {
      return h(compile(`<${iconType} />`));
    }
    return h(compile(`<icon-user />`));
  };
</script>

<style lang="less" scoped>
  .nav-bar-body {
    position: absolute;
    width: 100%;
    height: 100%;
    background: url('@/assets/images/bg2.jpg') no-repeat;
    background-position: center;
    background-size: 100% 100%;
  }

  .nav-bar-header {
    position: relative;
    display: block;
    width: 100%;
    height: 8%;
    padding-left: 20px;
    color: #fff;
    font-size: 1rem;
    line-height: 72px;
  }

  .nav-bar-container {
    position: relative;
    top: 78%;
    width: 100%;
    height: 20%;
  }

  .nav-bar-scroll {
    position: relative;
    left: 100px;
    width: calc(100% - 200px);
    height: 100%;
    overflow: hidden;
  }

  .nav-bar-nav {
    position: relative;
    width: 100%;
    white-space: nowrap;
    transition: transform 0.3s;
  }

  .nav-bar-item {
    position: relative;
    display: inline-block;
    width: 120px;
    margin: 0 4px;
    color: azure;
    text-align: center;
    cursor: pointer;
  }

  .nav-bar-icon {
    font-size: 48px;
    cursor: pointer;
  }

  .nav-bar-btn {
    position: absolute;
    top: 0;
    z-index: 2;
    color: rgb(255 255 255 / 70%);
    font-size: 32px;
    line-height: 90px;

    &-left {
      left: 28px;
    }

    &-right {
      right: 28px;
    }
  }

  .nav-bar-btn:hover {
    color: aliceblue;
  }

  .logo {
    position: fixed;
    top: 24px;
    left: 22px;
    z-index: 1;
    display: inline-flex;
    align-items: center;

    &-text {
      margin-right: 4px;
      margin-left: 4px;
      color: var(--color-fill-1);
      font-size: 20px;
    }
  }

  .secret-level {
    position: fixed;
    top: 24px;
    right: 22px;
    display: inline-flex;
    align-items: center;
  }
</style>
