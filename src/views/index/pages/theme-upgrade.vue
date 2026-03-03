<template>
  <div class="theme-upgrade-page">
    <div class="card mt-2">
      <!-- 页面头部 -->
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0 d-flex align-items-center gap-2  fw-semibold">
            <i class="bi bi-arrow-down-circle"></i>
            主题版本更新
          </h5>
          <button 
            @click="checkForUpdates" 
            class="btn btn-sm btn-outline-primary rounded-full px-4 py-1.5 transition-all hover:bg-primary hover:text-white"
            :disabled="loading"
          >
            <i class="bi" :class="loading ? 'bi-arrow-clockwise spin' : 'bi-refresh'">
              {{ loading ? ' 检查中...' : ' 检查更新' }}
            </i>
          </button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading && !currentVersion" class="card-body text-center py-10">
        <div class="spinner-border " role="status">
          <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-3 text-muted">正在检查版本信息...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="card-body text-center py-10">
        <i class="bi bi-exclamation-circle text-danger fs-1"></i>
        <p class="mt-3 text-muted">{{ error }}</p>
        <button 
          @click="checkForUpdates" 
          class="btn btn-sm btn-outline-primary mt-3"
        >
          重试
        </button>
      </div>

      <!-- 版本信息内容 -->
      <div v-else class="card-body p-4">
        <!-- 当前版本信息 -->
        <div class="current-version mb-5">
          <h6 class="mb-3 d-flex align-items-center gap-2 text-lg font-medium">
            <i class="bi bi-info-circle  fs-5"></i>
            当前版本信息
          </h6>
          <div class="p-4 bg-gradient-to-r from-primary/10 to-secondary/10  border border-primary/20">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-gray-600">主题名称</span>
              <span class="fw-medium">{{ themeName }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-gray-600">当前版本</span>
              <span class="fw-bold ">{{ currentVersion }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="text-gray-600">检测时间</span>
              <span class="text-gray-600">{{ lastCheckTime || '未检测' }}</span>
            </div>
          </div>
        </div>

        <!-- 最新版本信息 -->
        <div v-if="latestVersion" class="latest-version mb-5">
          <h6 class="mb-3 d-flex align-items-center gap-2 text-lg font-medium">
            <i class="bi bi-star  fs-5"></i>
            最新版本信息
          </h6>
          <div class="p-4" :class="hasUpdate ? 'bg-gradient-to-r from-success/10 to-secondary/10  border border-success/20' : 'bg-gradient-to-r from-info/10 to-secondary/10  border border-info/20'">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-gray-600">最新版本</span>
              <span class="fw-bold" :class="hasUpdate ? 'text-success' : 'text-info'">
                {{ latestVersion.version }}
                <span v-if="hasUpdate" class="badge bg-success ms-2">新版本</span>
                <span v-else class="badge bg-info ms-2">当前最新</span>
              </span>
            </div>
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="text-gray-600">发布时间</span>
              <span class="text-gray-600">{{ formatDate(latestVersion.create_time) }}</span>
            </div>
            <div class="mb-4">
              <span class="text-gray-600 d-block mb-1">更新内容</span>
              <div class="p-3 border border-gray-200">
                <p v-for="(line, index) in latestVersion.content.split('\n')" :key="index" class="mb-1 text-sm">
                  {{ line }}
                </p>
              </div>
            </div>
            <div v-if="hasUpdate" class="d-flex flex-column gap-3">
              <!-- 下载按钮 -->
              <a 
                :href="latestVersion.url" 
                target="_blank" 
                rel="noopener noreferrer"
                class="btn btn-success"
              >
                <i class="bi bi-download">下载最新版本</i>
              </a>
              
              <!-- 更新步骤提示 -->
              <div class="p-4  border border-info/20">
                <h6 class="fw-bold mb-2 text-info">更新步骤：</h6>
                <ol class="list-decimal pl-4 mb-0">
                  <li class="mb-1">删除主题目录内的 <code>static</code> 文件夹和 <code>index.html</code> 文件</li>
                  <li class="mb-1">上传下载的压缩包到主题目录</li>
                  <li class="mb-1">解压压缩包到主题目录</li>
                  <li class="mb-1">打开你的主题域名，同时按住快捷键 <kbd>Ctrl+Shift+R</kbd> 强制刷新网页缓存即可！</li>
                </ol>
              </div>
            </div>
            <div v-else class="text-center">
              <span class="text-muted">您的主题已是最新版本</span>
            </div>
          </div>
        </div>

        <!-- 无新版本信息 -->
        <div v-else-if="!loading" class="no-update mb-5">
          <h6 class="mb-3 d-flex align-items-center gap-2 text-lg font-medium">
            <i class="bi bi-search  fs-5"></i>
            版本检查
          </h6>
          <div class="p-4 bg-gradient-to-r from-info/10 to-secondary/10 border border-info/20 text-center">
            <i class="bi bi-info-circle text-info fs-1 mb-3"></i>
            <p class="text-muted">点击右上角按钮检查是否有新版本</p>
          </div>
        </div>

        <!-- 版本历史 -->
        <div v-if="versionHistory.length > 0" class="version-history">
          <h6 class="mb-3 d-flex align-items-center gap-2 text-lg font-medium">
            <i class="bi bi-clock-history  fs-5"></i>
            版本历史
          </h6>
          <div class="list-group">
            <div 
              v-for="(version, index) in versionHistory" 
              :key="version.id"
              class="list-group-item border border-gray-200  mb-2"
            >
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="fw-bold">{{ version.version }}</span>
                <span class="text-sm text-gray-500">{{ formatDate(version.create_time) }}</span>
              </div>
              <div class="text-sm text-gray-600">
                <p v-for="(line, lineIndex) in version.content.split('\n')" :key="lineIndex" class="mb-1">
                  {{ line }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import request from '@/utils/request'
import toast from '@/utils/toast'
import { useCommStore } from '@/store/comm'
import { usePageTitle } from '@/utils/usePageTitle'

const store = useCommStore()

// 页面标题管理
const { setDynamicTitle } = usePageTitle()
setDynamicTitle('主题版本更新')

// 响应式数据
const loading = ref(false)
const error = ref('')
const currentVersion = ref('')
const latestVersion = ref(null)
const versionHistory = ref([])
const lastCheckTime = ref('')
const checkInterval = ref(null)



// 计算属性
// 当前版本
const currentVersionComputed = computed(() => {
  // 优先从环境变量中读取版本号
  if (import.meta.env.VITE_VERSION) {
    return import.meta.env.VITE_VERSION
  }
  // 默认版本
  return '1.0.1'
})

// 主题名称
const themeName = computed(() => {
  return 'xiao'
})

// 是否有更新
const hasUpdate = computed(() => {
  if (!latestVersion.value) return false
  return compareVersions(latestVersion.value.version, currentVersion.value) > 0
})

// 方法
// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间'
  
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 版本号比较函数
const compareVersions = (version1, version2) => {
  const v1 = version1.split('.').map(Number)
  const v2 = version2.split('.').map(Number)
  
  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0
    const num2 = v2[i] || 0
    
    if (num1 > num2) return 1
    if (num1 < num2) return -1
  }
  
  return 0
}

// 检查更新
const checkForUpdates = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // 获取当前版本
    currentVersion.value = currentVersionComputed.value
    
    // 调用API获取最新版本
    const res = await request.get('/api/upgrade/list', {
      type: 'theme',
      status: 1,
      limit: 10,
      sort: 'create_time',
      order: 'desc'
    })
    
    if (res.code === 200) {
      // 即使列表为空，也认为请求成功
      if (res.data.list.length > 0) {
        latestVersion.value = res.data.list[0]
        versionHistory.value = res.data.list
        
        // 检查是否有新版本
        if (hasUpdate.value) {
          // 显示新版本通知
          toast.info(`发现新版本 xiao ${latestVersion.value.version} 版本`, {
            duration: 5000
          })
        }
      } else {
        // 列表为空，重置版本信息
        latestVersion.value = null
        versionHistory.value = []
      }
      
      // 更新检测时间
      lastCheckTime.value = formatDate(Date.now())
    } else {
      error.value = res.msg || '获取版本信息失败'
    }
  } catch (err) {
    console.error('检查更新失败:', err)
    error.value = '网络错误，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 用户活跃检测
const isUserActive = () => {
  // 检测用户是否在最近5分钟内有活动
  const lastActivity = localStorage.getItem('lastUserActivity')
  if (!lastActivity) return true
  
  const now = Date.now()
  const last = parseInt(lastActivity)
  return (now - last) < 5 * 60 * 1000
}

// 监听用户活动
const listenUserActivity = () => {
  const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart']
  events.forEach(event => {
    document.addEventListener(event, () => {
      localStorage.setItem('lastUserActivity', Date.now().toString())
    }, { passive: true })
  })
}

// 初始化版本检测
const initVersionCheck = () => {
  // 页面加载时检测一次
  checkForUpdates()
  
  // 定时检测（每24小时检测一次）
  checkInterval.value = setInterval(() => {
    // 只有在用户活跃时检测
    if (isUserActive()) {
      checkForUpdates()
    }
  }, 24 * 60 * 60 * 1000)
}

// 组件挂载
onMounted(() => {
  // 监听用户活动
  listenUserActivity()
  
  // 初始化版本检测
  initVersionCheck()
})

// 组件卸载
onUnmounted(() => {
  // 清除定时器
  if (checkInterval.value) {
    clearInterval(checkInterval.value)
    checkInterval.value = null
  }
})
</script>

<style scoped>
/* 基础样式 */
.card {
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-body {
  padding: 1.5rem;
}

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
  /* 卡片头部 */
  .card-header {
    padding: 1rem;
  }
  
  .card-title {
    font-size: 1.1rem !important;
  }
  
  .btn-sm {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
  
  /* 卡片内容 */
  .card-body {
    padding: 1rem;
  }
  
  /* 加载状态 */
  .text-center.py-10 {
    padding: 6rem 1rem !important;
  }
  
  /* 版本信息 */
  .p-4 {
    padding: 1rem !important;
  }
  
  .mb-5 {
    margin-bottom: 1.5rem !important;
  }
  
  .mb-4 {
    margin-bottom: 1.5rem !important;
  }
  
  .mb-2 {
    margin-bottom: 0.75rem !important;
  }
  
  .text-lg {
    font-size: 1.1rem !important;
  }
  
  /* 更新内容 */
  .bg-white.p-3 {
    padding: 0.75rem !important;
  }
  
  .text-sm {
    font-size: 0.85rem;
  }
  
  /* 按钮 */
  .btn {
    font-size: 0.9rem;
  }
}
</style>