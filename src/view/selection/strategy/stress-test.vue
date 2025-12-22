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
const tested = ref(false)
const resultData = ref(null)

const handleBack = () => {
  const productId = route.query.productId
  if (productId) {
    router.push({ path: `/selection/product/${productId}`, query: { tab: 'strategies' } })
  } else {
    router.back()
  }
}

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
  
  try {
      // 传递自定义场景参数 (虽然目前后端可能主要跑固定场景，但预留接口)
      const res = await Strategy.execute('S18', productId, { scenarios: scenarios })
      processResult(res)
  } catch (e) {
      console.error(e)
      ElMessage.error('压力测试执行失败')
  } finally {
      loading.value = false
  }
}

const processResult = (res) => {
  // 兼容 axios 拦截器处理
  const data = res.data || res
  
  tested.value = true
  resultData.value = data
  
  // 尝试解析 DetailJson
  let indicators = []
  if (data.detail_json || data.DetailJson) {
      try {
        const raw = data.detail_json || data.DetailJson
        const detail = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (detail.Indicators) {
            indicators = detail.Indicators
        }
      } catch(e) { console.error('Parse DetailJson failed', e) }
  } 
  
  // 如果 DetailJson 没有，尝试从 SubResults 获取 (API 可能不同版本返回不同结构)
  if (indicators.length === 0 && (data.sub_results || data.SubResults)) {
      indicators = data.sub_results || data.SubResults
  }

  // 映射到前端结果
  if (indicators.length > 0) {
      results.value = indicators.map(ind => ({
          name: ind.Name || ind.name,
          profit: Number(ind.Value !== undefined ? ind.Value : (ind.raw_value || 0)).toFixed(2),
          status: (ind.Status || ind.status || 'FAIL').toLowerCase(),
          desc: ind.Calculation || ''
      }))
  } else {
      // 兜底模拟数据 (防止页面空白)
      results.value = []
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
