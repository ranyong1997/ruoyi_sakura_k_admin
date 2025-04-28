<template>
  <el-dialog 
    :model-value="visible" 
    title="报告详情" 
    width="80%" 
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="emit('close')">
    <div class="report-container">
      <!-- 统计信息 -->
      <el-card class="statistics-card">
        <div class="statistics-wrapper">
          <div class="stat-item">
            <div class="chart-container">
              <el-progress type="circle" :percentage="100" status="success" :width="80" />
            </div>
            <div class="stat-info">
              <div>平均请求耗时: <span class="highlight">{{ reportData.avgRequestTime || '0' }} ms</span></div>
              <div>执行总耗时: <span class="highlight">{{ reportData.totalTime || '0' }} m</span></div>
            </div>
          </div>

          <div class="stat-item">
            <div class="chart-container">
              <el-progress type="circle" :percentage="getSuccessRate" status="success" :width="80" />
            </div>
            <div class="stat-info">
              <div>测试用例: <span class="highlight">{{ reportData.totalCases || '0' }}</span></div>
              <div>成功: <span class="highlight">{{ reportData.successCases || '0' }}</span></div>
              <div>失败: <span class="highlight">{{ reportData.failCases || '0' }}</span></div>
            </div>
          </div>

          <div class="stat-item">
            <div class="chart-container">
              <el-progress type="circle" :percentage="getStepSuccessRate" status="success" :width="80" />
            </div>
            <div class="stat-info">
              <div>测试步骤: <span class="highlight">{{ reportData.totalSteps || '0' }}</span></div>
              <div>成功: <span class="highlight">{{ reportData.successSteps || '0' }}</span></div>
              <div>失败: <span class="highlight">{{ reportData.failSteps || '0' }}</span></div>
              <div>跳过: <span class="highlight">{{ reportData.skippedSteps || '0' }}</span></div>
              <div>错误: <span class="highlight">{{ reportData.errorSteps || '0' }}</span></div>
            </div>
          </div>

          <div class="stat-item execution-info">
            <div class="stat-info">
              <div>执行时间: <span class="highlight">{{ reportData.executionTime || '-' }}</span></div>
              <div>执行人: <span class="highlight">{{ reportData.executor || '-' }}</span></div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 步骤表格 -->
      <el-table 
        v-loading="loading" 
        :data="filteredSteps" 
        style="width: 100%"
        :header-cell-style="{ 'background-color': '#f5f7fa', color: '#606266' }">
        <el-table-column label="N" width="50" type="index" align="center" />
        <el-table-column prop="name" label="名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="method" label="请求方法" width="110" align="center">
          <template #default="scope">
            <el-tag :type="getMethodTagType(scope.row.method)">
              {{ scope.row.method }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="url" label="url" min-width="180" show-overflow-tooltip />
        <el-table-column prop="statusCode" label="HttpCode" width="110" align="center">
          <template #default="scope">
            <span :class="getStatusClass(scope.row.statusCode)">
              {{ scope.row.statusCode }} {{ getStatusText(scope.row.statusCode) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="responseTime" label="请求耗时(ms)" width="120" align="center" />
        <el-table-column prop="status" label="状态" width="110" align="center">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="errorMessage" label="错误信息" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="100" align="center">
          <template #default="scope">
            <el-button link type="primary" @click="showDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="请求详情"
      width="70%"
      append-to-body
      :destroy-on-close="true">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="响应信息" name="response">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="状态码">
              <span :class="getStatusClass(currentDetail.statusCode)">
                {{ currentDetail.statusCode }} {{ getStatusText(currentDetail.statusCode) }}
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="响应时间">{{ currentDetail.responseTime }} ms</el-descriptions-item>
            <el-descriptions-item label="Body长度">{{ currentDetail.bodySize || '-' }} B</el-descriptions-item>
            <el-descriptions-item label="ContentType">{{ currentDetail.contentType || '-' }}</el-descriptions-item>
          </el-descriptions>
          <div class="response-body">
            <h4>Body</h4>
            <pre>{{ formatJson(currentDetail.responseBody) }}</pre>
          </div>
        </el-tab-pane>
        <el-tab-pane label="请求信息" name="request">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="URL">{{ currentDetail.url }}</el-descriptions-item>
            <el-descriptions-item label="方法">{{ currentDetail.method }}</el-descriptions-item>
          </el-descriptions>
          <div v-if="currentDetail.requestHeaders" class="request-headers">
            <h4>请求头</h4>
            <pre>{{ formatJson(currentDetail.requestHeaders) }}</pre>
          </div>
          <div v-if="currentDetail.requestBody" class="request-body">
            <h4>请求体</h4>
            <pre>{{ formatJson(currentDetail.requestBody) }}</pre>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch, onMounted } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  reportData: {
    type: Object,
    default: () => ({})
  }
})

