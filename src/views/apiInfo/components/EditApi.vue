<template>
  <div class="app-container">
    <el-card>
      <div class="h100">
        <ApiInfo ref="ApiInfoRef"
                 :formData="formData"
                 @saveOrUpdateOrDebug="handleSaveOrUpdateOrDebug"/>
        <div>
          <el-card>
            <template #header>
              <strong>Request</strong>
            </template>
            <div style="min-height: 500px">
              <el-tabs style="overflow-y: auto">
                <el-tab-pane name='ApiRequestBody'>
                  <template #label>
                    <strong>请求体</strong>
                    <span class="ui-badge-status-dot" v-show="getDataLength('body')"></span>
                  </template>
                  <div class="case-tabs">
                    <ApiRequestBody ref="ApiRequestBodyRef" @updateContentType="updateContentType"/>
                  </div>
                </el-tab-pane>
                <el-tab-pane name='ApiRequestHeaders'>
                  <template #label>
                    <strong>请求头</strong>
                    <span class="ui-badge-circle" v-show="getDataLength('header')">{{
                        getDataLength('header')
                      }}</span>
                  </template>
                  <div class="case-tabs">
                    <ApiRequestHeaders ref="ApiRequestHeadersRef"/>
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
import ApiInfo from './ApiInfo.vue'
import ApiRequestBody from './ApiRequestBody.vue'
import ApiRequestHeaders from './ApiRequestHeaders.vue'
// 定义父组件传过来的值
const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
})
const emit = defineEmits(['saveOrUpdateOrDebug'])
const ApiInfoRef = ref()
const ApiRequestHeadersRef = ref()
const ApiVariablesRef = ref()
const ApiValidatorsRef = ref()
const ApiExtractsRef = ref()
const ApiCodeRef = ref()
const ApiHookRef = ref()

const handleSaveOrUpdateOrDebug = (type) => {
  emit('saveOrUpdateOrDebug', type)
}

const setData = (data) => {
  ApiInfoRef.value?.setData(data)
}

const getData = () => {
  return ApiInfoRef.value?.getData()
}

const getDataLength = (ref) => {
  switch (ref) {
    case "body":
      return ApiRequestBodyRef?.value.getDataLength()
    case "header":
      return ApiRequestHeadersRef?.value.getDataLength()
    case "variables":
      return ApiVariablesRef.value.getDataLength()
    case "validators":
      return ApiValidatorsRef.value.getDataLength()
    case "extracts":
      return ApiExtractsRef.value.getDataLength()
    case "hook":
      return ApiHookRef.value.getDataLength()
    case "code":
      return ApiCodeRef.value.getDataLength()
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