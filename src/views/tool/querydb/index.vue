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
              <pane size="15">
                <el-tree
                    style="max-width: 600px"
                    :data="getTableList"
                    :props="defaultProps"
                    @node-click="handleNodeClick"
                />
              </pane>
              <pane>
                <splitpanes :push-other-panes="false" horizontal>
                  <pane size="45">
                    <span>2</span>
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

<script setup name="QueryDb">
import {getDatabaseTableById, listDatasource} from '@/api/datasource/datasource';
import {Pane, Splitpanes} from 'splitpanes'
import {reactive, ref, toRefs} from 'vue';
import 'splitpanes/dist/splitpanes.css'

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
    getTableList.value = result;
    loading.value = false;
  });
}

// 重构树结构
const handleNodeClick = (data) => {
  console.log(data)
}

// 获取表列表
const getTableList = ref([]);
const defaultProps = {
  children: 'children',
  label: 'label',
}

getList();
</script>

<style lang="scss" scoped>
.splitpanes {
  background: linear-gradient(-45deg, #EE7752, #E73C7E, #23A6D5, #23D5AB);
}

.splitpanes__pane {
  box-shadow: 0 0 5px rgba(0, 0, 0, .2) inset;
  justify-content: center;
  align-items: center;
  display: flex;
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