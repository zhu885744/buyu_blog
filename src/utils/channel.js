/**
 * 跨标签页通信工具（基于BroadcastChannel）
 * 支持：多回调、事件命名、一次性监听、错误恢复、内存管理
 * 兼容：现代浏览器（Chrome 54+, Firefox 63+, Safari 15.4+, Edge 79+）
 */
class Channel {
  /**
   * 构造函数：创建广播信道实例
   */
  constructor(name = 'default') {
    // 规范化信道名称
    this.channelName = this.normalizeChannelName(name)
    
    // 存储结构优化
    this.listeners = new Map()  // 事件名 -> 回调数组
    this.onceListeners = new Map() // 一次性监听器
    
    // 初始化状态
    this.isClosed = false
    this.messageQueue = [] // 重连时的消息队列
    
    // 尝试初始化信道
    this.initChannel()
    
    // 自动清理：页面卸载时自动关闭
    this.bindUnloadHandler()
  }

  /**
   * 规范化信道名称
   */
  normalizeChannelName(name) {
    if (typeof name === 'string') {
      const trimmed = name.trim()
      return trimmed || 'default'
    }
    return 'default'
  }

  /**
   * 初始化BroadcastChannel
   */
  initChannel() {
    try {
      // 检查浏览器支持
      if (!window.BroadcastChannel) {
        throw new Error('浏览器不支持 BroadcastChannel API')
      }
      
      this.bc = new BroadcastChannel(this.channelName)
      
      // 绑定消息监听
      this.bc.onmessage = this.handleMessage.bind(this)
      this.bc.onmessageerror = this.handleError.bind(this)
      
      // console.log(`[Channel] 信道 "${this.channelName}" 初始化成功`)
    } catch (error) {
      // console.error(`[Channel] 信道 "${this.channelName}" 初始化失败:`, error.message)
      this.bc = null
      this.isClosed = true
    }
  }

