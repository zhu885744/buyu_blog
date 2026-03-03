<template>
  <!-- 全局外层容器：居中、收窄宽度、统一留白 -->
  <div class="article-page-wrapper">
    <!-- 加载状态：优化尺寸、间距，更协调 -->
    <div v-if="loading" class="page-loading">
      <div class="spinner-border text-info fs-4" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="article-content-wrap card shadow-sm p-3 mt-2">
      <p class="mb-0 fw-normal">{{ errorMsg }}</p>
    </div>

    <!-- 独立页面主体：核心UI重写 -->
    <div v-else class="article-main">
      <!-- 归档页面统计信息 -->
      <div v-if="isArchivePage">
        <!-- 统计信息卡片区域 -->
          <main class="article-content-wrap card shadow-sm mt-2">
            <div class="p-3">
              <!-- 页面标题 -->
              <header class="article-header mt-2 mb-4">
                <h1 class="article-title text-center fw-bold mb-3">{{ pageInfo.title || '归档' }}</h1>
                <!-- 文章元信息：居中布局、弱化样式 -->
                <div class="article-meta d-flex flex-wrap justify-content-center align-items-center text-muted gap-4 fs-6">
                  <span class="meta-item d-flex align-items-center">
                    <i class="bi bi-person-fill me-2"></i>
                    {{ authorInfo.nickname || '匿名' }}
                  </span>
                  <span class="meta-item d-flex align-items-center">
                    <i class="bi bi-calendar-fill me-2"></i>
                    {{ formatTime(pageInfo.last_update || Date.now() / 1000) }}
                  </span>
                  <span class="meta-item d-flex align-items-center">
                    <i class="bi bi-eye-fill me-2"></i>
                    {{ viewCount || 0 }} 浏览
                  </span>
                </div>
              </header>
              <!-- 统计信息网格 -->
              <div class="stats-grid">
                <!-- 文章总数 -->
                <div class="stat-card">
                  <div class="stat-icon article-icon">
                    <i class="bi bi-file-earmark-text"></i>
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-value">{{ archiveStats.articleCount || 0 }}</h3>
                    <p class="stat-label">文章总数</p>
                  </div>
                </div>

                <!-- 文章分类总数 -->
                <div class="stat-card">
                  <div class="stat-icon category-icon">
                    <i class="bi bi-tags"></i>
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-value">{{ archiveStats.categoryCount || 0 }}</h3>
                    <p class="stat-label">文章分类总数</p>
                  </div>
                </div>

            <!-- 独立页面总数 -->
            <div class="stat-card">
              <div class="stat-icon page-icon">
                <i class="bi bi-file-earmark"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-value">{{ archiveStats.pageCount || 0 }}</h3>
                <p class="stat-label">独立页面总数</p>
              </div>
            </div>

            <!-- 标签总数 -->
            <div class="stat-card">
              <div class="stat-icon tag-icon">
                <i class="bi bi-tag"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-value">{{ archiveStats.tagCount || 0 }}</h3>
                <p class="stat-label">标签总数</p>
              </div>
            </div>

            <!-- 友情链接总数 -->
            <div class="stat-card">
              <div class="stat-icon link-icon">
                <i class="bi bi-link"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-value">{{ archiveStats.linkCount || 0 }}</h3>
                <p class="stat-label">友情链接总数</p>
              </div>
            </div>

            <!-- 评论总数 -->
            <div class="stat-card">
              <div class="stat-icon comment-icon">
                <i class="bi bi-chat"></i>
              </div>
              <div class="stat-content">
                <h3 class="stat-value">{{ archiveStats.commentCount || 0 }}</h3>
                <p class="stat-label">评论总数</p>
              </div>
            </div>
          </div>

          <!-- 刷新按钮 -->
          <div class="refresh-container">
            <button 
              @click="refreshArchiveStats" 
              class="refresh-btn"
              :disabled="refreshingArchive"
            >
              <i class="bi bi-arrow-clockwise" :class="{ 'spin': refreshingArchive }"></i>
              {{ refreshingArchive ? '刷新中...' : '刷新数据' }}
            </button>
          </div>
            </div>
        </main>
      </div>

      <!-- 友链页面 -->
      <div v-else-if="isLinksPage">
        <!-- 全局加载状态 -->
        <div v-if="loading" class="d-flex justify-content-center align-items-center py-10">
          <div class="spinner-border text-info" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="article-content-wrap card shadow-sm p-3 mt-2">
          <p class="mb-0 fw-normal">{{ errorMsg }}</p>
        </div>

        <!-- 友链页面主体 -->
        <main v-else class="card shadow-sm mt-2">
          <div class="p-3">
          <!-- 页面标题 -->
          <header class="article-header mt-2 mb-2">
            <h1 class="article-title text-center fw-bold mb-3">{{ pageInfo.title || '友链页面' }}</h1>
            <!-- 文章元信息：居中布局、弱化样式 -->
            <div class="article-meta d-flex flex-wrap justify-content-center align-items-center text-muted gap-4 fs-6">
              <span class="meta-item d-flex align-items-center">
                <i class="bi bi-person-fill me-2"></i>
                {{ authorInfo.nickname || '匿名' }}
              </span>
              <span class="meta-item d-flex align-items-center">
                <i class="bi bi-calendar-fill me-2"></i>
                {{ formatTime(pageInfo.last_update || Date.now() / 1000) }}
              </span>
              <span class="meta-item d-flex align-items-center">
                <i class="bi bi-chat-fill me-2"></i>
                {{ commentCount || 0 }} 评论
              </span>
              <span class="meta-item d-flex align-items-center">
                <i class="bi bi-eye-fill me-2"></i>
                {{ viewCount || 0 }} 浏览
              </span>
            </div>
          </header>
          
          <!-- 核心内容区 -->
          <div class="pb-2">
            <!-- 友链介绍 -->
            <div class="article-content text-secondary mb-5">
              <i-markdown :model-value="pageInfo.content || '暂无友链介绍，敬请期待～'" />
            </div>

            <!-- 友链数据加载状态 -->
            <div v-if="linksLoading" class="d-flex justify-content-center py-3">
              <div class="spinner-border text-info spinner-border-sm" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            
            <!-- 友链加载错误 -->
            <div v-else-if="linksError" class="alert alert-warning d-flex align-items-center mt-2 p-2" role="alert">
              <i class="bi bi-exclamation-triangle-fill fs-4 me-2"></i>
              <p class="mb-0">{{ linksErrorMsg }}</p>
            </div>
            
            <!-- 无友链数据 -->
            <div v-else-if="links.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-link-45deg fs-1 mb-3"></i>
              <p class="mb-0">暂无友链数据，敬请期待～</p>
            </div>
            
            <!-- 友链分组展示 -->
            <div v-else class="link-list-container">
              <div v-for="(groupLinks, groupName) in groupLinkMap" :key="groupName" class="mb-6">
                <h3 class="link-cate mt-3">{{ groupName }}</h3>
                <!-- 调整列布局：长方形卡片适合更少的列数 -->
                <div class="row g-4">
                  <!-- 响应式调整：PC端2列，平板2列，手机1列 -->
                  <div v-for="link in groupLinks" :key="link.id" class="col-lg-6 col-md-6 col-sm-6 col-12">
                    <!-- 长方形友链卡片：横向布局 -->
                    <div class="link-card h-100 d-flex align-items-center p-4">
                      <!-- 头像区域 -->
                      <div class="link-avatar-wrapper me-4">
                        <img :src="link.avatar" :alt="link.nickname" class="link-avatar rounded-circle">
                      </div>
                      
                      <!-- 信息区域（占主要宽度） -->
                      <div class="link-info flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                          <h4 class="link-name fs-5 mb-0">{{ link.nickname }}</h4>
                          <a :href="link.url" :target="link.target || '_blank'" class="btn btn-outline-primary btn-sm">
                            访问
                          </a>
                        </div>
                        <p class="link-desc text-secondary mb-0">{{ link.description || '无介绍' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </main>
        
        <!-- 评论区域 -->
        <div class="mt-4">
          <i-comment 
              :articleId="pageInfo.id" 
              :commentCount="commentCount" 
              :commentList="commentList" 
              :isLogin="isLogin" 
              :isDarkMode="isDarkMode"
              :currentPage="currentPage"
              :pageSize="pageSize"
              :totalComments="totalComments"
              @publishComment="handlePublishComment"
              @replyComment="handleReplyComment"
              @pageChange="handleCommentPageChange"
            />
        </div>
      </div>

      <!-- 普通独立页面 -->
      <div v-else>
        <!-- 页面内容区：核心阅读区，重写样式 -->
        <main class="article-content-wrap card shadow-sm mt-2">
          <div class="p-3">
          <!-- 页面头部：标题+元信息 -->
          <header class="article-header mt-2">
            <h1 class="article-title text-center fw-bold mb-3">{{ pageInfo.title }}</h1>
            <!-- 文章元信息：居中布局、弱化样式 -->
            <div class="article-meta d-flex flex-wrap justify-content-center align-items-center text-muted gap-4 fs-6">
              <span class="meta-item d-flex align-items-center">
                <i class="bi bi-person-fill me-2"></i>
                {{ authorInfo.nickname || '匿名' }}
              </span>
              <span class="meta-item d-flex align-items-center">
                <i class="bi bi-calendar-fill me-2"></i>
                {{ formatTime(pageInfo.last_update || Date.now() / 1000) }}
              </span>
              <span class="meta-item d-flex align-items-center">
                <i class="bi bi-chat-fill me-2"></i>
                {{ commentCount || 0 }} 评论
              </span>
              <span class="meta-item d-flex align-items-center">
                <i class="bi bi-eye-fill me-2"></i>
                {{ viewCount || 0 }} 浏览
              </span>
            </div>
          </header>
          <div class="article-content mt-4">
            <i-markdown :model-value="pageInfo.content || '暂无页面内容，敬请期待～'" />
          </div>
          </div>
        </main>
        
        <!-- 评论区域：优化间距，自然衔接 -->
        <section class="article-comment mt-2 mb-8">
          <i-comment 
            :articleId="pageInfo.id" 
            :commentCount="commentCount" 
            :commentList="commentList" 
            :isLogin="isLogin" 
            :isDarkMode="isDarkMode"
            :articleAuthor="authorInfo"
            :currentPage="currentPage"
            :pageSize="pageSize"
            :totalComments="totalComments"
            @publishComment="handlePublishComment"
            @replyComment="handleReplyComment"
            @pageChange="handleCommentPageChange"
          />
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCommStore } from '@/store/comm'
import request from '@/utils/request'
import iMarkdown from '@/comps/custom/i-markdown.vue'
import iComment from '@/comps/custom/i-comment.vue'
import utils from '@/utils/utils'
import cache from '@/utils/cache'
import { usePageTitle } from '@/utils/usePageTitle'

// 状态管理
const store = useCommStore()

// 页面标题管理
const { setDynamicTitle } = usePageTitle()
setDynamicTitle('加载中...')

// 接收路由传递的页面key：使用pageKey代替key，避免保留关键字冲突
const props = defineProps({
  pageKey: {
    type: String,
    required: false,
    default: '',
  }
})

// 响应式状态
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const pageInfo = ref({})

// 路由实例
const router = useRouter()
const route = useRoute()

// 评论相关响应式数据
const commentCount = ref(0)
const commentList = ref([])
const isDarkMode = ref(false)
const authorInfo = ref({})
const viewCount = ref(0) // 浏览量
// 评论分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalComments = ref(0)

// 归档页面相关数据
const archiveStats = ref({
  articleCount: 0,
  categoryCount: 0,
  pageCount: 0,
  tagCount: 0,
  linkCount: 0,
  commentCount: 0
})
const refreshingArchive = ref(false)
let archiveRefreshTimer = null

// 友链页面相关数据
const links = ref([])
const linksLoading = ref(false)
const linksError = ref(false)
const linksErrorMsg = ref('')
const linkTotal = ref(0)

// 计算属性
const isLogin = computed(() => store.login.finish && Object.keys(store.login.user).length > 0)

// 判断是否为归档页面
const isArchivePage = computed(() => {
  const currentKey = (props.pageKey || route.params.key || '').trim()
  return currentKey === 'archive'
})

// 判断是否为友链页面
const isLinksPage = computed(() => {
  const currentKey = (props.pageKey || route.params.key || '').trim()
  return currentKey === 'links'
})

// 友链分组聚合
const groupLinkMap = computed(() => {
  const map = {}
  links.value.forEach(link => {
    const groupName = link.result?.group?.name || '未分组'
    if (!map[groupName]) map[groupName] = []
    map[groupName].push(link)
  })
  return map
})



/**
 * 时间格式化：使用utils.js中的timeToDate函数
 */
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  return utils.timeToDate(timestamp, 'Y-m-d')
}

