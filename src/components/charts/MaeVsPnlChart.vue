<script setup lang="ts">
import { useTemplateRef, ref, computed, watch, watchEffect } from 'vue'
import { refThrottled, useDebounceFn } from '@vueuse/core'
import Highcharts from 'highcharts'

import ChartContainer from '@/components/ChartContainer.vue'
import { useStopLossOptimizer } from '@/queries/stopLoss.ts'
import type { Trade } from '@/types/stopLoss.ts'
import type { ExtendedPoint } from '@/types/highcharts.ts'
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
  console.log('stoploss.value', stopLoss.value)
  // @ts-expect-error useTemplateRef issue
  Highcharts.chart(chartContainer.value, {
    chart: {
      type: 'scatter',
      height: '400px',
      events: {
        load: function () {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const chart = this
          const lineWidth = 3
          const handleHeight = 48
          const handleWidth = 12

          const draggableLine = chart.renderer
            .g()
            .attr({
              translateX: chart.plotLeft + chart.plotWidth / 2,
            })
            .add()

          chart.renderer
            .path(['M', 0, 0, 'L', 0, chart.plotHeight])
            .attr({
              'stroke-width': lineWidth,
              'pointer-events': 'all',
              cursor: 'ew-resize',
              stroke: 'lightgray',
            })
            .add(draggableLine)

          chart.renderer
            .rect(
              -handleWidth / 2,
              (chart.plotHeight - handleHeight) / 2,
              handleWidth,
              handleHeight,
              4,
            )
            .attr({
              fill: 'lightgray',
              'pointer-events': 'all',
              cursor: 'ew-resize',
            })
            .add(draggableLine)

          let isDragging = false

          const dragStart = function (e: MouseEvent) {
            e.preventDefault()
            isDragging = true
            chart.container.style.cursor = 'ew-resize'
          }

          const dragMove = function (e: MouseEvent) {
            if (isDragging) {
              e.preventDefault()
              const normalizedEvent = chart.pointer.normalize(e)
              const newX = Math.min(
                Math.max(chart.plotLeft, normalizedEvent.chartX),
                chart.plotLeft + chart.plotWidth,
              )

              draggableLine.attr({
                translateX: newX,
              })

              stopLoss.value = +chart.xAxis[0].toValue(newX).toFixed(3)
            }
          }

          const dragEnd = function (e: MouseEvent) {
            e.preventDefault()
            isDragging = false
            chart.container.style.cursor = 'default'
          }

          draggableLine.element.addEventListener('mousedown', dragStart as EventListener)
          document.addEventListener('mousemove', dragMove)
          document.addEventListener('mouseup', dragEnd)

          draggableLine.element.addEventListener('touchstart', dragStart as EventListener)
          document.addEventListener('touchmove', dragMove as EventListener)
          document.addEventListener('touchend', dragEnd as EventListener)
        },
      },
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
      formatter: function (this: ExtendedPoint) {
        return `<b>MAE:</b> ${this.x.toFixed(2)}%<br/>
                <b>PnL:</b> ${showPercentage.value ? `${this.y?.toFixed(2)}%` : `$${this.y?.toFixed(2)}`}<br/>
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
    ],
  })
}

const debouncedCreateChart = useDebounceFn(createChart, 500)

watch([useDollars], () => {
  debouncedCreateChart()
})

watchEffect(() => {
  if (!stopLossOptimizer?.data?.value) return
  stopLoss.value = stopLossOptimizer.data.value.optimal_stop.optimal_stoploss
  debouncedCreateChart()
})
</script>

<template>
  <div style="color: white">
    <div>
      <h3>Optimal Stop Loss: {{ stopLossOptimizer.data.value?.optimal_stop.optimal_stoploss }}</h3>

      <h3>Expected Value</h3>
      <p>Max MAE: {{ maxMAE }}</p>
      <p>Current expected value per trade: {{ metrics.current_ev?.toFixed(2) }}$ per trade</p>
      <p>Expected value after stop loss: {{ metrics.improved_ev?.toFixed(2) }}$ per trade</p>
      <p>Expected value after stop loss: {{ metrics.ev_improvement_pct?.toFixed(1) }}%</p>
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
