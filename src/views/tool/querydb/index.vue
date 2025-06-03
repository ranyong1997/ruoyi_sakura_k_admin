<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <el-card class="query-card">
          <div class="db-header">
            <div class="db-selector">
              <el-select
                v-model="value"
                clearable
                placeholder="请选择数据源"
                style="width: 240px"
                size="default"
                @change="getTableListById"
              >
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
              <span v-if="value" class="current-db">当前库：{{ options.find(item => item.value === value)?.label }}</span>
            </div>
            <div class="db-actions" v-if="tableData.length > 0">
              <el-button type="success" size="small" @click="exportToExcel">
                <el-icon><Download /></el-icon> 导出Excel
              </el-button>
              <el-button type="info" size="small" @click="copyToClipboard">
                <el-icon><CopyDocument /></el-icon> 复制结果
              </el-button>
            </div>
          </div>
          
          <splitpanes :push-other-panes="false" class="default-theme" style="height: calc(91vh - 135px);">
            <pane size="15" class="splitpanes__pane-tree">
              <div class="tree-header">
                <span>数据表</span>
                <el-input 
                  v-if="getTableList.length > 0" 
                  v-model="tableSearchQuery" 
                  placeholder="搜索表" 
                  prefix-icon="Search"
                  clearable
                  size="small"
                />
              </div>
              <el-tree
                :data="filteredTableList"
                :props="defaultProps"
                @node-click="handleNodeClick"
                :highlight-current="true"
                node-key="label"
                :expand-on-click-node="false"
                default-expand-all
              />
            </pane>
            <pane>
              <splitpanes :push-other-panes="false" horizontal>
                <pane size="45" class="operate-pane">
                  <div class="editor-header">
                    <el-button type="primary" @click="execute">
                      <el-icon><VideoPlay /></el-icon> 执行
                    </el-button>
                    <el-button @click="formatSql">
                      <el-icon><Brush /></el-icon> 格式化
                    </el-button>
                  </div>
                  <z-monaco-editor 
                    ref="monacoEditRef" 
                    :style="{height: state.height + 'px'}" 
                    v-model:value="state.sql" 
                    v-model:lang="state.lang" 
                    :executeHandle="execute"
                  />
                </pane>
                <pane>
                  <div class="results-container">
                    <div v-if="loading" class="loading-overlay">
                      <el-spinner :size="50" />
                    </div>
                    <div v-if="tableData.length > 0" class="results-header">
                      <span class="results-count">查询结果: {{ tableData.length }} 条记录</span>
                      <el-input
                        v-model="resultSearchQuery"
                        placeholder="搜索结果"
                        style="width: 200px"
                        size="small"
                        clearable
                      >
                        <template #prefix>
                          <el-icon><Search /></el-icon>
                        </template>
                      </el-input>
                    </div>
                    <div class="table-container" v-show="tableData.length > 0">
                      <el-table
                        :data="filteredTableData"
                        border
                        stripe
                        highlight-current-row
                        style="width: 100%"
                        height="100%"
                        :max-height="tableMaxHeight"
                        table-layout="auto"
                      >
                        <el-table-column type="index" width="50" fixed="left" />
                        <el-table-column
                          v-for="header in tableHeaders"
                          :key="header"
                          :prop="header"
                          :label="header"
                          min-width="150"
                          show-overflow-tooltip
                          sortable
                        >
                          <template #default="scope">
                            <expandable-cell
                              v-if="scope.row && scope.row[header] !== undefined"
                              :content="String(scope.row[header])"
                              :max-length="50"
                            />
                            <span v-else class="null-value">NULL</span>
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                    <div v-if="tableData.length === 0 && !loading" class="no-data">
                      <el-empty description="暂无查询结果" />
                    </div>
                  </div>
                </pane>
              </splitpanes>
            </pane>
          </splitpanes>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="QueryDb">
import { ElMessage, ElLoading } from 'element-plus'
import { executingSql, getDatabaseTableById, listDatasource } from '@/api/datasource/datasource';
import { Pane, Splitpanes } from 'splitpanes'
import { reactive, ref, toRefs, computed, nextTick } from 'vue';
import 'splitpanes/dist/splitpanes.css'
import ExpandableCell from './components/ExpandableCell.vue';
import { Download, CopyDocument, VideoPlay, Search, Brush } from '@element-plus/icons-vue';
import * as XLSX from 'xlsx';

const loading = ref(false);
const options = ref([]);
const monacoEditRef = ref();
const value = ref('');
const tableData = ref([]);
const tableHeaders = ref([]);
const tableMaxHeight = ref('400px');
const tableSearchQuery = ref('');
const resultSearchQuery = ref('');

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10
  }
});
const {queryParams} = toRefs(data);

// 过滤表格数据
const filteredTableData = computed(() => {
  if (!resultSearchQuery.value) return tableData.value;
  
  return tableData.value.filter(row => {
    return Object.values(row).some(val => 
      val !== null && 
      val !== undefined && 
      String(val).toLowerCase().includes(resultSearchQuery.value.toLowerCase())
    );
  });
});

