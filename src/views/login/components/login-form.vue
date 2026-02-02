<template>
  <div class="login-form-wrapper">
    <div class="login-form-title">统一身份登录</div>
    <!-- <div class="login-form-sub-title">{{ $t('login.form.title') }}</div> -->
    <span class="login-form-error-msg">{{ errorMessage }}</span>
    <a-form
      v-if="activeForm === 'form'"
      ref="loginForm"
      :model="userInfo"
      class="login-form"
      layout="vertical"
    >
      <a-form-item
        label="用户名"
        field="username"
        :rules="[{ required: true, message: $t('login.form.userName.errMsg') }]"
        :validate-trigger="['change', 'blur']"
        hide-asterisk
      >
        <a-input
          v-model="userInfo.username"
          :placeholder="$t('login.form.userName.placeholder')"
        >
          <template #prefix>
            <icon-user />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item
        label="密码"
        field="password"
        :rules="[{ required: true, message: $t('login.form.password.errMsg') }]"
        :validate-trigger="['change', 'blur']"
        hide-asterisk
      >
        <a-input-password
          v-model="userInfo.password"
          :placeholder="$t('login.form.password.placeholder')"
          allow-clear
        >
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>
      <a-space :size="16" direction="vertical">
        <div class="login-form-password-actions">
          <a-checkbox
            checked="rememberPassword"
            :model-value="loginConfig.rememberPassword"
            @change="setRememberPassword as any"
          >
            {{ $t('login.form.rememberPassword') }}
          </a-checkbox>
          <!-- <a-link>{{ $t('login.form.forgetPassword') }}</a-link> -->
        </div>
        <a-button
          type="primary"
          html-type="submit"
          long
          :loading="loading"
          @click="submit"
        >
          {{ $t('login.form.login') }}
        </a-button>
        <!-- <a-button type="text" long class="login-form-register-btn">
          {{ $t('login.form.register') }}
        </a-button> -->
      </a-space>
    </a-form>

    <!--对话框：验证码-->
    <Verify
      v-if="captchaEnable && activeForm === 'captcha'"
      ref="verify"
      mode="fixed"
      :captcha-type="captchaType"
      :img-size="{ width: '400px', height: '200px' }"
      @back="showForm"
      @success="login"
    />
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import { useI18n } from 'vue-i18n';
  import { useStorage } from '@vueuse/core';
  // import { useUserStore, useAppStore } from '@/store';
  import { useUserStore, useAppStore } from '@/store';
  import useLoading from '@/hooks/loading';
  import type { LoginInfo } from '@/api/model/securityModel';
  import Verify from '@/components/verifition/index.vue';

  const router = useRouter();
  const { t } = useI18n();
  const errorMessage = ref('');
  const { loading, setLoading } = useLoading();
  const userStore = useUserStore();
  const appStore = useAppStore();

  const menuPattern = computed(() => appStore.menuPattern);
  const captchaEnable = computed(() => appStore.captchaEnable);
  const captchaType = computed(() => appStore.captchaType);

  const activeForm = ref<'form' | 'captcha'>('form');

  const loginConfig = useStorage('login-config', {
    rememberPassword: false,
    username: '', // 演示默认值
    password: '', // demo default value
  });
  const userInfo = reactive({
    username: loginConfig.value.username,
    password: loginConfig.value.password,
  });

  const loginForm = ref();
  const submit = async () => {
    const errors = await loginForm.value.validate();
    if (!errors) {
      // 是否开启验证码
      if (captchaEnable.value) {
        // 开启验证码
        activeForm.value = 'captcha';
        // openVerify();
      } else {
        login();
      }
    }
  };
  const login = async (captchaVerification?: string) => {
    setLoading(true);
    try {
      await userStore.login({
        username: userInfo.username,
        password: window.btoa(userInfo.password),
        captchaVerification,
      } as LoginInfo);
      const { redirect, ...othersQuery } = router.currentRoute.value.query;
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
      Message.success(t('login.form.login.success'));
      const { rememberPassword } = loginConfig.value;
      const { username, password } = userInfo;
      // 实际生产环境需要进行加密存储。
      // The actual production environment requires encrypted storage.
      loginConfig.value.username = rememberPassword ? username : '';
      loginConfig.value.password = rememberPassword ? password : '';
    } catch (err) {
      errorMessage.value = (err as Error).message;
    } finally {
      setLoading(false);
    }
  };

  const setRememberPassword = (value: boolean) => {
    loginConfig.value.rememberPassword = value;
  };

  // 验证码
  const verify = ref();
  const showForm = () => {
    activeForm.value = 'form';
  };
</script>

<style lang="less" scoped>
  .login-form {
    // &-wrapper {
    // }
    &-title {
      margin-bottom: 60px;
      color: var(--color-text-1);
      font-weight: bold;
      font-size: 22px;
      // line-height: 32px;
    }

    &-sub-title {
      color: var(--color-text-3);
      font-size: 16px;
      line-height: 24px;
    }

    &-error-msg {
      height: 32px;
      color: rgb(var(--red-6));
      line-height: 32px;
    }

    &-password-actions {
      display: flex;
      justify-content: space-between;
    }

    &-register-btn {
      color: var(--color-text-3) !important;
    }
  }
</style>
