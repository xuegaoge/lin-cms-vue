<template>
  <div class="container">
    <div class="header">
      <div class="title">S01: 四层评估体系 (MPSF)</div>
      <div class="actions">
        <el-button @click="handleBack">返回</el-button>
        <el-button type="primary" @click="handleExecute">运行评估</el-button>
      </div>
    </div>

    <!-- 顶层得分汇总 -->
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in summary" :key="item.label">
        <div class="summary-card" :class="item.class">
          <div class="label">{{ item.label }}</div>
          <div class="value">{{ item.value }}</div>
          <div class="desc">{{ item.desc }}</div>
        </div>
      </el-col>
    </el-row>

    <!-- 详细分析 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 左侧：MPSF 雷达图 -->
      <el-col :span="10">
        <div class="card chart-card">
          <div class="card-header">评估维度分布</div>
          <div ref="mpsfChart" style="height: 400px;"></div>
        </div>
      </el-col>
      
      <!-- 右侧：分层指标明细 -->
      <el-col :span="14">
        <div class="card detail-card">
          <div class="card-header">核心指标明细</div>
          <el-table :data="details" border style="width: 100%">
            <el-table-column prop="layer" label="维度" width="100">
               <template #default="scope">
                   <el-tag :type="getLayerType(scope.row.layer)">{{ scope.row.layer }}</el-tag>
               </template>
            </el-table-column>
            <el-table-column prop="metric" label="关键指标" width="180" />
            <el-table-column prop="value" label="实际值" width="120" />
            <el-table-column prop="score" label="评分" width="100">
                <template #default="scope">
                    <span :class="getScoreClass(scope.row.score)">{{ scope.row.score }}</span>
                </template>
            </el-table-column>
            <el-table-column prop="remark" label="诊断意见" />
          </el-table>
        </div>
      </el-col>
    </el-row>

    <!-- 警告与建议 -->
    <div class="card suggestion-card">
        <div class="card-header">综合决策建议</div>
        <el-result
            v-if="executed"
            icon="success"
            title="GO - 建议立项"
            sub-title="该产品在市场空间和毛利率方面表现极佳，虽供应链稳定性稍弱，但整体风险可控。"
        >
        </el-result>
        <div class="suggestion-list">
             <el-alert title="市场风险：头部品牌占比55%，接近红线，建议通过差异化设计切入长尾市场。" type="warning" show-icon :closable="false" />
             <el-alert title="财务机会：预期ROI可达35%，远超B级企业标准，资金利用效率高。" type="success" show-icon :closable="false" />
        </div>
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

const mpsfChart = ref(null)
let chartInstance = null
const executed = ref(false)
const resultData = ref(null)

const summary = ref([
    { label: '综合评分', value: '-', desc: '等待评估', class: 'primary' },
    { label: '决策建议', value: '-', desc: '等待评估', class: 'success' },
    { label: '核心优势', value: '-', desc: '-', class: 'warning' },
    { label: '首要风险', value: '-', desc: '-', class: 'danger' }
])

const details = ref([])

const getLayerType = (layer) => {
    if (layer.includes('市场') || layer.includes('Market')) return 'primary'
    if (layer.includes('产品') || layer.includes('Product')) return 'success'
    if (layer.includes('供应') || layer.includes('Supply')) return 'warning'
    return 'danger'
}

const getScoreClass = (score) => {
    if (score >= 90) return 'score-high'
    if (score >= 75) return 'score-mid'
    return 'score-low'
}

const initChart = (scores = [0, 0, 0, 0]) => {
    if (!mpsfChart.value) return
    if (chartInstance) {
        chartInstance.dispose()
    }
    chartInstance = echarts.init(mpsfChart.value)
    const option = {
        radar: {
            indicator: [
                { name: '市场层 (Market)', max: 100 },
                { name: '产品层 (Product)', max: 100 },
                { name: '供应层 (Supply)', max: 100 },
                { name: '财务层 (Finance)', max: 100 }
            ]
        },
        series: [{
            type: 'radar',
            data: [{
                value: scores,
                name: '得分分布',
                areaStyle: { color: 'rgba(64, 158, 255, 0.3)' }
            }]
        }]
    }
    chartInstance.setOption(option)
}

const handleExecute = async () => {
    const productId = route.query.productId
    if (!productId) return
    loading.value = true
    try {
        const res = await Strategy.execute('S01', productId)
        processResult(res)
        ElMessage.success('S01 策略评估完成')
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const processResult = (res) => {
    executed.value = true
    resultData.value = res
    
    // Summary
    summary.value[0].value = res.score
    summary.value[0].desc = '基于 MPSF 模型'
    summary.value[1].value = res.result
    
    // Parsing details from result.resultData (assuming JSON)
    let extraData = {}
    if (res.resultData && typeof res.resultData === 'string') {
        try { extraData = JSON.parse(res.resultData) } catch(e){}
    } else if (res.resultData) {
        extraData = res.resultData
    }

    // Chart scores
    const scores = [
        extraData.marketScore || 0,
        extraData.productScore || 0,
        extraData.supplyScore || 0,
        extraData.financeScore || 0
    ]
    initChart(scores)

    // Details table
    if (extraData.details) {
        details.value = extraData.details
    }
    
    if (extraData.advantage) {
         summary.value[2].value = extraData.advantage.title
         summary.value[2].desc = extraData.advantage.desc
    }
    if (extraData.risk) {
         summary.value[3].value = extraData.risk.title
         summary.value[3].desc = extraData.risk.desc
    }
}

const loadData = async () => {
    // Ideally get existing execution result
    // Strategy.getExecution('S01', productId) - if API supports
    // For now, auto-execute or just init chart
    const productId = route.query.productId
    // Maybe try to fetch last result? Or just wait for user to click execute?
    // Let's execute on load if route query says so, or just init chart
    initChart([0,0,0,0])
    if (productId && route.query.autoRun) {
        handleExecute()
    }
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

  .summary-card {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
      border-top: 4px solid #ddd;
      &.primary { border-top-color: #409eff; }
      &.success { border-top-color: #67c23a; }
      &.warning { border-top-color: #e6a23c; }
      &.danger { border-top-color: #f56c6c; }
      .label { font-size: 14px; color: #909399; margin-bottom: 10px; }
      .value { font-size: 28px; font-weight: bold; color: #303133; margin-bottom: 5px; }
      .desc { font-size: 12px; color: #909399; }
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

  .score-high { color: #67c23a; font-weight: bold; }
  .score-mid { color: #e6a23c; font-weight: bold; }
  .score-low { color: #f56c6c; font-weight: bold; }

  .suggestion-list {
      margin-top: 20px;
      .el-alert { margin-bottom: 10px; }
  }
}
</style>
