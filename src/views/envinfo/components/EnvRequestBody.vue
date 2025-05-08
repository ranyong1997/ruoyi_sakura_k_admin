<template>
  <el-form inline ref="request-form" label-width="50px" size="small" label-position="right">
    <div style="border-bottom: 1px solid #E6E6E6; display: flex; justify-content: space-between">
      <div class="request-mode">
        <el-radio-group
            size="small"
            v-model="state.mode"
            class="radio-group"
            @change="radioChange"
        >
          <el-radio label="0">none</el-radio>
          <el-radio label="2">form-data</el-radio>
          <el-radio label="3">x-www-form-urlencoded</el-radio>
          <el-radio label="1">json</el-radio>
          <el-radio label="4">raw</el-radio>
        </el-radio-group>
      </div>
    </div>
    <div v-if="state.mode === '0'" style="text-align: center; padding-top: 10px">
      <span style="color: darkgray">当前请求没有请求体</span>
    </div>
    <!---------------------------form_data------------------------------------>
    <div v-if="state.mode === '2'">
      <div>
        <el-row justify="space-between"
                v-for="(data, index) in state.formData"
                :key="index"
                align="middle"
                style="padding: 5px 0;"
        >
          <el-col :span="8">
            <div class="mt-4">
              <el-input
                  v-model="data.key"
                  placeholder="Key"
                  class="input-with-select"
              >
                <template #append>
                  <el-select v-model="data.type"
                             placeholder="请选择">
                    <el-option
                        v-for="item in state.formDatatypeOptions"
                        :key="item"
                        :label="item"
                        :value="item">
                    </el-option>
                  </el-select>
                </template>

              </el-input>
            </div>
          </el-col>
          <el-col :span="5">
            <el-input type="primary"
                      size="small"
                      maxlength="200"
                      placeholder="备注"
                      v-model="data.remarks">
            </el-input>
          </el-col>
          <el-col :span="1">
            <el-button type="danger" circle @click="deleteFormData(index)"
                       :disabled="state.formData.length === index  + 1 ">
              <el-icon>
                <ele-Delete/>
              </el-icon>
            </el-button>
          </el-col>
        </el-row>
      </div>
    </div>
    <!---------------------------x-www-form-urlencoded------------------------------------>
    <div v-if="state.mode === '3'">
      <div>
        <el-row justify="space-between"
                v-for="(data, index) in state.x_www_form_urlencoded"
                :key="index"
                align="middle"
                style="padding: 5px 0;"
        >
          <el-col :span="8">
            <div class="mt-4">
              <el-input
                  v-model="data.key"
                  placeholder="Key"
                  class="input-with-select"
              >
              </el-input>
            </div>
          </el-col>
          <el-col :span="8">
            <el-input size="small"
                      placeholder="Value"
                      v-model="data.value"></el-input>
          </el-col>
          <el-col :span="5">
            <el-input size="small"
                      maxlength="200"
                      placeholder="备注"
                      v-model="data.remarks">
            </el-input>
          </el-col>
          <el-col :span="1">
            <el-button type="danger" circle @click="deleteXFormData(index)"
                       :disabled="state.x_www_form_urlencoded.length === index  + 1 ">
              <el-icon>
                <ele-Delete/>
              </el-icon>
            </el-button>
          </el-col>
        </el-row>
      </div>
    </div>
    <!---------------------------json------------------------------------>
    <div v-if="state.mode === '1'" style="padding-top: 8px;">
      <div style="border: 1px solid #E6E6E6">
        <z-monaco-editor
            style="height: 420px"
            ref="monacoEditRef"
            v-model:value="state.rawData"
            v-model:lang="state.lang"
        ></z-monaco-editor>
      </div>
    </div>
    <!---------------------------raw------------------------------------>
    <div v-if="state.mode === '4'" style="padding-top: 8px;">
      <div style="border: 1px solid #E6E6E6">
        <z-monaco-editor
            style="height: 420px"
            ref="monacoEditRef"
            v-model:value="state.rawData"
            v-model:lang="state.lang"
        ></z-monaco-editor>
      </div>
    </div>
    <!---------------------------params------------------------------------>
    <div v-if="state.mode === 'params'">
      <div class="block-title">
        <el-button size="small" type="primary" link @click="addParams" title="add params">
          <el-icon>
            123132
          </el-icon>
          add
        </el-button>
      </div>
      <div>
        <el-table
            ref="paramsDataTableRef"
            :data="state.paramsData"
            tooltip-effect="dark"
            border
            style="width: 100%"
        >
          <el-table-column header-align='center'>
            <template #header>
              <strong style="font-size: 14px;">参数名</strong>
            </template>
            <template #default="scope">
              <el-input size="small" v-model="scope.row.key"></el-input>
            </template>
          </el-table-column>

          <el-table-column prop="type" width="120" header-align='center'>
            <template #header>
              <strong style="font-size: 14px;">参数类型</strong>
            </template>
            <template #default="scope">
              <el-select size="small" v-model="scope.row.type" placeholder="请选择">
                <el-option
                    v-for="item in state.dataTypeOptions"
                    :key="item"
                    :label="item"
                    :value="item">
                </el-option>
              </el-select>
            </template>
          </el-table-column>

          <el-table-column prop="value" header-align='center'>
            <template #header>
              <strong style="font-size: 14px;">参数值</strong>
            </template>
            <template #default="scope">
              <el-input size="small" v-model="scope.row.value"></el-input>
            </template>
          </el-table-column>
          <el-table-column align="center" width="50" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button size="small" type="primary" link @click="deleteParams(scope.$index)">
                <el-icon>
                  <ele-Delete/>
                </el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

  </el-form>
