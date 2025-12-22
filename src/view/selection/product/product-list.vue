<template>
  <div class="container">
    <div class="header">
      <div class="title">产品管理</div>
      <div class="action-group">
        <el-button type="primary" icon="Plus" @click="handleCreate">新增产品</el-button>
        <el-button type="success" plain icon="DocumentCopy" @click="handleComparison">对比分析</el-button>
      </div>
    </div>

    <!-- 搜索筛选区 -->
    <div class="search-box">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="产品名称">
          <el-input v-model="searchForm.name" placeholder="输入名称或ASIN" prefix-icon="Search"></el-input>
        </el-form-item>
        <el-form-item label="所属类目">
          <el-select v-model="searchForm.category" placeholder="全部类目" clearable>
            <el-option label="家居生活" value="home"></el-option>
            <el-option label="消费电子" value="electronics"></el-option>
            <el-option label="运动户外" value="sports"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 120px">
            <el-option label="通过" value="pass"></el-option>
            <el-option label="评估中" value="pending"></el-option>
            <el-option label="淘汰" value="reject"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="searchForm.priority" placeholder="全部优先级" clearable style="width: 120px">
            <el-option label="P1-最高" value="P1"></el-option>
            <el-option label="P2-高" value="P2"></el-option>
            <el-option label="P3-中" value="P3"></el-option>
            <el-option label="P4-低" value="P4"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-select v-model="searchForm.sort" placeholder="排序字段" style="width: 120px">
            <el-option label="创建时间" value="created_at"></el-option>
            <el-option label="更新时间" value="updated_at"></el-option>
            <el-option label="优先级" value="priority_level"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
          <el-button icon="Refresh" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 列表区 -->
    <div class="table-container">
      <el-table :data="tableData" style="width: 100%" v-loading="loading" :header-cell-style="{background:'#f5f7fa',color:'#606266'}">
        <el-table-column label="产品信息" min-width="200">
          <template #default="scope">
            <div class="product-info">
               <div class="name">{{ scope.row.product_name }}</div>
               <div class="asin">ASIN: {{ scope.row.asin }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="类目" width="120" />
        <el-table-column prop="status" label="决策状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" effect="light" size="small">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="评分概览" width="140" sortable>
             <template #default="scope">
                <div class="score-cell clickable" @click="handleViewStrategySummary(scope.row)" title="点击查看详情">
                  <div v-if="scope.row.latest_scores">
                     <div v-if="scope.row.latest_scores.s01" class="score-item">
                        <span class="label">S1:</span>
                        <span class="score-val" :style="{ color: getScoreColor(scope.row.latest_scores.s01) }">{{ scope.row.latest_scores.s01 }}</span>
                     </div>
                     <div v-if="scope.row.latest_scores.s02" class="score-item">
                        <span class="label">S2:</span>
                        <span class="score-val" :style="{ color: getScoreColor(scope.row.latest_scores.s02) }">{{ scope.row.latest_scores.s02 }}</span>
                     </div>
                  </div>
                  <span v-else>-</span>
                </div>
             </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="最后更新" width="160" sortable />
        <el-table-column fixed="right" label="操作" width="240" align="center">
          <template #default="scope">
            <div class="operate-group">
              <el-tooltip content="运行策略评估" placement="top">
                <el-button type="success" icon="VideoPlay" size="small" circle @click="handleExecute(scope.row)"></el-button>
              </el-tooltip>
              <el-button type="primary" size="small" plain @click="handleDetail(scope.row)">详情</el-button>
              <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, scope.row)">
                <el-button type="info" size="small" plain>
                  更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="trends" icon="TrendCharts">历史趋势</el-dropdown-item>
                    <el-dropdown-item command="sop" icon="List">SOP执行</el-dropdown-item>
                    <el-dropdown-item command="delete" icon="Delete" style="color: #f56c6c">删除产品</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          v-model:current-page="currentPage"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Product, Strategy } from '@/lin/model/selection'

const router = useRouter()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  name: '',
  category: '',
  status: '',
  priority: '',
  sort: 'created_at',
  order: 'desc'
})

