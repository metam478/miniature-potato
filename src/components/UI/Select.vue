<script setup lang="ts">
import { ref } from 'vue'

const options = ref([
  { value: 'option1', text: 'Option 1' },
  { value: 'option2', text: 'Option 2' },
  { value: 'option3', text: 'Option 3' },
])

const selectedOption = ref(options.value[0].value)
</script>

<template>
  <div class="select-container">
    <label class="label" for="select">Choose an option:</label>
    <select id="select" v-model="selectedOption" class="select">
      <option
        class="select__option"
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.text }}
      </option>
    </select>
    <p>Selected: {{ selectedOption }}</p>
  </div>
</template>

<style scoped lang="scss">
.select-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-family: Arial, sans-serif;
}

.label {
  margin-bottom: 0.5em;
  font-weight: bold;
}

.select {
  padding: 0.5em;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;

  &__option {
    padding: 1.5em;
    background-color: #fff;
    color: #333;

    &:hover {
      background-color: #007bff;
      color: #fff;
    }
  }

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
}

p {
  margin-top: 2em;
  font-size: 1em;
  color: #333;
}
</style>
