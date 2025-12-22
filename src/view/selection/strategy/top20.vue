<template>
  <div class="container">
    <div class="header">
      <div class="title-group">
        <div class="title">S08 - TOP20策略套利库</div>
        <div class="subtitle">基于产品属性和市场数据，推荐最佳的运营打法</div>
      </div>
      <el-button @click="handleBack">返回</el-button>
    </div>

    <div class="content">
      <el-row :gutter="20">
        <el-col :span="24">
          <el-card shadow="hover" class="recommend-card">
            <template #header>
              <div class="card-header">
                <span><i class="el-icon-trophy"></i> 核心推荐打法</span>
              </div>
            </template>
            <div class="strategy-list">
              <div v-for="(item, index) in topStrategies" :key="index" class="strategy-item">
                <div class="strategy-rank">NO.{{ index + 1 }}</div>
                <div class="strategy-info">
                  <div class="strategy-name">{{ item.name }}</div>
                  <div class="strategy-desc">{{ item.desc }}</div>
                </div>
                <div class="strategy-score">
                  <el-progress type="dashboard" :percentage="item.matchScore" :width="60" :color="colors"></el-progress>
                  <div class="score-label">匹配度</div>
                </div>
                <div class="strategy-action">
                   <el-tag :type="item.difficulty === 'Easy' ? 'success' : (item.difficulty === 'Medium' ? 'warning' : 'danger')">
                     {{ item.difficulty === 'Easy' ? '易上手' : (item.difficulty === 'Medium' ? '中等难度' : '高难度') }}
                   </el-tag>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="24">
           <el-card shadow="hover">
             <template #header>
              <div class="card-header">
                <span>全部策略匹配详情 (TOP 20)</span>
              </div>
            </template>
            <el-table :data="allStrategies" style="width: 100%" stripe>
              <el-table-column prop="code" label="编号" width="80" />
              <el-table-column prop="name" label="策略名称" width="180" />
              <el-table-column prop="scenario" label="适用场景" />
              <el-table-column prop="matchScore" label="匹配度" width="100">
                <template #default="scope">
                   <span style="font-weight: bold;">{{ scope.row.matchScore }}%</span>
                </template>
              </el-table-column>
               <el-table-column prop="reason" label="推荐/不推荐理由" />
            </el-table>
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

const colors = [
  { color: '#f56c6c', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#5cb87a', percentage: 60 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 },
]

const topStrategies = ref([])
const allStrategies = ref([])

const loadData = async () => {
    const productId = route.query.productId
    if (!productId) return
    
    loading.value = true
    try {
        const res = await Strategy.execute('S08', productId)
        processResult(res)
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const processResult = (res) => {
    if (res.suggestions) {
        const mapped = res.suggestions.map((s, index) => {
            const parts = s.split(':')
            const content = parts[1] ? parts[1].split('-') : [s]
            return {
                code: `ST${(index + 1).toString().padStart(2, '0')}`,
                name: content[0]?.trim() || s,
                desc: content[1]?.trim() || '建议执行该策略以优化运营效果。',
                scenario: '基于产品特征匹配',
                matchScore: Math.max(95 - (index * 5), 60), // 模拟匹配度递减
                difficulty: index < 3 ? 'Easy' : (index < 6 ? 'Medium' : 'Hard'),
                reason: res.reason
            }
        })
        
        topStrategies.value = mapped.slice(0, 3)
        allStrategies.value = mapped
    }
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
.strategy-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.strategy-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #f9fafc;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
    transform: translateY(-2px);
  }

  .strategy-rank {
    font-size: 24px;
    font-weight: 900;
    color: #409eff;
    width: 80px;
    text-align: center;
    font-style: italic;
  }
  .strategy-info {
    flex: 1;
    .strategy-name {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 5px;
    }
    .strategy-desc {
      font-size: 13px;
      color: #606266;
    }
  }
  .strategy-score {
    width: 100px;
    text-align: center;
    .score-label {
      font-size: 12px;
      color: #909399;
    }
  }
  .strategy-action {
    width: 100px;
    text-align: center;
  }
}
</style>