/**
 * Key合法性校验：全量兜底，防止key为undefined/null
 */
const checkPageKey = (key) => {
  // 入参是initPage处理过的currentKey，已做trim，直接判断即可
  if (!key) {
    errorMsg.value = '页面标识不能为空，请检查访问地址'
    return false
  }
  const keyReg = /^[a-zA-Z0-9-_]+$/
  if (!keyReg.test(key)) {
    errorMsg.value = '页面标识不合法，仅允许字母、数字、横杠和下划线'
    return false
  }
  if (key.length > 20) {
    errorMsg.value = '页面标识过长，最大支持20个字符'
    return false
  }
  return true
}

/**
 * 获取独立页面数据：入参加兜底，双重防护
 */
const getPageData = async (pageKey) => {
  loading.value = true
  error.value = false
  errorMsg.value = ''
  try {
    // 缓存键
    const cacheKey = `page_detail_${pageKey}`
    const cacheExpire = 60 // 缓存60分钟
    
    // 尝试从缓存获取页面数据
    let cachedPage = cache.get(cacheKey)
    
    // 如果缓存不存在，从API获取
    if (!cachedPage) {
      const queryParams = {
        key: String(pageKey || '').trim(), // 兜底空字符串
        cache: false,
        withTrashed: false
      }
      const res = await request.get('/api/pages/one', queryParams)

      if (res.code === 200) {
      if (!res.data || Object.keys(res.data).length === 0) {
        error.value = true
        errorMsg.value = '未找到该独立页面，可能已被删除或访问地址错误'
        setDynamicTitle('页面不存在')
      } else {
        cachedPage = res.data
        // 缓存页面数据
        cache.set(cacheKey, cachedPage, cacheExpire)
        pageInfo.value = cachedPage
        // 更新浏览量
        viewCount.value = res.data.views || 0
        error.value = false
        setDynamicTitle(pageInfo.value.title)
      }
    } else {
      error.value = true
      errorMsg.value = res.msg || '获取独立页面数据失败'
      setDynamicTitle('获取页面失败')
    }
  } else {
    // 使用缓存数据
    pageInfo.value = cachedPage
    // 更新浏览量
    viewCount.value = cachedPage.views || 0
    error.value = false
    setDynamicTitle(pageInfo.value.title)
  }
} catch (err) {
  error.value = true
  errorMsg.value = '网络异常，请检查网络后刷新页面'
  // console.error('[独立页面接口异常]：', err)
  setDynamicTitle('网络异常')
} finally {
  loading.value = false
}
}

