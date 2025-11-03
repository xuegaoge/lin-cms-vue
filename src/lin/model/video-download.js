import { post, get } from '@/lin/plugin/axios'

export default class VideoDownload {
  static createTask(url) {
    return post('cms/video-download/tasks', { url })
  }

  static getTask(taskId) {
    return get(`cms/video-download/tasks/${taskId}`)
  }

  static getTasks(params = { page: 1, size: 10 }) {
    return get('cms/video-download/tasks', params)
  }
}