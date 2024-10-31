<template>
  <div class="api-case el-card">
    <el-row>
      <el-col :xs="15" :sm="15" :md="15" :lg="15" :xl="15" class="mb20">
        <div class="api-case__method" style="padding-left: 5px">
          <el-form-item label="环境地址" prop="envUrl">
            <el-input
                size="default"
                v-model="state.form.envUrl"
                placeholder="请输入环境地址"
                class="input-with-select"
            >
            </el-input>
          </el-form-item>
        </div>
      </el-col>
      <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
        <div class="api-case__operation" style="padding-left: 12px">
          <el-button size="default" type="primary" @click="saveOrUpdateOrDebug('save')" class="title-button">保存
          </el-button>
          <el-button size="default" type="success" @click="handleDebug">刷新</el-button>
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
          <el-col :xs="15" :sm="15" :md="15" :lg="15" :xl="15" class="mb20">
            <el-form-item label="环境名称" prop="envName">
              <el-input v-model.trim="state.form.envName"
                        style="width: 100%;"
                        clearable
                        placeholder="请输入环境名称"/>
            </el-form-item>
          </el-col>
          <el-col :xs="15" :sm="15" :md="15" :lg="15" :xl="15" class="mb20">
            <el-form-item label="描述" prop="">
              <el-input size="default"
                        type="textarea"
                        v-model.trim="state.form.remark"
                        style="width: 100%;"
                        placeholder="请输入环境描述"/>
              <el-col :xs="15" :sm="15" :md="15" :lg="15" :xl="15" class="mb20">
                <el-form-item label="创建用户" prop="createBy">
                  <strong>{{ tableData.createBy }}</strong>
                </el-form-item>
              </el-col>

              <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
                <el-form-item label="创建时间" prop="createTime">
                  <strong>{{ tableData.createTime }}</strong>
                </el-form-item>
              </el-col>

              <el-col :xs="15" :sm="15" :md="15" :lg="15" :xl="15" class="mb20">
                <el-form-item label="更新用户" prop="updateBy" style="width: 100%;">
                  <strong>{{ tableData.updateBy }}</strong>
                </el-form-item>
              </el-col>

              <el-col :xs="6" :sm="6" :md="6" :lg="6" :xl="6" class="mb20">
                <el-form-item label="更新时间" prop="updateTime" style="width: 100%;">
                  <strong>{{ tableData.updateTime }}</strong>
                </el-form-item>
              </el-col>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
  </div>
</template>

<script setup name="envInfo">
import {nextTick, reactive, ref, watch} from "vue";
import {ElMessage} from "element-plus";
import {addEnv, updateEnv, listEnv} from "@/api/envinfo/envinfo";
import {getMethodColor} from "@/utils/case"
import {formatDate} from '@/components/monaco/formatTime';

// emit
const emit = defineEmits(["saveOrUpdateOrDebug"])
// 自定义变量
const formRef = ref()
const methodRef = ref()
const createForm = () => {
  return {
    envName: '',
    envUrl: '',
    envId: null,
    envHeaders: {},
    envVariables: {},
    remark: ""
  }
}
const state = reactive({
  // form
  handleType: '',   // envInfo 调用类型， 保存，刷新
  // 表单及校验
  form: createForm(),
  rules: {
    envName: [{required: true, message: '请输入环境名称', trigger: 'blur'}],
    envUrl: [{required: true, message: '请输入环境地址', trigger: 'blur'}],
  },

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
      envName: formData.envName || '',
      envUrl: formData.envUrl || '',
      envVariables: formData.envVariables || {},
      envHeaders: formData.envHeaders || {},
      remark: formData.remark || ""
    };
  }
}


// 获取表单数据
const getData = () => {
  return state.form
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
  if (!state.form.envUrl) {
    ElMessage.warning('请填写请求环境地址!');
    return
  }
  if (!state.form.envName) {
    ElMessage.warning('请填写请求环境名称!');
    return
  }
  try {
    if (handleType === 'save') {
      let response = null, msg = undefined;
      if (state.form.envId != null) {
        response = await updateEnv(state.form);
        msg = '保存成功'
      } else {
        response = await addEnv(state.form);
        msg = '新增成功'
      }
      let res = await listEnv()
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

defineExpose({
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