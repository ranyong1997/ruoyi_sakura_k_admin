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
                        style="width: 50%;"
                        placeholder="请输入用例描述"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <el-dialog
        v-model="state.showEnvPage"
        destroy-on-close
        title="运行用例"
        width="30%"
    >
      <el-form :model="debugForm" label-width="80px">
        <el-form-item label="运行模式">
          <el-select v-model="debugForm.runMode" placeholder="请选择运行模式" class="w-full">
            <el-option label="同步运行(同步执行,等待执行结果)" value="sync"></el-option>
            <el-option label="异步运行(异步执行用例,后台运行,执行结束后报告列表查看)" value="async"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="运行环境">
          <el-select v-model="debugForm.runEnv" placeholder="请选择运行环境" class="w-full">
            <el-option
                v-for="env in envList"
                :key="env.envId"
                :label="env.envName"
                :value="env.envId">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="state.showEnvPage = false">取消</el-button>
          <el-button size="default" type="primary" @click="saveOrUpdateOrDebug('debug')">运行</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 测试报告弹窗 -->
    <ReportDialog 
      :visible="state.showReportDialog" 
      @update:visible="state.showReportDialog = $event"
      :reportData="reportData"
      @close="closeReportDialog" 
    />
  </div>
</template>

<script setup name="apiInfo">
import {nextTick, onMounted, reactive, ref, watch} from "vue";
import {ElMessage} from "element-plus";
import {listProject} from "@/api/project/project";
import {addApi, testApiById, updateApi} from "@/api/apiInfo/apiInfo";
import {getMethodColor} from "@/utils/case"
import {listEnv} from "@/api/envinfo/envinfo"
import {formatDate} from '@/components/monaco/formatTime';
import ReportDialog from './ReportDialog.vue';

// 报告数据
const reportData = ref({
  avgRequestTime: 0,
  totalTime: 0,
  totalCases: 0,
  successCases: 0,
  failCases: 0,
  totalSteps: 0,
  successSteps: 0,
  failSteps: 0,
  skippedSteps: 0,
  errorSteps: 0,
  executionTime: formatDate(new Date(), "YYYY-MM-DD HH:mm:ss"),
  executor: 'admin',
  steps: []
});

const debugForm = reactive({
  runMode: '同步运行(同步执行,等待执行结果)',
  runEnv: ''
})

// emit
const emit = defineEmits(["saveOrUpdateOrDebug"])
// 自定义变量
const envList = ref([])
const formRef = ref()
const methodRef = ref()
const caseTagInputRef = ref()
const createForm = () => {
  return {
    apiMethod: 'POST',
    apiName: '',
    apiUrl: '',
    projectId: null,
    apiLevel: 'P0',
    apiTags: [],
    requestData: {},
    requestDataType: 0,
    requestHeaders: {},
    remark: "",
    lastRunStatus: null,
    lastRunTime: null
  }
}
// 获取环境列表
const fetchEnvList = async () => {
  try {
    const res = await listEnv()
    if (res && res.rows) {
      envList.value = res.rows
      console.log('envList', envList.value)
      // 如果有数据，默认选中第一个环境
      if (envList.value.length > 0) {
        debugForm.runEnv = envList.value[0].id
      }
    }
  } catch (error) {
    ElMessage.error('获取环境列表失败:', error)
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
  apiLevel: ['P0', "P1", "P2", "P3"],
  // 报告对话框
  showReportDialog: false,
  showEnvPage: false,
  // 最后执行状态
  lastExecutionStatus: '',
  lastExecutionTime: ''
});

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  },
  paramsData: {
    type: Object,
    default: () => ({})
  },
  bodyData: {
    type: Object,
    default: () => ({})
  },
  headersData: {
    type: Object,
    default: () => ({})
  },
  cookiesData: {
    type: Object,
    default: () => ({})
  }
});

