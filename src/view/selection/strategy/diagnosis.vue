<template>
  <div class="container">
    <div class="header">
      <div class="title">S02: 40题自诊系统</div>
      <div class="actions">
        <el-button @click="openTool('cr3')" size="small" type="info" plain>
          <i class="el-icon-calculator"></i> 选品计算器
        </el-button>
        <el-button @click="handleBack">返回</el-button>
        <el-button type="primary" @click="handleSubmit">提交诊断</el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="16">
        <div class="card questions-card">
          <el-collapse v-model="activeNames">
            <el-collapse-item v-for="(group, gIndex) in questionGroups" :key="gIndex" :title="group.title" :name="gIndex">
              <template #title>
                <div class="group-title">
                  {{ group.title }} 
                  <span class="group-stats">{{ getGroupScore(gIndex) }} / {{ group.questions.length * 25 }}</span>
                </div>
              </template>
              <div v-for="(q, qIndex) in group.questions" :key="qIndex" class="question-item">
                <div class="q-text">
                  {{ (gIndex * 10) + qIndex + 1 }}. {{ q.text }}
                  <el-link 
                    v-if="q.tool" 
                    type="primary" 
                    :underline="false" 
                    @click.stop="openTool(q.tool)"
                    style="margin-left: 8px; font-size: 12px;"
                  >
                    <i class="el-icon-help"></i> 计算器
                  </el-link>
                </div>
                
                <!-- 统一三段式评估组件 -->
                <el-radio-group v-model="answers[q.id]" size="small" class="answer-group">
                  <el-radio-button :label="25">{{ q.levelLabels?.[25] || '优秀 / 满足' }}</el-radio-button>
                  <el-radio-button :label="10">{{ q.levelLabels?.[10] || '良好 / 正常' }}</el-radio-button>
                  <el-radio-button :label="0">{{ q.levelLabels?.[0] || '风险 / 待改进' }}</el-radio-button>
                </el-radio-group>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="card result-card" v-if="submitted || activeNames.length > 0">
          <div class="card-header">诊断实时结果</div>
          <div class="score-display">
            <div class="total-score">{{ totalScore }}</div>
            <div class="label">当前总分 (总分 1000)</div>
          </div>
          
          <div class="decision-box" :class="decisionClass">
            <div class="decision-label">决策建议</div>
            <div class="decision-value">{{ decisionText }}</div>
          </div>

          <div class="chart-container">
             <div ref="scoreChart" style="height: 250px;"></div>
          </div>

          <div class="tips">
            <p><strong>说明:</strong></p>
            <ul>
              <li>≥ 800分: 极高潜力 (GO)</li>
              <li>600-799分: 值得尝试 (WAIT)</li>
              <li>< 600分: 风险巨大 (STOP)</li>
            </ul>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 选品计算器弹窗 -->
    <el-dialog
      v-model="toolVisible"
      title="选品辅助计算器"
      width="600px"
      destroy-on-close
    >
      <selection-tools :active-tab="currentTool" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { Strategy } from '@/lin/model/selection'
import SelectionTools from './components/SelectionTools.vue'

const router = useRouter()
const route = useRoute()

const toolVisible = ref(false)
const currentTool = ref('cr3')

const openTool = (toolName) => {
  currentTool.value = toolName
  toolVisible.value = true
}

const handleBack = () => {
  const productId = route.query.productId
  if (productId) {
    router.push({ path: `/selection/product/${productId}`, query: { tab: 'strategies' } })
  } else {
    router.back()
  }
}

const activeNames = ref([0])
const submitted = ref(false)
const scoreChart = ref(null)
let chartInstance = null

