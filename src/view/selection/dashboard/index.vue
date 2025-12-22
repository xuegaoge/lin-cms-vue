<template>
  <div class="container">
    <div class="header">
      <div class="title-group">
        <div class="title">BI 监控中心</div>
        <div class="subtitle">选品决策实时数据大盘</div>
      </div>
      <div class="date-picker">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          size="default"
        />
      </div>
    </div>

    <!-- 顶部数据汇总 -->
    <el-row :gutter="20" class="summary-row">
      <el-col :span="6" v-for="(item, index) in summaryData" :key="index">
        <div class="data-card" :class="`card-${index}`">
          <div class="card-content">
            <div class="card-title">{{ item.title }}</div>
            <div class="card-value">{{ item.value }}</div>
          </div>
          <div class="card-icon">
             <i :class="item.iconClass"></i>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 中部图表区 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="14">
        <div class="card chart-card">
          <div class="card-header">
            <span>选品池状态分布</span>
            <el-tag size="small" effect="plain">实时</el-tag>
          </div>
          <div ref="statusChart" style="height: 320px;"></div>
        </div>
      </el-col>
      <el-col :span="10">
        <div class="card chart-card">
          <div class="card-header">
            <span>策略执行覆盖率</span>
            <el-tooltip content="各核心策略在选品池中的执行渗透率" placement="top">
              <i class="el-icon-info" style="color: #909399; cursor: pointer"></i>
            </el-tooltip>
          </div>
          <div ref="coverageChart" style="height: 320px;"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 底部：待办与预警 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <div class="card table-card">
          <div class="card-header danger-header">
            <span>风险预警列表 (High Risk)</span>
            <el-button type="danger" link size="small">查看全部</el-button>
          </div>
          <el-table :data="alerts" height="280" style="width: 100%" :header-cell-style="{background:'#f5f7fa',color:'#606266'}">
             <el-table-column prop="product" label="产品名称" width="150" show-overflow-tooltip>
                 <template #default="scope">
                     <span style="font-weight: 500">{{ scope.row.product }}</span>
                 </template>
             </el-table-column>
             <el-table-column prop="type" label="风险类型" width="100">
                 <template #default="scope">
                     <el-tag type="danger" size="small" effect="light">{{ scope.row.type }}</el-tag>
                 </template>
             </el-table-column>
             <el-table-column prop="desc" label="预警描述" show-overflow-tooltip />
          </el-table>
        </div>
      </el-col>
      <el-col :span="12">
        <div class="card table-card">
          <div class="card-header">
            <span>近期立项审批</span>
            <el-button type="primary" link size="small">处理待办</el-button>
          </div>
          <el-table :data="approvals" height="280" style="width: 100%" :header-cell-style="{background:'#f5f7fa',color:'#606266'}">
             <el-table-column prop="product" label="产品名称" width="150" show-overflow-tooltip>
                <template #default="scope">
                     <span style="font-weight: 500">{{ scope.row.product }}</span>
                 </template>
             </el-table-column>
             <el-table-column prop="status" label="审批状态" width="100">
                 <template #default="scope">
                     <div class="status-dot">
                        <span :class="['dot', scope.row.status === '进行中' ? 'warning' : 'success']"></span>
                        {{ scope.row.status }}
                     </div>
                 </template>
             </el-table-column>
             <el-table-column prop="time" label="提交时间" />
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import * as echarts from 'echarts'

const dateRange = ref([])
const statusChart = ref(null)
const coverageChart = ref(null)

