<script setup lang="ts">
import { ref, watch } from 'vue'
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

  const income = realPnL.reduce((acc: number[], pnl: number, index: number) => {
    acc.push((acc[index - 1] || 0) + pnl)
    return acc
  }, [])

  const simulatedPnL = calculateSimulatedPnL(trades, stopDistance.value)

  const outcome = simulatedPnL.reduce((acc: number[], pnl: number, index: number) => {
    acc.push((acc[index - 1] || 0) + pnl)
    return acc
  }, [])

  let incomeBiggerBool = true

  const positiveColor = '#bfeebf',
    negativeColor = '#fde3e3',
    ranges = [],
    incomeZones = []

  function intersect(x1: number, x2: number, y1: number, y2: number, y3: number, y4: number) {
    return (x2 * y1 - x1 * y2 - (x2 * y3 - x1 * y4)) / (y4 - y3 - (y2 - y1))
  }

  for (let i = 0; i < income.length; i++) {
    ranges.push([i, income[i], outcome[i]])

    if (income[i] < outcome[i] && incomeBiggerBool) {
      incomeZones.push({
        value: intersect(i - 1, i, income[i - 1], income[i], outcome[i - 1], outcome[i]),
        fillColor: positiveColor,
      })
      incomeBiggerBool = false
    } else if (income[i] > outcome[i] && !incomeBiggerBool) {
      incomeZones.push({
        value: intersect(i - 1, i, income[i - 1], income[i], outcome[i - 1], outcome[i]),
        fillColor: negativeColor,
      })
      incomeBiggerBool = true
    }
  }

  if (incomeBiggerBool) {
    incomeZones.push({
      value: income.length,
      fillColor: positiveColor,
    })
  } else {
    incomeZones.push({
      value: income.length,
      fillColor: negativeColor,
    })
  }

  // @ts-expect-error element id is not typed
  Highcharts.chart('container', {
    chart: {
      type: 'arearange',
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
        return `${t('real_pnl')}: $${this.points[0].y.toFixed(2)}<br/>${t('simulated_pnl')}: $${this.points[2].y.toFixed(2)}<br />${t('date')}: ${timestamps[this.x]}`
      },
    },
    series: [
      {
        name: 'Income',
        data: ranges,
        zoneAxis: 'x',
        zones: incomeZones,
        showInLegend: false,
        marker: {
          enabled: false,
        },
      },
      {
        type: 'line',
        name: 'Income',
        data: income,
        color: '#1c1cff',
        marker: {
          enabled: false,
        },
      },
      {
        type: 'line',
        name: 'Outcome',
        data: outcome,
        color: '#00b050',
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

  <ChartContainer :title="$t('real_vs_simulated_pnl_curve_chart_title')">
    <template #default>
      <!--      <div id="chart" ref="chartContainer"></div>-->
      <div id="container"></div>
    </template>
  </ChartContainer>
</template>
