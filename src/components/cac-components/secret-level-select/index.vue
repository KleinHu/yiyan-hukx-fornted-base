<!--组件：密级选择器-->
<template>
  <div>
    <a-select
      v-model="selected"
      :allow-clear="allowClear"
      :disabled="disabled"
      :options="options"
      placeholder="请选择密级"
      :loading="loading"
      style="width: 100%"
      @change="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch, computed } from 'vue';
  import { queryDictDataRecordList } from '@/api/system/dictionary';
  import { useAppStore, useUserStore } from '@/store';

  const props = defineProps({
    defaultValue: { type: String, default: '' },
    allowClear: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  });
  const emits = defineEmits(['change', 'update:modelValue']);

  watch(props, () => {
    selected.value = props.defaultValue;
  });

  const appStore = useAppStore();
  const userStore = useUserStore();
  const secretLevel = computed(() => appStore.secretLevel);
  const userSecretLevel = computed(() => userStore.secretLevel || 4);

  const validateSecret = (level: string) => {
    // 校验密级是否满足条件：
    // 1密级应小于用户本身的密级
    // 2密级应小于系统密级
    if (parseInt(level, 10) <= secretLevel.value) {
      return parseInt(level, 10) <= userSecretLevel.value;
    }
    return false;
  };

  const selected = ref<string>(props.defaultValue);
  const loading = ref<boolean>(false);

  const options = ref<{ label: string; value: string }[]>([]);
  const fetchOptions = async () => {
    try {
      const { data } = await queryDictDataRecordList({
        dictType: 'secretLevelData',
      });
      const list: { label: string; value: string }[] = [];
      data.forEach(({ label, value }) => {
        if (label && value && validateSecret(value)) {
          list.push({ label, value });
        }
      });
      options.value = list;
    } finally {
      loading.value = false;
    }
  };
  onMounted(() => {
    fetchOptions();
  });
  const handleChange = (
    value: string | number | Record<string, any> | boolean
  ) => {
    emits('change', value);
    emits('update:modelValue', value);
  };
</script>
