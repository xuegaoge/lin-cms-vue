<template>
  <div class="container">
    <div class="header">
      <div class="title">企业定位评估 (S11)</div>
      <el-button type="primary" @click="handleSave">保存评估</el-button>
    </div>

    <el-row :gutter="20">
      <!-- 左侧：雷达图展示 -->
      <el-col :span="12">
        <div class="card chart-card">
          <div class="card-header">
            <span>能力维度分布</span>
            <el-tag :type="getGradeType(profile.grade)" size="large" effect="dark">{{ profile.grade }} 级企业</el-tag>
          </div>
          <div ref="radarChart" class="radar-chart"></div>
          <div class="score-summary">
            <div class="total-score">综合得分: <span>{{ profile.total_score }}</span></div>
            <p class="description">基于 8 个维度的加权评估结果，影响所有选品策略的判定阈值。</p>
          </div>
        </div>
      </el-col>

      <!-- 右侧：评分输入 -->
      <el-col :span="12">
        <div class="card form-card">
          <div class="card-header">评估打分</div>
          <el-form :model="profile" label-width="120px" class="score-form">
            <el-form-item label="资金实力">
              <el-slider v-model="profile.funding_capacity" :min="0" :max="100" show-input @change="updateChart"></el-slider>
            </el-form-item>
            <el-form-item label="团队经验">
              <el-slider v-model="profile.team_experience" :min="0" :max="100" show-input @change="updateChart"></el-slider>
            </el-form-item>
            <el-form-item label="供应链深度">
              <el-slider v-model="profile.supply_chain_depth" :min="0" :max="100" show-input @change="updateChart"></el-slider>
            </el-form-item>
            <el-form-item label="运营能力">
              <el-slider v-model="profile.operation_capability" :min="0" :max="100" show-input @change="updateChart"></el-slider>
            </el-form-item>
            <el-form-item label="风险承受力">
              <el-slider v-model="profile.risk_tolerance" :min="0" :max="100" show-input @change="updateChart"></el-slider>
            </el-form-item>
            <el-form-item label="市场洞察">
              <el-slider v-model="profile.market_insight" :min="0" :max="100" show-input @change="updateChart"></el-slider>
            </el-form-item>
            <el-form-item label="技术能力">
              <el-slider v-model="profile.tech_capability" :min="0" :max="100" show-input @change="updateChart"></el-slider>
            </el-form-item>
            <el-form-item label="品牌意识">
              <el-slider v-model="profile.brand_awareness" :min="0" :max="100" show-input @change="updateChart"></el-slider>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>

    <!-- 建议部分 -->
    <div class="card suggestion-card">
        <div class="card-header">专家建议</div>
        <el-alert
            v-for="(item, index) in recommendations"
            :key="index"
            :title="item"
            type="info"
            show-icon
            :closable="false"
            style="margin-bottom: 10px"
        />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { Enterprise } from '@/lin/model/selection'

const radarChart = ref(null)
let chartInstance = null

const profile = reactive({
  funding_capacity: 0,
  team_experience: 0,
  supply_chain_depth: 0,
  operation_capability: 0,
  risk_tolerance: 0,
  market_insight: 0,
  tech_capability: 0,
  brand_awareness: 0,
  total_score: 0,
  grade: '-'
})

const recommendations = ref([])

const getGradeType = (grade) => {
    const map = { 'S': 'danger', 'A': 'warning', 'B': 'primary', 'C': 'success', 'D': 'info' }
    return map[grade] || 'info'
}

const initChart = () => {
    if (!radarChart.value) return
    chartInstance = echarts.init(radarChart.value)
    renderChart()
}

const renderChart = () => {
    const option = {
        radar: {
            indicator: [
                { name: '资金实力', max: 100 },
                { name: '团队经验', max: 100 },
                { name: '供应链深度', max: 100 },
                { name: '运营能力', max: 100 },
                { name: '风险承受', max: 100 },
                { name: '市场洞察', max: 100 },
                { name: '技术能力', max: 100 },
                { name: '品牌意识', max: 100 }
            ],
            splitArea: {
                show: false
            }
        },
        series: [
            {
                type: 'radar',
                data: [
                    {
                        value: [
                            profile.funding_capacity,
                            profile.team_experience,
                            profile.supply_chain_depth,
                            profile.operation_capability,
                            profile.risk_tolerance,
                            profile.market_insight,
                            profile.tech_capability,
                            profile.brand_awareness
                        ],
                        name: '当前能力',
                        areaStyle: {
                            color: 'rgba(64, 158, 255, 0.3)'
                        },
                        lineStyle: {
                            color: '#409EFF'
                        },
                        itemStyle: {
                            color: '#409EFF'
                        }
                    }
                ]
            }
        ]
    }
    chartInstance.setOption(option)
}

const updateChart = () => {
    // 每次滑块变动只更新图表，不立即重新计算Grade，等待保存或后端返回
    renderChart()
    // 简单的本地预估
    const values = [
        profile.funding_capacity,
        profile.team_experience,
        profile.supply_chain_depth,
        profile.operation_capability,
        profile.risk_tolerance,
        profile.market_insight,
        profile.tech_capability,
        profile.brand_awareness
    ]
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    profile.total_score = avg.toFixed(1)
}

const loadData = async () => {
    try {
        const res = await Enterprise.getProfile()
        if (res) {
            Object.assign(profile, res)
            // 确保图表更新
            renderChart()
        }
        // 假设 recommendations 也是从 profile 接口或单独接口返回，这里暂时保留空或后端返回字段
        if (res.recommendations) {
            recommendations.value = res.recommendations
        }
    } catch (error) {
        console.error('获取企业定位失败', error)
        // ElMessage.warning('尚未配置企业定位，请进行首次评估')
    }
}

const handleSave = async () => {
    try {
        const res = await Enterprise.createProfile(profile)
        ElMessage.success('企业定位评估已保存，相关策略阈值已更新')
        if (res) {
             Object.assign(profile, res)
             if (res.recommendations) recommendations.value = res.recommendations
             renderChart()
        }
    } catch (error) {
        console.error('保存失败', error)
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

    .title {
      font-size: 18px;
      font-weight: bold;
    }
  }

  .card {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      font-size: 16px;
      font-weight: bold;
      border-left: 4px solid #409eff;
      padding-left: 10px;
    }
  }

  .chart-card {
    height: 600px;
    display: flex;
    flex-direction: column;

    .radar-chart {
      flex: 1;
      width: 100%;
    }

    .score-summary {
      text-align: center;
      padding-top: 10px;
      border-top: 1px solid #ebeef5;

      .total-score {
        font-size: 24px;
        color: #303133;
        margin-bottom: 5px;
        span {
          color: #409eff;
          font-weight: bold;
        }
      }

      .description {
        font-size: 12px;
        color: #909399;
      }
    }
  }

  .form-card {
    height: 600px;
    overflow-y: auto;
  }
}
</style>
