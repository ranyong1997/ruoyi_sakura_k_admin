<template>
  <div class="app-container">
    <!-- 服务器选择栏 -->
    <div class="server-bar">
      <el-select v-model="selectedServer" placeholder="请选择目标服务器" style="width: 320px;" filterable @change="onServerChange">
        <el-option v-for="item in serverList" :key="item.sshId" :label="item.sshName + ' (' + item.sshHost + ')'" :value="item" />
      </el-select>
      <div class="server-info" v-if="selectedServer">
        <el-tag type="success">{{ selectedServer.sshName }} ({{ selectedServer.sshHost }})</el-tag>
        <el-button-group style="margin-left: 10px;">
          <el-button type="primary" size="small" @click="handleNewTab">新建标签页</el-button>
          <el-button type="warning" size="small" @click="handleReboot" :disabled="!selectedServer">重启</el-button>
          <el-button type="danger" size="small" @click="handleShutdown" :disabled="!selectedServer">关机</el-button>
        </el-button-group>
      </div>
    </div>

    <!-- 主终端区域 -->
    <div class="terminal-container">
      <el-tabs v-model="activeTab" type="card" closable @tab-remove="removeTab">
        <el-tab-pane v-for="tab in terminalTabs" :key="tab.id" :label="tab.title" :name="tab.id">
          <div class="terminal-wrapper">
            <div class="terminal-output" ref="terminalOutput" @click="focusTerminal">
              <div v-for="(line, index) in tab.output" :key="index" class="terminal-line">
                <span class="prompt" v-if="line.type === 'input'">$</span>
                <span :class="['content', line.type]">{{ line.content }}</span>
              </div>
              <div class="terminal-input-line">
                <span class="prompt">$</span>
                <input
                  ref="terminalInput"
                  v-model="tab.currentInput"
                  @keydown.enter="executeCommand(tab)"
                  @keydown.up="navigateHistory(tab, 'up')"
                  @keydown.down="navigateHistory(tab, 'down')"
                  class="terminal-input"
                  spellcheck="false"
                  autocomplete="off"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 文件传输面板 -->
    <el-drawer
      v-model="showFilePanel"
      title="文件传输"
      direction="rtl"
      size="400px"
    >
      <div class="file-panel">
        <el-form :inline="true" style="margin-bottom: 10px;">
          <el-form-item label="本地文件">
            <el-input v-model="localFilePath" placeholder="本地文件路径" />
          </el-form-item>
          <el-form-item label="远程路径">
            <el-input v-model="remoteFilePath" placeholder="远程文件路径" />
          </el-form-item>
          <el-form-item>
            <el-button-group>
              <el-button type="primary" @click="handleUploadFile">上传</el-button>
              <el-button type="success" @click="handleDownloadFile">下载</el-button>
            </el-button-group>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>

    <!-- 快捷操作按钮 -->
    <div class="quick-actions">
      <el-button-group>
        <el-button type="primary" @click="showFilePanel = true">
          <el-icon><Upload /></el-icon> 文件传输
        </el-button>
        <el-button type="success" @click="handleQuickCommand('ls -la')">
          <el-icon><List /></el-icon> 列出文件
        </el-button>
        <el-button type="warning" @click="handleQuickCommand('df -h')">
          <el-icon><Monitor /></el-icon> 磁盘空间
        </el-button>
        <el-button type="info" @click="handleQuickCommand('top -n 1')">
          <el-icon><Cpu /></el-icon> 系统状态
        </el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { listSsh } from '@/api/servermanage/servermanage'
import {
  ExecuteCommand, ExecuteScript, UploadFile, DownloadFile, WriteText, ReadText, ListDirectory, MakeDirectory, RemoveFile, RemoveDirectory, GetFileInfo
} from '@/api/ssh/ssh'
import { ElMessage } from 'element-plus'
import { Upload, List, Monitor, Cpu } from '@element-plus/icons-vue'

const serverList = ref([])
const selectedServer = ref(null)
const activeTab = ref('1')
const showFilePanel = ref(false)
const terminalTabs = ref([
  {
    id: '1',
    title: '终端 1',
    output: [],
    currentInput: '',
    history: [],
    historyIndex: -1
  }
])

// 文件管理相关
const localFilePath = ref('')
const remoteFilePath = ref('')

// 获取服务器列表
onMounted(() => {
  listSsh().then(res => {
    serverList.value = res.rows || []
  })
})

function onServerChange() {
  if (selectedServer.value) {
    addTerminalOutput(activeTab.value, {
      type: 'system',
      content: `已连接到服务器: ${selectedServer.value.sshName} (${selectedServer.value.sshHost})`
    })
  }
}

function handleNewTab() {
  const newId = String(terminalTabs.value.length + 1)
  terminalTabs.value.push({
    id: newId,
    title: `终端 ${newId}`,
    output: [],
    currentInput: '',
    history: [],
    historyIndex: -1
  })
  activeTab.value = newId
}

function removeTab(targetId) {
  const tabs = terminalTabs.value
  let activeIndex = tabs.findIndex(tab => tab.id === activeTab.value)
  if (activeTab.value === targetId) {
    tabs.splice(activeIndex, 1)
    if (tabs.length && activeIndex >= tabs.length) {
      activeIndex = tabs.length - 1
    }
    activeTab.value = tabs[activeIndex]?.id
  }
}

