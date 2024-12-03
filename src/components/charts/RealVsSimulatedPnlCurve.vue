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
import TSNumberInput from '@/components/UI/TSNumberInput.vue'
import colors from '@/utils/colors.ts'

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

  let realPnLBiggerBool = true

  const positiveColor = '#22c55e',
    negativeColor = '#ef4444',
    ranges = [],
    realPnLZones = []

  function intersect(x1: number, x2: number, y1: number, y2: number, y3: number, y4: number) {
    return (x2 * y1 - x1 * y2 - (x2 * y3 - x1 * y4)) / (y4 - y3 - (y2 - y1))
  }

  const addZone = (i: number, fillColor: string) => {
    realPnLZones.push({
      value: intersect(
        i - 1,
        i,
        cumulativeRealPnL[i - 1],
        cumulativeRealPnL[i],
        cumulativeSimulatedPnL[i - 1],
        cumulativeSimulatedPnL[i],
      ),
      fillColor,
    })
  }

  for (let i = 0; i < cumulativeRealPnL.length; i++) {
    ranges.push([i, cumulativeRealPnL[i], cumulativeSimulatedPnL[i]])

    if (cumulativeRealPnL[i] < cumulativeSimulatedPnL[i] && realPnLBiggerBool) {
      addZone(i, positiveColor)
      realPnLBiggerBool = false
    } else if (cumulativeRealPnL[i] > cumulativeSimulatedPnL[i] && !realPnLBiggerBool) {
      addZone(i, negativeColor)
      realPnLBiggerBool = true
    }
  }

  realPnLZones.push({
    value: cumulativeRealPnL.length,
    fillColor: realPnLBiggerBool ? positiveColor : negativeColor,
  })

  // @ts-expect-error element id is not typed
  Highcharts.chart('container', {
    chart: {
      type: 'arearange',
      backgroundColor: 'transparent',
      styledMode: false,
    },
    title: null,
    legend: {
      itemStyle: {
        color: colors.chart.text,
      },
    },
    xAxis: {
      categories: timestamps,
      title: {
        text: t('date'),
        style: {
          color: colors.chart.text,
        },
      },
      labels: {
        style: {
          color: colors.chart.text,
        },
      },
      tickInterval: Math.floor(timestamps.length / 10),
    },
    yAxis: {
      title: {
        text: `${t('cumulative_pnl')} (USD)`,
        style: {
          color: colors.chart.text,
        },
      },
      labels: {
        style: {
          color: colors.chart.text,
        },
        formatter: function () {
          return '$' + this.value.toLocaleString('en-US')
        },
      },
    },
    tooltip: {
      backgroundColor: colors.chart.tooltip.background,
      style: {
        color: colors.chart.text,
      },
      shared: true,
      formatter: function (this) {
        // @ts-expect-error points is not typed
        return `${t('real_pnl')}: $${this.points[0].y.toFixed(2)}<br/>${t('simulated_pnl')}: $${this.points[2].y.toFixed(2)}<br />${t('date')}: ${timestamps[this.x]}`
      },
    },
    series: [
      {
        data: ranges,
        zoneAxis: 'x',
        zones: realPnLZones,
        showInLegend: false,
        marker: {
          enabled: false,
        },
        type: 'arearange',
        fillColor: '#ffffff',
      },
      {
        type: 'line',
        name: 'Real PnL',
        data: cumulativeRealPnL,
        color: '#f00',
        marker: {
          enabled: false,
        },
      },
      {
        type: 'line',
        name: 'Simulated PnL',
        data: cumulativeSimulatedPnL,
        color: '0f0',
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
  <ChartContainer
    :title="$t('real_vs_simulated_pnl_curve_chart_title')"
    :is-loading="stopLossOptimizer.isLoading.value"
  >
    <template #actions>
      <TSNumberInput v-model.number="stopDistance" />
    </template>
    <template #default>
      <div id="container"></div>
    </template>
  </ChartContainer>
</template>
