<!-- szhk身份中台登录跳转页 -->
<!-- created by zyt 2024/6/6 -->
<template>
  <div>
    <div>即将跳转到登录页面</div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted } from 'vue';
  import szhk from '@/config/szhk.json';

  const gotoLogin = async () => {
    // console.log('szhk', szhk);
    const { szhkUrl, loginUrl, clientId, responseType, state, redirectUri } =
      szhk;
    const url = `${szhkUrl}${loginUrl}?client_id=${clientId}&response_type=${responseType}&state=${state}&redirect_uri=${redirectUri}`;
    // console.log('url', url);
    window.open(url, '_self');
  };
  onMounted(() => {
    gotoLogin();
  });
</script>
