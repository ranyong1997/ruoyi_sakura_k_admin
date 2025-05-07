<template>
  <div class="app-container">
    <!-- 选择目标服务器 -->
    <el-card class="box-card" style="margin-bottom: 20px;">
      <div>
        <span style="font-weight: bold;">选择目标服务器</span>
        <el-select v-model="selectedServer" placeholder="请选择目标服务器" style="width: 320px; margin-left: 20px;" filterable @change="onServerChange">
          <el-option v-for="item in serverList" :key="item.sshId" :label="item.sshName + ' (' + item.sshHost + ')'" :value="item" />
        </el-select>
        <span v-if="selectedServer" style="margin-left: 20px; color: #2ecc71; font-weight: bold;">
          当前选择：{{ selectedServer.sshName }} ({{ selectedServer.sshHost }})
        </span>
      </div>
    </el-card>

    <!-- 执行维护操作Tab -->
    <el-card class="box-card" style="margin-bottom: 20px;">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="命令/脚本" name="cmd">
          <div style="display: flex; gap: 16px; margin-bottom: 12px;">
            <el-button type="primary" @click="showCommandDialog = true" :disabled="!selectedServer">执行SSH命令</el-button>
            <el-button type="success" @click="showScriptDialog = true" :disabled="!selectedServer">执行脚本</el-button>
            <el-button type="warning" @click="handleReboot" :disabled="!selectedServer">重启</el-button>
            <el-button type="danger" @click="handleShutdown" :disabled="!selectedServer">关机</el-button>
          </div>
        </el-tab-pane>
        <el-tab-pane label="文件管理" name="file">
          <el-form :inline="true" style="margin-bottom: 10px;">
            <el-form-item label="本地文件">
              <el-input v-model="localFilePath" placeholder="本地文件路径" style="width: 220px;" />
            </el-form-item>
            <el-form-item label="远程路径">
              <el-input v-model="remoteFilePath" placeholder="远程文件路径" style="width: 220px;" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleUploadFile" :disabled="!selectedServer">上传</el-button>
              <el-button type="success" @click="handleDownloadFile" :disabled="!selectedServer">下载</el-button>
              <el-button type="danger" @click="handleRemoveFile" :disabled="!selectedServer">删除</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="文本读写" name="text">
          <el-form :inline="true" style="margin-bottom: 10px;">
            <el-form-item label="远程文件">
              <el-input v-model="textFilePath" placeholder="远程文件路径" style="width: 220px;" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleReadText" :disabled="!selectedServer">读取</el-button>
            </el-form-item>
          </el-form>
          <el-input v-model="textContent" type="textarea" rows="4" placeholder="编辑文本内容" style="margin-bottom: 8px;" />
          <el-button type="success" @click="handleWriteText" :disabled="!selectedServer">写入</el-button>
        </el-tab-pane>
        <el-tab-pane label="目录管理" name="dir">
          <el-form :inline="true" style="margin-bottom: 10px;">
            <el-form-item label="目录路径">
              <el-input v-model="dirPath" placeholder="远程目录路径" style="width: 220px;" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleListDirectory" :disabled="!selectedServer">列出</el-button>
              <el-button type="success" @click="handleMakeDirectory" :disabled="!selectedServer">创建</el-button>
              <el-button type="danger" @click="handleRemoveDirectory" :disabled="!selectedServer">删除</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="文件信息" name="info">
          <el-form :inline="true" style="margin-bottom: 10px;">
            <el-form-item label="文件路径">
              <el-input v-model="infoFilePath" placeholder="远程文件路径" style="width: 220px;" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleGetFileInfo" :disabled="!selectedServer">获取信息</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 结果展示区 -->
    <el-card class="box-card" v-if="outputJson">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="code">{{ outputJson.code }}</el-descriptions-item>
        <el-descriptions-item label="msg">{{ outputJson.msg }}</el-descriptions-item>
        <el-descriptions-item label="output">
          <pre style="white-space: pre-wrap;">{{ outputJson.data?.output }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="error">{{ outputJson.data?.error }}</el-descriptions-item>
        <el-descriptions-item label="exit_code">{{ outputJson.data?.exit_code }}</el-descriptions-item>
        <el-descriptions-item label="success">{{ outputJson.success ? '是' : '否' }}</el-descriptions-item>
        <el-descriptions-item label="time">{{ outputJson.time }}</el-descriptions-item>
        <el-descriptions-item label="trace_id">{{ outputJson.trace_id }}</el-descriptions-item>
      </el-descriptions>
      <el-divider>原始JSON</el-divider>
      <el-input type="textarea" :value="JSON.stringify(outputJson, null, 2)" rows="10" readonly />
    </el-card>

    <!-- 维护日志 -->
    <el-card class="box-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <span style="font-weight: bold;">维护日志</span>
        <el-button type="danger" icon="Delete" size="small" @click="clearLogs">清空日志</el-button>
      </div>
      <el-table :data="logList" style="width: 100%;">
        <el-table-column prop="status" label="状态" width="80" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '成功' ? 'success' : 'danger'">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="server" label="服务器" width="220" align="center" />
        <el-table-column prop="action" label="操作" width="120" align="center" />
        <el-table-column prop="time" label="时间" width="180" align="center" />
        <el-table-column label="输出" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewOutput(scope.row)">查看输出</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 执行SSH命令弹窗 -->
    <el-dialog v-model="showCommandDialog" title="执行SSH命令" width="500px">
      <el-input v-model="commandContent" type="textarea" rows="4" placeholder="请输入要执行的命令" />
      <template #footer>
        <el-button @click="showCommandDialog = false">取消</el-button>
        <el-button type="primary" @click="handleExecuteCommand">执行</el-button>
      </template>
    </el-dialog>

    <!-- 执行脚本弹窗 -->
    <el-dialog v-model="showScriptDialog" title="执行脚本" width="500px">
      <el-input v-model="scriptContent" type="textarea" rows="8" placeholder="请输入Shell脚本内容" />
      <template #footer>
        <el-button @click="showScriptDialog = false">取消</el-button>
        <el-button type="primary" @click="handleExecuteScript">执行</el-button>
      </template>
    </el-dialog>

    <!-- 输出弹窗 -->
    <el-dialog v-model="showOutputDialog" title="操作输出" width="600px">
      <pre style="background: #f8f8f8; padding: 16px; border-radius: 6px; max-height: 400px; overflow: auto;">{{ currentOutput }}</pre>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listSsh } from '@/api/servermanage/servermanage'
