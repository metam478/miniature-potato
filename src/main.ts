import '@/styles/main.scss'
import 'floating-vue/dist/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { VueQueryPlugin } from '@tanstack/vue-query'
import FloatingVue from 'floating-vue'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import HighChartsVue from 'highcharts-vue'

import App from '@/App.vue'
import router from '@/router'
import en from '@/translations/en.ts'

const i18n = createI18n({
  locale: 'en',
  legacy: false,
  messages: {
    en,
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
