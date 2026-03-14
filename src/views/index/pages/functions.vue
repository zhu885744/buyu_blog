<!-- 主题设置页面 -->
<template>
  <div class="config-page mt-2">
    <!-- 页面头部 -->
    <div class="card shadow-sm mb-2">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div class="header-content">
            <h1 class="page-title d-flex align-items-center gap-3 fw-bold">
              <i class="bi bi-sliders fs-2"></i>
              站点配置
            </h1>
            <p class="page-description text-muted mt-1">管理您的网站全局设置、评论配置和主题选项</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 权限检查 -->
    <div v-if="!isAdmin" class="auth-error-container">
      <div class="card shadow-lg">
        <div class="card-body text-center py-12 px-4">
          <div class="error-icon mb-4">
            <i class="bi bi-shield-lock text-danger fs-4"></i>
          </div>
          <h3 class="error-title mb-3">权限不足</h3>
          <p class="error-description text-muted mb-6">您没有权限访问此页面，请联系管理员</p>
          <router-link to="/" class="btn btn-primary rounded-full px-6 py-2">
            <i class="bi bi-house me-2"></i>
            返回首页
          </router-link>
        </div>
      </div>
    </div>

    <!-- 配置内容 -->
    <div v-else-if="isAdmin" class="config-content">
      <!-- 导航标签 -->
      <div class="card config-tabs-container mb-2">
        <div class="tabs-wrapper">
          <ul class="nav nav-tabs config-nav-tabs" id="configTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link active" 
                id="global-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#global" 
                type="button" 
                role="tab" 
                aria-controls="global" 
                aria-selected="true"
              >
                <i class="bi bi-globe me-2"></i>
                全局设置
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                id="comment-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#comment" 
                type="button" 
                role="tab" 
                aria-controls="comment" 
                aria-selected="false"
              >
                <i class="bi bi-chat-left-text me-2"></i>
                评论设置
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link" 
                id="homepage-tab" 
                data-bs-toggle="tab" 
                data-bs-target="#homepage" 
                type="button" 
                role="tab" 
                aria-controls="homepage" 
                aria-selected="false"
              >
                <i class="bi bi-house me-2"></i>
                首页配置
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- 标签内容 -->
      <div class="tab-content" id="configTabsContent">
        <!-- 全局设置 -->
        <div 
          class="tab-pane fade show active" 
          id="global" 
          role="tabpanel" 
          aria-labelledby="global-tab"
        >
          <div class="config-section">
            <div class="card shadow-sm">
              <div class="card-body p-3">
              <form class="global-config-form">
                <!-- 网站基本信息 -->
                <div class="form-section mb-6">
                  <h3 class="form-section-title mb-4 fw-medium text-gray-700">网站基本信息</h3>
                  <div class="row g-4">
                    <div class="col-md-6">
                      <label for="site-title" class="form-label">网站标题</label>
                      <input 
                        type="text" 
                        class="form-control rounded-1 border-gray-300 shadow-sm"
                        id="site-title"
                        v-model="globalConfig.title"
                        placeholder="输入您的网站标题"
                      >
                      <div class="form-text text-muted mt-1">显示在浏览器标签和网站头部</div>
                    </div>
                    <div class="col-md-6">
                      <label for="site-description" class="form-label">网站描述</label>
                      <input 
                        type="text" 
                        class="form-control rounded-1 border-gray-300 shadow-sm"
                        id="site-description"
                        v-model="globalConfig.description"
                        placeholder="输入您的网站描述"
                      >
                      <div class="form-text text-muted mt-1">用于SEO和社交媒体分享</div>
                    </div>
                    <div class="col-md-6">
                      <label for="site-keyword" class="form-label">网站关键词</label>
                      <input 
                        type="text" 
                        class="form-control rounded-1 border-gray-300 shadow-sm"
                        id="site-keyword"
                        v-model="globalConfig.keyword"
                        placeholder="输入关键词，用逗号分隔"
                      >
                      <div class="form-text text-muted mt-1">用于SEO优化，多个关键词用逗号分隔</div>
                    </div>
                    <div class="col-md-6">
                      <label for="site-avatar" class="form-label">网站LOGO</label>
                      <input 
                        type="text" 
                        class="form-control rounded-1 border-gray-300 shadow-sm"
                        id="site-avatar"
                        v-model="globalConfig.avatar"
                        placeholder="输入LOGO URL"
                      >
                      <div class="form-text text-muted mt-1">网站的LOGO图片</div>
                    </div>
                    <div class="col-md-6">
                      <label for="site-favicon" class="form-label">网站图标</label>
                      <input 
                        type="text" 
                        class="form-control rounded-1 border-gray-300 shadow-sm"
                        id="site-favicon"
                        v-model="globalConfig.favicon"
                        placeholder="输入favicon URL"
                      >
                      <div class="form-text text-muted mt-1">浏览器标签显示的图标</div>
                    </div>
                    <div class="col-md-6">
                      <label for="site-date" class="form-label">建站日期</label>
                      <input 
                        type="date" 
                        class="form-control rounded-1 border-gray-300 shadow-sm"
                        id="site-date"
                        :value="formatDate(globalConfig.date)"
                        @change="handleDateChange"
                      >
                      <div class="form-text text-muted mt-1">网站的建立日期</div>
                    </div>
                  </div>
                </div>

                <!-- 备案信息 -->
                <div class="form-section mb-6">
                  <h3 class="form-section-title mb-4 fw-medium text-gray-700">备案信息</h3>
                  <div class="row g-4">
                    <div class="col-md-6">
                      <label for="copy-code" class="form-label">ICP备案号</label>
                      <input 
                        type="text" 
                        class="form-control rounded-1 border-gray-300 shadow-sm"
                        id="copy-code"
                        v-model="globalConfig.copy.code"
                        placeholder="输入ICP备案号"
                      >
                      <div class="form-text text-muted mt-1">工信部ICP备案号</div>
                    </div>
                    <div class="col-md-6">
                      <label for="copy-link" class="form-label">ICP备案链接</label>
                      <input 
                        type="text" 
                        class="form-control rounded-1 border-gray-300 shadow-sm"
                        id="copy-link"
                        v-model="globalConfig.copy.link"
                        placeholder="输入备案链接"
                      >
                      <div class="form-text text-muted mt-1">备案查询链接</div>
                    </div>
                    <div class="col-md-6">
                      <label for="police-code" class="form-label">公安备案号</label>
                      <input 
                        type="text" 
                        class="form-control rounded-1 border-gray-300 shadow-sm"
                        id="police-code"
                        v-model="globalConfig.police.code"
                        placeholder="输入公安备案号"
                      >
                      <div class="form-text text-muted mt-1">公安联网备案号</div>
                    </div>
                    <div class="col-md-6">
                      <label for="police-link" class="form-label">公安备案链接</label>
                      <input 
                        type="text" 
                        class="form-control rounded-1 border-gray-300 shadow-sm"
                        id="police-link"
                        v-model="globalConfig.police.link"
                        placeholder="输入公安备案链接"
                      >
                      <div class="form-text text-muted mt-1">公安备案查询链接</div>
                    </div>
                  </div>
                </div>

                <!-- 保存按钮 -->
                <div class="form-actions mt-8">
                  <button 
                    type="button" 
                    class="btn btn-primary rounded-full px-6 py-2.5 shadow-sm"
                    @click="saveGlobalConfig"
                    :disabled="saving"
                  >
                    <i class="bi" :class="saving ? 'bi-arrow-clockwise spin' : 'bi-save'"></i>
                    {{ saving ? ' 保存中...' : ' 保存全局设置' }}
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary rounded-full px-6 py-2.5 shadow-sm ms-3"
                    @click="resetGlobalConfig"
                    :disabled="saving"
                  >
                    <i class="bi bi-arrow-counterclockwise me-2"></i>
                    重置
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        </div>

        <!-- 评论设置 -->
        <div 
          class="tab-pane fade" 
          id="comment" 
          role="tabpanel" 
          aria-labelledby="comment-tab"
        >
          <div class="config-section">
            <!-- 评论设置表单 -->
            <div class="card shadow-sm">
              <div class="card-body p-3">
              <form class="comment-config-form">
                <!-- 速率限制 -->
                <div class="form-section mb-6">
                  <h3 class="form-section-title mb-4 fw-medium text-gray-700">速率限制</h3>
                  <div class="form-check mb-4">
                    <input 
                      class="form-check-input rounded border-gray-300"
                      type="checkbox" 
                      id="rate_limit_enabled"
                      v-model="commentConfig.rate_limit.enabled"
                    >
                    <label class="form-check-label" for="rate_limit_enabled">
                      启用速率限制，防止频繁评论
                    </label>
                  </div>
                  <div class="row g-4" v-if="commentConfig.rate_limit.enabled">
                    <div class="col-md-4">
                      <label for="rate_limit_max_count" class="form-label">最大评论数</label>
                      <div class="input-group">
                        <input 
                          type="number" 
                          class="form-control rounded-1 border-gray-300 shadow-sm"
                          id="rate_limit_max_count"
                          v-model.number="commentConfig.rate_limit.max_count"
                          min="1"
                          max="100"
                        >
                        <span class="input-group-text rounded-1 border-gray-300">条</span>
                      </div>
                      <div class="form-text text-muted mt-1">时间窗口内允许的最大评论数</div>
                    </div>
                    <div class="col-md-4">
                      <label for="rate_limit_time_window" class="form-label">时间窗口</label>
                      <div class="input-group">
                        <input 
                          type="number" 
                          class="form-control rounded-1 border-gray-300 shadow-sm"
                          id="rate_limit_time_window"
                          v-model.number="commentConfig.rate_limit.time_window"
                          min="1"
                          max="3600"
                        >
                        <span class="input-group-text rounded-1 border-gray-300">秒</span>
                      </div>
                      <div class="form-text text-muted mt-1">速率限制的时间窗口</div>
                    </div>
                  </div>
                </div>

                <!-- 评论长度限制 -->
                <div class="form-section mb-6">
                  <h3 class="form-section-title mb-4 fw-medium text-gray-700">评论长度</h3>
                  <div class="row g-4">
                    <div class="col-md-4">
                      <label for="max_length" class="form-label">最大长度</label>
                      <div class="input-group">
                        <input 
                          type="number" 
                          class="form-control rounded-1 border-gray-300 shadow-sm"
                          id="max_length"
                          v-model.number="commentConfig.max_length"
                          min="1"
                          max="10000"
                        >
                        <span class="input-group-text rounded-1 border-gray-300">字</span>
                      </div>
                      <div class="form-text text-muted mt-1">单条评论的最大长度</div>
                    </div>
                  </div>
                </div>

                <!-- 内容要求 -->
                <div class="form-section mb-6">
                  <h3 class="form-section-title mb-4 fw-medium text-gray-700">内容要求</h3>
                  <div class="form-check mb-3">
                    <input 
                      class="form-check-input rounded border-gray-300"
                      type="checkbox" 
                      id="require_chinese"
                      v-model="commentConfig.require_chinese"
                    >
                    <label class="form-check-label" for="require_chinese">
                      要求评论内容包含中文
                    </label>
                  </div>
                  <div class="form-check mb-3">
                    <input 
                      class="form-check-input rounded border-gray-300"
                      type="checkbox" 
                      id="sensitive_filter"
                      v-model="commentConfig.sensitive_filter"
                    >
                    <label class="form-check-label" for="sensitive_filter">
                      启用敏感词过滤
                    </label>
                  </div>
                </div>

                <!-- 敏感词 -->
                <div class="form-section mb-6" v-if="commentConfig.sensitive_filter">
                  <h3 class="form-section-title mb-4 fw-medium text-gray-700">敏感词设置</h3>
                  <div class="mb-3">
                    <label for="sensitive_words" class="form-label">敏感词列表</label>
                    <textarea 
                      class="form-control rounded-1 border-gray-300 shadow-sm"
                      id="sensitive_words"
                      v-model="commentConfig.sensitive_words"
                      rows="4"
                      placeholder="在这里输入敏感词，多个敏感词用「,」分隔"
                    ></textarea>
                    <div class="form-text text-muted mt-1">评论中包含这些词将被拒绝，多个敏感词用「,」分隔</div>
                  </div>
                </div>

                <!-- 邮件通知 -->
                <div class="form-section mb-6">
                  <h3 class="form-section-title mb-4 fw-medium text-gray-700">邮件通知</h3>
                  <div class="form-check mb-4">
                    <input 
                      class="form-check-input rounded border-gray-300"
                      type="checkbox" 
                      id="email_notify_enabled"
                      v-model="commentConfig.email_notify.enabled"
                    >
                    <label class="form-check-label" for="email_notify_enabled">
                      启用邮件通知
                    </label>
                  </div>
                  <div class="row g-4" v-if="commentConfig.email_notify.enabled">
                    <div class="col-md-4">
                      <label for="email_notify_retry_count" class="form-label">重试次数</label>
                      <div class="input-group">
                        <input 
                          type="number" 
                          class="form-control rounded-1 border-gray-300 shadow-sm"
                          id="email_notify_retry_count"
                          v-model.number="commentConfig.email_notify.retry_count"
                          min="1"
                          max="10"
                        >
                        <span class="input-group-text rounded-1 border-gray-300">次</span>
                      </div>
                      <div class="form-text text-muted mt-1">发送失败时的重试次数</div>
                    </div>
                    <div class="col-md-4">
                      <label for="email_notify_retry_interval" class="form-label">重试间隔</label>
                      <div class="input-group">
                        <input 
                          type="number" 
                          class="form-control rounded-1 border-gray-300 shadow-sm"
                          id="email_notify_retry_interval"
                          v-model.number="commentConfig.email_notify.retry_interval"
                          min="1"
                          max="60"
                        >
                        <span class="input-group-text rounded-1 border-gray-300">秒</span>
                      </div>
                      <div class="form-text text-muted mt-1">每次重试的时间间隔</div>
                    </div>
                  </div>
                </div>

                <!-- 保存按钮 -->
                <div class="form-actions mt-8">
                  <button 
                    type="button" 
                    class="btn btn-primary rounded-full px-6 py-2.5 shadow-sm"
                    @click="saveCommentConfig"
                    :disabled="saving"
                  >
                    <i class="bi" :class="saving ? 'bi-arrow-clockwise spin' : 'bi-save'"></i>
                    {{ saving ? ' 保存中...' : ' 保存评论设置' }}
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary rounded-full px-6 py-2.5 shadow-sm ms-3"
                    @click="resetCommentConfig"
                    :disabled="saving"
                  >
                    <i class="bi bi-arrow-counterclockwise me-2"></i>
                    重置
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        </div>

        <!-- 首页配置 -->
        <div 
          class="tab-pane fade" 
          id="homepage" 
          role="tabpanel" 
          aria-labelledby="homepage-tab"
        >
          <div class="config-section">
            <!-- 首页配置表单 -->
            <div class="card shadow-sm">
              <div class="card-body p-3">
              <form class="homepage-config-form">
                <!-- 显示模式设置 -->
                <div class="form-section mb-6">
                  <h3 class="form-section-title mb-4 fw-medium text-gray-700">显示模式</h3>
                  <div class="row g-4">
                    <div class="col-md-6">
                      <div class="d-flex align-items-center justify-content-between">
                        <div>
                          <label class="form-label fw-medium">文章列表布局</label>
                          <p class="form-text text-muted mt-1">选择首页文章卡片的显示模式</p>
                        </div>
                        <div class="form-check form-switch">
                          <input 
                            class="form-check-input" 
                            type="checkbox" 
                            id="display_mode_switch"
                            v-model="homepageConfig.display_mode"
                          >
                          <label class="form-check-label" for="display_mode_switch">
                            {{ homepageConfig.display_mode ? '有图模式' : '无图模式' }}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 保存按钮 -->
                <div class="form-actions mt-8">
                  <button 
                    type="button" 
                    class="btn btn-primary rounded-full px-6 py-2.5 shadow-sm"
                    @click="saveHomepageConfig"
                    :disabled="saving"
                  >
                    <i class="bi" :class="saving ? 'bi-arrow-clockwise spin' : 'bi-save'"></i>
                    {{ saving ? ' 保存中...' : ' 保存首页设置' }}
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary rounded-full px-6 py-2.5 shadow-sm ms-3"
                    @click="resetHomepageConfig"
                    :disabled="saving"
                  >
                    <i class="bi bi-arrow-counterclockwise me-2"></i>
                    重置
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCommStore } from '@/store/comm'
import toast from '@/utils/toast'
import request from '@/utils/request'
import { usePageTitle } from '@/utils/usePageTitle'