const questionGroups = [
  {
    title: '第一组：生命周期与趋势 (Lifecycle)',
    questions: [
      { 
        id: 'Q1', text: '搜索趋势过去12个月是否持续增长（>20%）？', 
        displayType: 'tiered', 
        levelLabels: { 25: '爆发增长', 15: '平稳增长', 0: '增长停滞/衰退' } 
      },
      { id: 'Q2', text: '新品榜（New Releases）前10名是否有30天内上架的产品？' },
      { id: 'Q3', text: '市场供需比（搜索量/在售商品数）是否大于1.5？' },
      { id: 'Q4', text: '该类目是否处于成长期（非成熟期或衰退期）？' },
      { id: 'Q5', text: '未来12个月内是否存在明显的季节性淡季（需提前备货）？' },
      { id: 'Q6', text: '季节性系数是否小于0.6（非极强季节性产品）？', tool: 'seasonality' },
      { id: 'Q7', text: '核心关键词月搜索量是否大于1000？' },
      { id: 'Q8', text: '搜索量年增长率是否大于15%？' },
      { id: 'Q9', text: '首页新品成功率（上架<6个月）是否大于30%？' },
      { id: 'Q10', text: 'Google Trends 趋势线是否整体向上？' }
    ]
  },
  {
    title: '第二组：产品属性与利润 (Product & Profit)',
    questions: [
      { 
        id: 'Q11', text: 'FBM模式下毛利率是否≥35%？', 
        levelLabels: { 25: '>35% (优秀)', 10: '25-35% (良好)', 0: '<25% (风险)' } 
      },
      { 
        id: 'Q12', text: 'FBA模式下毛利率是否≥25%？', 
        levelLabels: { 25: '>25% (优秀)', 10: '15-25% (良好)', 0: '<15% (风险)' } 
      },
      { 
        id: 'Q13', text: '产品退货率是否低于类目平均水平？', 
        displayType: 'tiered', 
        levelLabels: { 25: '极低/安全', 15: '行业中位', 0: '高退货风险' } 
      },
      { id: 'Q14', text: '首页平均评分≥4.2且Review数量适中（非全部破万）？' },
      { id: 'Q15', text: '产品重量是否小于5磅（约2.2kg）？' },
      { id: 'Q16', text: '产品是否非易碎品、非液体、非危险品？' },
      { id: 'Q17', text: '核心SKU售价是否在 $15 - $50 之间？' },
      { id: 'Q18', text: '产品是否拥有至少3个明显的差异化卖点？' },
      { id: 'Q19', text: '预计产品生命周期是否大于12个月？' },
      { id: 'Q20', text: '是否有较高的复购潜力（>10%）或耗材属性？' }
    ]
  },
  {
    title: '第三组：类目竞争环境 (Competition)',
    questions: [
      { id: 'Q21', text: '长尾词流量占比是否大于30%？' },
      { 
        id: 'Q22', text: '类目前3页是否无明显专利侵权风险（已核查）？', 
        levelLabels: { 25: '安全无风险', 10: '需再调研', 0: '有明确风险' } 
      },
      { id: 'Q23', text: '该产品是否适合通过自建站（Shopify）进行推广？' },
      { id: 'Q24', text: '首页是否无亚马逊自营（Amazon Basics/Sold by Amazon）？' },
      { id: 'Q25', text: '核心关键词下直接竞品ASIN数量是否少于500？' },
      { id: 'Q26', text: 'BSR榜单销量梯度是否平滑（无断层）？' },
      { 
        id: 'Q27', text: 'Top 3 品牌市场占有率是否低于70%（无垄断）？', 
        levelLabels: { 25: '极低/散装', 10: '中度竞争', 0: '寡头垄断/禁区' },
        tool: 'cr3'
      },
      { 
        id: 'Q28', text: '平均CPC出价是否低于 $0.8？', 
        levelLabels: { 25: '低价流量', 10: '$0.8-$1.5 (中)', 0: '高价/烧钱' } 
      },
      { id: 'Q29', text: '平均点击率（CTR）是否大于0.3%？' },
      { id: 'Q30', text: '平均转化率（CVR）是否大于1.5%？' }
    ]
  },
  {
    title: '第四组：供应链与合规 (Supply Chain & Compliance)',
    questions: [
      { id: 'Q31', text: '是否能找到至少5家优质供应商？' },
      { id: 'Q32', text: '供应商是否支持小单定制（Logo/包装）？' },
      { 
        id: 'Q33', text: '大货生产交期是否能控制在30天以内？', 
        displayType: 'tiered', 
        levelLabels: { 25: '快速周转', 15: '30-45天', 0: '漫长/易断货' } 
      },
      { id: 'Q34', text: '最小起订量（MOQ）是否小于500件？' },
      { id: 'Q35', text: '过去一年原材料价格波动是否小于10%？' },
      { id: 'Q36', text: '核心供应商配合度评分是否大于80分？' },
      { 
        id: 'Q37', text: '是否无外观专利或IP侵权高风险？', 
        levelLabels: { 25: '低风险', 10: '中风险', 0: '高风险/熔断' } 
      },
      { 
        id: 'Q38', text: '是否无严重政策合规风险（如FDA/CE认证）？', 
        levelLabels: { 25: '已通过', 10: '办理中', 0: '无法办理' } 
      },
      { id: 'Q39', text: '预估6个月投资回报率（ROI）是否大于2:1？' },
      { id: 'Q40', text: '黄金三问（有需求？有利润？有优势？）是否全部满足？' }
    ]
  }
]

const answers = reactive({})
// 初始化答案
questionGroups.forEach(g => {
    g.questions.forEach(q => {
        answers[q.id] = null
    })
})

const getGroupScore = (gIndex) => {
    let score = 0
    questionGroups[gIndex].questions.forEach(q => {
        score += (answers[q.id] || 0)
    })
    return score
}

const totalScore = computed(() => {
    return Object.values(answers).reduce((a, b) => a + b, 0)
})

