<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <el-card style="height:  calc(100vh - 135px); margin: 0 auto; border:1px ;  border-radius: 20px">
          <div class="common-layout">
            <el-select
                v-model="value"
                clearable
                placeholder="请选择数据源"
                style="width: 240px"
                size="small"
                @change="getTableListById"
            >
              <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
              />
            </el-select>
            <br/>
            <span>当前库：{{ options.find(item => item.value === value)?.label }}</span>
            <splitpanes :push-other-panes="false" style="height: calc(91vh - 135px);">
              <pane size="15" class="splitpanes__pane-tree">
                <el-tree
                    :style="`width: ${getTableList.length > 0 ? 'auto' : '100%'};`"
                    :data="getTableList"
                    :props="defaultProps"
                    @node-click="handleNodeClick"
                />
              </pane>
              <pane>
                <splitpanes :push-other-panes="false" horizontal>
                  <pane size="45">
                    <z-monaco-editor ref="monacoEditRef" :style="{height: state.height + 'px'}"
                                     v-model:value="state.sql" v-model:lang="state.lang"
                                     :executeHandle="execute"/>
                  </pane>
                  <pane>
                    <div class="db-query-top-bar">
                      <el-button link type="primary" @click="execute">
                        <el-icon>
                          <ele-CaretRight/>
                        </el-icon>
                        执行
                      </el-button>
                    </div>
                    <div class="table-container">
                      <el-table
                          :data="tableData"
                          border
                          style="width: 100%"
                          height="100%"
                          :max-height="tableMaxHeight">
                        <el-table-column
                            v-for="header in tableHeaders"
                            :key="header"
                            :prop="header"
                            :label="header"
                            min-width="150"
                        >
                          <template #default="scope">
                            <expandable-cell
                                v-if="scope.row && scope.row[header] !== undefined"
                                :content="String(scope.row[header])"
                                :max-length="50"
                            />
                            <span v-else>-</span>
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>
                  </pane>
                </splitpanes>
              </pane>
            </splitpanes>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="QueryDb">
import {ElMessage} from 'element-plus'
import {executingSql, getDatabaseTableById, listDatasource} from '@/api/datasource/datasource';
import {Pane, Splitpanes} from 'splitpanes'
import {reactive, ref, toRefs} from 'vue';
import 'splitpanes/dist/splitpanes.css'
import ExpandableCell from './components/ExpandableCell.vue';

const loading = ref(true);
const options = ref([]);
const monacoEditRef = ref()
const value = ref('');
const tableData = ref([]);
const tableHeaders = ref([]);
const tableMaxHeight = ref('400px');
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10
  }
});
const {queryParams} = toRefs(data);

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
  if (node.parent) {
    parentInfo = node.parent.data.label;
  }

  // 更新 executeForm 中的值
  state.executeForm.datasource_id = datasourceId;
  state.executeForm.database = parentInfo;
  state.sql = `SELECT * FROM ${label};`
};
// 更新 getSqlData 函数
const getSqlData = (datasource_id, database, sql) => {
  loading.value = true;
  const params = {
    datasource_id,
    database,
    sql
  };
  executingSql(params).then(response => {
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
    } else {
      ElMessage.error("返回的数据格式不正确");
      tableHeaders.value = [];
      tableData.value = [];
    }
    // 在数据更新后，重新计算表格高度
    nextTick(() => {
      calculateTableHeight();
    });
  }).catch(error => {
    console.error("查询出错:", error);
    ElMessage.error("查询出错: " + error.message);
    tableHeaders.value = [];
    tableData.value = [];
  }).finally(() => {
    loading.value = false;
  });
};

// 计算表格高度的函数
const calculateTableHeight = () => {
  const containerHeight = document.querySelector('.table-container').clientHeight;
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

// 组合数据源、数据库、sql语句进行 sql 操作
const execute = () => {
  getSqlData(state.executeForm.datasource_id, state.executeForm.database, state.sql)
}
getList();
</script>

<style lang="scss" scoped>
.splitpanes {
  background: #FFFFFF;
}

.splitpanes__pane {
  display: flex;
}

// 树
.splitpanes__pane-tree {
  overflow: auto;
  align-items: baseline;
}

// 树
.splitpanes__pane-tree {
  overflow: auto;
  align-items: baseline;
}

.splitpanes--vertical > .splitpanes__splitter {
  min-width: 6px;
  background: linear-gradient(90deg, #ccc, #111);
}

.splitpanes--horizontal > .splitpanes__splitter {
  min-height: 6px;
  background: linear-gradient(0deg, #ccc, #111);
}

#codeEditBox {
  width: 100%;
  height: 500px;
}

//.db-query-top-bar {
//  flex: none;
//  display: flex;
//  border-bottom: 1px solid #dee2ea;
//  padding-bottom: 10px;
//}
.table-container {
  height: calc(100% - 40px); // 减去顶部按钮的高度
  overflow: hidden;
}

.el-table {
  // 确保表格填满容器
  height: 100% !important;

  .cell {
    white-space: normal;
    line-height: 1.5;
  }
}

// 自定义滚动条样式（可选）
.el-table__body-wrapper::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.el-table__body-wrapper::-webkit-scrollbar-thumb {
  background-color: #dcdfe6;
  border-radius: 4px;
}

.el-table__body-wrapper::-webkit-scrollbar-track {
  background-color: #f2f6fc;
}
</style>