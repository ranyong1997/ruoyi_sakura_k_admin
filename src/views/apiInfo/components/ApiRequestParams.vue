<template>
  <div class="params-container">
    <el-table :data="params" style="width: 100%" border>
      <el-table-column prop="name" label="参数名" min-width="180">
        <template #default="{ row, $index }">
          <el-input v-model="row.name" placeholder="请输入参数名称" />
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="180">
        <template #default="{ row, $index }">
          <el-select v-model="row.type" placeholder="请选择">
            <el-option label="String" value="string" />
            <el-option label="Number" value="number" />
            <el-option label="Boolean" value="boolean" />
            <el-option label="Object" value="object" />
            <el-option label="Array" value="array" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column prop="example" label="示例值" min-width="180">
        <template #default="{ row, $index }">
          <el-input v-model="row.example" placeholder="请输入示例值" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="180">
        <template #default="{ row, $index }">
          <el-input v-model="row.description" placeholder="请输入参数说明" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row, $index }">
          <el-button type="danger" size="small" @click="removeParam($index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="add-btn-container">
      <el-button type="primary" @click="addParam">添加参数</el-button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, defineExpose } from 'vue'

const props = defineProps({
  params: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:params'])

const addParam = () => {
  const newParams = [...props.params]
  newParams.push({
    name: '',
    type: 'string',
    example: '',
    description: ''
  })
  emit('update:params', newParams)
}

const removeParam = (index) => {
  const newParams = [...props.params]
  newParams.splice(index, 1)
  emit('update:params', newParams)
}

const getDataLength = () => {
  return props.params.length
}

defineExpose({
  getDataLength
})
</script>

<style lang="scss" scoped>
.params-container {
  width: 100%;
}

.add-btn-container {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}
</style>