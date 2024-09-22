<template>
  <div class="app-container">
    <el-row>
      <el-col :span="24" class="card-box">
        <el-card style="height:  calc(100vh - 135px); margin: 0 auto; border:1px ;  border-radius: 20px">
          <el-select
              v-model="value"
              clearable
              placeholder="请选择数据源"
              style="width: 240px"
              size="small"
          >
            <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
          <br/>
          <span>当前库：</span>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Cache">
import {getCache} from '@/api/monitor/cache';
import * as echarts from 'echarts';

const cache = ref([]);
const commandstats = ref(null);
const usedmemory = ref(null);
const {proxy} = getCurrentInstance();

function getList() {
  proxy.$modal.loading("正在加载缓存监控数据，请稍候！");
  getCache().then(response => {
    proxy.$modal.closeLoading();
    cache.value = response.data;

    const commandstatsIntance = echarts.init(commandstats.value, "macarons");
    commandstatsIntance.setOption({
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      series: [
        {
          name: "命令",
          type: "pie",
          roseType: "radius",
          radius: [15, 95],
          center: ["50%", "38%"],
          data: response.data.commandStats,
          animationEasing: "cubicInOut",
          animationDuration: 1000
        }
      ]
    });
    const usedmemoryInstance = echarts.init(usedmemory.value, "macarons");
    usedmemoryInstance.setOption({
      tooltip: {
        formatter: "{b} <br/>{a} : " + cache.value.info.used_memory_human
      },
      series: [
        {
          name: "峰值",
          type: "gauge",
          min: 0,
          max: 1000,
          detail: {
            formatter: cache.value.info.used_memory_human
          },
          data: [
            {
              value: parseFloat(cache.value.info.used_memory_human),
              name: "内存消耗"
            }
          ]
        }
      ]
    })
    window.addEventListener("resize", () => {
      commandstatsIntance.resize();
      usedmemoryInstance.resize();
    });
  })
}

getList();
</script>
