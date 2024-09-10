<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('https://github.com/ranyong1997/ruoyi_sakura_k_admin');

function goto() {
  window.open(url.value)
}
</script>
