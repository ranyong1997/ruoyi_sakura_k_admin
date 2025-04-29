<template>
  <div class="params-container">
    <el-table :data="localParams" style="width: 100%" border>
      <el-table-column prop="name" label="参数名" min-width="180">
        <template #default="{ row, $index }">
          <el-input v-model="row.name" placeholder="请输入参数名称" @input="updateParams" />
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型" width="180">
        <template #default="{ row, $index }">
          <el-select v-model="row.type" placeholder="请选择" @change="updateParams">
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
          <el-input v-model="row.example" placeholder="请输入示例值" @input="updateParams" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="说明" min-width="180">
        <template #default="{ row, $index }">
          <el-input v-model="row.description" placeholder="请输入参数说明" @input="updateParams" />
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
import { defineProps, defineEmits, defineExpose, ref, watch } from 'vue'

const props = defineProps({
  params: {
    type: Array,
    default: () => []
  }
})

// 使用本地状态存储参数，避免直接修改props
const localParams = ref([...props.params])

// 监听props变化更新本地数据
watch(() => props.params, (newParams) => {
  localParams.value = [...newParams]
}, { deep: true })

const emit = defineEmits(['update:params'])

// 更新父组件中的数据
const updateParams = () => {
  emit('update:params', [...localParams.value])
}

const addParam = () => {
  localParams.value.push({
    name: '',
    type: 'string',
    example: '',
    description: ''
  })
  updateParams()
}

const removeParam = (index) => {
  localParams.value.splice(index, 1)
  updateParams()
}

const getDataLength = () => {
  return localParams.value.length
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