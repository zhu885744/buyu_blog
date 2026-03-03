<template>
    <transition name="modal-fade" mode="out-in">
        <div 
            v-if="state.item.dialog"
            class="modal fade show"
            style="display: block;"
            tabindex="-1" 
            aria-labelledby="loginModalLabel" 
            aria-hidden="false"
            aria-modal="true"
            id="loginModal"
        >
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" style="max-width: 450px; margin: 1.75rem auto;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="loginModalLabel">账号密码登录</h5>
                        <button type="button" class="btn-close" @click="method.hide()" aria-label="Close"></button>
                    </div>
                    
                    <div class="modal-body">
                        <form @submit.prevent="method.login()">
                            <div class="mb-3">
                                <label for="loginAccountInput" class="form-label">帐号</label>
                                <input type="text" 
                                       class="form-control"
                                       id="loginAccountInput"
                                       v-model="state.struct.account"
                                       placeholder="帐号 | 邮箱 | 手机号"
                                       required
                                       autocomplete="username"
                                       :class="{ 'is-invalid': state.errors.account, 'is-valid': state.valid.account }">
                                <div v-if="state.errors.account" class="invalid-feedback">
                                    {{ state.errors.account }}
                                </div>
                                <div v-if="state.valid.account" class="valid-feedback">
                                    格式正确
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="loginPasswordInput" class="form-label">密码</label>
                                <div class="input-group">
                                    <input :type="showPassword ? 'text' : 'password'" 
                                           class="form-control"
                                           id="loginPasswordInput"
                                           v-model="state.struct.password"
                                           @keyup.enter="method.login()"
                                           placeholder="请输入密码"
                                           required
                                           autocomplete="current-password"
                                           :class="{ 'is-invalid': state.errors.password, 'is-valid': state.valid.password }">
                                    <button class="btn btn-outline-secondary"
                                            type="button" 
                                            @click="showPassword = !showPassword">
                                        <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                                    </button>
                                </div>
                                <div v-if="state.errors.password" class="invalid-feedback">
                                    {{ state.errors.password }}
                                </div>
                                <div v-if="state.valid.password" class="valid-feedback">
                                    密码长度符合要求
                                </div>
                            </div>

                            <div class="mb-3">
                                <button type="submit" 
                                        class="btn btn-primary w-100"
                                        :disabled="state.item.wait || !isFormValid">
                                    <span v-if="state.item.wait" class="spinner-border spinner-border-sm me-2" role="status"></span>
                                    {{ state.item.wait ? '登录中...' : '登录' }}
                                </button>
                            </div>
                        </form>

                        <div class="row mt-3">
                            <div class="col">
                                <button type="button" 
                                        class="btn btn-outline-secondary w-100"
                                        @click="method.reset()">
                                    忘记密码
                                </button>
                            </div>
                            <div class="col">
                                <button type="button" 
                                        class="btn btn-outline-primary w-100"
                                        v-if="parseInt(store.config.getAllowRegister?.value) === 1"
                                        @click="method.register()">
                                    注册帐号
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </transition>
    
    <transition name="backdrop-fade">
        <div 
            v-if="state.item.dialog"
            class="modal-backdrop fade show"
            @click="method.hide()"
        ></div>
    </transition>
</template>

<script setup>
import { reactive, ref, getCurrentInstance, onUnmounted, computed, watch } from 'vue'
import cache from '@/utils/cache.js'
import utils from '@/utils/utils.js'
import axios from '@/utils/request.js'
import cryptoUtil from '@/utils/crypto'
import { useCommStore } from '@/store/comm'
import { useConfigStore } from '@/store/config'

const { proxy } = getCurrentInstance()
const emit = defineEmits(['finish'])
const store = {
    comm: useCommStore(),
    config: useConfigStore()
}

const state = reactive({
    item: {
        type: 'login',
        wait: false,
        finish: false,
        dialog: false,
    },
    struct: {
        account: '',
        password: '',
    },
    errors: {
        account: '',
        password: '',
    },
    valid: {
        account: false,
        password: false,
    },
})

const showPassword = ref(false)

// 表单验证计算属性
const isFormValid = computed(() => {
    return state.valid.account && state.valid.password
})

