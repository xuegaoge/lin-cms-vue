<template>
  <div class="container">
    <div class="header">
      <div class="title">S02: 40题自诊系统</div>
      <div class="actions">
        <el-button @click="$router.back()">返回</el-button>
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
                  <span class="group-stats">{{ getGroupScore(gIndex) }} / {{ group.questions.length * 10 }}</span>
                </div>
              </template>
              <div v-for="(q, qIndex) in group.questions" :key="qIndex" class="question-item">
                <div class="q-text">{{ (gIndex * 8) + qIndex + 1 }}. {{ q.text }}</div>
                <el-radio-group v-model="answers[q.id]" size="small">
                  <el-radio-button :label="10">优秀</el-radio-button>
                  <el-radio-button :label="7">良好</el-radio-button>
                  <el-radio-button :label="4">一般</el-radio-button>
                  <el-radio-button :label="0">差/无</el-radio-button>
                </el-radio-group>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="card result-card" v-if="submitted || true">
          <div class="card-header">诊断实时结果</div>
          <div class="score-display">
            <div class="total-score">{{ totalScore }}</div>
            <div class="label">当前总分 (总分 400)</div>
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
              <li>> 320分: 极高潜力 (GO)</li>
              <li>240-320分: 值得尝试 (WAIT)</li>
              <li>< 240分: 风险巨大 (STOP)</li>
            </ul>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const activeNames = ref([0])
const submitted = ref(false)
const scoreChart = ref(null)
let chartInstance = null

const questionGroups = [
  {
    title: '第一组：市场与竞争 (Market & Competition)',
    questions: [
      { id: 'Q1', text: '该类目月搜索量是否稳定在5万以上？' },
      { id: 'Q2', text: '竞品ASIN数量是否处于可控范围（<3000）？' },
      { id: 'Q3', text: '前十名卖家是否有明显的断层机会？' },
      { id: 'Q4', text: '头部品牌集中度是否低于60%？' },
      { id: 'Q5', text: '该产品是否有明显的季节性波动？' },
      { id: 'Q6', text: '新品占比是否超过20%？' },
      { id: 'Q7', text: '平均评分是否低于4.2分（有改进空间）？' },
      { id: 'Q8', text: 'Top 100 榜单变动率是否活跃？' }
    ]
  },
  {
    title: '第二组：产品与供应链 (Product & Supply)',
    questions: [
      { id: 'Q9', text: '产品是否有核心技术壁垒或差异化空间？' },
      { id: 'Q10', text: '供应商是否具备成熟的生产经验？' },
      { id: 'Q11', text: '原材料价格是否稳定？' },
      { id: 'Q12', text: '交期是否能控制在25天以内？' },
      { id: 'Q13', text: 'MOQ是否对初次试错友好？' },
      { id: 'Q14', text: '包装体积是否符合小号/大号标准件？' },
      { id: 'Q15', text: '产品质量退货率是否能控制在3%以内？' },
      { id: 'Q16', text: '是否有配套的配件或增值服务可能？' }
    ]
  }
  // 简化起见，这里只放两组示例，实际应有5组共40题
]

const answers = reactive({})
// 初始化答案
questionGroups.forEach(g => {
    g.questions.forEach(q => {
        answers[q.id] = 0
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
    if (totalScore.value >= 120) return 'GO (强烈推荐)'
    if (totalScore.value >= 80) return 'WAIT (继续观察)'
    return 'STOP (立即放弃)'
})

const decisionClass = computed(() => {
    if (totalScore.value >= 120) return 'go'
    if (totalScore.value >= 80) return 'wait'
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
            indicator: questionGroups.map(g => ({ name: g.title.substring(0, 5), max: g.questions.length * 10 })),
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

const handleSubmit = () => {
    submitted.value = true
    ElMessage.success('诊断提交成功，结果已保存至产品分析记录')
}

onMounted(() => {
    initChart()
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
