<template>
  <div class="cookies-container">
    <el-table :data="localCookies" style="width: 100%" border>
      <el-table-column prop="name" label="Cookie名" min-width="180">
        <template #default="{ row, $index }">
          <el-input v-model="row.name" placeholder="请输入Cookie名称" @input="updateCookies" />
        </template>
      </el-table-column>
      <el-table-column prop="value" label="值" min-width="240">
        <template #default="{ row, $index }">
          <el-input v-model="row.value" placeholder="请输入Cookie值" @input="updateCookies" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="180">
        <template #default="{ row, $index }">
          <el-input v-model="row.description" placeholder="请输入说明" @input="updateCookies" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row, $index }">
          <el-button type="danger" size="small" @click="removeCookie($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="add-btn-container">
      <el-button type="primary" @click="addCookie">添加Cookie</el-button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, defineExpose, ref, watch } from 'vue'

const props = defineProps({
  cookies: {
    type: Array,
    default: () => []
  }
})

// 本地状态，避免直接修改props
const localCookies = ref([...props.cookies])

// 监听props变化
watch(() => props.cookies, (newCookies) => {
  localCookies.value = [...newCookies]
}, { deep: true })

const emit = defineEmits(['update:cookies'])

// 更新父组件中的数据
const updateCookies = () => {
  emit('update:cookies', [...localCookies.value])
}

const addCookie = () => {
  localCookies.value.push({
    name: '',
    value: '',
    description: ''
  })
  updateCookies()
}

const removeCookie = (index) => {
  localCookies.value.splice(index, 1)
  updateCookies()
}

const getDataLength = () => {
  return localCookies.value.length
}

defineExpose({
  getDataLength
})
</script>

<style lang="scss" scoped>
.cookies-container {
  width: 100%;
}

.add-btn-container {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}
</style>