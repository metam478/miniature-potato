import '@vuepic/vue-datepicker/dist/main.css'
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
