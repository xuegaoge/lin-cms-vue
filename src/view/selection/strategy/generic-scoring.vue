<template>
  <div class="container">
    <div class="header">
      <div class="title-group">
        <div class="title">{{ strategyInfo.code }} - {{ strategyInfo.name }}</div>
        <div class="subtitle">{{ strategyInfo.desc }}</div>
      </div>
      <el-button @click="handleBack">返回</el-button>
    </div>

    <div class="content">
      <el-row :gutter="20">
        <el-col :span="14">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span><i class="el-icon-data-analysis"></i> 维度评分分析</span>
              </div>
            </template>
            <div id="dimensionChart" style="width: 100%; height: 400px;"></div>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card shadow="hover" class="score-card">
             <template #header>
              <div class="card-header">
                <span>综合得分</span>
              </div>
            </template>
             <div class="total-score" :style="{ color: getScoreColor(strategyInfo.score) }">
                 <span class="number">{{ strategyInfo.score }}</span>
                 <span class="unit">分</span>
             </div>
             <div class="score-level">
                 <el-tag :type="getScoreType(strategyInfo.score)" effect="dark" size="large">
                     等级: {{ getScoreLevel(strategyInfo.score) }}
                 </el-tag>
             </div>
             <div class="desc">
                 {{ strategyInfo.summary }}
             </div>
          </el-card>

          <el-card shadow="hover" style="margin-top: 20px;">
             <template #header>
              <div class="card-header">
                <span>关键指标概览</span>
              </div>
            </template>
             <div class="key-metrics">
                 <div v-for="(item, index) in strategyInfo.dimensions" :key="index" class="metric-row">
                     <span class="label">{{ item.name }}</span>
                     <el-progress :percentage="item.score" :color="getScoreColor(item.score)" :format="() => item.score"></el-progress>
                 </div>
             </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
           <el-card shadow="hover">
             <template #header>
              <div class="card-header">
                <span>详细改进建议</span>
              </div>
            </template>
            <el-table :data="strategyInfo.suggestions" style="width: 100%" stripe>
              <el-table-column type="index" label="序号" width="80" />
              <el-table-column prop="dimension" label="关联维度" width="180" />
              <el-table-column prop="issue" label="发现问题" width="300" />
              <el-table-column prop="action" label="建议行动" />
            </el-table>
           </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { Strategy } from '@/lin/model/selection'

const router = useRouter()
const route = useRoute()

const strategyInfo = ref({
    code: '',
    name: '',
    desc: '',
    score: 0,
    summary: '',
    dimensions: [],
    suggestions: []
})

const loading = ref(false)

const loadData = async () => {
    const code = route.query.code || 'S05'
    const productId = route.query.productId
    if (!productId) return

    loading.value = true
    try {
        const res = await Strategy.execute(code, productId)
        processResult(res, code)
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const processResult = (res, code) => {
    // Basic mapping
    strategyInfo.value.code = code
    strategyInfo.value.name = res.name || code
    strategyInfo.value.score = res.score || 0
    strategyInfo.value.desc = res.desc || '' // Backend might not return desc, fallback?
    
    // Parse resultData for detailed info
    let details = {}
    if (res.resultData) {
        try {
            details = typeof res.resultData === 'string' ? JSON.parse(res.resultData) : res.resultData
        } catch(e) {}
    }
    
    strategyInfo.value.summary = details.summary || res.result || ''
    strategyInfo.value.dimensions = details.dimensions || []
    strategyInfo.value.suggestions = details.suggestions || []
    
    initChart()
}

onMounted(() => {
    loadData()
})

const initChart = () => {
    const chartDom = document.getElementById('dimensionChart')
    if(!chartDom || !echarts) return // echarts might be undefined if not imported? imported above.
    
    // Dispose if exists
    let myChart = echarts.getInstanceByDom(chartDom)
    if (myChart) myChart.dispose()

    myChart = echarts.init(chartDom)
    
    const indicators = strategyInfo.value.dimensions.map(d => ({ name: d.name, max: 100 }))
    const values = strategyInfo.value.dimensions.map(d => d.score)

    if (indicators.length === 0) return

    const option = {
        tooltip: {},
        radar: {
            indicator: indicators,
            radius: '65%'
        },
        series: [{
            name: '维度评分',
            type: 'radar',
            data: [{
                value: values,
                name: strategyInfo.value.name,
                areaStyle: { color: 'rgba(64, 158, 255, 0.2)' },
                itemStyle: { color: '#409eff' }
            }]
        }]
    }
    myChart.setOption(option)
    
    // Resize listener could be added
}

const handleBack = () => {
  const productId = route.query.productId
  if (productId) {
    router.push({ path: `/selection/product/${productId}`, query: { tab: 'strategies' } })
  } else {
    router.back()
  }
}

const getScoreColor = (score) => {
    if (score >= 80) return '#67c23a'
    if (score >= 60) return '#e6a23c'
    return '#f56c6c'
}

const getScoreType = (score) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'danger'
}

const getScoreLevel = (score) => {
    if (score >= 90) return 'S (极佳)'
    if (score >= 80) return 'A (优秀)'
    if (score >= 70) return 'B (良好)'
    if (score >= 60) return 'C (及格)'
    return 'D (淘汰)'
}
</script>

<style scoped lang="scss">
.container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #fff;
  padding: 15px 20px;
  border-radius: 4px;
}
.title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}
.subtitle {
  font-size: 13px;
  color: #909399;
  margin-top: 5px;
}
.score-card {
    text-align: center;
    padding: 10px 0;
}
.total-score {
    .number { font-size: 56px; font-weight: bold; }
    .unit { font-size: 16px; margin-left: 5px; }
}
.score-level { margin: 10px 0; }
.desc {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    text-align: left;
    padding: 15px 20px 0;
    border-top: 1px solid #ebeef5;
    margin-top: 15px;
}
.metric-row {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    .label {
        width: 100px;
        font-size: 14px;
        color: #606266;
        text-align: right;
        margin-right: 15px;
    }
    .el-progress {
        flex: 1;
    }
}
</style>