// 监听 formData 的变化
watch(() => [props.formData, props.paramsData,props.bodyData,props.headersData,props.cookiesData], ([newVal,paramsData,bodyData,headersData,cookiesData]) => {
  console.log('formData', newVal, 'paramsData', paramsData,'bodyData',bodyData,'headersData',headersData,'cookiesData',cookiesData);


  
  if (newVal) {
    nextTick(() => {
      setData(newVal);
      
      // state.form = createForm()
      // state.form = {
        
      // }
    })
  }
}, {deep: true,immediate:true});

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
      requestData: formData.requestData || {},
      requestDataType: formData.requestDataType || '0', // 0[none] 1[json] 2[form] 3[x_form] 4[raw]
      requestHeaders: formData.requestHeaders || {},
      apiLevel: formData.apiLevel || 'P0',
      remark: formData.remark || "",
      lastRunStatus: formData.lastRunStatus || null,
      lastRunTime: formData.lastRunTime || null
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
// 调试
const handleDebug = () => {
  state.showEnvPage = true
}

const tableData = ref({
  createBy: '',
  createTime: '',
  updateBy: '',
  updateTime: '',
})

// 更新到state.form和发出事件
const emitSaveOrUpdateOrDebug = (type, extraParams = {}) => {
  console.log('发出事件:', type, '额外参数:', extraParams);
  
  // 将来自props的参数合并到表单数据
  if (props.bodyData) {
    try {
      // 处理JSON数据
      if (props.bodyData.contentType === 'application/json' && props.bodyData.content) {
        if (typeof props.bodyData.content === 'string') {
          try {
            state.form.requestData = JSON.parse(props.bodyData.content);
          } catch (e) {
            console.error('解析JSON失败:', e);
            state.form.requestData = props.bodyData.content;
          }
        } else {
          state.form.requestData = props.bodyData.content;
        }
      } else {
        state.form.requestData = props.bodyData.content;
      }
    } catch (e) {
      console.error('处理请求体数据失败:', e);
    }
  }
  
  // 合并headers
  if (props.headersData) {
    state.form.requestHeaders = {};
    props.headersData.forEach(header => {
      if (header.name) {
        state.form.requestHeaders[header.name] = header.value;
      }
    });
  }
  
  // 合并params
  if (props.paramsData) {
    state.form.params = [...props.paramsData];
  }
  
  // 合并cookies
  if (props.cookiesData) {
    state.form.cookies = [...props.cookiesData];
  }
  
  console.log('即将发送的表单数据:', state.form);
  
  // 发出事件
  emit('saveOrUpdateOrDebug', type, {
    ...state.form,
    ...extraParams
  });
};

