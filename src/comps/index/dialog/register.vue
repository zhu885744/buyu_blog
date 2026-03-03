<template>
    <transition name="modal-fade" mode="out-in">
        <div 
            v-if="state.item.dialog"
            class="modal fade show"
            style="display: block;"
            tabindex="-1" 
            aria-labelledby="registerModalLabel" 
            aria-hidden="false"
            data-bs-backdrop="static"
        >
            <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" style="max-width: 450px; margin: 1.75rem auto;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="registerModalLabel">注册账号</h5>
                        <button type="button" class="btn-close" @click="method.hide()" aria-label="Close"></button>
                    </div>
                    
                    <div class="modal-body">
                        <form @submit.prevent="method.register()" novalidate>
                            <div class="mb-3">
                                <label for="nicknameInput" class="form-label">
                                    昵称 <span class="text-danger">*</span>
                                </label>
                                <input type="text" 
                                       class="form-control" 
                                       id="nicknameInput"
                                       v-model="state.struct.nickname"
                                       placeholder="希望别人怎么称呼您？"
                                       required
                                       :class="{ 'is-invalid': state.errors.nickname, 'is-valid': state.valid.nickname }">
                                <div v-if="state.errors.nickname" class="invalid-feedback">
                                    {{ state.errors.nickname }}
                                </div>
                                <div v-if="state.valid.nickname" class="valid-feedback">
                                    昵称格式正确
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="accountInput" class="form-label">
                                    账号 <span class="text-danger">*</span>
                                </label>
                                <input type="text" 
                                       class="form-control" 
                                       id="registerAccountInput"
                                       v-model="state.struct.account"
                                       placeholder="定制您的专属账号"
                                       required
                                       :class="{ 'is-invalid': state.errors.account, 'is-valid': state.valid.account }">
                                <div v-if="state.errors.account" class="invalid-feedback">
                                    {{ state.errors.account }}
                                </div>
                                <div v-if="state.valid.account" class="valid-feedback">
                                    账号格式正确
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="socialInput" class="form-label">
                                    邮箱或手机号 <span class="text-danger">*</span>
                                </label>
                                <input type="text" 
                                       class="form-control" 
                                       id="socialInput"
                                       v-model="state.struct.social"
                                       placeholder="电子邮箱或手机号"
                                       required
                                       :class="{ 'is-invalid': state.errors.social, 'is-valid': state.valid.social }">
                                <div v-if="state.errors.social" class="invalid-feedback">
                                    {{ state.errors.social }}
                                </div>
                                <div v-if="state.valid.social" class="valid-feedback">
                                    格式正确
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="codeInput" class="form-label">
                                    验证码 <span class="text-danger">*</span>
                                </label>
                                <div class="input-group">
                                    <input type="text" 
                                           class="form-control" 
                                           id="codeInput"
                                           v-model="state.struct.code"
                                           placeholder="请输入验证码"
                                           required
                                           autocomplete="username"
                                           :class="{ 'is-invalid': state.errors.code, 'is-valid': state.valid.code }">
                                    <button type="button" 
                                            class="btn btn-outline-primary" 
                                            @click="method.code()"
                                            :disabled="state.item.loading || !state.valid.social">
                                        <span v-if="state.item.loading" class="spinner-border spinner-border-sm me-1"></span>
                                        {{ state.item.loading ? `${state.item.second}秒后重试` : '获取验证码' }}
                                    </button>
                                </div>
                                <div v-if="state.errors.code" class="invalid-feedback">
                                    {{ state.errors.code }}
                                </div>
                                <div v-if="state.valid.code" class="valid-feedback">
                                    验证码格式正确
                                </div>
                                <div class="form-text text-muted mt-1">
                                    验证码有效期为5分钟，请及时输入
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label for="passwordInput" class="form-label">
                                    密码 <span class="text-danger">*</span>
                                </label>
                                <div class="input-group">
                                    <input 
                                        :type="showPassword ? 'text' : 'password'" 
                                        class="form-control" 
                                        id="registerPasswordInput"
                                        v-model="state.password.value"
                                        placeholder="请输入密码"
                                        required
                                        autocomplete="new-password"
                                        :class="{ 'is-invalid': state.errors.password, 'is-valid': state.valid.password }">
                                    <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
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
                                <label for="confirmPasswordInput" class="form-label">
                                    确认密码 <span class="text-danger">*</span>
                                </label>
                                <div class="input-group">
                                    <input :type="showConfirmPassword ? 'text' : 'password'" 
                                           class="form-control" 
                                           id="confirmPasswordInput"
                                           v-model="state.password.verify"
                                           placeholder="请再次输入密码"
                                           required
                                           autocomplete="new-password"
                                           :class="{ 'is-invalid': state.errors.verify, 'is-valid': state.valid.verify }">
                                    <button class="btn btn-outline-secondary" type="button" @click="showConfirmPassword = !showConfirmPassword">
                                        <i class="bi" :class="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                                    </button>
                                </div>
                                <div v-if="state.errors.verify" class="invalid-feedback">
                                    {{ state.errors.verify }}
                                </div>
                                <div v-if="state.valid.verify" class="valid-feedback">
                                    两次输入的密码一致
                                </div>
                            </div>
                            
                            <div class="row mt-3">
                                <div class="col">
                                    <button type="button" 
                                            class="btn btn-outline-secondary w-100"
                                            @click="method.login()">
                                        已有账号？登录
                                    </button>
                                </div>
                                <div class="col">
                                    <button type="submit" 
                                            class="btn btn-primary w-100"
                                            :disabled="state.item.wait">
                                        <span v-if="state.item.wait" class="spinner-border spinner-border-sm me-2"></span>
                                        {{ state.item.wait ? '注册中...' : '注册' }}
                                    </button>
                                </div>
                            </div>
                        </form>
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
import utils from '@/utils/utils.js'
import axios from '@/utils/request.js'
import cache from '@/utils/cache.js'
import { useCommStore } from '@/store/comm'
import { reactive, ref, onUnmounted, watch, computed } from 'vue'

