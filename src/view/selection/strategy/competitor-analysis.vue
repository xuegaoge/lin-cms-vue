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
                        <i class="el-icon-star-on" v-if="scope.row.myProductAdvantage" style="color: #e6a23c"></i>
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
                   <div class="swot-item advantage">
                       <i class="el-icon-circle-check"></i> 材质升级：使用 TPE 环保材质，优于竞品 PVC
                   </div>
                   <div class="swot-item advantage">
                       <i class="el-icon-circle-check"></i> 赠品策略：附赠收纳袋和教程，提升性价比
                   </div>
               </el-card>
          </el-col>
           <el-col :span="12">
               <el-card shadow="hover" header="我的劣势与风险 (Weaknesses)">
                   <div class="swot-item disadvantage">
                       <i class="el-icon-warning-outline"></i> Review 数量：新品上架，缺乏社会认同
                   </div>
                   <div class="swot-item disadvantage">
                       <i class="el-icon-warning-outline"></i> 品牌知名度：弱于竞品 A
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
        processResult(res)
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const processResult = (res) => {
    // 映射差异化建议到优势列表
    if (res.suggestions) {
        strengths.value = res.suggestions.map(s => ({
            text: s,
            type: 'advantage'
        }))
    }
    
    if (res.warnings) {
        weaknesses.value = res.warnings.map(w => ({
            text: w,
            type: 'disadvantage'
        }))
    }

    // 构造对比矩阵（演示数据 + 占位符）
    tableData.value = [
        { 
            dimension: '综合竞争力', 
            myProduct: `${res.score} 分`, myProductAdvantage: res.score > 70,
            competitorA: '待填', competitorB: '待填', competitorC: '待填',
            analysis: res.reason
        },
        { 
            dimension: '差异化结论', 
            myProduct: res.decision, myProductAdvantage: res.decision === 'GO',
            competitorA: '-', competitorB: '-', competitorC: '-',
            analysis: '基于当前识别到的差异化机会得出的决策建议。'
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