const store = useCommStore()

// 页面标题管理
const { setDynamicTitle } = usePageTitle()
setDynamicTitle('站点配置')

// 响应式数据
const commentConfig = ref({
  rate_limit: {
    enabled: true,
    max_count: 5,
    time_window: 60
  },
  max_length: 500,
  require_chinese: true,
  sensitive_filter: true,
  sensitive_words: '广告,开盘,开户',
  email_notify: {
    enabled: true,
    retry_count: 3,
    retry_interval: 5
  }
})

const globalConfig = ref({
  title: '',
  description: '',
  keyword: '',
  avatar: '',
  favicon: '',
  date: Math.floor(Date.now() / 1000).toString(),
  display_mode: true, // true为有图模式，false为无图模式
  copy: {
    code: '',
    link: 'http://beian.miit.gov.cn/'
  },
  police: {
    code: '',
    link: 'https://beian.mps.gov.cn/#/query/webSearch'
  }
})

const homepageConfig = ref({
  display_mode: true // true为有图模式，false为无图模式
})

const saving = ref(false)
const message = ref('')
const messageType = ref('')

// 计算属性
// 是否为管理员
const isAdmin = computed(() => {
  const userInfo = store.login.user
  // 检查不同可能的用户信息结构
  const userAuth = userInfo?.result?.auth || userInfo?.auth
  const userGroups = userAuth?.group?.list || userInfo?.group?.list || []
  return userAuth?.all || userGroups.some(group => group.key === 'admin')
})

