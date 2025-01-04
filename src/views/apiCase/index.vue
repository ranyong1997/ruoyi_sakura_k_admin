<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="用例名称" prop="testcaseName">
        <el-form @submit.prevent>
          <el-input
              v-model="queryParams.testcaseName"
              placeholder="请输入用例名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleQuery"
          />
        </el-form>
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
            v-hasPermi="['testcase:testcaseInfo:add']"
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
            v-hasPermi="['testcase:testcaseInfo:edit']"
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
            v-hasPermi="['testcase:testcaseInfo:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['testcase:testcaseInfo:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="testcaseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="用例编号" width="center" align="center" prop="testcaseId"/>
      <el-table-column label="用例名称" align="center" prop="testcaseName" :show-overflow-tooltip="true"/>
      <el-table-column label="所属项目" align="center" prop="projectName" :show-overflow-tooltip="true"/>
      <el-table-column label="用例列表" align="center" prop="testcaseList" :show-overflow-tooltip="true"/>
      <el-table-column label="描述" align="center" prop="remark" :show-overflow-tooltip="true"/>
      <el-table-column label="更新时间" width="180" align="center" prop="updateTime"
                       :formatter="(row) => parseTime(row.updateTime)"
                       :show-overflow-tooltip="true"/>
      <el-table-column label="更新人" width="center" align="center" prop="updateBy" :show-overflow-tooltip="true"/>
      <el-table-column label="创建时间" width="180" align="center" prop="createTime"
                       :formatter="(row) => parseTime(row.createTime)" :show-overflow-tooltip="true"/>
      <el-table-column label="创建人" width="center" align="center" prop="createBy" :show-overflow-tooltip="true"/>
      <el-table-column
          label="最后执行状态"
          width="120"
          align="center"
          prop="xxx"
          :show-overflow-tooltip="true"
      />
      <el-table-column
          label="最后执行时间"
          width="180"
          align="center"
          prop="xxx"
          :show-overflow-tooltip="true"
      />
      <!--操作栏-->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="运行" placement="top">
            <el-button link type="success" icon="Promotion" @click="handleRun(scope.row)"
                       v-hasPermi="['testcase:testcaseInfo:batch']">运行
            </el-button>
          </el-tooltip>
          <el-dialog
              v-model="envDialogVisible"
              title="选择环境"
              width="30%"
          >
            <el-form>
              <el-form-item label="环境">
                <el-select v-model="selectedEnvId" placeholder="请选择环境">
                  <el-option
                      v-for="env in envList"
                      :key="env.envId"
                      :label="env.envName"
                      :value="env.envId"
                  />
                </el-select>
              </el-form-item>
            </el-form>
            <template #footer>
              <span class="dialog-footer">
                <el-button @click="envDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleEnvConfirm()">
                  确认
                </el-button>
              </span>
            </template>
          </el-dialog>
          <el-tooltip content="编辑" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                       v-hasPermi="['testcase:testcaseInfo:edit']">编辑
            </el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                       v-hasPermi="['testcase:testcaseInfo:remove']">删除
            </el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!--分页-->
    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />
  </div>
</template>

<script setup name="ApiCase">
import {ref, getCurrentInstance, reactive} from 'vue'

import {addProject, getProjectById, updateProject} from "@/api/project/project";
import {
  addApiCase,
  delApiCase,
  getApiCaseById,
  listApiCase,
  updateApiCase,
  TestCase_Batch
} from "@/api/apiCase/apiCase";
import {listEnv} from "@/api/envinfo/envinfo";

const {proxy} = getCurrentInstance();
const testcaseList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const envDialogVisible = ref(false)
const envList = ref([])
const selectedEnvId = ref('')


const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    testcaseName: undefined,
    projectId: undefined,
    testcaseId: undefined,
    testcaseList: undefined,
    remark: undefined
  },
  rules: {
    testcaseName: [{required: true, message: "用例名称不能为空", trigger: "blur"}, {
      max: 50,
      message: "用例名称不能超过50个字符",
      trigger: "blur"
    }]
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询测试用例列表 */
function getList() {
  loading.value = true;
  listApiCase(queryParams.value).then(response => {
    testcaseList.value = response.rows.map(row => {
      return Object.assign({}, ...row);
    });
    console.log(testcaseList.value)
    total.value = response.total;
    loading.value = false;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    projectId: undefined,
    testcaseName: undefined,
    responsibleName: undefined,
    testUser: undefined,
    devUser: undefined,
    publishApp: undefined,
    simpleDesc: undefined,
    remark: undefined,
  };
  proxy.resetForm("testcaseRef");
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
  ids.value = selection.map(item => item.projectId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加项目";
}

/** 运行按钮操作 */
async function handleRun(row) {
  try {
    reset();
    // 获取环境列表
    const envResponse = await listEnv({pageNum: 1, pageSize: 1000});
    envList.value = envResponse.rows;
    console.log("---->", envList);
    envDialogVisible.value = true;
  } catch (error) {
    // row.msgError('获取环境列表失败：' + error.message);
    console.log('获取环境列表失败：' + error.message)
  }
}

/** 环境选择确认操作 */
async function handleEnvConfirm() {
  const testcaseId = testcaseList.value[0].testcaseId;
  await TestCase_Batch(selectedEnvId.value, testcaseId);
  // 关闭弹窗
  envDialogVisible.value = false;
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const testcaseId = row.testcaseId || ids.value;
  getApiCaseById(testcaseId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改项目";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["testcaseRef"].validate(valid => {
    if (valid) {
      if (form.value.projectId != undefined) {
        updateProject(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProject(form.value).then(response => {
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
  const testcaseId = row.testcaseId || ids.value;
  const testcaseName = row.testcaseName || ids.value;
  proxy.$modal.confirm('是否确认删除用例名称为"' + testcaseName + '"的数据项?').then(function () {
    return delApiCase(testcaseId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess(testcaseName + "删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("monitor/job/export", {
    ...queryParams.value,
  }, `apicase_${new Date().getTime()}.xlsx`);
}

getList();
</script>