// 账号验证
const validateAccount = (account) => {
    if (!account) {
        state.errors.account = '请输入账号'
        state.valid.account = false
        return
    }
    
    const accountRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$|^1[3-9]\d{9}$|^[a-zA-Z0-9_]{4,20}$/
    if (!accountRegex.test(account)) {
        state.errors.account = '账号格式不正确（支持邮箱、手机号、4-20位字母数字下划线）'
        state.valid.account = false
        return
    }
    
    state.errors.account = ''
    state.valid.account = true
}

// 密码验证
const validatePassword = (password) => {
    if (!password) {
        state.errors.password = '请输入密码'
        state.valid.password = false
        return
    }
    
    if (password.length < 6) {
        state.errors.password = '密码长度不能少于6位'
        state.valid.password = false
        return
    }
    
    state.errors.password = ''
    state.valid.password = true
}

// 监听表单输入变化
watch(() => state.struct.account, (newValue) => {
    validateAccount(newValue)
})

watch(() => state.struct.password, (newValue) => {
    validatePassword(newValue)
})

const cryptoUtils = {
    generateSecureKey(length = 16, salt = '') {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let secureKey = ''
        
        for (let i = 0; i < length; i++) {
            secureKey += charset.charAt(Math.floor(Math.random() * charset.length))
        }
        
        const hash = cryptoUtil.hash?.md5 ? cryptoUtil.hash.md5(`${secureKey}${Date.now()}${salt}`) : 
                    cryptoUtil.md5 ? cryptoUtil.md5(`${secureKey}${Date.now()}${salt}`) :
                    secureKey
        
        return hash.substring(0, length)
    }
}

