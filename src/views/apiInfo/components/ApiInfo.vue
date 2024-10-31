<template>
  <div class="api-case el-card">
    <el-row>
      <el-col :xs="15" :sm="15" :md="15" :lg="15" :xl="15" class="mb20">
        <div class="api-case__method" style="padding-left: 5px">
          <el-input
              size="default"
              v-model="state.form.apiUrl"
              placeholder="请输入请求路径"
              class="input-with-select"
          >
            <template #prepend>
              <el-select v-model="state.form.apiMethod"
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
        </div>
      </el-col>
    </el-row>
    <div class="api-case__detail">
      <el-form ref="formRef"
               :model="state.form"
               label-width="auto"
               label-position="right"
               :rules="state.rules">
        <el-row :gutter="24">
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
            <el-form-item label="接口名称" prop="apiName">
              <el-input v-model.trim="state.form.apiName"
                        style="width: 100%;"
                        clearable
                        placeholder="请输入接口名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
            <el-form-item label="项目" prop="projectId">
              <el-cascader
                  v-model="state.form.projectId"
                  :props="{ label: 'apiName', value: 'apiId' }"
                  :options="state.projectTree"
                  filterable
                  style="width: 100%"
                  @change="projectModuleChange"
              />
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
            <el-form-item label="优先级" prop="apiLevel">
              <el-select v-model="state.form.apiLevel"
                         size="default"
                         ref="methodRef"
                         placeholder=""
                         @change="methodChange"
                         style="width: 100px; color: #22a1c4">
                <el-option
                    v-for="item in state.apiLevel"
                    :key="item"
                    :label="item"
                    :value="item">
                  <span :class="[`method-color-${item.toLowerCase()}`]">{{ item }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mb20">
            <el-form-item label="接口标签" prop="apiTags">
              <el-tag
                  v-for="tag in state.form.apiTags"
                  :key="tag"
                  size="default"
                  type="success"
                  closable
                  :style="{marginLeft: '0.25rem',marginRight: '0.25rem'}"
                  :disable-transitions="false"
                  @close="removeTag(tag)"
              >
                {{ tag }}
              </el-tag>
              <el-input
                  v-if="state.editTag"
                  ref="caseTagInputRef"
                  v-model="state.tagValue"
                  class="ml-1 tag-input"
                  size="small"
                  @keyup.enter="addTag"
                  @blur="addTag"
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
                        v-model.trim="state.form.remark"
                        style="width: 100%;"
                        placeholder="请输入用例描述"></el-input>
            </el-form-item>
          </el-col>

          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
            <el-form-item label="创建用户" prop="createBy">
              <strong>{{ tableData.createBy }}</strong>
            </el-form-item>
          </el-col>

          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
            <el-form-item label="创建时间" prop="createTime">
              <strong>{{ tableData.createTime }}</strong>
            </el-form-item>
          </el-col>

          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
            <el-form-item label="更新用户" prop="updateBy" style="width: 100%;">
              <strong>{{ tableData.updateBy }}</strong>
            </el-form-item>
          </el-col>

          <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
            <el-form-item label="更新时间" prop="updateTime" style="width: 100%;">
              <strong>{{ tableData.updateTime }}</strong>
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
      <template #footer>
        <el-button size="default" type="success" @click="saveOrUpdateOrDebug('debug')">调试</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="apiInfo">
import {nextTick, onMounted, reactive, ref, watch} from "vue";
import {ElMessage} from "element-plus";
import {listProject} from "@/api/project/project";
import {addApi, updateApi, listApi} from "@/api/apiInfo/apiInfo";
import {getMethodColor} from "@/utils/case"
import {formatDate} from '@/components/monaco/formatTime';

// emit
const emit = defineEmits(["saveOrUpdateOrDebug"])
// 自定义变量
const formRef = ref()
const methodRef = ref()
const caseTagInputRef = ref()
const createForm = () => {
  return {
    apiMethod: 'POST',
    apiName: '',
    apiUrl: '',
    projectId: null,
    apiTags: [],
    apiLevel: 'P0',
    remark: ""
  }
}
const state = reactive({
  // cat apiInfo info
  showCaseInfo: false,
  //tag
  editTag: false, // 是否显示输入框
  tagValue: "", // 输入框的值
  // form
  isShowDialog: false,
  handleType: '',   //apiInfo 调用类型， 保存，调试
  // 表单及校验
  form: createForm(),
  rules: {
    apiName: [{required: true, message: '请输入用例名', trigger: 'blur'}],
    projectId: [{required: true, message: '请选择所属项目', trigger: 'blur'}],
  },
  // 获取项目树
  projectTree: [],
  projectQuery: {
    page: 1,
    pageSize: 1000
  },
  // url
  methodList: ['POST', "GET", "PUT", "DELETE"],
  // 优先级
  apiLevel: ['P0', "P1", "P2", "P3"]
});

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
});

