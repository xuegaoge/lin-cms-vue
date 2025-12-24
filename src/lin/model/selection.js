import _axios, { get, post, put, _delete } from '@/lin/plugin/axios'

/**
 * 产品管理模型
 */
export class Product {
  static getProducts(params) {
    return get('api/selection/products', params)
  }

  static getProduct(id) {
    if (!id || id === 'undefined' || id === 'create' || isNaN(id) || String(id) === 'undefined') {
      return Promise.resolve(null)
    }
    return get(`api/selection/products/${id}`)
  }

  static createProduct(data) {
    return post('api/selection/products', data)
  }

  static updateProduct(id, data) {
    if (!id || id === 'undefined' || isNaN(id) || String(id) === 'undefined') {
      return Promise.resolve(null)
    }
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
/**
 * 统一策略结果数据结构 (处理大小写不一致问题)
 */
function normalizeStrategyData(data) {
  if (!data) return data

  // 处理数组
  if (Array.isArray(data)) {
    return data.map(item => normalizeStrategyData(item))
  }

  // 处理对象
  if (typeof data === 'object') {
    const normalized = { ...data }

    // 映射表：标准字段 -> 可能的原始字段
    const fieldMap = {
      score: ['Score', 'score'],
      decision: ['Decision', 'decision'],
      grade: ['Grade', 'grade'],
      reason: ['Reason', 'reason'],
      strategyName: ['StrategyName', 'strategyName', 'strategy_name'],
      strategyCode: ['StrategyCode', 'strategyCode', 'strategy_code'],
      subResults: ['SubResults', 'subResults', 'sub_results'],
      detailJson: ['DetailJson', 'detailJson', 'detail_json'],
      suggestions: ['Suggestions', 'suggestions'],
      warnings: ['Warnings', 'warnings'],
      indicators: ['Indicators', 'indicators'],
      recommendations: ['Recommendations', 'recommendations'],
      riskAlerts: ['RiskAlerts', 'riskAlerts', 'risk_alerts']
    }

    // 执行映射
    Object.keys(fieldMap).forEach(key => {
      const sourceKeys = fieldMap[key]
      for (const sourceKey of sourceKeys) {
        if (data[sourceKey] !== undefined) {
          normalized[key] = data[sourceKey]
          break
        }
      }
    })

    // 递归处理子结构
    if (normalized.subResults && Array.isArray(normalized.subResults)) {
      normalized.subResults = normalized.subResults.map(sub => normalizeStrategyData(sub))
    }

    // 递归处理风险预警项
    if (normalized.riskAlerts && Array.isArray(normalized.riskAlerts)) {
      normalized.riskAlerts = normalized.riskAlerts.map(alert => {
        // 归一化每个风险项的字段名
        return {
          riskCode: alert.riskCode ?? alert.RiskCode ?? '',
          riskName: alert.riskName ?? alert.RiskName ?? '',
          riskLevel: alert.riskLevel ?? alert.RiskLevel ?? '',
          riskType: alert.riskType ?? alert.RiskType ?? '',
          description: alert.description ?? alert.Description ?? '',
          triggerValue: alert.triggerValue ?? alert.TriggerValue ?? '',
          thresholdValue: alert.thresholdValue ?? alert.ThresholdValue ?? '',
          suggestions: alert.suggestions ?? alert.Suggestions ?? []
        }
      })
    }

    // 自动解析 DetailJson
    if (normalized.detailJson && typeof normalized.detailJson === 'string') {
      try {
        const parsed = JSON.parse(normalized.detailJson)
        // 尝试归一化解析后的 JSON，如果是对象
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          // 将解析后的字段也合并进来 (例如 Finance.Roi)
          // 注意：这里我们只把 detailJson 解析成对象放回去，不深度合并以免覆盖
          normalized.detailData = normalizeStrategyData(parsed)
        } else {
          normalized.detailData = parsed
        }
      } catch (e) { }
    } else if (normalized.detailJson) {
      normalized.detailData = normalizeStrategyData(normalized.detailJson)
    }

    return normalized
  }

  return data
}

export class Strategy {
  static async execute(strategyCode, productId, payload = {}) {
    const res = await post(`api/selection/strategies/${strategyCode}/execute`, { product_id: productId, ...payload })
    return normalizeStrategyData(res)
  }

  static executeAll(productId) {
    return post('api/selection/strategies/execute-all', { product_id: productId })
  }

  static getStrategies() {
    return get('api/selection/strategies')
  }

  static submitDiagnosis(productId, answers) {
    return post('api/selection/strategies/S02/submit', { product_id: productId, answers: answers })
  }

  // 新增: 获取策略执行历史
  static async getExecutionHistory(productId, params = {}) {
    if (!productId || productId === 'undefined' || isNaN(productId) || String(productId) === 'undefined') {
      return []
    }
    const res = await get(`api/selection/strategies/products/${productId}/strategies`, params)
    // 如果返回的是分页结构 { total: 10, items: [] } 或 { items: [] }
    if (res && res.items) {
      res.items = normalizeStrategyData(res.items)
    } else if (Array.isArray(res)) {
      return normalizeStrategyData(res)
    }
    return res
  }

  // 新增: 获取单次执行详情
  static async getExecutionDetail(executionId) {
    const res = await get(`api/selection/strategies/executions/${executionId}`)
    return normalizeStrategyData(res)
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
