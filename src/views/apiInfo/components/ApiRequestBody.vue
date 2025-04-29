<template>
  <div class="body-container">
    <div class="content-type-selector">
      <el-radio-group v-model="localContentType" @change="handleContentTypeChange">
        <el-radio-button label="application/none">none</el-radio-button>
        <el-radio-button label="application/json">json</el-radio-button>
        <el-radio-button label="multipart/form-data">form-data</el-radio-button>
        <el-radio-button label="application/x-www-form-urlencoded">x-www-form-urlencoded</el-radio-button>
        <el-radio-button label="text/plain">raw</el-radio-button>
      </el-radio-group>
    </div>

    <div class="body-editor-container">
      <!-- JSON编辑器 -->
      <div v-if="localContentType === 'application/json'" class="editor-wrapper">
        <el-input
            v-model="jsonContent"
            type="textarea"
            :rows="15"
            placeholder="请输入JSON格式的请求体"
            @input="updateBody"
        />
        <div class="format-btn">
          <el-button type="primary" size="small" @click="formatJson">格式化JSON</el-button>
        </div>
      </div>
      <!-- Text编辑器 -->
      <div v-else-if="localContentType === 'text/plain'" class="editor-wrapper">
        <el-input
            v-model="textContent"
            type="textarea"
            :rows="15"
            @input="updateBody"
        />
      </div>
      <!-- Form表单 -->
      <div v-else-if="localContentType === 'application/none'" class="editor-wrapper">
        <el-table :data="formItems" style="width: 100%" border>
        </el-table>
      </div>
      <!-- x-www-form-urlencoded -->
      <div v-else-if="localContentType === 'application/x-www-form-urlencoded'" class="editor-wrapper">
        <el-table :data="formItems" style="width: 100%" border>
          <el-table-column prop="key" label="Key" min-width="180">
            <template #default="{ row, $index }">
              <el-input v-model="row.key" placeholder="请输入Key" @input="updateFormBody"/>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="Value" min-width="240">
            <template #default="{ row, $index }">
              <el-input v-model="row.value" placeholder="请输入Value" @input="updateFormBody"/>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row, $index }">
              <el-button type="danger" size="small" @click="removeFormItem($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="add-btn-container">
          <el-button type="primary" @click="addFormItem">添加项</el-button>
        </div>
      </div>
      <!-- Form Data表单 -->
      <div v-else-if="localContentType === 'multipart/form-data'" class="editor-wrapper">
        <el-table :data="formDataItems" style="width: 100%" border>
          <el-table-column prop="key" label="Key" min-width="180">
            <template #default="{ row, $index }">
              <el-input v-model="row.key" placeholder="请输入Key" @input="updateFormDataBody"/>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="Value" min-width="240">
            <template #default="{ row, $index }">
              <el-input v-model="row.value" placeholder="请输入Value" @input="updateFormDataBody"/>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row, $index }">
              <el-select v-model="row.type" @change="updateFormDataBody">
                <el-option label="文本" value="text"/>
                <el-option label="文件" value="file"/>
              </el-select>
              <div v-if="row.type === 'file'">
                <el-upload
                    class="upload-file"
                    action="#"
                    :auto-upload="false"
                    :on-change="handleFileChange">
                  <el-button type="primary">选择文件</el-button>
                  <template #tip>
                    <div class="el-upload__tip">
                    </div>
                  </template>
                </el-upload>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row, $index }">
              <el-button type="danger" size="small" @click="removeFormDataItem($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="add-btn-container">
          <el-button type="primary" @click="addFormDataItem">添加项</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {defineProps, defineEmits, defineExpose, ref, onMounted, watch} from 'vue'

const props = defineProps({
  body: {
    type: Object,
    default: () => null
  }
});

// 添加调试日志
console.log('ApiRequestBody组件初始化，body:', props.body);

const emit = defineEmits(['update:body', 'updateContentType'])

// 使用本地变量，避免直接修改props
const localContentType = ref('application/json')
const jsonContent = ref('{}')
const none = ref('')
const textContent = ref('')
const formItems = ref([])
const formDataItems = ref([])