/**
 * 页面初始化：封装校验+请求逻辑，加兜底
 */
const initPage = async () => {
  // 优先使用props.pageKey，然后使用route.params.key，最后兜底空字符串
  const currentKey = (props.pageKey || route.params.key || '').trim()
  
  // 如果是归档页面，直接加载统计信息
  if (currentKey === 'archive') {
    setDynamicTitle('加载中...')
    await getArchivePageData()
    fetchArchiveStats()
    startArchiveAutoRefresh()
  } 
  // 如果是友链页面，加载友链数据
  else if (currentKey === 'links') {
    setDynamicTitle('加载中...')
    await getLinksPageData()
    await fetchLinks()
    await getLinksComments(currentPage.value, pageSize.value)
  } else if (checkPageKey(currentKey)) {
    // 普通独立页面
    getPageData(currentKey)
  } else {
    error.value = true
    loading.value = false
    setDynamicTitle('页面标识不合法')
    setTimeout(() => router.go(-1), 3000)
  }
}

// 监听路由参数变化：加新参数兜底，避免undefined
watch(
  () => route.params.key,
  () => {
    initPage() // 直接执行，内部会取最新的key并校验
  },
  { immediate: false }
)

// 监听props.pageKey变化：确保切换到归档或友链页面时数据自动刷新
watch(
  () => props.pageKey,
  () => {
    initPage() // 直接执行，内部会取最新的pageKey并校验
  },
  { immediate: false }
)

