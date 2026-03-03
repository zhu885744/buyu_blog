import { defineStore } from 'pinia'
import cache from '@/utils/cache'
import utils from '@/utils/utils'
import axios from '@/utils/request'
import { push } from '@/utils/route'

// 定义Token名称（和后端配置一致）
const TOKEN_NAME = globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN'

// 防止并发调用的标志位
let checkingToken = false
let fetchingSiteInfo = false

/**
 * 校验token（完善版）
 * @param {Object} state - 状态对象
 * @returns {Promise<void>}
 */
const checkToken = async (state = {}) => {
    // 防止并发调用
    if (checkingToken) return
    checkingToken = true
    
    const cacheName = 'user-info'
    state.login.finish = false // 先置为未完成，避免缓存欺骗

    try {
        // 1. 优先从缓存取用户信息（提升体验）
        const cacheUser = cache.get(cacheName)
        if (cacheUser) {
            state.login.user = cacheUser
            state.login.finish = true // 先设置为完成，提升用户体验
        }

        // 2. 强制校验后端Token有效性（异步）
        const { code, msg, data } = await axios.post('/api/comm/check-token', {}, {
            // 携带Cookie（适配后端从Cookie取Token）
            withCredentials: true,
            // 请求头携带Token（适配后端从Authorization取Token）
            headers: {
                Authorization: utils.get.cookie(TOKEN_NAME) || ''
            }
        })

        switch (code) {
            case 200:
                // 校验成功 → 更新状态和缓存（延长缓存有效期，比如2小时）
                state.login.user = data.user
                state.login.finish = true
                cache.set(cacheName, data.user, 7200) // 2小时缓存
                break;
            case 401: // Token过期/无效
            case 412: // Token格式错误
                await logout(state)
                break;
            default:
                console.error('Token校验失败：', msg)
                // 不登出，保持缓存中的用户信息
                state.login.finish = true
        }
    } catch (err) {
        // 网络错误/接口异常 → 保持缓存中的用户信息
        console.error('Token校验失败：', err)
        // 不登出，保持缓存中的用户信息
        if (cache.get('user-info')) {
            state.login.finish = true
        }
    } finally {
        // 重置标志位
        checkingToken = false
    }
}

/**
 * 登出（完善版）
 * @param {Object} state - 状态对象
 * @param {string|null} path - 跳转路径
 * @returns {Promise<void>}
 */
const logout = async (state = {}, path = null) => {
    // 1. 清除前端状态
    state.login.user = {}
    state.login.finish = false
    cache.del('user-info')
    utils.clear.cookie(TOKEN_NAME)

    // 2. 调用后端登出接口（兼容失败场景）
    try {
        await axios.delete('/api/comm/logout', { withCredentials: true })
    } catch (err) {
        console.error('登出接口调用失败：', err)
    }

    // 3. 跳转指定页面（默认首页）
    if (path || path === '') {
        setTimeout(() => push(path || '/'), 300)
    }
}

/**
 * 获取站点信息
 * @param {Object} state - 状态对象
 * @param {boolean} force - 是否强制刷新
 * @returns {Promise<Object|null>}
 */
