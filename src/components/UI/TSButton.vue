<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    type: 'primary' | 'secondary' | 'ghost'
  }>(),
  {
    type: 'primary',
  },
)
</script>

<template>
  <button :class="['button', type]">{{ label }}</button>
</template>

<style scoped lang="scss">
@use '@/styles/variables';

.button {
  padding: 0.5rem 1.25rem;
  transition: background-color variables.$transition-duration;

  &.primary {
    color: variables.$color-text-button-primary;
    background-color: variables.$color-background-button-primary;

    &:hover {
      background-color: variables.$color-background-button-primary-hover;
    }
  }

  &.secondary {
    color: variables.$color-text-button-secondary;
    background-color: variables.$color-background-button-secondary;

    &:hover {
      background-color: variables.$color-background-button-secondary-hover;
    }
  }

  &.ghost {
    color: variables.$color-text-button-tertiary;
    background-color: variables.$color-background-button-tertiary;

    &:hover {
      background-color: variables.$color-background-button-tertiary-hover;
    }
  }
}
</style>