// 获取页面评论
const getComments = async (pageId, page = 1, limit = 10) => {
  try {
    const res = await request.get('/api/comment/flat', {
      bind_id: pageId,
      bind_type: 'page',
      page: page,
      limit: limit,
      order: 'create_time desc'
    })
    
    if (res.code === 200) {
      commentCount.value = res.data?.count || 0
      commentList.value = res.data?.data || []
      totalComments.value = res.data?.count || 0
      currentPage.value = page
      pageSize.value = limit
    }
  } catch (error) {
    // console.error('获取评论失败：', error)
  }
}

// 获取作者信息
const getAuthorInfo = async (authorId) => {
  try {
    const res = await request.get('/api/users/one', {
      id: authorId
    })
    
    if (res.code === 200 && res.data) {
      authorInfo.value = res.data
    }
  } catch (error) {
    // console.error('获取作者信息失败：', error)
  }
}

// 发布评论
const handlePublishComment = async (data) => {
  try {
    // 检查当前是否为友链页面
    const currentKey = (props.pageKey || route.params.key || '').trim()
    const isLinksPage = currentKey === 'links'
    
    const commentData = {
      content: data.content,
      bind_type: 'page',
      bind_id: pageInfo.value.id
    }
    
    const res = await request.post('/api/comment/create', commentData)
    
    if (res.code === 200) {
      // 重新获取评论列表
      if (isLinksPage) {
        await getLinksComments(currentPage.value, pageSize.value)
      } else {
        await getComments(pageInfo.value.id, currentPage.value, pageSize.value)
      }
      // 显示成功提示
      if (window.Toast) {
        window.Toast.success('评论发布成功！')
      }
    } else {
      // 显示失败提示
      if (window.Toast) {
        window.Toast.error(res.msg || '评论发布失败')
      }
    }
  } catch (error) {
    // console.error('发布评论失败：', error)
    if (window.Toast) {
      window.Toast.error('网络异常，评论发布失败')
    }
  }
}

