<template>
  <router-view/>
</template>

<script setup>
import useSettingsStore from '@/store/modules/settings'
import {handleThemeStyle} from '@/utils/theme'
import {addWatermark} from '@/utils/wager_mark'

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