const decisionText = computed(() => {
    // 1. 红线熔断检查 (优先级最高)
    const killers = [
        { id: 'Q11', msg: 'FBM毛利极低' },
        { id: 'Q12', msg: 'FBA毛利极低' },
        { id: 'Q22', msg: '存在专利风险' },
        { id: 'Q37', msg: '存在IP风险' },
        { id: 'Q38', msg: '政策不合规' },
        { id: 'Q40', msg: '价值主张缺陷' }
    ]
    
    // 找出所有未通过的红线
    const triggeredKillerMsgs = killers
        .filter(k => answers[k.id] === 0)
        .map(k => k.msg)
    
    if (triggeredKillerMsgs.length > 0) {
        return `STOP (触犯红线: ${triggeredKillerMsgs.join('、')})`
    }

    // 2. 常规分数判定
    if (totalScore.value >= 800) return 'GO (强烈推荐)'
    if (totalScore.value >= 600) return 'WAIT (继续观察)'
    return 'STOP (立即放弃)'
})

const decisionClass = computed(() => {
    // 如果触发红线，强制红色样式
    if (decisionText.value.includes('触犯红线')) return 'stop'
    
    if (totalScore.value >= 800) return 'go'
    if (totalScore.value >= 600) return 'wait'
    return 'stop'
})

const initChart = () => {
    if (!scoreChart.value) return
    chartInstance = echarts.init(scoreChart.value)
    renderChart()
}

const renderChart = () => {
    const groupScores = questionGroups.map((g, i) => getGroupScore(i))
    const option = {
        radar: {
            indicator: questionGroups.map(g => ({ name: g.title.substring(0, 5), max: g.questions.length * 25 })),
            shape: 'circle'
        },
        series: [{
            type: 'radar',
            data: [{
                value: groupScores,
                areaStyle: { color: 'rgba(64, 158, 255, 0.3)' }
            }]
        }]
    }
    chartInstance.setOption(option)
}

watch(answers, () => {
    renderChart()
})

const handleSubmit = async () => {
    const productId = route.query.productId
    if (!productId) {
        ElMessage.error('缺少产品ID')
        return
    }
    try {
        await Strategy.submitDiagnosis(productId, answers)
        submitted.value = true
        ElMessage.success('诊断提交成功，结果已保存至产品分析记录')
    } catch (e) {
        console.error(e)
    }
}

const loadData = async () => {
    const productId = route.query.productId
    if (!productId || productId === 'create') return
    
    try {
        const historyRes = await Strategy.getExecutionHistory(productId, { strategyCode: 'S02', page: 1, size: 20 })
        
        let items = []
        if (historyRes?.items && Array.isArray(historyRes.items)) {
            items = historyRes.items
        } else if (historyRes?.data && Array.isArray(historyRes.data)) {
            items = historyRes.data
        } else if (Array.isArray(historyRes)) {
            items = historyRes
        }
        
        if (items.length > 0) {
            let targetRecord = items.find(item => {
                const d = item.detailData || item.detail_json
                return d && d.answers
            })

            if (!targetRecord) {
                targetRecord = items[0]
            }

            if (targetRecord) {
                const data = targetRecord.detailData || targetRecord.detail_json
                
                if (data && data.answers) {
                    Object.keys(data.answers).forEach(key => {
                        if (typeof data.answers[key] === 'boolean') {
                            answers[key] = data.answers[key] ? 25 : 0
                        } else if (typeof data.answers[key] === 'number') {
                            answers[key] = data.answers[key]
                        }
                    })
                    submitted.value = false
                    if (data.manualSubmit) {
                        submitted.value = true
                    }
                } else if (data && data.Questions && Array.isArray(data.Questions)) {
                    data.Questions.forEach(q => {
                        if (q.code) {
                            answers[q.code] = q.passed ? 25 : 0
                        }
                    })
                    submitted.value = false
                }
            }
        }
    } catch (e) {
        console.log('No existing diagnosis found', e)
    }
}

onMounted(() => {
    initChart()
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
    .actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
  }

  .card {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  }

  .group-title {
      display: flex;
      justify-content: space-between;
      width: 95%;
      .group-stats { color: #409eff; font-weight: bold; }
  }

  .question-item {
      padding: 15px 10px;
      border-bottom: 1px dashed #ebeef5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .q-text { font-size: 14px; color: #606266; flex: 1; margin-right: 20px; }
  }

  .result-card {
      position: sticky;
      top: 20px;
      text-align: center;
      .card-header {
          text-align: left;
          font-weight: bold;
          margin-bottom: 20px;
          border-left: 4px solid #409eff;
          padding-left: 10px;
      }
      .score-display {
          margin-bottom: 20px;
          .total-score { font-size: 48px; font-weight: bold; color: #409eff; }
          .label { font-size: 12px; color: #909399; }
      }
      .decision-box {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          &.go { background: #f0f9eb; color: #67c23a; border: 1px solid #c2e7b0; }
          &.wait { background: #fdf6ec; color: #e6a23c; border: 1px solid #f5dab1; }
          &.stop { background: #fef0f0; color: #f56c6c; border: 1px solid #fbc4c4; }
          .decision-label { font-size: 12px; margin-bottom: 5px; opacity: 0.8; }
          .decision-value { font-size: 18px; font-weight: bold; }
      }
      .tips {
          text-align: left;
          font-size: 13px;
          color: #606266;
          background: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
          ul { padding-left: 20px; margin-top: 5px; }
      }
  }
}
</style>
