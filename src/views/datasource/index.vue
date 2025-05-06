<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="数据源名称" prop="datasourceName">
        <el-input
            v-model="queryParams.datasourceName"
            placeholder="请输入数据源名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['commonConfig:dataSource:add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['commonConfig:dataSource:edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['commonConfig:dataSource:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['commonConfig:dataSource:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="datasourceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="数据源编号" width="center" align="center" prop="datasourceId"/>
      <el-table-column label="数据源名称" width="center" align="center" prop="datasourceName"/>
      <el-table-column label="数据源端口" width="center" align="center" prop="datasourcePort"/>
      <el-table-column label="数据源类型" width="center" align="center" prop="datasourceType"/>
      <el-table-column label="数据源用户名" width="center" align="center" prop="datasourceUser"/>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true"/>
      <el-table-column label="更新时间" width="180" align="center" prop="updateTime"
                       :formatter="(row) => parseTime(row.updateTime)"
                       :show-overflow-tooltip="true"/>
      <el-table-column label="更新人" width="center" align="center" prop="updateBy" :show-overflow-tooltip="true"/>
      <el-table-column label="创建时间" width="180" align="center" prop="createTime"
                       :formatter="(row) => parseTime(row.createTime)" :show-overflow-tooltip="true"/>
      <el-table-column label="创建人" width="center" align="center" prop="createBy" :show-overflow-tooltip="true"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                       v-hasPermi="['commonConfig:dataSource:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                       v-hasPermi="['commonConfig:dataSource:remove']"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改数据源对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="DataSourceRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="数据源名称" prop="datasourceName">
              <el-input v-model="form.datasourceName" placeholder="请输入数据源名称" @input="handleFormChange"
                        maxlength="20" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="数据源类型" prop="datasourceType">
              <el-select
                  v-model="form.datasourceType"
                  clearable
                  filterable
                  placeholder="请选择数据源类型"
                  @change="handleFormChange"
              >
                <el-option
                    v-for="item in select_bot"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="数据源地址" prop="datasourceHost">
              <el-input v-model="form.datasourceHost" placeholder="请输入数据源地址" @input="handleFormChange"
                        maxlength="255" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="数据源端口" prop="datasourcePort">
              <el-input v-model="form.datasourcePort" placeholder="请输入数据源端口" @input="handleFormChange"
                        maxlength="10" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="数据源用户名" prop="datasourceUser">
              <el-input v-model="form.datasourceUser" placeholder="请输入数据源用户名" @input="handleFormChange"
                        maxlength="64" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="数据源密码" prop="datasourcePwd" v-if="form.datasourceId==null" :rules="[
          {
            required: true,
            message: '数据源密码不能为空',
            trigger: 'blur',
          },
          {
            max: 255,
            message: '数据源密码不能超过255个字符',
            trigger: 'blur',
          }
        ]">
              <el-input v-model="form.datasourcePwd" placeholder="请输入数据源密码" @input="handleFormChange"
                        maxlength="255" show-word-limit
                        clearable/>
            </el-form-item>
            <el-form-item label="数据源密码" prop="datasourcePwd" v-else>
              <el-input v-model="form.datasourcePwd" placeholder="请输入数据源密码" maxlength="255" show-word-limit
                        clearable @change="changepwd" @input="handleFormChange"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注" maxlength="100" show-word-limit
                        type="textarea" @input="handleFormChange"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="warning" @click="testDataSource">测试连接</el-button>
          <el-button type="primary" @click="submitForm" :disabled="!isFormChanged">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="DataSource">
import {
  addDatasource,
  delDatasource,
  getDatasourceById,
  listDatasource,
  testDatasourceById,
  updateDatasource
} from "@/api/datasource/datasource";

const {proxy} = getCurrentInstance();
const datasourceList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const changePwd = ref(false)
const select_bot = [
  {
    value: 'mysql',
    label: 'Mysql',
  }
]
const isAdd = ref(false); // 是否是新增操作
const originalForm = ref({}); // 原始表单数据
const isFormChanged = ref(false); // 表单是否有变化
const expression = ref("");


