<template>
  <div class="lin-container">
    <el-card>
      <template #header>
        <span>下载任务历史</span>
        <el-button class="float-right" type="primary" @click="refresh">刷新</el-button>
      </template>
      <el-table :data="items" style="width: 100%">
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="url" label="URL" />
        <el-table-column prop="status" label="状态" width="120" />
        <el-table-column prop="progress_percent" label="进度(%)" width="120" />
        <el-table-column label="文件" width="180">
          <template #default="{ row }">
            <el-link v-if="row.file_path" :href="row.file_path" target="_blank" type="primary">下载</el-link>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="creation_time" label="创建时间" width="180" />
      </el-table>
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="size"
        :current-page="page"
        @current-change="changePage"
      />
    </el-card>
  </div>
</template>

<script>
import VideoDownload from '@/lin/model/video-download'

export default {
  name: 'video-download-list',
  data() {
    return {
      page: 1,
      size: 10,
      total: 0,
      items: [],
    }
  },
  methods: {
    async load() {
      const res = await VideoDownload.getTasks({ page: this.page, size: this.size })
      this.total = res.total
      this.items = (res.items || []).map(x => ({
        id: x.id,
        url: x.url,
        status: x.status,
        progress_percent: Math.floor((x.progressPercent || x.progress_percent || 0)),
        creation_time: x.createTime || x.creationTime || x.creation_time,
        file_path: (x.file && (x.file.path || x.file.url)) || x.file_path || x.filePath || ''
      }))
    },
    changePage(p) {
      this.page = p
      this.load()
    },
    refresh() {
      this.load()
    },
  },
  mounted() {
    this.load()
  },
}
</script>

<style scoped>
.float-right { float: right; }
</style>