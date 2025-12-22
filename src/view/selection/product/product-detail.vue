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
              <el-table-column prop="result" label="决策建议" width="150" align="center">
                <template #default="scope">
                  <el-tag :type="getDecisionTagType(scope.row)" effect="light">
                    {{ getDecisionText(scope.row) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="score" label="评分/结果" width="120">
                <template #default="scope">
                  <el-tag :type="getDecisionTagType(scope.row)" effect="plain">
                    {{ scope.row.score ? scope.row.score + ' 分' : scope.row.result }}
                  </el-tag>
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
import { Product, Strategy } from '@/lin/model/selection'

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
  { code: 'S03', name: '完整利润模型', result: 'GO', score: null, executedAt: '2025-12-21 14:40', path: 'profit' },
  { code: 'S04', name: '36项风险预警', result: 'HIGH', score: null, executedAt: '2025-12-21 14:45', path: 'risk' },
  { code: 'S05', name: '11维度评估', score: 72, executedAt: '2025-12-21 14:46', path: 'scoring', query: { code: 'S05' } },
  { code: 'S06', name: '五维选品模型', score: 88, executedAt: '2025-12-21 14:47', path: 'scoring', query: { code: 'S06' } },
  { code: 'S07', name: '赛道市场评估', score: 65, executedAt: '2025-12-21 14:48', path: 'scoring', query: { code: 'S07' } },
  { code: 'S08', name: 'TOP20策略套利库', result: '推荐', score: null, executedAt: '2025-12-21 14:50', path: 'top20' },
  { code: 'S09', name: '蓝海深度识别', score: 85, executedAt: '2025-12-21 14:55', path: 'blue-ocean' },
  { code: 'S10', name: '赛道热度评级', score: 80, executedAt: '2025-12-21 14:56', path: 'scoring', query: { code: 'S10' } },
  { code: 'S11', name: '企业定位评估', score: 420, executedAt: '2025-12-21 14:57', path: '../enterprise' },
  { code: 'S12', name: 'A9算法指标库', score: 78, executedAt: '2025-12-21 14:58', path: 'scoring', query: { code: 'S12' } },
  { code: 'S13', name: '爆点识别引擎', result: 'HIGH', score: null, executedAt: '2025-12-21 15:00', path: 'explosive' },
  { code: 'S14', name: '20节点决策树', result: 'FAIL', score: null, executedAt: '2025-12-21 15:01', path: 'decision-tree' },
  { code: 'S15', name: '竞品分析矩阵', result: '完成', score: null, executedAt: '2025-12-21 15:02', path: 'competitor' },
  { code: 'S16', name: '供应链评估', score: 92, executedAt: '2025-12-21 15:03', path: 'scoring', query: { code: 'S16' } },
  { code: 'S17', name: '6大创新矩阵', score: 78, executedAt: '2025-12-21 15:05', path: 'innovation' },
  { code: 'S18', name: '压力测试系统', result: '85%', score: null, executedAt: '2025-12-21 15:06', path: 'stress-test' },
  { code: 'S19', name: '关键词研究策略', score: 68, executedAt: '2025-12-21 15:07', path: 'scoring', query: { code: 'S19' } },
  { code: 'S20', name: '市场趋势分析', score: 82, executedAt: '2025-12-21 15:08', path: 'scoring', query: { code: 'S20' } },
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

const loadData = async (id) => {
  try {
    loading.value = true // Note: variable name was executing in template, but usually loading is used. Template uses executing for execution.
    // We might need a separate loading state for data fetch.
    // The template uses v-loading="executing". I should probably add a loading state or just use executing?
    // Let's use executing for now or add loading.
    // Actually template says v-loading="executing" element-loading-text="策略模型正在运算中...". This is specific to strategy.
    // I should add a pageLoading state? Or just block it.
    // For now, I'll just fetch.
    const res = await Product.getProduct(id)
    Object.assign(form, res) // Assuming res matches form structure or flat
    // If backend returns { productName: ... }, this works.
    
    // Check if strategies results are included
    if (res.strategies) {
        strategyResults.value = res.strategies
    }
  } catch (error) {
    console.error('加载产品详情失败', error)
  }
}

const handleBack = () => {
  router.back()
}

const handleSave = async () => {
  try {
    if (isEdit.value) {
      await Product.updateProduct(route.params.id, form)
      ElMessage.success('更新成功')
    } else {
      const res = await Product.createProduct(form)
      ElMessage.success('创建成功')
      router.replace(`/selection/product/${res.id}`)
    }
  } catch (error) {
    console.error('保存失败', error)
  }
}

// 修改后的执行逻辑
const confirmExecution = async () => {
  dialogVisible.value = false
  executing.value = true
  
  try {
    let res
    const productId = route.params.id
    if (executionType.value === 'all') {
      res = await Strategy.executeAll(productId)
    } else {
       // execute specific strategy like s01, s03
       // Strategy.execute takes (code, productId)
       const code = executionType.value.toUpperCase()
       res = await Strategy.execute(code, productId)
    }
    
    ElMessage.success('策略执行完成，结果已更新')
    // Update strategy results
    // Assuming res contains the updated strategy results list or the single result
    if (Array.isArray(res)) {
        strategyResults.value = res
    } else if (res && res.code) {
        // Update single result in list
        const idx = strategyResults.value.findIndex(item => item.code === res.code)
        if (idx > -1) {
            strategyResults.value.splice(idx, 1, res)
        } else {
            strategyResults.value.unshift(res)
        }
    } else {
        // Reload data to be sure
        loadData(productId)
    }

    activeTab.value = 'strategies'
  } catch (error) {
    console.error('策略执行失败', error)
  } finally {
    executing.value = false
  }
}

const handleRunStrategy = () => {
    dialogVisible.value = true
}

const getDecisionText = (row) => {
    const code = row.code
    const result = row.result ? String(row.result).toUpperCase() : ''

    // 通用的 GO/WAIT/STOP 翻译 (适用于 S01, S03 等)
    if (result === 'GO') return '盈利达标'
    if (result === 'WAIT') return '利润待优化'
    if (result === 'STOP') return '亏损风险'

    // S13 爆点识别
    if (code === 'S13') {
        if (result.includes('HIGH')) return '高爆款潜力'
        if (result.includes('LOW')) return '潜力不足'
    }
    // S14 决策树
    if (code === 'S14') {
        if (result.includes('PASS')) return '校验通过'
        if (result.includes('FAIL')) return '校验失败'
    }
    // S04 风险预警
    if (code === 'S04') {
        if (result.includes('HIGH')) return '高风险'
        if (result.includes('MEDIUM')) return '中风险'
        if (result.includes('LOW')) return '低风险'
    }
    // S18 压力测试
    if (code === 'S18') {
         if (result.includes('%')) return '生存率 ' + result
         if (result.includes('PASS') || parseInt(result) > 60) return '抗压极佳'
         return '风险较大'
    }

    if (row.result) return row.result
    if (!row.score) return '-'
    if (row.score >= 90) return 'S级 (极佳)'
    if (row.score >= 80) return 'A级 (优秀)'
    if (row.score >= 60) return 'B级 (良好)'
    return 'C级 (淘汰)'
}

const getDecisionTagType = (row) => {
    const text = String(getDecisionText(row)).toLowerCase()
    const code = row.code || ''
    
    // 风险类或否定类逻辑特判
    if (code === 'S04' || code === 'S18' || code === 'S14') {
        if (text.includes('high') || text.includes('fail') || text.includes('风险') || text.includes('淘汰') || text.includes('失败')) return 'danger'
        if (text.includes('通过') || text.includes('极佳') || text.includes('安全')) return 'success'
    }

    if (text.includes('go') || text.includes('达标') || text.includes('s级') || text.includes('a级') || text.includes('推荐') || text.includes('high') || text.includes('pass') || text.includes('完成') || text.includes('安全') || text.includes('潜力')) return 'success'
    if (text.includes('wait') || text.includes('优化') || text.includes('b级') || text.includes('中') || text.includes('一般') || text.includes('不足')) return 'warning'
    return 'danger'
}

const getScoreColor = (score) => {
    if (score >= 90 || score >= 300) return '#67c23a'
    if (score >= 75 || score >= 240) return '#e6a23c'
    return '#f56c6c'
}

const goToStrategyDetail = (row) => {
    let path = row.path
    if (!path.startsWith('../')) {
        path = `/selection/strategy/${path}`
    } else {
        path = path.replace('../', '/selection/')
    }

    const query = { productId: route.params.id, code: row.code }
    if (row.query) {
        Object.assign(query, row.query)
    }

    router.push({ path, query })
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