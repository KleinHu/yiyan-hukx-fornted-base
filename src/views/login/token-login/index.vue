<!-- token单点登录跳转页 -->
<!-- created by lx 2023/6/2 -->
<!-- updated by yuyupeng 2023/10/31 -->
<!-- 使用示例：http://127.0.0.1:5173/token-login?redirect=sysOauthClient&token=bd5ed381-1ef9-497a-8629-54531ea7d3a2 -->
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

  const tokenLogin = async () => {
    const { redirect, token, ...othersQuery } = router.currentRoute.value.query;
    try {
      await userStore.tokenLogin(token as string);
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
    } catch (err) {
      // 登录失败的逻辑
      errorMessage.value = (err as Error).message;
    }
  };
  onMounted(() => {
    tokenLogin();
  });
</script>

<style lange="less" scoped>
  .sso-login-error-msg {
    color: rgb(var(--red-6));
  }
</style>