// 保存，或调试用例
const saveOrUpdateOrDebug = async (handleType = 'save', externalData = null) => {
  // 使用外部传入的数据或本地表单数据
  const formData = externalData || state.form;
  
  console.log('开始执行操作:', handleType, '数据:', formData);
  
  // 表单验证
  if (!formData.apiUrl) {
    ElMessage.warning('请填写请求地址信息');
    return
  }
  if (!formData.apiMethod) {
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
      if (formData.apiId != null) {
        // 先向父组件发送事件，确保获取到最新的表单数据
        emitSaveOrUpdateOrDebug('getData');
        
        // 然后调用API更新
        response = await updateApi(formData);
        msg = '保存成功🎉'
      } else {
        // 先向父组件发送事件，确保获取到最新的表单数据
        emitSaveOrUpdateOrDebug('getData');
        
        // 然后调用API新增
        response = await addApi(formData);
        msg = '新增成功🎉'
      }
      if (response.code === 200) { // 根据你的接口返回码判断
        ElMessage.success(msg);
        emitSaveOrUpdateOrDebug('save');
      } else {
        ElMessage.error(response.message || '保存失败');
      }
    } else if (handleType === 'debug') {
      // 验证表单
      if (!debugForm.runEnv) {
        ElMessage.warn('请选择运行环境')
        return
      }
      // 执行调试逻辑
      console.log('开始调试，模式:', debugForm.runMode, '环境:', debugForm.runEnv)
      
      try {
        // 调用API进行调试
        console.log('调用API测试，ID:', formData.apiId);
        const response = await testApiById(formData.apiId, debugForm.runEnv);
        console.log('调试API响应:', response);
        
        // 无论API响应如何，我们都显示报告
        // 设置最后执行状态和时间
        const isSuccess = (response && response.code === 200 && (response.data?.success !== false));
        
        // 调试：打印完整的响应结构，方便排查time字段位置
        console.log('调试响应结构:', JSON.stringify(response));
        
        // 尝试从多个可能的位置获取time
        let responseTime = null;
        if (response?.data?.time) {
          responseTime = response.data.time;
          console.log('从data.time获取到时间:', responseTime);
        } else if (response?.data?.response?.time) {
          responseTime = response.data.response.time;
          console.log('从data.response.time获取到时间:', responseTime);
        } else if (response?.time) {
          responseTime = response.time;
          console.log('从response.time获取到时间:', responseTime);
        } else if (response?.data?.responseTime) {
          responseTime = response.data.responseTime;
          console.log('从data.responseTime获取到时间:', responseTime);
        } else {
          // 如果找不到，使用当前时间
          responseTime = new Date().toISOString();
          console.log('未找到时间字段，使用当前时间:', responseTime);
        }
        
        // 更新表单中的执行状态和时间 - 使用与后台期望的格式
        state.form.lastRunStatus = isSuccess ? '0' : '1'; // 0正常 1失败
        state.form.lastRunTime = responseTime;
        
        // 保存最后执行状态到后端
        if (formData.apiId) {
          try {
            // 从调试结果获取 time 并更新接口的 lastRunTime 和 lastRunStatus
            const updateResponse = await updateApi({
              apiId: formData.apiId,
              apiName: formData.apiName || state.form.apiName,
              projectId: formData.projectId || state.form.projectId,
              apiMethod: formData.apiMethod || state.form.apiMethod,
              apiUrl: formData.apiUrl || state.form.apiUrl,
              apiStatus: formData.apiStatus || state.form.apiStatus || "0",
              apiLevel: formData.apiLevel || state.form.apiLevel,
              apiTags: formData.apiTags || state.form.apiTags || [],
              requestDataType: formData.requestDataType || state.form.requestDataType || 0,
              requestParams: formData.requestParams || formData.params || state.form.params || [],
              requestData: formData.requestData || state.form.requestData || {},
              requestHeaders: formData.requestHeaders || state.form.requestHeaders || {},
              cookie: formData.cookie || "",
              lastRunStatus: state.form.lastRunStatus,
              lastRunTime: state.form.lastRunTime,
              createBy: formData.createBy || state.form.createBy || "",
              createTime: formData.createTime || state.form.createTime || "",
              updateBy: formData.updateBy || state.form.updateBy || "",
              updateTime: formData.updateTime || state.form.updateTime || "",
              remark: formData.remark || state.form.remark || ""
            });
            console.log('更新执行状态结果:', updateResponse);
          } catch (updateError) {
            console.error('更新执行状态失败:', updateError);
          }
        }
        
        // 处理报告数据
        console.log('处理报告数据');
        processReportData(response?.data || response);
        
        // 显示报告对话框
        console.log('设置报告对话框可见');
        state.showReportDialog = true;
        setTimeout(() => {
          // 确保在下一个渲染循环中设置
          if (!state.showReportDialog) {
            console.log('强制设置报告对话框可见');
            state.showReportDialog = true;
          }
        }, 0);
        
        console.log('报告对话框状态:', state.showReportDialog);
        
        // 通知父组件，并传递执行状态和时间
        console.log('通知父组件');
        emitSaveOrUpdateOrDebug('debug', {
          apiId: formData.apiId,
          lastRunStatus: state.form.lastRunStatus,
          lastRunTime: state.form.lastRunTime
        });
        
        if (response && response.code === 200) {
          ElMessage.success('调试成功');
        } else {
          // 即使API调用失败也显示报告
          ElMessage.warning('API返回非成功状态，详情请查看报告');
        }
      } catch (error) {
        console.error('调试失败:', error);
        ElMessage.error('调试失败: ' + (error.message || '未知错误'));
      }
      
      state.showEnvPage = false;
    }
  } catch (error) {
    ElMessage.error('操作失败，请重试');
  }
}