const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    datasourceName: undefined,
    datasourceHost: undefined,
    datasourcePort: undefined,
    datasourceUser: undefined,
    datasourcePwd: undefined,
    datasourceType: undefined,
    remark: undefined
  },
  rules: {
    datasourceName: [{required: true, message: "数据源名称不能为空", trigger: "blur"}, {
      max: 20,
      message: "数据源名称不能超过20个字符",
      trigger: "blur"
    }],
    datasourceHost: [{required: true, message: "数据源地址不能为空", trigger: "blur"}, {
      max: 255,
      message: "数据源地址口不能超过255个字符",
      trigger: "blur"
    }],
    datasourcePort: [{required: true, message: "数据源端口不能为空", trigger: "blur"}, {
      max: 10,
      message: "数据源端口不能超过10个字符",
      trigger: "blur"
    }],
    datasourceUser: [{required: true, message: "数据源用户名不能为空", trigger: "blur"}, {
      max: 64,
      message: "数据源用户名不能超过64个字符",
      trigger: "blur"
    }],
    datasourcePwd: [{required: true, message: "数据源密码不能为空", trigger: "blur"}, {
      max: 255,
      message: "数据源密码不能超过255个字符",
      trigger: "blur"
    }],
    datasourceType: [{required: true, message: "请选择数据源类型", trigger: "blur"}]
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询数据源列表 */
function getList() {
  loading.value = true;
  listDatasource(queryParams.value).then(response => {
    datasourceList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 如果修改密码 */
function changepwd() {
  changePwd.value = true;
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    datasourceId: undefined,
    datasourceName: undefined,
    datasourceHost: undefined,
    datasourcePort: undefined,
    datasourceUser: undefined,
    datasourcePwd: undefined,
    datasourceType: undefined,
    remark: undefined
  };
  proxy.resetForm("DataSourceRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.datasourceId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加数据源";
  isAdd.value = true; // 标记为新增操作
  // 保存初始状态
  originalForm.value = JSON.parse(JSON.stringify(form.value));

  // 对于新增操作，我们初始化 isFormChanged 为 false
  isFormChanged.value = false;
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  isAdd.value = false; // 标记为编辑操作
  const datasourceId = row.datasourceId || ids.value;
  getDatasourceById(datasourceId).then(response => {
    form.value = response.data;
    form.value.datasourcePwd = "******";
    // 保存原始表单数据的深拷贝
    originalForm.value = JSON.parse(JSON.stringify(form.value));
    isFormChanged.value = false; // 重置修改状态
    changePwd.value = false;
    open.value = true;
    title.value = "修改数据源";
  });
}

// 添加表单输入事件处理函数，可以绑定到每个表单项的@input或@change事件
function handleFormChange() {
  if (isAdd.value) {
    // 对于新增操作，只要表单有值就允许提交
    isFormChanged.value = hasFormValues();
  } else {
    // 对于编辑操作，比较表单是否有变化
    checkFormChanged();
  }
}

// 检查表单是否有非空值
function hasFormValues() {
  // 检查核心字段是否有值
  return !!form.value.datasourceName ||
      !!form.value.datasourceHost ||
      !!form.value.datasourcePort ||
      !!form.value.datasourceUser ||
      !!form.value.datasourcePwd;
}

// 检查表单是否有变化
function checkFormChanged() {
  if (originalForm.value && Object.keys(originalForm.value).length) {
    isFormChanged.value = !isObjectsEqual(form.value, originalForm.value);
  }
}

// 辅助函数：比较两个对象是否相等
function isObjectsEqual(obj1, obj2) {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}


/** 提交按钮 */
function submitForm() {
  checkFormChanged();
  if (!isFormChanged.value) {
    // 如果表单没有变化，可以直接返回或者提示用户
    return;
  }
  proxy.$refs["DataSourceRef"].validate(valid => {
    if (valid) {
      let formdata = {...form.value};
      if (form.value.datasourceId != undefined) {
        if (!changePwd.value) {
          delete formdata.datasourcePwd
        }
        updateDatasource(formdata).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addDatasource(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}


/** 删除按钮操作 */
function handleDelete(row) {
  const datasourceId = row.datasourceId || ids.value;
  const datasourceName = row.datasourceName || ids.value;
  proxy.$modal.confirm('是否确认删除数据源名称为"' + datasourceName + '"的数据项?').then(function () {
    return delDatasource(datasourceId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess(datasourceName + "删除成功");
  }).catch(() => {
  });
}

/** 测试连接按钮 */
const testDataSource = () => {
  proxy.$refs["DataSourceRef"].validate(valid => {
    if (valid) {
      if (form.value.datasourceId) {
        testDatasourceById(form.value.datasourceId)
            .then(response => {
              const {status, message} = response.data;
              if (status === 'success') {
                proxy.$modal.msgSuccess(message);
              } else {
                proxy.$modal.msgError(message);
              }
            })
            .catch(error => {
              let errorMessage = "发生未知错误";
              if (error.response) {
                // 服务器响应了，但状态码不在 2xx 范围内
                errorMessage = `服务器错误 (${error.response.status}): ${error.response.data.message || '未知错误'}`;
              } else if (error.request) {
                // 请求已经发出，但没有收到响应
                errorMessage = "无法连接到服务器，请检查网络连接";
              } else {
                // 在设置请求时发生了一些错误
                errorMessage = error.message;
              }
              proxy.$modal.msgError(errorMessage);
            });
      } else {
        proxy.$modal.msgWarning("请先保存数据源配置再进行测试");
      }
    } else {
      proxy.$modal.msgWarning("请填写完整的数据源信息");
    }
  });
};

/** 导出按钮操作 */
function handleExport() {
  proxy.download("", {
    ...queryParams.value,
  }, `datasource_${new Date().getTime()}.xlsx`);
}

getList();
</script>
