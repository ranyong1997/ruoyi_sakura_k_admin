<template>
  <div class="app-container">
    <el-card>
      <div class="h100">
        <EnvInfo ref="EnvRef" :formData="formData" @handleSaveOrUpdateOrRefresh="handleSaveOrUpdateOrRefresh"/>
        <div>
          <el-card>
            <div style="min-height: 500px">
              <el-tabs style="overflow-y: auto">
                <el-tab-pane name='HTTPConfiguration'>
                  <template #label>
                    <strong>HTTP配置</strong>
                  </template>
                  <div class="case-tabs">
                    <EnvBody ref="EnvBody" @updateContentType="updateContentType"/>
                  </div>
                </el-tab-pane>
                <el-tab-pane name='GenericConfiguration'>
                  <template #label>
                    <strong>通用配置</strong>
                  </template>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="Env">
import {defineProps, ref} from 'vue'
import EnvInfo from './EnvInfo.vue'
import EnvBody from './EnvBody.vue'
// 定义父组件传过来的值
const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['saveOrUpdateOrRefresh'])
const EnvRef = ref()

const handleSaveOrUpdateOrRefresh = (type) => {
  emit('saveOrUpdateOrDebug', type)
}

const setData = (data) => {
  EnvRef.value?.setData(data)
}

const getData = () => {
  return EnvRef.value?.getData()
}

defineExpose({
  setData,
  getData
})
</script>

<style lang="scss" scoped>

// el-badge
:deep(.el-badge__content) {
  border-radius: 50%;
  width: 18px;
}

:deep(.el-badge__content.is-fixed) {
  top: 10px;
  right: calc(-7px + var(--el-badge-size) / 2);
}

</style>