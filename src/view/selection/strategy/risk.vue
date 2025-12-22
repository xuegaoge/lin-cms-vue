<template>
  <div class="container">
    <div class="header">
      <div class="title">S04 - 36项风险预警报告</div>
      <el-button @click="handleBack">返回</el-button>
    </div>

    <div class="content">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="hover" class="score-card">
            <template #header>
              <div class="card-header">
                <span>综合风险指数</span>
              </div>
            </template>
            <div class="score-value" :class="getScoreClass(overallLevel)">{{ overallLevel }}</div>
            <div class="score-desc">检测到 {{ riskItems.length }} 项风险指标</div>
          </el-card>
        </el-col>
        <el-col :span="16">
          <el-card shadow="hover">
             <template #header>
              <div class="card-header">
                <span>预警详情</span>
              </div>
            </template>
            <el-table :data="riskItems" style="width: 100%">
              <el-table-column prop="item" label="检测项" width="180" />
              <el-table-column prop="level" label="风险等级" width="100">
                 <template #default="scope">
                    <el-tag :type="getRiskColor(scope.row.level)">{{ scope.row.level }}</el-tag>
                 </template>
              </el-table-column>
              <el-table-column prop="desc" label="风险描述" />
              <el-table-column prop="suggestion" label="处理建议" />
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
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const overallLevel = ref('Low')
const score = ref(100)

const riskItems = ref([])

const handleBack = () => {
  const productId = route.query.productId
  if (productId) {
    router.push({ path: `/selection/product/${productId}`, query: { tab: 'strategies' } })
  } else {
    router.back()
  }
}

const getRiskColor = (level) => {
    if(level === 'High' || level === '高') return 'danger'
    if(level === 'Medium' || level === '中') return 'warning'
    return 'info'
}

const getScoreClass = (level) => {
    if(level === 'High' || level === '高') return 'high-risk'
    if(level === 'Medium' || level === '中') return 'medium-risk'
    return 'low-risk'
}

const loadData = async () => {
    const productId = route.query.productId
    if (!productId) return
    
    loading.value = true
    try {
        const res = await Strategy.execute('S04', productId)
        processResult(res)
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const processResult = (res) => {
    score.value = res.score
    overallLevel.value = res.grade // 假设后端返回 "高风险" / "中风险"
    
    // Parse resultData for RiskAlerts list
    let data = {}
    if (res.resultData) {
        try {
            data = typeof res.resultData === 'string' ? JSON.parse(res.resultData) : res.resultData
        } catch (e) {}
    }

    if (data.RiskAlerts && Array.isArray(data.RiskAlerts)) {
        riskItems.value = data.RiskAlerts.map(item => ({
            item: item.RiskName || item.riskName,
            level: item.RiskLevel || item.riskLevel,
            desc: item.Description || item.description,
            suggestion: (item.Suggestions && item.Suggestions.length > 0) ? item.Suggestions[0] : ''
        }))
    } else {
        riskItems.value = []
    }
}

onMounted(() => {
    loadData()
})
</script>

<style scoped>
.container {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title {
  font-size: 20px;
  font-weight: bold;
}
.score-value {
    font-size: 36px;
    font-weight: bold;
    text-align: center;
    margin: 20px 0;
}
.high-risk {
    color: #f56c6c;
}
.medium-risk {
    color: #e6a23c;
}
.low-risk {
    color: #67c23a;
}
.score-desc {
    text-align: center;
    color: #909399;
}
</style>