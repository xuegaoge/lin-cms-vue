<template>
  <div class="container" v-loading="executing || loading" :element-loading-text="executing ? '策略模型正在运算中...' : '加载中...'">
    <div class="header-actions">
      <div class="left">
        <el-button icon="Back" circle @click="handleBack"></el-button>
        <div class="title-group">
          <div class="title">{{ isEdit ? '编辑产品' : '产品详情' }}</div>
          <div class="subtitle" v-if="form.asin">{{ form.product_name }} ({{ form.asin }})</div>
        </div>
      </div>
      <div class="right">
        <el-button type="success" @click="dialogVisible = true" icon="VideoPlay" size="large">运行策略</el-button>
        <el-button type="primary" @click="handleSave" icon="Check" size="large">保存变更</el-button>
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
                    <el-input v-model="form.product_name" placeholder="请输入产品名称" size="large"></el-input>
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
                    <el-input-number v-model="form.monthly_search_volume" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="年增长率">
                    <el-input v-model="form.search_growth_rate" placeholder="0">
                        <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="竞品数量">
                    <el-input-number v-model="form.competitor_count" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                
                <el-col :span="8">
                  <el-form-item label="头部集中度(CR3)">
                    <el-input v-model="form.top_concentration" placeholder="0">
                        <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="新品占比">
                    <el-input v-model="form.new_product_ratio" placeholder="0">
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
                    <el-rate v-model="form.average_rating" allow-half show-score text-color="#ff9900" />
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="Review总数">
                    <el-input-number v-model="form.total_reviews" :min="0" style="width:100%" controls-position="right"></el-input-number>
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
                    <el-input-number v-model="form.target_price" :precision="2" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="采购成本">
                    <el-input-number v-model="form.purchase_cost" :precision="2" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="头程运费(单件)">
                    <el-input-number v-model="form.shipping_cost" :precision="2" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="FBA费用">
                    <el-input-number v-model="form.fba_cost" :precision="2" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="广告CPC">
                    <el-input-number v-model="form.advertising_cpc" :precision="2" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="预期转化率">
                    <el-input v-model="form.conversion_rate" placeholder="0">
                        <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="预期点击率">
                    <el-input v-model="form.click_through_rate" placeholder="0">
                        <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="单品重量">
                    <el-input v-model="form.weight_kg" placeholder="0">
                        <template #append>kg</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                 <el-col :span="8">
                  <el-form-item label="单品体积">
                    <el-input v-model="form.volume_cbm" placeholder="0">
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
                    <el-input-number v-model="form.supplier_count" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="稳定性评分">
                    <el-slider v-model="form.supplier_stability" :min="0" :max="100"></el-slider>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="生产交期">
                    <el-input v-model="form.lead_time_days" placeholder="0">
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
                    <el-input v-model="form.price_volatility" placeholder="0">
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
                    <el-radio-group v-model="form.infringement_risk">
                      <el-radio-button label="High">高</el-radio-button>
                      <el-radio-button label="Medium">中</el-radio-button>
                      <el-radio-button label="Low">低</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                 <el-col :span="12">
                  <el-form-item label="认证要求">
                    <el-radio-group v-model="form.certification_level">
                      <el-radio-button label="Strict">严格</el-radio-button>
                      <el-radio-button label="Normal">一般</el-radio-button>
                      <el-radio-button label="Loose">宽松</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                 <el-col :span="12">
                  <el-form-item label="政策风险评分">
                    <el-slider v-model="form.policy_risk" :min="0" :max="1" :step="0.1" show-stops></el-slider>
                  </el-form-item>
                </el-col>
                 <el-col :span="12">
                  <el-form-item label="预期退货率">
                     <el-input v-model="form.return_rate" placeholder="0">
                        <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
             </el-form>
           </div>
        </el-tab-pane>

        <!-- 产品属性 Tab -->
        <el-tab-pane label="产品属性" name="attributes">
          <div class="form-card">
            <div class="card-title">产品特征</div>
            <el-form label-width="140px">
              <el-row :gutter="30">
                <el-col :span="12">
                  <el-form-item label="材质">
                    <el-input v-model="form.material" placeholder="请输入材质"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="变体数量">
                    <el-input-number v-model="form.variant_count" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否易碎">
                    <el-switch v-model="form.is_fragile"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否液体">
                    <el-switch v-model="form.is_liquid"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否危险品">
                    <el-switch v-model="form.is_dangerous"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="产品生命周期">
                    <el-input v-model="form.product_lifecycle" placeholder="0">
                      <template #append>月</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="复购率潜力">
                    <el-input v-model="form.repurchase_rate" placeholder="0">
                      <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 竞争分析 Tab -->
        <el-tab-pane label="竞争分析" name="competition">
          <div class="form-card">
            <div class="card-title">竞争态势</div>
            <el-form label-width="160px">
              <el-row :gutter="30">
                <el-col :span="12">
                  <el-form-item label="TOP10有Amazon Choice">
                    <el-switch v-model="form.has_amazon_choice"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="BSR TOP10排名">
                    <el-input-number v-model="form.bsr_top10" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="BSR TOP50排名">
                    <el-input-number v-model="form.bsr_top50" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="长尾关键词占比">
                    <el-input v-model="form.long_tail_keyword_ratio" placeholder="0">
                      <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="新品成功率">
                    <el-input v-model="form.new_product_success_rate" placeholder="0">
                      <template #append>%</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="未回答的QA数量">
                    <el-input-number v-model="form.qa_unanswered" :min="0" style="width:100%" controls-position="right"></el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 差异化 Tab -->
        <el-tab-pane label="差异化" name="differentiation">
          <div class="form-card">
            <div class="card-title">差异化优势</div>
            <el-form label-width="160px">
              <el-row :gutter="30">
                <el-col :span="24">
                  <el-form-item label="差异化卖点数量">
                    <el-input-number v-model="form.differentiation_points" :min="0" :max="10" style="width:100%" controls-position="right"></el-input-number>
                    <div style="font-size: 12px; color: #909399; margin-top: 4px;">建议3-10个差异化卖点</div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="功能差异评分">
                    <el-rate v-model="form.function_diff" :max="10" show-score text-color="#409eff" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="材质差异评分">
                    <el-rate v-model="form.material_diff" :max="10" show-score text-color="#409eff" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="设计差异评分">
                    <el-rate v-model="form.design_diff" :max="10" show-score text-color="#409eff" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="包装差异评分">
                    <el-rate v-model="form.packaging_diff" :max="10" show-score text-color="#409eff" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-alert 
                title="差异化评分说明" 
                type="info" 
                :closable="false"
                style="margin-top: 20px;">
                <template #default>
                  <div style="font-size: 13px; line-height: 1.6;">
                    <p style="margin: 0 0 8px 0;"><strong>评分标准 (0-10分):</strong></p>
                    <ul style="margin: 0; padding-left: 20px;">
                      <li>0-3分: 与竞品高度相似,无明显差异</li>
                      <li>4-6分: 有一定差异,但不够突出</li>
                      <li>7-8分: 差异明显,具有竞争优势</li>
                      <li>9-10分: 独特创新,市场领先</li>
                    </ul>
                  </div>
                </template>
              </el-alert>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 策略结果 Tab -->
        <el-tab-pane label="策略结果" name="strategies">
          <div class="form-card">
            <div class="card-title">
              已执行策略评分汇总
              <el-button type="text" icon="Refresh" @click="refreshStrategies" style="float: right">刷新数据</el-button>
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
                    {{ (scope.row.score !== null && scope.row.score !== undefined) ? scope.row.score + ' 分' : scope.row.result }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="executedAt" label="执行时间" width="180" />
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button link type="primary" @click="goToStrategyDetail(scope.row)">查看计算明细</el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-empty v-else description="暂无策略执行记录">
              <el-button type="primary" @click="dialogVisible = true" icon="VideoPlay">立即运行全面评估</el-button>
            </el-empty>
            
            <div class="summary-tip" style="margin-top: 20px; color: #909399; font-size: 13px; display: flex; align-items: center;" v-if="strategyResults.length > 0">
              <el-icon style="margin-right: 4px;"><InfoFilled /></el-icon> 评分基于当前产品录入的 30 个核心字段计算，数据变动后建议重新运行策略。
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
const loading = ref(false)
const dialogVisible = ref(false)
const executionType = ref('all')

// 策略结果数据
const strategyResults = ref([])

const form = reactive({
  // Basic
  product_name: '',
  asin: '',
  category: '',
  brand: '',
  // Market
  monthly_search_volume: 0,
  search_growth_rate: 0,
  competitor_count: 0,
  top_concentration: 0,
  new_product_ratio: 0,
  seasonality: 0,
  average_rating: 0,
  total_reviews: 0,
  // Finance
  target_price: 0,
  purchase_cost: 0,
  shipping_cost: 0,
  fba_cost: 0,
  advertising_cpc: 0,
  conversion_rate: 0,
  click_through_rate: 0,
  weight_kg: 0,
  volume_cbm: 0,
  // Supply
  supplier_count: 0,
  supplier_stability: 0,
  lead_time_days: 0,
  moq: 0,
  price_volatility: 0,
  // Risk
  infringement_risk: 'Low',
  certification_level: 'Normal',
  policy_risk: 0,
  return_rate: 0
})

const getStrategyPath = (code) => {
    const map = {
        'S01': 'evaluation',
        'S02': 'diagnosis',
        'S03': 'profit',
        'S04': 'risk',
        'S05': 'scoring',
        'S06': 'scoring',
        'S07': 'scoring',
        'S08': 'top20',
        'S09': 'blue-ocean',
        'S10': 'scoring',
        'S11': '../enterprise',
        'S12': 'scoring',
        'S13': 'explosive',
        'S14': 'decision-tree',
        'S15': 'competitor-analysis',
        'S16': 'scoring',
        'S17': 'innovation',
        'S18': 'stress-test',
        'S19': 'scoring',
        'S20': 'scoring',
        'S21': 'scoring'
    }
    return map[code] || ''
}

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
    loading.value = true
    // 并行加载产品详情和策略历史
    const [productRes, strategyRes] = await Promise.all([
        Product.getProduct(id),
        Strategy.getExecutionHistory(id)
    ])

    // 提取产品数据 (后端返回 { code: 200, data: product })
    const productData = productRes?.data || productRes
    if (productData) {
        Object.assign(form, productData)
    }
    
    // 提取策略历史数据 (后端返回 { code: 200, data: { items: [], total: ... } })
    const strategyData = strategyRes?.data || strategyRes
    if (strategyData) {
        // 后端返回可能是 { items: [], total: ... } 或直接 []
        const items = Array.isArray(strategyData) ? strategyData : (strategyData.items || [])
        strategyResults.value = items
            .filter(item => item.is_latest) // 仅显示最新结果
            .map(item => ({
                ...item,
                code: item.strategy_code,
                name: item.strategy_name,
                result: item.decision, // 后端叫 decision，前端模版用 result
                score: item.score,
                executedAt: item.executed_at,
                path: getStrategyPath(item.strategy_code),
                query: ['S05', 'S06', 'S07', 'S10', 'S12', 'S16', 'S19', 'S20', 'S21'].includes(item.strategy_code) ? { code: item.strategy_code } : {}
            }))
    }
  } catch (error) {
    console.error('加载详情失败', error)
    ElMessage.error('加载数据失败')
  } finally {
      loading.value = false
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
    const productId = Number(route.params.id)
    if (executionType.value === 'all') {
      res = await Strategy.executeAll(productId)
    } else {
       // execute specific strategy like s01, s03
       // Strategy.execute takes (code, productId)
       const code = executionType.value.toUpperCase()
       res = await Strategy.execute(code, productId)
    }
    
    // 后端返回 { code: 200, data: {...} }
    // axios拦截器已经返回了res.data,所以res就是 { code: 200, data: {...} }
    // 我们需要提取data字段
    const resultData = res.data || res
    
    ElMessage.success('策略执行完成，结果已更新')
    
    // 重新加载策略历史以获取最新数据
    await loadData(productId)
    
    // 切换到策略结果tab
    activeTab.value = 'strategies'
  } catch (error) {
    console.error('策略执行失败', error)
    ElMessage.error('策略执行失败: ' + (error.message || '未知错误'))
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

    // S21 综合选品决策 - 显示优先级
    if (code === 'S21') {
        // 从reason中提取优先级信息,如"P0-最高"、"P1-高"等
        const reason = row.reason || ''
        const priorityMatch = reason.match(/P[0-4]-[^)]+/)
        if (priorityMatch) return priorityMatch[0]
        // 如果没有匹配到,根据score判断
        if (row.score >= 85) return 'P0-最高'
        if (row.score >= 75) return 'P1-高'
        if (row.score >= 65) return 'P2-中'
        if (row.score >= 55) return 'P3-低'
        return 'P4-暂缓'
    }

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
    if (row.score >= 85) return 'S级 (极佳)'
    if (row.score >= 70) return 'A级 (优秀)'
    if (row.score >= 55) return 'B级 (良好)'
    if (row.score >= 40) return 'C级 (及格)'
    return 'D级 (淘汰)'
}

const getDecisionTagType = (row) => {
    const text = String(getDecisionText(row)).toLowerCase()
    const code = row.code || ''
    
    // S21 综合选品决策 - 根据优先级设置颜色
    if (code === 'S21') {
        if (text.includes('p0') || text.includes('p1')) return 'success'  // P0/P1 绿色
        if (text.includes('p2')) return 'warning'  // P2 橙色
        return 'danger'  // P3/P4 红色
    }
    
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