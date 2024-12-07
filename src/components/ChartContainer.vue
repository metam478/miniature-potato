<script setup lang="ts">
import { defineProps, withDefaults } from 'vue'
import IInfo from '@/components/icons/IInfo.vue'

withDefaults(
  defineProps<{
    title: string
    tooltip?: string
    isLoading?: boolean | undefined
  }>(),
  {
    tooltip: 'Some info',
    isLoading: false,
  },
)
</script>

<template>
  <div class="chart-container">
    <div class="chart-container__header">
      <h4 class="chart-container__title">{{ title }}</h4>

      <div class="chart-container__actions">
        <slot name="actions" v-if="$slots.actions"> </slot>
        <IInfo v-tooltip="tooltip" />
      </div>
    </div>

    <div class="default-slot-container">
      <div v-show="isLoading" class="skeleton-loader"></div>

      <div v-show="!isLoading">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables';

.default-slot-container {
  min-height: 400px;
  position: relative;
}

.skeleton-loader {
  width: 100%;
  height: 380px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    variables.$color-dark-100 45%,
    variables.$color-dark-150 50%,
    variables.$color-dark-100 55%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 2.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.chart-container {
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-radius: 6px;
  border: variables.$color-border 1px solid;
  background-color: variables.$color-background-secondary;

  &__actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;

    @media (max-width: 768px) {
      justify-content: flex-end;
      flex-direction: column;
      gap: 1rem;
    }
  }

  &__title {
    font-size: 1.3125rem;
    line-height: 1.75rem;
    color: variables.$color-text-primary;
  }
}
</style>