// 过滤表列表
const filteredTableList = computed(() => {
  if (!tableSearchQuery.value) return getTableList.value;
  
  return getTableList.value.map(db => {
    // 复制数据库对象
    const filteredDb = { ...db };
    
    // 过滤子表
    if (db.children && db.children.length) {
      filteredDb.children = db.children.filter(table => 
        table.label.toLowerCase().includes(tableSearchQuery.value.toLowerCase())
      );
    }
    
    // 只返回有匹配表的数据库
    return filteredDb.children && filteredDb.children.length > 0 ? filteredDb : null;
  }).filter(Boolean); // 移除空值
});

// 获取数据源列表
function getList() {
  loading.value = true;
  listDatasource(queryParams.value).then(response => {
    options.value = response.rows.map(item => ({
      value: item.datasourceId,
      label: item.datasourceName
    }));
    loading.value = false;
  });
}

// 根据id 获取表结构列表
function getTableListById(datasourceId) {
  if (datasourceId === '' || datasourceId === undefined) {
    getTableList.value = [];
    return;
  }
  loading.value = true;
  getDatabaseTableById(datasourceId).then(response => {
    let res = response.data.result.database_structure;
    let result = [];// 定义一个树
    if (res.message) {
      ElMessage.error(res.message)
    } else {
      for (let key in res) {
        let obj = {
          label: key,
          children: []
        }
        for (let i in res[key]) {
          let child = {
            label: res[key][i],
          }
          obj.children.push(child)
        }
        result.push(obj)
      }
    }
    getTableList.value = result;
    loading.value = false;
  });
}

// 获取表列表
const getTableList = ref([]);
const defaultProps = {
  children: 'children',
  label: 'label',
}

// 获取当前选中的数据源ID
const getDatasourceId = () => {
  const datasourceId = value.value;
  if (!datasourceId) {
    console.error("未选择数据源");
    return null;
  }
  return datasourceId;
};

// 节点点击事件
const handleNodeClick = (data, node) => {
  if (!data) {
    console.error("节点数据为空");
    return;
  }
  // 获取当前选中的数据源ID
  const datasourceId = getDatasourceId();
  if (!datasourceId) return
  // 获取点击的节点标签（表名或列名）
  const label = data.label;
  if (!label) {
    console.error("节点标签为空");
    return;
  }

  // 获取父节点信息
  let parentInfo = "";
  if (node.parent && node.parent.data && node.parent.data.label) {
    parentInfo = node.parent.data.label;
  }

  // 更新 executeForm 中的值
  state.executeForm.datasource_id = datasourceId;
  state.executeForm.database = parentInfo;
  
  // 只有点击表名（子节点）时才更新SQL
  if (node.isLeaf) {
    state.sql = `SELECT * FROM ${label} LIMIT 100;`;
  }
};

// 更新 getSqlData 函数
const getSqlData = (datasource_id, database, sql) => {
  loading.value = true;
  const params = {
    datasource_id,
    database,
    sql
  };
  
  executingSql(params)
    .then(response => {
      // 确保 response 和 response.data 存在
      if (response && response.data && response.data.result) {
        const {fields, data} = response.data.result;
        // 更新表头
        tableHeaders.value = fields;
        // 将数据转换为对象数组
        tableData.value = data.map(row => {
          const rowObject = {};
          fields.forEach((field, index) => {
            rowObject[field] = row[index];
          });
          return rowObject;
        });
        
        if (tableData.value.length > 0) {
          ElMessage.success(`查询成功，共 ${tableData.value.length} 条记录`);
        } else {
          ElMessage.info('查询成功，但没有返回数据');
        }
      } else {
        ElMessage.error("返回的数据格式不正确");
      }
      // 在数据更新后，重新计算表格高度
      nextTick(() => {
        calculateTableHeight();
      });
    })
    .catch(error => {
      tableHeaders.value = [];
      tableData.value = [];
      ElMessage.error(error.message || "查询执行失败");
    })
    .finally(() => {
      loading.value = false;
    });
};

// 计算表格高度的函数
const calculateTableHeight = () => {
  const containerHeight = document.querySelector('.table-container')?.clientHeight || 400;
  tableMaxHeight.value = `${containerHeight}px`;
};

// 编辑器配置信息
const state = reactive({
  lang: 'sql',
  height: 600,
  sql: 'SELECT * FROM ',
  executeForm: {
    datasource_id: '',
    database: '',
    sql: '',
  }
});

// 格式化SQL
const formatSql = () => {
  if (!state.sql) return;
  
  // 简单的SQL格式化，实际项目中可以使用更复杂的格式化库
  let formattedSql = state.sql
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*=\s*/g, ' = ')
    .replace(/\s*>\s*/g, ' > ')
    .replace(/\s*<\s*/g, ' < ')
    .replace(/\s*SELECT\s+/gi, 'SELECT\n  ')
    .replace(/\s*FROM\s+/gi, '\nFROM\n  ')
    .replace(/\s*WHERE\s+/gi, '\nWHERE\n  ')
    .replace(/\s*AND\s+/gi, '\n  AND ')
    .replace(/\s*OR\s+/gi, '\n  OR ')
    .replace(/\s*ORDER BY\s+/gi, '\nORDER BY\n  ')
    .replace(/\s*GROUP BY\s+/gi, '\nGROUP BY\n  ')
    .replace(/\s*HAVING\s+/gi, '\nHAVING\n  ')
    .replace(/\s*LIMIT\s+/gi, '\nLIMIT ');
  
  state.sql = formattedSql;
};