</template>

<script setup name="requestBody">
import {reactive, ref, watch} from "vue";

const emit = defineEmits(["updateContentType"])

const monacoEditRef = ref()

const state = reactive({
  mode: 'raw',
  language: 'JSON',
  languageList: ['JSON', 'Text'],
  popoverOpen: false,
  bodyData: [],
  rawData: "",
  paramsData: [],
  dataTypeOptions: ['string', 'int', 'float', 'boolean'],
  formData: [],
  formDatatypeOptions: ['text'],
  fileData: {},
  x_www_form_urlencoded: [],
  //编辑器语言
  lang: 'json',
});

// 初始化数据
const initData = () => {
  state.mode = "raw"
  state.language = "JSON"
  state.rawData = ""
  state.formData = []
  state.x_www_form_urlencoded = []
  state.fileData = {}
}
// 初始化表单
const setData = (data) => {
  initData()
  if (!data) return
  let mode = state.mode = data.mode
  switch (mode) {
    case 'form_data':
      state.formData = data.data ? data.data : []
      break
    case 'x_www_form_urlencoded':
      state.x_www_form_urlencoded = data.data ? data.data : []
      break
    case 'raw':
      state.rawData = data.data
      state.language = data.language
      break
    case 'params':
      break
    default:
      break
  }
}

// 获取表单数据
const getData = () => {
  let requestData = {}
  requestData.mode = state.mode
  if (state.mode === 'raw') {
    requestData.data = state.rawData
    requestData.language = state.language
  } else if (state.mode === 'form_data') {
    requestData.data = state.formData.filter((e) => e.key !== "" || e.value !== "")
  } else if (state.mode === 'x_www_form_urlencoded') {
    requestData.data = state.x_www_form_urlencoded.filter((e) => e.key !== "" || e.value !== "")
  } else if (state.mode === 'none') {
    requestData.data = null
  }
  return requestData
}

// 参数类型变更
const radioChange = (value) => {
  state.mode = value
  state.popoverOpen = false
  updateContentType(value === 'none' || value === 'form_data')
}

// 处理raw 语言
const handleLanguage = (language) => {
  state.popoverOpen = !state.popoverOpen
  state.language = language
  updateContentType()
}

