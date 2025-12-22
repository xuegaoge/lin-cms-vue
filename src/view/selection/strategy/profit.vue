<template>
  <div class="container">
    <div class="header">
      <div class="title">S03: 完整利润模型与财务评估</div>
      <div class="actions">
        <el-button @click="handleBack">返回</el-button>
        <el-button type="primary" @click="handleRecalculate">重新计算</el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：成本瀑布图 -->
      <el-col :span="12">
        <div class="card chart-card">
          <div class="card-header">成本结构拆解 (Waterfall)</div>
          <div ref="waterfallChart" style="height: 400px;"></div>
        </div>
      </el-col>
      
      <!-- 右侧：核心财务指标 -->
      <el-col :span="12">
        <div class="card finance-card">
          <div class="card-header">盈利能力指标</div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="预估售价">$ {{ finance.price }}</el-descriptions-item>
            <el-descriptions-item label="毛利率">
                <el-statistic :value="finance.margin" suffix="%" :value-style="{ color: '#67c23a' }" />
            </el-descriptions-item>
            <el-descriptions-item label="预估ROI">
                <el-statistic :value="finance.roi" suffix="%" :value-style="{ color: '#409eff' }" />
            </el-descriptions-item>
            <el-descriptions-item label="盈亏平衡销量">{{ finance.breakeven }} 件/月</el-descriptions-item>
            <el-descriptions-item label="静态回本周期">{{ finance.payback }} 个月</el-descriptions-item>
            <el-descriptions-item label="年化资金回报率">{{ finance.annualRoi }} %</el-descriptions-item>
          </el-descriptions>
          
          <div class="profit-summary">
              单件净利: <span class="profit-val">$ {{ finance.netProfit }}</span>
              <span class="tax-tip">(已扣除增值税及广告预留)</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 敏感性分析 -->
    <div class="card sensitivity-card">
        <div class="card-header">敏感性分析 (龙卷风图)</div>
        <p class="desc">分析各变量变动 10% 对最终利润的影响程度，帮助识别核心财务风险点。</p>
        <div ref="tornadoChart" style="height: 350px;"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { Strategy } from '@/lin/model/selection'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

const handleBack = () => {
  const productId = route.query.productId
  if (productId) {
    router.push({ path: `/selection/product/${productId}`, query: { tab: 'strategies' } })
  } else {
    router.back()
  }
}

const waterfallChart = ref(null)
const tornadoChart = ref(null)
let waterfallInstance = null
let tornadoInstance = null

const finance = reactive({
    price: 0,
    margin: 0,
    roi: 0,
    breakeven: 0,
    payback: 0,
    annualRoi: 0,
    netProfit: 0
})

const initWaterfall = (data) => {
    if (!waterfallChart.value) return
    if (waterfallInstance) waterfallInstance.dispose()
    waterfallInstance = echarts.init(waterfallChart.value)
    
    // Default data structure if missing
    const categories = data?.categories || ['售价', '采购', '运费', 'FBA', '佣金', '广告', '利润']
    const baseData = data?.baseData || [0, 31.49, 26.49, 19.49, 13.49, 8.5, 0]
    const amountData = data?.amountData || [39.99, 8.5, 5, 7, 6, 4.99, 8.5]

    const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'category', data: categories },
        yAxis: { type: 'value' },
        series: [
            {
                name: '辅助',
                type: 'bar',
                stack: 'Total',
                itemStyle: { borderColor: 'transparent', color: 'transparent' },
                data: baseData
            },
            {
                name: '金额',
                type: 'bar',
                stack: 'Total',
                label: { show: true, position: 'inside' },
                data: amountData
            }
        ]
    }
    waterfallInstance.setOption(option)
}

const initTornado = (data) => {
    if (!tornadoChart.value) return
    if (tornadoInstance) tornadoInstance.dispose()
    tornadoInstance = echarts.init(tornadoChart.value)
    
    // Default data
    const categories = data?.categories || ['售价变动', '成本变动', '运费变动', '广告CPC', '转化率']
    const posData = data?.posData || [12, -8, -5, -15, 20]
    const negData = data?.negData || [-15, 6, 4, 18, -25]

    const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value', position: 'top' },
        yAxis: { type: 'category', data: categories },
        series: [
            { name: '+10%', type: 'bar', stack: 'Total', label: { show: true }, data: posData },
            { name: '-10%', type: 'bar', stack: 'Total', label: { show: true }, data: negData }
        ]
    }
    tornadoInstance.setOption(option)
}

const handleRecalculate = async () => {
    const productId = route.query.productId
    if (!productId) return
    loading.value = true
    try {
        const res = await Strategy.execute('S03', productId)
        processResult(res)
        ElMessage.success('财务数据已根据最新汇率和运费模板更新')
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const processResult = (res) => {
    let data = {}
    if (res.resultData) {
        try {
            data = typeof res.resultData === 'string' ? JSON.parse(res.resultData) : res.resultData
        } catch (e) {}
    }
    
    if (data.finance) {
        Object.assign(finance, data.finance)
    }
    
    initWaterfall(data.waterfall)
    initTornado(data.tornado)
}

const loadData = async () => {
    // Try to auto-calc or load last result
    handleRecalculate()
}

onMounted(() => {
    loadData()
    window.addEventListener('resize', () => {
        waterfallInstance?.resize()
        tornadoInstance?.resize()
    })
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
      margin-bottom: 20px;
      border-left: 4px solid #409eff;
      padding-left: 10px;
    }
  }

  .finance-card {
      height: 440px;
      .profit-summary {
          margin-top: 30px;
          text-align: center;
          font-size: 20px;
          .profit-val { color: #f56c6c; font-weight: bold; font-size: 32px; }
          .tax-tip { font-size: 12px; color: #909399; margin-left: 10px; }
      }
  }

  .sensitivity-card {
      .desc { font-size: 13px; color: #909399; margin-bottom: 20px; }
  }
}
</style>
