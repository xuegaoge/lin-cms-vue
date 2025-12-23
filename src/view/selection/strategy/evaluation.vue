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
            :icon="decisionIcon"
            :title="decisionTitle"
            :sub-title="decisionReason"
        >
        </el-result>
        <div class="suggestion-list" v-if="resultData">
             <el-alert v-for="(warn, idx) in resultData.warnings" :key="'w'+idx" :title="warn" type="warning" show-icon :closable="false" />
             <el-alert v-for="(sug, idx) in resultData.suggestions" :key="'s'+idx" :title="sug" type="success" show-icon :closable="false" />
             <el-empty v-if="(!resultData.warnings || resultData.warnings.length === 0) && (!resultData.suggestions || resultData.suggestions.length === 0)" description="暂无特别建议"></el-empty>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
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

const decisionIcon = computed(() => {
    const d = resultData.value?.decision || resultData.value?.Decision || ''
    if (d === 'GO') return 'success'
    if (d === 'STOP') return 'error'
    return 'warning'
})

const decisionTitle = computed(() => {
    const d = resultData.value?.decision || resultData.value?.Decision || ''
    if (d === 'GO') return 'GO - 建议立项'
    if (d === 'STOP') return 'STOP - 建议放弃'
    if (d === 'WAIT') return 'WAIT - 建议观望'
    return d || '评估完成'
})

const decisionReason = computed(() => {
    return resultData.value?.reason || resultData.value?.Reason || '暂无详细理由'
})

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
        // API返回结构: { code: 200, data: { score, sub_results, ... } }
        const data = res.data || res
        processResult(data)
        ElMessage.success('S01 策略评估完成')
    } catch (e) {
        console.error(e)
        ElMessage.error('策略执行失败')
    } finally {
        loading.value = false
    }
}

