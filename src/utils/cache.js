import utils from '@/utils/utils'

/**
 * 基于localStorage的缓存工具
 * 支持过期时间、JSON自动解析/序列化、过期自动清理
 * 过期时间单位：分钟，0为永久存储
 * 存储格式：{data: 原始值, expire: 过期时间戳}
 */
class Cache {
  constructor() {
    this.testKey = '__cache_test__'
  }

  /**
   * 检查localStorage是否可用
   */
  isAvailable() {
    try {
      localStorage.setItem(this.testKey, 'test')
      localStorage.removeItem(this.testKey)
      return true
    } catch {
      return false
    }
  }

  /**
   * 验证key的有效性
   */
  isValidKey(key) {
    return typeof key === 'string' && key.trim() !== ''
  }

  /**
   * 检查缓存是否存在且未过期
   */
  has(key) {
    return !utils.is.empty(this.get(key))
  }

  /**
   * 获取缓存值
   * @returns {any} 缓存值或null
   */
  get(key) {
    // 基础验证
    if (!this.isValidKey(key) || !this.isAvailable()) {
      return null
    }

    // 获取原始数据
    const rawValue = localStorage.getItem(key)
    if (rawValue === null || rawValue === '') {
      this.del(key) // 清理空值
      return null
    }

    try {
      const parsed = JSON.parse(rawValue)
      
      // 检查是否带过期时间
      if (this.isExpiredCache(parsed)) {
        this.del(key)
        return null
      }

      // 返回数据（支持旧格式兼容）
      return parsed.data !== undefined ? parsed.data : parsed
    } catch (error) {
      console.warn(`[缓存解析失败] key: ${key}`, error.message)
      // 返回原始字符串作为兜底
      return rawValue || null
    }
  }

  /**
   * 判断缓存是否过期
   */
  isExpiredCache(cacheData) {
    return cacheData && 
           typeof cacheData === 'object' && 
           cacheData.expire && 
           Date.now() > cacheData.expire
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} minutes - 过期时间（分钟，0为永久）
   */
  set(key, value, minutes = 0) {
    // 基础验证
    if (!this.isValidKey(key) || !this.isAvailable()) {
      return
    }

    // 处理undefined值
    const storeValue = value === undefined ? null : value
    
    // 构建存储数据
    let dataToStore = storeValue
    const expireMinutes = Number(minutes)
    
    if (!isNaN(expireMinutes) && expireMinutes > 0) {
      dataToStore = {
        data: storeValue,
        expire: Date.now() + expireMinutes * 60 * 1000
      }
    }

    try {
      localStorage.setItem(key, JSON.stringify(dataToStore))
    } catch (error) {
      console.error(`[缓存设置失败] key: ${key}`, error.message)
    }
  }

  /**
   * 设置缓存（别名，方便记忆）
   */
  setItem(key, value, minutes = 0) {
    return this.set(key, value, minutes)
  }

  /**
   * 获取缓存（别名，方便记忆）
   */
  getItem(key) {
    return this.get(key)
  }

  /**
   * 删除指定缓存
   */
  del(key) {
    if (!this.isValidKey(key) || !this.isAvailable()) {
      return
    }
    localStorage.removeItem(key)
  }

  /**
   * 删除缓存（别名）
   */
  removeItem(key) {
    return this.del(key)
  }

  /**
   * 清除所有缓存（谨慎使用）
   */
  clear() {
    if (!this.isAvailable()) {
      return
    }
    localStorage.clear()
  }

  /**
   * 批量设置缓存
   */
  setMultiple(items) {
    if (!Array.isArray(items) || !this.isAvailable()) {
      return false
    }

    let success = true
    items.forEach(({ key, value, minutes = 0 }) => {
      try {
        this.set(key, value, minutes)
      } catch {
        success = false
      }
    })
    
    return success
  }

  /**
   * 批量获取缓存
   */
  getMultiple(keys) {
    if (!Array.isArray(keys) || !this.isAvailable()) {
      return {}
    }

    const result = {}
    keys.forEach(key => {
      if (this.isValidKey(key)) {
        result[key] = this.get(key)
      }
    })
    
    return result
  }

  /**
   * 批量删除缓存
   */
  delMultiple(keys) {
    if (!Array.isArray(keys) || !this.isAvailable()) {
      return false
    }

    keys.forEach(key => {
      if (this.isValidKey(key)) {
        this.del(key)
      }
    })
    
    return true
  }

  /**
   * 获取所有缓存键
   */
  keys() {
    if (!this.isAvailable()) {
      return []
    }
    return Object.keys(localStorage)
  }

  /**
   * 获取缓存数量
   */
  size() {
    if (!this.isAvailable()) {
      return 0
    }
    return localStorage.length
  }

  /**
   * 清理所有过期缓存
   */
  clearExpired() {
    if (!this.isAvailable()) {
      return 0
    }

    let clearedCount = 0
    const keys = this.keys()
    
    keys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) {
        try {
          const parsed = JSON.parse(value)
          if (this.isExpiredCache(parsed)) {
            this.del(key)
            clearedCount++
          }
        } catch {
          // 忽略非JSON格式的缓存
        }
      }
    })
    
    return clearedCount
  }

  /**
   * 设置缓存并返回旧值
   */
  replace(key, value, minutes = 0) {
    const oldValue = this.get(key)
    this.set(key, value, minutes)
    return oldValue
  }

  /**
   * 缓存回调函数结果
   */
  memoize(key, callback, minutes = 0) {
    const cached = this.get(key)
    if (cached !== null) {
      return cached
    }
    
    const result = callback()
    this.set(key, result, minutes)
    return result
  }
}

// 创建单例实例
const cache = new Cache()

export default cache