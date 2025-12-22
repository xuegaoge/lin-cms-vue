<template>
  <div class="container">
    <div class="header">
      <div class="title-group">
        <div class="title">S14 - 20节点决策树</div>
        <div class="subtitle">严格执行 20 个关键节点的逻辑判定，一票否决制</div>
      </div>
      <el-button @click="handleBack">返回</el-button>
    </div>

    <div class="content">
      <el-row :gutter="20">
        <el-col :span="24">
             <div class="result-icon" :class="decision.toLowerCase()">
                 <el-icon><component :is="decision === 'PASS' ? 'CircleCheck' : 'CircleClose'" /></el-icon>
             </div>
        </el-col>
      </el-row>

      <div class="node-list">
          <div class="node-group" v-for="(group, gIndex) in nodes" :key="gIndex">
              <div class="group-title">{{ group.category }}</div>
              <el-row :gutter="20">
                  <el-col :span="6" v-for="(node, nIndex) in group.items" :key="nIndex">
                      <div class="node-card" :class="getNodeClass(node.status)">
                          <div class="node-header">
                              <span class="index">#{{ node.id }}</span>
                              <span class="status-tag">
                 <div class="node-status">
                     <el-icon :color="node.status === 'Pass' ? '#67c23a' : '#f56c6c'">
                        <component :is="node.status === 'Pass' ? 'Check' : 'Close'" />
                     </el-icon>
                 </div>
                                  {{ node.status }}
                              </span>
                          </div>
                          <div class="node-name">{{ node.name }}</div>
                          <div class="node-desc">{{ node.desc }}</div>
                      </div>
                  </el-col>
              </el-row>
          </div>
      </div>
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
const decision = ref('WAIT')

const nodes = ref([
    {
        category: '市场否决项',
        items: [
            { id: 1, code: 'N06', name: '市场容量', desc: '月搜索量 > 3000', status: 'Pass' },
            { id: 2, code: 'N07', name: '垄断程度', desc: 'CR3 < 60%', status: 'Pass' },
            { id: 3, code: 'N08', name: '价格空间', desc: '毛利率 > 25%', status: 'Pass' },
            { id: 4, code: 'N10', name: '趋势性', desc: '非超强季节性', status: 'Pass' }
        ]
    },
    {
        category: '合规否决项',
        items: [
            { id: 5, code: 'N01', name: '侵权风险', desc: '无明显专利/商标侵权', status: 'Pass' },
            { id: 6, code: 'N02', name: '平台政策', desc: '符合销售政策', status: 'Pass' },
            { id: 7, code: 'N03', name: '禁入类目', desc: '非禁限售产品', status: 'Pass' },
            { id: 8, code: 'N04', name: '认证门槛', desc: '资质可获取', status: 'Pass' }
        ]
    },
    {
        category: '竞争否决项',
        items: [
            { id: 9, code: 'N11', name: '广告成本', desc: 'CPC 可承受', status: 'Pass' },
            { id: 10, code: 'N12', name: '评分门槛', desc: '评分 > 4.2', status: 'Pass' },
            { id: 11, code: 'N13', name: '退货风险', desc: '退货率 < 10%', status: 'Pass' },
            { id: 12, code: 'N18', name: '竞争强度', desc: '非高度垄断', status: 'Pass' }
        ]
    },
    {
        category: '产品与供应',
        items: [
            { id: 13, code: 'N05', name: '利润底线', desc: 'ROI > 阈值', status: 'Pass' },
            { id: 14, code: 'N09', name: '供应稳定性', desc: '供应商可靠', status: 'Pass' },
            { id: 15, code: 'N14', name: '差异化', desc: '有独特卖点', status: 'Pass' },
            { id: 16, code: 'N15', name: '交期控制', desc: '交期 < 30天', status: 'Pass' }
        ]
    },
    {
        category: '加分/优势项',
        items: [
             { id: 17, code: 'N16', name: '蓝海红利', desc: '供需关系极佳', status: 'Pass' },
             { id: 18, code: 'N17', name: '超高毛利', desc: '毛利 > 40%', status: 'Pass' },
             { id: 19, code: 'N19', name: '爆发增长', desc: '搜索增长 > 30%', status: 'Pass' },
             { id: 20, code: 'N20', name: '资源护城河', desc: '有独特供应资源', status: 'Pass' }
        ]
    }
])

const loadData = async () => {
    const productId = route.query.productId
    if (!productId) return
    
    loading.value = true
    try {
        const res = await Strategy.execute('S14', productId)
        processResult(res)
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const processResult = (res) => {
    decision.value = res.decision
    
    // 重置所有节点为 Pass
    nodes.value.forEach(group => {
        group.items.forEach(node => {
            node.status = 'Pass'
        })
    })

    // 根据 Warnings 将对应 code 的节点设为 Fail
    if (res.warnings) {
        res.warnings.forEach(warn => {
            const code = warn.split(':')[0].trim() // 提取 "N06"
            nodes.value.forEach(group => {
                const node = group.items.find(n => n.code === code)
                if (node) node.status = 'Fail'
            })
        })
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

const getNodeClass = (status) => {
    return status === 'Pass' ? 'card-pass' : 'card-fail'
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
.result-status {
    display: flex;
    align-items: center;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    color: #fff;
    .icon { font-size: 40px; margin-right: 20px; }
    .text {
        .main { font-size: 24px; font-weight: bold; }
        .sub { font-size: 14px; opacity: 0.9; }
    }
}
.status-pass { background-color: #67c23a; }
.status-fail { background-color: #f56c6c; }

.node-group {
    margin-bottom: 30px;
    .group-title {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 15px;
        padding-left: 10px;
        border-left: 4px solid #409eff;
    }
}
.node-card {
    background: #fff;
    border-radius: 4px;
    padding: 15px;
    margin-bottom: 20px;
    border-left: 5px solid #dcdfe6;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
    
    .node-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        .index { font-weight: bold; color: #909399; }
        .status-tag { font-size: 12px; font-weight: bold; }
    }
    .node-name {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        margin-bottom: 5px;
    }
    .node-desc {
        font-size: 12px;
        color: #606266;
    }
}
.card-pass {
    border-left-color: #67c23a;
    .status-tag { color: #67c23a; }
}
.card-fail {
    border-left-color: #f56c6c;
    .status-tag { color: #f56c6c; }
    background-color: #fef0f0;
}
</style>