// 方法
// 获取评论配置
async function getCommentConfig() {
  try {
    const response = await request.get('/api/config/one', {
      key: 'COMMENT'
    })
    if (response.code === 200 && response.data) {
      const config = response.data.json || {}
      // 填充表单
      commentConfig.value = {
        rate_limit: {
          enabled: config.rate_limit?.enabled === 1,
          max_count: config.rate_limit?.max_count || 5,
          time_window: config.rate_limit?.time_window || 60
        },
        max_length: config.max_length || 500,
        require_chinese: config.require_chinese === 1,
        sensitive_filter: config.sensitive_filter === 1,
        sensitive_words: config.sensitive_words?.join(',') || '广告,开盘,开户',
        email_notify: {
          enabled: config.email_notify?.enabled === 1,
          retry_count: config.email_notify?.retry_count || 3,
          retry_interval: config.email_notify?.retry_interval || 5
        }
      }
    }
  } catch (error) {
    console.error('获取评论配置失败:', error)
    toast.error('获取评论配置失败')
  }
}

// 获取全局配置
async function getGlobalConfig() {
  try {
    const response = await request.get('/api/config/one', {
      key: 'buyu_functions'
    })
    if (response.code === 200 && response.data) {
      const config = response.data.json || {}
      // 填充表单
      globalConfig.value = {
        title: config.title || '',
        description: config.description || '',
        keyword: config.keyword || '',
        avatar: config.avatar || '',
        favicon: config.favicon || '',
        date: config.date || Math.floor(Date.now() / 1000).toString(),
        display_mode: config.display_mode !== false, // 默认值为true
        copy: {
          code: config.copy?.code || '',
          link: config.copy?.link || 'http://beian.mps.gov.cn/'
        },
        police: {
          code: config.police?.code || '',
          link: config.police?.link || 'https://beian.mps.gov.cn/#/query/webSearch'
        }
      }
      // 同时更新首页配置
      homepageConfig.value.display_mode = globalConfig.value.display_mode
    }
  } catch (error) {
    console.error('获取全局配置失败:', error)
    toast.error('获取全局配置失败')
  }
}