// 回复评论
const handleReplyComment = async (data) => {
  try {
    // 检查当前是否为友链页面
    const currentKey = (props.pageKey || route.params.key || '').trim()
    const isLinksPage = currentKey === 'links'
    
    const commentData = {
      content: data.content,
      bind_type: 'page',
      bind_id: pageInfo.value.id,
      pid: data.commentId
    }
    
    const res = await request.post('/api/comment/create', commentData)
    
    if (res.code === 200) {
      // 重新获取评论列表
      if (isLinksPage) {
        await getLinksComments(currentPage.value, pageSize.value)
      } else {
        await getComments(pageInfo.value.id, currentPage.value, pageSize.value)
      }
      // 显示成功提示
      if (window.Toast) {
        window.Toast.success('回复发布成功！')
      }
    } else {
      // 显示失败提示
      if (window.Toast) {
        window.Toast.error(res.msg || '回复发布失败')
      }
    }
  } catch (error) {
    // console.error('回复评论失败：', error)
    if (window.Toast) {
      window.Toast.error('网络异常，回复发布失败')
    }
  }
}

// 处理评论分页
const handleCommentPageChange = async (page) => {
  try {
    // 检查当前是否为友链页面
    const currentKey = (props.pageKey || route.params.key || '').trim()
    const isLinksPage = currentKey === 'links'
    
    if (isLinksPage) {
      await getLinksComments(page, pageSize.value)
    } else if (pageInfo.value.id) {
      await getComments(pageInfo.value.id, page, pageSize.value)
    }
  } catch (error) {
    // console.error('评论分页切换失败：', error)
  }
}

// 获取文章总数
const getArticleCount = async () => {
  try {
    const res = await request.get('/api/article/count')
    if (res.code === 200) {
      archiveStats.value.articleCount = res.data || 0
    }
  } catch (error) {
    // console.error('获取文章总数失败：', error)
  }
}

// 获取文章分类总数
const getCategoryCount = async () => {
  try {
    const res = await request.get('/api/article-group/count')
    if (res.code === 200) {
      archiveStats.value.categoryCount = res.data || 0
    }
  } catch (error) {
    // console.error('获取文章分类总数失败：', error)
  }
}

// 获取独立页面总数
const getPageCount = async () => {
  try {
    const res = await request.get('/api/pages/count', {
      onlyTrashed: false
    })
    if (res.code === 200) {
      archiveStats.value.pageCount = res.data || 0
    }
  } catch (error) {
    // console.error('获取独立页面总数失败：', error)
  }
}

// 获取标签总数
const getTagCount = async () => {
  try {
    const res = await request.get('/api/tags/count')
    if (res.code === 200) {
      archiveStats.value.tagCount = res.data || 0
    }
  } catch (error) {
    // console.error('获取标签总数失败：', error)
  }
}

// 获取友情链接总数
const getLinkCount = async () => {
  try {
    const res = await request.get('/api/links/count', {
      onlyTrashed: false
    })
    if (res.code === 200) {
      archiveStats.value.linkCount = res.data || 0
    }
  } catch (error) {
    // console.error('获取友情链接总数失败：', error)
  }
}

// 获取评论总数
const getCommentCount = async () => {
  try {
    const res = await request.get('/api/comment/count')
    if (res.code === 200) {
      archiveStats.value.commentCount = res.data || 0
    }
  } catch (error) {
    // console.error('获取评论总数失败：', error)
  }
}

// 获取所有归档统计数据
const fetchArchiveStats = async () => {
  try {
    // 缓存键
    const cacheKey = 'archive_stats'
    const cacheExpire = 30 // 缓存30分钟
    
    // 尝试从缓存获取归档统计数据
    let cachedStats = cache.get(cacheKey)
    
    // 如果缓存不存在，从API获取
    if (!cachedStats) {
      await Promise.all([
        getArticleCount(),
        getCategoryCount(),
        getPageCount(),
        getTagCount(),
        getLinkCount(),
        getCommentCount()
      ])
      // 缓存归档统计数据
      cache.set(cacheKey, archiveStats.value, cacheExpire)
    } else {
      // 使用缓存数据
      archiveStats.value = cachedStats
    }
  } catch (error) {
    // console.error('获取归档统计数据失败：', error)
  } finally {
    loading.value = false
    refreshingArchive.value = false
  }
}

// 手动刷新归档统计数据
const refreshArchiveStats = async () => {
  refreshingArchive.value = true
  // 清除缓存，确保获取最新数据
  cache.del('archive_stats')
  await fetchArchiveStats()
  if (window.Toast) {
    window.Toast.success('数据刷新成功')
  }
}

