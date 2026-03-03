<!-- 账号安全设置组件 -->
<template>
  <div class="account-security-settings">
    <div class="row">
      <!-- 密码设置 -->
      <div class="col-md-12">
        <div class="card mb-4">
          <div class="card-body">
            <h6 class="card-title mb-3">密码设置</h6>
            <form @submit.prevent="updatePassword">
              <!-- 隐藏的用户名字段，用于可访问性 -->
              <input 
                type="text" 
                class="d-none" 
                autocomplete="username"
                :value="store.getLogin.user.username || store.getLogin.user.account"
              >
              <!-- 当前密码 -->
              <div class="mb-3">
                <label for="currentPassword" class="form-label">当前密码</label>
                <input 
                  type="password" 
                  id="currentPassword" 
                  v-model="passwordForm.currentPassword" 
                  class="form-control"
                  placeholder="请输入当前密码"
                  autocomplete="current-password"
                >
              </div>

              <!-- 新密码 -->
              <div class="mb-3">
                <label for="newPassword" class="form-label">新密码</label>
                <input 
                  type="password" 
                  id="newPassword" 
                  v-model="passwordForm.newPassword" 
                  class="form-control"
                  placeholder="请输入新密码"
                  minlength="6"
                  maxlength="20"
                  autocomplete="new-password"
                >
              </div>

              <!-- 确认新密码 -->
              <div class="mb-3">
                <label for="confirmPassword" class="form-label">确认新密码</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  v-model="passwordForm.confirmPassword" 
                  class="form-control"
                  placeholder="请再次输入新密码"
                  autocomplete="new-password"
                >
              </div>

              <!-- 密码强度提示 -->
              <div v-if="passwordForm.newPassword" class="mb-3">
                <div class="password-strength">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted small">密码强度</span>
                    <span :class="passwordStrengthClass" class="small font-medium">
                      {{ passwordStrengthText }}
                    </span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div 
                      class="progress-bar" 
                      :class="passwordStrengthClass"
                      :style="{ width: passwordStrengthWidth }"
                      role="progressbar"
                      :aria-valuenow="passwordStrengthValue"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </div>
              </div>

              <!-- 提交按钮 -->
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="passwordLoading"
              >
                <i class="bi bi-key me-2"></i>
                {{ passwordLoading ? '修改中...' : '修改密码' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- 安全提示 -->
    <div class="card mt-4">
      <div class="card-body">
        <h6 class="card-title mb-3">安全提示</h6>
        <ul class="list-group list-group-flush">
          <li class="list-group-item">
            <i class="bi bi-shield-check text-success me-2"></i>
            建议使用字母、数字和特殊字符组合的密码
          </li>
          <li class="list-group-item">
            <i class="bi bi-clock-history text-warning me-2"></i>
            定期更换密码，建议每3个月更换一次
          </li>
          <li class="list-group-item">
            <i class="bi bi-exclamation-triangle text-danger me-2"></i>
            不要在多个网站使用相同的密码
          </li>
          <li class="list-group-item">
            <i class="bi bi-lock text-info me-2"></i>
            不要将密码告诉他人，包括网站客服
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import request from '@/utils/request'
import toast from '@/utils/toast'
import { useCommStore } from '@/store/comm'

const store = useCommStore()

// 密码表单数据
const passwordForm = reactive({
  id: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 加载状态
const passwordLoading = ref(false)

// 密码强度计算
const calculatePasswordStrength = (password) => {
  if (!password) return 0
  
  let strength = 0
  
  // 长度检查
  if (password.length >= 8) strength += 25
  else if (password.length >= 6) strength += 15
  
  // 包含数字
  if (/\d/.test(password)) strength += 25
  
  // 包含小写字母
  if (/[a-z]/.test(password)) strength += 25
  
  // 包含大写字母或特殊字符
  if (/[A-Z]/.test(password) || /[^a-zA-Z0-9]/.test(password)) strength += 25
  
  return Math.min(strength, 100)
}

// 密码强度值
const passwordStrengthValue = computed(() => {
  return calculatePasswordStrength(passwordForm.newPassword)
})

// 密码强度宽度
const passwordStrengthWidth = computed(() => {
  return `${passwordStrengthValue.value}%`
})

// 密码强度文本
const passwordStrengthText = computed(() => {
  const strength = passwordStrengthValue.value
  if (strength < 25) return '弱'
  if (strength < 50) return '一般'
  if (strength < 75) return '良好'
  return '强'
})

// 密码强度样式类
const passwordStrengthClass = computed(() => {
  const strength = passwordStrengthValue.value
  if (strength < 25) return 'bg-danger'
  if (strength < 50) return 'bg-warning'
  if (strength < 75) return 'bg-info'
  return 'bg-success'
})

// 更新密码
const updatePassword = async () => {
  if (passwordLoading.value) return
  
  if (!passwordForm.currentPassword) {
    toast.error('请输入当前密码')
    return
  }
  
  if (!passwordForm.newPassword) {
    toast.error('请输入新密码')
    return
  }
  
  if (passwordForm.newPassword.length < 6) {
    toast.error('新密码长度不能少于6位')
    return
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.error('两次输入的密码不一致')
    return
  }

  passwordLoading.value = true
  try {
    const res = await request.put('/api/users/update', {
      id: passwordForm.id,
      password: passwordForm.newPassword
    })

    if (res.code === 200) {
      toast.success('密码修改成功，请重新登录')
      // 同步用户信息
      await syncUserInfo()
      // 清空表单
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      // 可以选择跳转到登录页重新登录
      // setTimeout(() => {
      //   store.commit('auth/LOGOUT')
      //   window.location.href = '/#/login'
      // }, 2000)
    } else {
      toast.error(res.msg || '密码修改失败')
    }
  } catch (error) {
    console.error('修改密码失败:', error)
    toast.error('网络错误，请稍后重试')
  } finally {
    passwordLoading.value = false
  }
}

// 同步用户信息
const syncUserInfo = async () => {
  try {
    await store.checkLoginState()
  } catch (error) {
    console.error('同步用户信息失败:', error)
  }
}

// 获取用户信息
const fetchUserInfo = () => {
  const loginState = store.getLogin
  const userInfo = loginState.user
  if (userInfo) {
    passwordForm.id = userInfo.id
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
/* 自定义样式 */
.card {
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.form-control {
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
}

.form-control:focus {
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  border-color: var(--bs-primary);
}

.btn {
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
}

/* 表单标签 */
.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.375rem;
}

/* 安全提示列表 */
.list-group-item {
  border-left: 0;
  border-right: 0;
  border-radius: 0 !important;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
}

.list-group-item:first-child {
  border-top: 0;
}

.list-group-item:last-child {
  border-bottom: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .card-body {
    padding: 1rem;
  }
  
  .mb-4 {
    margin-bottom: 1rem !important;
  }
  
  .mb-3 {
    margin-bottom: 1rem !important;
  }
  
  .card-title {
    font-size: 0.9375rem;
    margin-bottom: 0.75rem !important;
  }
  
  .form-control {
    padding: 0.5rem 0.625rem;
    font-size: 0.8125rem;
  }
  
  .btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
    width: 100%;
  }
  
  .list-group-item {
    padding: 0.625rem 0.75rem;
    font-size: 0.8125rem;
  }
  
  .list-group-item i {
    font-size: 0.9em;
  }
}
</style>