// 保存评论配置
async function saveCommentConfig() {
  saving.value = true
  message.value = ''
  messageType.value = ''
  
  try {
    // 构建配置对象
    const config = {
      rate_limit: {
        enabled: commentConfig.value.rate_limit.enabled ? 1 : 0,
        max_count: commentConfig.value.rate_limit.max_count || 5,
        time_window: commentConfig.value.rate_limit.time_window || 60
      },
      max_length: commentConfig.value.max_length || 500,
      require_chinese: commentConfig.value.require_chinese ? 1 : 0,
      sensitive_filter: commentConfig.value.sensitive_filter ? 1 : 0,
      sensitive_words: commentConfig.value.sensitive_words
        .split(',')
        .map(word => word.trim())
        .filter(word => word),
      email_notify: {
        enabled: commentConfig.value.email_notify.enabled ? 1 : 0,
        retry_count: commentConfig.value.email_notify.retry_count || 3,
        retry_interval: commentConfig.value.email_notify.retry_interval || 5
      }
    }

    const response = await request.post('/api/config/save', {
      key: 'COMMENT',
      json: config
    })

    if (response.code === 200) {
      message.value = '评论设置保存成功！'
      messageType.value = 'success'
      toast.success('评论设置保存成功')
    } else {
      message.value = '评论设置保存失败：' + (response.msg || '未知错误')
      messageType.value = 'error'
      toast.error('评论设置保存失败')
    }
  } catch (error) {
    console.error('保存评论设置失败:', error)
    message.value = '评论设置保存失败：网络错误'
    messageType.value = 'error'
    toast.error('评论设置保存失败：网络错误')
  } finally {
    saving.value = false
  }
}

