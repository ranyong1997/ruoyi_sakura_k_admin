<template>
  <div class="headers-container">
    <el-table :data="headers" style="width: 100%" border>
      <el-table-column prop="name" label="Header名" min-width="180">
        <template #default="{ row, $index }">
          <el-input v-model="row.name" placeholder="请输入Header名称" />
        </template>
      </el-table-column>
      <el-table-column prop="value" label="值" min-width="240">
        <template #default="{ row, $index }">
          <el-input v-model="row.value" placeholder="请输入Header值" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="180">
        <template #default="{ row, $index }">
          <el-input v-model="row.description" placeholder="请输入说明" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row, $index }">
          <el-button type="danger" size="small" @click="removeHeader($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="add-btn-container">
      <el-button type="primary" @click="addHeader">添加Header</el-button>
    </div>
  </div>
</template>

<script setup>
import {defineProps, defineEmits, defineExpose} from 'vue'

const props = defineProps({
  headers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:headers'])
// 添加Header
const addHeader = () => {
  const newHeaders = [...props.headers]
  newHeaders.push({
    name: '',
    value: '',
    description: ''
  })
  emit('update:headers', newHeaders)
}
// 移除Header
const removeHeader = (index) => {
  const newHeaders = [...props.headers]
  newHeaders.splice(index, 1)
  emit('update:headers', newHeaders)
}

const getDataLength = () => {
  return props.headers.length
}

defineExpose({
  getDataLength
})
</script>

<style lang="scss" scoped>
.headers-container {
  width: 100%;
}

.add-btn-container {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}
</style>