// 导出到Excel
const exportToExcel = () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('没有数据可导出');
    return;
  }
  
  try {
    const worksheet = XLSX.utils.json_to_sheet(tableData.value);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Query Results');
    
    // 生成文件名
    const fileName = `query_results_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.xlsx`;
    
    // 导出Excel
    XLSX.writeFile(workbook, fileName);
    ElMessage.success(`已成功导出到 ${fileName}`);
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message);
  }
};

// 复制到剪贴板
const copyToClipboard = () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('没有数据可复制');
    return;
  }
  
  try {
    // 创建表格字符串
    let tableString = tableHeaders.value.join('\t') + '\n';
    
    tableData.value.forEach(row => {
      const rowValues = tableHeaders.value.map(header => {
        const value = row[header];
        return value !== null && value !== undefined ? String(value) : 'NULL';
      });
      tableString += rowValues.join('\t') + '\n';
    });
    
    // 复制到剪贴板
    navigator.clipboard.writeText(tableString)
      .then(() => ElMessage.success('已复制查询结果到剪贴板'))
      .catch(err => ElMessage.error('复制失败: ' + err.message));
  } catch (error) {
    ElMessage.error('复制失败: ' + error.message);
  }
};

// 组合数据源、数据库、sql语句进行 sql 操作
const execute = () => {
  if (!state.executeForm.datasource_id) {
    ElMessage.warning("请选择对应数据源！");
    return;
  } else if (!state.executeForm.database) {
    ElMessage.warning("请选择对应数据库！");
    return;
  } else if (!state.sql) {
    ElMessage.warning("请输入sql语句！");
    return;
  }
  getSqlData(state.executeForm.datasource_id, state.executeForm.database, state.sql)
}

getList();
</script>

<style lang="scss" scoped>
.query-card {
  height: calc(100vh - 135px);
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.db-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.db-selector {
  display: flex;
  align-items: center;
  
  .current-db {
    margin-left: 12px;
    font-weight: 500;
    color: #409EFF;
  }
}

.tree-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  font-weight: 500;
  
  span {
    font-size: 14px;
    color: #606266;
  }
}

.editor-header {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.results-container {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  margin-bottom: 8px;
  
  .results-count {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.splitpanes {
  background: #FFFFFF;
}

.splitpanes__pane {
  display: flex;
}

.operate-pane {
  flex-direction: column;
}

.splitpanes__pane-tree {
  overflow: auto;
  align-items: baseline;
  padding: 0 8px;
  display: flex;
  flex-direction: column;
}

:deep(.splitpanes--vertical > .splitpanes__splitter) {
  min-width: 3px;
  margin: 0 3px;
  background: linear-gradient(90deg, #e0e6ed, #c0c4cc);
  
  &:hover {
    background: linear-gradient(90deg, #c0c4cc, #909399);
  }
}

:deep(.splitpanes--horizontal > .splitpanes__splitter) {
  min-height: 3px;
  margin: 3px 0;
  background: linear-gradient(0deg, #e0e6ed, #c0c4cc);
  
  &:hover {
    background: linear-gradient(0deg, #c0c4cc, #909399);
  }
}

.table-container {
  height: calc(100% - 40px);
  overflow: hidden;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.null-value {
  color: #909399;
  font-style: italic;
}

:deep(.el-table) {
  // 确保表格填满容器
  height: 100% !important;
  
  .cell {
    white-space: normal;
    line-height: 1.5;
  }
  
  th {
    background-color: #f5f7fa !important;
    color: #303133;
    font-weight: 600;
  }
  
  .el-table__row:hover {
    background-color: #ecf5ff;
  }
}

// 自定义滚动条样式
:deep(.el-scrollbar__bar) {
  opacity: 0.3;
  
  &:hover {
    opacity: 0.8;
  }
}

:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background-color: #c0c4cc;
  border-radius: 4px;
  
  &:hover {
    background-color: #909399;
  }
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background-color: #f5f7fa;
}

// 默认主题
.default-theme {
  :deep(.splitpanes__splitter) {
    position: relative;
    
    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      transition: opacity 0.4s;
      background-color: #409EFF;
      opacity: 0;
      z-index: 1;
    }
    
    &:hover:before {
      opacity: 0.3;
    }
  }
  
  :deep(.splitpanes__splitter--vertical:before) {
    left: 0;
    right: 0;
    height: 100%;
  }
  
  :deep(.splitpanes__splitter--horizontal:before) {
    top: 0;
    bottom: 0;
    width: 100%;
  }
}
</style>