// 初始化本地状态
const initLocalState = (bodyData) => {
  if (!bodyData) {
    // 设置默认值
    localContentType.value = 'application/json'
    jsonContent.value = '{}'
    return
  }

  if (bodyData.contentType) {
    localContentType.value = bodyData.contentType
  }

  if (bodyData.content !== undefined) {
    console.log('处理内容，类型:', localContentType.value, '内容:', bodyData.content)
    
    if (localContentType.value === 'application/json') {
      try {
        // 尝试处理JSON内容
        if (typeof bodyData.content === 'string') {
          // 尝试解析字符串
          try {
            JSON.parse(bodyData.content)
            jsonContent.value = bodyData.content
          } catch (e) {
            console.warn('JSON解析失败，使用原始内容:', e)
            jsonContent.value = bodyData.content
          }
        } else {
          // 对象转字符串
          jsonContent.value = JSON.stringify(bodyData.content, null, 2)
        }
        console.log('设置jsonContent:', jsonContent.value)
      } catch (e) {
        console.error('处理JSON内容失败:', e)
        jsonContent.value = bodyData.content || '{}'
      }
    } else if (localContentType.value === 'application/none') {
      none.value = bodyData.content
    } else if (localContentType.value === 'text/plain') {
      textContent.value = bodyData.content
    } else if (localContentType.value === 'application/x-www-form-urlencoded') {
      formItems.value = Array.isArray(bodyData.content) ? [...bodyData.content] : []
    } else if (localContentType.value === 'multipart/form-data') {
      formDataItems.value = Array.isArray(bodyData.content) ? [...bodyData.content] : []
    }
  }
}

// 监听props变化
watch(() => props.body, (newBody) => {
  console.log('Body属性变化:', newBody)
  initLocalState(newBody)
}, {deep: true, immediate: true})

// 初始化
onMounted(() => {
  if (!props.body) {
    emit('update:body', {
      contentType: localContentType.value,
      content: '{}'
    })
  }
})

// 内容类型变更
const handleContentTypeChange = (type) => {
  localContentType.value = type
  emit('updateContentType', type)

  // 重置Body内容
  let content = ''
  if (type === 'application/json') {
    content = '{}'
    jsonContent.value = content
  } else if (type === 'application/x-www-form-urlencoded') {
    content = []
    formItems.value = content
  } else if (type === 'multipart/form-data') {
    content = []
    formDataItems.value = content
  } else if (type === 'text/plain') {
    content = ''
    textContent.value = content
  }

  emit('update:body', {
    contentType: type,
    content: content
  })
}

const handleFileChange = (file) => {
  // 当选择文件时更新数据
  if (file) {
    console.log('文件已选择:', file.name)
    // 更新相关数据
    updateFormDataBody()
  }
}

// JSON格式化
const formatJson = () => {
  try {
    const parsed = JSON.parse(jsonContent.value)
    jsonContent.value = JSON.stringify(parsed, null, 2)
    updateBody()
  } catch (e) {
    // 可以添加错误提示
    console.error('JSON格式化失败:', e)
  }
}

// 更新请求体
const updateBody = () => {
  let content = ''
  if (localContentType.value === 'application/json') {
    content = jsonContent.value
  } else if (localContentType.value === 'application/form-data') {
    content = formDataItems.value
  } else if (localContentType.value === 'text/plain') {
    content = textContent.value
  }

  emit('update:body', {
    contentType: localContentType.value,
    content: content
  })
}

// 表单相关方法
const addFormItem = () => {
  formItems.value.push({
    key: '',
    value: ''
  })
  updateFormBody()
}

const removeFormItem = (index) => {
  formItems.value.splice(index, 1)
  updateFormBody()
}

const updateFormBody = () => {
  emit('update:body', {
    contentType: localContentType.value,
    content: formItems.value
  })
}

// FormData相关方法
const addFormDataItem = () => {
  formDataItems.value.push({
    key: '',
    value: '',
    type: 'text'
  })
  updateFormDataBody()
}

const removeFormDataItem = (index) => {
  formDataItems.value.splice(index, 1)
  updateFormDataBody()
}

const updateFormDataBody = () => {
  emit('update:body', {
    contentType: localContentType.value,
    content: formDataItems.value
  })
}

const getDataLength = () => {
  if (localContentType.value === 'application/json') {
    return jsonContent.value && jsonContent.value !== '{}' ? 1 : 0
  } else if (localContentType.value === 'text/plain') {
    return textContent.value ? 1 : 0
  } else if (localContentType.value === 'application/x-www-form-urlencoded') {
    return formItems.value.length
  } else if (localContentType.value === 'multipart/form-data') {
    return formDataItems.value.length
  }
  return 0
}

defineExpose({
  getDataLength
})
</script>

<style lang="scss" scoped>
.body-container {
  width: 100%;
}

.content-type-selector {
  margin-bottom: 20px;
}

.editor-wrapper {
  width: 100%;
}

.format-btn {
  margin-top: 10px;
  text-align: right;
}

.add-btn-container {
  margin-top: 15px;
  display: flex;
  justify-content: center;
}
</style>