// 使用 Element Plus 图标类名
const summaryData = [
    { title: '待评估产品', value: '45', iconClass: 'el-icon-timer', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { title: '已通过 (GO)', value: '12', iconClass: 'el-icon-check', color: 'linear-gradient(135deg, #2af598 0%, #009efd 100%)' },
    { title: '淘汰产品', value: '28', iconClass: 'el-icon-close', color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)' },
    { title: '预估年度ROI', value: '185%', iconClass: 'el-icon-money', color: 'linear-gradient(120deg, #f6d365 0%, #fda085 100%)' }
]

const alerts = [
    { product: '瑜伽垫 Pro', type: '毛利风险', desc: '海运费上涨 20%，导致净利润率跌破 10% 阈值。' },
    { product: '智能加湿器', type: '竞争风险', desc: '类目新增 3 个竞品 ASIN，市场份额有萎缩风险。' },
    { product: '蓝牙耳机', type: '侵权预警', desc: '监测到同类外观专利在欧盟区注册成功。' }
]

const approvals = [
    { product: '折叠野营桌', status: '进行中', time: '2025-12-21' },
    { product: '户外移动电源', status: '已通过', time: '2025-12-18' },
    { product: '速干潜水服', status: '进行中', time: '2025-12-20' }
]

const initCharts = () => {
    // 状态分布饼图
    const sChart = echarts.init(statusChart.value)
    sChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: '0%', left: 'center', itemWidth: 10, itemHeight: 10 },
        series: [{
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: {
                label: { show: true, fontSize: '18', fontWeight: 'bold' }
            },
            data: [
                { value: 12, name: '通过 (GO)', itemStyle: { color: '#67c23a' } },
                { value: 20, name: '评估中', itemStyle: { color: '#e6a23c' } },
                { value: 28, name: '淘汰 (STOP)', itemStyle: { color: '#f56c6c' } },
                { value: 15, name: '草稿', itemStyle: { color: '#909399' } }
            ]
        }]
    })

    // 策略覆盖率柱状图
    const cChart = echarts.init(coverageChart.value)
    cChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'category', data: ['S01', 'S02', 'S03', 'S04', 'S05'], axisTick: { show: false }, axisLine: { lineStyle: { color: '#E4E7ED' } }, axisLabel: { color: '#606266' } },
        yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
        series: [{
            data: [100, 85, 90, 70, 45],
            type: 'bar',
            barWidth: '40%',
            itemStyle: { 
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#83bff6' },
                    { offset: 0.5, color: '#188df0' },
                    { offset: 1, color: '#188df0' }
                ]),
                borderRadius: [4, 4, 0, 0]
            }
        }]
    })
    
    window.addEventListener('resize', () => {
        sChart.resize()
        cChart.resize()
    })
}

onMounted(() => {
    initCharts()
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
    
    .title-group {
      .title {
        font-size: 24px;
        font-weight: 600;
        color: #1f2f3d;
        margin-bottom: 8px;
      }
      .subtitle {
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .data-card {
      background: #fff;
      padding: 24px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
      transition: all 0.3s ease;
      cursor: default;
      border: 1px solid #f0f2f5;

      &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      }

      .card-content {
        .card-title { font-size: 14px; color: #606266; margin-bottom: 8px; }
        .card-value { font-size: 32px; font-weight: 700; color: #303133; font-family: 'DIN Alternate', sans-serif; }
      }

      .card-icon { 
          width: 48px; height: 48px; 
          border-radius: 12px; 
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 24px;
          opacity: 0.9;
      }

      &.card-0 .card-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3); }
      &.card-1 .card-icon { background: linear-gradient(135deg, #2af598 0%, #009efd 100%); box-shadow: 0 4px 12px rgba(0, 158, 253, 0.3); }
      &.card-2 .card-icon { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%); box-shadow: 0 4px 12px rgba(255, 154, 158, 0.3); }
      &.card-3 .card-icon { background: linear-gradient(120deg, #f6d365 0%, #fda085 100%); box-shadow: 0 4px 12px rgba(253, 160, 133, 0.3); }
  }

  .card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.04);
    border: 1px solid #f0f2f5;
    
    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid #f0f2f5;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
      color: #303133;
      font-size: 16px;

      &.danger-header {
          span { color: #f56c6c; }
      }
    }
  }

  .chart-card { 
      padding-bottom: 20px;
  }
  
  .table-card { 
      overflow: hidden; 
  }

  .status-dot {
      display: flex; align-items: center;
      .dot {
          width: 8px; height: 8px; border-radius: 50%; margin-right: 8px;
          &.success { background-color: #67c23a; }
          &.warning { background-color: #e6a23c; }
      }
  }
}
</style>
