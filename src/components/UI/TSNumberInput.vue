<script setup lang="ts">
import { defineModel } from 'vue'
import IUp from '@/components/icons/IUp.vue'
import IDown from '@/components/icons/IDown.vue'

defineProps<{
  label?: string
}>()

const model = defineModel<number>({ default: 0 })

const increment = () => {
  if (!model.value) model.value = 0
  model.value++
}

const decrement = () => {
  if (!model.value) model.value = 0
  model.value--
}
</script>

<template>
  <label class="number-input">
    <span class="number-input__wrapper">
      <input type="number" v-model="model" />

      <span class="number-input__arrows">
        <IUp @click="increment" class="number-input__arrow-up" />
        <IDown @click="decrement" class="number-input__arrow-down" />
      </span>
    </span>
  </label>
</template>

<style scoped lang="scss">
@use '@/styles/variables';

.number-input {
  display: inline-flex;
  flex-direction: column;
  user-select: none;
  position: relative;

  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  input {
    padding: 0.3rem;
    border-radius: 4px;
    border: variables.$color-dark-300 solid 2px;
    background-color: variables.$color-background-primary;
    transition: border-color variables.$transition-duration ease;
    color: variables.$color-text-primary;
    width: 100%;

    &:focus {
      outline: none;
    }

    /* Hide default arrows */
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  &__arrows {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
  }

  &__arrow-up,
  &__arrow-down {
    cursor: pointer;
    width: 16px;
    height: 16px;
  }
}
</style>
