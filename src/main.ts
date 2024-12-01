import '@vuepic/vue-datepicker/dist/main.css'
import '@/styles/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { VueQueryPlugin } from '@tanstack/vue-query'

import App from '@/App.vue'
import router from '@/router'

const i18n = createI18n({
  locale: 'en',
  legacy: false,
  messages: {
    en: {
      apply: 'Apply',
    },
  },
})

const app = createApp(App)

app.use(i18n)
app.use(createPinia())
app.use(VueQueryPlugin)
app.use(router)

app.mount('#app')