// 保存全局配置
async function saveGlobalConfig() {
  saving.value = true
  message.value = ''
  messageType.value = ''
  
  try {
    const response = await request.post('/api/config/save', {
      key: 'buyu_functions',
      json: globalConfig.value
    })

    if (response.code === 200) {
      message.value = '全局配置保存成功！'
      messageType.value = 'success'
      toast.success('全局配置保存成功')
      // 保存成功后强制刷新站点信息，更新缓存
      await store.fetchSiteInfo(true)
    } else {
      message.value = '全局配置保存失败：' + (response.msg || '未知错误')
      messageType.value = 'error'
      toast.error('全局配置保存失败')
    }
  } catch (error) {
    console.error('保存全局配置失败:', error)
    message.value = '保存失败：网络错误'
    messageType.value = 'error'
    toast.error('保存失败：网络错误')
  } finally {
    saving.value = false
  }
}

// 日期处理方法
function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = new Date(parseInt(timestamp) * 1000)
  return date.toISOString().split('T')[0]
}

function handleDateChange(event) {
  const dateStr = event.target.value
  if (dateStr) {
    const timestamp = Math.floor(new Date(dateStr).getTime() / 1000)
    globalConfig.value.date = timestamp.toString()
  } else {
    globalConfig.value.date = Math.floor(Date.now() / 1000).toString()
  }
}

