<script setup lang="ts">
import { defineModel } from 'vue'

defineProps<{
  text: string
}>()

const model = defineModel<boolean>()
</script>

<template>
  <label class="custom-checkbox">
    <span class="custom-checkbox__text">{{ text }}</span>
    <input type="checkbox" v-model="model" />
    <span class="custom-checkbox__checkmark"></span>
  </label>
</template>

<style scoped lang="scss">
@use '@/styles/variables';

.custom-checkbox {
  display: inline-flex;
  cursor: pointer;
  user-select: none;

  &__text {
    color: variables.$color-text-secondary;
  }

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  &__checkmark {
    position: relative;
    width: 24px;
    height: 24px;
    background-color: variables.$color-light-300;
    border-radius: 2px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all variables.$transition-duration ease;
    margin-left: 12px;

    &:after {
      content: '';
      position: absolute;
      display: none;
      left: 8px;
      top: 4px;
      width: 6px;
      height: 12px;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }

  input:checked + .custom-checkbox__checkmark {
    background-color: variables.$color-green;

    &:after {
      display: block;
    }
  }
}
</style>