// 启动归档页面自动刷新
const startArchiveAutoRefresh = () => {
  // 清除之前的定时器
  if (archiveRefreshTimer) {
    clearInterval(archiveRefreshTimer)
  }
  // 每5分钟刷新一次
  archiveRefreshTimer = setInterval(() => {
    fetchArchiveStats()
  }, 5 * 60 * 1000)
}

// 获取友链页面基础数据
const getLinksPageData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/pages/one?key=links', {
      params: {
        key: 'links',
        cache: false,
        withTrashed: false
      }
    })
    if (res && res.code === 200 && res.data && typeof res.data === 'object' && Object.keys(res.data).length > 0) {
      pageInfo.value = { ...pageInfo.value, ...res.data }
      // 更新浏览量
      viewCount.value = res.data.views || 0
      setDynamicTitle(res.data.title || '友链')
    } else {
      error.value = true
      errorMsg.value = '未找到友链页面配置，请联系管理员检查后台'
    }
  } catch (err) {
    error.value = true
    errorMsg.value = '网络异常，无法加载友链页面配置'
    console.error('[友链页面基础数据异常]：', err)
  } finally {
    loading.value = false
    // 获取作者信息
    const authorId = pageInfo.value.uid
    if (authorId) {
      getAuthorInfo(authorId)
    }
  }
}

// 获取归档页面基础数据
const getArchivePageData = async () => {
  loading.value = true
  try {
    const res = await request.get('/api/pages/one?key=archive', {
      params: {
        key: 'archive',
        cache: false,
        withTrashed: false
      }
    })
    if (res && res.code === 200 && res.data && typeof res.data === 'object' && Object.keys(res.data).length > 0) {
      pageInfo.value = { ...pageInfo.value, ...res.data }
      // 更新浏览量
      viewCount.value = res.data.views || 0
      setDynamicTitle(res.data.title || '归档')
    }
  } catch (err) {
    console.error('[归档页面基础数据异常]：', err)
  } finally {
    loading.value = false
    // 获取作者信息
    const authorId = pageInfo.value.uid
    if (authorId) {
      getAuthorInfo(authorId)
    }
  }
}

// 获取全部友链数据
const fetchLinks = async () => {
  linksLoading.value = true
  linksError.value = false
  linksErrorMsg.value = ''
  
  try {
    // 缓存键
    const cacheKey = 'links_list'
    const cacheExpire = 60 // 缓存60分钟
    
    // 尝试从缓存获取友链数据
    let cachedLinks = cache.get(cacheKey)
    
    // 如果缓存不存在，从API获取
    if (!cachedLinks) {
      // 直接写死API地址参数，不配置任何动态参数
      const res = await request.get('/api/links/all?page=1&limit=500&order=id+asc')
      if (res && res.code === 200 && res.data) {
        const { data = [], count = 0 } = res.data
        links.value = data     // 直接赋值全部数据
        linkTotal.value = count   // 总条数
        // 缓存友链数据
        cache.set(cacheKey, { data, count }, cacheExpire)
      } else {
        linksError.value = true
        linksErrorMsg.value = res?.msg || '获取友链数据失败'
      }
    } else {
      // 使用缓存数据
      links.value = cachedLinks.data || []
      linkTotal.value = cachedLinks.count || 0
    }
  } catch (err) {
    linksError.value = true
    linksErrorMsg.value = '网络异常，无法加载友链数据'
    console.error('[友链数据请求异常]：', err)
  } finally {
    linksLoading.value = false
  }
}

// 获取友链页面评论
const getLinksComments = async (page = 1, limit = 10) => {
  try {
    const res = await request.get('/api/comment/flat', {
      bind_id: pageInfo.value.id,
      bind_type: 'page',
      page: page,
      limit: limit,
      order: 'create_time desc'
    })
    
    if (res.code === 200) {
      commentCount.value = res.data?.count || 0
      commentList.value = res.data?.data || []
      totalComments.value = res.data?.count || 0
      currentPage.value = page
      pageSize.value = limit
    }
  } catch (error) {
    console.error('获取评论失败：', error)
  }
}

// 处理友链头像错误
const handleLinkAvatarError = (event) => {
  // 可以设置默认头像
  event.target.src = 'https://img1.zhuxu.asia/2026/L2SIxoK1ss.png'
}

// 检测深色模式
const detectDarkMode = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark') || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 页面挂载初始化
onMounted(() => {
  initPage()
  detectDarkMode()
  
  // 监听深色模式变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectDarkMode)
})

// 页面卸载清理
onUnmounted(() => {
  // 清除归档页面自动刷新定时器
  if (archiveRefreshTimer) {
    clearInterval(archiveRefreshTimer)
  }
  
  // 移除深色模式监听
  window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', detectDarkMode)
})

