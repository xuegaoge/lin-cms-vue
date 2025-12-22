<template>
  <div class="container">
    <div class="header">
      <div class="title">选品与上架检查清单 (M05)</div>
      <div class="actions">
        <el-select v-model="currentType" placeholder="选择清单类型" style="margin-right: 10px">
          <el-option label="选品前核查 (Pre-Selection)" value="pre_selection"></el-option>
          <el-option label="上架前准备 (Pre-Launch)" value="pre_launch"></el-option>
          <el-option label="上架后监控 (Post-Launch)" value="post_launch"></el-option>
        </el-select>
        <el-button type="primary" @click="handleSave">保存进度</el-button>
      </div>
    </div>

    <div class="checklist-container">
      <div class="progress-section">
        <div class="progress-label">完成度: {{ progress }}%</div>
        <el-progress :percentage="progress" :format="formatProgress" :status="progressStatus"></el-progress>
      </div>

      <div class="list-content">
        <el-card shadow="never" class="check-card">
          <div v-for="(group, index) in currentList" :key="index" class="group-section">
            <div class="group-title">{{ group.title }}</div>
            <div class="items">
              <div v-for="item in group.items" :key="item.id" class="check-item" :class="{ checked: item.checked }">
                <el-checkbox v-model="item.checked" @change="calculateProgress">
                  <span class="item-text">{{ item.text }}</span>
                </el-checkbox>
                <el-tag size="small" type="info" v-if="item.required" effect="plain">必填</el-tag>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

const currentType = ref('pre_selection')
const progress = ref(0)

const checklists = reactive({
  pre_selection: [
    {
      title: '合规与风控',
      items: [
        { id: 1, text: '检查是否存在外观/发明专利侵权风险', checked: false, required: true },
        { id: 2, text: '确认产品是否属于危险品（Hazmat）', checked: false, required: true },
        { id: 3, text: '核实类目审核（Gating）要求', checked: false, required: true }
      ]
    },
    {
      title: '市场验证',
      items: [
        { id: 4, text: '核算毛利率是否 > 30%', checked: false, required: true },
        { id: 5, text: '确认 Top 10 竞品无不可逾越的护城河', checked: false, required: false },
        { id: 6, text: 'Google Trends 趋势确认无下行风险', checked: false, required: false }
      ]
    }
  ],
  pre_launch: [
    {
      title: 'Listing 准备',
      items: [
        { id: 11, text: '主图 3D 渲染完成', checked: false, required: true },
        { id: 12, text: 'A+ 页面文案定稿', checked: false, required: true },
        { id: 13, text: '埋词库（SEO）整理完毕', checked: false, required: true }
      ]
    }
  ]
})

const currentList = computed(() => checklists[currentType.value] || [])

const progressStatus = computed(() => {
  if (progress.value === 100) return 'success'
  return ''
})

const formatProgress = (percentage) => {
  return percentage === 100 ? '完成' : `${percentage}%`
}

const calculateProgress = () => {
  let total = 0
  let checked = 0
  currentList.value.forEach(group => {
    group.items.forEach(item => {
      total++
      if (item.checked) checked++
    })
  })
  progress.value = total === 0 ? 0 : Math.round((checked / total) * 100)
}

const handleSave = () => {
  ElMessage.success('检查清单进度已保存')
}

watch(currentType, () => {
  calculateProgress()
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
    background: #fff;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);
    .title { font-size: 18px; font-weight: 600; color: #303133; }
  }

  .checklist-container {
    background: #fff;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,0.02);

    .progress-section {
      margin-bottom: 30px;
      padding: 0 20px;
      .progress-label { margin-bottom: 10px; font-weight: 600; color: #606266; }
    }

    .group-section {
      margin-bottom: 30px;
      .group-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 15px;
        padding-left: 10px;
        border-left: 4px solid #409eff;
      }
      .check-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        border-bottom: 1px solid #f0f2f5;
        transition: background 0.3s;

        &:hover { background-color: #f9fafc; }
        &.checked .item-text { text-decoration: line-through; color: #909399; }
        .item-text { font-size: 14px; color: #606266; margin-left: 8px; }
      }
    }
  }
}
</style>
