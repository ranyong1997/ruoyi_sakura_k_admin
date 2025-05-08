<template>
  <div class="app-container">
    <el-card>
      <div class="h100">
        <EnvInfo ref="EnvRef" :formData="formData" @saveOrUpdateOrDebug="handleSaveOrUpdateOrDebug"/>
        <div>
          <el-card>
            <template #header>
              <strong>Request</strong>
            </template>
            <div style="min-height: 500px">
              <el-tabs style="overflow-y: auto">
                <el-tab-pane name='EnvRequestBody'>
                  <template #label>
                    <strong>HTTP配置</strong>
                    <span class="ui-badge-status-dot" v-show="getDataLength('body')"></span>
                  </template>
                  <div class="case-tabs">
                    <EnvRequestBody ref="ApiRequestBodyRef" @updateContentType="updateContentType"/>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="EditApiInfo">
import {defineProps, ref} from 'vue'
import EnvInfo from './EnvInfo.vue'
import EnvRequestBody from './EnvRequestBody.vue'
import ApiRequestHeaders from './EnvRequestHeaders.vue'
// 定义父组件传过来的值
const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['saveOrUpdateOrDebug'])
const EnvRef = ref()
const EnvRequestHeadersRef = ref()
const EnvRequestBodyRef = ref()

const handleSaveOrUpdateOrDebug = (type) => {
  emit('saveOrUpdateOrDebug', type)
}

const setData = (data) => {
  EnvRef.value?.setData(data)
}

const getData = () => {
  return EnvRef.value?.getData()
}

const getDataLength = (ref) => {
  switch (ref) {
    case "body":
      return EnvRequestBodyRef?.value.getDataLength()
    case "header":
      return EnvRequestHeadersRef?.value.getDataLength()
    default:
      return 0
  }
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