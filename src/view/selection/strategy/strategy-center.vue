<template>
  <div class="container">
    <div class="header">
      <div class="title-section">
        <div class="title">策略执行中心</div>
        <div class="subtitle">选择合适的策略模型对产品进行全方位评估</div>
      </div>
      <div class="product-info" v-if="currentProduct">
        <span class="label">当前分析对象:</span>
        <el-tag effect="dark" size="large" class="product-tag">{{ currentProduct.product_name }}</el-tag>
        <span class="asin">{{ currentProduct.asin }}</span>
        <el-button link type="primary" size="small" @click="changeProduct">切换</el-button>
      </div>
    </div>

    <!-- 策略分类筛选 -->
    <div class="filter-box">
      <div class="filter-tabs">
        <div 
          v-for="cat in categories" 
          :key="cat.value"
          :class="['filter-item', { active: activeCategory === cat.value }]"
          @click="activeCategory = cat.value"
        >
          {{ cat.label }}
        </div>
      </div>
    </div>

    <!-- 策略卡片列表 -->
    <el-row :gutter="24" class="strategy-list">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in filteredStrategies" :key="item.code">
        <div class="strategy-card" :class="item.type.toLowerCase()" @click="handleExecute(item)">
          <div class="card-status-bar"></div>
          <div class="card-content">
            <div class="card-header">
              <div class="code-badge">{{ item.code }}</div>
              <div class="priority-badge" :class="item.priority.toLowerCase()">{{ item.priority }}</div>
            </div>
            <div class="strategy-name">{{ item.name }}</div>
            <p class="desc">{{ item.description }}</p>
            <div class="card-footer">
              <el-tag size="small" :type="getTypeTag(item.type)" effect="plain" class="type-tag">{{ item.typeLabel }}</el-tag>
              <div class="action-icon">
                <i class="el-icon-right"></i>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Product, Strategy } from '@/lin/model/selection'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const activeCategory = ref('All')
const loading = ref(false)

const currentProduct = ref(null)

const categories = [
  { label: '全部策略', value: 'All' },
  { label: '评分型', value: 'Scoring' },
  { label: '判定型', value: 'Decision' },
  { label: '财务型', value: 'Financial' },
  { label: '风险型', value: 'RiskDetection' },
  { label: '推荐型', value: 'Recommendation' }
]

const strategies = [
  { code: 'S01', name: '四层评估体系', type: 'Scoring', typeLabel: '评分型', priority: 'P0', description: '从市场、产品、供应链、财务四个维度进行全方位深度评估。', path: 'evaluation' },
  { code: 'S02', name: '40题自诊系统', type: 'Decision', typeLabel: '判定型', priority: 'P0', description: '通过40个核心问题快速判定产品的可行性与潜力。', path: 'diagnosis' },
  { code: 'S03', name: '完整利润模型', type: 'Financial', typeLabel: '财务型', priority: 'P0', description: '精细化的成本拆解与多场景利润预测，包含敏感性分析。', path: 'profit' },
  { code: 'S04', name: '36项风险预警', type: 'RiskDetection', typeLabel: '风险型', priority: 'P0', description: '覆盖版权、安全、政策、物流等36个维度的风险排查。', path: 'risk' },
  { code: 'S05', name: '11维度评估', type: 'Scoring', typeLabel: '评分型', priority: 'P1', description: '更细粒度的11个维度加权评分模型。', path: 'scoring' },
  { code: 'S06', name: '五维选品模型', type: 'Scoring', typeLabel: '评分型', priority: 'P1', description: '经典的五维度分析法。', path: 'scoring' },
  { code: 'S07', name: '赛道市场评估', type: 'Scoring', typeLabel: '评分型', priority: 'P1', description: '评估整个类目赛道的健康度与切入机会。', path: 'scoring' },
  { code: 'S08', name: 'TOP20策略库', type: 'Recommendation', typeLabel: '推荐型', priority: 'P1', description: '根据产品特征自动匹配最优的运营打法建议。', path: 'top20' },
  { code: 'S09', name: '蓝海深度识别', type: 'Recommendation', typeLabel: '推荐型', priority: 'P1', description: '深度挖掘市场空白点与机会区域。', path: 'blue-ocean' },
  { code: 'S13', name: '爆点识别引擎', type: 'Decision', typeLabel: '判定型', priority: 'P1', description: '识别产品爆发潜力。', path: 'explosive' },
  { code: 'S14', name: '20节点决策树', type: 'Decision', typeLabel: '判定型', priority: 'P0', description: '一票否决制逻辑判定。', path: 'decision-tree' },
  { code: 'S15', name: '竞品分析矩阵', type: 'Decision', typeLabel: '判定型', priority: 'P1', description: '差异化突围机会分析。', path: 'competitor' },
  { code: 'S11', name: '企业定位评估', type: 'Scoring', typeLabel: '评分型', priority: 'P0', description: '评估企业自身实力。', path: '../enterprise' },
  { code: 'S18', name: '压力测试', type: 'Financial', typeLabel: '财务型', priority: 'P2', description: '模拟极端条件下产品的存活能力。', path: 'stress-test' }
]

