<template>
  <el-drawer
    :model-value="localVisible"
    @update:model-value="handleVisibleChange"
    title="报告详情"
    direction="rtl"
    size="80%"
    :destroy-on-close="true"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <template #header>
      <div class="drawer-header">
        <span class="drawer-title">
          <el-icon><Document /></el-icon>
          测试报告详情
        </span>
      </div>
    </template>

    <div class="report-container">
      <!-- 统计信息卡片 -->
      <el-card class="statistics-card" shadow="hover">
        <div class="statistics-title">
          <el-icon><DataAnalysis /></el-icon>
          <span>测试结果统计</span>
        </div>
        <el-divider />
        <div class="statistics-wrapper">
          <div class="stat-item">
            <div class="chart-container">
              <el-progress 
                type="dashboard" 
                :percentage="100" 
                status="success" 
                :width="100"
                :stroke-width="10"
              >
                <template #default>
                  <div class="progress-content">
                    <span class="progress-value">{{ reportData.avgRequestTime || '0' }}</span>
                    <span class="progress-label">毫秒</span>
                  </div>
                </template>
              </el-progress>
              <div class="stat-title">平均请求耗时</div>
            </div>
            <div class="stat-info">
              <div>执行总耗时: <span class="highlight">{{ reportData.totalTime || '0' }} 分钟</span></div>
            </div>
          </div>

          <div class="stat-item">
            <div class="chart-container">
              <el-progress 
                type="dashboard" 
                :percentage="getSuccessRate" 
                :status="getSuccessRate >= 90 ? 'success' : getSuccessRate >= 60 ? 'warning' : 'exception'" 
                :width="100"
                :stroke-width="10"
              >
                <template #default>
                  <div class="progress-content">
                    <span class="progress-value">{{ getSuccessRate }}</span>
                    <span class="progress-label">%</span>
                  </div>
                </template>
              </el-progress>
              <div class="stat-title">用例成功率</div>
            </div>
            <div class="stat-info">
              <el-row :gutter="10">
                <el-col :span="12">
                  <div class="stat-box">
                    <div class="stat-box-title">总用例</div>
                    <div class="stat-box-value">{{ reportData.totalCases || '0' }}</div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="stat-box success-box">
                    <div class="stat-box-title">成功</div>
                    <div class="stat-box-value">{{ reportData.successCases || '0' }}</div>
                  </div>
                </el-col>
              </el-row>
              <el-row :gutter="10" class="mt-2">
                <el-col :span="12">
                  <div class="stat-box error-box">
                    <div class="stat-box-title">失败</div>
                    <div class="stat-box-value">{{ reportData.failCases || '0' }}</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>

          <div class="stat-item">
            <div class="chart-container">
              <el-progress 
                type="dashboard" 
                :percentage="getStepSuccessRate" 
                :status="getStepSuccessRate >= 90 ? 'success' : getStepSuccessRate >= 60 ? 'warning' : 'exception'" 
                :width="100"
                :stroke-width="10"
              >
                <template #default>
                  <div class="progress-content">
                    <span class="progress-value">{{ getStepSuccessRate }}</span>
                    <span class="progress-label">%</span>
                  </div>
                </template>
              </el-progress>
              <div class="stat-title">步骤成功率</div>
            </div>
            <div class="stat-info">
              <el-row :gutter="10">
                <el-col :span="8">
                  <div class="stat-box">
                    <div class="stat-box-title">总步骤</div>
                    <div class="stat-box-value">{{ reportData.totalSteps || '0' }}</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-box success-box">
                    <div class="stat-box-title">成功</div>
                    <div class="stat-box-value">{{ reportData.successSteps || '0' }}</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-box error-box">
                    <div class="stat-box-title">失败</div>
                    <div class="stat-box-value">{{ reportData.failSteps || '0' }}</div>
                  </div>
                </el-col>
              </el-row>
              <el-row :gutter="10" class="mt-2">
                <el-col :span="8">
                  <div class="stat-box warning-box">
                    <div class="stat-box-title">跳过</div>
                    <div class="stat-box-value">{{ reportData.skippedSteps || '0' }}</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-box error-box">
                    <div class="stat-box-title">错误</div>
                    <div class="stat-box-value">{{ reportData.errorSteps || '0' }}</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>

          <div class="stat-item execution-info">
            <el-card shadow="hover" class="execution-card">
              <template #header>
                <div class="execution-header">
                  <el-icon><Timer /></el-icon>
                  执行信息
                </div>
              </template>
              <div class="execution-content">
                <div class="execution-row">
                  <el-icon><Calendar /></el-icon>
                  <span>执行时间：</span>
                  <span class="highlight">{{ reportData.executionTime || '-' }}</span>
                </div>
                <div class="execution-row">
                  <el-icon><User /></el-icon>
                  <span>执行人：</span>
                  <span class="highlight">{{ reportData.executor || '-' }}</span>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </el-card>

      <!-- 步骤表格 -->
      <el-card class="steps-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <el-icon><List /></el-icon>
            <span>测试步骤详情</span>
          </div>
        </template>
        <el-table 
          v-loading="loading" 
          :data="filteredSteps" 
          style="width: 100%"
          border
          stripe
          highlight-current-row
          :header-cell-style="{ backgroundColor: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
        >
          <el-table-column label="#" width="60" type="index" align="center" />
          <el-table-column prop="name" label="名称" min-width="120" show-overflow-tooltip />
          <el-table-column prop="method" label="请求方法" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getMethodTagType(scope.row.method)" effect="plain" round>
                {{ scope.row.method }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="url" label="URL" min-width="180" show-overflow-tooltip />
          <el-table-column prop="statusCode" label="状态码" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getHttpStatusTagType(scope.row.statusCode)" effect="light">
                {{ scope.row.statusCode }} 
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="responseTime" label="耗时(ms)" width="100" align="center">
            <template #default="scope">
              <span :class="getResponseTimeClass(scope.row.responseTime)">
                {{ scope.row.responseTime }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90" align="center">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)" effect="dark" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="errorMessage" label="错误信息" min-width="180" show-overflow-tooltip />
          <el-table-column label="操作" width="80" align="center" fixed="right">
            <template #default="scope">
              <el-tooltip content="查看详情" placement="top">
                <el-button type="primary" circle size="small" @click="showDetail(scope.row)">
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      :model-value="detailVisible"
      @update:model-value="detailVisible = $event"
      title="请求详情"
      direction="ltr"
      size="50%"
      append-to-body
      :destroy-on-close="true"
    >
      <template #header>
        <div class="drawer-header">
          <span class="drawer-title">
            <el-icon><InfoFilled /></el-icon>
            {{ currentDetail.name || '请求详情' }}
          </span>
          <el-tag 
            :type="getMethodTagType(currentDetail.method)"
            effect="plain"
            size="large"
            class="method-tag"
          >
            {{ currentDetail.method }}
          </el-tag>
        </div>
      </template>

      <el-tabs v-model="activeTab" type="border-card">
        <el-tab-pane label="响应信息" name="response">
          <div class="detail-section">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="URL">
                <el-tag type="info" effect="plain">{{ currentDetail.url }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="状态码">
                <el-tag :type="getHttpStatusTagType(currentDetail.statusCode)" effect="light">
                  {{ currentDetail.statusCode }} {{ getStatusText(currentDetail.statusCode) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="响应时间">
                <span :class="getResponseTimeClass(currentDetail.responseTime)">
                  {{ currentDetail.responseTime }} ms
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="Body长度">
                {{ currentDetail.bodySize || '-' }} 字节
              </el-descriptions-item>
              <el-descriptions-item label="内容类型">
                {{ currentDetail.contentType || '-' }}
              </el-descriptions-item>
            </el-descriptions>
            
            <div class="response-body">
              <div class="response-header">
                <el-icon><Document /></el-icon>
                <span>响应内容</span>
              </div>
              <div class="json-view-container">
                <pre class="json-view">{{ formatJson(currentDetail.responseBody) }}</pre>
              </div>
            </div>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="请求信息" name="request">
          <div class="detail-section">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="URL">
                <el-tag type="info" effect="plain">{{ currentDetail.url }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="请求方法">
                <el-tag :type="getMethodTagType(currentDetail.method)" effect="plain">
                  {{ currentDetail.method }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
            
            <div v-if="currentDetail.requestHeaders" class="request-headers">
              <div class="request-header">
                <el-icon><Connection /></el-icon>
                <span>请求头</span>
              </div>
              <div class="json-view-container">
                <pre class="json-view">{{ formatJson(currentDetail.requestHeaders) }}</pre>
              </div>
            </div>
            
            <div v-if="currentDetail.requestBody" class="request-body">
              <div class="request-header">
                <el-icon><Message /></el-icon>
                <span>请求体</span>
              </div>
              <div class="json-view-container">
                <pre class="json-view">{{ formatJson(currentDetail.requestBody) }}</pre>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-drawer>
  </el-drawer>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, watch, onMounted } from 'vue';
import { 
  Document, 
  InfoFilled, 
  View, 
  Connection, 
  Message, 
  Timer, 
  Calendar, 
  User,
  List,
  DataAnalysis
} from '@element-plus/icons-vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  reportData: {
    type: Object,
    default: () => ({})
  }
});

console.log("props.reportData",props.reportData)
// 使用本地变量代替直接的v-model绑定
const localVisible = ref(props.visible);

// 监听props变化
watch(() => props.visible, (newValue) => {
  console.log('ReportDialog visible 属性变化:', newValue);
  localVisible.value = newValue;
});

const emit = defineEmits(['close', 'update:visible']);

// 处理drawer可见性变化
const handleVisibleChange = (value) => {
  localVisible.value = value;
  emit('update:visible', value);
  
  if (!value) {
    handleClose();
  }
};

// 处理关闭事件
const handleClose = () => {
  emit('close');
};

// 计算统计百分比
const getSuccessRate = computed(() => {
  if (!props.reportData.totalCases || props.reportData.totalCases === 0) return 0;
  return Math.round((props.reportData.successCases / props.reportData.totalCases) * 100);
});

const getStepSuccessRate = computed(() => {
  if (!props.reportData.totalSteps || props.reportData.totalSteps === 0) return 0;
  return Math.round((props.reportData.successSteps / props.reportData.totalSteps) * 100);
});

// 步骤数据处理
const loading = ref(false);
const filteredSteps = computed(() => {
  return props.reportData.steps || [];
});

// 标签和状态样式
const getMethodTagType = (method) => {
  if (!method) return '';
  const methodMap = {
    'GET': 'primary',
    'POST': 'success',
    'PUT': 'warning',
    'DELETE': 'danger',
    'PATCH': 'info'
  };
  return methodMap[method.toUpperCase()] || '';
};

const getStatusTagType = (status) => {
  if (!status) return '';
  const statusMap = {
    'SUCCESS': 'success',
    'FAILED': 'danger',
    'ERROR': 'danger',
    'SKIPPED': 'info'
  };
  return statusMap[status] || '';
};

const getHttpStatusTagType = (code) => {
  if (!code) return 'info';
  if (code >= 200 && code < 300) return 'success';
  if (code >= 400 && code < 500) return 'warning';
  if (code >= 500) return 'danger';
  return 'info';
};

const getStatusClass = (code) => {
  if (!code) return '';
  if (code >= 200 && code < 300) return 'status-success';
  if (code >= 400 && code < 500) return 'status-client-error';
  if (code >= 500) return 'status-server-error';
  return '';
};

const getResponseTimeClass = (time) => {
  if (!time) return '';
  if (time < 100) return 'response-time-fast';
  if (time < 500) return 'response-time-normal';
  if (time < 1000) return 'response-time-slow';
  return 'response-time-very-slow';
};

const getStatusText = (code) => {
  if (!code) return '';
  if (code === 200) return 'OK';
  if (code === 201) return 'Created';
  if (code === 204) return 'No Content';
  if (code === 400) return 'Bad Request';
  if (code === 401) return 'Unauthorized';
  if (code === 403) return 'Forbidden';
  if (code === 404) return 'Not Found';
  if (code === 500) return 'Server Error';
  return '';
};

// 详情处理
const detailVisible = ref(false);
const currentDetail = ref({});
const activeTab = ref('response');

const showDetail = (row) => {
  currentDetail.value = row;
  detailVisible.value = true;
  activeTab.value = 'response'; // 默认显示响应标签页
};

// 格式化JSON
const formatJson = (json) => {
  if (!json) return '';
  try {
    if (typeof json === 'string') {
      return JSON.stringify(JSON.parse(json), null, 2);
    } else {
      return JSON.stringify(json, null, 2);
    }
  } catch (e) {
    return json;
  }
};
</script>

<style scoped>
.report-container {
  padding: 16px;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.drawer-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.drawer-title .el-icon {
  margin-right: 8px;
  font-size: 20px;
}

.method-tag {
  margin-left: 10px;
  font-weight: bold;
}

.statistics-card, .steps-card {
  margin-bottom: 20px;
  border-radius: 8px;
  transition: all 0.3s;
}

.statistics-card:hover, .steps-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header, .statistics-title, .execution-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.card-header .el-icon, .statistics-title .el-icon, .execution-header .el-icon {
  margin-right: 8px;
}

.statistics-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 16px;
}

.stat-item {
  display: flex;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  min-width: 280px;
  flex: 1;
}

.chart-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 20px;
}

.stat-title {
  margin-top: 8px;
  font-weight: bold;
  color: #606266;
  text-align: center;
}

.progress-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.progress-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.progress-label {
  font-size: 12px;
  color: #909399;
}

.stat-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.stat-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 6px;
  padding: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 4px;
}

.stat-box-title {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-box-value {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.success-box .stat-box-value {
  color: #67C23A;
}

.error-box .stat-box-value {
  color: #F56C6C;
}

.warning-box .stat-box-value {
  color: #E6A23C;
}

.mt-2 {
  margin-top: 8px;
}

.highlight {
  color: #409EFF;
  font-weight: bold;
}

.execution-info {
  flex-grow: 1;
}

.execution-card {
  height: 100%;
}

.execution-content {
  padding: 8px 0;
}

.execution-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.execution-row .el-icon {
  margin-right: 8px;
  color: #909399;
}

.status-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
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

.response-time-fast {
  color: #67C23A;
  font-weight: bold;
}

.response-time-normal {
  color: #409EFF;
  font-weight: bold;
}

.response-time-slow {
  color: #E6A23C;
  font-weight: bold;
}

.response-time-very-slow {
  color: #F56C6C;
  font-weight: bold;
}

.detail-section {
  padding: 16px;
}

.response-body,
.request-body,
.request-headers {
  margin-top: 24px;
}

.response-header, .request-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 12px;
  padding: 8px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.response-header .el-icon, .request-header .el-icon {
  margin-right: 8px;
  color: #409EFF;
}

.json-view-container {
  background-color: #f8f8f8;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  padding: 16px;
  max-height: 400px;
  overflow: auto;
}

.json-view {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
}

/* 适配不同屏幕大小 */
@media (max-width: 1200px) {
  .statistics-wrapper {
    flex-direction: column;
  }
  
  .stat-item {
    width: 100%;
  }
}
</style> 