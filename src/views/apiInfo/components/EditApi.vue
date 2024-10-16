<template>
  <div class="app-container">
    <el-card>
      <template #header v-if="!isView">
        <z-detail-page-header
            class="page-header"
            style="margin: 5px 0;"
            @back="goBack"
        >
          <template #content>
            <span style="padding-right: 10px;">{{ route.query.editType === 'update' ? "更新" : "新增" }}</span>
          </template>
        </z-detail-page-header>
      </template>
      <div class="h100">
        <ApiInfo ref="ApiInfoRef"/>
        <el-collapse-transition>
          <div>
            <el-card>
              <template #header>
                <strong>Request</strong>
              </template>
              <div style="min-height: 500px">
                <el-tabs style="overflow-y: auto">
                  <el-tab-pane name='ApiRequestBody'>
                    <template #label>
                      <strong>请求体</strong>
                    </template>
                  </el-tab-pane>
                  <el-tab-pane name='ApiRequestHeaders'>
                    <template #label>
                      <strong>请求头</strong>
                    </template>
                    <div class="case-tabs">
                      <ApiRequestHeaders ref="ApiRequestHeadersRef"/>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane name='ApiVariables'>
                    <template #label>
                      <strong>变量</strong>
                    </template>
                    <div class="case-tabs">
                      <ApiVariables ref="ApiVariablesRef"/>
                    </div>
                  </el-tab-pane>
                  <el-tab-pane name='extracts' class="h100">
                    <template #label>
                      <strong>提取</strong>
                    </template>
                    <div class="case-tabs">
                      <ApiExtracts ref="ApiExtractsRef"/>
                    </div>
                  </el-tab-pane>

                  <el-tab-pane name='Code' class="h100">
                    <template #label>
                      <strong>Code</strong>
                    </template>
                    <ApiCode ref="ApiCodeRef"/>
                  </el-tab-pane>
                  <el-tab-pane name='Hook' class="h100">
                    <template #label>
                      <strong>Hook</strong>
                    </template>
                    <ApiHooks ref="ApiHookRef"/>
                  </el-tab-pane>
                  <el-tab-pane name='assertController' class="h100">
                    <template #label>
                      <strong>断言规则</strong>
                    </template>
                    <div class="case-tabs">
                      <ApiValidators ref="ApiValidatorsRef"/>
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-card>
          </div>
        </el-collapse-transition>
      </div>
    </el-card>
  </div>
</template>

<script setup name="EditApiInfo">
import {defineProps, nextTick, onActivated, onMounted, reactive, ref, watch} from 'vue'
import {useRoute, useRouter} from "vue-router"
import ApiInfo from './ApiInfo.vue'


// 定义父组件传过来的值
const props = defineProps({
  api_id: {
    type: [String, Number],
    default: () => {
      return null;
    },
  },
  isView: {
    type: Boolean,
    default: () => {
      return false;
    },
  },
});

const route = useRoute();
const router = useRouter();
const ApiInfoRef = ref()
const ApiRequestHeadersRef = ref()
const ApiVariablesRef = ref()
const ApiValidatorsRef = ref()
const ApiExtractsRef = ref()
const ApiCodeRef = ref()
const ApiHookRef = ref()

// 返回到列表
const goBack = () => {
  router.push({name: 'apiInfo'})
}
</script>

<style lang="scss" scoped>

// el-badge
:deep(.el-badge__content) {
  border-radius: 50%;
  width: 18px;
}

:deep(.el-badge__content.is-fixed) {
  top: 10px;
  right: calc(-7px + var(--el-badge-size) / 2);
}

</style>