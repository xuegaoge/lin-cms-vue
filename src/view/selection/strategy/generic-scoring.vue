<template>
  <div class="container" v-loading="loading">
    <div class="header">
      <div class="title-group">
        <div class="title">{{ strategyInfo.code }} - {{ strategyInfo.name }}</div>
        <div class="subtitle">{{ strategyInfo.desc }}</div>
      </div>
      <el-button @click="handleBack">返回</el-button>
    </div>

    <div class="content" v-if="strategyInfo.code">
      <el-row :gutter="20">
        <el-col :span="14">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <el-icon><DataAnalysis /></el-icon>
                <span> 维度评分分析</span>
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
                 <el-empty v-if="!strategyInfo.dimensions.length" description="暂无维度数据" :image-size="60"></el-empty>
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
    <el-empty v-else-if="!loading" description="未找到策略数据"></el-empty>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as echarts from 'echarts'
import { DataAnalysis } from '@element-plus/icons-vue'
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
        // 兼容 Lin-CMS 不同版本的 axios 拦截器
        const data = res.code !== undefined ? res.data : res
        processResult(data, code)
    } catch (e) {
        console.error('Failed to load strategy data:', e)
    } finally {
        loading.value = false
    }
}

const processResult = (res, code) => {
    if (!res) return

    // 基础映射
    strategyInfo.value.code = code
    strategyInfo.value.name = res.strategyName || res.StrategyName || code
    strategyInfo.value.score = res.score !== undefined ? res.score : (res.Score !== undefined ? res.Score : 0)
    strategyInfo.value.desc = res.reason || res.Reason || '' 
    
    let details = {
        summary: res.reason || res.Reason || res.decision || res.Decision || '',
        dimensions: [],
        suggestions: []
    }
    
    // 优先从直接属性获取 (PascalCase & camelCase)
    const subResults = res.subResults || res.SubResults
    if (subResults && Array.isArray(subResults)) {
        details.dimensions = subResults.map(s => ({
            name: s.name || s.Name,
            score: s.score !== undefined ? s.score : (s.Score !== undefined ? s.Score : 0)
        }))
    }

    const suggestions = res.suggestions || res.Suggestions
    if (suggestions && Array.isArray(suggestions)) {
        details.suggestions = suggestions.map(s => {
            if (typeof s === 'string') return { action: s, issue: '建议项', dimension: '综合' }
            return {
                issue: s.issue || s.Issue || '待优化项',
                action: s.recommendation || s.Recommendation || s.action || s.Action || '',
                dimension: s.dimension || s.Dimension || ''
            }
        })
    }

    // 如果维度为空，尝试解析 DetailJson
    if (details.dimensions.length === 0) {
        const detailJson = res.detailJson || res.DetailJson
        if (detailJson) {
            try {
                const parsed = typeof detailJson === 'string' ? JSON.parse(detailJson) : detailJson
                const pSub = parsed.subResults || parsed.SubResults || parsed.SubResults
                if (pSub && Array.isArray(pSub)) {
                    details.dimensions = pSub.map(s => ({
                        name: s.name || s.Name,
                        score: s.score !== undefined ? s.score : (s.Score !== undefined ? s.Score : 0)
                    }))
                }
                const pSug = parsed.suggestions || parsed.Suggestions
                if (!details.suggestions.length && pSug && Array.isArray(pSug)) {
                    details.suggestions = pSug.map(s => {
                        if (typeof s === 'string') return { action: s, issue: '优化项', dimension: '综合' }
                        return { 
                            issue: s.issue || s.Issue || '待优化项',
                            action: s.recommendation || s.Recommendation || s.action || s.Action || '',
                            dimension: s.dimension || s.Dimension || ''
                        }
                    })
                }
            } catch(e) { console.warn('DetailJson parse failed', e) }
        }
    }
    
    strategyInfo.value.summary = details.summary
    strategyInfo.value.dimensions = details.dimensions
    strategyInfo.value.suggestions = details.suggestions
    
    nextTick(() => {
        initChart()
    })
}

const initChart = () => {
    const chartDom = document.getElementById('dimensionChart')
    if(!chartDom) return
    
    let myChart = echarts.getInstanceByDom(chartDom)
    if (myChart) myChart.dispose()

    const indicators = strategyInfo.value.dimensions.map(d => ({ name: d.name, max: 100 }))
    const values = strategyInfo.value.dimensions.map(d => d.score)

    if (indicators.length === 0) return

    myChart = echarts.init(chartDom)
    const option = {
        tooltip: { trigger: 'item' },
        radar: {
            indicator: indicators,
            radius: '65%',
            axisName: { color: '#333' }
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

onMounted(() => {
    loadData()
})
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