import {
  ExecuteCommand, ExecuteScript, UploadFile, DownloadFile, WriteText, ReadText, ListDirectory, MakeDirectory, RemoveFile, RemoveDirectory, GetFileInfo
} from '@/api/ssh/ssh'
import { ElMessage } from 'element-plus'

const serverList = ref([])
const selectedServer = ref(null)
const logList = ref([])
const showScriptDialog = ref(false)
const scriptContent = ref('')
const showOutputDialog = ref(false)
const currentOutput = ref('')
const showCommandDialog = ref(false)
const commandContent = ref('')
const activeTab = ref('cmd')
const outputJson = ref(null)
// 文件管理
const localFilePath = ref('')
const remoteFilePath = ref('')
// 文本读写
const textFilePath = ref('')
const textContent = ref('')
// 目录管理
const dirPath = ref('')
// 文件信息
const infoFilePath = ref('')

// 获取服务器列表
onMounted(() => {
  listSsh().then(res => {
    serverList.value = res.rows || []
  })
})

function onServerChange() {
  // 可扩展：切换服务器时的逻辑
}

function addLog({ status, action, output }) {
  logList.value.unshift({
    status,
    server: selectedServer.value ? `${selectedServer.value.sshName} (${selectedServer.value.sshHost})` : '',
    action,
    time: new Date().toLocaleString(),
    output: output || ''
  })
}

function handleReboot() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  ExecuteCommand({ sshId: selectedServer.value.sshId, command: 'reboot' }).then(res => {
    addLog({ status: '成功', action: '重启', output: res.data })
    ElMessage.success('重启命令已发送')
  }).catch(err => {
    addLog({ status: '失败', action: '重启', output: err.message })
    ElMessage.error('重启失败')
  })
}

function handleShutdown() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  ExecuteCommand({ sshId: selectedServer.value.sshId, command: 'shutdown -h now' }).then(res => {
    addLog({ status: '成功', action: '关机', output: res.data })
    ElMessage.success('关机命令已发送')
  }).catch(err => {
    addLog({ status: '失败', action: '关机', output: err.message })
    ElMessage.error('关机失败')
  })
}



function handleExecuteScript() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  if (!scriptContent.value.trim()) return ElMessage.warn('请输入脚本内容')
  ExecuteScript({ sshId: selectedServer.value.sshId, script: scriptContent.value }).then(res => {
    outputJson.value = res
    ElMessage.success('脚本执行成功')
    showScriptDialog.value = false
    scriptContent.value = ''
  }).catch(err => {
    outputJson.value = { code: 500, msg: err.message, data: {}, success: false }
    ElMessage.error('脚本执行失败')
  })
}

function handleExecuteCommand() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  if (!commandContent.value.trim()) return ElMessage.warn('请输入命令内容')
  ExecuteCommand({ ssh_id: selectedServer.value.sshId, command: commandContent.value, timeout: 60 }).then(res => {
    outputJson.value = res
    ElMessage.success('命令执行成功')
    showCommandDialog.value = false
    commandContent.value = ''
  }).catch(err => {
    outputJson.value = { code: 500, msg: err.message, data: {}, success: false }
    ElMessage.error('命令执行失败')
  })
}

