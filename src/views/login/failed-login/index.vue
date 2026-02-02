<!-- 登录失败页 -->
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
        <h1 style="color: white">{{ loginMessage }}</h1>
      </div>
      <div class="footer">
        <Footer />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  const loginMessage = '用户不存在或没有权限，请与系统管理员联系！';
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
