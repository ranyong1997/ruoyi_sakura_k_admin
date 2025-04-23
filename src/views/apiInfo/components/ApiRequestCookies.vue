<template>
  <div class="cookies-container">
    <el-table :data="cookies" style="width: 100%" border>
      <el-table-column prop="name" label="Cookie名" min-width="180">
        <template #default="{ row, $index }">
          <el-input v-model="row.name" placeholder="请输入Cookie名称" />
        </template>
      </el-table-column>
      <el-table-column prop="value" label="值" min-width="240">
        <template #default="{ row, $index }">
          <el-input v-model="row.value" placeholder="请输入Cookie值" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="180">
        <template #default="{ row, $index }">
          <el-input v-model="row.description" placeholder="请输入说明" />
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
import { defineProps, defineEmits, defineExpose } from 'vue'

const props = defineProps({
  cookies: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:cookies'])

const addCookie = () => {
  const newCookies = [...props.cookies]
  newCookies.push({
    name: '',
    value: '',
    description: ''
  })
  emit('update:cookies', newCookies)
}

const removeCookie = (index) => {
  const newCookies = [...props.cookies]
  newCookies.splice(index, 1)
  emit('update:cookies', newCookies)
}

const getDataLength = () => {
  return props.cookies.length
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