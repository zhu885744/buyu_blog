<template>
  <div class="sidebar-container position-sticky top-0" :class="{ 'dark-mode': isDarkMode }">
    <!-- 个人信息卡片 -->
    <div class="card mt-2">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="bi bi-person-circle"></i>
          <span>个人信息</span>
        </h6>
      </div>
      <div class="card-body text-center">
        <!-- 已登录用户信息 -->
        <div v-if="store.comm.login.finish && store.comm.login.user" class="user-info-container">
          <div class="position-relative d-inline-block mb-3">
            <img
              :src="store.comm.login.user.avatar || defaultAvatar"
              :alt="store.comm.login.user.nickname || '用户头像'"
              class="rounded-3 user-avatar"
            >
            <span class="position-absolute bottom-0 right-0 w-6 h-6 bg-success rounded-full border border-2 border-white"></span>
          </div>
          
          <h6 class="fw-bold mb-1 user-nickname">{{ store.comm.login.user.nickname || store.comm.login.user.account }}</h6>
          <p v-if="store.comm.login.user.bio" class="text-muted mb-3 user-bio">{{ store.comm.login.user.bio }}</p>
          <p v-else class="text-muted mb-3 user-bio">欢迎回来！</p>
          
          <div class="d-grid gap-2 mb-3">
            <router-link :to="`/author/${store.comm.login.user.id}`" class="btn btn-primary btn-sm rounded-3 fw-medium py-2 text-decoration-none sidebar-btn">
              <i class="bi bi-person-circle me-1"></i>
              用户中心
            </router-link>

          </div>
          
          <div class="mt-3 pt-3 border-top border-light-subtle user-stats">
            <div class="row g-2">
              <div class="col-4 text-center">
                <div class="fw-bold fs-6 user-stat-value">{{ userStats.articleCount }}</div>
                <div class="text-muted fs-7 user-stat-label">文章</div>
              </div>
              <div class="col-4 text-center">
                <div class="fw-bold fs-6 user-stat-value">{{ userStats.collectCount }}</div>
                <div class="text-muted fs-7 user-stat-label">收藏</div>
              </div>
              <div class="col-4 text-center">
                <div class="fw-bold fs-6 user-stat-value">{{ userStats.likeCount }}</div>
                <div class="text-muted fs-7 user-stat-label">点赞</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 未登录用户信息 -->
        <div v-else class="user-info-container">
          <div class="position-relative d-inline-block mb-3">
            <img
              :src="defaultAvatar"
              alt="头像"
              class="rounded-3 user-avatar"
            >
          </div>
          
          <h6 class="fw-bold mb-1">HI！请登录</h6>
          <p class="text-muted mb-3 user-bio">登录后解锁更多功能</p>
          
          <div class="d-grid gap-2 mb-3">
            <button class="btn btn-primary btn-sm rounded-3 fw-medium py-2 sidebar-btn" @click="$emit('showLogin')">
              <i class="bi bi-box-arrow-in-right me-1"></i>
              立即登录
            </button>
            <button class="btn btn-outline-primary btn-sm rounded-3 fw-medium py-2 sidebar-btn" @click="$emit('showRegister')">
              <i class="bi bi-person-plus me-1"></i>
              注册账号
            </button>
          </div>
          
          <div class="mt-3 pt-3 border-top border-light-subtle user-stats">
            <div class="row g-2">
              <div class="col-4 text-center">
                <div class="fw-bold fs-6 user-stat-value">0</div>
                <div class="text-muted fs-7 user-stat-label">文章</div>
              </div>
              <div class="col-4 text-center">
                <div class="fw-bold fs-6 user-stat-value">0</div>
                <div class="text-muted fs-7 user-stat-label">收藏</div>
              </div>
              <div class="col-4 text-center">
                <div class="fw-bold fs-6 user-stat-value">0</div>
                <div class="text-muted fs-7 user-stat-label">点赞</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 等级排行卡片 -->
    <div class="card mt-2">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">
          <i class="bi bi-trophy-fill text-warning"></i>
          <span>等级排行</span>
        </h6>
        <button 
          class="btn sidebar-btn-icon"
          @click="getLevelRank"
          :disabled="levelLoading"
          title="刷新"
        >
          <i class="bi bi-arrow-clockwise" :class="{ 'spin': levelLoading }"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="d-grid mb-3">
          <button 
            class="btn btn-danger btn-sm rounded-3 fw-medium py-2 sidebar-btn sign-btn"
            @click="doSign"
            :disabled="signLoading || hasSigned"
          >
            <i v-if="!signLoading" :class="hasSigned ? 'bi bi-check-circle' : 'bi bi-calendar-check'" class="me-1"></i>
            <i v-else class="bi bi-arrow-clockwise spin me-1"></i>
            {{ hasSigned ? '今日已签到' : '每日签到' }}
            <span v-if="signDays > 0" class="ms-1 sign-days">({{ signDays }}天)</span>
          </button>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="levelLoading" class="text-center py-4">
          <div class="spinner-border spinner-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- 无数据 -->
        <div v-else-if="levelRankList.length === 0" class="text-center py-4 empty-state">
          <i class="bi bi-emoji-frown fs-5 text-muted mb-2 d-block"></i>
          <p class="text-muted mb-0">暂无等级数据</p>
        </div>

        <!-- 等级排行列表 -->
        <div v-else class="sidebar-list">
          <div
            class="sidebar-list-item d-flex align-items-center gap-3 mb-2"
            v-for="(user, index) in levelRankList"
            :key="user.id"
            @click="goToAuthor(user.id)"
            :class="{
              'sidebar-list-item-top': index < 3,
              'sidebar-list-item-hover': true
            }"
          >
            <!-- 排名徽章 -->
            <div class="position-relative flex-shrink-0">
              <div class="rank-badge" :class="{ 'rank-badge-top': index < 3 }">
                {{ index + 1 }}
              </div>
              <!-- 头像 -->
              <img
                :src="user.avatar || defaultAvatar"
                alt="用户头像"
                class="rank-avatar"
              >
            </div>

            <!-- 用户信息 -->
            <div class="flex-grow-1 min-w-0">
              <div class="d-flex align-items-center gap-1 mb-1">
                <h6 class="mb-0 fw-semibold text-truncate">{{ user.nickname }}</h6>
              </div>
              <div class="progress sidebar-progress" style="height: 5px;">
                <div 
                  class="progress-bar bg-primary" 
                  :style="{ width: Math.min(((user.exp || 0) % 100) / 100 * 100, 100) + '%' }"
                ></div>
              </div>
              <div class="d-flex justify-content-between align-items-center mt-1">
                <span class=" fs-7 fw-medium">
                  Lv.{{ user.result?.level?.current?.value || calculateLevel(user.exp || 0) }}
                </span>
                <span class="text-muted fs-7">
                  {{ user.exp || 0 }} 经验
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门文章卡片 -->
    <div class="card mt-2">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="bi bi-fire text-danger"></i>
          <span>热门文章</span>
        </h6>
      </div>
      <div class="card-body">
        <!-- 加载状态 -->
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border spinner-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- 无数据 -->
        <div v-else-if="hotArticles.length === 0" class="text-center py-4 empty-state">
          <i class="bi bi-newspaper fs-5 text-muted mb-2 d-block"></i>
          <p class="text-muted mb-0">暂无热门文章</p>
        </div>

        <!-- 文章列表 -->
        <div v-else class="sidebar-list">
          <div
            class="sidebar-list-item sidebar-article-item"
            v-for="(article, index) in hotArticles"
            :key="article.id"
            @click="goToArticle(article.id)"
          >
            <div class="d-flex align-items-start gap-3">
              <!-- 排名徽章 -->
              <div class="flex-shrink-0">
                <div 
                  class="article-rank-badge"
                  :class="{
                    'article-rank-badge-1': index === 0,
                    'article-rank-badge-2': index === 1,
                    'article-rank-badge-3': index === 2,
                    'article-rank-badge-other': index > 2
                  }"
                >
                  {{ index + 1 }}
                </div>
              </div>
              
              <!-- 文章信息 -->
              <div class="flex-grow-1 min-w-0">
                <h6 class="fw-semibold mb-1 text-truncate article-title">{{ article.title }}</h6>
                <div class="d-flex align-items-center gap-2 text-muted fs-7 article-meta">
                  <span class="d-flex align-items-center gap-1">
                    <i class="bi bi-eye"></i>
                    {{ article.views || 0 }}
                  </span>
                  <span>
                    {{ formatTime(article.createTime || article.create_time) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最新评论卡片 -->
    <div class="card mt-2">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="bi bi-chat-dots-fill text-info"></i>
          <span>最新评论</span>
        </h6>
      </div>
      <div class="card-body">
        <!-- 加载状态 -->
        <div v-if="commentLoading" class="text-center py-4">
          <div class="spinner-border spinner-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- 无数据 -->
        <div v-else-if="commentList.length === 0" class="text-center py-4 empty-state">
          <i class="bi bi-chat-square fs-5 text-muted mb-2 d-block"></i>
          <p class="text-muted mb-0">暂无评论内容</p>
        </div>

        <!-- 评论列表 -->
        <div v-else class="sidebar-list">
          <div
            class="sidebar-list-item sidebar-comment-item"
            v-for="comment in commentList"
            :key="comment.id"
            @click="goToArticle(comment.articleId, comment.commentType)"
          >
            <!-- 评论头部 -->
            <div class="d-flex align-items-center gap-2 mb-2">
              <img
                :src="comment.avatar || defaultAvatar"
                alt="用户头像"
                class="comment-avatar"
              >
              <div class="flex-grow-1 min-w-0">
                <div class="d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-semibold text-truncate">{{ comment.author }}</h6>
                  <span class="text-muted fs-7">{{ comment.time }}</span>
                </div>
              </div>
            </div>

            <!-- 评论内容 -->
            <p class="mb-2 comment-content">
              {{ comment.content }}
            </p>

            <!-- 关联文章 -->
            <div class="d-flex align-items-center justify-content-between border-top border-light pt-2 mt-1">
              <a
                href="#"
                class="text-decoration-none fs-7 fw-medium d-flex align-items-center gap-1 comment-article-link"
                @click.stop="goToArticle(comment.articleId, comment.commentType)"
              >
                <i class="bi bi-link-45deg"></i>
                {{ comment.commentType === 'article' ? '查看文章' : comment.commentType === 'page' ? '查看页面' : '查看原文' }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签云卡片 -->
    <div class="card mt-2">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="bi bi-tags-fill text-success"></i>
          <span>标签云</span>
        </h6>
      </div>
      <div class="card-body">
        <!-- 加载状态 -->
        <div v-if="tagLoading" class="text-center py-4">
          <div class="spinner-border spinner-sm" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>

        <!-- 无数据 -->
        <div v-else-if="tagList.length === 0" class="text-center py-4 empty-state">
          <i class="bi bi-tag fs-5 text-muted mb-2 d-block"></i>
          <p class="text-muted mb-0">暂无标签</p>
        </div>

        <!-- 标签云 -->
        <div v-else class="tag-cloud">
          <router-link
            class="tag-item"
            v-for="tag in tagList"
            :key="tag.id"
            :to="`/tag/${tag.id}`"
          >
            {{ tag.name }}
          </router-link>
        </div>
      </div>
    </div>

    <!-- 快速导航 -->
    <div class="card mt-2">
      <div class="card-header">
        <h6 class="mb-0">
          <i class="bi bi-compass text-purple"></i>
          <span>快捷导航</span>
        </h6>
      </div>
      <div class="card-body">
        <div class="row g-2">
          <div class="col-6" v-for="nav in quickNavs" :key="nav.id">
            <div 
              @click="router.push(nav.url)"
              class="nav-item cursor-pointer"
              :style="{ '--nav-color': nav.color }"
            >
              <i :class="nav.icon" class="nav-item-icon"></i>
              <span class="nav-item-name">{{ nav.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCommStore } from '@/store/comm'
import request from '@/utils/request'
import utils from '@/utils/utils'
import Toast from '@/utils/toast'
import defaultAvatar from '@/assets/img/avatar.png'

const router = useRouter()

// 存储
const store = {
  comm: useCommStore()
}

// 响应式数据
const loading = ref(false)
const hotArticles = ref([])
const tagList = ref([])
const isDarkMode = ref(false)
const commentList = ref([])
const commentLoading = ref(false)
const levelLoading = ref(false)
const levelRankList = ref([])
const tagLoading = ref(false)
const signLoading = ref(false)
const hasSigned = ref(false)
const signDays = ref(0)

// 用户统计数据
const userStats = ref({
  articleCount: 0,
  collectCount: 0,
  likeCount: 0
})
const statsLoading = ref(false)

// 快速导航数据
const quickNavs = ref([
  { id: 1, name: '归档', icon: 'bi bi-archive', color: '#6f42c1', url: '/archive' },
  { id: 2, name: '分类', icon: 'bi bi-folder', color: '#20c997', url: '/category/travel' },
  { id: 3, name: '标签', icon: 'bi bi-tags', color: '#0dcaf0', url: '/tags' },
  { id: 4, name: '友链', icon: 'bi bi-link-45deg', color: '#fd7e14', url: '/links' },
  { id: 5, name: '关于', icon: 'bi bi-info-circle', color: '#6610f2', url: '/about' },
  { id: 6, name: '留言', icon: 'bi bi-chat-left-dots', color: '#d63384', url: '/message' }
])

// 检测深色模式
const detectDarkMode = () => {
  const pageDark = document.documentElement.classList.contains('dark')
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  isDarkMode.value = pageDark || systemDark
}

// 等级数据
const levelInfo = ref(null)

// 根据经验值计算等级
// 现在使用后端返回的等级数据来动态计算
const calculateLevel = (exp) => {
  // 如果没有等级数据，使用默认逻辑
  if (!levelInfo.value || !levelInfo.value.data || !levelInfo.value.data.data) {
    // 默认每100经验值一级
    return Math.floor(exp / 100)
  }
  
  // 从后端返回的等级数据中获取等级阈值
  const levelData = levelInfo.value.data.data
  
  // 检查levelData是否是数组
  if (!Array.isArray(levelData)) {
    // 如果不是数组，使用默认逻辑
    return Math.floor(exp / 100)
  }
  
  // 按经验值阈值从高到低排序
  const sortedLevels = [...levelData].sort((a, b) => b.exp - a.exp)
  
  // 找到用户当前经验值对应的最高等级
  for (const level of sortedLevels) {
    if (exp >= level.exp) {
      return level.value
    }
  }
  
  // 如果没有找到匹配的等级，使用默认逻辑计算等级
  // 这样即使后端返回的数据不完整，也能够正确计算等级
  return Math.floor(exp / 100)
}

// 导航方法
const goToArticle = (articleId, commentType = 'unknown') => {
  // 根据评论类型决定跳转路径
  if (commentType === 'article') {
    // 文章评论：跳转到文章详情页
    router.push(`/archives/${articleId}`);
  } else if (commentType === 'page') {
    // 页面评论：跳转到页面
    router.push(`/${articleId}`);
  } else {
    // 未知类型：使用原有逻辑
    // 检查 articleId 是否为正整数
    const numArticleId = Number(articleId);
    const isPositiveNumber = !isNaN(numArticleId) && numArticleId > 0;
    
    if (isPositiveNumber) {
      // 如果是正整数，跳转到文章详情页
      router.push(`/archives/${articleId}`);
    } else if (articleId && articleId !== '0') {
      // 如果是字符串或 0，跳转到独立页面
      router.push(`/${articleId}`);
    }
  }
}
const goToAuthor = (authorId) => router.push(`/author/${authorId}`)

// 格式化时间
const formatTime = (time) => {
  if (!time) return ''
  const timestamp = typeof time === 'number' && time.toString().length === 10 
    ? time 
    : Math.floor(new Date(time).getTime() / 1000)
  const now = new Date()
  const diff = now - new Date(timestamp * 1000)
  const dayDiff = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (dayDiff === 0) {
    const hourDiff = Math.floor(diff / (1000 * 60 * 60))
    if (hourDiff > 0) return `${hourDiff}小时前`
    const minDiff = Math.floor(diff / (1000 * 60))
    return minDiff > 0 ? `${minDiff}分钟前` : '刚刚'
  } else if (dayDiff <= 7) return `${dayDiff}天前`
  else return utils.timeToDate(timestamp, 'Y-m-d')
}

// 获取等级数据
const getLevelInfo = async () => {
  try {
    const res = await request.get('/api/level/all', {
      page: 1,
      limit: 20
    })
    if (res.code === 200) {
      levelInfo.value = res
    }
  } catch (error) {
    // console.error('获取等级数据失败:', error)
  }
}

// 接口请求方法
const getHotArticles = async () => {
  try {
    loading.value = true
    const response = await request.get('/api/article/all', { 
      page: 1, 
      limit: 5, 
      order: 'views desc', 
      cache: false 
    })
    if (response.code === 200) {
      hotArticles.value = response.data.data || []
    }
  } catch (error) {
    // console.error('获取热门文章失败：', error)
    hotArticles.value = []
  } finally {
    loading.value = false
  }
}

const getLevelRank = async () => {
  try {
    levelLoading.value = true
    // 优先获取有经验值的用户，按经验值降序排序
    const response = await request.get('/api/users/all', { 
      page: 1, 
      limit: 9999, // 减少获取的数据量，提高性能
      order: 'exp desc', // 优先按经验值排序，确保获取有经验值的用户
      cache: false 
    })
    if (response.code === 200) {
      // 按等级值排序，等级值基于用户当前经验值计算
      const users = response.data.data || []
      levelRankList.value = users
        // 过滤掉经验值为0或null的用户，优先显示有经验值的用户
        .filter(user => (user.exp || 0) > 0)
        .sort((a, b) => {
          // 根据用户当前经验值计算等级
          const levelA = calculateLevel(a.exp || 0)
          const levelB = calculateLevel(b.exp || 0)
          
          // 先按等级值排序
          if (levelB !== levelA) {
            return levelB - levelA // 降序排序
          }
          // 等级相同则按经验值排序
          return (b.exp || 0) - (a.exp || 0)
        })
        .slice(0, 5) // 取前5名
    }
  } catch (error) {
    // console.error('获取等级排行失败：', error)
    levelRankList.value = []
  } finally {
    levelLoading.value = false
  }
}

const getTagList = async () => {
  try {
    tagLoading.value = true
    const response = await request.get('/api/tags/all', {
      page: 1,
      limit: 40,
      order: 'create_time desc',
      cache: false
    })
    if (response.code === 200) {
      tagList.value = response.data.data || []
    }
  } catch (error) {
    // console.error('获取标签云失败：', error)
    tagList.value = []
  } finally {
    tagLoading.value = false
  }
}

const getLatestComments = async () => {
  try {
    commentLoading.value = true
    const response = await request.get('/api/comment/all', {
      page: 1,
      limit: 5,
      order: 'create_time desc',
      cache: false
    })

    if (response.code === 200) {
      commentList.value = (response.data.data || []).map(item => {
        // 检查评论类型（文章还是页面）
        const isArticle = item.result?.article || false
        const isPage = item.result?.page || false
        
        // 确定评论类型
        let commentType = 'unknown'
        if (isArticle) {
          commentType = 'article'
        } else if (isPage) {
          commentType = 'page'
        }
        
        // 确定文章标题
        let title = '未知文章'
        if (isArticle && item.result.article.title) {
          title = item.result.article.title
        } else if (isPage && item.result.page.title) {
          title = item.result.page.title
        }
        
        // 确定跳转ID
        let jumpId = item.bind_id
        // 对于页面评论，使用页面的 key 而不是 id
        if (isPage && item.result.page.key) {
          jumpId = item.result.page.key
        }
        
        return {
          id: item.id,
          avatar: item.result?.author?.avatar || '',
          author: item.result?.author?.nickname || '匿名用户',
          content: item.content || '',
          time: formatTime(item.create_time),
          articleId: jumpId, // 使用正确的跳转ID
          articleTitle: title,
          commentType: commentType // 添加评论类型
        }
      })
    }
  } catch (error) {
    // console.error('获取最新评论失败：', error)
    commentList.value = []
  } finally {
    commentLoading.value = false
  }
}

// 获取用户文章数量
const getArticleCount = async (userId) => {
  try {
    const whereParam = JSON.stringify({ uid: userId })
    const response = await request.get('/api/article/count', {
      where: whereParam
    })
    if (response.code === 200) {
      return response.data
    }
    return 0
  } catch (error) {
    // console.error('获取文章数量失败:', error)
    return 0
  }
}

// 获取用户收藏数量
const getCollectCount = async (userId) => {
  try {
    const whereParam = JSON.stringify({ uid: userId, type: 'collect', state: 1 })
    const response = await request.get('/api/exp/count', {
      where: whereParam
    })
    if (response.code === 200) {
      return response.data
    }
    return 0
  } catch (error) {
    // console.error('获取收藏数量失败:', error)
    return 0
  }
}

// 获取用户点赞数量
const getLikeCount = async (userId) => {
  try {
    const whereParam = JSON.stringify({ uid: userId, type: 'like', state: 1 })
    const response = await request.get('/api/exp/count', {
      where: whereParam
    })
    if (response.code === 200) {
      return response.data
    }
    return 0
  } catch (error) {
    // console.error('获取点赞数量失败:', error)
    return 0
  }
}

// 初始化用户统计数据
const initUserStats = async () => {
  if (!store.comm.login.finish || !store.comm.login.user) return
  
  statsLoading.value = true
  try {
    const userId = store.comm.login.user.id
    const [articleCount, collectCount, likeCount] = await Promise.all([
      getArticleCount(userId),
      getCollectCount(userId),
      getLikeCount(userId)
    ])
    
    userStats.value = {
      articleCount,
      collectCount,
      likeCount
    }
    
    // console.log('用户统计数据:', userStats.value)
  } catch (error) {
    // console.error('初始化用户统计数据失败:', error)
  } finally {
    statsLoading.value = false
  }
}

// 签到相关方法
const checkSignStatus = async () => {
  // 等待用户登录状态完全初始化
  if (!store.comm.login.finish) {
    // 如果登录状态未初始化，延迟重试
    setTimeout(checkSignStatus, 100)
    return
  }
  
  if (!store.comm.login.user) return
  
  try {
    const response = await request.get('/api/exp/sign-status')
    if (response.code === 200) {
      hasSigned.value = response.data?.hasSigned || false
      signDays.value = response.data?.signDays || 0
    }
  } catch (error) {
    // console.error('获取签到状态失败：', error)
  }
}

const doSign = async () => {
  if (!store.comm.login.finish || !store.comm.login.user) {
    Toast.warning('请先登录')
    return
  }
  
  if (hasSigned.value) {
    Toast.info('今日已签到')
    return
  }
  
  try {
    signLoading.value = true
    const response = await request.post('/api/exp/check-in')
    
    if (response.code === 200) {
      hasSigned.value = true
      signDays.value += 1
      Toast.success(`签到成功！获得 ${response.data?.exp || 10} 点经验`)
      // 刷新等级排行
      getLevelRank()
    } else {
      Toast.error(response.msg || '签到失败')
    }
  } catch (error) {
    // console.error('签到失败：', error)
    Toast.error('网络异常，签到失败')
  } finally {
    signLoading.value = false
  }
}

// 监听深色模式变化
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectDarkMode)

// 组件挂载
onMounted(() => {
  detectDarkMode()
  Promise.all([
    getHotArticles(),
    getLevelRank(),
    getTagList(),
    getLatestComments(),
    checkSignStatus(),
    initUserStats(),
    getLevelInfo() // 获取等级数据
  ]).catch(err => console.error('数据加载失败：', err))
})
</script>

<style scoped>
/* 侧边栏基础样式 */
.sidebar-container {
  overflow-y: auto;
  padding: 0;
}

/* 卡片标题样式 */
.card-header h6 {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
}

.card-header h6 i {
  margin-right: 0.75rem;
  font-size: 1.1rem;
}

.card-header h6 span {
  font-size: 0.95rem;
  font-weight: 600;
}

/* 按钮样式 */
.sidebar-btn {
  font-size: 0.875rem;
}

.sidebar-btn-icon {
  width: 2rem;
  height: 2rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border: 3px solid var(--bs-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.user-nickname {
  font-size: 1rem;
  font-weight: 600;
}

.user-bio {
  font-size: 0.875rem;
  line-height: 1.4;
  max-height: 3rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
}

.user-stats {
  margin-top: 1rem;
}

.user-stat-label {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
  margin-top: 0.25rem;
}

/* 签到按钮样式 */
.sign-btn {
  font-size: 0.875rem;
  font-weight: 500;
}

.sign-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.sign-days {
  font-size: 0.75rem;
}

/* 活跃度排行样式 */
.rank-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background-color: var(--bs-secondary);
  color: var(--bs-white);
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.rank-badge-top {
  background-color: var(--bs-warning);
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
}

.rank-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--bs-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.sidebar-progress {
  border-radius: 0.25rem;
  background-color: var(--bs-tertiary-bg);
}

.sidebar-progress .progress-bar {
  border-radius: 0.25rem;
}

/* 热门文章样式 */
.article-rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--bs-white);
}

.article-rank-badge-1 {
  background-color: var(--bs-danger);
  box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}

.article-rank-badge-2 {
  background-color: var(--bs-warning);
  box-shadow: 0 2px 4px rgba(255, 193, 7, 0.3);
}

.article-rank-badge-3 {
  background-color: var(--bs-success);
  box-shadow: 0 2px 4px rgba(25, 135, 84, 0.3);
}

.article-rank-badge-other {
  background-color: var(--bs-secondary);
}

.article-title {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: block;
}

.article-meta {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
}

/* 最新评论样式 */
.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--bs-white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

.comment-content {
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--bs-body-color);
  max-height: 3.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
}

.comment-article-link {
  font-size: 0.75rem;
}

/* 标签云样式 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

.tag-item {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background-color: var(--bs-tertiary-bg);
  color: var(--bs-body-color);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 1rem;
  text-decoration: none;
  border: 1px solid var(--bs-border-color);
}

/* 快捷导航样式 */
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--bs-border-color);
  text-decoration: none;
  color: var(--bs-body-color);
  min-height: 80px;
  transition: all 0.3s ease;
}

