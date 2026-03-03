<!-- 基础信息设置组件 -->
<template>
  <div class="basic-info-settings">
    <div class="row">
      <!-- 头像设置 -->
      <div class="col-md-4 mb-4">
        <div class="card">
          <div class="card-body text-center">
            <h6 class="card-title mb-3">头像设置</h6>
            <div class="avatar-upload-container mb-4">
              <div class="avatar-preview">
                <img 
                  :src="formData.avatar || defaultAvatar" 
                  :alt="formData.nickname || '用户头像'"
                  class="rounded-circle avatar-image"
                >
              </div>
              <div class="mt-3">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary btn-sm"
                  @click="triggerFileInput"
                >
                  <i class="bi bi-upload me-2"></i>上传头像
                </button>
              </div>
              <p class="text-muted small mt-2">支持 JPG、PNG 格式，建议尺寸 200x200px</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 基本信息表单 -->
      <div class="col-md-8">
        <div class="card">
          <div class="card-body">
            <h6 class="card-title mb-3">个人信息</h6>
            <form @submit.prevent="updateBasicInfo">
              <!-- 昵称 -->
              <div class="mb-3">
                <label for="nickname" class="form-label">昵称</label>
                <input 
                  type="text" 
                  id="nickname" 
                  v-model="formData.nickname" 
                  class="form-control"
                  placeholder="请输入昵称"
                  maxlength="20"
                >
              </div>

              <!-- 性别 -->
              <div class="mb-3">
                <label class="form-label">性别</label>
                <div class="d-flex gap-4">
                  <div class="form-check">
                    <input 
                      type="radio" 
                      id="gender-boy" 
                      v-model="formData.gender" 
                      :value="'boy'"
                      class="form-check-input"
                    >
                    <label for="gender-boy" class="form-check-label">男</label>
                  </div>
                  <div class="form-check">
                    <input 
                      type="radio" 
                      id="gender-girl" 
                      v-model="formData.gender" 
                      :value="'girl'"
                      class="form-check-input"
                    >
                    <label for="gender-girl" class="form-check-label">女</label>
                  </div>
                  <div class="form-check">
                    <input 
                      type="radio" 
                      id="gender-none" 
                      v-model="formData.gender" 
                      :value="null"
                      class="form-check-input"
                    >
                    <label for="gender-none" class="form-check-label">不设置</label>
                  </div>
                </div>
              </div>

              <!-- 个人简介 -->
              <div class="mb-3">
                <label for="description" class="form-label">个人简介</label>
                <textarea 
                  id="description" 
                  v-model="formData.description" 
                  class="form-control"
                  placeholder="请输入个人简介"
                  rows="4"
                  maxlength="200"
                ></textarea>
                <div class="text-end text-muted small mt-1">
                  {{ formData.description.length }}/200
                </div>
              </div>

              <!-- 联系方式 -->
              <div class="mb-3">
                <label class="form-label">联系方式</label>
                <div class="row">
                  <div class="col-md-6 mb-2">
                    <div class="input-group input-group-contact">
                      <span class="input-group-text"><i class="bi bi-telephone"></i></span>
                      <input 
                        type="text" 
                        class="form-control" 
                        :value="userContact.phone || '未设置'" 
                        disabled
                      >
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="input-group input-group-contact">
                      <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                      <input 
                        type="email" 
                        class="form-control" 
                        :value="userContact.email || '未设置'" 
                        disabled
                      >
                    </div>
                  </div>
                </div>
                <div class="text-muted small mt-2">
                  <i class="bi bi-info-circle me-1"></i>
                  手机号和邮箱可在"联系方式"标签页中修改
                </div>
              </div>



              <!-- 提交按钮 -->
              <div class="d-flex gap-2">
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <i class="bi bi-save me-2"></i>
                  {{ loading ? '保存中...' : '保存修改' }}
                </button>
                <button 
                  type="button" 
                  class="btn btn-outline-secondary"
                  @click="resetForm"
                  :disabled="loading"
                >
                  <i class="bi bi-arrow-counterclockwise me-2"></i>重置
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import request from '@/utils/request'
import toast from '@/utils/toast'
import { useCommStore } from '@/store/comm'
import { uploadImage } from '@/utils/upload'
import defaultAvatar from '@/assets/img/avatar.png'

const store = useCommStore()
const loading = ref(false)

// 表单数据
const formData = reactive({
  id: '',
  nickname: '',
  gender: null,
  description: '',
  avatar: ''
})

// 用户联系方式
const userContact = reactive({
  phone: '',
  email: ''
})

// 原始数据，用于重置
const originalData = reactive({})

// 触发文件输入
const triggerFileInput = () => {
  uploadImage('avatar', (path) => {
    formData.avatar = path
    // 更新用户信息
    updateBasicInfo()
  })
}

// 更新基础信息
const updateBasicInfo = async () => {
  if (loading.value) return

  loading.value = true
  try {
    const res = await request.put('/api/users/update', {
      id: formData.id,
      nickname: formData.nickname,
      gender: formData.gender,
      description: formData.description,
      avatar: formData.avatar
    })

    if (res.code === 200) {
      toast.success('用户信息更新成功')
      // 同步用户信息
      await syncUserInfo()
      // 更新原始数据
      Object.assign(originalData, { ...formData })
    } else {
      toast.error(res.msg || '用户信息更新失败')
    }
  } catch (error) {
    console.error('更新失败:', error)
    toast.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
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

// 重置表单
const resetForm = () => {
  Object.assign(formData, { ...originalData })
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const loginState = store.getLogin
    const userInfo = loginState.user
    if (userInfo) {
      formData.id = userInfo.id
      formData.nickname = userInfo.nickname || ''
      formData.gender = userInfo.gender || null
      formData.description = userInfo.description || ''
      formData.avatar = userInfo.avatar || ''
      // 保存原始数据
      Object.assign(originalData, { ...formData })
      
      // 设置用户联系方式
      userContact.phone = userInfo.phone || ''
      userContact.email = userInfo.email || ''
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
/* 头像样式 */
.avatar-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border: 3px solid var(--bs-border-color);
  transition: all 0.2s ease;
}

.avatar-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 表单样式 */
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

/* 按钮样式 */
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

/* 响应式调整 */
@media (max-width: 768px) {
  .avatar-image {
    width: 80px;
    height: 80px;
  }
  
  .card-body {
    padding: 1rem;
  }
  
  .col-md-4,
  .col-md-8 {
    width: 100%;
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
  }
  
  /* 联系方式的input-group保持水平排列 */
  .input-group-contact {
    flex-direction: row !important;
    width: 100%;
  }
  
  .input-group-contact .input-group-text {
    flex-shrink: 0;
    width: auto;
  }
  
  .input-group-contact .form-control {
    flex: 1;
    min-width: 0;
  }
  
  .d-flex.gap-2 {
    flex-direction: column;
    gap: 0.5rem !important;
  }
  
  .d-flex.gap-2 .btn {
    width: 100%;
  }
}
</style>