<template>
  <div class="container" v-loading="executing" element-loading-text="策略模型正在运算中...">
    <div class="header-actions">
      <div class="left">
        <el-button icon="el-icon-back" circle @click="handleBack"></el-button>
        <div class="title-group">
          <div class="title">{{ isEdit ? '编辑产品' : '产品详情' }}</div>
          <div class="subtitle" v-if="form.asin">{{ form.productName }} ({{ form.asin }})</div>
        </div>
      </div>
      <div class="right">
        <el-button type="success" @click="dialogVisible = true" icon="el-icon-video-play">运行策略</el-button>
        <el-button type="primary" @click="handleSave" icon="el-icon-check">保存变更</el-button>
      </div>
    </div>

    <div class="content-wrapper">
      <el-tabs v-model="activeTab" class="detail-tabs" type="card">
        
        <!-- 基础信息 Tab -->
        <el-tab-pane label="基础信息" name="basic">
          <div class="form-card">
            <div class="card-title">基本资料</div>
            <el-form :model="form" label-width="100px" class="form-section">
              <el-row :gutter="40">
                <el-col :span="12">
                  <el-form-item label="产品名称" required>
                    <el-input v-model="form.productName" placeholder="请输入产品名称" size="large"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="ASIN" required>
                    <el-input v-model="form.asin" placeholder="请输入ASIN" size="large"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="所属类目" required>
                    <el-input v-model="form.category" placeholder="请输入类目"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="品牌归属" required>
                    <el-input v-model="form.brand" placeholder="请输入品牌"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 市场数据 Tab -->
        <el-tab-pane label="市场分析" name="market">
           <div class="form-card">
            <div class="card-title">市场核心指标</div>
            <el-form :model="form" label-width="140px" class="form-section">
              <el-row :gutter="30">
                <el-col :span="8">
                  <el-form-item label="月搜索量">
                    <el-input-number v-model="form.monthlySearchVolume" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="年增长率">
                    <el-input v-model="form.searchGrowthRate" placeholder="0">
                        <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="竞品数量">
                    <el-input-number v-model="form.competitorCount" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                
                <el-col :span="8">
                  <el-form-item label="头部集中度(CR3)">
                    <el-input v-model="form.topConcentration" placeholder="0">
                        <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="新品占比">
                    <el-input v-model="form.newProductRatio" placeholder="0">
                        <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                   <el-form-item label="季节性指数">
                    <el-input-number v-model="form.seasonality" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="平均评分">
                    <el-rate v-model="form.averageRating" allow-half show-score text-color="#ff9900" />
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="Review总数">
                    <el-input-number v-model="form.totalReviews" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
           </div>
        </el-tab-pane>

        <!-- 成本财务 Tab -->
        <el-tab-pane label="成本财务" name="finance">
           <div class="form-card">
            <div class="card-title">财务模型参数</div>
            <el-form :model="form" label-width="140px" class="form-section">
              <el-row :gutter="30">
                 <el-col :span="8">
                  <el-form-item label="目标售价">
                    <el-input-number v-model="form.targetPrice" :precision="2" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="采购成本">
                    <el-input-number v-model="form.purchaseCost" :precision="2" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="头程运费(单件)">
                    <el-input-number v-model="form.shippingCost" :precision="2" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="FBA费用">
                    <el-input-number v-model="form.fbaCost" :precision="2" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="广告CPC">
                    <el-input-number v-model="form.advertisingCPC" :precision="2" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="预期转化率">
                    <el-input v-model="form.conversionRate" placeholder="0">
                        <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="预期点击率">
                    <el-input v-model="form.clickThroughRate" placeholder="0">
                        <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="单品重量">
                    <el-input v-model="form.weightKg" placeholder="0">
                        <template #append>kg</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="单品体积">
                    <el-input v-model="form.volumeCbm" placeholder="0">
                        <template #append>cbm</template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
             </el-form>
           </div>
        </el-tab-pane>

        <!-- 供应链 Tab -->
        <el-tab-pane label="供应链" name="supply">
           <div class="form-card">
            <div class="card-title">供应能力评估</div>
             <el-form :model="form" label-width="140px" class="form-section">
              <el-row :gutter="30">
                 <el-col :span="8">
                  <el-form-item label="供应商数量">
                    <el-input-number v-model="form.supplierCount" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="稳定性评分">
                    <el-slider v-model="form.supplierStability" :min="0" :max="100"></el-slider>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="生产交期">
                    <el-input v-model="form.leadTimeDays" placeholder="0">
                        <template #append>天</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="起订量(MOQ)">
                    <el-input-number v-model="form.moq" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="价格波动率">
                    <el-input v-model="form.priceVolatility" placeholder="0">
                        <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
             </el-form>
           </div>
        </el-tab-pane>

        <!-- 风险合规 Tab -->
        <el-tab-pane label="风险合规" name="risk">
           <div class="form-card">
            <div class="card-title">合规与风控</div>
             <el-form :model="form" label-width="140px" class="form-section">
              <el-row :gutter="30">
                <el-col :span="12">
                  <el-form-item label="侵权风险">
                    <el-radio-group v-model="form.infringementRisk">
                      <el-radio-button label="High">高</el-radio-button>
                      <el-radio-button label="Medium">中</el-radio-button>
                      <el-radio-button label="Low">低</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                 <el-col :span="12">
                  <el-form-item label="认证要求">
                    <el-radio-group v-model="form.certificationLevel">
                      <el-radio-button label="Strict">严格</el-radio-button>
                      <el-radio-button label="Normal">一般</el-radio-button>
                      <el-radio-button label="Loose">宽松</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                 <el-col :span="12">
                  <el-form-item label="政策风险评分">
                    <el-slider v-model="form.policyRisk" :min="0" :max="1" :step="0.1" show-stops></el-slider>
                  </el-form-item>
                </el-col>
                 <el-col :span="12">
                  <el-form-item label="预期退货率">
                     <el-input v-model="form.returnRate" placeholder="0">
                        <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
             </el-form>
           </div>
        </el-tab-pane>

        <!-- 策略结果 Tab -->
        <el-tab-pane label="策略结果" name="strategies">
          <div class="form-card">
            <div class="card-title">
              已执行策略评分汇总
              <el-button type="text" icon="el-icon-refresh" @click="refreshStrategies" style="float: right">刷新</el-button>
            </div>
            
            <el-table :data="strategyResults" border style="width: 100%" v-if="strategyResults.length > 0">
              <el-table-column prop="code" label="策略编号" width="100" />
              <el-table-column prop="name" label="策略名称" width="200" />
              <el-table-column prop="score" label="评分/结果" width="120">
                <template #default="scope">
                  <span v-if="scope.row.score" :style="{ color: getScoreColor(scope.row.score), fontWeight: 'bold' }">
                    {{ scope.row.score }} 分
                  </span>
                  <el-tag v-else :type="scope.row.result === 'GO' ? 'success' : 'warning'">{{ scope.row.result }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="executedAt" label="执行时间" width="180" />
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button link type="primary" @click="goToStrategyDetail(scope.row)">查看详细计算明细</el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-empty v-else description="暂无策略执行记录">
              <el-button type="primary" @click="dialogVisible = true">立即运行全面评估</el-button>
            </el-empty>
            
            <div class="summary-tip" style="margin-top: 20px; color: #909399; font-size: 13px;" v-if="strategyResults.length > 0">
              <i class="el-icon-info"></i> 评分基于当前产品录入的 30 个核心字段计算，数据变动后建议重新运行策略。
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 策略执行弹窗 -->
    <el-dialog v-model="dialogVisible" title="选择要执行的策略" width="500px">
      <div style="margin-bottom: 20px;">
        <el-alert title="建议在完善市场和财务数据后执行，以获得准确结果。" type="info" show-icon :closable="false" />
      </div>
      <el-radio-group v-model="executionType" style="display: flex; flex-direction: column; gap: 15px;">
        <el-radio label="all" border>
          <span style="font-weight: bold;">全量评估 (推荐)</span>
          <br><span style="font-size: 12px; color: #909399;">执行所有可用策略 (S01-S18)，生成完整报告</span>
        </el-radio>
        <el-radio label="s01" border>
          <span style="font-weight: bold;">仅 S01 四层评估</span>
          <br><span style="font-size: 12px; color: #909399;">快速检查 MPSF 四大维度得分</span>
        </el-radio>
        <el-radio label="s03" border>
          <span style="font-weight: bold;">仅 S03 利润模型</span>
          <br><span style="font-size: 12px; color: #909399;">重新计算 ROI 和成本结构</span>
        </el-radio>
      </el-radio-group>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmExecution">开始执行</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const activeTab = ref('basic')
const isEdit = ref(false)
const executing = ref(false)
const dialogVisible = ref(false)
const executionType = ref('all')

// 模拟策略结果数据
const strategyResults = ref([
  { code: 'S01', name: '四层评估体系', score: 85.5, executedAt: '2025-12-21 14:30', path: 'evaluation' },
  { code: 'S02', name: '40题自诊系统', score: 320, executedAt: '2025-12-21 14:35', path: 'diagnosis' },
  { code: 'S03', name: '完整利润模型', result: 'GO', score: null, executedAt: '2025-12-21 14:40', path: 'profit' }
])

const form = reactive({
  // Basic
  productName: '',
  asin: '',
  category: '',
  brand: '',
  // Market
  monthlySearchVolume: 0,
  searchGrowthRate: 0,
  competitorCount: 0,
  topConcentration: 0,
  newProductRatio: 0,
  seasonality: 0,
  averageRating: 0,
  totalReviews: 0,
  // Finance
  targetPrice: 0,
  purchaseCost: 0,
  shippingCost: 0,
  fbaCost: 0,
  advertisingCPC: 0,
  conversionRate: 0,
  clickThroughRate: 0,
  weightKg: 0,
  volumeCbm: 0,
  // Supply
  supplierCount: 0,
  supplierStability: 0,
  leadTimeDays: 0,
  moq: 0,
  priceVolatility: 0,
  // Risk
  infringementRisk: 'Low',
  certificationLevel: 'Normal',
  policyRisk: 0,
  returnRate: 0
})

onMounted(() => {
  const id = route.params.id
  if (id && id !== ':id') {
    isEdit.value = true
    loadData(id)
  }
  
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
})

const loadData = (id) => {
  console.log('Load data for', id)
  // Mock loading
  if(id === '1') {
      form.productName = '瑜伽垫 Pro (加厚防滑)'
      form.asin = 'B08XXXXXXX'
      form.category = '运动户外'
      form.monthlySearchVolume = 52000
      form.targetPrice = 29.99
      form.averageRating = 4.2
  }
}

const handleBack = () => {
  router.back()
}

const handleSave = () => {
  console.log('Save form', form)
  ElMessage.success('保存成功')
}

// 修改后的执行逻辑
const confirmExecution = () => {
  dialogVisible.value = false
  executing.value = true
  
  // 模拟 API 调用延迟
  setTimeout(() => {
    executing.value = false
    const now = dayjs().format('YYYY-MM-DD HH:mm')
    
    if (executionType.value === 'all' || executionType.value === 's01') {
      const idx = strategyResults.value.findIndex(i => i.code === 'S01')
      if(idx > -1) strategyResults.value.splice(idx, 1)
      
      strategyResults.value.unshift({ 
        code: 'S01', 
        name: '四层评估体系', 
        score: (Math.random() * 10 + 80).toFixed(1), // 随机 80-90 分
        executedAt: now, 
        path: 'evaluation' 
      })
    }
    
    if (executionType.value === 'all' || executionType.value === 's03') {
       const idx = strategyResults.value.findIndex(i => i.code === 'S03')
       if(idx > -1) strategyResults.value.splice(idx, 1)

       strategyResults.value.unshift({ 
        code: 'S03', 
        name: '完整利润模型', 
        result: 'GO', 
        score: null, 
        executedAt: now, 
        path: 'profit' 
      })
    }

    ElMessage.success('策略执行完成，结果已更新')
    activeTab.value = 'strategies'
  }, 1500)
}

const handleRunStrategy = () => {
    dialogVisible.value = true
}

const getScoreColor = (score) => {
    if (score >= 90 || score >= 300) return '#67c23a'
    if (score >= 75 || score >= 240) return '#e6a23c'
    return '#f56c6c'
}

const goToStrategyDetail = (row) => {
    router.push({
        path: `/selection/strategy/${row.path}`,
        query: { productId: route.params.id, code: row.code }
    })
}

const refreshStrategies = () => {
    ElMessage.info('已刷新最新数据')
}
</script>

<style lang="scss" scoped>
.container {
  padding: 24px;
  background-color: #f7f8fa;
  min-height: calc(100vh - 80px);

  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    background: #fff;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);

    .left {
      display: flex;
      align-items: center;
      .title-group {
        margin-left: 16px;
        .title { font-size: 18px; font-weight: 600; color: #303133; }
        .subtitle { font-size: 13px; color: #909399; margin-top: 4px; }
      }
    }
  }

  .content-wrapper {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);
    min-height: 600px;
    
    .form-card {
        padding: 0 20px;
        .card-title {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 24px;
            padding-left: 12px;
            border-left: 4px solid #409eff;
        }
    }
  }
}

:deep(.el-tabs__header) {
    margin-bottom: 32px;
}
</style>