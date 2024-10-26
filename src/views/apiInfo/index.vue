<template>
  <div class="app-container">
    <el-form
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        v-show="showSearch"
    >
      <el-form-item label="用例名称" prop="apiName">
        <el-input
            v-model="queryParams.apiName"
            placeholder="请输入用例名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="apiStatus">
        <el-select
            v-model="queryParams.apiStatus"
            placeholder="状态"
            clearable
            style="width: 240px"
            @keyup.enter="handleQuery"
        >
          <el-option
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
        >搜索
        </el-button
        >
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
            v-hasPermi="['apitest:apiInfo:add']"
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
            v-hasPermi="['apitest:apiInfo:edit']"
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
            v-hasPermi="['apitest:apiInfo:remove']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['apitest:apiInfo:export']"
        >导出
        </el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"/>
    </el-row>

    <el-table
        v-loading="loading"
        :data="apiList"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column
          label="用例编号"
          width="center"
          align="center"
          prop="apiId"
      />
      <el-table-column
          label="用例名称"
          width="center"
          align="center"
          prop="apiName"
      />
      <el-table-column
          label="所属项目"
          align="center"
          prop="project.projectName"
          :show-overflow-tooltip="true"
      />
      <el-table-column
          label="请求方法"
          align="center"
          prop="apiMethod"
          :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <el-tag :type="getTagMethod(scope.row.apiMethod)">
            {{ scope.row.apiMethod }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
          label="请求地址"
          align="center"
          prop="apiUrl"
          :show-overflow-tooltip="true"
      />
      <el-table-column
          label="优先级"
          align="center"
          prop="apiLevel"
          :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <el-tag :type="getTagLevel(scope.row.apiLevel)">
            {{ scope.row.apiLevel }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
          label="状态"
          align="center"
          prop="apiStatus"
          :show-overflow-tooltip="true"
      >
        <template #default="scope">
          <dict-tag
              :options="sys_normal_disable"
              :value="scope.row.apiStatus"
          />
        </template>
      </el-table-column>
      <el-table-column
          label="创建人"
          width="center"
          align="center"
          prop="createBy"
          :show-overflow-tooltip="true"
      />
      <el-table-column
          label="创建时间"
          width="180"
          align="center"
          prop="createTime"
          :formatter="(row) => parseTime(row.createTime)"
          :show-overflow-tooltip="true"
      />
      <el-table-column
          label="更新时间"
          width="180"
          align="center"
          prop="updateTime"
          :formatter="(row) => parseTime(row.updateTime)"
          :show-overflow-tooltip="true"
      />
      <el-table-column
          label="更新人"
          width="center"
          align="center"
          prop="updateBy"
          :show-overflow-tooltip="true"
      />
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
      <el-table-column
          width="140"
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-tooltip content="运行" placement="top">
            <el-button
                link
                type="primary"
                icon="Position"
                @click="handleDebug(scope.row)"
                v-hasPermi="['apitest:apiInfo:debug']"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="修改" placement="top">
            <el-button
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['apitest:apiInfo:edit']"
            ></el-button>
          </el-tooltip>
          <!--          <el-tooltip content="复制" placement="top">-->
          <!--            <el-button-->
          <!--                link-->
          <!--                type="primary"-->
          <!--                icon="Connection"-->
          <!--                @click="handleUpdate(scope.row)"-->
          <!--                v-hasPermi="['apitest:apiInfo:edit']"-->
          <!--            ></el-button>-->
          <!--          </el-tooltip>-->
          <el-tooltip content="删除" placement="top">
            <el-button
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['apitest:apiInfo:remove']"
            ></el-button>
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
    <!-- 添加或修改接口对话框 -->
    <el-drawer v-model="open" size="80%" :title="title" direction="rtl">
      <EditApi
          ref="editApiRef"
          :formData="form"
          @saveOrUpdateOrDebug="handleSaveOrUpdateOrDebug"
      >
      </EditApi>
    </el-drawer>
  </div>
</template>

<script setup name="Api">
import {ref, getCurrentInstance, reactive, computed, nextTick} from 'vue'
import {
  delApi,
  getApiById,
  listApi,
  testApiById,
} from "@/api/apiInfo/apiInfo";
import EditApi from "./components/EditApi.vue";
const {proxy} = getCurrentInstance();
const editApiRef = ref(null);
const {sys_normal_disable} = proxy.useDict("sys_normal_disable");
const apiList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const expression = ref("");

const getTagMethod = computed(() => (method) => {
  switch (method.toUpperCase()) {
    case "GET":
      return "primary";
    case "POST":
      return "success";
    case "DELETE":
      return "danger";
    case "PUT":
      return "warning";
    case "PATCH":
      return "info";
    default:
      return "";
  }
});

const getTagLevel = computed(() => (level) => {
  switch (level.toUpperCase()) {
    case "P0":
      return "primary";
    case "P1":
      return "success";
    case "DELETE":
      return "danger";
    case "P2":
      return "warning";
    case "P3":
      return "info";
  }
});

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    apiName: undefined,
    projectId: undefined,
    apiMethod: undefined,
    apiUrl: undefined,
    apiStatus: undefined,
    apiLevel: undefined,
    apiTags: undefined,
    requestDataType: undefined,
    requestData: undefined,
    requestHeaders: undefined,
    remark: undefined,
  },
  rules: {
    apiName: [
      {required: true, message: "接口名称不能为空", trigger: "blur"},
      {
        max: 10,
        message: "接口名称不能超过10个字符",
        trigger: "blur",
      },
    ],
    api_url: [
      {required: true, message: "接口url不能为空", trigger: "blur"},
      {
        max: 512,
        message: "接口url不能超过512个字符",
        trigger: "blur",
      },
    ],
    api_method: [
      {required: true, message: "接口方法不能为空", trigger: "blur"},
      {
        max: 10,
        message: "接口方法不能超过10个字符",
        trigger: "blur",
      },
    ],
    api_level: [
      {required: true, message: "接口优先级不能为空", trigger: "blur"},
      {
        max: 2,
        message: "接口优先级不能超过2个字符",
        trigger: "blur",
      },
    ],
    api_status: [
      {required: true, message: "接口状态不能为空", trigger: "blur"},
      {
        max: 1,
        message: "接口状态不能超过1个字符",
        trigger: "blur",
      },
    ],
    apiLevel: [
      {required: true, message: "请选择机接口优先级", trigger: "blur"},
    ],
  },
});

