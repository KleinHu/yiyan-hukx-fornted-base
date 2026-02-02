<!-- 易研登录跳转页：可以获取另一套易研服务提供的token进行登录 -->
<!-- created by lx 2025/3/1 -->
<!-- 使用示例：http://127.0.0.1:5173/outer-login?redirect=路由名称&token=另一个易研应用的token -->
<template>
  <div>
    <div class="sso-login-error-msg">{{ errorMessage }}</div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, computed, ref } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { useRouter } from 'vue-router';
  import { useUserStore, useAppStore } from '@/store';

  const router = useRouter();
  const userStore = useUserStore();
  const appStore = useAppStore();
  const errorMessage = ref('');

  const menuPattern = computed(() => appStore.menuPattern);

  const ssoLogin = async () => {
    const { redirect, token, ...othersQuery } = router.currentRoute.value.query;
    try {
      await userStore.outerLogin(token as string);
      const toName = menuPattern.value === 1 ? 'rootMenu' : 'Workplace';
      if (redirect) {
        // 有redirect的时候需要先等待权限和用户信息加载完毕才能跳转
        router.push({
          name: 'Buff',
          query: {
            ...othersQuery,
            redirect,
          },
        });
      } else {
        router.push({
          name: toName,
          query: {
            ...othersQuery,
          },
        });
      }
      Message.success('欢迎使用');
    } catch {
      // 登录失败的逻辑
      router.push({
        name: 'failedLogin',
      });
    }
  };
  onMounted(() => {
    ssoLogin();
  });
</script>

<style lange="less" scoped>
  .sso-login-error-msg {
    color: rgb(var(--red-6));
  }
</style>
