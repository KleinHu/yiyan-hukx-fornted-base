<!-- 通过userid获取username组件 -->

<template>
  <span>
    {{ username }}
  </span>
</template>

<!--新script-->
<script lang="ts" setup>
  import { queryUserRecordById } from '@/api/system/user';
  import { ref, onMounted } from 'vue';
  //   import { Notification } from '@arco-design/web-vue';

  const username = ref<string>();
  const props = defineProps({
    userId: { type: String, required: true },
  });

  // 获取用户信息
  const getUserName = async () => {
    try {
      const { data } = await queryUserRecordById(props.userId);
      username.value = data.username;
    } finally {
      //
    }
  };

  /**
   * onMounted
   */
  onMounted(() => {
    getUserName();
  });
</script>

<style>
  .tooltip-text {
    cursor: pointer;
  }
</style>
