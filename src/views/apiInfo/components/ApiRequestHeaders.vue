<template>
  <div class="headers-container">
    <el-table :data="localHeaders" style="width: 100%" border>
      <el-table-column prop="name" label="Header名" min-width="180">
        <template #default="{ row, $index }">
          <el-input v-model="row.name" placeholder="请输入Header名称" @input="updateHeaders" />
        </template>
      </el-table-column>
      <el-table-column prop="value" label="值" min-width="240">
        <template #default="{ row, $index }">
          <el-input v-model="row.value" placeholder="请输入Header值" @input="updateHeaders" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="180">
        <template #default="{ row, $index }">
          <el-input v-model="row.description" placeholder="请输入说明" @input="updateHeaders" />
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
import {defineProps, defineEmits, defineExpose, ref, watch} from 'vue'

const props = defineProps({
  headers: {
    type: Array,
    default: () => []
  }
})

// 本地状态，避免直接修改props
const localHeaders = ref([...props.headers])

// 监听props变化
watch(() => props.headers, (newHeaders) => {
  localHeaders.value = [...newHeaders]
}, { deep: true })

const emit = defineEmits(['update:headers'])

// 更新父组件中的数据
const updateHeaders = () => {
  emit('update:headers', [...localHeaders.value])
}

// 添加Header
const addHeader = () => {
  localHeaders.value.push({
    name: '',
    value: '',
    description: ''
  })
  updateHeaders()
}

// 移除Header
const removeHeader = (index) => {
  localHeaders.value.splice(index, 1)
  updateHeaders()
}

const getDataLength = () => {
  return localHeaders.value.length
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