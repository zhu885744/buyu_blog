<template>
  <div class="card mt-2">
    <!-- 用户中心卡片头部 -->
    <div class="card-header">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0 d-flex align-items-center gap-2 fw-semibold">
          用户主页
        </h5>
        <button 
          @click="fetchUserInfo" 
          class="btn btn-sm btn-outline-primary rounded-full px-4 py-1.5 transition-all hover:bg-primary hover:text-white"
          :disabled="loading"
        >
          <i class="bi" :class="loading ? 'bi-arrow-clockwise spin' : 'bi-arrow-clockwise'"></i>
          刷新
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="card-body text-center py-10">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">加载中...</span>
      </div>
      <p class="mt-3 text-muted">正在加载用户信息...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="card-body text-center py-10">
      <i class="bi bi-exclamation-circle text-danger fs-1"></i>
      <p class="mt-3 text-muted">{{ error }}</p>
      <button 
        @click="fetchUserInfo" 
        class="btn btn-sm btn-outline-primary mt-3"
      >
        重试
      </button>
    </div>

    <!-- 无数据状态 -->
    <div v-else-if="!userInfo" class="card-body text-center py-10">
      <i class="bi bi-person-x text-muted fs-1"></i>
      <p class="mt-3 text-muted">用户不存在</p>
    </div>

    <!-- 用户信息内容 -->
    <div v-else class="card-body p-4">
      <!-- 用户基本信息 -->
      <div class="user-basic-info mb-4">
        <div class="d-flex align-items-start gap-4 mb-4">
          <div class="position-relative">
            <img 
              :src="userInfo.avatar || defaultAvatar" 
              :alt="userInfo.nickname"
              class="rounded-3 border-4 border-white shadow-md transition-transform duration-300 hover:scale-105"
              width="120"
              height="120"
              style="object-fit: cover;"
              @error="handleAvatarError"
            >
          </div>
          <div class="flex-grow-1">
            <div class="d-flex align-items-center gap-3 mb-2">
              <h3 class="mb-0 fw-bold text-lg">
                {{ userInfo.nickname }}
              </h3>
              <!-- 头衔 -->
              <span v-if="userInfo.title" class="badge text-bg-success rounded-full px-3 py-1 text-sm font-medium">
                {{ userInfo.title }}
              </span>
              <!-- 等级标识 -->
              <span v-if="userLevelInfo" class="badge bg-primary rounded-full px-3 py-1 text-sm font-medium">
                Lv.{{ userLevelInfo.current.value }} {{ userLevelInfo.current.name }}
              </span>
            </div>
            <!-- 个人网站 -->
            <div v-if="userInfo.json?.website?.url" class="text-sm mb-3 mt-3">
              <a 
                :href="userInfo.json.website.url" 
                target="_blank" 
                rel="noopener noreferrer"
                class="d-flex align-items-center gap-2 hover:text-primary-emphasis transition-colors"
              >
                <i class="bi bi-globe"></i>
                {{ userInfo.json.website.name || userInfo.json.website.url }}
              </a>
            </div>
            <!-- 用户信息 -->
            <div class="d-flex align-items-center gap-4 flex-wrap text-sm mb-2">
              <!-- 注册时间 -->
              <span class="d-flex align-items-center gap-2 text-gray-600">
                <i class="bi bi-calendar3"></i>
                注册于 {{ formatDate(userInfo.create_time) }}
              </span>
              <!-- 最后登录 -->
              <span class="d-flex align-items-center gap-2 text-gray-600">
                <i class="bi bi-clock text-success"></i>
                最近登录 {{ formatDate(userInfo.login_time) }}
              </span>
            </div>
          </div>
        </div>

        <!-- 个人简介 -->
        <div class="user-description mb-4 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
          <p class="mb-0 fs-6 leading-relaxed">
            <i class="bi bi-quote me-3 opacity-75"></i>
            {{ userInfo.description || '这个人很懒，什么都没有留下！' }}
          </p>
        </div>

        <!-- 用户标签 -->
        <div class="user-tags mb-4">
          <div class="d-flex align-items-center gap-3 flex-wrap">
            <!-- 用户组标识 -->
            <span v-for="(group, index) in userGroups" :key="index" class="badge bg-warning text-dark px-4 py-2 fw-medium cursor-pointer">
              {{ group.name }}
            </span>
            <!-- 性别标签 -->
            <span class="badge bg-info text-white px-4 py-2 fw-medium cursor-pointer">
              <i class="bi" :class="userInfo.gender === 'boy' ? 'bi-gender-male' : 'bi-gender-female'"></i>
              {{ userInfo.gender === 'boy' ? '男' : userInfo.gender === 'girl' ? '女' : '未知' }}
            </span>
            <!-- 等级标签 -->
            <span class="badge bg-success text-white px-4 py-2 fw-medium cursor-pointer">
              <i class="bi bi-activity"></i>
              Lv.{{ userLevelInfo.current.value }} {{ userLevelInfo.current.name }}
            </span>
            <!-- 经验值标签 -->
            <span class="badge bg-danger text-white px-4 py-2 fw-medium cursor-pointer">
              <i class="bi bi-star"></i>
              {{ userInfo.exp }} 经验值
            </span>
          </div>
        </div>
      </div>

      <!-- 用户等级信息 -->
      <div v-if="userLevelInfo" class="user-level mb-5">
        <h6 class="mb-3 d-flex align-items-center gap-2 text-lg font-medium">
          <i class="bi bi-activity fs-5"></i>
          等级信息
        </h6>
        <div class="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <span class="text-gray-600">当前等级</span>
            <span class="fw-bold">Lv.{{ userLevelInfo.current.value }} {{ userLevelInfo.current.name }}</span>
          </div>
          <div class="d-flex justify-content-between align-items-center mb-4">
            <span class="text-gray-600">下一等级</span>
            <span class="text-gray-700">Lv.{{ userLevelInfo.next.value }} {{ userLevelInfo.next.name }}</span>
          </div>
          <!-- 经验值进度条 -->
          <div class="mb-1">
            <div class="d-flex justify-content-between mb-2">
              <span class="text-sm text-gray-500">经验值进度</span>
              <span class="text-sm font-medium">{{ userInfo.exp }} / {{ userLevelInfo.next.exp }}</span>
            </div>
            <div class="progress rounded-full overflow-hidden" style="height: 10px;">
              <div 
                class="progress-bar bg-gradient-to-r from-primary to-secondary" 
                :style="{ width: experienceProgress + '%' }"
                role="progressbar"
                :aria-valuenow="userInfo.exp"
                :aria-valuemin="userLevelInfo.current.exp"
                :aria-valuemax="userLevelInfo.next.exp"
              ></div>
            </div>
          </div>
          <!-- 等级描述 -->
          <div class="mt-4">
            <p class="text-sm text-gray-600 mb-0">
              {{ userLevelInfo.current.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- 用户权限信息 -->
      <div v-if="userAuthInfo" class="user-auth mb-5">
        <h6 class="mb-3 d-flex align-items-center gap-2 text-lg font-medium">
          <i class="bi bi-shield-check fs-5"></i>
          权限信息
        </h6>
        <div class="p-4 bg-gradient-to-r from-success/10 to-secondary/10 border border-success/20">
          <div class="mb-3">
            <span class="fw-medium text-gray-700">用户组：</span>
            <span v-for="(group, index) in userAuthInfo.group.list" :key="index" class="badge bg-success text-white mx-2 px-3 py-1 rounded-full">
              {{ group.name }}
            </span>
          </div>
          <div>
            <span class="fw-medium text-gray-700">权限范围：</span>
            <span class="badge bg-success-subtle text-success mx-2 px-3 py-1 rounded-full">
              {{ userAuthInfo.all ? '全部权限' : '部分权限' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 交互按钮 -->
      <div class="user-actions d-flex gap-2 flex-wrap">
        <button 
          @click="copyUserInfo" 
          class="btn btn-outline-primary btn-sm px-4 py-2"
        >
          <i class="bi bi-copy"></i>
          复制信息
        </button>
        <button 
          @click="shareUserInfo" 
          class="btn btn-outline-secondary btn-sm px-4 py-2"
        >
          <i class="bi bi-share"></i>
          分享
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import request from '@/utils/request'
import toast from '@/utils/toast'
import defaultAvatar from '@/assets/img/avatar.png'
import { useCommStore } from '@/store/comm'
import { usePageTitle } from '@/utils/usePageTitle'

// 使用页面标题管理
const { setDynamicTitle } = usePageTitle();

const route = useRoute()
const store = useCommStore()

// 环境变量网站标题，兜底处理
const SITE_TITLE = import.meta.env.VITE_TITLE || '朱某的生活印记'

// 获取网站标题的方法
const getSiteTitle = () => {
  return store.siteInfo?.title || SITE_TITLE
}

// 响应式数据
const loading = ref(false)
const error = ref('')
const userInfo = ref(null)

// 定时器引用
const refreshInterval = ref(null)

// 计算属性
// 用户ID从路由参数获取
const userId = computed(() => {
  return route.params.id || 1
})

// 是否为管理员
const isAdmin = computed(() => {
  if (!userInfo.value || !userInfo.value.result?.auth) return false
  return userInfo.value.result.auth.all || 
    (userInfo.value.result.auth.group?.list && 
     userInfo.value.result.auth.group.list.some(group => group.key === 'admin'))
})

// 用户等级信息
const userLevelInfo = computed(() => {
  return userInfo.value?.result?.level
})

// 用户权限信息
const userAuthInfo = computed(() => {
  return userInfo.value?.result?.auth
})

// 用户等级显示
const userLevel = computed(() => {
  if (!userLevelInfo.value) return null
  return userLevelInfo.value.current.name
})

// 经验值进度
const experienceProgress = computed(() => {
  if (!userLevelInfo.value || !userInfo.value) return 0
  const current = userLevelInfo.value.current.exp
  const next = userLevelInfo.value.next.exp
  const currentExp = userInfo.value.exp
  if (next <= current) return 100
  return Math.min(100, Math.round(((currentExp - current) / (next - current)) * 100))
})

// 是否为当前登录用户
const isCurrentUser = computed(() => {
  const currentUser = store.comm?.login?.user
  return currentUser && userInfo.value && currentUser.id === userInfo.value.id
})

// 用户组信息
const userGroups = computed(() => {
  if (!userAuthInfo.value) {
    // 如果没有用户权限信息，显示普通用户
    return [{ name: '普通用户' }]
  }
  
  if (userAuthInfo.value.group?.list && userAuthInfo.value.group.list.length > 0) {
    // 如果有权限组信息，显示接口返回的用户组
    return userAuthInfo.value.group.list
  }
  
  // 默认显示普通用户
  return [{ name: '普通用户' }]
})

// 方法
// 获取用户信息
const fetchUserInfo = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const res = await request.get('/api/users/one', {
      id: userId.value
    })
    
    if (res.code === 200 && res.data) {
      userInfo.value = res.data
    } else {
      error.value = res.msg || '获取用户信息失败'
      userInfo.value = null
    }
  } catch (err) {
    // console.error('获取用户信息失败:', err)
    error.value = '网络错误，请稍后重试'
    userInfo.value = null
  } finally {
    loading.value = false
  }
}

// 复制用户信息
const copyUserInfo = () => {
  if (!userInfo.value) return
  
  const user = userInfo.value
  const websiteName = user.json?.website?.name || ''
  const websiteUrl = user.json?.website?.url || ''
  const websiteInfo = websiteUrl ? `${websiteName ? websiteName + ' - ' : ''}${websiteUrl}` : '未设置'
  
  const infoText = `
用户信息：
昵称：${user.nickname}
账号：${user.account}
头衔：${user.title || '普通用户'}
简介：${user.description || '暂无简介'}
性别：${user.gender === 'boy' ? '男孩' : user.gender === 'girl' ? '女孩' : '未知'}
邮箱：${user.email || '未设置'}
手机：${user.phone || '未设置'}
网站：${websiteInfo}
经验值：${user.exp} 点
注册时间：${formatDate(user.create_time)}
最后登录：${formatDate(user.login_time)}
  `.trim()
  
  navigator.clipboard.writeText(infoText)
    .then(() => {
      toast.success('用户信息已复制到剪贴板')
    })
    .catch(() => {
      toast.error('复制失败')
    })
}

// 分享用户信息
const shareUserInfo = () => {
  // 复制"页面标题 - 链接"到剪贴板
  const shareContent = `${document.title} - ${window.location.href}`
  navigator.clipboard.writeText(shareContent)
    .then(() => {
      toast.success('链接已复制到剪贴板')
    })
    .catch(() => {
      toast.error('复制失败')
    })
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间'
  
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 处理头像错误
const handleAvatarError = (event) => {
  event.target.src = defaultAvatar
}

// 设置页面标题
const setPageTitle = (nickname) => {
  if (nickname) {
    document.title = `${nickname} - ${getSiteTitle()}`
  } else {
    document.title = `用户主页 - ${getSiteTitle()}`
  }
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
  
  // 监听路由参数变化，重新获取用户信息
  route.params.id && fetchUserInfo()
  
  // 清除定时刷新机制
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
})

// 组件卸载时恢复原始页面标题并清除定时器
onUnmounted(() => {
  document.title = getSiteTitle()
  // 清除定时器
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
})

// 监听用户信息变化，更新页面标题
watch(
  () => userInfo.value,
  (newUserInfo) => {
    if (newUserInfo) {
      setPageTitle(newUserInfo.nickname)
    } else {
      setPageTitle('')
    }
  },
  { immediate: true }
)

// 监听路由参数变化，重新获取用户信息
watch(
  () => route.params.id,
  (newUserId) => {
    if (newUserId) {
      fetchUserInfo()
    }
  },
  { immediate: true }
)
</script>

<style scoped>
/* 加载动画 */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .btn-sm {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
  
  /* 加载状态 */
  .text-center.py-10 {
    padding: 6rem 1rem !important;
  }
  
  /* 用户基本信息 */
  .user-basic-info {
    margin-bottom: 1.5rem;
  }
  
  /* 头像和用户信息 */
  .d-flex.align-items-start.gap-4 {
    flex-direction: column;
    align-items: center !important;
    text-align: center;
    gap: 1.5rem !important;
  }
  
  /* 头像 */
  img[src*="avatar"] {
    width: 80px !important;
    height: 80px !important;
  }
  
  /* 用户信息 */
  .flex-grow-1 {
    width: 100%;
  }
  
  h3.mb-0.fw-bold.text-lg {
    font-size: 1.2rem;
    margin-bottom: 0.5rem !important;
  }
  
  .text-muted.mb-3 {
    font-size: 0.9rem;
    margin-bottom: 1rem !important;
  }
  
  /* 用户信息行 */
  .d-flex.align-items-center.gap-4.flex-wrap {
    justify-content: center;
    gap: 1rem !important;
    margin-top: 0.5rem;
  }
  
  /* 昵称和等级标签容器居中 */
  .d-flex.align-items-center.gap-3.mb-2 {
    justify-content: center;
    gap: 0.5rem !important;
  }
  
  /* 头衔居中 */
  .text-muted.mb-3 {
    text-align: center;
  }
  
  /* 个人网站模块居中 */
  .text-sm > a.d-flex {
    justify-content: center;
  }
  
  .text-sm {
    font-size: 0.8rem;
  }
  
  /* 个人简介 */
  .user-description {
    padding: 1rem !important;
    margin-bottom: 1.5rem !important;
  }
  
  .user-description p {
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  /* 用户标签 */
  .user-tags {
    margin-bottom: 1.5rem !important;
  }
  
  .d-flex.align-items-center.gap-3.flex-wrap {
    justify-content: center;
    gap: 0.5rem !important;
  }
  
  .badge.rounded-full {
    padding: 0.4rem 0.8rem !important;
    font-size: 0.75rem !important;
    margin-bottom: 0.5rem;
  }
  
  /* 等级信息和权限信息 */
  .user-level,
  .user-auth {
    margin-bottom: 1.5rem !important;
  }
  
  h6.mb-3 {
    font-size: 1rem !important;
    margin-bottom: 1rem !important;
  }
  
  .p-4 {
    padding: 1rem !important;
  }
  
  /* 进度条 */
  .progress {
    height: 8px !important;
  }
  
  /* 权限信息 */
  .mb-3 {
    margin-bottom: 1rem !important;
  }
  
  .badge {
    margin-bottom: 0.5rem;
  }
  
  /* 交互按钮 */
  .user-actions {
    justify-content: center;
    gap: 0.5rem !important;
  }
  
  /* 响应式文本调整 */
  .text-gray-600,
  .text-gray-700 {
    font-size: 0.9rem;
  }
  
  .fw-bold {
    font-size: 0.95rem;
  }
  
  /* 确保标签不溢出 */
  .user-tags .d-flex {
    flex-wrap: wrap;
  }
  
  /* 确保按钮组在小屏幕上正确显示 */
  .user-actions {
    flex-wrap: wrap;
  }
  
  .user-actions .btn {
    flex: 1;
    min-width: calc(50% - 0.25rem);
  }
}

/* 平板设备优化 */
@media (min-width: 769px) and (max-width: 1024px) {
  /* 头像大小调整 */
  img[src*="avatar"] {
    width: 100px !important;
    height: 100px !important;
  }
  
  /* 标签间距调整 */
  .d-flex.align-items-center.gap-3.flex-wrap {
    gap: 0.75rem !important;
  }
  
  /* 按钮大小调整 */
  .btn {
    font-size: 0.9rem;
  }
}

/* 暗黑模式适配 */
[data-bs-theme=dark] {
  /* 卡片样式 */
  .card {
    background-color: var(--bs-body-bg);
    border-color: var(--bs-border-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  .card-header {
    background-color: var(--bs-secondary-bg);
    border-color: var(--bs-border-color);
  }
  
  /* 文本颜色 */
  .text-gray-600,
  .text-gray-700 {
    color: var(--bs-secondary-color) !important;
  }
  
  /* 用户描述区域 */
  .user-description {
    background: linear-gradient(to right, rgba(133, 133, 133, 0.05), rgba(157, 157, 157, 0.05));
    border-color: rgba(133, 133, 133, 0.1);
  }
  
  /* 等级信息区域 */
  .user-level .p-4 {
    background: linear-gradient(to right, rgba(133, 133, 133, 0.1), rgba(157, 157, 157, 0.1));
    border-color: rgba(133, 133, 133, 0.2);
  }
  
  /* 权限信息区域 */
  .user-auth .p-4 {
    background: linear-gradient(to right, rgba(110, 196, 143, 0.1), rgba(157, 157, 157, 0.1));
    border-color: rgba(110, 196, 143, 0.2);
  }
  
  /* 标签样式 */
  .badge {
    transition: all 0.2s ease;
  }
  
  /* 头像边框 */
  img[src*="avatar"] {
    border-color: var(--bs-secondary-bg) !important;
  }
  
  /* 链接样式 */
  a.hover\:text-primary-emphasis {
    color: var(--bs-link-color) !important;
  }
  
  a.hover\:text-primary-emphasis:hover {
    color: var(--bs-link-hover-color) !important;
  }
  
  /* 按钮样式 */
  .btn-outline-primary {
    --bs-btn-color: var(--bs-link-color);
    --bs-btn-border-color: var(--bs-link-color);
    --bs-btn-hover-color: var(--bs-emphasis-color);
    --bs-btn-hover-bg: var(--bs-link-color);
    --bs-btn-hover-border-color: var(--bs-link-color);
  }
  
  .btn-outline-secondary {
    --bs-btn-color: var(--bs-secondary-color);
    --bs-btn-border-color: var(--bs-secondary-color);
    --bs-btn-hover-color: var(--bs-emphasis-color);
    --bs-btn-hover-bg: var(--bs-secondary-color);
    --bs-btn-hover-border-color: var(--bs-secondary-color);
  }
  
  /* 进度条 */
  .progress {
    background-color: var(--bs-tertiary-bg);
  }
  
  /* 加载状态 */
  .spinner-border {
    --bs-spinner-color: var(--bs-link-color);
  }
}
</style>
