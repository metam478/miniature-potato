<script setup lang="ts">
import { useTemplateRef, watchEffect } from 'vue'
import Highcharts from 'highcharts'

import ChartContainer from '@/components/ChartContainer.vue'
import { useStopLossOptimizer } from '@/queries/stopLoss.ts'

const stopLossOptimizer = useStopLossOptimizer()

const chartContainer = useTemplateRef('chartContainer')

const createChart = () => {
  if (!stopLossOptimizer.data.value) return

  Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'line',
    },
    title: null,
    xAxis: {
      categories: stopLossOptimizer.data.value.mae_ticks.map(
        (tick: number) => Number(tick * 100).toFixed(1) + '%',
      ),
      tickInterval: Math.floor(stopLossOptimizer.data.value.mae_ticks.length / 20),
    },
    yAxis: [
      {
        title: null,
        labels: {
          formatter: function () {
            return '$' + this.value.toLocaleString('en-US')
          },
        },
      },
      {
        title: null,
        opposite: true,
        labels: {
          formatter: function () {
            return this.value + '%'
          },
        },
      },
    ],
    tooltip: {
      shared: true,
      formatter: function () {
        return `<div><b>MAE %: ${this.key}</b><br/>EV: $${this.points[0].y.toLocaleString('en-US')}<br/>Win Rate: ${Number(this.points[1].y).toFixed(2)}%`
      },
    },
    series: [
      {
        name: 'Expected Value (EV)',
        data: stopLossOptimizer.data.value.ev_by_mae,
        yAxis: 0,
      },
      {
        name: 'Win Rate %',
        data: stopLossOptimizer.data.value.recovery_rate_by_mae.map((rate: number) => rate * 100),
        yAxis: 1,
      },
    ],
  })
}

watchEffect(() => {
  createChart()
})
</script>

<template>
  <ChartContainer :title="$t('ev_and_win_rate_chart_title')">
    <template #default>
      <div id="chart" ref="chartContainer"></div>
    </template>
  </ChartContainer>
</template>
