<!--通用组件：文件导出(为excel)-->
<template>
  <div>
    <a-button :type="type" @click="download">
      <template v-if="showIcon" #icon>
        <icon-import />
      </template>
      {{ text }}
    </a-button>
  </div>
</template>

<script setup lang="ts" name="FileExport">
  import { PropType } from 'vue';
  import { exportFile } from '@/api/file';

  const props = defineProps({
    type: {
      // 控制按钮类型
      type: String as PropType<
        'primary' | 'text' | 'dashed' | 'outline' | 'secondary' | undefined
      >,
      default: 'secondary',
    },
    showIcon: { type: Boolean, default: true },
    text: { type: String, default: '导出Excel' },
    action: { type: String, default: '' },
    fileName: { type: String, default: '导出文件' },
  });

  const download = async () => {
    if (props.action === '') {
      return;
    }
    try {
      const res = (await exportFile(props.action)) as unknown as Blob;
      const elink = document.createElement('a');
      elink.download = `${props.fileName}.xlsx`;
      elink.style.display = 'none';
      const blob = new Blob([res], { type: 'application/vnd.ms-excel' });
      elink.href = URL.createObjectURL(blob);
      document.body.appendChild(elink);
      elink.click();
      document.body.removeChild(elink);
    } catch (e) {
      // empty
    }
  };
</script>