onMounted(() => {
  console.log('ReportDialog 组件已挂载, visible:', props.visible);
})

// 记录props变化
watch(() => props.visible, (newVal) => {
  console.log('ReportDialog visible 属性变化:', newVal);
})

watch(() => props.reportData, (newVal) => {
  console.log('ReportDialog reportData 属性变化:', newVal);
}, { deep: true })

const emit = defineEmits(['close']);

// 计算统计百分比
const getSuccessRate = computed(() => {
  if (!props.reportData.totalCases || props.reportData.totalCases === 0) return 0
  return Math.round((props.reportData.successCases / props.reportData.totalCases) * 100)
})

const getStepSuccessRate = computed(() => {
  if (!props.reportData.totalSteps || props.reportData.totalSteps === 0) return 0
  return Math.round((props.reportData.successSteps / props.reportData.totalSteps) * 100)
})

// 步骤数据处理
const loading = ref(false)
const filteredSteps = computed(() => {
  return props.reportData.steps || []
})

// 标签和状态样式
const getMethodTagType = (method) => {
  if (!method) return ''
  const methodMap = {
    'GET': 'primary',
    'POST': 'success',
    'PUT': 'warning',
    'DELETE': 'danger',
    'PATCH': 'info'
  }
  return methodMap[method.toUpperCase()] || ''
}

const getStatusTagType = (status) => {
  if (!status) return ''
  const statusMap = {
    'SUCCESS': 'success',
    'FAILED': 'danger',
    'ERROR': 'danger',
    'SKIPPED': 'info'
  }
  return statusMap[status] || ''
}

const getStatusClass = (code) => {
  if (!code) return ''
  if (code >= 200 && code < 300) return 'status-success'
  if (code >= 400 && code < 500) return 'status-client-error'
  if (code >= 500) return 'status-server-error'
  return ''
}

const getStatusText = (code) => {
  if (!code) return ''
  if (code === 200) return 'OK'
  if (code === 201) return 'Created'
  if (code === 204) return 'No Content'
  if (code === 400) return 'Bad Request'
  if (code === 401) return 'Unauthorized'
  if (code === 403) return 'Forbidden'
  if (code === 404) return 'Not Found'
  if (code === 500) return 'Server Error'
  return ''
}

// 详情处理
const detailVisible = ref(false)
const currentDetail = ref({})
const activeTab = ref('response')

const showDetail = (row) => {
  currentDetail.value = row
  detailVisible.value = true
  activeTab.value = 'response' // 默认显示响应标签页
}

// 格式化JSON
const formatJson = (json) => {
  if (!json) return ''
  try {
    if (typeof json === 'string') {
      return JSON.stringify(JSON.parse(json), null, 2)
    } else {
      return JSON.stringify(json, null, 2)
    }
  } catch (e) {
    return json
  }
}
</script>

<style scoped>
.report-container {
  padding: 10px;
}

.statistics-card {
  margin-bottom: 20px;
}

.statistics-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  padding: 10px;
  min-width: 200px;
}

.chart-container {
  margin-right: 15px;
}

.stat-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.highlight {
  color: #409EFF;
  font-weight: bold;
}

.execution-info {
  flex-grow: 1;
  justify-content: flex-end;
}

.status-success {
  color: #67C23A;
}

.status-client-error {
  color: #E6A23C;
}

.status-server-error {
  color: #F56C6C;
}

.response-body,
.request-body,
.request-headers {
  margin-top: 15px;
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 10px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
}
</style> 