// 处理头信息
const updateContentType = (remove = false) => {
  emit('updateContentType', state.mode, state.language, remove)
}

// bodyData
const addData = () => {
  state.bodyData.push({key: '', type: 'string', value: ''})
}
const deleteData = (index) => {
  state.bodyData.splice(index, 1)
}

// params
const addParams = () => {
  state.paramsData.push({key: '', type: 'string', value: ''})
}
const deleteParams = (index) => {
  state.paramsData.splice(index, 1)
}

// formData
const addFormData = () => {
  state.formData.push({key: '', type: 'text', value: ''})
}
// formData
const addXFormData = () => {
  state.x_www_form_urlencoded.push({key: '', value: ''})
}
// 删除
const deleteFormData = (index) => {
  state.formData.splice(index, 1)
}// 删除
const deleteXFormData = (index) => {
  state.x_www_form_urlencoded.splice(index, 1)
}
const formDataBlur = () => {
  if (state.formData.length > 0) {
    let endData = state.formData[state.formData.length - 1]
    if (!endData || (endData.key !== "" || endData.value !== "")) {
      addFormData()
    }
  } else {
    addFormData()
  }
}
const xFormDataBlur = () => {
  if (state.x_www_form_urlencoded.length > 0) {
    let endData = state.x_www_form_urlencoded[state.x_www_form_urlencoded.length - 1]
    if (!endData || (endData.key !== "" || endData.value !== "")) {
      addXFormData()
    }
  } else {
    addXFormData()
  }
}
// 监听language 设置 long
watch(
    () => state.language,
    (val) => {
      if (val.toLowerCase() === 'text') {
        state.lang = 'plaintext'
      }
      if (val.toLowerCase() === 'json') {
        state.lang = 'json'
      }
    }
);

watch(
    () => state.rawData,
    (val) => {
      if (val) {
        updateContentType()
      } else {
        updateContentType(true)
      }
    }, {
      deep: true
    }
);

watch(
    () => state.formData,
    () => {
      formDataBlur()
    }, {
      deep: true
    }
);
watch(
    () => state.x_www_form_urlencoded,
    () => {
      xFormDataBlur()
    }, {
      deep: true
    }
);

const getDataLength = () => {
  let dataLength = 0
  if (state.mode === 'form_data') {
    dataLength = state.formData?.length || 0
  } else if (state.mode === 'x_www_form_urlencoded') {
    dataLength = state.x_www_form_urlencoded?.length || 0
  } else if (state.mode === 'raw') {
    dataLength = state.rawData.length || 0
  } else if (state.mode === 'none') {
    dataLength = 0
  }
  return dataLength
}

defineExpose({
  setData,
  getData,
  getDataLength
})

</script>
<style lang="scss" scoped>
.request-mode {
  margin-bottom: 10px;

  :deep(.el-radio__label) {
    font-size: 13px;
  }
}


.file-input-container {
  display: inline-block;
  max-width: 100%;

  .file-input {
    display: flex;
    align-items: center;
    padding: var(--spacing-xs);

    .file-input__native {
      opacity: 0;
      position: absolute;
      width: 0;
      height: 0;
      pointer-events: none;
    }
    .file-input__name {
      box-sizing: border-box;
      display: flex;
      min-width: 0;
      height: 24px;
      align-items: center;
      border-radius: 4px;
      border: 1px solid #E6E6E6;
      font-size: 12px;
      font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica, Arial, sans-serif;
      color: #212121;
      background-color: transparent;
      padding: 4px 2px;
      .file-input__name__title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .file-input__name__delete-icon {
        display: flex;
        align-items: center;
        margin-left: 8px;
        padding-right: 2px;
        cursor: pointer;
        color: #212121;
      }
    }
  }
}
:deep(.input-with-select .el-input-group__append) {
  background-color: var(--el-fill-color-blank) !important;
}
</style>