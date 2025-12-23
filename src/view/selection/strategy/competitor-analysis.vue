<template>
  <div class="container">
    <div class="header">
      <div class="title-group">
        <div class="title">S15 - 竞品分析矩阵</div>
        <div class="subtitle">深度剖析 TOP 竞品优劣势，寻找差异化突围机会</div>
      </div>
      <el-button @click="handleBack">返回</el-button>
    </div>

    <div class="content">
      <el-card shadow="hover">
         <template #header>
            <div class="card-header">
            <span>竞品对比矩阵</span>
            </div>
        </template>
        <el-table :data="tableData" style="width: 100%" border>
            <el-table-column fixed prop="dimension" label="对比维度" width="150" />
            
            <el-table-column label="我方产品 (My Product)" width="200" align="center">
                <template #default="scope">
                    <div class="my-product-cell" :class="{'highlight': scope.row.myProductAdvantage}">
                        {{ scope.row.myProduct }}
                        <el-icon v-if="scope.row.myProductAdvantage" color="#e6a23c"><StarFilled /></el-icon>
                    </div>
                </template>
            </el-table-column>

            <el-table-column label="竞品 A (Top Seller)" width="200" align="center">
                 <template #default="scope">
                    {{ scope.row.competitorA }}
                </template>
            </el-table-column>
            
            <el-table-column label="竞品 B (Rising Star)" width="200" align="center">
                 <template #default="scope">
                    {{ scope.row.competitorB }}
                </template>
            </el-table-column>
            
             <el-table-column label="竞品 C (Low Price)" width="200" align="center">
                 <template #default="scope">
                    {{ scope.row.competitorC }}
                </template>
            </el-table-column>
            
            <el-table-column label="分析结论" min-width="300">
                <template #default="scope">
                    {{ scope.row.analysis }}
                </template>
            </el-table-column>
        </el-table>
      </el-card>

      <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
               <el-card shadow="hover" header="我的核心优势 (Strengths)">
                   <div class="swot-item" :class="item.type" v-for="(item, index) in strengths" :key="'s'+index">
                       <el-icon><CircleCheck /></el-icon> {{ item.text }}
                   </div>
               </el-card>
          </el-col>
           <el-col :span="12">
               <el-card shadow="hover" header="我的劣势与风险 (Weaknesses)">
                   <div class="swot-item" :class="item.type" v-for="(item, index) in weaknesses" :key="'w'+index">
                       <el-icon><Warning /></el-icon> {{ item.text }}
                   </div>
               </el-card>
          </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Strategy } from '@/lin/model/selection'
import { ElMessage } from 'element-plus'
import { StarFilled, CircleCheck, Warning } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(false)

const tableData = ref([])
const strengths = ref([])
const weaknesses = ref([])

const loadData = async () => {
    const productId = route.query.productId
    if (!productId) return
    
    loading.value = true
    try {
        const res = await Strategy.execute('S15', productId)
        const data = res.data || res
        processResult(data)
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const processResult = (res) => {
    // 解析 detail_json
    let details = {}
    if (res.detail_json || res.DetailJson) {
        try {
            const raw = res.detail_json || res.DetailJson
            details = typeof raw === 'string' ? JSON.parse(raw) : raw
        } catch (e) { console.error(e) }
    }

    // 提取优势 (Suggestions / Strengths)
    const rawSuggestions = details.Suggestions || details.suggestions || res.suggestions || []
    if (rawSuggestions.length > 0) {
        strengths.value = rawSuggestions.map(s => ({
            text: typeof s === 'string' ? s : (s.Recommendation || s.action || '优势点'),
            type: 'advantage'
        }))
    } else {
        strengths.value = [{ text: '暂无显著优势识别', type: 'info' }]
    }
    
    // 提取劣势 (Warnings / Weaknesses) - 如果没有 Warnings 字段，暂时留空或根据逻辑生成
    const rawWarnings = details.Warnings || details.warnings || res.warnings || []
    if (rawWarnings.length > 0) {
        weaknesses.value = rawWarnings.map(w => ({
            text: typeof w === 'string' ? w : (w.Warning || w.text || '风险点'),
            type: 'disadvantage'
        }))
    } else {
         weaknesses.value = [{ text: '暂无显著风险识别', type: 'info' }]
    }

    // 提取分数和决策
    const score = details.Score || details.score || res.score || 0
    const decision = details.Decision || details.decision || res.decision || '-'
    const reason = details.Reason || details.reason || res.reason || ''

    // 构造对比矩阵
    // 尝试从 details 中获取 Competitors 数据，如果不存在则使用占位符
    const competitorA = details.CompetitorA || '待填'
    const competitorB = details.CompetitorB || '待填'
    const competitorC = details.CompetitorC || '待填'

    tableData.value = [
        { 
            dimension: '综合竞争力', 
            myProduct: `${score} 分`, myProductAdvantage: score > 70,
            competitorA: competitorA.Score || '-', 
            competitorB: competitorB.Score || '-', 
            competitorC: competitorC.Score || '-',
            analysis: reason
        },
        { 
            dimension: '决策建议', 
            myProduct: decision, myProductAdvantage: decision === 'GO',
            competitorA: '-', competitorB: '-', competitorC: '-',
            analysis: '基于数据维度的综合自动化评估'
        }
    ]
}

onMounted(() => {
    loadData()
})

const handleBack = () => {
  const productId = route.query.productId
  if (productId) {
    router.push({ path: `/selection/product/${productId}`, query: { tab: 'strategies' } })
  } else {
    router.back()
  }
}
</script>

<style scoped lang="scss">
.container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: 100vh;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #fff;
  padding: 15px 20px;
  border-radius: 4px;
}
.title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}
.subtitle {
  font-size: 13px;
  color: #909399;
  margin-top: 5px;
}
.my-product-cell {
    font-weight: bold;
    &.highlight {
        color: #e6a23c;
    }
}
.swot-item {
    margin-bottom: 10px;
    font-size: 14px;
    i { margin-right: 5px; }
}
.advantage { color: #67c23a; }
.disadvantage { color: #f56c6c; }
</style>