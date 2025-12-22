<template>
  <div class="container">
    <div class="header">
      <div class="title">S18: 极端环境压力测试</div>
      <div class="actions">
        <el-button @click="handleBack">返回</el-button>
        <el-button type="danger" @click="handleTest">开始测试</el-button>
      </div>
    </div>

    <div class="test-config">
      <el-card header="测试场景配置" shadow="hover">
        <el-form :inline="true" label-position="top">
          <el-form-item label="价格战 (降价幅度)">
            <el-slider v-model="scenarios.priceDrop" :min="0" :max="50" show-input style="width: 200px"></el-slider>
          </el-form-item>
          <el-form-item label="物流暴涨 (运费涨幅)">
            <el-slider v-model="scenarios.shippingRise" :min="0" :max="200" show-input style="width: 200px"></el-slider>
          </el-form-item>
          <el-form-item label="广告内卷 (CPC 涨幅)">
            <el-slider v-model="scenarios.cpcRise" :min="0" :max="100" show-input style="width: 200px"></el-slider>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="result-area" v-if="tested">
      <el-row :gutter="20">
        <el-col :span="8" v-for="(res, index) in results" :key="index">
          <div class="result-card" :class="res.status">
            <div class="card-title">{{ res.name }}</div>
            <div class="profit-val">净利: {{ res.profit }}%</div>
            <div class="status-tag">{{ res.status === 'fail' ? '击穿底线' : '安全存活' }}</div>
            <div class="desc">{{ res.desc }}</div>
          </div>
        </el-col>
      </el-row>

      <div class="survival-summary">
        <h3>生存能力评估: <span :class="survivalClass">{{ survivalRate }}</span></h3>
        <p>在当前设定的 3 种极端场景下，该产品展现出了<strong>{{ survivalLevel }}</strong>的抗风险能力。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
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

const tested = ref(false)
const scenarios = reactive({
  priceDrop: 20,
  shippingRise: 50,
  cpcRise: 30
})

const results = ref([])

const handleTest = async () => {
  const productId = route.query.productId
  if (!productId) return
  
  loading.value = true
  // ElMessage.warning('正在进行高强度压力模拟...')
  
  try {
      const res = await Strategy.execute('S18', productId, { scenarios })
      processResult(res)
  } catch (e) {
      console.error(e)
  } finally {
      loading.value = false
  }
}

const processResult = (res) => {
  executed.value = true
  resultData.value = res
  
  if (res.detail_json) {
    let data = typeof res.detail_json === 'string' ? JSON.parse(res.detail_json) : res.detail_json
    
    // 假设后端返回生存率 score 和 各场景数据
    survivalRate.value = res.score || 0
    scenarios.value = data.scenarios || []
    
    initChart()
  } else if (res.sub_results) {
      // 兼容 sub_results 模式
      survivalRate.value = res.score || 0
      scenarios.value = res.sub_results.map(s => ({
          name: s.name,
          impact: s.score,
          status: s.score > 60 ? 'Pass' : 'Fail',
          suggestion: s.indicators ? s.indicators[0]?.calculation : ''
      }))
      initChart()
  }
}

const survivalRate = computed(() => {
  if (results.value.length === 0) return '0%'
  const passed = results.value.filter(r => r.status === 'pass').length
  return `${Math.round((passed / results.value.length) * 100)}%`
})

const survivalClass = computed(() => {
  const rate = parseInt(survivalRate.value)
  return rate >= 66 ? 'text-success' : 'text-danger'
})

const survivalLevel = computed(() => {
  const rate = parseInt(survivalRate.value)
  return rate >= 66 ? '优秀' : (rate >= 33 ? '一般' : '脆弱')
})
</script>

<style lang="scss" scoped>
.container {
  padding: 24px;
  background-color: #f7f8fa;
  min-height: calc(100vh - 80px);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    background: #fff;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);
    .title { font-size: 18px; font-weight: 600; color: #303133; }
  }

  .test-config { margin-bottom: 24px; }

  .result-card {
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
    border-top: 4px solid #ddd;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    height: 180px;
    display: flex;
    flex-direction: column;
    justify-content: center;

    &.pass { border-top-color: #67c23a; .status-tag { color: #67c23a; background: #f0f9eb; } }
    &.fail { border-top-color: #f56c6c; .status-tag { color: #f56c6c; background: #fef0f0; } }

    .card-title { font-weight: bold; margin-bottom: 10px; }
    .profit-val { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .status-tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-bottom: 10px; width: fit-content; margin: 0 auto 10px; }
    .desc { font-size: 13px; color: #909399; }
  }

  .survival-summary {
    background: #fff;
    padding: 20px;
    margin-top: 24px;
    border-radius: 8px;
    text-align: center;
    h3 { margin-bottom: 10px; }
    .text-success { color: #67c23a; }
    .text-danger { color: #f56c6c; }
  }
}
</style>
