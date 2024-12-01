<script setup lang="ts">
import MaeVsPnlChart from '@/components/charts/MaeVsPnlChart.vue'
import EvAndWinRate from '@/components/charts/EvAndWinRate.vue'
import RealVsSimulatedPnlCurve from '@/components/charts/RealVsSimulatedPnlCurve.vue'
</script>

<template>
  <main class="container">
    <MaeVsPnlChart />
    <RealVsSimulatedPnlCurve />
    <EvAndWinRate />
  </main>
</template>