  /**
   * 绑定页面卸载处理器
   */
  bindUnloadHandler() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.close()
      })
    }
  }

  /**
   * 消息处理器
   */
  handleMessage(event) {
    if (!event?.data || this.isClosed) return
    
    const { type = 'message', data, timestamp = Date.now() } = event.data
    
    // 获取对应类型的监听器
    const listeners = this.listeners.get(type) || []
    const onceListeners = this.onceListeners.get(type) || []
    
    // 执行普通监听器
    listeners.forEach(callback => {
      try {
        callback(data, { type, timestamp, channel: this.channelName })
      } catch (error) {
        // console.error(`[Channel] 监听器执行错误 (${type}):`, error)
      }
    })
    
    // 执行一次性监听器
    onceListeners.forEach(callback => {
      try {
        callback(data, { type, timestamp, channel: this.channelName })
      } catch (error) {
        // console.error(`[Channel] 一次性监听器执行错误 (${type}):`, error)
      }
    })
    
    // 清理一次性监听器
    if (onceListeners.length > 0) {
      this.onceListeners.delete(type)
    }
  }

  /**
   * 错误处理器
   */
  handleError(event) {
    // console.error(`[Channel] 信道 "${this.channelName}" 消息错误:`, event)
  }

  /**
   * 监听指定类型的事件
   * @param {string|Function} typeOrCallback - 事件类型或回调函数
   * @param {Function} [callback] - 回调函数
   * @returns {Function} 取消监听的函数
   */
  on(typeOrCallback, callback) {
    if (this.isClosed) {
      // console.warn('[Channel] 信道已关闭，无法添加监听器')
      return () => {}
    }
    
    let type, handler
    
    if (typeof typeOrCallback === 'function') {
      type = 'message'
      handler = typeOrCallback
    } else {
      type = typeOrCallback || 'message'
      handler = callback
    }
    
    if (typeof handler !== 'function') {
      console.warn('[Channel] 监听器必须是函数')
      return () => {}
    }
    
    // 添加到监听器列表
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type).push(handler)
    
    // 返回取消监听的函数
    return () => this.off(type, handler)
  }

  /**
   * 一次性监听
   */
  once(typeOrCallback, callback) {
    if (this.isClosed) return () => {}
    
    let type, handler
    
    if (typeof typeOrCallback === 'function') {
      type = 'message'
      handler = typeOrCallback
    } else {
      type = typeOrCallback || 'message'
      handler = callback
    }
    
    if (typeof handler !== 'function') return () => {}
    
    if (!this.onceListeners.has(type)) {
      this.onceListeners.set(type, [])
    }
    this.onceListeners.get(type).push(handler)
    
    return () => {
      const listeners = this.onceListeners.get(type)
      if (listeners) {
        const index = listeners.indexOf(handler)
        if (index > -1) listeners.splice(index, 1)
      }
    }
  }

  /**
   * 移除监听器
   */
  off(typeOrCallback, callback) {
    let type, handler
    
    if (typeof typeOrCallback === 'function') {
      type = 'message'
      handler = typeOrCallback
    } else {
      type = typeOrCallback || 'message'
      handler = callback
    }
    
    if (!handler) {
      // 移除该类型的所有监听器
      this.listeners.delete(type)
      this.onceListeners.delete(type)
      return true
    }
    
    // 移除普通监听器
    const listeners = this.listeners.get(type)
    if (listeners) {
      const index = listeners.indexOf(handler)
      if (index > -1) {
        listeners.splice(index, 1)
        if (listeners.length === 0) {
          this.listeners.delete(type)
        }
        return true
      }
    }
    
    // 移除一次性监听器
    const onceListeners = this.onceListeners.get(type)
    if (onceListeners) {
      const index = onceListeners.indexOf(handler)
      if (index > -1) {
        onceListeners.splice(index, 1)
        if (onceListeners.length === 0) {
          this.onceListeners.delete(type)
        }
        return true
      }
    }
    
    return false
  }

  /**
   * 发送消息
   * @param {any} data - 消息数据
   * @param {string} [type='message'] - 消息类型
   * @returns {boolean} 是否发送成功
   */
  emit(data, type = 'message') {
    if (this.isClosed) {
      console.warn('[Channel] 信道已关闭，无法发送消息')
      return false
    }
    
    if (!this.bc) {
      // 信道不可用时，将消息加入队列（可选）
      this.messageQueue.push({ type, data, timestamp: Date.now() })
      console.warn('[Channel] 信道不可用，消息已加入队列')
      return false
    }
    
    try {
      const message = {
        type: type || 'message',
        data,
        timestamp: Date.now(),
        channel: this.channelName,
        source: 'channel'
      }
      
      this.bc.postMessage(message)
      return true
    } catch (error) {
      console.error(`[Channel] 发送消息失败 (${type}):`, error)
      return false
    }
  }

  /**
   * 发送并等待响应（类似RPC）
   * @param {any} data - 发送的数据
   * @param {string} [type='request'] - 请求类型
   * @param {number} [timeout=5000] - 超时时间（毫秒）
   * @returns {Promise<any>}
   */
  request(data, type = 'request', timeout = 5000) {
    return new Promise((resolve, reject) => {
      if (this.isClosed) {
        reject(new Error('信道已关闭'))
        return
      }
      
      const requestId = `${this.channelName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const responseType = `${type}.response.${requestId}`
      
      // 设置超时
      const timeoutId = setTimeout(() => {
        this.off(responseType, responseHandler)
        reject(new Error('请求超时'))
      }, timeout)
      
      // 响应处理器
      const responseHandler = (responseData) => {
        clearTimeout(timeoutId)
        this.off(responseType, responseHandler)
        resolve(responseData)
      }
      
      // 监听响应
      this.once(responseType, responseHandler)
      
      // 发送请求
      const requestData = {
        ...data,
        _requestId: requestId,
        _responseType: responseType
      }
      
      if (!this.emit(requestData, type)) {
        clearTimeout(timeoutId)
        this.off(responseType, responseHandler)
        reject(new Error('发送请求失败'))
      }
    })
  }

  /**
   * 重连信道
   */
  reconnect() {
    if (!this.isClosed && this.bc) {
      console.warn('[Channel] 信道已连接，无需重连')
      return true
    }
    
    try {
      this.close() // 清理旧连接
      this.initChannel()
      this.isClosed = false
      
      // 重连成功后发送队列中的消息
      if (this.messageQueue.length > 0) {
        console.log(`[Channel] 重连成功，发送 ${this.messageQueue.length} 条队列消息`)
        this.messageQueue.forEach(msg => this.emit(msg.data, msg.type))
        this.messageQueue = []
      }
      
      return true
    } catch (error) {
      console.error('[Channel] 重连失败:', error)
      return false
    }
  }

  /**
   * 获取信道状态
   */
  getStatus() {
    return {
      channelName: this.channelName,
      isClosed: this.isClosed,
      hasChannel: !!this.bc,
      listenerCount: this.listeners.size + this.onceListeners.size,
      queueLength: this.messageQueue.length
    }
  }

  /**
   * 清理所有监听器
   */
  clear() {
    this.listeners.clear()
    this.onceListeners.clear()
    this.messageQueue = []
    return true
  }

  /**
   * 关闭信道
   */
  close() {
    if (this.isClosed) return
    
    this.isClosed = true
    
    // 清理监听器
    this.clear()
    
    // 关闭BroadcastChannel
    if (this.bc) {
      try {
        this.bc.close()
      } catch (error) {
        console.error('[Channel] 关闭信道时出错:', error)
      }
      this.bc = null
    }
    
    // 移除页面卸载监听
    if (this.unloadHandler) {
      window.removeEventListener('beforeunload', this.unloadHandler)
      this.unloadHandler = null
    }
    
    console.log(`[Channel] 信道 "${this.channelName}" 已关闭`)
  }

  /**
   * 静态方法：快速创建实例
   */
  static create(name = 'default') {
    return new Channel(name)
  }

  /**
   * 静态方法：检查浏览器支持
   */
  static isSupported() {
    return typeof window !== 'undefined' && !!window.BroadcastChannel
  }

  /**
   * 静态方法：创建命名空间
   */
  static namespace(name) {
    return new Channel(name)
  }
}

// 导出单例和类
export default Channel

// 可选：导出默认信道实例
export const defaultChannel = Channel.create('default')