const tableData = ref([])

const getStatusType = (status) => {
  const map = {
    '通过': 'success',
    '评估中': 'warning',
    '淘汰': 'danger'
  }
  return map[status] || 'info'
}

const getScoreColor = (score) => {
    if(!score) return '#909399'
    if(score >= 90) return '#67c23a'
    if(score >= 75) return '#e6a23c'
    return '#f56c6c'
}

const handleSearch = async () => {
  loading.value = true
  try {
    const res = await Product.getProducts({
      page: currentPage.value,
      size: pageSize.value,
      keyword: searchForm.name,
      category: searchForm.category,
      status: searchForm.status,
      priority: searchForm.priority,
      sort: searchForm.sort,
      order: searchForm.order
    })
    // 适配后端返回结构 { code: 200, data: { items: [], total: 0 } }
    if (res.items) {
      tableData.value = res.items
      total.value = res.total || 0
    } else if (res.data && res.data.items) {
      tableData.value = res.data.items
      total.value = res.data.total || 0
    } else {
      tableData.value = res
      total.value = 0
    }
  } catch (error) {
    console.error('获取产品列表失败', error)
    // ElMessage.error('获取产品列表失败') // axios 拦截器可能已处理
  } finally {
    loading.value = false
  }
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}

const resetForm = () => {
  searchForm.name = ''
  searchForm.category = ''
  searchForm.status = ''
  searchForm.priority = ''
  searchForm.sort = 'created_at'
  searchForm.order = 'desc'
  currentPage.value = 1
  handleSearch()
}

const handleCreate = () => {
    router.push('/selection/product/create') // 假设有创建页，或复用详情页
}

const handleComparison = () => {
    router.push('/selection/comparison')
}

const handleDetail = (row) => {
  router.push(`/selection/product/${row.id}`)
}



const handleExecute = async (row) => {
  try {
    await Strategy.executeAll(row.id)
    ElMessage.success(`已触发 [${row.product_name}] 的全量策略评估`)
    // 稍微延迟后跳转，让用户看到成功提示
    setTimeout(() => {
        router.push(`/selection/product/${row.id}?tab=strategies`)
    }, 500)
  } catch (error) {
    console.error('策略执行失败', error)
    // ElMessage.error 由拦截器处理，或手动添加
  }
}

const handleViewStrategySummary = (row) => {
  // 跳转到详情页并默认激活“策略结果”Tab
  router.push({
    path: `/selection/product/${row.id}`,
    query: { tab: 'strategies' }
  })
}

const handleStrategy = (row) => {
    router.push(`/selection/strategies?productId=${row.id}`)
}

const handleCommand = (cmd, row) => {
  if (cmd === 'trends') {
    router.push(`/selection/product/${row.id}/trends`)
  } else if (cmd === 'sop') {
    router.push(`/selection/product/${row.id}/sop`)
  } else if (cmd === 'delete') {
    ElMessageBox.confirm('确认删除该产品吗？删除后不可恢复。', '提示', {
      type: 'warning'
    }).then(() => {
      ElMessage.success('删除成功')
      handleSearch()
    })
  }
}

onMounted(() => {
  handleSearch()
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
    
    .title {
      font-size: 24px;
      font-weight: 600;
      color: #1f2f3d;
    }
  }

  .search-box {
    background: #fff;
    padding: 24px 24px 0;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);
  }

  .table-container {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);

    .product-info {
      .name { font-weight: 500; color: #303133; margin-bottom: 4px; }
      .asin { font-size: 12px; color: #909399; font-family: monospace; }
    }

    .operate-group {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }

    .score-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
      
      &.clickable {
        cursor: pointer;
        &:hover { 
            background-color: #f0f2f5;
            border-radius: 4px;
        }
      }
      .label { font-size: 11px; color: #909399; margin-right: 4px; width: 20px; display: inline-block; }
      .score-val { font-weight: 600; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    }
    
    .pagination {
      margin-top: 20px;
      text-align: right;
    }
  }
}
</style>
