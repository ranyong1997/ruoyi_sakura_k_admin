<template>
  <div id="app">
    <router-view />
    <stagewise v-if="isDev" />
  </div>
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings'
import {handleThemeStyle} from '@/utils/theme'
import {addWatermark} from '@/utils/wager_mark'
import Stagewise from '@/components/Stagewise'
import { onMounted, nextTick, ref } from 'vue'

const isDev = process.env.NODE_ENV === 'development'

onMounted(() => {
  nextTick(() => {
    // 初始化主题样式
    handleThemeStyle(useSettingsStore().theme)
    // 初始化水印
    let Watermark = localStorage['layout-setting'] ? JSON.parse(localStorage['layout-setting'])?.watermark : true;
    addWatermark(Watermark)
  })
})
</script>