const filteredStrategies = computed(() => {
  if (activeCategory.value === 'All') return strategies
  return strategies.filter(s => s.type === activeCategory.value)
})

const loadProduct = async (id) => {
    try {
        const res = await Product.getProduct(id)
        currentProduct.value = res
    } catch (e) {
        console.error(e)
    }
}

const handleExecute = (strategy) => {
    const productId = route.query.productId || 1
    let path = strategy.path
    if (path.startsWith('../')) {
        router.push(path.replace('../', '/selection/'))
        return
    }
    
    router.push({
        path: `/selection/strategy/${path}`,
        query: { productId, code: strategy.code }
    })
}

const changeProduct = () => {
  router.push('/selection/product/product-list')
}

onMounted(() => {
  const productId = route.query.productId
  if (productId) {
      loadProduct(productId)
  }
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
    align-items: flex-end;
    margin-bottom: 32px;

    .title-section {
      .title { font-size: 24px; font-weight: 600; color: #1f2f3d; margin-bottom: 8px; }
      .subtitle { font-size: 14px; color: #909399; }
    }

    .product-info {
        background: #fff;
        padding: 8px 16px;
        border-radius: 20px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        display: flex;
        align-items: center;
        .label { font-size: 13px; color: #606266; margin-right: 8px; }
        .product-tag { margin-right: 8px; font-weight: 500; }
        .asin { font-size: 13px; color: #909399; font-family: monospace; margin-right: 12px; }
    }
  }

  .filter-box {
      margin-bottom: 24px;
      .filter-tabs {
        display: inline-flex;
        background: #fff;
        padding: 4px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        
        .filter-item {
          padding: 8px 24px;
          cursor: pointer;
          border-radius: 6px;
          font-size: 14px;
          color: #606266;
          transition: all 0.3s;
          
          &:hover { color: #409eff; }
          
          &.active {
            background: #409eff;
            color: #fff;
            font-weight: 500;
            box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
          }
        }
      }
  }

  .strategy-list {
      .strategy-card {
          background: #fff;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 24px;
          border: 1px solid #f0f2f5;
          height: 200px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);

          &:hover {
              transform: translateY(-5px);
              box-shadow: 0 12px 24px rgba(0,0,0,0.08);
              .action-icon { opacity: 1; transform: translateX(0); }
          }

          .card-status-bar {
              height: 4px;
              width: 100%;
              position: absolute;
              top: 0;
              left: 0;
          }

          &.scoring .card-status-bar { background: #409eff; }
          &.decision .card-status-bar { background: #67c23a; }
          &.financial .card-status-bar { background: #e6a23c; }
          &.riskdetection .card-status-bar { background: #f56c6c; }
          &.recommendation .card-status-bar { background: #909399; }

          .card-content {
              padding: 24px;
              height: 100%;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;

              .card-header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  margin-bottom: 16px;

                  .code-badge {
                      font-family: 'DIN Alternate', sans-serif;
                      font-size: 16px;
                      font-weight: bold;
                      color: #303133;
                      background: #f5f7fa;
                      padding: 2px 8px;
                      border-radius: 4px;
                  }

                  .priority-badge {
                      font-size: 12px;
                      padding: 2px 6px;
                      border-radius: 4px;
                      &.p0 { background: #fff0f0; color: #f56c6c; }
                      &.p1 { background: #fff8e6; color: #e6a23c; }
                      &.p2 { background: #f0f9eb; color: #67c23a; }
                  }
              }

              .strategy-name {
                  font-size: 18px;
                  font-weight: 600;
                  color: #303133;
                  margin-bottom: 12px;
              }

              .desc {
                  font-size: 13px;
                  color: #909399;
                  line-height: 1.6;
                  flex: 1;
                  margin-bottom: 16px;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                  overflow: hidden;
              }

              .card-footer {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  border-top: 1px solid #f5f7fa;
                  padding-top: 16px;

                  .action-icon {
                      color: #409eff;
                      opacity: 0;
                      transform: translateX(-10px);
                      transition: all 0.3s;
                      font-weight: bold;
                  }
              }
          }
      }
  }
}
</style>