const {queryParams, form} = toRefs(data);

/** 查询接口列表 */
function getList() {
  loading.value = true;
  listApi(queryParams.value).then((response) => {
    apiList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

const props = defineProps({
  formData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['saveOrUpdateOrDebug'])

/** 表单重置 */
function reset() {
  form.value = {
    apiId: undefined,
    apiName: undefined,
    projectId: undefined,
    apiMethod: undefined,
    apiUrl: undefined,
    apiStatus: undefined,
    apiLevel: undefined,
    apiTags: undefined,
    requestDataType: undefined,
    requestData: undefined,
    requestHeaders: undefined,
    remark: undefined,
    createBy: undefined,
    createTime: undefined,
    updateBy: undefined,
    updateTime: undefined
  };
  proxy.resetForm("ApiRef");
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
  ids.value = selection.map((item) => item.apiId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  form.value = {
    apiId: undefined,
    apiName: undefined,
    projectId: undefined,
    apiMethod: undefined,
    apiUrl: undefined,
    apiStatus: undefined,
    apiLevel: undefined,
    apiTags: undefined,
    requestDataType: undefined,
    requestData: undefined,
    requestHeaders: undefined,
    remark: undefined,
  };
  open.value = true;
  title.value = "添加接口";
  // 确保在下一个 tick 中重置编辑组件
  nextTick(() => {
    if (editApiRef.value) {
      editApiRef.value.setData(form.value);
    }
  });
}

/** 运行按钮操作 */
function handleDebug(row) {
  reset();
  const apiId = row.apiId || ids.value;
  getApiById(apiId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "待开发";
  });
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const apiId = row.apiId || ids.value;
  getApiById(apiId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改接口";
    // 确保在下一个 tick 中设置数据
    nextTick(() => {
      if (editApiRef.value) {
        editApiRef.value.setData(form.value);
      }
    });
  });
}

// 处理子组件的保存/调试事件
const handleSaveOrUpdateOrDebug = async (type, formData) => {
  if (type === 'save') {
    try {
      // 获取当前表单数据
      const currentFormData = formData || form.value;
      // 检查是否存在 apiId
      if (currentFormData.apiId) {
        // 如果有 apiId，调用更新接口
        // await updateApi(currentFormData);
        // proxy.$modal.msgSuccess("修改成功");
        open.value = false; // 关闭抽屉
      } else {
        // 如果没有 apiId，调用新增接口
        // await addApi(currentFormData);
        // proxy.$modal.msgSuccess("新增成功");
      }
      getList();
    } catch (error) {
      console.error('Save/Update Error:', error);
      proxy.$modal.msgError("操作失败：" + (error.message || '未知错误'));
    }
  } else if (type === 'debug') {
    try {
      const currentFormData = formData || form.value;
      if (currentFormData.apiId) {
        await testApiById(currentFormData.apiId);
        proxy.$modal.msgSuccess("执行成功");
      } else {
        proxy.$modal.msgWarning("请先保存接口再进行测试");
      }
    } catch (error) {
      console.error('Debug Error:', error);
      proxy.$modal.msgError("测试失败：" + (error.message || '未知错误'));
    }
  }
};

/** 删除按钮操作 */
function handleDelete(row) {
  const apiId = row.apiId || ids.value;
  const apiName = row.apiName || ids.value;
  proxy.$modal
      .confirm('是否确认删除接口名称为"' + apiName + '"的数据项?')
      .then(function () {
        return delApi(apiId);
      })
      .then(() => {
        getList();
        proxy.$modal.msgSuccess(apiName + "删除成功");
      })
      .catch(() => {
      });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download(
      "",
      {
        ...queryParams.value,
      },
      `api_${new Date().getTime()}.xlsx`
  );
}

getList();
</script>
