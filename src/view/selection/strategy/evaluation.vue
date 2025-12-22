<template>
  <div class="container">
    <div class="header">
      <div class="title">S01: 四层评估体系 (MPSF)</div>
      <div class="actions">
        <el-button @click="$router.back()">返回</el-button>
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
            icon="success"
            title="GO - 建议立项"
            sub-title="该产品在市场空间和毛利率方面表现极佳，虽供应链稳定性稍弱，但整体风险可控。"
        >
        </el-result>
        <div class="suggestion-list">
             <el-alert title="市场风险：头部品牌占比55%，接近红线，建议通过差异化设计切入长尾市场。" type="warning" show-icon :closable="false" />
             <el-alert title="财务机会：预期ROI可达35%，远超B级企业标准，资金利用效率高。" type="success" show-icon :closable="false" />
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'

const mpsfChart = ref(null)
let chartInstance = null
const executed = ref(true)

const summary = [
    { label: '综合评分', value: '85.5', desc: '超越 92% 的库内产品', class: 'primary' },
    { label: '决策建议', value: 'GO', desc: '符合 B 级企业立项阈值', class: 'success' },
    { label: '核心优势', value: '毛利率 (42%)', desc: '远高于类目平均 28%', class: 'warning' },
    { label: '首要风险', value: '知识产权', desc: '外观专利侵权概率中等', class: 'danger' }
]

const details = [
    { layer: '市场 (M)', metric: '月搜索量', value: '52,000', score: 90, remark: '市场空间充足' },
    { layer: '市场 (M)', metric: '搜索增长率', value: '15%', score: 75, remark: '平稳增长' },
    { layer: '产品 (P)', metric: '平均评分', value: '4.1', score: 85, remark: '存在痛点改进机会' },
    { layer: '产品 (P)', metric: '新品占比', value: '25%', score: 95, remark: '对新人友好' },
    { layer: '供应 (S)', metric: '交期稳定性', value: '良好', score: 70, remark: '需进一步考察工厂' },
    { layer: '财务 (F)', metric: '预估ROI', score: 92, value: '35%', remark: '非常优秀' }
]

const getLayerType = (layer) => {
    if (layer.includes('市场')) return 'primary'
    if (layer.includes('产品')) return 'success'
    if (layer.includes('供应')) return 'warning'
    return 'danger'
}

const getScoreClass = (score) => {
    if (score >= 90) return 'score-high'
    if (score >= 75) return 'score-mid'
    return 'score-low'
}

const initChart = () => {
    if (!mpsfChart.value) return
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
                value: [88, 82, 70, 92],
                name: '得分分布',
                areaStyle: { color: 'rgba(64, 158, 255, 0.3)' }
            }]
        }]
    }
    chartInstance.setOption(option)
}

const handleExecute = () => {
    ElMessage.success('正在执行四层评估策略...')
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
