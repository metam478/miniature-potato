<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

import Select from '@/components/UI/Select.vue'
import { usePosts } from '@/queries/posts.ts'

const posts = usePosts()

const chartRef = ref(null)

const initializeChart = () => {
  const chart = echarts.init(chartRef.value)

  chart.setOption({
    title: {
      text: 'ECharts entry example',
    },
    tooltip: {},
    xAxis: {
      data: ['shirt', 'cardign', 'chiffon', 'pants', 'heels', 'socks'],
    },
    yAxis: {},
    series: [
      {
        name: 'sales',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20],
      },
    ],
  })
}

onMounted(() => {
  initializeChart()
})
</script>

<template>
  <div class="about">
    <div ref="chartRef" style="width: 600px; height: 400px"></div>

    <Select />
  </div>
</template>

<style></style>
