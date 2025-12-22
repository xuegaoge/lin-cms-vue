<template>
  <div class="container">
    <div class="header">
      <div class="title-group">
        <div class="title">S09 - 蓝海深度识别</div>
        <div class="subtitle">深度挖掘市场空白点与机会区域</div>
      </div>
      <el-button @click="handleBack">返回</el-button>
    </div>

    <div class="content">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span><i class="el-icon-s-data"></i> 8大机会维度雷达图</span>
              </div>
            </template>
            <div id="radarChart" style="width: 100%; height: 400px;"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="score-card">
             <template #header>
              <div class="card-header">
                <span>蓝海综合指数</span>
              </div>
            </template>
            <div class="score-container">
               <el-progress type="circle" :percentage="blueOceanScore" :width="160" :stroke-width="12" color="#67c23a">
                 <template #default="{ percentage }">
                    <span class="percentage-value">{{ percentage }}</span>
                    <span class="percentage-label">潜力值</span>
                 </template>
               </el-progress>
            </div>
            <div class="score-summary">
               <div class="summary-item">
                 <span class="label">评级</span>
                 <span class="value" :style="{ color: getScoreColor(blueOceanScore) }">{{ grade }}</span>
               </div>
               <div class="summary-item">
                 <span class="label">识别结论</span>
                 <span class="value">{{ reason }}</span>
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
                <span>详细维度分析</span>
              </div>
            </template>
             <el-table :data="dimensions" style="width: 100%" border>
              <el-table-column prop="name" label="分析维度" width="180" />
              <el-table-column prop="score" label="得分" width="100">
                 <template #default="scope">
                    <el-progress :percentage="scope.row.score" :color="getScoreColor(scope.row.score)"></el-progress>
                 </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                   <el-tag :type="scope.row.score > 80 ? 'success' : (scope.row.score > 60 ? 'warning' : 'danger')">
                     {{ scope.row.score > 80 ? '蓝海' : (scope.row.score > 60 ? '普通' : '红海') }}
                   </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="analysis" label="深度分析" />
              <el-table-column prop="suggestion" label="切入建议" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Strategy } from '@/lin/model/selection'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const blueOceanScore = ref(0)
const grade = ref('-')
const reason = ref('')

const dimensions = ref([
  { name: '供需关系', score: 30, analysis: '等待评估', suggestion: '-' },
  { name: '价格空白', score: 30, analysis: '等待评估', suggestion: '-' },
  { name: '集中度', score: 30, analysis: '等待评估', suggestion: '-' },
  { name: '评分改进', score: 30, analysis: '等待评估', suggestion: '-' },
  { name: '高毛利空间', score: 30, analysis: '等待评估', suggestion: '-' },
  { name: '差异化潜力', score: 30, analysis: '等待评估', suggestion: '-' },
  { name: '稳定性', score: 30, analysis: '等待评估', suggestion: '-' },
  { name: '供应链优势', score: 30, analysis: '等待评估', suggestion: '-' },
])

const loadData = async () => {
    const productId = route.query.productId
    if (!productId) return
    
    loading.value = true
    try {
        const res = await Strategy.execute('S09', productId)
        processResult(res)
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const processResult = (res) => {
    blueOceanScore.value = res.score
    grade.value = res.grade
    reason.value = res.reason

    if (res.suggestions) {
        // 映射逻辑
        const opportunityMap = {
            '需求大+竞争小': 0, '高增长+新品少': 1, '低集中度': 2, '评分低+评论多': 3,
            '高毛利+低竞争': 4, '高差异化': 5, '全年需求': 6, '供应链优势': 7
        }

        res.suggestions.forEach(s => {
            const content = s.split(':')[1] || ''
            const name = content.split('=')[0] || ''
            const desc = content.split('=')[1] || s
            
            for (let key in opportunityMap) {
                if (s.includes(key)) {
                    const idx = opportunityMap[key]
                    dimensions.value[idx].score = 90
                    dimensions.value[idx].analysis = desc
                    dimensions.value[idx].suggestion = '建议以此为核心切入点'
                }
            }
        })
        
        initRadarChart()
    }
}

onMounted(() => {
    loadData()
})

const initRadarChart = () => {
  const chartDom = document.getElementById('radarChart')
  if (!chartDom) return
  const myChart = echarts.init(chartDom)
  const option = {
    tooltip: {},
    radar: {
      indicator: dimensions.value.map(d => ({ name: d.name, max: 100 })),
      radius: '65%'
    },
    series: [{
      name: '蓝海维度分析',
      type: 'radar',
      data: [{
        value: dimensions.value.map(d => d.score),
        name: '当前产品',
        areaStyle: { color: 'rgba(64, 158, 255, 0.2)' },
        lineStyle: { color: '#409eff' },
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
    if(score >= 80) return '#67c23a'
    if(score >= 60) return '#e6a23c'
    return '#f56c6c'
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
.score-container {
    display: flex;
    justify-content: center;
    padding: 20px 0;
}
.percentage-value {
    display: block;
    font-size: 32px;
    font-weight: bold;
    color: #303133;
}
.percentage-label {
    display: block;
    font-size: 14px;
    color: #909399;
    margin-top: 5px;
}
.score-summary {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
    .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 14px;
        .label { color: #606266; }
        .value { font-weight: bold; color: #303133; }
    }
}
</style>