const method = {
    async login() {
        // 手动触发验证
        validateAccount(state.struct.account)
        validatePassword(state.struct.password)
        
        if (!isFormValid.value) {
            method.showToast('请检查表单填写是否正确', 'warning')
            return
        }
        
        state.item.wait = true

        try {
            const unix = await method.unix()
            
            const iv = cryptoUtil.token ? cryptoUtil.token(`iv-${unix}`, 16, 'aes') : 
                      cryptoUtils.generateSecureKey(16, `iv-${unix}`)
            
            const key = cryptoUtil.token ? cryptoUtil.token(`key-${unix}`, 16, 'aes') : 
                       cryptoUtils.generateSecureKey(16, `key-${unix}`)
            
            const safeIv = iv.length >= 16 ? iv.substring(0, 16) : iv.padEnd(16, '0')
            const safeKey = key.length >= 16 ? key.substring(0, 16) : key.padEnd(16, '0')

            let AES
            if (cryptoUtil.createAES) {
                AES = cryptoUtil.createAES(safeKey, safeIv)
            } else if (cryptoUtil.AES) {
                AES = new cryptoUtil.AES(safeKey, safeIv)
            } else {
                throw new Error('加密工具不可用')
            }

            const params = {
                account: AES.encrypt(state.struct.account),
                password: AES.encrypt(state.struct.password)
            }

            const { data, code, msg } = await axios.post('/api/comm/login', params, {
                headers: {
                    'X-Khronos': unix,
                    'X-Gorgon': `${safeKey} ${safeIv}`,
                    'X-Argus': AES.encrypt(JSON.stringify({
                        unix, 
                        account: state.struct.account, 
                        password: state.struct.password
                    }))
                },
                timeout: 10000
            })

            state.item.wait = false

            if (code === 200) {
                const userData = data?.user || {}
                const userStatus = Number(userData.status) || 0
                
                if (userStatus === 1) {
                    method.clearCache()
                    method.showToast('当前账号已被冻结，请联系管理员！', 'error')
                    method.animation()
                    return
                }

                if (!data.token || !data.user || !data.user.id) {
                    throw new Error('登录成功但返回数据不完整')
                }

                if (cache.set) {
                    cache.set('user-info', data.user, 7 * 24 * 60)
                } else if (cache.put) {
                    cache.put('user-info', data.user, 7 * 24 * 60)
                } else {
                    localStorage.setItem('user-info', JSON.stringify({
                        data: data.user,
                        expire: Date.now() + 7 * 24 * 60 * 60 * 1000
                    }))
                }
                
                if (utils.set?.cookie) {
                    utils.set.cookie(
                        globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', 
                        data.token, 
                        7 * 24 * 60 * 60
                    )
                }
                
                state.item.finish = true
                method.hide()
                
                store.comm.login.finish = true
                store.comm.login.user = data.user
                store.comm.switchAuth('login', false)
                
                emit('finish', data.user)
                return
            }
            
            if (code === 201) {
                method.showToast(msg, 'info')
                return
            }

            method.animation()
            method.showToast(msg || '登录失败，请检查账号密码', 'error')
            method.clearCache()

        } catch (error) {
            let errorMsg = '登录失败，请稍后重试'
            if (error.message.includes('超时')) {
                errorMsg = '请求超时，请检查网络连接'
            } else if (error.message.includes('加密')) {
                errorMsg = '加密处理失败'
            }
            
            method.showToast(errorMsg, 'error')
            method.clearCache()
            method.animation()
            state.item.wait = false
        }
    },

    show() {
        state.item.dialog = true
        state.struct.account = ''
        state.struct.password = ''
        state.errors.account = ''
        state.errors.password = ''
        state.valid.account = false
        state.valid.password = false
        showPassword.value = false
        
        // 禁止页面滚动
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.width = '100%'
        document.body.style.height = '100%'
        document.body.style.top = '0'
        document.body.style.left = '0'
        document.body.style.zIndex = '1059'
        
        setTimeout(() => {
            const accountInput = document.getElementById('loginAccountInput')
            if (accountInput) {
                accountInput.focus()
            }
        }, 300)
    },

    hide() {
        state.item.dialog = false
        showPassword.value = false
        
        // 恢复页面滚动
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.height = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.zIndex = ''
    },

    register() {
        method.hide()
        setTimeout(() => {
            store.comm.switchAuth('register', true)
        }, 300)
    },

    reset() {
        method.hide()
        setTimeout(() => {
            store.comm.switchAuth('reset', true)
        }, 300)
    },

    animation() {
        const el = proxy.$refs.password
        if (el) {
            el.classList.add('shake-horizontal')
            setTimeout(() => {
                el.classList.remove('shake-horizontal')
            }, 1000)
        }
    },

    clearCache() {
        try {
            if (utils.set?.cookie) {
                utils.set.cookie(
                    globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', '', -1
                )
            }
            
            if (cache && typeof cache.remove === 'function') {
                cache.remove('user-info')
            } else if (cache && typeof cache.del === 'function') {
                cache.del('user-info')
            } else if (cache && typeof cache.delete === 'function') {
                cache.delete('user-info')
            } else if (cache && typeof cache.clear === 'function') {
                cache.clear()
            }
            
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('user-info')
            }
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem('user-info')
            }
            
            if (store.comm.login) {
                store.comm.login.finish = false
                store.comm.login.user = null
            }
        } catch (error) {
            // 忽略缓存清理错误
        }
    },

    async unix() {
        try {
            const { code, data } = await axios.get('/dev/info/time', {
                timeout: 5000
            })
            if (code === 200 && data.unix && typeof data.unix === 'number') {
                return data.unix
            }
        } catch (error) {
            // 忽略获取服务器时间失败的错误
        }
        
        return Math.round(Date.now() / 1000)
    },

    showToast(message, type = 'info') {
        try {
            if (typeof window !== 'undefined' && window.Toast) {
                const toastType = type === 'success' ? 'success' : 
                               type === 'error' ? 'error' : 
                               type === 'warning' ? 'warning' : 'info'
                
                if (window.Toast[toastType]) {
                    window.Toast[toastType](message)
                    return
                }
            }
            
            if (typeof window !== 'undefined' && window.$toast) {
                if (window.$toast[type]) {
                    window.$toast[type](message)
                    return
                }
            }
        } catch (error) {
            // 忽略显示消息失败的错误
        }
    }
}

onUnmounted(() => {
    state.struct.account = ''
    state.struct.password = ''
    showPassword.value = false
    
    // 确保在组件卸载时恢复页面滚动
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
    document.body.style.height = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.zIndex = ''
})

defineExpose({
    show: method.show,
    hide: method.hide
})
</script>

<style scoped>
/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
    transform: scale(0.95);
}

.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
    transition: opacity 0.3s ease;
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
    opacity: 0;
}
</style>