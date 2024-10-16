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
                    <!-- <span> -->
                      <!-- <el-button type="primary"
                                 @click="getSqlData(1,'skf','SELECT * FROM sys_role_menu;')"> 查询
                      </el-button> -->
                      <!-- <div id="codeEditBox"></div> -->
                    <!-- </span> -->
                     <z-monaco-editor ref="monacoEditRef" :style="{height: state.height + 'px'}" :dbs="state.dbs" v-model:value="state.sql" v-model:lang="state.lang" :executeHandle="execute" ></z-monaco-editor>
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
const text = ref('fuck')
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
        automaticLayout: true, // 自动布局
        overviewRulerBorder: false, // 不要滚动条的边框
        foldingStrategy: 'indentation', // 代码可分小段折叠
        tabSize: 0, // tab 缩进长度
        autoClosingBrackets: 'always', // 是否自动添加结束括号(包括中括号) "always" | "languageDefined" | "beforeWhitespace" | "never"
        // autoClosingDelete: 'always', // 是否自动删除结束括号(包括中括号) "always" | "never" | "auto"
        // autoClosingQuotes: 'always', // 是否自动添加结束的单引号 双引号 "always" | "languageDefined" | "beforeWhitespace" | "never"
        autoIndent: 'None', // 控制编辑器在用户键入、粘贴、移动或缩进行时是否应自动调整缩进
        autoClosingBrackets: true ,
        comments: {
            ignoreEmptyLines: true, // 插入行注释时忽略空行。默认为真。
            insertSpace: true // 在行注释标记之后和块注释标记内插入一个空格。默认为真。
        }, // 注释配置
        cursorBlinking: 'Solid', // 光标动画样式
        cursorSmoothCaretAnimation: true, // 是否启用光标平滑插入动画  当你在快速输入文字的时候 光标是直接平滑的移动还是直接"闪现"到当前文字所处位置
        cursorSurroundingLines: 0, // 光标环绕行数 当文字输入超过屏幕时 可以看见右侧滚动条中光标所处位置是在滚动条中间还是顶部还是底部 即光标环绕行数 环绕行数越大 光标在滚动条中位置越居中
        cursorSurroundingLinesStyle: 'all', // "default" | "all" 光标环绕样式
        cursorWidth: 2, // <=25 光标宽度
        diagnostics: true,
        minimap: { // 关闭代码缩略图
          enabled: false // 是否启用预览图
        },
        overviewRulerBorder: false, // 是否应围绕概览标尺绘制边框
        wordWrap:'on', // 文本自动换行
        folding: true, // 是否启用代码折叠
        scrollBeyondLastLine: false, // 设置编辑器是否可以滚动到最后一行之后
        renderLineHighlight: 'all', // 当前行突出显示方式  "all" | "line" | "none" | "gutter"
        theme: 'vs',// 官方自带三种主题vs, hc-black, or vs-dark
        formatOnPaste: true, //是否粘贴自动格式化
        renderValidationDecorations: "on",
        hover: {
          enabled: true,
          delay: 500,
        },
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


const monacoEditRef = ref()
const state = reactive({
  lang: 'sql',
  height: 300,
  // db
  dbs: [],
  //execute
  sql: 'select  * from ',
  executeForm: {
    sql: '',
    source_id: "",
    database: "",
  }
});

const execute = () => {
  console.log('execute');
  
}
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
</style>