const emit = defineEmits(['finish'])
const store = {
    comm: useCommStore()
}

const state = reactive({
    item: {
        loading: false,
        dialog: false,
        wait: false,
        second: 0,
    },
    struct: {
        social: null,
        account: null,
        nickname: null,
        code: null,
    },
    password: {
        value: null,
        verify: null,
    },
    errors: {
        nickname: '',
        account: '',
        social: '',
        code: '',
        password: '',
        verify: '',
    },
    valid: {
        nickname: false,
        account: false,
        social: false,
        code: false,
        password: false,
        verify: false,
    },
    timer: null,
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 验证码防刷缓存
const getCacheKey = (type, contact) => {
  return `verify-code-${type}-${contact}`
}

const getDailyLimitKey = (type, contact) => {
  return `verify-code-daily-${type}-${contact}`
}

// 检查是否可以发送验证码
const canSendCode = (type, contact) => {
  // 检查时间间隔
  const cacheKey = getCacheKey(type, contact)
  const lastSendTime = localStorage.getItem(cacheKey)
  if (lastSendTime) {
    const timeDiff = Date.now() - parseInt(lastSendTime)
    if (timeDiff < 60 * 1000) {
      return false
    }
  }
  
  // 检查每日发送上限
  const dailyLimitKey = getDailyLimitKey(type, contact)
  const dailyCount = localStorage.getItem(dailyLimitKey)
  if (dailyCount && parseInt(dailyCount) >= 10) {
    return false
  }
  
  return true
}

// 记录发送验证码
const recordSendCode = (type, contact) => {
  // 记录发送时间
  const cacheKey = getCacheKey(type, contact)
  localStorage.setItem(cacheKey, Date.now().toString())
  
  // 记录每日发送次数
  const dailyLimitKey = getDailyLimitKey(type, contact)
  const currentCount = localStorage.getItem(dailyLimitKey) || '0'
  const newCount = parseInt(currentCount) + 1
  localStorage.setItem(dailyLimitKey, newCount.toString())
  
  // 设置每日计数过期时间（24小时后）
  setTimeout(() => {
    localStorage.removeItem(dailyLimitKey)
  }, 24 * 60 * 60 * 1000)
}

// 表单验证计算属性
const isFormValid = computed(() => {
    return state.valid.nickname && 
           state.valid.account && 
           state.valid.social && 
           state.valid.code && 
           state.valid.password && 
           state.valid.verify
})

// 昵称验证
const validateNickname = (nickname) => {
    if (!nickname) {
        state.errors.nickname = '请输入昵称'
        state.valid.nickname = false
        return
    }
    
    if (nickname.length < 2 || nickname.length > 20) {
        state.errors.nickname = '昵称长度应在2-20位之间'
        state.valid.nickname = false
        return
    }
    
    state.errors.nickname = ''
    state.valid.nickname = true
}

// 账号验证
const validateAccount = (account) => {
    if (!account) {
        state.errors.account = '请输入账号'
        state.valid.account = false
        return
    }
    
    const accountRegex = /^[a-zA-Z0-9_]{4,20}$/
    if (!accountRegex.test(account)) {
        state.errors.account = '账号格式不正确（4-20位字母数字下划线）'
        state.valid.account = false
        return
    }
    
    state.errors.account = ''
    state.valid.account = true
}

// 邮箱或手机号验证
const validateSocial = (social) => {
    if (!social) {
        state.errors.social = '请输入邮箱或手机号'
        state.valid.social = false
        return
    }
    
    const isPhone = /^1[3-9]\d{9}$/.test(social)
    const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(social)
    if (!isPhone && !isEmail) {
        state.errors.social = '请填写正确的手机号或邮箱'
        state.valid.social = false
        return
    }
    
    state.errors.social = ''
    state.valid.social = true
}

// 验证码验证
const validateCode = (code) => {
    if (!code) {
        state.errors.code = '请输入验证码'
        state.valid.code = false
        return
    }
    
    if (code.length !== 6) {
        state.errors.code = '验证码长度应为6位'
        state.valid.code = false
        return
    }
    
    if (!/^\d{6}$/.test(code)) {
        state.errors.code = '验证码应为纯数字'
        state.valid.code = false
        return
    }
    
    state.errors.code = ''
    state.valid.code = true
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

// 确认密码验证
const validateVerify = (verify) => {
    if (!verify) {
        state.errors.verify = '请再次输入密码'
        state.valid.verify = false
        return
    }
    
    if (verify !== state.password.value) {
        state.errors.verify = '两次输入的密码不一致'
        state.valid.verify = false
        return
    }
    
    state.errors.verify = ''
    state.valid.verify = true
}

// 监听表单输入变化
watch(() => state.struct.nickname, (newValue) => {
    validateNickname(newValue)
})

watch(() => state.struct.account, (newValue) => {
    validateAccount(newValue)
})

watch(() => state.struct.social, (newValue) => {
    validateSocial(newValue)
})

watch(() => state.struct.code, (newValue) => {
    validateCode(newValue)
})

watch(() => state.password.value, (newValue) => {
    validatePassword(newValue)
    validateVerify(state.password.verify)
})

watch(() => state.password.verify, (newValue) => {
    validateVerify(newValue)
})

const showNotification = (message, type = 'info') => {
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

const method = {
    async register() {
        // 手动触发验证
        validateNickname(state.struct.nickname)
        validateAccount(state.struct.account)
        validateSocial(state.struct.social)
        validateCode(state.struct.code)
        validatePassword(state.password.value)
        validateVerify(state.password.verify)
        
        if (!isFormValid.value) {
            showNotification('请检查表单填写是否正确', 'warning')
            return
        }

        state.item.wait = true

        try {
            const { code, msg, data } = await axios.post('/api/comm/register', {
                ...state.struct, 
                password: state.password.value
            })

            state.item.wait = false

            if (code !== 200) {
                showNotification(msg, 'error')
                return
            }

            cache.set('user-info', data.user, 10)
            utils.set.cookie(globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', data.token, 7 * 24 * 60 * 60)
            method.hide()
            
            store.comm.login.finish = true
            store.comm.login.user = data.user
            store.comm.switchAuth('register', false)
            
            emit('finish', data.user)
        } catch (error) {
            state.item.wait = false
            showNotification('网络异常，请稍后再试！', 'error')
        }
    },

    async code() {
        if (utils.is.empty(state.struct.social)) {
            showNotification('请输入您的邮箱或手机号！', 'warning')
            return
        }

        const social = state.struct.social
        const isPhone = /^1[3-9]\d{9}$/.test(social)
        const isEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(social)
        if (!isPhone && !isEmail) {
            showNotification('请填写正确的手机号或邮箱！', 'warning')
            return
        }

        // 检查防刷
        if (!canSendCode('register', social)) {
            const cacheKey = getCacheKey('register', social)
            const lastSendTime = localStorage.getItem(cacheKey)
            const dailyLimitKey = getDailyLimitKey('register', social)
            const dailyCount = localStorage.getItem(dailyLimitKey)
            
            if (lastSendTime) {
                const timeDiff = Date.now() - parseInt(lastSendTime)
                if (timeDiff < 60 * 1000) {
                    showNotification('发送过于频繁，请60秒后再试', 'error')
                    return
                }
            }
            
            if (dailyCount && parseInt(dailyCount) >= 10) {
                showNotification('今日发送验证码次数已达上限，请明日再试', 'error')
                return
            }
        }

        try {
            const { code, msg } = await axios.post('/api/comm/register', {
                social: state.struct.social,
            })

            if (!utils.in.array(code, [200, 201])) {
                // 处理具体错误码
                let errorMsg = msg || '发送验证码失败！'
                if (msg && msg.includes('MOBILE_NUMBER_ILLEGAL')) {
                    errorMsg = '手机号码格式错误'
                } else if (msg && msg.includes('BUSINESS_LIMIT_CONTROL')) {
                    errorMsg = '触发号码天级流控，请明日再试'
                } else if (msg && msg.includes('FREQUENCY_FAIL')) {
                    errorMsg = '发送过于频繁，请60秒后再试'
                } else if (msg && msg.includes('INVALID_PARAMETERS')) {
                    errorMsg = '非法参数'
                } else if (msg && msg.includes('FUNCTION_NOT_OPENED')) {
                    errorMsg = '没有开通融合认证功能'
                }
                showNotification(errorMsg, 'error')
                return
            }

            showNotification(msg || '验证码发送成功！', 'success')
            // 记录发送验证码
            recordSendCode('register', social)

            if (state.timer) clearInterval(state.timer)
            state.item.second = 60
            state.item.loading = true
            
            state.timer = setInterval(() => {
                state.item.second--
                if (state.item.second <= 0) {
                    clearInterval(state.timer)
                    state.timer = null
                    state.item.second = 0
                    state.item.loading = false
                }
            }, 1000)
        } catch (error) {
            showNotification('网络异常，验证码发送失败！', 'error')
        }
    },

    show() {
        state.item.dialog = true
        state.struct.nickname = ''
        state.struct.account = ''
        state.struct.social = ''
        state.struct.code = ''
        state.password.value = ''
        state.password.verify = ''
        state.errors.nickname = ''
        state.errors.account = ''
        state.errors.social = ''
        state.errors.code = ''
        state.errors.password = ''
        state.errors.verify = ''
        state.valid.nickname = false
        state.valid.account = false
        state.valid.social = false
        state.valid.code = false
        state.valid.password = false
        state.valid.verify = false
        showPassword.value = false
        showConfirmPassword.value = false
        
        // 禁止页面滚动
        document.body.style.overflow = 'hidden'
        document.body.style.position = 'fixed'
        document.body.style.width = '100%'
        document.body.style.height = '100%'
        document.body.style.top = '0'
        document.body.style.left = '0'
        document.body.style.zIndex = '1059'
        
        setTimeout(() => {
            const nicknameInput = document.getElementById('nicknameInput')
            if (nicknameInput) {
                nicknameInput.focus()
            }
        }, 300)
    },

    hide() {
        state.item.dialog = false
        showPassword.value = false
        showConfirmPassword.value = false
        
        // 恢复页面滚动
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.height = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.zIndex = ''
    },

    login() {
        method.hide()
        setTimeout(() => {
            store.comm.switchAuth('login', true)
        }, 300)
    },
}

watch(() => state.struct.code, (val) => {
    if (val) {
        state.struct.code = val.replace(/\s+/g, '')
    }
})

onUnmounted(() => {
    if (state.timer) clearInterval(state.timer)
    
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