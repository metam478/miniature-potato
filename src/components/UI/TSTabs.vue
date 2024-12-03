<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  tabs: string[]
}>()

const activeTab = ref(0)

const setActiveTab = (index: number) => {
  console.log('set active tab')
  activeTab.value = index
}
</script>

<template>
  <div class="tabs">
    <div
      v-for="(tab, index) in tabs"
      :key="index"
      :class="['tab', { active: activeTab === index }]"
      @click="setActiveTab(index)"
    >
      {{ tab }}
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables';

.tabs {
  display: flex;
  border-radius: 2px;
}

.tab {
  flex: 1;
  padding: 6px 12px;
  margin: 4px;
  text-align: center;
  cursor: pointer;
  background-color: variables.$color-dark-100;
  color: variables.$color-light-300;
  border-radius: 2px;
  transition:
    background-color 0.3s,
    color 0.3s;

  &.active {
    background-color: variables.$color-dark-300;
    color: variables.$color-light-100;
  }

  &:hover {
    color: variables.$color-light-200;
  }

  &:not(:last-child) {
    margin-right: 4px;
  }
}
</style>
