<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card
      class="general-card"
      :header-style="{ paddingBottom: '0' }"
      :body-style="{
        padding: '20px',
      }"
    >
      <template #title> echarts-饼图 </template>
      <Chart height="310px" :option="chartOption" />
    </a-card>
  </a-spin>
</template>

<script lang="ts" setup>
  import useLoading from '@/hooks/loading';
  import useChartOption from '@/hooks/chart-option';

  const { loading } = useLoading();
  const { chartOption } = useChartOption(() => {
    // echarts support https://echarts.apache.org/zh/theme-builder.html
    // It's not used here
    return {
      title: {
        text: '通途MES各分支代码统计饼图',
        left: '5%',
        textStyle: {
          color: '#0c8aff',
          fontSize: 18,
        },
      },
      color: ['#6CAAF5', '#A079DC', '#3D72F6', '#2cecbe', '#38e532', '#d5ad2c'], // 图例的颜色
      legend: {
        bottom: '0%', // 距底部2%
        left: 'center', // 距左边50
      },
      tooltip: {
        trigger: 'axis',
        showContent: false,
      },
      dataset: {
        source: [
          ['dnc分支', 21621],
          ['dxe分支', 13226],
          ['xwx分支', 12073],
          ['schk分支', 11277],
          ['ufkj分支', 8727],
          ['citc分支', 8681],
        ],
      },
      xAxis: { type: 'category', show: false },
      series: [
        {
          type: 'pie',
          id: 'pie',
          radius: '50%',
          center: ['50%', '50%'],
          // emphasis: {
          //   focus: 'self'
          // },
          label: {
            formatter: '{b}: ({d}%)',
          },
        },
      ],
    };
  });
</script>

<style scoped lang="less"></style>
