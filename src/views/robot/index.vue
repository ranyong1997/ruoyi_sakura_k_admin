<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="机器人名称" prop="robotName">
        <el-input
            v-model="queryParams.robotName"
            placeholder="请输入机器人名称"
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
            v-hasPermi="['notify:robots:add']"
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
            v-hasPermi="['notify:robots:edit']"
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
            v-hasPermi="['notify:robots:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['notify:robots:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="robotList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="机器人编号" width="center" align="center" prop="robotId"/>
      <el-table-column label="名称" width="center" align="center" prop="robotName"/>
      <el-table-column label="WebHook" align="center" prop="robotWebhook" :show-overflow-tooltip="true"/>
      <el-table-column label="类型" align="center" prop="robotType" :show-overflow-tooltip="true"/>
      <el-table-column label="状态" align="center" prop="robotStatus" :show-overflow-tooltip="true">
        <template #default="scope">
          <dict-tag :options="sys_normal_disable" :value="scope.row.robotStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="通知模板" align="center" prop="robotTemplate" :show-overflow-tooltip="true"/>
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
                       v-hasPermi="['notify:robots:edit']"></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                       v-hasPermi="['notify:robots:remove']"></el-button>
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
      <el-form ref="RobotRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="机器人名称" prop="robotName">
              <el-input v-model="form.robotName" placeholder="请输入机器人名称" maxlength="10" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="WebHook" prop="robotWebhook">
              <el-input v-model="form.robotWebhook" placeholder="请输入WebHook" maxlength="255" show-word-limit
                        clearable/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="机器人类型" prop="robotType">
              <el-select
                  v-model="form.robotType"
                  clearable
                  placeholder="请选择机器人类型"
              >
                <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="机器人状态" prop="robotStatus">
              <el-switch
                  v-model="form.robotStatus"
                  inline-prompt
                  active-text="启用"
                  inactive-text="停用"
                  active-value=0
                  inactive-value=1
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="通知模板" prop="robotTemplate">
              <el-input v-model="form.robotTemplate" placeholder="通知模板" :autosize="{ minRows: 10, maxRows: 15 }"
                        maxlength="255" show-word-limit
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
          <el-button type="warning" @click="testRobot">测试连接</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Robot">
import {addRobot, delRobot, getRobotById, listRobot, testRobotById, updateRobot} from "@/api/robot/robot";

const {proxy} = getCurrentInstance();
const {sys_normal_disable} = proxy.useDict("sys_normal_disable");
const robotList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const openView = ref(false);
const options = [
  {
    value: 'Wx_bot',
    label: '企业微信机器人',
  }
]
const expression = ref("");


const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    robotName: undefined,
    robotWebhook: undefined,
    robotType: undefined,
    robotStatus: undefined,
    robotTemplate: undefined,
    remark: undefined
  },
  rules: {
    robotName: [{required: true, message: "机器人名称不能为空", trigger: "blur"}, {
      max: 10,
      message: "机器人名称不能超过10个字符",
      trigger: "blur"
    }],
    robotWebhook: [{required: true, message: "WebHook不能为空", trigger: "blur"}, {
      max: 255,
      message: "WebHook不能超过255个字符",
      trigger: "blur"
    }],
    robotType: [{required: true, message: "请选择机器人类型", trigger: "blur"}]
  }
});

const {queryParams, form, rules} = toRefs(data);

/** 查询机器人列表 */
function getList() {
  loading.value = true;
  listRobot(queryParams.value).then(response => {
    robotList.value = response.rows;
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
    robotId: undefined,
    robotName: undefined,
    robotType: undefined,
    robotTemplate: undefined,
    robotWebhook: undefined,
    remark: undefined
  };
  proxy.resetForm("robotRef");
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
  ids.value = selection.map(item => item.robotId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 机器人详细信息 */
function handleView(row) {
  getRobotById(row.robotId).then(response => {
    form.value = response.data;
    openView.value = true;
  });
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加机器人";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const robotId = row.robotId || ids.value;
  getRobotById(robotId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改机器人";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["RobotRef"].validate(valid => {
    if (valid) {
      if (form.value.robotId != undefined) {
        updateRobot(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addRobot(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 测试连接按钮 */
const testRobot = () => {
  testRobotById(form.value.robotId).then(response => {
    proxy.$modal.msgSuccess("测试成功");
  });
};


/** 删除按钮操作 */
function handleDelete(row) {
  const robotId = row.robotId || ids.value;
  const robotName = row.robotName || ids.value;
  proxy.$modal.confirm('是否确认删除机器人名称为"' + robotName + '"的数据项?').then(function () {
    return delRobot(robotId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess(robotName + "删除成功");
  }).catch(() => {
  });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download("", {
    ...queryParams.value,
  }, `robot_${new Date().getTime()}.xlsx`);
}

getList();
</script>