const fetchSiteInfo = async (state = {}, force = false) => {
    const cacheName = 'xiao_functions'
    
    // 防止并发调用
    if (fetchingSiteInfo) return state.siteInfo
    fetchingSiteInfo = true
    
    try {
        // 直接从API获取站点信息，不使用缓存
        // 这样可以确保每次都获取最新的配置，包括enable_custom_style设置
        const response = await axios.get(`/api/config/one?key=xiao_functions`)

        // 检查响应结构
        if (response.code === 200 && response.data) {
            let siteInfo
            
            // 尝试不同的响应结构
            if (response.data.data && response.data.data.json) {
                siteInfo = response.data.data.json
            } else if (response.data.json) {
                siteInfo = response.data.json
            } else {
                siteInfo = response.data
            }
            
            // 处理反引号问题和XSS防护
            if (siteInfo && typeof siteInfo === 'object') {
                // 递归处理对象中的字符串
                const sanitizeObject = (obj) => {
                    if (!obj || typeof obj !== 'object') return obj
                    
                    Object.keys(obj).forEach(key => {
                        if (typeof obj[key] === 'string') {
                            // 移除反引号并进行基本的XSS防护
                            obj[key] = obj[key].replace(/`/g, '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                            sanitizeObject(obj[key])
                        }
                    })
                    return obj
                }
                
                siteInfo = sanitizeObject(siteInfo)
                
                // 确保enable_custom_style字段存在，默认为false
                if (siteInfo.enable_custom_style === undefined) {
                    siteInfo.enable_custom_style = false
                }
                
                state.siteInfo = siteInfo
                
                // 更新页面标题
                if (siteInfo.title) {
                    document.title = siteInfo.title
                }
                
                return siteInfo
            } else {
                console.error('站点信息格式错误:', siteInfo)
            }
        } else {
            console.error('API响应不符合预期:', response)
        }
    } catch (error) {
        console.error('获取站点信息失败:', error)
    } finally {
        // 重置标志位
        fetchingSiteInfo = false
    }
    
    return state.siteInfo
}

export const useCommStore = defineStore('comm', {
    state: () => {
        const cachedUser = cache.get('user-info') || {}
        const hasUser = !utils.is.empty(cachedUser)
        const cachedSiteInfo = cache.get('xiao_functions') || {}
        const cachedDarkMode = localStorage.getItem('dark-mode') === 'true'
        
        return {
            auth: {
                login: false,
                reset: false,
                register: false,
            },
            login: {
                finish: hasUser,
                user: cachedUser
            },
            progress: false,
            nav: {
                title: ''
            },
            siteInfo: cachedSiteInfo,
            darkMode: cachedDarkMode
        }
    },
    actions: {
        /**
         * 切换认证状态
         * @param {string} name - 认证类型
         * @param {boolean} bool - 状态值
         */
        switchAuth(name = 'login', bool = true) {
            for (const key in this.auth) {
                this.auth[key] = key === name ? bool : false
            }
        },
        
        /**
         * 登出
         * @param {string|null} path - 跳转路径
         * @returns {Promise<void>}
         */
        logout(path = null) {
            return logout(this, path)
        },
        
        /**
         * 手动触发登录态校验（比如登录后/页面刷新后）
         * @returns {Promise<void>}
         */
        async checkLoginState() {
            await checkToken(this)
        },
        
        /**
         * 获取站点信息
         * @param {boolean} force - 是否强制刷新
         * @returns {Promise<Object|null>}
         */
        async fetchSiteInfo(force = false) {
            return await fetchSiteInfo(this, force)
        },
        
        /**
         * 清除站点信息缓存
         */
        clearSiteInfoCache() {
            const cacheName = 'xiao_functions'
            cache.del(cacheName)
            this.siteInfo = {}
        },
        
        /**
         * 设置导航标题
         * @param {string} title - 标题
         */
        setNavTitle(title) {
            this.nav.title = title
        },
        
        /**
         * 设置加载状态
         * @param {boolean} state - 加载状态
         */
        setProgress(state) {
            this.progress = state
        },
        
        /**
         * 切换暗黑模式
         */
        toggleDarkMode() {
            // 确保darkMode有初始值
            if (this.darkMode === undefined) {
                this.darkMode = localStorage.getItem('dark-mode') === 'true'
            }
            
            this.darkMode = !this.darkMode
            
            // 更新HTML的data-bs-theme属性
            const htmlElement = document.documentElement
            htmlElement.setAttribute('data-bs-theme', this.darkMode ? 'dark' : 'light')
            
            // 保存用户偏好到localStorage
            localStorage.setItem('dark-mode', this.darkMode.toString())
        }
    },
    getters: {
        /**
         * 获取登录状态
         * @param {Object} state - 状态对象
         * @returns {Object} 登录状态
         */
        getLogin: (state) => {
            // 只在状态未完成且用户信息为空时校验Token
            if (!state.login.finish && utils.is.empty(state.login.user)) {
                // 使用异步方式校验，避免阻塞
                checkToken(state).catch(err => {
                    console.error('Token校验失败：', err)
                })
            }
            return state.login
        },
        
        /**
         * 获取站点信息
         * @param {Object} state - 状态对象
         * @returns {Object} 站点信息
         */
        getSiteInfo: (state) => {
            // 直接返回站点信息，不再自动获取
            return state.siteInfo
        },
        
        /**
         * 获取是否已登录
         * @param {Object} state - 状态对象
         * @returns {boolean} 是否已登录
         */
        isLoggedIn: (state) => {
            return state.login.finish && !utils.is.empty(state.login.user)
        },
        
        /**
         * 获取当前用户
         * @param {Object} state - 状态对象
         * @returns {Object} 当前用户
         */
        currentUser: (state) => {
            return state.login.user || {}
        },
        
        /**
         * 获取暗黑模式状态
         * @param {Object} state - 状态对象
         * @returns {boolean} 是否为暗黑模式
         */
        isDarkMode: (state) => {
            return state.darkMode
        }
    }
})