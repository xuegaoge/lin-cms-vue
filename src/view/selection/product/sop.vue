<template>
  <div class="container">
    <div class="header">
      <div class="title">上架 SOP 执行流程 (M03)</div>
      <div class="product-tag"><el-tag>瑜伽垫 Pro</el-tag></div>
    </div>

    <div class="sop-container">
      <el-steps :active="activeStep" align-center style="margin-bottom: 40px">
        <el-step v-for="step in steps" :key="step.title" :title="step.title" :description="step.desc" />
      </el-steps>

      <div class="task-list">
        <div class="card">
          <div class="card-header">当前阶段任务清单: {{ steps[activeStep].title }}</div>
          <el-table :data="currentTasks" style="width: 100%">
            <el-table-column width="50">
               <template #default="scope">
                   <el-checkbox v-model="scope.row.completed" @change="handleTaskChange(scope.row)" />
               </template>
            </el-table-column>
            <el-table-column prop="task" label="任务内容" />
            <el-table-column prop="owner" label="负责人" width="120" />
            <el-table-column prop="deadline" label="截止日期" width="120" />
            <el-table-column prop="status" label="状态" width="120">
               <template #default="scope">
                   <el-tag :type="scope.row.completed ? 'success' : 'warning'">{{ scope.row.completed ? '已完成' : '进行中' }}</el-tag>
               </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { SOP } from '@/lin/model/selection'
import { ElMessage } from 'element-plus'

const route = useRoute()
const activeStep = ref(1)

const steps = [
    { title: '立项准备', desc: '确认样板与供应商' },
    { title: '采购下单', desc: '支付定金开始生产' },
    { title: '物流发货', desc: '头程发运至 FBA' },
    { title: '推广准备', desc: 'Listing 优化与广告计划' },
    { title: '正式上架', desc: '开始销售与测评' }
]

const allTasks = ref([])

const currentTasks = computed(() => {
    return allTasks.value.filter(t => t.step === activeStep.value)
})

const loadData = async () => {
    const productId = route.params.id
    if (!productId) return
    try {
        const res = await SOP.getTasks(productId)
        if (res && res.tasks) {
            allTasks.value = res.tasks
            // Determine active step based on progress
            if (res.activeStep) activeStep.value = res.activeStep
        }
    } catch (e) {
        console.error(e)
    }
}

const handleTaskChange = async (row) => {
    try {
        await SOP.updateTask(row.id, { completed: row.completed })
        ElMessage.success('任务状态已更新')
    } catch (e) {
        console.error(e)
        // Revert on error
        row.completed = !row.completed
        ElMessage.error('更新失败')
    }
}

onMounted(() => {
    loadData()
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
  .sop-container {
      background: #fff;
      padding: 40px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
      .card {
          border: 1px solid #ebeef5;
          padding: 20px;
          border-radius: 4px;
          .card-header { font-weight: bold; margin-bottom: 20px; color: #409eff; }
      }
  }
}
</style>
