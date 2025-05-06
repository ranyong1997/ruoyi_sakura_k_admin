<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="服务器名称" prop="sshName">
        <el-form @submit.prevent>
          <el-input
              v-model="queryParams.sshName"
              placeholder="请输入服务器名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleQuery"
          />
        </el-form>
      </el-form-item>
      <el-form-item label="服务器地址" prop="sshHost">
        <el-form @submit.prevent>
          <el-input
              v-model="queryParams.sshHost"
              placeholder="请输入服务器地址"
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
            v-hasPermi="['ssh:sshInfo:add']"
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
            v-hasPermi="['ssh:sshInfo:edit']"
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
            v-hasPermi="['ssh:sshInfo:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['ssh:sshInfo:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="sshList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="服务器编号" width="center" align="center" prop="sshId"/>
      <el-table-column label="服务器名称" align="center" prop="sshName" :show-overflow-tooltip="true"/>
      <el-table-column label="服务器地址" align="center" prop="sshHost" :show-overflow-tooltip="true"/>
      <el-table-column label="服务器用户名" align="center" prop="sshUsername" :show-overflow-tooltip="true"/>
      <el-table-column label="服务器端口" align="center" prop="sshPort"  :show-overflow-tooltip="true"/>
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
                       v-hasPermi="['ssh:sshInfo:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="复制" placement="top">
            <el-button link type="primary" icon="CopyDocument" @click="handleCopy(scope.row)"
                       v-hasPermi="['ssh:sshInfo:copy']"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                       v-hasPermi="['ssh:sshInfo:remove']"></el-button>
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

    <!-- 添加或修改服务器对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="sshRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="服务器名称" prop="sshName">
              <el-input v-model="form.sshName" placeholder="请输入服务器名称" maxlength="20" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="服务器地址" prop="sshHost">
              <el-input v-model="form.sshHost" placeholder="请输入服务器地址" maxlength="128" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="服务器用户名" prop="sshUsername">
              <el-input v-model="form.sshUsername" placeholder="请输入服务器用户名" maxlength="128" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="服务器密码" prop="sshPassword">
              <el-input v-model="form.sshPassword" placeholder="请输入服务器密码" maxlength="128" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="服务器端口" prop="sshPort">
              <el-input v-model="form.sshPort" placeholder="请输入服务器端口"  show-word-limit
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
          <el-button type="warning" @click="testSsh">测试连接</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="serverManage">
import {addSsh, delSsh, getSshById, listSsh, updateSsh, copySshById, testSshById} from "@/api/ssh/ssh";

const {proxy} = getCurrentInstance();
const sshList = ref([]);
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
    sshName: undefined,
    sshHost: undefined,
    sshUsername: undefined,
    sshPassword: undefined,
    sshPort: undefined
  },
  rules: {
    sshName: [{required: true, message: "服务器名称不能为空", trigger: "blur"}, {
      max: 20,
      message: "服务器名称不能超过20个字符",
      trigger: "blur"
    }],
    sshHost: [{required: true, message: "服务器地址不能为空", trigger: "blur"}, {
      max: 128,
      message: "服务器地址不能超过128个字符",
      trigger: "blur"
    }],
    sshPort: [{required: true, message: "服务器端口不能为空", trigger: "blur"}]
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询服务器列表 */
function getList() {
  loading.value = true;
  listSsh(queryParams.value).then(response => {
    sshList.value = response.rows;
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
    sshId: undefined,
    sshName: undefined,
    sshHost: undefined,
    sshUsername: undefined,
    sshPassword: undefined,
    sshPort: '22',
    remark: undefined
  };
  proxy.resetForm("sshRef");
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
  ids.value = selection.map(item => item.sshId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加服务器";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const sshId = row.sshId || ids.value;
  getSshById(sshId).then(response => {
    form.value = response.data;
    form.value.sshPassword = "******";
    open.value = true;
    title.value = "修改服务器";
  });
}
/** 复制按钮操作*/
function handleCopy(row) {
  reset();
  const sshId = row.sshId || ids.value;
  proxy.$modal.confirm('是否确认复制服务器"' + row.sshName + '"?').then(function () {
    loading.value = true;
    return copySshById(sshId);
  }).then(response => {
    loading.value = false;
    proxy.$modal.msgSuccess("复制成功");
    getList();
  }).catch(error => {
    loading.value = false;
    console.error("复制服务器失败", error);
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["sshRef"].validate(valid => {
    if (valid) {
      if (form.value.sshId !== undefined) {
        updateSsh(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSsh(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 测试连接按钮 */
const testSsh = () => {
  proxy.$refs["sshRef"].validate(valid => {
    if (valid) {
      if (form.value.sshId) {
        proxy.$modal.msgSuccess("正在测试连接...");
        testSshById(form.value.sshId).then(response => {
          if (response.data && response.data.is_success) {
            // 连接成功
            proxy.$modal.msgSuccess(response.data.message || "连接测试成功");
          } else {
            // 连接失败
            proxy.$modal.msgError(response.data.message || "连接测试失败");
          }
        }).catch(error => {
          proxy.$modal.msgError("测试连接请求失败：" + error.message);
        });
      } else {
        proxy.$modal.msgWarning("请先保存服务器配置再进行测试");
      }
    } else {
      proxy.$modal.msgWarning("请填写完整的服务器信息配置");
    }
  });
};

/** 删除按钮操作 */
function handleDelete(row) {
  const sshId = row.sshId || ids.value;
  const sshName = row.sshName || ids.value;
  proxy.$modal.confirm('是否确认删除服务器名称为"' + sshName + '"的数据项?').then(function () {
    return delSsh(sshId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess(sshName + "删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("/ssh/sshInfo/export", {
    ...queryParams.value,
  }, `服务器管理_${new Date().getTime()}.xlsx`);
}

getList();
</script>
