<template>
  <div class="container">
    <div class="header">
      <div class="title-group">
        <div class="title">S17 - 6大创新矩阵</div>
        <div class="subtitle">评估产品的创新程度，寻找差异化突围方向</div>
      </div>
      <el-button @click="handleBack">返回</el-button>
    </div>

    <div class="content">
       <el-row :gutter="20">
        <el-col :span="14">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <span><i class="el-icon-magic-stick"></i> 创新维度雷达图</span>
              </div>
            </template>
            <div id="radarChart" style="width: 100%; height: 450px;"></div>
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card shadow="hover" class="score-card">
             <template #header>
              <div class="card-header">
                <span>创新综合评价</span>
              </div>
            </template>
             <div class="innovation-score">
                 <span class="number">{{ score }}</span>
                 <span class="unit">分</span>
             </div>
             <div class="innovation-tag">
                 <el-tag type="success" effect="dark">{{ grade }}</el-tag>
             </div>
             <div class="desc">
                 {{ reason }}
             </div>
          </el-card>
           <el-card shadow="hover" style="margin-top: 20px;">
             <template #header>
              <div class="card-header">
                <span>主要创新点</span>
              </div>
            </template>
            <div class="point-list" v-if="points.length > 0">
                <div class="point-item" v-for="(p, index) in points" :key="index">
                    <i class="el-icon-check" style="color: #67c23a"></i>
                    <span>{{ p.text }} ({{ p.category }})</span>
                </div>
            </div>
            <el-empty v-else description="未识别到显著创新点" :image-size="60" />
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
            <el-card shadow="hover">
                 <template #header>
              <div class="card-header">
                <span>创新方向详细建议</span>
              </div>
            </template>
            <el-collapse v-model="activeNames">
                <el-collapse-item title="1. 微创新 (Micro Innovation)" name="1">
                    <div class="suggestion-content">在现有产品基础上进行小的改进，如加厚、防滑、静音等。<b>当前匹配度：90%</b></div>
                </el-collapse-item>
                <el-collapse-item title="2. 组合创新 (Combination)" name="2">
                    <div class="suggestion-content">将两个现有功能组合，如"瑜伽垫+跳绳计数器"。<b>当前匹配度：40%</b></div>
                </el-collapse-item>
                <el-collapse-item title="3. 场景创新 (Scenario)" name="3">
                    <div class="suggestion-content">定义新的使用场景，如"办公室午休瑜伽垫"。<b>当前匹配度：60%</b></div>
                </el-collapse-item>
                 <el-collapse-item title="4. 视觉创新 (Visual)" name="4">
                    <div class="suggestion-content">采用独特的图案、形状或包装设计。<b>当前匹配度：85%</b></div>
                </el-collapse-item>
                 <el-collapse-item title="5. 模式创新 (Business Model)" name="5">
                    <div class="suggestion-content">改变售卖方式，如订阅制、租赁等。<b>当前匹配度：10%</b></div>
                </el-collapse-item>
                 <el-collapse-item title="6. 技术创新 (Technology)" name="6">
                    <div class="suggestion-content">使用全新材料或核心技术。<b>当前匹配度：20%</b></div>
                </el-collapse-item>
            </el-collapse>
            </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Strategy } from '@/lin/model/selection'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const activeNames = ref([])
const score = ref(0)
const grade = ref('待评估')
const reason = ref('')

const points = ref([])

const dimensions = ref([
  { name: '产品创新', max: 100, value: 0 },
  { name: '定价创新', max: 100, value: 0 },
  { name: '组合创新', max: 100, value: 0 },
  { name: '渠道创新', max: 100, value: 0 },
  { name: '营销创新', max: 100, value: 0 },
  { name: '供应创新', max: 100, value: 0 },
])

const loadData = async () => {
    const productId = route.query.productId
    if (!productId) return
    
    loading.value = true
    try {
        const res = await Strategy.execute('S17', productId)
        processResult(res)
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const processResult = (res) => {
    score.value = res.score
    grade.value = res.score >= 80 ? '高创新潜力' : (res.score >= 50 ? '微创新产品' : '常规产品')
    reason.value = res.reason

    if (res.suggestions) {
        points.value = res.suggestions.map(s => ({
            text: s.split(':')[1] || s,
            category: s.split(':')[0]
        }))

        // 更新雷达图维度
        dimensions.value.forEach(d => {
            const matched = res.suggestions.filter(s => s.startsWith(d.name)).length
            d.value = matched > 0 ? 80 + (matched * 5) : 30 // 简单的打分逻辑适配
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
      indicator: dimensions.value.map(d => ({ name: d.name, max: d.max })),
      radius: '65%'
    },
    series: [{
      name: '创新维度评估',
      type: 'radar',
      data: [{
        value: dimensions.value.map(d => d.value),
        name: '当前产品',
        areaStyle: { color: 'rgba(230, 162, 60, 0.2)' },
        lineStyle: { color: '#e6a23c' },
        itemStyle: { color: '#e6a23c' }
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
    padding: 20px 0;
}
.innovation-score {
    .number { font-size: 48px; font-weight: bold; color: #409eff; }
    .unit { font-size: 14px; color: #909399; margin-left: 5px; }
}
.innovation-tag {
    margin: 10px 0;
}
.desc {
    font-size: 14px;
    color: #606266;
    line-height: 1.6;
    text-align: left;
    padding: 0 20px;
}
.point-list {
    .point-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        i { margin-right: 10px; font-size: 16px; }
        span { font-size: 14px; color: #303133; }
    }
}
.suggestion-content {
    font-size: 14px;
    color: #606266;
}
</style>