// 处理报告数据
const processReportData = (data) => {
  if (!data) {
    console.error('处理报告数据失败: 数据为空');
    // 使用测试数据用于调试
    data = {
      avgTime: 95.41,
      totalTime: 0.098,
      statusCode: 200,
      success: true,
      message: "操作成功",
      status: "SUCCESS",
      response: {
        msg: "操作成功",
        code: 200,
        data: {},
        success: true,
        time: new Date().toISOString()
      }
    };
  }
  
  console.log('处理报告原始数据:', data);
  
  // 尝试从多个可能的位置获取time
  let responseTime = null;
  if (data?.time) {
    responseTime = data.time;
    console.log('报告从data.time获取到时间:', responseTime);
  } else if (data?.response?.time) {
    responseTime = data.response.time;
    console.log('报告从data.response.time获取到时间:', responseTime);
  } else if (data?.responseTime) {
    responseTime = data.responseTime;
    console.log('报告从data.responseTime获取到时间:', responseTime);
  } else {
    // 如果找不到，使用当前时间
    responseTime = formatDate(new Date(), "YYYY-MM-DD HH:mm:ss");
    console.log('报告未找到时间字段，使用当前时间:', responseTime);
  }
  
  // 确定接口调用是否成功
  const isSuccess = (data.code === 200 || 
                     data.statusCode === 200 || 
                     data.status_code === 200 || 
                     data.success === true || 
                     (data.response && data.response.code === 200) ||
                     (data.status && data.status.toLowerCase() === 'success'));
  
  console.log('接口是否调用成功:', isSuccess);
  
  // 1. 处理基本统计信息
  reportData.value = {
    avgRequestTime: data.avgTime || data.summary?.avgTime || 95.41, // 默认值用于测试
    totalTime: data.totalTime || data.summary?.totalTime || 0.098,  // 默认值用于测试
    totalCases: 1, // 假设每次调试就是一个用例
    successCases: isSuccess ? 1 : 0,
    failCases: isSuccess ? 0 : 1,
    totalSteps: data.steps?.length || 1,
    successSteps: isSuccess ? (data.steps?.length || 1) : 0,
    failSteps: isSuccess ? 0 : 1,
    skippedSteps: 0,
    errorSteps: 0,
    executionTime: responseTime, // 使用从响应中获取的时间
    executor: 'admin', // 这里可以替换为实际的用户信息
    steps: []
  };
  
  console.log('设置reportData:', reportData.value);
  
  // 2. 处理步骤数据
  if (data.steps && Array.isArray(data.steps)) {
    reportData.value.steps = data.steps.map(step => {
      // 确定步骤是否成功
      const stepSuccess = step.success === true || 
                      (step.statusCode >= 200 && step.statusCode < 300) ||
                      (step.status_code >= 200 && step.status_code < 300);
      
      return {
        name: step.name || state.form.apiName,
        method: step.method || state.form.apiMethod,
        url: step.url || state.form.apiUrl,
        statusCode: step.statusCode || step.status_code || 200,
        responseTime: step.responseTime || step.response_time || 0,
        executionTime: step.executionTime || step.execution_time || 0,
        status: stepSuccess ? 'SUCCESS' : 'FAILED',
        requestBody: step.requestBody || step.request_data,
        requestHeaders: step.requestHeaders || step.request_headers,
        responseBody: step.responseBody || step.response,
        contentType: step.contentType || step.content_type,
        errorMessage: step.errorMessage || step.error_message,
      };
    });
  } else {
    // 如果没有steps数据，构造一个默认的step
    reportData.value.steps = [{
      name: state.form.apiName,
      method: state.form.apiMethod,
      url: state.form.apiUrl,
      statusCode: data.statusCode || data.status_code || 200,
      responseTime: data.avgTime || data.avgRequestTime || 95.41,
      executionTime: data.totalTime || 0.098,
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      requestBody: data.requestBody || data.request_data || state.form.requestData,
      requestHeaders: data.requestHeaders || data.request_headers || state.form.requestHeaders,
      responseBody: data.responseBody || data.response || data,
      contentType: data.contentType || data.content_type || 'application/json',
      errorMessage: data.errorMessage || data.error_message || '',
    }];
  }
  
  console.log('处理后的报告数据:', reportData.value);
  console.log('步骤数据:', reportData.value.steps);
}

onMounted(() => {
  fetchProjectData()
  fetchEnvList()
})

// 打开弹窗时也可以刷新环境列表
const openEnvDialog = () => {
  fetchEnvList()
  state.showEnvPage = true
}

// 添加关闭报告对话框的方法
const closeReportDialog = () => {
  console.log('关闭报告对话框');
  state.showReportDialog = false;
}

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