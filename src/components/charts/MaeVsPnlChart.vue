<script setup lang="ts">
import { useTemplateRef, ref, computed, watch, watchEffect } from 'vue'
import { refThrottled, useDebounceFn } from '@vueuse/core'
import Highcharts from 'highcharts'

import ChartContainer from '@/components/ChartContainer.vue'
import { useStopLossOptimizer } from '@/queries/stopLoss.ts'
import type { Trade } from '@/types/stopLoss.ts'
import { format } from 'date-fns'

const stopLossOptimizer = useStopLossOptimizer()

const chartContainer = useTemplateRef('chartContainer')
const useDollars = ref(false)
const stopLoss = ref(0)
const stopLossThrottled = refThrottled(stopLoss, 50)
const showPercentage = ref(false)

const maxMAE = computed(() => {
  if (!stopLossOptimizer?.data?.value) return 0

  return Math.max(...stopLossOptimizer.data.value.trades.map((t: Trade) => t.mae_percent))
})

const calculateMetrics = (stopLoss: number) => {
  const trades = stopLossOptimizer.data.value?.trades
  if (!trades) return {}

  const affectedTrades = trades.filter((trade: Trade) => trade.mae_percent > stopLoss)
  const totalTrades = trades.length

  const modifiedPnL = trades.map((trade: Trade) =>
    trade.mae_percent > stopLoss ? -(stopLoss * trade.pnl_usd) / trade.mae_percent : trade.pnl_usd,
  )

  const currentEV =
    trades.reduce((sum: number, trade: Trade) => sum + trade.pnl_usd, 0) / totalTrades
  const improvedEV = modifiedPnL.reduce((sum: number, pnl: number) => sum + pnl, 0) / totalTrades

  return {
    current_ev: currentEV,
    improved_ev: improvedEV,
    ev_improvement_pct: ((improvedEV - currentEV) / Math.abs(currentEV)) * 100,
    affected_trades_pct: (affectedTrades.length / totalTrades) * 100,
  }
}

const metrics = computed(() => {
  return calculateMetrics(stopLossThrottled.value)
})

const formatData = () => {
  return stopLossOptimizer.data.value?.trades.map((trade: Trade) => ({
    x: trade.mae_percent,
    y: showPercentage.value ? trade.pnl_percent : trade.pnl_usd,
    timestamp: trade.timestamp,
    color: trade.pnl_usd >= 0 ? '#22c55e' : '#ef4444',
  }))
}

const createChart = () => {
  // @ts-expect-error useTemplateRef issue
  Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'scatter',
      zoomType: 'xy',
      height: '400px',
    },
    title: {
      text: null,
    },
    xAxis: {
      title: {
        text: 'MAE (%)',
      },
      min: 0,
    },
    yAxis: {
      title: {
        text: `PnL (${showPercentage.value ? '%' : '$'})`,
      },
    },
    plotOptions: {
      scatter: {
        marker: {
          radius: 5,
        },
      },
    },
    tooltip: {
      formatter: function () {
        return `<b>MAE:</b> ${this.x.toFixed(2)}%<br/>
                <b>PnL:</b> ${showPercentage.value ? `${this.y.toFixed(2)}%` : `$${this.y.toFixed(2)}`}<br/>
                <b>Date:</b> ${format(new Date(this.point.timestamp), 'MMM d yyyy')}`
      },
    },
    legend: {
      enabled: false,
    },
    series: [
      {
        name: 'Trades',
        data: formatData()?.map((point) => ({
          x: point.x,
          y: point.y,
          timestamp: point.timestamp,
          marker: {
            fillColor: point.color,
          },
        })),
      },
      // {
      //   name: 'Stop Loss Line',
      //   type: 'line',
      //   color: '#ff0000',
      //   dashStyle: 'Dash',
      //   data: [
      //     [currentStopLoss, -10000],
      //     [currentStopLoss, 10000],
      //   ],
      //   enableMouseTracking: false,
      // },
    ],
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
  <div style="color: white">
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

    <div>
      <h3>Optimal Stop Loss</h3>
      <p>{data.optimal_stop.optimal_stoploss}%</p>
      <h3>Expected Value</h3>
      <p>Current: {{ metrics.current_ev?.toFixed(2) }}/trade</p>
      <p>Improved: {{ metrics.improved_ev?.toFixed(2) }}/trade</p>
      <p>Improvement: {{ metrics.ev_improvement_pct?.toFixed(1) }}%</p>
      <p>Affected Trades: {{ metrics.affected_trades_pct?.toFixed(1) }}%</p>
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
