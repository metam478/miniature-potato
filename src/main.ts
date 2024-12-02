import '@/styles/main.scss'
import 'floating-vue/dist/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { VueQueryPlugin } from '@tanstack/vue-query'
import FloatingVue from 'floating-vue'
import Highcharts from 'highcharts'
import HighChartsVue from 'highcharts-vue'

import App from '@/App.vue'
import router from '@/router'

const i18n = createI18n({
  locale: 'en',
  legacy: false,
  messages: {
    en: {
      mae: 'MAE',
      ev: 'EV',
      date: 'Date',
      real_pnl: 'Real PnL',
      simulated_pnl: 'Simulated PnL',
      cumulative_pnl: 'Cumulative PnL',
      expected_value: 'Expected value',
      max_mae: 'Max MAE',
      win_rate: 'Win Rate',
      optimal_stop_loss: 'Optimal Stop Loss',
      current_expected_value_per_trade: 'Current expected value per trade',
      expected_value_after_stop_loss: 'Expected value after stop loss:',
      affected_trades: 'Affected trades',
      use_dollars: 'Use dollars',
      apply: 'Apply',
      ev_and_win_rate_chart_title: 'EV and Win rate % at Different Stop loss Distances',
      real_vs_simulated_pnl_curve_chart_title:
        'Real PnL Curve vs Simulated PnL Curve with Stoploss',
      mae_vs_pnl_chart_title: 'Maximum Adverse Excursion (MAE) vs PnL',
    },
  },
})

const app = createApp(App)

Highcharts.setOptions({
  lang: {
    thousandsSep: ',',
    decimalPoint: '.',
  },
  chart: {
    styledMode: true,
  },
})

app.use(i18n)
app.use(createPinia())
app.use(FloatingVue)
app.use(HighChartsVue)
app.use(VueQueryPlugin)
app.use(router)

app.mount('#app')
