<template>
  <div class="container">
    <div class="header">
      <div class="title">审批流程中心</div>
    </div>

    <el-tabs v-model="activeTab" class="approval-tabs">
      <el-tab-pane label="待我审批" name="pending">
        <div class="table-container">
          <el-table :data="pendingApprovals" style="width: 100%">
            <el-table-column prop="productName" label="产品名称" width="200" />
            <el-table-column prop="asin" label="ASIN" width="120" />
            <el-table-column prop="submitter" label="提交人" width="120" />
            <el-table-column prop="submitTime" label="提交时间" width="180" />
            <el-table-column prop="currentStage" label="当前环节" width="120">
               <template #default="scope">
                   <el-tag size="small">{{ scope.row.currentStage }}</el-tag>
               </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleApprove(scope.row)">审批</el-button>
                <el-button size="small" @click="handleDetail(scope.row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="我发起的" name="my">
        <div class="table-container">
          <el-table :data="myApprovals" style="width: 100%">
            <el-table-column prop="productName" label="产品名称" width="200" />
            <el-table-column prop="asin" label="ASIN" width="120" />
            <el-table-column prop="status" label="状态" width="120">
               <template #default="scope">
                   <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
               </template>
            </el-table-column>
            <el-table-column prop="startTime" label="发起时间" width="180" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="small" @click="handleDetail(scope.row)">进度查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 审批弹窗 -->
    <el-dialog v-model="dialogVisible" title="产品立项审批" width="500px">
      <el-form :model="approveForm" label-width="80px">
        <el-form-item label="审批结论">
          <el-radio-group v-model="approveForm.result">
            <el-radio label="pass">赞成</el-radio>
            <el-radio label="reject">不赞成</el-radio>
            <el-radio label="hold">待定</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审批意见">
          <el-input type="textarea" v-model="approveForm.comment" rows="4" placeholder="请输入您的审批意见..."></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApprove">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Approval } from '@/lin/model/selection'

const activeTab = ref('pending')
const dialogVisible = ref(false)
const selectedRow = ref(null)

const approveForm = reactive({
    result: 'pass',
    comment: ''
})

const pendingApprovals = ref([])
const myApprovals = ref([])

const getStatusType = (status) => {
    return status === '已通过' || status === 'Pass' ? 'success' : 'warning'
}

const fetchPending = async () => {
    try {
        const res = await Approval.getPending()
        pendingApprovals.value = res.items || res
    } catch (e) {
        console.error(e)
    }
}

const fetchHistory = async () => {
    try {
        const res = await Approval.getHistory()
        myApprovals.value = res.items || res
    } catch (e) {
        console.error(e)
    }
}

const handleApprove = (row) => {
    selectedRow.value = row
    approveForm.result = 'pass'
    approveForm.comment = ''
    dialogVisible.value = true
}

const handleDetail = (row) => {
    console.log('Detail', row)
    // 可以跳转到产品详情页
    // router.push(`/selection/product/${row.productId}`)
}

const submitApprove = async () => {
    if (!selectedRow.value) return
    try {
        await Approval.approve(selectedRow.value.id, approveForm)
        ElMessage.success('审批操作成功')
        dialogVisible.value = false
        fetchPending() // Refresh list
    } catch (e) {
        console.error(e)
    }
}

watch(activeTab, (val) => {
    if (val === 'pending') fetchPending()
    else fetchHistory()
})

onMounted(() => {
    fetchPending()
})
</script>

<style lang="scss" scoped>
.container {
  padding: 20px;
  .header {
    margin-bottom: 20px;
    background: #fff;
    padding: 15px 20px;
    border-radius: 4px;
    .title { font-size: 18px; font-weight: bold; }
  }
  .approval-tabs {
      background: #fff;
      padding: 20px;
      border-radius: 4px;
      box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  }
}
</style>
