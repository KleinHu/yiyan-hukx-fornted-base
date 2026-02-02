<template>
  <div class="navbar">
    <div class="left-side">
      <div class="left-title">
        <div
          class="left-title-text"
          :style="menuPattern === 1 ? { cursor: 'pointer' } : {}"
          @click="toRootMenu"
        >
          <img
            alt="logo"
            src="@/assets/LOGO.png"
            width="32"
            style="margin-right: 6px"
          />
          {{ projectName }}
        </div>
        <SecretIcon class="left-title-mark" />
      </div>

      <!-- 折叠展开按钮，只对窄屏下的悬浮菜单生效 -->
      <icon-menu-fold
        v-if="!topMenu && appStore.device === 'mobile'"
        style="font-size: 22px; cursor: pointer"
        @click="toggleDrawerMenu"
      />
    </div>
    <div class="center-side">
      <Menu v-if="topMenu" />
    </div>
    <ul class="right-side">
      <!--消息通知-->
      <li>
        <a-tooltip :content="$t('settings.navbar.alerts')">
          <div class="message-box-trigger">
            <a-badge :count="9" dot>
              <a-button
                class="nav-btn"
                type="outline"
                :shape="'circle'"
                @click="setPopoverVisible"
              >
                <icon-notification />
              </a-button>
            </a-badge>
          </div>
        </a-tooltip>
        <a-popover
          trigger="click"
          :arrow-style="{ display: 'none' }"
          :content-style="{ padding: 0, minWidth: '400px' }"
          content-class="message-popover"
        >
          <div ref="refBtn" class="ref-btn"></div>
          <template #content>
            <message-box />
          </template>
        </a-popover>
      </li>
      <!--用户信息-->
      <li>
        <a-dropdown trigger="click">
          <div style="color: #fff; cursor: pointer">
            <icon-user />
            {{ username }}
            <icon-caret-down />
          </div>
          <template #content>
            <!--修改密码-->
            <a-doption>
              <a-space v-if="passwordEditable" @click="changePasswd">
                <icon-edit />
                <span>修改密码</span>
              </a-space>
            </a-doption>
            <a-doption>
              <a-space @click="handleLogout">
                <icon-export />
                <span>
                  {{ $t('messageBox.logout') }}
                </span>
              </a-space>
            </a-doption>
          </template>
        </a-dropdown>
      </li>
    </ul>

    <PasswordModal v-model:visible="passwordModal" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, inject } from 'vue';
  import { projectName } from '@/config/settings.json';
  // import { useDark, useToggle, useFullscreen } from '@vueuse/core';
  import { useAppStore, useUserStore, useTabBarStore } from '@/store';
  import useUser from '@/hooks/user';
  import Menu from '@/components/menu/index.vue';
  import { useRouter } from 'vue-router';
  import { SecretLevel } from '@/constants';
  import SecretIcon from '@/components/secret-icon/index.vue';
  import MessageBox from '../message-box/index.vue';
  import PasswordModal from './password-modal.vue';

  const appStore = useAppStore();
  const userStore = useUserStore();
  const tabBarStore = useTabBarStore();
  const { logout } = useUser();

  // 用户名，取第一个字作为头像
  const username = computed(() => {
    return userStore.username || 'A';
  });

  // 用户角色
  const roles = computed(() => userStore.roles || []);

  // const theme = computed(() => {
  //   return appStore.theme;
  // });
  // 系统密级
  const secretLevel = computed(() => appStore.secretLevel);
  const topMenu = computed(() => appStore.topMenu && appStore.menu);
  const refBtn = ref();
  // const triggerBtn = ref();
  const setPopoverVisible = () => {
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    refBtn.value.dispatchEvent(event);
  };
  const handleLogout = () => {
    logout();
  };

  const ADMINS = ['sysadmin', 'auditadmin', 'safeadmin'];
  const passwordEditable = computed(() => {
    // 机密级应用：仅三员可修改密码
    // 秘密及以下：所有人可修改密码
    if (secretLevel.value < SecretLevel['机密']) {
      return true;
    }
    return roles.value.find((role) => ADMINS.includes(role));
  });
  const passwordModal = ref<boolean>(false);
  const changePasswd = () => {
    passwordModal.value = true;
  };
  const toggleDrawerMenu = inject('toggleDrawerMenu') as () => void;

  const menuPattern = computed(() => appStore.menuPattern);
  const router = useRouter();
  const toRootMenu = () => {
    if (menuPattern.value === 1) {
      tabBarStore.resetTabList();
      router.push({ name: 'rootMenu' });
    }
  };
</script>

<style scoped lang="less">
  .navbar {
    display: flex;
    justify-content: space-between;
    height: 100%;
    // background-color: var(--color-bg-2);
    background: var(--color-blue-avic);
    border-bottom: 1px solid var(--color-border);
  }

  .left-side {
    display: flex;
    align-items: center;
    padding-left: 20px;

    .left-title {
      display: inline-flex;
      height: 32px;
      color: #fff;
      font-weight: bold;
      font-size: 22px;

      &-text {
        display: inline-flex;
        align-items: center;
      }

      &-mark {
        margin: 4px 0 0 6px;
        line-height: 18px;
      }
    }
  }

  .center-side {
    flex: 1;
  }

  .right-side {
    display: flex;
    padding-right: 20px;
    list-style: none;

    :deep(.locale-select) {
      border-radius: 20px;
    }

    li {
      display: flex;
      align-items: center;
      padding: 0 10px;
    }

    a {
      color: var(--color-text-1);
      text-decoration: none;
    }

    .nav-btn {
      color: rgb(var(--gray-8));
      font-size: 16px;
      border-color: rgb(var(--gray-2));
    }

    .trigger-btn,
    .ref-btn {
      position: absolute;
      bottom: 14px;
    }

    .trigger-btn {
      margin-left: 14px;
    }
  }
</style>

<style lang="less">
  .message-popover {
    .arco-popover-content {
      margin-top: 0;
    }
  }
</style>
