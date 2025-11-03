<template>
  <div class="lin-container">
    <el-card>
      <template #header>
        <span>创建视频下载任务</span>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="视频URL">
          <el-input v-model="form.url" placeholder="请输入视频URL"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="create" :loading="loading" :disabled="loading">创建任务</el-button>
        </el-form-item>
      </el-form>

      <div v-if="taskId" class="mt-3">
        <el-divider>进度</el-divider>
        <div>任务ID：{{ taskId }}</div>
        <el-progress :percentage="progress" :status="statusMap[status] || ''"></el-progress>
        <div class="mt-2">速度：{{ speed || '-' }}，ETA：{{ eta || '-' }}</div>
        <div v-if="status==='Success' && filePath" class="mt-2">
          <el-link :href="filePath" target="_blank" type="primary">下载文件</el-link>
        </div>
        <div v-if="status==='Failed' && errorMsg" class="mt-2">
          <el-alert type="error" :closable="false" :title="errorMsg" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import VideoDownload from '@/lin/model/video-download'

export default {
  name: 'video-download-create',
  data() {
    return {
      form: { url: '' },
      taskId: null,
      timer: null,
      status: 'Queued',
      progress: 0,
      speed: '',
      eta: '',
      filePath: '',
      errorMsg: '',
      loading: false,
      statusMap: {
        Success: 'success',
        Failed: 'exception',
      },
    }
  },
  methods: {
    async create() {
      if (!this.form.url) {
        this.$message.error('请输入URL')
        return
      }
      this.loading = true
      this.errorMsg = ''
      try {
        const res = await VideoDownload.createTask(this.form.url)
        this.taskId = res.task_id
        this.$message.success('任务已创建')
        this.startPolling()
      } catch (e) {
        console.error(e)
        this.$message.error('任务创建失败')
      } finally {
        this.loading = false
      }
    },
    startPolling() {
      if (this.timer) clearInterval(this.timer)
      this.timer = setInterval(async () => {
        const data = await VideoDownload.getTask(this.taskId)
        this.status = data.status
        if (data.progress?.percent) this.progress = Math.floor(data.progress.percent)
        this.speed = data.progress?.speed
        this.eta = data.progress?.eta
        this.filePath = (data.file && data.file.path) ? data.file.path : ''
        if (this.status === 'Failed') {
          this.errorMsg = (data.error && (data.error.message || data.error.code)) || '下载失败'
        }
        if (this.status === 'Success') {
          this.progress = 100
        }
        if (this.status === 'Success' || this.status === 'Failed') {
          clearInterval(this.timer)
        }
      }, 1500)
    },
  },
  beforeUnmount() {
    if (this.timer) clearInterval(this.timer)
  },
}
</script>

<style scoped>
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
</style>