<template>
  <VueDatePicker
    v-model="date"
    dark
    range
    multi-calendars
    :hide-offset-dates="true"
    :enable-time-picker="false"
  >
    <template #action-row="{ selectDate }">
      <TSButton :label="$t('apply')" @click="selectDate" />
    </template>

    <template #left-sidebar>
      <div class="sidebar">
        <ul>
          <li
            v-for="item in items"
            :key="item"
            :class="{ selected: item === selectedItem }"
            @click="selectItem(item)"
          >
            {{ item }}
          </li>
        </ul>
      </div>
    </template>
  </VueDatePicker>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import VueDatePicker from '@vuepic/vue-datepicker'

import TSButton from '@/components/UI/TSButton.vue'

const date = ref()
const items = ref([
  'Item 1',
  'Item 2',
  'Item 3',
  'Item 4',
  'Item 5',
  'Item 6',
  'Item 7',
  'Item 8',
  'Item 9',
  'Item 10',
  'Item 11',
  'Item 12',
])
const selectedItem = ref(null)

const selectItem = (item) => {
  selectedItem.value = item
}

onMounted(() => {
  const startDate = new Date()
  const endDate = new Date(new Date().setDate(startDate.getDate() + 7))
  date.value = [startDate, endDate]
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss';

.sidebar {
  width: 8rem;
  overflow-y: auto;
  max-height: 20rem;

  & ul {
    list-style: none;
    padding: 0;
  }

  & li {
    padding: 0.5rem 0.75rem;
    color: variables.$color-dark-400;
    transition: background-color variables.$transition-duration;
    cursor: pointer;
    position: relative;

    &:hover {
      color: variables.$color-light-100;
    }

    &.selected {
      color: variables.$color-light-100;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: variables.$color-green;
      }
    }
  }

  /* Custom skinny scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
}
</style>

<style lang="scss">
.dp__action_row {
  display: flex;
  justify-content: flex-end;
}
</style>
