<template>
  <div class="container">
    <div class="header">
      <div class="title">多产品决策对比 (M04)</div>
      <div class="actions">
        <el-button type="primary" @click="handleAddProduct">添加对比产品</el-button>
        <el-button type="success" @click="handleExport">导出报告</el-button>
      </div>
    </div>

    <div class="comparison-container">
      <el-table :data="comparisonData" border style="width: 100%" :cell-style="cellStyle">
        <el-table-column prop="metric" label="指标 \ 产品" width="180" fixed />
        
        <el-table-column v-for="p in selectedProducts" :key="p.id" :label="p.name" min-width="150">
           <template #header>
               <div class="product-header">
                   <div>{{ p.name }}</div>
                   <el-tag size="small">{{ p.asin }}</el-tag>
                   <el-button link type="danger" icon="delete" @click="removeProduct(p.id)"></el-button>
               </div>
           </template>
           <template #default="scope">
               <div v-if="scope.row.metric === '最终决策'">
                   <el-tag :type="scope.row[p.id] === 'GO' ? 'success' : 'warning'" effect="dark">{{ scope.row[p.id] }}</el-tag>
               </div>
               <div v-else-if="scope.row.metric === '综合评分'">
                   <el-progress :percentage="scope.row[p.id]" :color="getScoreColor(scope.row[p.id])" />
               </div>
               <div v-else>{{ scope.row[p.id] }}</div>
           </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 推荐建议 -->
    <div class="card recommendation-card">
        <div class="card-header">系统辅助建议</div>
        <div class="suggestion-content">
            <p v-if="selectedProducts.length > 0">基于当前 {{ selectedProducts.length }} 个产品的对比分析：</p>
            <el-alert v-if="selectedProducts.length > 0" title="建议优先立项综合评分最高的产品，并在风险指标可控的前提下推进。" type="success" show-icon :closable="false" />
            <el-empty v-else description="请添加产品进行对比" />
        </div>
    </div>

    <!-- 选择产品弹窗 -->
    <el-dialog v-model="dialogVisible" title="选择产品" width="600px">
        <el-table :data="productList" @selection-change="handleSelectionChange" height="400">
            <el-table-column type="selection" width="55" />
            <el-table-column property="product_name" label="产品名称" />
            <el-table-column property="asin" label="ASIN" width="150" />
            <el-table-column property="score" label="评分" width="100" />
        </el-table>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmSelection">确定</el-button>
            </span>
        </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Comparison, Product } from '@/lin/model/selection'
import { ElMessage } from 'element-plus'

const selectedProducts = ref([])
const comparisonData = ref([])
const dialogVisible = ref(false)
const productList = ref([])
const selection = ref([])

const getScoreColor = (score) => {
    if (score >= 80) return '#67c23a'
    if (score >= 60) return '#e6a23c'
    return '#f56c6c'
}

const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
    if (columnIndex === 0) return { background: '#f5f7fa', fontWeight: 'bold' }
    return {}
}

const removeProduct = (id) => {
    selectedProducts.value = selectedProducts.value.filter(p => p.id !== id)
    fetchComparison()
}

const handleAddProduct = async () => {
    dialogVisible.value = true
    try {
        // Fetch simplified product list for selection
        // Assuming getProducts supports simplified result or pagination
        const res = await Product.getProducts({ count: 100 }) // Fetch reasonable amount
        productList.value = res.items || res
    } catch (e) {
        console.error(e)
    }
}

const confirmSelection = () => {
    // Add selected products to selectedProducts list, avoiding duplicates
    selection.value.forEach(item => {
        if (!selectedProducts.value.find(p => p.id === item.id)) {
            selectedProducts.value.push({ id: item.id, name: item.product_name, asin: item.asin })
        }
    })
    dialogVisible.value = false
    fetchComparison()
}

const handleSelectionChange = (val) => {
    selection.value = val
}

const fetchComparison = async () => {
    if (selectedProducts.value.length === 0) {
        comparisonData.value = []
        return
    }
    const ids = selectedProducts.value.map(p => p.id)
    try {
        const res = await Comparison.createComparison({ productIds: ids })
        comparisonData.value = res.metrics || res // Adjust based on API response
    } catch (e) {
        console.error(e)
    }
}

const handleExport = () => {
    ElMessage.info('导出功能开发中')
}

// Initial load (optional, or empty)
onMounted(() => {
    // selectedProducts could be init from query params or empty
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

  .comparison-container {
      background: #fff;
      padding: 20px;
      border-radius: 4px;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
      
      .product-header {
          text-align: center;
          div { margin-bottom: 5px; font-weight: bold; }
      }
  }

  .card {
    background: #fff;
    padding: 20px;
    border-radius: 4px;
    margin-top: 20px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
    .card-header {
      font-weight: bold;
      margin-bottom: 15px;
      border-left: 4px solid #409eff;
      padding-left: 10px;
    }
    .suggestion-content {
        .el-alert { margin-bottom: 10px; }
    }
  }
}
</style>