// 监听页面信息变化，获取评论和作者信息
watch(
  () => pageInfo.value.id,
  (newId) => {
    if (newId) {
      getComments(newId, currentPage.value, pageSize.value)
      // 获取作者信息
      const authorId = pageInfo.value.uid
      if (authorId) {
        getAuthorInfo(authorId)
      }
    }
  },
  { immediate: false }
)
</script>

<style scoped>
/* 加载状态：居中、占满视口高度 */
.page-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

/* 错误状态 */
.page-error {
  min-height: 60vh;
}

/* 文章标题：响应式字号、优化行高、居中 */
.article-title {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  line-height: 1.3;
  font-weight: 700;
  color: var(--bs-body-color);
}

/* 文章元信息：弱化样式、统一图标 */
.article-meta {
  font-size: 0.9rem;
  color: var(--bs-secondary-color);
  flex-wrap: wrap;
}
.article-meta .meta-item {
  white-space: nowrap;
}
.article-meta .bi {
  font-size: 1em;
  color: var(--bs-tertiary-color);
}

/* 文章内容区：核心阅读样式优化 */
.article-content {
  line-height: 1.8;
  font-size: 1.05rem;
  color: var(--bs-body-color);
}

/* 适配Markdown渲染的内部样式（核心：保证阅读体验） */
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4) {
  margin: 1.8rem 0 0.8rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--bs-body-color);
}
.article-content :deep(h2) {
  font-size: 1.5rem;
}
.article-content :deep(h3) {
  font-size: 1.25rem;
}
.article-content :deep(img) {
  max-width: 100%;
  border-radius: 0.5rem;
  margin: 1.5rem auto;
  display: block;
  box-shadow: var(--bs-shadow-sm);
}
.article-content :deep(ul),
.article-content :deep(ol) {
  margin-bottom: 1.2rem;
  padding-left: 1.8rem;
  color: var(--bs-body-color);
}
.article-content :deep(li) {
  margin-bottom: 0.5rem;
  color: var(--bs-body-color);
}
.article-content :deep(a) {
  color: var(--bs-link-color);
  text-decoration: none;
}
.article-content :deep(a:hover) {
  color: var(--bs-link-hover-color);
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}
.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.2rem;
  color: var(--bs-body-color);
}
.article-content :deep(td),
.article-content :deep(th) {
  border: 1px solid var(--bs-border-color);
  padding: 0.7rem;
  text-align: left;
}
.article-content :deep(th) {
  background-color: var(--bs-tertiary-bg);
  font-weight: 600;
  color: var(--bs-body-color);
}

/* 评论区容器：基础间距 */
.article-comment {
  width: 100%;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .article-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  .article-content {
    font-size: 1rem;
  }
  .article-meta {
    font-size: 0.65rem; /* 字号缩小，核心 */
    gap: 0.6rem !important; /* 元信息项之间的间距缩小，!important覆盖bootstrap的gap-4 */
  }
  .article-meta .meta-item .bi {
    font-size: 0.8em; /* 图标字号轻微缩小，更协调 */
    margin-right: 0.3rem !important; /* 图标与文字间距缩小 */
  }
}

/* 归档页面统计信息样式 */
/* 统计信息网格布局 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* 统计卡片样式 */
.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 0.5rem;
  background-color: var(--bs-card-bg);
  border: 1px solid var(--bs-border-color);
  box-shadow: var(--bs-shadow-sm);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--bs-shadow);
  border-color: var(--bs-border-color-translucent);
}

/* 统计图标样式 */
.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

/* 不同统计项的图标颜色 */
.article-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.category-icon {
  background: linear-gradient(135deg, #10b981, #059669);
}

.page-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.tag-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.link-icon {
  background: linear-gradient(135deg, #ec4899, #db2777);
}

.comment-icon {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}

/* 统计内容样式 */
.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: var(--bs-body-color);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--bs-secondary-color);
  margin: 0;
}

