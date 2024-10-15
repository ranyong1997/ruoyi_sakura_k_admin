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
              <!-- <el-scrollbar height="800px"> -->
              <pane size="15" class="splitpanes__pane-tree">
                <el-tree
                    :style="`width: ${getTableList.length > 0 ? 'auto' : '100%'};`"
                    :data="getTableList"
                    :props="defaultProps"
                    @node-click="handleNodeClick"
                />
              </pane>
              <!-- </el-scrollbar> -->
              <pane>
                <splitpanes :push-other-panes="false" horizontal>
                  <pane size="45">
                    <span>
                      <el-button type="primary"
                                 @click="getSqlData(1,'skf','SELECT * FROM sys_role_menu;')">
                        查询
                      </el-button>
                    </span>
                  </pane>
                  <pane>
                    <span>3</span>
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

<script setup name="QueryDb" lang="ts">
import {ElMessage} from 'element-plus'
import {executingSql, getDatabaseTableById, listDatasource} from '@/api/datasource/datasource';
import {Pane, Splitpanes} from 'splitpanes'
import {nextTick, onBeforeUnmount, reactive, ref, toRefs} from 'vue';
import 'splitpanes/dist/splitpanes.css'
import * as monaco from 'monaco-editor';

const loading = ref(true);
const options = ref([]);
const value = ref('');
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10
  }
});
const {queryParams} = toRefs(data);
const text = ref('')
onBeforeUnmount(() => {
  editor.dispose()
})


let editor: monaco.editor.IStandaloneCodeEditor;

const editorInit = () => {
  nextTick(() => {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false
    });
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2016,
      allowNonTsExtensions: true
    });

    !editor ? editor = monaco.editor.create(document.getElementById('codeEditBox') as HTMLElement, {
          value: text.value, // 编辑器初始显示文字
          language: 'mysql', // 语言支持自行查阅demo
          automaticLayout: true, // 自适应布局
          theme: 'vs-dark', // 官方自带三种主题vs, hc-black, or vs-dark
          foldingStrategy: 'indentation',
          renderLineHighlight: 'all', // 行亮
          selectOnLineNumbers: true, // 显示行号
          minimap: {
            enabled: false,
          },
          readOnly: false, // 只读
          fontSize: 16, // 字体大小
          scrollBeyondLastLine: false, // 取消代码后面一大段空白
          overviewRulerBorder: false, // 不要滚动条的边框
        }) :
        editor.setValue("");
    // 监听值的变化
    editor.onDidChangeModelContent((val: any) => {
      text.value = editor.getValue();

    })
  })
}

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

// 节点点击事件
const handleNodeClick = (data, node) => {
  console.log(data, node, "----");
  if (!data) {
    console.error("节点数据为空");
    return;
  }
  // 获取当前选中的数据源ID
  const datasourceId = value.value;
  console.log("datasourceId----", datasourceId)
  if (!datasourceId) {
    console.error("未选择数据源");
    return;
  }

  // 获取点击的节点标签（表名或列名）
  const label = data.label;
  console.log("label----", label)

  if (!label) {
    console.error("节点标签为空");
    return;
  }
  // 构造SQL查询语句


};
// 根据表名执行 sql 查询
const getSqlData = (datasource_id, database, sql) => {
  loading.value = true;
  const params = {
    datasource_id,
    database,
    sql
  };
  executingSql(params).then(response => {
    loading.value = false;
    console.log(response);
  }).catch(error => {
    loading.value = false;
    console.error("查询出错:", error);
  });
};

editorInit();
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

.splitpanes--vertical > .splitpanes__splitter {
  min-width: 6px;
  background: linear-gradient(90deg, #ccc, #111);
}

.splitpanes--horizontal > .splitpanes__splitter {
  min-height: 6px;
  background: linear-gradient(0deg, #ccc, #111);
}
</style>