<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="项目名称" prop="projectName">
        <el-input
            v-model="queryParams.projectName"
            placeholder="请输入项目名称"
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
            v-hasPermi="['auto:project:add']"
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
            v-hasPermi="['auto:project:edit']"
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
            v-hasPermi="['auto:project:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['auto:project:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="projectList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="项目编号" width="center" align="center" prop="projectId"/>
      <el-table-column label="项目名称" align="center" prop="projectName" :show-overflow-tooltip="true"/>
      <el-table-column label="负责人" align="center" prop="responsibleName" :show-overflow-tooltip="true"/>
      <el-table-column label="开发人员" align="center" prop="devUser" :show-overflow-tooltip="true"/>
      <el-table-column label="测试人员" align="center" prop="testUser" :show-overflow-tooltip="true"/>
      <el-table-column label="发布应用" align="center" prop="publishApp" :show-overflow-tooltip="true"/>
      <el-table-column label="简要描述" align="center" prop="simpleDesc" :show-overflow-tooltip="true"/>
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
                       v-hasPermi="['auto:project:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                       v-hasPermi="['auto:project:remove']"></el-button>
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

    <!-- 添加或修改项目对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="projectRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="项目名称" prop="projectName">
              <el-input v-model="form.projectName" placeholder="请输入项目名称" maxlength="10" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="负责人" prop="responsibleName">
              <el-input v-model="form.responsibleName" placeholder="请输入负责人姓名" maxlength="10" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="开发人员" prop="devUser">
              <el-input v-model="form.devUser" placeholder="请输入开发人员姓名" maxlength="10" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="测试人员" prop="testUser">
              <el-input v-model="form.testUser" placeholder="请输入测试人员姓名" maxlength="10" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="发布应用" prop="publishApp">
              <el-input v-model="form.publishApp" placeholder="请输入发布应用名称" maxlength="10" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="简要描述" prop="simpleDesc">
              <el-input v-model="form.simpleDesc" placeholder="请输入简要描述" maxlength="100" show-word-limit
                        type="textarea"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" placeholder="请输入备注" maxlength="100" show-word-limit
                        type="textarea"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Project">
import {addProject, delProject, getProjectById, listProject, updateProject} from "@/api/project/project";

const {proxy} = getCurrentInstance();
const projectList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const openView = ref(false);
const expression = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    projectName: undefined,
    responsibleName: undefined,
    testUser: undefined,
    devUser: undefined,
    publishApp: undefined
  },
  rules: {
    projectName: [{required: true, message: "项目名称不能为空", trigger: "blur"}, {
      max: 10,
      message: "项目名称不能超过10个字符",
      trigger: "blur"
    }],
    responsibleName: [{required: true, message: "负责人不能为空", trigger: "blur"}, {
      max: 10,
      message: "负责人名称不能超过10个字符",
      trigger: "blur"
    }],
    testUser: [{required: true, message: "测试人员不能为空", trigger: "blur"}, {
      max: 10,
      message: "测试人员名称不能超过10个字符",
      trigger: "blur"
    }],
    devUser: [{required: true, message: "开发人员不能为空", trigger: "blur"}, {
      max: 10,
      message: "开发人员名称不能超过10个字符",
      trigger: "blur"
    }],
    publishApp: [{required: true, message: "发布应用不能为空", trigger: "blur"}, {
      max: 10,
      message: "发布应用名称不能超过10个字符",
      trigger: "blur"
    }]
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询项目列表 */
function getList() {
  loading.value = true;
  listProject(queryParams.value).then(response => {
    projectList.value = response.rows;
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
    projectName: undefined,
    responsibleName: undefined,
    testUser: undefined,
    devUser: undefined,
    publishApp: undefined,
    simpleDesc: undefined,
    remark: undefined
  };
  proxy.resetForm("projectRef");
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

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const projectId = row.projectId || ids.value;
  getProjectById(projectId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改项目";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["projectRef"].validate(valid => {
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
  const projectId = row.projectId || ids.value;
  const projectName = row.projectName || ids.value;
  proxy.$modal.confirm('是否确认删除项目名称为"' + projectName + '"的数据项?').then(function () {
    return delProject(projectId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess(projectName + "删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("monitor/job/export", {
    ...queryParams.value,
  }, `project_${new Date().getTime()}.xlsx`);
}

getList();
</script>
