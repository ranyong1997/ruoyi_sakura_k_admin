<template>
  <div class="app-container">
    <el-form
        :model="queryParams"
        ref="queryRef"
        :inline="true"
        v-show="showSearch"
    >
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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"/>
    </el-row>
    <el-table
        v-loading="loading"
        :data="envList"
        @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column
          label="环境编号"
          width="center"
          align="center"
          prop="envId"
      />
      <el-table-column
          label="环境名称"
          width="center"
          align="center"
          prop="envName"
      />
      <el-table-column
          label="环境地址"
          align="center"
          prop="envUrl"
          :show-overflow-tooltip="true"
      />
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
          width="140"
          label="操作"
          align="center"
          class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['env:envInfo:edit']"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="复制" placement="top">
            <el-button
                link
                type="primary"
                icon="Connection"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['env:envInfo:edit']"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['env:envInfo:remove']"
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
          ref="editEnvRef"
          :formData="form"
          @saveOrUpdateOrDebug="handleSaveOrUpdateOrDebug"
      >
      </EditApi>
    </el-drawer>
  </div>
</template>

<script setup name="Api">
import {ref, getCurrentInstance, reactive, nextTick} from 'vue'
import {
  delEnv,
  getEnvById,
  listEnv,
} from "@/api/envinfo/envinfo";
import EditApi from "./components/EditApi.vue";
const {proxy} = getCurrentInstance();
const editEnvRef = ref(null);
const envList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const expression = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    envUrl: undefined,
    envName: undefined,
    envVariables: undefined,
    envHeaders: undefined,
    remark: undefined,
  },
  rules: {
    envName: [
      {required: true, message: "环境名称不能为空", trigger: "blur"},
      {
        max: 10,
        message: "环境名称不能超过10个字符",
        trigger: "blur",
      }
    ],
    envUrl: [
      {required: true, message: "环境地址不能为空", trigger: "blur"},
      {
        max: 512,
        message: "环境地址不能超过512个字符",
        trigger: "blur",
      }
    ]
  },
});

const {queryParams, form} = toRefs(data);

/** 查询接口列表 */
function getList() {
  loading.value = true;
  listEnv(queryParams.value).then((response) => {
    envList.value = response.rows;
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
    envId: undefined,
    envName: undefined,
    envUrl: undefined,
    envVariables: undefined,
    envHeaders: undefined,
    remark: undefined,
    createBy: undefined,
    createTime: undefined,
    updateBy: undefined,
    updateTime: undefined
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
  ids.value = selection.map((item) => item.envId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  form.value = {
    envId: undefined,
    envName: undefined,
    envUrl: undefined,
    envVariables: undefined,
    envHeaders: undefined,
    remark: undefined,
  };
  open.value = true;
  title.value = "添加环境";
  // 确保在下一个 tick 中重置编辑组件
  nextTick(() => {
    if (editEnvRef.value) {
      editEnvRef.value.setData(form.value);
    }
  });
}


/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const envId = row.envId || ids.value;
  getEnvById(envId).then((response) => {
    form.value = response.data;
    open.value = true;
    title.value = "修改接口";
    // 确保在下一个 tick 中设置数据
    nextTick(() => {
      if (editEnvRef.value) {
        editEnvRef.value.setData(form.value);
      }
    });
  });
}

// 处理子组件的保存/调试事件
const handleSaveOrUpdateOrDebug = async (type, formData) => {
  if (type === 'save') {
    try {
      getList();
    } catch (error) {
      proxy.$modal.msgError("操作失败：" + (error.message || '未知错误'));
    }
  }
};

/** 删除按钮操作 */
function handleDelete(row) {
  const envId = row.envId || ids.value;
  const envName = row.envName || ids.value;
  proxy.$modal
      .confirm('是否确认删除环境名称为"' + envName + '"的数据项?')
      .then(function () {
        return delEnv(envId);
      })
      .then(() => {
        getList();
        proxy.$modal.msgSuccess(envName + "删除成功");
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
      `env_${new Date().getTime()}.xlsx`
  );
}

getList();
</script>
