<script setup lang="ts">
defineEmits(['change'])
</script>

<template>
  <div>
    <input
      class="range"
      type="range"
      name=""
      value="0"
      min="0"
      max="1000"
      onChange="emit('change', $event.target.value)"
      onmousemove="emit('change', $event.target.value)"
    />
  </div>
</template>

<style>
.range {
  width: 400px;
  height: 15px;
  -webkit-appearance: none;
  background: #111;
  outline: none;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 1);
}

.range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #00fd0a;
  cursor: pointer;
  border: 4px solid #333;
  box-shadow: -407px 0 0 400px #00fd0a;
}
</style>