// 获取首页配置
async function getHomepageConfig() {
  try {
    // 从后端API获取配置
    const response = await request.get('/api/config/one', { key: 'buyu_functions' })
    if (response.code === 200 && response.data) {
      const config = response.data.json || {}
      homepageConfig.value.display_mode = config.display_mode !== false // 默认值为true
    }
  } catch (error) {
    console.error('获取首页配置失败:', error)
    toast.error('获取首页配置失败')
  }
}

// 保存首页配置
async function saveHomepageConfig() {
  saving.value = true
  message.value = ''
  messageType.value = ''
  
  try {
    // 先获取当前全局配置，避免覆盖其他配置项
    const configResponse = await request.get('/api/config/one', { key: 'buyu_functions' })
    let currentConfig = {}
    if (configResponse.code === 200 && configResponse.data) {
      currentConfig = configResponse.data.json || {}
    }
    
    // 只更新display_mode字段
    const updatedConfig = {
      ...currentConfig,
      display_mode: homepageConfig.value.display_mode
    }
    
    // 保存到后端API
    const response = await request.post('/api/config/save', {
      key: 'buyu_functions',
      json: updatedConfig
    })
    
    if (response.code === 200) {
      message.value = '首页配置保存成功！'
      messageType.value = 'success'
      toast.success('首页配置保存成功')
      // 保存成功后强制刷新站点信息，更新缓存
      await store.fetchSiteInfo(true)
    } else {
      message.value = '首页配置保存失败：' + (response.msg || '未知错误')
      messageType.value = 'error'
      toast.error('首页配置保存失败')
    }
  } catch (error) {
    console.error('保存首页配置失败:', error)
    message.value = '保存失败：网络错误'
    messageType.value = 'error'
    toast.error('保存失败：网络错误')
  } finally {
    saving.value = false
  }
}

// 重置配置
function resetCommentConfig() {
  commentConfig.value = {
    rate_limit: {
      enabled: true,
      max_count: 5,
      time_window: 60
    },
    max_length: 500,
    require_chinese: true,
    sensitive_filter: true,
    sensitive_words: '敏感词1,敏感词2,敏感词3',
    email_notify: {
      enabled: true,
      retry_count: 3,
      retry_interval: 5
    }
  }
}

function resetGlobalConfig() {
  globalConfig.value = {
    title: '',
    description: '',
    keyword: '',
    avatar: '',
    favicon: '',
    date: Math.floor(Date.now() / 1000).toString(),
    copy: {
      code: '',
      link: 'http://beian.miit.gov.cn/'
    },
    police: {
      code: '',
      link: 'https://beian.mps.gov.cn/#/query/webSearch'
    }
  }
}

