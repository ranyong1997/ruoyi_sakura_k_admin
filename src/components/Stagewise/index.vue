<template>
  <div class="stagewise-container">
    <StagewiseToolbar :config="stagewiseConfig" />
  </div>
</template>

<script setup>
import { StagewiseToolbar } from '@stagewise/toolbar-vue'
import { ref } from 'vue'

const stagewiseConfig = ref({
  plugins: []
})
</script> 