.cursor-pointer {
  cursor: pointer;
}

.nav-item:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.05);
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-item-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.nav-item-name {
  font-size: 0.75rem;
  font-weight: 500;
}

/* 列表样式 */
.sidebar-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.sidebar-list-item {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: var(--bs-tertiary-bg);
  cursor: pointer;
}

.sidebar-list-item-top {
  background-color: rgba(255, 193, 7, 0.1);
  border-left: 3px solid var(--bs-warning);
}

.sidebar-article-item {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: var(--bs-tertiary-bg);
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;
}

.sidebar-article-item .flex-grow-1 {
  min-width: 0;
  width: 100%;
}

.sidebar-article-item h6.article-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: block;
}

.sidebar-comment-item {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: var(--bs-tertiary-bg);
  cursor: pointer;
}

/* 加载和空状态样式 */
.spinner-sm {
  width: 1.25rem;
  height: 1.25rem;
}

.empty-state {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--bs-secondary-color);
}



/* 响应式调整 */
@media (max-width: 768px) {
  .sidebar-container {
    padding: 0.5rem 0;
  }
  
  .user-avatar {
    width: 64px;
    height: 64px;
  }
  
  .rank-avatar {
    width: 40px;
    height: 40px;
  }
  
  .comment-avatar {
    width: 32px;
    height: 32px;
  }
  
  .nav-item {
    min-height: 70px;
    padding: 0.5rem;
  }
  
  .nav-item-icon {
    font-size: 1.25rem;
  }
}

/* 深色模式适配 */
.dark-mode {
  border-color: var(--bs-border-color-dark);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark-mode {
  background-color: var(--bs-tertiary-bg-dark);
  border-bottom-color: var(--bs-border-color-dark);
}

.dark-mode .sidebar-list-item {
  background-color: var(--bs-tertiary-bg-dark);
}

.dark-mode .sidebar-list-item-top {
  background-color: rgba(255, 193, 7, 0.15);
}

.dark-mode .sidebar-article-item,
.dark-mode .sidebar-comment-item {
  background-color: var(--bs-tertiary-bg-dark);
}

.dark-mode .tag-item {
  background-color: var(--bs-tertiary-bg-dark);
  border-color: var(--bs-border-color-dark);
}

.dark-mode .nav-item {
  border-color: var(--bs-border-color-dark);
}

.dark-mode .nav-item:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
}
</style>