function addTerminalOutput(tabId, line) {
  const tab = terminalTabs.value.find(t => t.id === tabId)
  if (tab) {
    tab.output.push(line)
    nextTick(() => {
      const output = document.querySelector('.terminal-output')
      if (output) {
        output.scrollTop = output.scrollHeight
      }
    })
  }
}

function executeCommand(tab) {
  if (!selectedServer.value) {
    ElMessage.error('请先选择服务器')
    return
  }

  const command = tab.currentInput.trim()
  if (!command) return

  // 添加到历史记录
  tab.history.push(command)
  tab.historyIndex = tab.history.length

  // 显示输入的命令
  addTerminalOutput(tab.id, { type: 'input', content: command })
  
  // 执行命令
  ExecuteCommand({ ssh_id: selectedServer.value.sshId, command, timeout: 60 }).then(res => {
    addTerminalOutput(tab.id, { type: 'output', content: res.data?.output || '' })
    if (res.data?.error) {
      addTerminalOutput(tab.id, { type: 'error', content: res.data.error })
    }
  }).catch(err => {
    addTerminalOutput(tab.id, { type: 'error', content: err.message })
  })

  tab.currentInput = ''
}

function navigateHistory(tab, direction) {
  if (tab.history.length === 0) return

  if (direction === 'up') {
    if (tab.historyIndex > 0) {
      tab.historyIndex--
      tab.currentInput = tab.history[tab.historyIndex]
    }
  } else {
    if (tab.historyIndex < tab.history.length - 1) {
      tab.historyIndex++
      tab.currentInput = tab.history[tab.historyIndex]
    } else {
      tab.historyIndex = tab.history.length
      tab.currentInput = ''
    }
  }
}

function handleQuickCommand(command) {
  const tab = terminalTabs.value.find(t => t.id === activeTab.value)
  if (tab) {
    tab.currentInput = command
    executeCommand(tab)
  }
}

// 保留原有的文件操作函数
function handleUploadFile() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  if (!localFilePath.value || !remoteFilePath.value) return ElMessage.warning('请填写本地和远程路径')
  UploadFile({ ssh_id: selectedServer.value.sshId, localPath: localFilePath.value, remote_path: remoteFilePath.value }).then(res => {
    ElMessage.success('上传成功')
    addTerminalOutput(activeTab.value, { type: 'system', content: '文件上传成功' })
  }).catch(err => {
    ElMessage.error('上传失败')
    addTerminalOutput(activeTab.value, { type: 'error', content: err.message })
  })
}

function handleDownloadFile() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  if (!remoteFilePath.value || !localFilePath.value) return ElMessage.warning('请填写本地和远程路径')
  DownloadFile({ ssh_id: selectedServer.value.sshId, remote_path: remoteFilePath.value, localPath: localFilePath.value }).then(res => {
    ElMessage.success('下载成功')
    addTerminalOutput(activeTab.value, { type: 'system', content: '文件下载成功' })
  }).catch(err => {
    ElMessage.error('下载失败')
    addTerminalOutput(activeTab.value, { type: 'error', content: err.message })
  })
}

// 保留原有的重启和关机功能
function handleReboot() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  ExecuteCommand({ sshId: selectedServer.value.sshId, command: 'reboot' }).then(res => {
    ElMessage.success('重启命令已发送')
    addTerminalOutput(activeTab.value, { type: 'system', content: '重启命令已发送' })
  }).catch(err => {
    ElMessage.error('重启失败')
    addTerminalOutput(activeTab.value, { type: 'error', content: err.message })
  })
}

function handleShutdown() {
  if (!selectedServer.value) return ElMessage.error('请选择服务器')
  ExecuteCommand({ sshId: selectedServer.value.sshId, command: 'shutdown -h now' }).then(res => {
    ElMessage.success('关机命令已发送')
    addTerminalOutput(activeTab.value, { type: 'system', content: '关机命令已发送' })
  }).catch(err => {
    ElMessage.error('关机失败')
    addTerminalOutput(activeTab.value, { type: 'error', content: err.message })
  })
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 10px;
  background-color: #1e1e1e;
  color: #fff;
}

.server-bar {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #2d2d2d;
  border-radius: 4px;
  margin-bottom: 10px;
}

.server-info {
  margin-left: 20px;
  display: flex;
  align-items: center;
}

.terminal-container {
  flex: 1;
  background-color: #1e1e1e;
  border-radius: 4px;
  overflow: hidden;
}

.terminal-wrapper {
  height: 100%;
  padding: 10px;
}

.terminal-output {
  height: 100%;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 10px;
}

.terminal-line {
  margin-bottom: 4px;
}

.prompt {
  color: #00ff00;
  margin-right: 8px;
}

.terminal-input-line {
  display: flex;
  align-items: center;
}

.terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  outline: none;
}

.content {
  white-space: pre-wrap;
  word-break: break-all;
}

.content.error {
  color: #ff4444;
}

.content.system {
  color: #00a8ff;
}

.quick-actions {
  margin-top: 10px;
  display: flex;
  justify-content: center;
}

.file-panel {
  padding: 20px;
}

:deep(.el-tabs__item) {
  color: #fff;
}

:deep(.el-tabs__item.is-active) {
  color: #409eff;
}

:deep(.el-tabs__nav) {
  background-color: #2d2d2d;
}

:deep(.el-drawer__header) {
  color: #fff;
  margin-bottom: 0;
}

:deep(.el-drawer__body) {
  background-color: #1e1e1e;
  color: #fff;
}
</style> 