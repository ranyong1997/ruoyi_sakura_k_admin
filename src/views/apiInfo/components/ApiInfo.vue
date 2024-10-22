<template>
  <div class="api-case el-card">
    <el-row>
      <el-col :xs="15" :sm="15" :md="15" :lg="15" :xl="15" class="mb20">
        <div class="api-case__method" style="padding-left: 5px">
          <el-input
              size="default"
              v-model="state.form.api_url"
              placeholder="请输入请求路径"
              class="input-with-select"
          >
            <template #prepend>
              <el-select v-model="state.form.api_method"
                         size="default"
                         ref="methodRef"
                         placeholder=""
                         @change="methodChange"
                         style="width: 100px; color: #22a1c4">
                <el-option
                    v-for="item in state.methodList"
                    :key="item"
                    :label="item"
                    :value="item">
                  <span :class="[`method-color-${item.toLowerCase()}`]">{{ item }}</span>
                </el-option>
              </el-select>
            </template>
          </el-input>
        </div>
      </el-col>
      <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
        <div class="api-case__operation" style="padding-left: 12px">
          <el-button size="default" type="primary" @click="saveOrUpdateOrDebug('save')" class="title-button">保存
          </el-button>
          <el-button size="default" type="success" @click="handleDebug">调试</el-button>
          <!--          <el-button size="default" type="danger" @click="saveOrUpdateOrDebug('debug')">删除</el-button>-->
        </div>
      </el-col>
      <!--      </div>-->
    </el-row>

    <div class="api-case__detail">
      <el-form ref="formRef"
               :model="state.form"
               label-width="auto"
               label-position="right"
               :rules="state.rules">
        <el-row :gutter="24">
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
            <el-form-item label="接口名称" prop="api_name">
              <el-input v-model.trim="state.form.api_name"
                        style="width: 100%;"
                        clearable
                        placeholder="请输入接口名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
            <el-form-item label="项目" prop="project_id">
              <el-cascader
                  v-model="state.form.project_module"
                  :props="{ label: 'api_name', value: 'api_id' }"
                  :options="state.projectTree"
                  filterable
                  style="width: 100%"
                  @change="projectModuleChange"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
            <el-form-item label="接口标签" prop="tag">
              <el-tag
                  v-for="tag in state.form.api_tags"
                  :key="tag"
                  size="default"
                  type="success"
                  closable
                  style="{margin-left: 0.25rem;margin-right: 0.25rem;}"
                  :disable-transitions="false"
                  @close="removeTag(tag)"
              >{{ tag }}
              </el-tag>
              <el-input
                  v-if="state.editTag"
                  ref="caseTagInputRef"
                  v-model="state.tagValue"
                  class="ml-1 w-20"
                  size="small"
                  @keyup.enter="addTag"
                  @blur="addTag"
                  style="width: 100px"
              />
              <el-button v-else size="small" @click="showEditTag">
                + New Tag
              </el-button>
            </el-form-item>
          </el-col>

          <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
            <el-form-item label="描述" prop="">
              <el-input size="default"
                        type="textarea"
                        v-model.trim="state.form.remarks"
                        style="width: 100%;"
                        placeholder="请输入用例名称"></el-input>
            </el-form-item>
          </el-col>

          <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">

          </el-col>

          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
            <el-form-item label="创建用户" prop="">
              <strong>{{ state.form.created_by_name }}</strong>
            </el-form-item>
          </el-col>

          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
            <el-form-item label="创建时间" prop="">
              <strong>{{ state.form.creation_date }}</strong>
            </el-form-item>
          </el-col>

          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
            <el-form-item label="更新用户" prop="" style="width: 100%;">
              <strong>{{ state.form.updated_by_name }}</strong>
            </el-form-item>
          </el-col>

          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
            <el-form-item label="更新时间" prop="" style="width: 100%;">
              <strong>{{ state.form.updation_date }}</strong>
            </el-form-item>
          </el-col>

        </el-row>
      </el-form>
    </div>

    <el-dialog
        v-model="state.showEnvPage"
        destroy-on-close
        title="调试"
        width="30%"
    >
      <el-form v-model="state.form">
        <el-form-item label="选择环境">
          <el-select v-model="state.form.env_id" placeholder="选择环境" filterable style="width:100%">
            <el-option :value="0" label="自带环境">自带环境</el-option>
            <el-option
                v-for="item in state.envList"
                :key="item.id"
                :label="`${item.name}(${item.domain_name})`"
                :value="item.id">
              <span style="float: left">{{ `${item.name}(${item.domain_name})` }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button size="default" type="success" @click="saveOrUpdateOrDebug('debug')">调试</el-button>
      </template>

    </el-dialog>

  </div>
</template>

<script setup name="apiInfo">
import {nextTick, onMounted, reactive, ref} from "vue";
import {ElMessage} from "element-plus";
import {listProject} from "@/api/project/project";

// emit
const emit = defineEmits(["saveOrUpdateOrDebug"])

// 自定义变量
const formRef = ref()
const methodRef = ref()
const caseTagInputRef = ref()
const createForm = () => {
  return {
    env_id: null,
    api_id: null,
    api_method: 'POST',
    api_name: '',
    api_url: '',
    project_id: null,
    project_module: [],
    api_tags: [],
    priority: 3,
    remarks: "",
  }
}
const state = reactive({
  // cat apiInfo info
  showCaseInfo: false,
  //tag
  editTag: false,
  tagValue: "",
  // form
  isShowDialog: false,
  handleType: '',   //apiInfo 调用类型， 保存，调试
  // 表单及校验
  form: createForm(),
  rules: {
    api_name: [{required: true, message: '请输入用例名', trigger: 'blur'}],
    project_id: [{required: true, message: '请选择所属项目', trigger: 'blur'}],
  },
  // 获取项目树
  projectTree: [],
  projectQuery: {
    page: 1,
    pageSize: 1000,
  },
  // url
  methodList: ['POST', "GET", "PUT", "DELETE"],
  // env
  showEnvPage: false,
  envList: []
});

// 初始化表单
const setData = (formData) => {
  state.form = createForm()
  if (formData) {
    state.form = {...state.form, ...formData}
    state.form.project_module = formData.project_id ? [formData.project_id] : []
    if (!state.form.tags) state.form.tags = []
    if (formData.project_id) {
      state.moduleQuery.project_id = formData.project_id
    }
  }
  methodChange(state.form.api_method)
}

// 获取项目数据
const fetchProjectData = async () => {
  try {
    const response = await listProject(state.projectQuery)
    // 使用 response.rows 来获取数组数据
    state.projectTree = response.rows.map(item => ({
      api_id: item.projectId,    // 对应 :props 中的 value
      api_name: item.projectName, // 对应 :props 中的 label
      children: []  // 如果需要子节点可以在这里添加
    }))
    console.log('projectTree:', state.projectTree)
  } catch (error) {
    console.error('获取项目数据失败:', error)
  }
}

// 获取表单数据
const getData = () => {
  return state.form
}

const projectModuleChange = (value) => {
  if (value && value.length > 0) {
    state.form.project_id = value[value.length - 1]
  } else {
    state.form.project_id = null
  }
}

// tags
const showEditTag = () => {
  state.editTag = true
  nextTick(() => {
    caseTagInputRef.value?.input.focus()
  })
}

const addTag = () => {
  if (state.editTag && state.tagValue) {
    if (!state.form.tags) state.form.tags = []
    state.form.tags.push(state.tagValue)
  }
  state.editTag = false
  state.tagValue = ''
}
const removeTag = (tag) => {
  state.form.tags.splice(state.form.tags.indexOf(tag), 1)
}

const handleDebug = () => {
  state.showEnvPage = true
  getEnvList()
}

// 保存，或调试用例
const saveOrUpdateOrDebug = (handleType = 'save') => {
  if (!state.form.api_url) {
    ElMessage.warning('请填写请求地址信息!');
    return
  }
  if (!state.form.api_method) {
    ElMessage.warning('请选择请求方式！');
    return
  }
  formRef.value.validate((valid) => {
    if (valid) {
      if (handleType === 'save') {
        emit('saveOrUpdateOrDebug', 'save')
      } else if (handleType === 'debug') {
        emit('saveOrUpdateOrDebug', 'debug')
        state.showEnvPage = false
      }
    } else {
      ElMessage.warning('请填写请求地址信息');
    }
  })
}

onMounted(() => {
  fetchProjectData()
})


defineExpose({
  projectModuleChange,
  setData,
  getData,
})

</script>


<style lang="scss" scoped>

.api-case {
  padding: 15px 16px;
  background-color: #ffffff;
  border-radius: 10px;
  border-left: 5px solid #409eff;
  margin-bottom: 20px;
  box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);

  .api-case__url_info {
    display: flex;
    margin-bottom: 20px;
  }

  :deep(.input-with-select .el-input-group__prepend) {
    background-color: var(--el-fill-color-blank);
  }
}

.method-color-get {
  color: #61affe
}

.method-color-post {
  color: #49cc90
}

.method-color-delete {
  color: #f93e3d
}

.method-color-put {
  color: #fca130
}

.method-color-na {
  color: #f56c6c
}
</style>