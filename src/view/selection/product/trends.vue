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
import { useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { Trends } from '@/lin/model/selection'

const route = useRoute()
const lineChart = ref(null)
let chartInstance = null

const signals = ref([])

const loadData = async () => {
    const productId = route.params.id
    if (!productId) return

    try {
        const res = await Trends.getTrends(productId, { days: 30 })
        // Assume res structure: { dates: [], sales: [], prices: [], ranks: [], signals: [] }
        if (res) {
            if (res.signals) signals.value = res.signals
            initChart(res)
        }
    } catch (e) {
        console.error('Failed to load trends', e)
        // Fallback or empty chart
        initChart(null)
    }
}

const initChart = (data) => {
    if (!lineChart.value) return
    chartInstance = echarts.init(lineChart.value)
    
    // Default or API data
    const dates = data?.dates || []
    const sales = data?.sales || []
    const prices = data?.prices || []
    const ranks = data?.ranks || []

    const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: ['日销量', '平均价格', 'BSR 排名 (逆序)'] },
        xAxis: { type: 'category', data: dates },
        yAxis: [
            { type: 'value', name: '销量/价格' },
            { type: 'value', name: 'BSR 排名', inverse: true }
        ],
        series: [
            { name: '日销量', type: 'line', data: sales, smooth: true },
            { name: '平均价格', type: 'line', data: prices, smooth: true },
            { name: 'BSR 排名 (逆序)', type: 'line', yAxisIndex: 1, data: ranks, smooth: true }
        ]
    }
    chartInstance.setOption(option)
}

onMounted(() => {
    loadData()
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
