<template>
  <div class="container">
    <div class="header">
      <div class="title">产品市场与销售趋势分析</div>
      <div class="product-tag"><el-tag>瑜伽垫 Pro (B08XXXXXXX)</el-tag></div>
    </div>

    <el-row :gutter="20">
      <el-col :span="24">
        <div class="card chart-card">
          <div class="card-header">核心指标趋势 (30天)</div>
          <div ref="lineChart" style="height: 450px;"></div>
        </div>
      </el-col>
    </el-row>

    <div class="card alert-card">
        <div class="card-header">异常波动信号</div>
        <el-table :data="signals" style="width: 100%">
            <el-table-column prop="date" label="日期" width="150" />
            <el-table-column prop="metric" label="指标" width="150" />
            <el-table-column prop="change" label="变化" width="150">
                <template #default="scope">
                    <span :style="{ color: scope.row.change.includes('+') ? '#f56c6c' : '#67c23a' }">{{ scope.row.change }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="desc" label="信号说明" />
        </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const lineChart = ref(null)
let chartInstance = null

const signals = [
    { date: '2025-12-15', metric: 'BSR 排名', change: '+150%', desc: '排名突降，疑似竞品开启大额促销。' },
    { date: '2025-12-18', metric: '搜索量', change: '-20%', desc: '类目大盘流量整体回落。' }
]

const initChart = () => {
    if (!lineChart.value) return
    chartInstance = echarts.init(lineChart.value)
    const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['日销量', '平均价格', 'BSR 排名 (逆序)'] },
        xAxis: { type: 'category', data: ['12-01', '12-05', '12-10', '12-15', '12-20', '12-22'] },
        yAxis: [
            { type: 'value', name: '销量/价格' },
            { type: 'value', name: 'BSR 排名', inverse: true }
        ],
        series: [
            { name: '日销量', type: 'line', data: [120, 135, 125, 150, 145, 160], smooth: true },
            { name: '平均价格', type: 'line', data: [39.99, 39.99, 38.5, 38.5, 39.99, 39.99], smooth: true },
            { name: 'BSR 排名 (逆序)', type: 'line', yAxisIndex: 1, data: [1200, 1100, 1150, 980, 1050, 950], smooth: true }
        ]
    }
    chartInstance.setOption(option)
}

onMounted(() => {
    initChart()
    window.addEventListener('resize', () => chartInstance?.resize())
})
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    background: #fff;
    padding: 15px 20px;
    border-radius: 4px;
    .title { font-size: 18px; font-weight: bold; }
  }
  .card {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
    .card-header {
      font-weight: bold;
      margin-bottom: 15px;
      border-left: 4px solid #409eff;
      padding-left: 10px;
    }
  }
}
</style>
