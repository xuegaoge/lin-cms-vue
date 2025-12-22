import _axios, { get, post, put, _delete } from '@/lin/plugin/axios'

/**
 * 产品管理模型
 */
export class Product {
  static getProducts(params) {
    return get('api/selection/products', params)
  }

  static getProduct(id) {
    return get(`api/selection/products/${id}`)
  }

  static createProduct(data) {
    return post('api/selection/products', data)
  }

  static updateProduct(id, data) {
    return put(`api/selection/products/${id}`, data)
  }

  static deleteProduct(id) {
    return _delete(`api/selection/products/${id}`)
  }

  static batchDelete(ids) {
    return _delete('api/selection/products/batch', { ids })
  }
}

/**
 * 企业定位模型
 */
export class Enterprise {
  static getProfile() {
    return get('api/selection/enterprise/profile')
  }

  static createProfile(data) {
    return post('api/selection/enterprise/profile', data)
  }

  static getHistory(params) {
    return get('api/selection/enterprise/profile/history', params)
  }
}

/**
 * 策略执行模型
 */
export class Strategy {
  static execute(strategyCode, productId, payload = {}) {
    return post(`api/selection/strategies/${strategyCode}/execute`, { product_id: productId, ...payload })
  }

  static executeAll(productId) {
    return post('api/selection/strategies/execute-all', { product_id: productId })
  }

  static getStrategies() {
    return get('api/selection/strategies')
  }

  static submitDiagnosis(productId, answers) {
    return post('api/selection/strategies/S02/submit', { product_id: productId, answers })
  }

  // 新增: 获取策略执行历史
  static getExecutionHistory(productId, params = {}) {
    return get(`api/selection/strategies/products/${productId}/strategies`, params)
  }

  // 新增: 获取单次执行详情
  static getExecutionDetail(executionId) {
    return get(`api/selection/strategies/executions/${executionId}`)
  }

  // 新增: 重新执行
  static reExecute(executionId) {
    return post(`api/selection/strategies/executions/${executionId}/re-execute`)
  }
}

/**
 * BI 监控模型
 */
export class Dashboard {
  static getBiData(params) {
    return get('api/selection/dashboard/bi', params)
  }

  static getAlerts(params) {
    return get('api/selection/dashboard/alerts', params)
  }
}

/**
 * 多产品对比模型
 */
export class Comparison {
  static createComparison(data) {
    return post('api/selection/comparison', data)
  }

  static getComparison(id) {
    return get(`api/selection/comparison/${id}`)
  }

  static getList(params) {
    return get('api/selection/comparison', params)
  }
}

/**
 * 审批流程模型
 */
export class Approval {
  static submitApproval(productId, data) {
    return post(`api/selection/products/${productId}/approval`, data)
  }

  static approve(approvalId, data) {
    return post(`api/selection/approval/${approvalId}/approve`, data)
  }

  static getPending(params) {
    return get('api/selection/approval/pending', params)
  }

  static getHistory(params) {
    return get('api/selection/approval/history', params)
  }
}

/**
 * 系统配置模型
 */
export class Config {
  static getConfig() {
    return get('api/selection/config')
  }

  static updateConfig(data) {
    return put('api/selection/config', data)
  }

  static getItems(group) {
    return get(`api/selection/config/group/${group}`)
  }
}

/**
 * 历史趋势模型
 */
export class Trends {
  static getTrends(productId, params) {
    return get(`api/selection/products/${productId}/trends`, params)
  }
}

/**
 * SOP 模型
 */
export class SOP {
  static getTasks(productId) {
    return get(`api/selection/products/${productId}/sop`)
  }

  static updateTask(taskId, data) {
    return put(`api/selection/sop/${taskId}`, data)
  }
}

/**
 * 检查清单模型
 */
export class Checklist {
  static getItems(productId, type) {
    return get(`api/selection/products/${productId}/checklist`, { type })
  }

  static updateItem(itemId, checked) {
    return put(`api/selection/checklist/${itemId}`, { checked })
  }
}
