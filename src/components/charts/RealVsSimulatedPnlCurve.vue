<script setup lang="ts">
import { useTemplateRef, ref, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { QueryObserver, useQueryClient } from '@tanstack/vue-query'
import Highcharts from 'highcharts'
import { format } from 'date-fns'

import { useStopLossOptimizer } from '@/queries/stopLoss.ts'
import type { Trade } from '@/types/stopLoss.ts'
import ChartContainer from '@/components/ChartContainer.vue'

const { t } = useI18n()
const queryClient = useQueryClient()
const stopLossOptimizer = useStopLossOptimizer()
const stopLossObserver = new QueryObserver(queryClient, {
  queryKey: ['stop_loss_optimizer'],
})

const chartContainer = useTemplateRef('chartContainer')
const stopDistance = ref(5)

const calculateSimulatedPnL = (trades: Trade[], stopDistance: number) => {
  return trades.map((trade: Trade) => {
    const pnlWithoutFees = trade.pnl_usd - trade.fees

    if (trade.mae_percent > stopDistance / 100) {
      const updatedPnL =
        Math.abs(pnlWithoutFees) * (stopDistance / 100 / trade.mae_percent) + trade.fees

      return trade.pnl_usd > 0 ? updatedPnL : -updatedPnL
    }

    return trade.pnl_usd
  })
}

const createChart = () => {
  if (!stopLossOptimizer.data.value) return
  const trades = stopLossOptimizer.data.value.trades
  const timestamps = trades.map((trade: Trade) => format(new Date(trade.timestamp), 'MMM d yyyy'))
  const realPnL = trades.map((trade: Trade) => trade.pnl_usd)

  const cumulativeRealPnL = realPnL.reduce((acc: number[], pnl: number, index: number) => {
    acc.push((acc[index - 1] || 0) + pnl)
    return acc
  }, [])

  const simulatedPnL = calculateSimulatedPnL(trades, stopDistance.value)

  const cumulativeSimulatedPnL = simulatedPnL.reduce(
    (acc: number[], pnl: number, index: number) => {
      acc.push((acc[index - 1] || 0) + pnl)
      return acc
    },
    [],
  )

  // @ts-expect-error useTemplateRef issue
  Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'line',
    },
    title: null,
    xAxis: {
      categories: timestamps,
      title: {
        text: t('date'),
      },
      tickInterval: Math.floor(timestamps.length / 10),
    },
    yAxis: {
      title: {
        text: `${t('cumulative_pnl')} (USD)`,
      },
      labels: {
        formatter: function () {
          return '$' + this.value.toLocaleString('en-US')
        },
      },
    },
    tooltip: {
      shared: true,
      formatter: function (this) {
        // @ts-expect-error points is not typed
        return `<b>${t('date')}: ${timestamps[this.x]}</b><br/> ${t('real_pnl')}: $${this.points[0].y.toFixed(2)}<br/>${t('simulated_pnl')}: $${this.points[1].y.toFixed(2)}`
      },
    },
    series: [
      {
        name: t('real_pnl'),
        data: cumulativeRealPnL,
        marker: {
          enabled: false,
        },
      },
      {
        name: t('simulated_pnl'),
        data: cumulativeSimulatedPnL,
        marker: {
          enabled: false,
        },
      },
    ],
  })
}

const debouncedCreateChart = useDebounceFn(createChart, 500)

stopLossObserver.subscribe(() => {
  createChart()
})

watch([stopDistance], () => {
  debouncedCreateChart()
})
</script>

<template>
  <!--  <input type="number" v-model="stopDistance" />-->

  <ChartContainer
    :title="$t('real_vs_simulated_pnl_curve_chart_title')"
    :is-loading="stopLossOptimizer.isLoading.value"
  >
    <template #default>
      <div id="chart" ref="chartContainer"></div>
    </template>
  </ChartContainer>
</template>