// 监听 formData 的变化
watch(() => props.formData, (newVal) => {
  if (newVal) {
    setData(newVal);
  }
}, {deep: true});

// 初始化表单
const setData = (formData) => {
  state.form = createForm()
  if (formData) {
    state.form = {
      ...state.form,
      ...JSON.parse(JSON.stringify(formData)),
      apiMethod: formData.apiMethod || 'POST',
      apiName: formData.apiName || '',
      apiUrl: formData.apiUrl || '',
      projectId: formData.projectId || null,
      apiTags: formData.apiTags || [],
      apiLevel: formData.apiLevel || 'P0',
      remark: formData.remark || ""
    };
  }
  nextTick(() => {
    methodChange(state.form.apiMethod);
  });
}

const methodChange = (method) => {
  let selectInputEl = methodRef.value.$el.getElementsByTagName("input")
  if (selectInputEl.length > 0) selectInputEl[0].style.color = getMethodColor(method)
}


// 获取项目数据
const fetchProjectData = async () => {
  try {
    const response = await listProject(state.projectQuery)
    // 使用 response.rows 来获取数组数据
    state.projectTree = response.rows.map(item => ({
      apiId: item.projectId,    // 对应 :props 中的 value
      apiName: item.projectName, // 对应 :props 中的 label
      children: []  // 如果需要子节点可以在这里添加
    }))
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
    state.form.projectId = value[value.length - 1]
  } else {
    state.form.projectId = null
  }
}

// 显示tags
const showEditTag = () => {
  state.editTag = true
  nextTick(() => {
    caseTagInputRef.value?.input?.focus()
  })
}
// 添加tags
const addTag = () => {
  if (state.tagValue) {
    // 检查标签是否已存在
    if (!state.form.apiTags.includes(state.tagValue)) {
      state.form.apiTags.push(state.tagValue)
    }
    state.tagValue = '' // 清空输入框
  }
  state.editTag = false // 隐藏输入框
}
// 移除Tags
const removeTag = (tag) => {
  state.form.apiTags.splice(state.form.apiTags.indexOf(tag), 1)
}

const handleDebug = () => {
  state.showEnvPage = true
}

const tableData = ref({
  createBy: '',
  createTime: '',
  updateBy: '',
  updateTime: '',
})

// 保存，或调试用例
const saveOrUpdateOrDebug = async (handleType = 'save') => {
  // 表单验证
  if (!state.form.apiUrl) {
    ElMessage.warning('请填写请求地址信息!');
    return
  }
  if (!state.form.apiMethod) {
    ElMessage.warning('请选择请求方式！');
    return
  }
  // 表单验证
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) {
    ElMessage.warning('请填写请求地址信息');
    return;
  }
  try {
    if (handleType === 'save') {
      let response = null, msg = undefined;
      if (state.form.apiId != null) {
        response = await updateApi(state.form);
        msg = '保存成功'
      } else {
        response = await addApi(state.form);
        msg = '新增成功'
      }
      let res = await listApi()
      if (res && res.rows && Array.isArray(res.rows)) {
        tableData.value = res.rows[0];
        tableData.value.createTime = formatDate(new Date(res.rows[0].createTime), "YYYY-mm-dd HH:MM:SS");
        tableData.value.updateTime = formatDate(new Date(res.rows[0].updateTime), "YYYY-mm-dd HH:MM:SS");
      }

      if (response.code === 200) { // 根据你的接口返回码判断
        ElMessage.success(msg);
        emit('saveOrUpdateOrDebug', 'save');
      } else {
        ElMessage.error(response.message || '保存失败');
      }
    } else if (handleType === 'debug') {
      emit('saveOrUpdateOrDebug', 'debug');
      state.showEnvPage = false;
    }
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败，请重试');
  }
}

onMounted(() => {
  fetchProjectData()
})


defineExpose({
  setData,
  getData,
  projectModuleChange
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