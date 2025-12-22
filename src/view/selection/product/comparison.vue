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
            <p>基于当前 {{ selectedProducts.length }} 个产品的对比分析：</p>
            <el-alert title="建议优先立项「瑜伽垫 Pro」，其在ROI和市场潜力指标上均处于领先地位。" type="success" show-icon :closable="false" />
            <el-alert title="「智能加湿器」虽然评分尚可，但其盈亏平衡销量较高，建议作为P2备选。" type="info" show-icon :closable="false" />
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const selectedProducts = ref([
    { id: 1, name: '瑜伽垫 Pro', asin: 'B08XXXXXXX' },
    { id: 2, name: '智能加湿器', asin: 'B09YYYYYYY' },
    { id: 4, name: '折叠野营桌', asin: 'B05AAAAAAA' }
])

const comparisonData = ref([
    { metric: '所属类目', 1: '运动户外', 2: '家居', 4: '户外家具' },
    { metric: '综合评分', 1: 85.5, 2: 72.0, 4: 65.8 },
    { metric: '月搜索量', 1: '52,000', 2: '35,000', 4: '18,500' },
    { metric: '预估毛利率', 1: '38.5%', 2: '32.0%', 4: '29.5%' },
    { metric: '预估ROI', 1: '125%', 2: '95%', 4: '88%' },
    { metric: 'BSR 头部集中度', 1: '45%', 2: '58%', 4: '52%' },
    { metric: '供应链稳定性', 1: '高', 2: '中', 4: '高' },
    { metric: '最终决策', 1: 'GO', 2: 'WAIT', 4: 'WAIT' }
])

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
}

const handleAddProduct = () => {
    // 弹窗选择产品逻辑
}

const handleExport = () => {
    // 导出逻辑
}
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
