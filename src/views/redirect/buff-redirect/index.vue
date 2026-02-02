<template>
  <div></div>
</template>

<script setup lang="ts">
  import { useRouter, useRoute } from 'vue-router';
  import {
    REDIRECT_ROUTE_NAME,
    NOT_FOUND_NAME,
    BUFF_ROUTE_NAME,
    WHITE_LIST,
  } from '@/router/constants';

  const router = useRouter();
  const route = useRoute();

  const { redirect, ...res } = route.query;

  const redirectToPage = () => {
    const ignorePage = [
      REDIRECT_ROUTE_NAME,
      NOT_FOUND_NAME,
      BUFF_ROUTE_NAME,
      ...WHITE_LIST,
    ];
    if (
      redirect &&
      router.hasRoute(redirect as string) &&
      !ignorePage.includes(redirect as string)
    ) {
      router.replace({
        name: redirect as string,
        query: { ...res },
      });
    } else {
      router.replace({
        name: 'Workplace',
      });
    }
  };

  redirectToPage();
</script>