/* 刷新按钮区域 */
.refresh-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--bs-border-color);
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.375rem;
  background-color: var(--bs-button-bg);
  color: var(--bs-button-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background-color: var(--bs-button-hover-bg);
  border-color: var(--bs-button-hover-border-color);
  color: var(--bs-button-hover-color);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-info {
  font-size: 0.75rem;
  color: var(--bs-tertiary-color);
  margin: 0;
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

/* 归档页面响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
    gap: 0.75rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .refresh-container {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
}

/* 归档页面平板设备适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 友链页面样式 */
/* 友链头部 */
.links-header {
  margin-bottom: 2rem;
}

.links-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.links-description {
  font-size: 1rem;
  color: #6b7280;
}

/* 友链网格布局 */
.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* 友链卡片样式 */
.link-card {
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
}

.link-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 友链头像 */
.link-avatar-container {
  margin-bottom: 1rem;
}

.link-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  transition: transform 0.3s ease;
}

.link-card:hover .link-avatar {
  transform: scale(1.05);
}

/* 友链名称 */
.link-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

/* 友链描述 */
.link-description {
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.4;
}

/* 友链URL */
.link-url {
  font-size: 0.85rem;
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
  word-break: break-all;
}

.link-url:hover {
  color: #2563eb;
  text-decoration: underline;
}

/* 友链页面响应式设计 */
@media (max-width: 768px) {
  .links-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .link-card {
    padding: 1.25rem;
  }

  .links-title {
    font-size: 1.5rem;
  }

  .links-description {
    font-size: 0.9rem;
  }

  .link-name {
    font-size: 1rem;
  }

  .link-description {
    font-size: 0.85rem;
  }

  .link-url {
    font-size: 0.8rem;
  }
}

/* 友链页面平板设备适配 */
@media (min-width: 769px) and (max-width: 1024px) {
  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 友链页面样式 */
/* 页面标题样式 */
.article-title {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  line-height: 1.3;
  font-weight: 700;
}

/* 友链介绍Markdown样式 */
.article-content {
  line-height: 1.8;
  font-size: 1.05rem;
  padding: 0.5rem 0;
}

/* 友链分组标题 */
.link-cate {
  font-size: 1.2rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--bs-border-color);
  margin-bottom: 1rem !important;
  color: var(--bs-body-color);
}

/* 核心：长方形友链卡片样式 */
.link-card {
  border: 1px solid var(--bs-border-color);
  border-radius: 0.8rem;
  transition: all 0.3s ease;
  background-color: var(--bs-card-bg);
  min-height: 120px; /* 长方形高度 */
}

/* 卡片悬浮效果 */
.link-card:hover {
  box-shadow: var(--bs-shadow);
  border-color: var(--bs-border-color-translucent);
  transform: translateY(-2px);
}

/* 头像样式（长方形卡片中适当放大） */
.link-avatar {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border: 3px solid var(--bs-tertiary-bg);
}

/* 名称样式 */
.link-name {
  font-weight: 600;
  color: var(--bs-body-color);
}

/* 描述样式 - 重点：补充line-clamp标准属性 + 全浏览器兼容 */
.link-desc {
  line-height: 1.5;
  font-size: 0.95rem;
  overflow: hidden;
  text-align: left;
  color: var(--bs-secondary-color);
  /* 标准属性 + 多浏览器前缀兼容 */
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -moz-line-clamp: 2;
  -o-line-clamp: 2;
  /* 必须配合的属性（跨浏览器） */
  display: -webkit-box;
  display: -moz-box;
  display: -ms-box;
  display: box;
  -webkit-box-orient: vertical;
  -moz-box-orient: vertical;
  -ms-box-orient: vertical;
  box-orient: vertical;
}

/* 通用Markdown样式 */
.article-content h2 {
  font-size: 1.5rem;
  margin: 1.5rem 0 1rem;
  font-weight: 600;
  border-bottom: 1px solid var(--bs-border-color);
  padding-bottom: 0.5rem;
  color: var(--bs-body-color);
}

.article-content a {
  color: var(--bs-link-color);
  text-decoration: none;
}

.article-content a:hover {
  color: var(--bs-link-hover-color);
  text-decoration: underline;
}

.article-content p {
  margin-bottom: 1rem;
  color: var(--bs-body-color);
}

/* 加载状态 */
.py-10 {
  padding-top: 10rem;
  padding-bottom: 10rem;
}

/* 响应式适配 - 长方形卡片专属 */
@media (max-width: 992px) {
  .article-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  .article-content h2 {
    font-size: 1.25rem;
  }
  .link-cate {
    font-size: 1.1rem;
  }
  .link-avatar {
    width: 50px;
    height: 50px;
  }
  .link-card {
    min-height: 100px;
    padding: 1.5rem !important;
  }
}

@media (max-width: 768px) {
  .link-cate {
    font-size: 1rem;
  }
  .link-avatar {
    width: 45px;
    height: 45px;
  }
  .link-card {
    min-height: 90px;
    padding: 1.2rem !important;
  }
  .link-name {
    font-size: 1rem !important;
  }
  /* 响应式调整文本截断字号 */
  .link-desc {
    font-size: 0.85rem;
  }
}

@media (max-width: 576px) {
  .link-avatar {
    width: 40px;
    height: 40px;
  }
  .link-card {
    min-height: 80px;
    padding: 1rem !important;
  }
  .link-cate {
    font-size: 0.95rem;
  }
  .link-desc {
    font-size: 0.85rem;
  }
  /* 手机端单列展示 */
  .link-list-container .row > div {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>