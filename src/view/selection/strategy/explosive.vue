<template>
  <div class="container">
    <div class="header">
      <div class="title-group">
        <div class="title">S13 - 爆点识别引擎</div>
        <div class="subtitle">基于历史数据和消费者心理，识别产品成为爆款的潜力</div>
      </div>
      <el-button @click="handleBack">返回</el-button>
    </div>

    <div class="content">
      <el-row :gutter="20">
         <el-col :span="24">
             <div class="result-banner" :class="isHighPotential ? 'banner-high' : 'banner-low'">
             <div class="status-icon" :class="{ 'is-high': isHighPotential }">
                 <el-icon><component :is="isHighPotential ? 'Opportunity' : 'InfoFilled'" /></el-icon>
             </div>
                 <div class="text-wrapper">
                     <div class="main-text">{{ isHighPotential ? 'HIGH POTENTIAL (高爆款潜力)' : 'LOW POTENTIAL (潜力不足)' }}</div>
                     <div class="sub-text">{{ isHighPotential ? '检测到该产品具备多个爆款基因，建议重点投入资源打造' : '该产品缺乏显著的传播爆点，建议作为常规款或继续打磨' }}</div>
                 </div>
             </div>
         </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :span="12">
          <el-card shadow="hover" header="爆款基因检测">
             <el-timeline>
                <el-timeline-item
                  v-for="(activity, index) in activities"
                  :key="index"
                  :type="activity.type"
                  :color="activity.color"
                  :size="activity.size"
                  :timestamp="activity.category">
                  <div class="gene-card">
                      <div class="gene-title">{{ activity.title }}</div>
                      <div class="gene-desc">{{ activity.desc }}</div>
                  </div>
                </el-timeline-item>
              </el-timeline>
          </el-card>
        </el-col>
        <el-col :span="12">
            <el-card shadow="hover" header="流量与传播潜力">
                 <div class="metric-item">
                     <span class="label">社交传播属性</span>
                     <el-rate v-model="socialScore" disabled show-score text-color="#ff9900" score-template="{value} 分"></el-rate>
                 </div>
                 <div class="metric-desc">产品外观独特，具备在 TikTok/Instagram 自发传播的潜力。</div>
                 
                 <el-divider></el-divider>

                 <div class="metric-item">
                     <span class="label">点击率预估 (CTR)</span>
                     <el-progress :percentage="85" status="success"></el-progress>
                 </div>
                 <div class="metric-desc">主图差异化明显，预计 CTR 高于类目平均水平 50%。</div>

                 <el-divider></el-divider>

                  <div class="metric-item">
                     <span class="label">转化率预估 (CVR)</span>
                     <el-progress :percentage="70"></el-progress>
                 </div>
                 <div class="metric-desc">痛点解决能力强，但价格稍高，可能影响部分转化。</div>
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
const isHighPotential = ref(false)
const socialScore = ref(0)
const ctr = ref(0)
const cvr = ref(0)

const activities = ref([])

const loadData = async () => {
    const productId = route.query.productId
    if (!productId) return
    
    loading.value = true
    try {
        const res = await Strategy.execute('S13', productId)
        // API返回结构: { code: 200, data: { decision, suggestions, ... } }
        const data = res.data || res
        processResult(data)
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const processResult = (res) => {
    isHighPotential.value = res.decision === 'GO'
    
    // 清空并填充时间轴
    const items = []
    
    if (res.suggestions) {
        res.suggestions.forEach(s => {
            const parts = s.split(':')
            items.push({
                category: parts[0] || '爆点',
                title: parts[1] || s,
                desc: '检测到正向爆发信号',
                type: 'success',
                color: '#67c23a',
                size: 'large'
            })
        })
    }
    
    if (res.warnings) {
        res.warnings.forEach(w => {
            const parts = w.split(':')
            items.push({
                category: parts[0] || '预警',
                title: parts[1] || w,
                desc: '检测到衰退或风险信号',
                type: 'warning',
                color: '#e6a23c',
                size: 'normal'
            })
        })
    }
    
    activities.value = items

    // 模拟评估分值（或从 resultData 获取）
    socialScore.value = res.score / 20 // 换算为 5 星制
    ctr.value = res.score > 70 ? 85 : 40
    cvr.value = res.score > 50 ? 70 : 30
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
.result-banner {
    display: flex;
    align-items: center;
    padding: 30px;
    border-radius: 8px;
    color: #fff;
    
    .icon-wrapper {
        font-size: 48px;
        margin-right: 20px;
    }
    .text-wrapper {
        .main-text {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .sub-text {
            font-size: 14px;
            opacity: 0.9;
        }
    }
}
.banner-high {
    background: linear-gradient(135deg, #67c23a 0%, #409eff 100%);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}
.banner-low {
    background: linear-gradient(135deg, #909399 0%, #606266 100%);
}
.gene-card {
    padding: 10px;
    background: #f4f4f5;
    border-radius: 4px;
    .gene-title {
        font-weight: bold;
        color: #303133;
    }
    .gene-desc {
        font-size: 12px;
        color: #606266;
        margin-top: 4px;
    }
}
.metric-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    .label {
        font-weight: bold;
        color: #303133;
    }
}
.metric-desc {
    font-size: 13px;
    color: #909399;
}
</style>