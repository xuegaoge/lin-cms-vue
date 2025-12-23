<template>
  <div class="container" v-loading="loading">
    <div class="header">
      <div class="title-group">
        <div class="title">S04 - 36项风险预警报告</div>
        <div class="subtitle">全方位风险检测：市场、财务、供应链、合规四大维度</div>
      </div>
      <el-button @click="handleBack">返回</el-button>
    </div>

    <div class="content">
      <!-- 顶部概览 -->
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover" class="score-card">
            <template #header>
              <div class="card-header">
                <span>风险评分</span>
              </div>
            </template>
            <div class="score-value" :style="{ color: getScoreColor(score) }">{{ score }}</div>
            <div class="score-desc">满分100分，越高越安全</div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="score-card">
            <template #header>
              <div class="card-header">
                <span>风险等级</span>
              </div>
            </template>
            <div class="score-value" :class="getRiskClass(grade)">{{ grade }}</div>
            <div class="score-desc">{{ decision }}</div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="hover" class="score-card">
            <template #header>
              <div class="card-header">
                <span>风险统计</span>
              </div>
            </template>
            <div class="risk-stats">
              <div class="stat-item high">
                <span class="count">{{ riskCounts.high }}</span>
                <span class="label">高风险</span>
              </div>
              <div class="stat-item medium">
                <span class="count">{{ riskCounts.medium }}</span>
                <span class="label">中风险</span>
              </div>
              <div class="stat-item low">
                <span class="count">{{ riskCounts.low }}</span>
                <span class="label">低风险</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 风险详情表格 -->
      <el-card shadow="hover" style="margin-top: 20px;">
        <template #header>
          <div class="card-header">
            <span>风险预警详情</span>
            <el-tag v-if="riskItems.length === 0" type="success">暂无风险预警</el-tag>
          </div>
        </template>
        <el-table :data="riskItems" style="width: 100%" stripe>
          <el-table-column prop="riskCode" label="风险编号" width="100" />
          <el-table-column prop="riskName" label="风险名称" width="150" />
          <el-table-column prop="riskType" label="风险类型" width="100">
            <template #default="scope">
              <el-tag>{{ scope.row.riskType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="riskLevel" label="风险等级" width="100">
            <template #default="scope">
              <el-tag :type="getRiskColor(scope.row.riskLevel)">{{ scope.row.riskLevel }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="风险描述" min-width="200" />
          <el-table-column prop="suggestions" label="处理建议" min-width="250">
            <template #default="scope">
              <ul class="suggestion-list" v-if="scope.row.suggestions && scope.row.suggestions.length">
                <li v-for="(sug, idx) in scope.row.suggestions" :key="idx">{{ sug }}</li>
              </ul>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="riskItems.length === 0" description="该产品未检测到风险项" :image-size="100"></el-empty>
      </el-card>

      <!-- 综合建议 -->
      <el-card shadow="hover" style="margin-top: 20px;" v-if="reason">
        <template #header>
          <div class="card-header">
            <span>综合评估结论</span>
          </div>
        </template>
        <el-result 
          :icon="decision === 'GO' ? 'success' : decision === 'STOP' ? 'error' : 'warning'"
          :title="decision === 'GO' ? '风险可控 - 建议推进' : decision === 'STOP' ? '风险过高 - 建议暂停' : '需要关注 - 谨慎推进'"
          :sub-title="reason"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Strategy } from '@/lin/model/selection'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const score = ref(100)
const grade = ref('-')
const decision = ref('-')
const reason = ref('')
const riskItems = ref([])

// 计算风险统计
const riskCounts = computed(() => {
  const counts = { high: 0, medium: 0, low: 0 }
  riskItems.value.forEach(item => {
    const level = (item.riskLevel || '').toLowerCase()
    if (level === '高' || level === 'high') counts.high++
    else if (level === '中' || level === 'medium') counts.medium++
    else counts.low++
  })
  return counts
})

const handleBack = () => {
  const productId = route.query.productId
  if (productId) {
    router.push({ path: `/selection/product/${productId}`, query: { tab: 'strategies' } })
  } else {
    router.back()
  }
}

const getRiskColor = (level) => {
  const l = (level || '').toLowerCase()
  if (l === 'high' || l === '高') return 'danger'
  if (l === 'medium' || l === '中') return 'warning'
  return 'info'
}

const getRiskClass = (gradeVal) => {
  if (gradeVal === '高风险') return 'high-risk'
  if (gradeVal === '中风险') return 'medium-risk'
  return 'low-risk'
}

const getScoreColor = (s) => {
  if (s >= 80) return '#67c23a'
  if (s >= 60) return '#e6a23c'
  return '#f56c6c'
}

const loadData = async () => {
  const productId = route.query.productId
  if (!productId) return
  
  loading.value = true
  try {
    const res = await Strategy.execute('S04', productId)
    // API返回结构: { code: 200, data: { score, risk_alerts, ... } }
    const data = res.data || res
    processResult(data)
  } catch (e) {
    console.error('Failed to load risk data:', e)
    ElMessage.error('加载风险数据失败')
  } finally {
    loading.value = false
  }
}

const processResult = (res) => {
  if (!res) return
  
  // 基础字段 (兼容 PascalCase 和 camelCase)
  score.value = res.score ?? res.Score ?? 100
  grade.value = res.grade ?? res.Grade ?? '-'
  decision.value = res.decision ?? res.Decision ?? '-'
  reason.value = res.reason ?? res.Reason ?? ''
  
  // 解析风险预警项
  // 后端 RiskAlertStrategy 返回的是 RiskAlerts 列表
  const alerts = res.riskAlerts ?? res.RiskAlerts ?? []
  
  if (alerts && Array.isArray(alerts) && alerts.length > 0) {
    riskItems.value = alerts.map(alert => ({
      riskCode: alert.riskCode ?? alert.RiskCode ?? '',
      riskName: alert.riskName ?? alert.RiskName ?? '',
      riskLevel: alert.riskLevel ?? alert.RiskLevel ?? '',
      riskType: alert.riskType ?? alert.RiskType ?? '',
      description: alert.description ?? alert.Description ?? '',
      triggerValue: alert.triggerValue ?? alert.TriggerValue ?? '',
      thresholdValue: alert.thresholdValue ?? alert.ThresholdValue ?? '',
      suggestions: alert.suggestions ?? alert.Suggestions ?? []
    }))
  } else {
    riskItems.value = []
  }
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
.title-group {
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
}
.score-card {
  text-align: center;
}
.score-value {
  font-size: 40px;
  font-weight: bold;
  text-align: center;
  margin: 15px 0;
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
  font-size: 13px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}
.risk-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
  
  .stat-item {
    text-align: center;
    padding: 10px 30px;
    border-radius: 8px;
    
    .count {
      font-size: 32px;
      font-weight: bold;
      display: block;
    }
    .label {
      font-size: 14px;
      color: #606266;
      margin-top: 5px;
    }
    
    &.high {
      background: #fef0f0;
      .count { color: #f56c6c; }
    }
    &.medium {
      background: #fdf6ec;
      .count { color: #e6a23c; }
    }
    &.low {
      background: #f0f9eb;
      .count { color: #67c23a; }
    }
  }
}
.suggestion-list {
  margin: 0;
  padding-left: 16px;
  li {
    line-height: 1.8;
    color: #606266;
    font-size: 13px;
  }
}
</style>