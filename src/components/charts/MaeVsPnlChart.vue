<script setup lang="ts">
import { useTemplateRef, ref, computed, watch, watchEffect } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import Highcharts from 'highcharts'

import ChartContainer from '@/components/ChartContainer.vue'
import { useStopLossOptimizer } from '@/queries/stopLoss.ts'
import type { Trade } from '@/types/stopLoss.ts'

const stopLossOptimizer = useStopLossOptimizer()

const chartContainer = useTemplateRef('chartContainer')
const useDollars = ref(false)
const stopLoss = ref(0)

const maxMAE = computed(() => {
  if (!stopLossOptimizer?.data?.value) return 0

  return Math.max(...stopLossOptimizer.data.value.trades.map((t: Trade) => t.mae_percent))
})

const scatterData = computed(() => {
  if (!stopLossOptimizer?.data?.value) return []

  return stopLossOptimizer?.data?.value?.trades?.map((trade: Trade) => ({
    x: trade.mae_percent,
    y: useDollars.value ? trade.pnl_usd : trade.pnl_percent,
  }))
})

const createChart = () => {
  // @ts-expect-error useTemplateRef issue
  Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'scatter',
      height: '400px',
    },
    title: null,
    xAxis: {
      title: {
        text: 'MAE (%)',
      },
      min: 0,
      max: maxMAE.value,
    },
    yAxis: {
      title: {
        text: useDollars.value ? 'PnL ($)' : 'PnL (%)',
      },
    },
    series: [
      {
        name: 'Trades',
        data: scatterData.value,
        color: 'rgba(70, 130, 180, 0.5)',
        marker: {
          radius: 4,
        },
      },
      {
        name: 'Stop Loss Line',
        type: 'line',
        color: 'red',
        dashStyle: 'dash',
        data: [
          [stopLoss.value, -1000000],
          [stopLoss.value, 1000000],
        ],
        enableMouseTracking: false,
      },
    ],
    tooltip: {
      formatter: function () {
        return (
          `<b>MAE:</b> ${this.x.toFixed(2)}%<br/>` +
          `<b>PnL:</b> ${useDollars.value ? `$${this.y?.toFixed(2)}` : `${this.y?.toFixed(2)}%`}`
        )
      },
    },
  })
}

const debouncedCreateChart = useDebounceFn(createChart, 500)

watch([stopLoss, useDollars], () => {
  debouncedCreateChart()
})

watchEffect(() => {
  if (!stopLossOptimizer?.data?.value) return
  stopLoss.value = stopLossOptimizer.data.value.optimal_stop.optimal_stoploss
})
</script>

<template>
  <div>
    {{ maxMAE }}
    <div>
      <label for="stopLossSlider">Stoploss Distance: {{ stopLoss }}</label>
      <input
        type="range"
        id="stopLossSlider"
        v-model="stopLoss"
        :min="0"
        :max="maxMAE"
        step="0.01"
      />
    </div>
    <div>
      <label>
        <input type="checkbox" v-model="useDollars" />
        Use Dollars
      </label>
    </div>
    <div>
      <p>
        Current Expected Value per Trade:
        {{ stopLossOptimizer?.data?.value?.optimal_stop?.current_ev }}
      </p>
      <p>
        Expected Value after Stop Loss:
        {{ stopLossOptimizer?.data?.value?.optimal_stop?.improved_ev }}
      </p>
      <p>Stoploss Distance: {{ stopLoss }}</p>
    </div>

    <ChartContainer
      :title="$t('mae_vs_pnl_chart_title')"
      :is-loading="stopLossOptimizer.isLoading.value"
    >
      <template #default>
        <div id="chart" ref="chartContainer"></div>
      </template>
    </ChartContainer>
  </div>
</template>
