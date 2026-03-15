import axios from 'axios'
import utils from '@/utils/utils'

// 设置超时
axios.defaults.timeout = 60 * 1000
// 基础地址：使用环境变量配置
// 开发环境使用相对路径，通过Vite代理发送请求
// 生产环境使用环境变量中的配置
let baseURL = import.meta.env.DEV ? '' : import.meta.env.VITE_API_URI || ''

// 设置axios默认配置
axios.defaults.withCredentials = false

// 请求拦截
// 所有的网络请求都会先走这个方法
axios.interceptors.request.use(
    axiosConfig => {
        // API-Key：从环境变量中获取
        const apiKey = import.meta.env.VITE_API_KEY || globalThis?.inis?.api?.key
        if (!utils.is.empty(apiKey)) {
            axiosConfig.headers['i-api-key'] = apiKey
        }
        // Token名称：从环境变量中获取
        let TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME || globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN'
        // 检查cookie中的token
        if (utils.has.cookie(TOKEN_NAME)) {
            let token = utils.get.cookie(TOKEN_NAME)
            if (!utils.is.empty(token)) {
                axiosConfig.headers.Authorization = token
            }
        } 
        // 检查localStorage中的token
        else if (utils.has.storage(TOKEN_NAME)) {
            let token = utils.get.storage(TOKEN_NAME, false)
            if (!utils.is.empty(token)) {
                axiosConfig.headers.Authorization = token
            }
        } 
        // 检查sessionStorage中的token
        else if (utils.has.session(TOKEN_NAME)) {
            let token = utils.get.session(TOKEN_NAME, false)
            if (!utils.is.empty(token)) {
                axiosConfig.headers.Authorization = token
            }
        }
        return axiosConfig
    },
    error  => Promise.reject(error)
)

// 响应拦截
// 所有的网络请求返回数据之后都会先执行这个方法
axios.interceptors.response.use(
    response => response.data,
    error => {
        // 处理401错误（token过期或无效）
        if (error.response && error.response.status === 401) {
            // Token名称：从环境变量中获取
            let TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME || globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN'
            // 清除token
            utils.clear.cookie(TOKEN_NAME)
            utils.clear.storage(TOKEN_NAME)
            utils.clear.session(TOKEN_NAME)
            // 跳转到登录页
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default {
    // all
    all: async array => {
      return await axios.all(array)
    },

    // GET请求：直接传递参数
    get: async (url, params = {}, config = {}) => {
      return await axios.get(url, { params, baseURL, ...config })
    },

    // DELETE请求：保留原有封装方式，不修改
    del: async (url, params = {}, config = {}) => {
      return await axios.delete(url, { params, baseURL, ...config })
    },

    // PUT请求：保留原有封装方式，不修改
    put: async (url, data = {}, config = {}) => {
      return await axios.put(url, data, { baseURL, ...config })
    },

    // POST请求：保留原有封装方式，不修改
    post: async (url, data = {}, config = {}) => {
      return await axios.post(url, data, { baseURL, ...config })
    },

    // 获取当前基础地址
    getBaseURL: () => baseURL,

    // 检查登录状态
    isLoggedIn: () => {
      let TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME || globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN'
      return utils.has.cookie(TOKEN_NAME) || utils.has.storage(TOKEN_NAME) || utils.has.session(TOKEN_NAME)
    },

    // 清除登录状态
    logout: () => {
      let TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME || globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN'
      utils.clear.cookie(TOKEN_NAME)
      utils.clear.storage(TOKEN_NAME)
      utils.clear.session(TOKEN_NAME)
    },

    // 存储token
    setToken: (token, storageType = 'localStorage') => {
      let TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME || globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN'
      if (storageType === 'cookie') {
        utils.set.cookie(TOKEN_NAME, token, 86400) // 24小时
      } else if (storageType === 'sessionStorage') {
        utils.set.session(TOKEN_NAME, token)
      } else {
        utils.set.storage(TOKEN_NAME, token)
      }
    },

    // 获取token
    getToken: () => {
      let TOKEN_NAME = import.meta.env.VITE_TOKEN_NAME || globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN'
      if (utils.has.cookie(TOKEN_NAME)) {
        return utils.get.cookie(TOKEN_NAME)
      } else if (utils.has.storage(TOKEN_NAME)) {
        return utils.get.storage(TOKEN_NAME, false)
      } else if (utils.has.session(TOKEN_NAME)) {
        return utils.get.session(TOKEN_NAME, false)
      }
      return null
    },

    // 验证token有效性
    validateToken: async function() {
      try {
        await axios.get('/api/user/info')
        return true
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.logout()
          return false
        }
        return false
      }
    },

    // 启动token定时检查
    startTokenCheck: function(interval = 60000) {
      const self = this
      setInterval(() => {
        if (self.isLoggedIn()) {
          self.validateToken()
        }
      }, interval)
    },
}