<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { type Options, type SeriesOptionsType } from 'highcharts'
import { Chart } from 'highcharts-vue'

import ChartContainer from '@/components/ChartContainer.vue'
import { useStopLossOptimizer } from '@/queries/stopLoss.ts'
const stopLossOptimizer = useStopLossOptimizer()

const { t } = useI18n()
const stopLossOptimizerSeries = computed(() => {
  if (!stopLossOptimizer?.data?.value) return []

  return [
    {
      name: `${t('expected_value')} (${t('ev')})`,
      data: stopLossOptimizer.data.value.ev_by_mae,
      yAxis: 0,
    },
    {
      name: `${t('win_rate')} %`,
      data: stopLossOptimizer.data.value.recovery_rate_by_mae.map((rate: number) => rate * 100),
      yAxis: 1,
    },
  ]
})

const chartTickInterval = computed(() =>
  stopLossOptimizer.data.value
    ? Math.floor(stopLossOptimizer.data.value?.mae_ticks?.length / 20)
    : 0,
)

const chartOptions = ref<Options>({
  chart: {
    type: 'line',
  },
  title: {
    text: undefined,
  },
  xAxis: {
    categories: stopLossOptimizer.data.value?.mae_ticks.map(
      (tick: number) => Number(tick * 100).toFixed(1) + '%',
    ),
    tickInterval: chartTickInterval.value,
  },
  yAxis: [
    {
      title: undefined,
      labels: {
        formatter: function () {
          return '$' + this.value.toLocaleString('en-US')
        },
      },
    },
    {
      title: undefined,
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
      // @ts-expect-error add custom points interface
      return `<div><b>${t('mae')} %: ${this.key}</b><br/>${t('ev')}: $${this.points[0].y.toLocaleString('en-US')}<br/>Win Rate: ${Number(this.points[1].y).toFixed(2)}%`
    },
  },
  series: stopLossOptimizerSeries as unknown as SeriesOptionsType[],
})
</script>

<template>
  <ChartContainer
    :title="$t('ev_and_win_rate_chart_title')"
    :is-loading="stopLossOptimizer.isLoading.value"
  >
    <template #default>
      <chart :options="chartOptions"></chart>
    </template>
  </ChartContainer>
</template>
