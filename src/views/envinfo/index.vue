<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="环境名称" prop="envName">
        <el-input
            v-model="queryParams.envName"
            placeholder="请输入环境名称"
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
            v-hasPermi="['env:envInfo:add']"
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
            v-hasPermi="['env:envInfo:edit']"
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
            v-hasPermi="['env:envInfo:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['env:envInfo:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="envList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="环境编号" width="center" align="center" prop="envId"/>
      <el-table-column label="环境名称" width="center" align="center" prop="envName"/>
      <el-table-column label="环境地址" align="center" prop="envUrl" :show-overflow-tooltip="true"/>
      <el-table-column label="创建人" align="center" prop="createBy" :show-overflow-tooltip="true"/>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true"/>
      <el-table-column label="更新人" width="center" align="center" prop="updateBy" :show-overflow-tooltip="true"/>
      <el-table-column label="更新时间" width="180" align="center" prop="updateTime"
                       :formatter="(row) => parseTime(row.updateTime)"
                       :show-overflow-tooltip="true"/>
      <el-table-column label="创建人" width="center" align="center" prop="createBy" :show-overflow-tooltip="true"/>
      <el-table-column label="创建时间" width="180" align="center" prop="createTime"
                       :formatter="(row) => parseTime(row.createTime)" :show-overflow-tooltip="true"/>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                       v-hasPermi="['env:envInfo:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                       v-hasPermi="['env:envInfo:remove']"></el-button>
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
    <!-- 添加或修改环境对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="EnvRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="环境名称" prop="envName">
              <el-input v-model="form.envName" placeholder="请输入环境名称" maxlength="10" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="环境地址" prop="envUrl">
              <el-input v-model="form.envUrl" placeholder="请输入环境地址" maxlength="255" show-word-limit
                        clearable/>
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

<script setup name="Env">
import {addEnv, delEnv, getEnvById, listEnv, updateEnv} from "@/api/envinfo/envinfo";

const {proxy} = getCurrentInstance();
const envList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");


const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    envName: undefined,
    envUrl: undefined,
    remark: undefined
  },
  rules: {
    envName: [{required: true, message: "环境名称不能为空", trigger: "blur"}, {
      max: 10,
      message: "环境名称不能超过10个字符",
      trigger: "blur"
    }],
    envUrl: [{required: true, message: "环境地址不能为空", trigger: "blur"}, {
      max: 512,
      message: "环境地址不能超过512个字符",
      trigger: "blur"
    }]
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询环境列表 */
function getList() {
  loading.value = true;
  listEnv(queryParams.value).then(response => {
    envList.value = response.rows;
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
    envId: undefined,
    envName: undefined,
    envUrl: undefined,
    remark: undefined
  };
  proxy.resetForm("EnvRef");
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
  ids.value = selection.map(item => item.envId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加环境";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const envId = row.envId || ids.value;
  getEnvById(envId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改环境";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["EnvRef"].validate(valid => {
    if (valid) {
      if (form.value.envId != undefined) {
        updateEnv(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addEnv(form.value).then(response => {
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
  const envId = row.envId || ids.value;
  const envName = row.envName || ids.value;
  proxy.$modal.confirm('是否确认删除环境名称为"' + envName + '"的数据项?').then(function () {
    return delEnv(envId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess(envName + "删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("", {
    ...queryParams.value,
  }, `环境管理_${new Date().getTime()}.xlsx`);
}

getList();
</script>