function viewOutput(row) {
  currentOutput.value = row.output
  showOutputDialog.value = true
}

function clearLogs() {
  logList.value = []
  ElMessage.success('日志已清空')
}

// 文件管理
function handleUploadFile() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  if (!localFilePath.value || !remoteFilePath.value) return ElMessage.warn('请填写本地和远程路径')
  UploadFile({ ssh_id: selectedServer.value.sshId, localPath: localFilePath.value, remote_path: remoteFilePath.value }).then(res => {
    outputJson.value = res
    ElMessage.success('上传成功')
  }).catch(err => {
    outputJson.value = { code: 500, msg: err.message, data: {}, success: false }
    ElMessage.error('上传失败')
  })
}
function handleDownloadFile() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  if (!remoteFilePath.value || !localFilePath.value) return ElMessage.warn('请填写本地和远程路径')
  DownloadFile({ ssh_id: selectedServer.value.sshId, remote_path: remoteFilePath.value, localPath: localFilePath.value }).then(res => {
    outputJson.value = res
    ElMessage.success('下载成功')
  }).catch(err => {
    outputJson.value = { code: 500, msg: err.message, data: {}, success: false }
    ElMessage.error('下载失败')
  })
}
function handleRemoveFile() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  if (!remoteFilePath.value) return ElMessage.warn('请填写远程路径')
  RemoveFile({ ssh_id: selectedServer.value.sshId, remote_path: remoteFilePath.value }).then(res => {
    outputJson.value = res
    ElMessage.success('删除成功')
  }).catch(err => {
    outputJson.value = { code: 500, msg: err.message, data: {}, success: false }
    ElMessage.error('删除失败')
  })
}
// 文本读写
function handleReadText() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  if (!textFilePath.value) return ElMessage.warn('请填写远程文件路径')
  ReadText({ ssh_id: selectedServer.value.sshId, remote_path: textFilePath.value }).then(res => {
    textContent.value = res.data?.output || ''
    outputJson.value = res
    ElMessage.success('读取成功')
  }).catch(err => {
    outputJson.value = { code: 500, msg: err.message, data: {}, success: false }
    ElMessage.error('读取失败')
  })
}
function handleWriteText() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  if (!textFilePath.value) return ElMessage.warn('请填写远程文件路径')
  WriteText({ ssh_id: selectedServer.value.sshId, remote_path: textFilePath.value, content: textContent.value }).then(res => {
    outputJson.value = res
    ElMessage.success('写入成功')
  }).catch(err => {
    outputJson.value = { code: 500, msg: err.message, data: {}, success: false }
    ElMessage.error('写入失败')
  })
}
// 目录管理
function handleListDirectory() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  if (!dirPath.value) return ElMessage.warn('请填写目录路径')
  ListDirectory({ ssh_id: selectedServer.value.sshId, remote_path: dirPath.value }).then(res => {
    outputJson.value = res
    ElMessage.success('列出成功')
  }).catch(err => {
    outputJson.value = { code: 500, msg: err.message, data: {}, success: false }
    ElMessage.error('列出失败')
  })
}
function handleMakeDirectory() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  if (!dirPath.value) return ElMessage.warn('请填写目录路径')
  MakeDirectory({ ssh_id: selectedServer.value.sshId, remote_path: dirPath.value }).then(res => {
    outputJson.value = res
    ElMessage.success('创建成功')
  }).catch(err => {
    outputJson.value = { code: 500, msg: err.message, data: {}, success: false }
    ElMessage.error('创建失败')
  })
}
function handleRemoveDirectory() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  if (!dirPath.value) return ElMessage.warn('请填写目录路径')
  RemoveDirectory({ ssh_id: selectedServer.value.sshId, remote_path: dirPath.value }).then(res => {
    outputJson.value = res
    ElMessage.success('删除成功')
  }).catch(err => {
    outputJson.value = { code: 500, msg: err.message, data: {}, success: false }
    ElMessage.error('删除失败')
  })
}
// 文件信息
function handleGetFileInfo() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  if (!infoFilePath.value) return ElMessage.warn('请填写文件路径')
  GetFileInfo({ ssh_id: selectedServer.value.sshId, remote_path: infoFilePath.value }).then(res => {
    outputJson.value = res
    ElMessage.success('获取成功')
  }).catch(err => {
    outputJson.value = { code: 500, msg: err.message, data: {}, success: false }
    ElMessage.error('获取失败')
  })
}
</script>

<style scoped>
.box-card {
  margin-bottom: 20px;
}
</style> 