function resetHomepageConfig() {
  homepageConfig.value = {
    display_mode: true // 默认为有图模式
  }
}

// 组件挂载
onMounted(async () => {
  // 检查登录状态
  await store.checkLoginState()
  
  // 如果是管理员，获取所有配置
  if (isAdmin.value) {
    await Promise.all([
      getCommentConfig(),
      getGlobalConfig(),
      getHomepageConfig()
    ])
  }
})
</script>

<style scoped>
.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.error-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background-color: rgba(var(--bs-danger-rgb), 0.1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--bs-text-primary);
}

.error-description {
  font-size: 1rem;
  color: var(--bs-text-muted);
  line-height: 1.6;
}

/* 导航标签容器 */
.config-tabs-container {
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

/* 导航标签 */
.config-nav-tabs {
  border-bottom: none;
}

.config-nav-tabs .nav-link {
  padding: 1rem 1.75rem;
  font-weight: 500;
  font-size: 1rem;
  color: var(--bs-text-muted);
  border: none;
  border-radius: 0;
  transition: all 0.3s ease;
  position: relative;
}

.config-nav-tabs .nav-link:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.05);
}

.config-nav-tabs .nav-link.active {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  font-weight: 600;
}

.config-nav-tabs .nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--bs-primary);
}

/* 配置区域 */
.config-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: var(--bs-text-primary);
  margin-bottom: 0.5rem;
}

.section-description {
  font-size: 0.95rem;
  color: var(--bs-text-muted);
}

/* Bootstrap 5 卡片样式已内置 */

/* 表单部分 */
.form-section {
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--bs-border-color);
}

.form-section:last-child {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

.form-section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--bs-text-primary);
  margin-bottom: 1.5rem;
}

/* 输入框样式 */
.form-control {
  border-radius: 0.5rem;
  border: 1px solid var(--bs-border-color);
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.form-control:focus {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
  outline: none;
}

/* 按钮样式 */
.btn {
  border-radius: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn-outline-secondary {
  border-color: var(--bs-border-color);
  color: var(--bs-text-muted);
}

.btn-outline-secondary:hover {
  background-color: var(--bs-secondary);
  border-color: var(--bs-secondary);
  color: var(--bs-white);
}

/* 表单操作区域 */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* 输入组样式 */
.input-group {
  border-radius: 0.5rem;
  overflow: hidden;
}

.input-group-text {
  border-radius: 0;
  border: 1px solid var(--bs-border-color);
  background-color: var(--bs-gray-50);
}

/* 颜色选择器 */
.form-control-color {
  width: 3rem;
  height: 3rem;
  padding: 0.25rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.5rem;
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
@media (max-width: 992px) {
  .config-page {
    padding: 1.5rem 0;
  }
  
  .config-header {
    margin-bottom: 2rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .card-body {
    padding: 1.5rem !important;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .btn {
    width: 100%;
    margin-left: 0 !important;
  }
}

@media (max-width: 768px) {
  .config-page {
    padding: 1rem 0;
  }
  
  .config-tabs-container {
    margin-bottom: 2rem;
  }
  
  .config-nav-tabs .nav-link {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }
  
  .section-title {
    font-size: 1.2rem;
  }
  
  .card-body {
    padding: 1.25rem !important;
  }
  
  .form-section {
    margin-bottom: 2rem;
  }
  
  .form-check {
    margin-bottom: 1rem;
  }
  
  .auth-error-card {
    padding: 3rem 1.5rem;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .config-nav-tabs .nav-link {
    color: var(--bs-dark-text-muted);
  }
  
  .config-nav-tabs .nav-link:hover {
    background-color: rgba(var(--bs-primary-rgb), 0.15);
  }
  
  .config-nav-tabs .nav-link.active {
    background-color: rgba(var(--bs-primary-rgb), 0.2);
  }
  
  .config-card {
    background-color: var(--bs-dark-bg-subtle);
    border-color: var(--bs-dark-border-color);
  }
  
  .form-control {
    background-color: var(--bs-dark-bg);
    border-color: var(--bs-dark-border-color);
    color: var(--bs-dark-text);
  }
  
  .form-control:focus {
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.3);
  }
  
  .input-group-text {
    background-color: var(--bs-dark-bg);
    border-color: var(--bs-dark-border-color);
    color: var(--bs-dark-text);
  }
}
</style>