const processResult = (res) => {
    executed.value = true
    resultData.value = res
    
    // Summary - 兼容多种大小写格式
    const score = res.score ?? res.Score ?? 0
    const grade = res.grade ?? res.Grade ?? '-'
    const decision = res.decision ?? res.Decision ?? '-'
    
    summary.value[0].value = score
    summary.value[0].desc = '评分等级: ' + grade
    summary.value[1].value = decision
    
    // 从 subResults 提取 MPSF 四层得分 (兼容多种格式)
    const subResults = res.subResults ?? res.SubResults ?? res.sub_results ?? []
    const scores = [0, 0, 0, 0] // M, P, S(运营), F
    
    if (subResults && Array.isArray(subResults)) {
        subResults.forEach(sub => {
            const name = (sub.name ?? sub.Name ?? '').toLowerCase()
            const subScore = sub.score ?? sub.Score ?? 0
            
            if (name.includes('市场') || name.includes('market')) scores[0] = subScore
            else if (name.includes('产品') || name.includes('product')) scores[1] = subScore
            else if (name.includes('运营') || name.includes('operation')) scores[2] = subScore
            else if (name.includes('财务') || name.includes('finance')) scores[3] = subScore
        })

        // 表格明细 - 展平所有 indicators (兼容 PascalCase)
        const allIndicators = []
        subResults.forEach(sub => {
            const indicators = sub.indicators ?? sub.Indicators ?? []
            const layerName = sub.name ?? sub.Name ?? ''
            
            if (indicators && Array.isArray(indicators)) {
                indicators.forEach(ind => {
                    allIndicators.push({
                        layer: layerName,
                        metric: ind.name ?? ind.Name ?? '',
                        value: ind.rawValue ?? ind.RawValue ?? ind.raw_value ?? '-',
                        score: ind.score ?? ind.Score ?? 0,
                        remark: ind.calculation ?? ind.Calculation ?? ind.grade ?? ind.Grade ?? ''
                    })
                })
            }
        })
        details.value = allIndicators
    }
    
    initChart(scores)

    // 处理建议和警告 (兼容多种格式)
    const suggestions = res.suggestions ?? res.Suggestions ?? []
    const warnings = res.warnings ?? res.Warnings ?? []
    
    // 自动分析优势和风险 (深入到具体指标)
    let strengthTitle = '暂无显著优势'
    let strengthDesc = '各项指标表现平平'
    let riskTitle = '暂无显著风险'
    let riskDesc = '各项指标表现均衡'

    // 1. 分析优势 (Score >= 80)
    // 优先从 suggestions 获取
    if (suggestions.length > 0) {
         strengthTitle = '策略建议'
         strengthDesc = typeof suggestions[0] === 'string' ? suggestions[0] : suggestions[0]?.action ?? ''
    } else if (subResults && subResults.length > 0) {
        // 展平所有指标并按分数降序排序
        let allInds = []
        subResults.forEach(sub => {
            const indicators = sub.indicators ?? sub.Indicators ?? []
            if (indicators && Array.isArray(indicators)) {
                indicators.forEach(ind => {
                    allInds.push({ 
                        name: ind.name ?? ind.Name ?? '', 
                        score: ind.score ?? ind.Score ?? 0,
                        layer: sub.name ?? sub.Name ?? ''
                    })
                })
            }
        })
        
        // 找到得分最高的指标
        allInds.sort((a, b) => b.score - a.score)
        const best = allInds[0]
        
        if (best && best.score >= 80) {
            // 根据指标名称映射商业术语
            if (best.name.includes('ROI') || best.name.includes('毛利')) strengthTitle = '高盈利模型'
            else if (best.name.includes('搜索') || best.name.includes('增长')) strengthTitle = '高增长潜力'
            else if (best.name.includes('竞品') || best.name.includes('集中度')) strengthTitle = '竞争格局佳'
            else if (best.name.includes('转化') || best.name.includes('CPC')) strengthTitle = '运营效率高'
            else strengthTitle = `${best.name}表现优异`
            
            strengthDesc = `${best.layer}的${best.name}得分高达${best.score}分`
        } else if (best) {
            strengthTitle = '综合表现尚可'
            strengthDesc = `${best.layer}表现相对较好`
        }
    }

    // 2. 分析风险 (Score < 60)
    // 优先从 warnings 获取
    if (warnings.length > 0) {
         riskTitle = '风险预警'
         riskDesc = typeof warnings[0] === 'string' ? warnings[0] : warnings[0]?.warning ?? ''
    } else if (subResults && subResults.length > 0) {
        let allInds = []
        subResults.forEach(sub => {
            const indicators = sub.indicators ?? sub.Indicators ?? []
            if (indicators && Array.isArray(indicators)) {
                indicators.forEach(ind => {
                    allInds.push({ 
                        name: ind.name ?? ind.Name ?? '', 
                        score: ind.score ?? ind.Score ?? 0,
                        layer: sub.name ?? sub.Name ?? ''
                    })
                })
            }
        })
        
        // 找到得分最低的指标
        allInds.sort((a, b) => a.score - b.score)
        const worst = allInds[0]
        
        if (worst && worst.score < 60) {
            if (worst.name.includes('搜索') || worst.name.includes('增长')) riskTitle = '市场需求疲软'
            else if (worst.name.includes('竞品') || worst.name.includes('集中度')) riskTitle = '市场竞争激烈'
            else if (worst.name.includes('ROI') || worst.name.includes('毛利')) riskTitle = '盈利空间受限'
            else if (worst.name.includes('转化') || worst.name.includes('CPC')) riskTitle = '运营难度大'
            else if (worst.name.includes('风险') || worst.name.includes('合规')) riskTitle = '合规风险高'
            else riskTitle = `${worst.name}存在短板`
            
            riskDesc = `${worst.layer}的${worst.name}仅得${worst.score}分`
        } else {
             riskTitle = '无明显短板'
             riskDesc = '所有核心指标均在及格线以上'
        }
    }

    summary.value[2].value = strengthTitle
    summary.value[2].desc = strengthDesc
    
    summary.value[3].value = riskTitle
    summary.value[3].desc = riskDesc
}

const loadData = async () => {
    const productId = route.query.productId
    if (!productId) {
        initChart([0,0,0,0])
        return
    }

    try {
        // 直接执行策略获取完整数据（包含Indicators）
        // 历史记录API返回的数据中Indicators被序列化为字符串，丢失了详情
        const res = await Strategy.execute('S01', productId)
        // res 的结构: { code: 200, data: { score, sub_results: [...], ... } }
        const data = res.data || res
        processResult(data)
    } catch (e) {
        console.error('Failed to load S01 data', e)
        initChart([0,0,0,0])
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
