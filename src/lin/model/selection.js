import _axios, { get, post, put, _delete } from '@/lin/plugin/axios'

/**
 * 产品管理模型
 */
export class Product {
  static getProducts(params) {
    return get('api/products', params)
  }

  static getProduct(id) {
    return get(`api/products/${id}`)
  }

  static createProduct(data) {
    return post('api/products', data)
  }

  static updateProduct(id, data) {
    return put(`api/products/${id}`, data)
  }

  static deleteProduct(id) {
    return _delete(`api/products/${id}`)
  }

  static batchDelete(ids) {
    return _delete('api/products/batch', { ids })
  }
}

/**
 * 企业定位模型
 */
export class Enterprise {
  static getProfile() {
    return get('api/enterprise/profile')
  }

  static createProfile(data) {
    return post('api/enterprise/profile', data)
  }

  static getHistory(params) {
    return get('api/enterprise/profile/history', params)
  }
}

/**
 * 策略执行模型
 */
export class Strategy {
  static execute(strategyCode, productId, payload = {}) {
    return post(`api/strategies/${strategyCode}/execute`, { product_id: productId, ...payload })
  }

  static executeAll(productId) {
    return post('api/strategies/execute-all', { product_id: productId })
  }

  static getStrategies() {
    return get('api/strategies')
  }

  static submitDiagnosis(productId, answers) {
    return post('api/strategies/S02/submit', { product_id: productId, answers })
  }
}

/**
 * BI 监控模型
 */
export class Dashboard {
  static getBiData(params) {
    return get('api/dashboard/bi', params)
  }

  static getAlerts(params) {
    return get('api/dashboard/alerts', params)
  }
}

/**
 * 多产品对比模型
 */
export class Comparison {
  static createComparison(data) {
    return post('api/comparison', data)
  }

  static getComparison(id) {
    return get(`api/comparison/${id}`)
  }

  static getList(params) {
    return get('api/comparison', params)
  }
}

/**
 * 审批流程模型
 */
export class Approval {
  static submitApproval(productId, data) {
    return post(`api/products/${productId}/approval`, data)
  }

  static approve(approvalId, data) {
    return post(`api/approval/${approvalId}/approve`, data)
  }

  static getPending(params) {
    return get('api/approval/pending', params)
  }

  static getHistory(params) {
    return get('api/approval/history', params)
  }
}

/**
 * 系统配置模型
 */
export class Config {
  static getConfig() {
    return get('api/config')
  }

  static updateConfig(data) {
    return put('api/config', data)
  }

  static getItems(group) {
    return get(`api/config/group/${group}`)
  }
}

/**
 * 历史趋势模型
 */
export class Trends {
  static getTrends(productId, params) {
    return get(`api/products/${productId}/trends`, params)
  }
}

/**
 * SOP 模型
 */
export class SOP {
  static getTasks(productId) {
    return get(`api/products/${productId}/sop`)
  }

  static updateTask(taskId, data) {
    return put(`api/sop/${taskId}`, data)
  }
}

/**
 * 检查清单模型
 */
export class Checklist {
  static getItems(productId, type) {
    return get(`api/products/${productId}/checklist`, { type })
  }

  static updateItem(itemId, checked) {
    return put(`api/checklist/${itemId}`, { checked })
  }
}
