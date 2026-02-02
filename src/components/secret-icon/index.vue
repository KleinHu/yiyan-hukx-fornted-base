<!--密级图标：根据系统密级引入svg图标-->
<template>
  <div>
    <Level1Icon v-if="secretLevel === 10" />
    <Level2Icon v-if="secretLevel === 20" />
    <Level3Icon v-if="secretLevel === 40" />
    <Level4Icon v-if="secretLevel === 50" />
    <Level5Icon v-if="secretLevel === 60" />
    <Level6Icon v-if="secretLevel === 70" />
  </div>
</template>

<script setup lang="ts" name="SecretIcon">
  import { computed } from 'vue';
  import { useAppStore } from '@/store';
  import Level1Icon from '@/assets/images/secret-icon/level1.svg?component';
  import Level2Icon from '@/assets/images/secret-icon/level2.svg?component';
  import Level3Icon from '@/assets/images/secret-icon/level3.svg?component';
  import Level4Icon from '@/assets/images/secret-icon/level4.svg?component';
  import Level5Icon from '@/assets/images/secret-icon/level5.svg?component';
  import Level6Icon from '@/assets/images/secret-icon/level6.svg?component';

  const appStore = useAppStore();
  const secretLevel = computed(() => appStore.secretLevel);
</script>
