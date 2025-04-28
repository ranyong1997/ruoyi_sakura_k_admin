<template>
  <div class="app-container">
    <el-card>
      <div class="h100">
        <ApiInfo ref="ApiInfoRef" :formData="formData" :paramsData="paramsData" :bodyData="bodyData" :headersData="headersData" :cookiesData="cookiesData" @saveOrUpdateOrDebug="handleSaveOrUpdateOrDebug"/>
        <div>
          <el-card>
            <template #header>
              <strong>请求参数</strong>
            </template>
            <div style="min-height: 500px">
              <el-tabs v-model="activeTab" style="overflow-y: auto">
                <el-tab-pane name="params">
                  <template #label>
                    <strong>Params</strong>
                    <span class="ui-badge-circle" v-show="paramsData.length">{{ paramsData.length }}</span>
                  </template>
                  <div class="case-tabs">
                    <ApiRequestParams ref="ApiRequestParamsRef" v-model:params="paramsData" />
                  </div>
                </el-tab-pane>
                <el-tab-pane name="body">
                  <template #label>
                    <strong>Body</strong>
                    <span class="ui-badge-status-dot" v-show="bodyData"></span>
                  </template>
                  <div class="case-tabs">
                    <ApiRequestBody ref="ApiRequestBodyRef" v-model:body="bodyData" @updateContentType="updateContentType"/>
                  </div>
                </el-tab-pane>
                <el-tab-pane name="headers">
                  <template #label>
                    <strong>Headers</strong>
                    <span class="ui-badge-circle" v-show="headersData.length">{{ headersData.length }}</span>
                  </template>
                  <div class="case-tabs">
                    <ApiRequestHeaders ref="ApiRequestHeadersRef" v-model:headers="headersData" />
                  </div>
                </el-tab-pane>
                <el-tab-pane name="cookies">
                  <template #label>
                    <strong>Cookies</strong>
                    <span class="ui-badge-circle" v-show="cookiesData.length">{{ cookiesData.length }}</span>
                  </template>
                  <div class="case-tabs">
                    <ApiRequestCookies ref="ApiRequestCookiesRef" v-model:cookies="cookiesData" />
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
import { defineProps, ref, reactive } from 'vue'
import ApiInfo from './ApiInfo.vue'
import ApiRequestBody from './ApiRequestBody.vue'
import ApiRequestHeaders from './ApiRequestHeaders.vue'
import ApiRequestParams from './ApiRequestParams.vue'
import ApiRequestCookies from './ApiRequestCookies.vue'

// 定义父组件传过来的值
const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['saveOrUpdateOrDebug'])
const activeTab = ref('params')
const ApiInfoRef = ref()
const ApiRequestParamsRef = ref()
const ApiRequestHeadersRef = ref()
const ApiRequestBodyRef = ref()
const ApiRequestCookiesRef = ref()

// 数据模型
const paramsData = ref([])
const headersData = ref([])
const cookiesData = ref([])
const bodyData = ref(null)

const handleSaveOrUpdateOrDebug = (type) => {
  // 获取完整表单数据
  const completeFormData = getData();
  // 传递类型和完整数据给父组件
  emit('saveOrUpdateOrDebug', type, completeFormData);
}

const updateContentType = (contentType) => {
  // 更新请求的内容类型
  const contentTypeHeader = headersData.value.find(h => h.name.toLowerCase() === 'content-type')
  if (contentTypeHeader) {
    contentTypeHeader.value = contentType
  } else {
    headersData.value.push({
      name: 'Content-Type',
      value: contentType,
      description: '内容类型'
    })
  }
}

const setData = (data) => {
  console.log('设置数据到EditApi:', data);
  
  // 保存原始请求参数数据以便后续调试
  if (data) {
    // 保存原始数据的深拷贝
    const savedData = JSON.parse(JSON.stringify(data));
    console.log('保存原始数据:', savedData);
  }
  
  // 设置基本信息
  ApiInfoRef.value?.setData(data);

  // 设置请求参数数据
  if (data.params) {
    console.log('设置params参数:', data.params);
    paramsData.value = Array.isArray(data.params) ? [...data.params] : [];
  } else {
    paramsData.value = [];
  }

  // 处理 requestHeaders 对象转换为数组
  if (data.requestHeaders) {
    console.log('设置requestHeaders:', data.requestHeaders);
    const headersArray = [];
    for (const key in data.requestHeaders) {
      if (Object.hasOwnProperty.call(data.requestHeaders, key)) {
        headersArray.push({
          name: key,
          value: data.requestHeaders[key],
          description: ''
        });
      }
    }
    headersData.value = headersArray;
  } else {
    headersData.value = [];
  }

  // 设置cookies
  if (data.cookies) {
    console.log('设置cookies:', data.cookies);
    cookiesData.value = Array.isArray(data.cookies) ? [...data.cookies] : [];
  } else {
    cookiesData.value = [];
  }

  // 设置请求体数据
  if (data.requestData) {
    console.log('设置requestData:', data.requestData);
    // 如果已有contentType，使用它，否则默认为application/json
    const contentType = data.requestHeaders && 
                        Object.keys(data.requestHeaders).some(key => key.toLowerCase() === 'content-type') 
                        ? data.requestHeaders['Content-Type'] || data.requestHeaders['content-type'] 
                        : 'application/json';
    
    bodyData.value = {
      contentType: contentType,
      content: typeof data.requestData === 'string' 
        ? data.requestData 
        : JSON.stringify(data.requestData, null, 2)
    };
  } else {
    // 即使没有requestData，也要初始化为默认值
    bodyData.value = {
      contentType: 'application/json',
      content: '{}'
    };
  }
  
  // 确保所有数据已正确设置
  console.log('设置后的数据状态:', {
    params: paramsData.value,
    headers: headersData.value,
    body: bodyData.value,
    cookies: cookiesData.value
  });
}

const getData = () => {
  const apiInfoData = ApiInfoRef.value?.getData() || {}

  // 将 headers 数组转换为对象
  const headersObject = {}
  headersData.value.forEach(header => {
    if (header.name) {
      headersObject[header.name] = header.value
    }
  })
  return {
    ...apiInfoData,
    params: paramsData.value,
    requestHeaders: headersObject,  // 使用转换后的对象
    cookies: cookiesData.value,
    requestData: bodyData.value?.contentType === 'application/json'
      ? JSON.parse(bodyData.value.content || '{}')
      : bodyData.value?.content
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