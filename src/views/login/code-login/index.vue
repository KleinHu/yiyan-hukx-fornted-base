<!-- szhk身份中台单点登录跳转页 -->
<!-- created by zyt 2024/6/6 -->
<!-- updated by yuyupeng 2023/11/14 -->
<!-- 使用示例：http://127.0.0.1:5173/ticket-login?redirect=sysOauthClient&ticket=bd5ed381-1ef9-497a-8629-54531ea7d3a2 -->
<template>
  <div class="container">
    <!--中间登录框-->
    <div class="content">
      <div class="content-title">
        <div class="content-title-text">
          <img
            alt="logo"
            src="@/assets/LOGO.png"
            width="56"
            style="margin-right: 4px"
          />
        </div>
        <SecretIcon class="content-title-mark" />
      </div>
      <div class="content-inner">
        <a-spin :size="32" style="margin: 20px 20px 20px 0" />
        <h1 style="color: white">{{ loginMessage }}</h1>
      </div>
      <div class="footer">
        <Footer />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, unref, computed, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { useRouter } from 'vue-router';
  import { useUserStore, useAppStore } from '@/store';

  const router = useRouter();
  const userStore = useUserStore();
  const appStore = useAppStore();
  const loginMessage = ref('单点登录中，请稍候');

  const menuPattern = computed(() => appStore.menuPattern);

  const tokenLogin = async () => {
    const { code } = unref(router.currentRoute).query;
    try {
      await userStore.codeLogin(code as string);
      const { redirect, ...othersQuery } = router.currentRoute.value.query;
      const toName = menuPattern.value === 1 ? 'rootMenu' : 'Workplace';
      if (redirect) {
        // 有redirect的时候需要先等待权限和用户信息加载完毕才能跳转
        delete othersQuery.code;
        router.push({
          name: 'Buff',
          query: {
            ...othersQuery,
            redirect,
          },
        });
      } else {
        delete othersQuery.code;
        router.push({
          name: toName,
          query: {
            ...othersQuery,
          },
        });
      }
      Message.success('欢迎使用');
    } catch (err) {
      // 登录失败的逻辑
      // loginMessage.value = (err as Error).message;
      router.push({
        name: 'failedLogin',
      });
    }
  };
  onMounted(() => {
    tokenLogin();
  });
</script>

<style lang="less" scoped>
  .container {
    display: flex;
    height: 100vh;
    background: url('@/assets/images/loginbg-avic.png');
    background-color: var(--color-bg-avic);
    background-position: center;
    background-size: 100% 100%;

    .content {
      margin-top: calc(50vh - 252px);
      margin-left: calc(79vw - 231px);

      .content-title {
        display: inline-flex;
        height: 56px;
        margin-bottom: 44px;
        color: #fff;
        font-weight: bold;
        font-size: 36px;
        font-family: Alibaba, Avenir, 'Helvetica Neue', Arial, Helvetica,
          sans-serif;

        &-text {
          display: inline-flex;
          align-items: center;
        }

        &-mark {
          margin: 6px 0 0 10px;
          line-height: 18px;
        }
      }

      .content-inner {
        display: flex;
        width: 462px;
        padding: 32px 36px;
        // background-color: var(--color-bg-2);

        :deep(.arco-spin-icon) {
          color: white;
        }
      }
    }

    .footer {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 100%;
    }
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

<style lang="less" scoped>
  // responsive
  @media (max-width: @screen-lg) {
    .container {
      .banner {
        width: 25%;
      }
    }
  }
</style>
