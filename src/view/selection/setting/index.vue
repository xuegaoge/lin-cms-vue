<template>
  <div class="container">
    <div class="header">
      <div class="title">系统全局设置</div>
      <el-button type="primary" @click="handleSaveAll">保存所有修改</el-button>
    </div>

    <div class="setting-container">
      <el-tabs tab-position="left" class="setting-tabs">
        <el-tab-pane label="财务参数配置">
          <div class="pane-content">
            <h3>财务与税务参数</h3>
            <el-form label-width="180px">
              <el-form-item label="美国站 VAT 税率 (%)">
                <el-input-number v-model="settings.tax.us_vat" :precision="2" :step="0.1" />
              </el-form-item>
              <el-form-item label="欧洲站平均税率 (%)">
                <el-input-number v-model="settings.tax.eu_vat" :precision="2" :step="0.1" />
              </el-form-item>
              <el-form-item label="汇率 (USD/CNY)">
                <el-input-number v-model="settings.finance.exchange_rate" :precision="4" :step="0.01" />
              </el-form-item>
              <el-form-item label="退货损耗系数">
                <el-input-number v-model="settings.finance.return_loss" :precision="2" :step="0.05" />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="运费模板管理">
          <div class="pane-content">
             <h3>运费计算模板</h3>
             <el-table :data="settings.shipping" border>
                <el-table-column prop="type" label="运输方式" />
                <el-table-column prop="unit_price" label="单位运费 ($/kg)" />
                <el-table-column prop="min_weight" label="起重 (kg)" />
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button link type="primary">编辑</el-button>
                  </template>
                </el-table-column>
             </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="策略阈值配置">
          <div class="pane-content">
            <h3>全局策略决策阈值</h3>
            <el-alert title="这些阈值将作为默认值影响所有产品的 GO/WAIT/STOP 判定结果。" type="info" show-icon :closable="false" style="margin-bottom: 20px" />
            <el-form label-width="180px">
               <el-form-item label="S01 综合评分 GO 线">
                 <el-slider v-model="settings.thresholds.s01_go" :min="60" :max="95" show-input />
               </el-form-item>
               <el-form-item label="S03 预期 ROI 底线 (%)">
                 <el-input-number v-model="settings.thresholds.roi_min" />
               </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const settings = reactive({
    tax: {
        us_vat: 0.00,
        eu_vat: 19.00
    },
    finance: {
        exchange_rate: 7.12,
        return_loss: 0.15
    },
    thresholds: {
        s01_go: 75,
        roi_min: 30
    },
    shipping: [
        { type: '空运', unit_price: 6.5, min_weight: 21 },
        { type: '海运 (美西)', unit_price: 1.2, min_weight: 100 },
        { type: '海运 (美东)', unit_price: 1.8, min_weight: 100 }
    ]
})

const handleSaveAll = () => {
    ElMessage.success('系统设置已全量更新')
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
  .setting-container {
      background: #fff;
      padding: 20px;
      border-radius: 4px;
      min-height: 500px;
      .setting-tabs {
          height: 100%;
          .pane-content {
              padding: 0 40px;
              h3 { margin-bottom: 30px; color: #303133; }
          }
      }
  }
}
</style>
