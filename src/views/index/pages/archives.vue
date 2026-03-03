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

    <!-- 文章主体 -->
    <div v-else class="article-main">
      <!-- 文章内容区：核心阅读区，重写样式 -->
      <main class="card shadow-sm mt-2">
        <div class="p-3">
        <!-- 文章头部：标题+元信息 -->
        <header class="article-header mt-2">
          <h1 class="article-title text-center fw-bold mb-3">{{ articleInfo.title }}</h1>
          <!-- 文章元信息：居中布局、弱化样式 -->
          <div class="article-meta d-flex flex-wrap justify-content-center align-items-center text-muted gap-4 fs-6">
            <span class="meta-item d-flex align-items-center">
              <i class="bi bi-folder-fill me-2"></i>
              {{ articleInfo.result?.group[0]?.name || '未分类' }}
            </span>
            <span class="meta-item d-flex align-items-center">
              <i class="bi bi-calendar-fill me-2"></i>
              {{ formatTime(articleInfo.create_time) }}
            </span>
            <span class="meta-item d-flex align-items-center">
              <i class="bi bi-chat-fill me-2"></i>
              {{ articleInfo.result?.comment?.count || 0 }} 评论
            </span>
            <span class="meta-item d-flex align-items-center">
              <i class="bi bi-eye-fill me-2"></i>
              {{ articleInfo.views || 0 }} 浏览
            </span>
          </div>
        </header>
        <div class="article-content mt-4">
          <i-markdown :model-value="articleInfo.content || '暂无文章内容，敬请期待～'" />
        </div>
        
        <!-- 文章标签显示 -->
        <div v-if="articleInfo.result?.tags && articleInfo.result.tags.length > 0" class="article-tags mt-4 d-flex flex-wrap justify-content-center gap-3">
          <router-link 
            v-for="tag in articleInfo.result.tags" 
            :key="tag.id"
            :to="`/tag/${tag.id}`"
            class="badge rounded-pill text-bg-success py-1.5 px-4 transition-all duration-300 cursor-pointer text-decoration-none"
          >
            <i class="bi bi-tag me-1"></i> {{ tag.name }}
          </router-link>
        </div>

        <!-- 版权归属信息 -->
        <div class="card border mt-4 overflow-hidden shadow-sm">
          <div class="card-body">
            <!-- 版权归属信息 -->
            <div class="mb-1">
              <div class="d-flex align-items-center">
                <i class="bi bi-shield-check me-2"></i>
                <span class="text-muted">版权属于：{{ articleInfo.result?.author?.nickname || '匿名' }}</span>
              </div>
            </div>
            <!-- 许可协议信息 -->
            <div class="mb-1">
              <div class="d-flex align-items-center">
                <i class="bi bi-cc-circle me-2"></i>
                <span class="text-muted">文章采用：<a class="bg-opacity-10 me-2" href="//creativecommons.org/licenses/by-nc-sa/4.0/deed.zh" target="_blank" rel="noopener noreferrer nofollow" title="知识共享 署名-非商业性使用-相同方式共享 4.0 国际许可协议">
                    CC BY-NC-SA 4.0
                  </a>
                  <span class="text-muted text-sm">知识共享许可协议授权</span></span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 文章操作按钮：点赞、分享、收藏 -->
        <div class="mt-4 mb-4 d-flex justify-content-center">
          <div class="btn-group gap-2" role="group" aria-label="文章操作">
            <button 
              @click="handleLike" 
              class="btn btn-outline-danger"
              :class="{ 'btn-danger text-white': isLiked, 'btn-outline-danger': !isLiked }"
            >
              <i :class="isLiked ? 'bi bi-hand-thumbs-up-fill' : 'bi bi-hand-thumbs-up'" class="me-2"></i>
              <span>{{ likeCount }}</span>
            </button>
            <button 
              @click="handleCollect" 
              class="btn btn-outline-warning"
              :class="{ 'btn-warning text-white': isCollected, 'btn-outline-warning': !isCollected }"
            >
              <i :class="isCollected ? 'bi bi-star-fill' : 'bi bi-star'" class="me-2"></i>
              <span>{{ collectCount }}</span>
            </button>
            <button 
              @click="handleShare" 
              class="btn btn-outline-success"
            >
              <i class="bi bi-share me-2"></i>
              <span>{{ shareCount }}</span>
            </button>
          </div>
        </div>
        </div>
      </main>

      <!-- 评论组件：优化间距，自然衔接 -->
      <section class="article-comment mt-2 mb-8">
        <CommentList
          :articleId="articleInfo.id"
          :commentCount="commentCount"
          :commentList="staticCommentList"
          :isLogin="isLogin"
          :isDarkMode="isDarkMode"
          :articleAuthor="articleInfo.result?.author || {}"
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
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
import iMarkdown from '@/comps/custom/i-markdown.vue'
import CommentList from '@/comps/custom/i-comment.vue'
import { useCommStore } from '@/store/comm'
import utils from '@/utils/utils'
import cache from '@/utils/cache'
import { usePageTitle } from '@/utils/usePageTitle'

// 使用页面标题管理
const { setDynamicTitle } = usePageTitle();

// 存储
const store = {
  comm: useCommStore()
};

// 路由参数获取文章ID
const getCurrentArticleId = () => {
  return route.params.id
}

// 响应式状态：保留所有原有业务逻辑
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const articleInfo = ref({})
// 评论相关响应式数据
const staticCommentList = ref([])
const commentCount = ref(0)
const isDarkMode = ref(false)
// 评论分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const totalComments = ref(0)

// 文章操作相关状态
const isLiked = ref(false)
const isCollected = ref(false)
const likeCount = ref(0)
const shareCount = ref(0)
const collectCount = ref(0)

// 路由实例
const router = useRouter()
const route = useRoute()

/**
 * 时间格式化：使用utils.js中的timeToDate函数
 */
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  return utils.timeToDate(timestamp, 'Y-m-d')
}

/**
 * 文章ID合法性校验：复用原有逻辑
 */
const checkArticleId = (id) => {
  const idVal = String(id).trim()
  if (!idVal) {
    errorMsg.value = '文章ID不能为空，请检查访问地址'
    return false
  }
  const numId = Number(idVal)
  if (isNaN(numId) || numId <= 0) {
    errorMsg.value = '文章ID不合法，必须为正整数'
    return false
  }
  return true
}

/**
 * 请求文章详情：复用原有逻辑
 */
const getArticleDetail = async (id) => {
  loading.value = true
  try {
    // 缓存键
    const cacheKey = `article_detail_${id}`
    const cacheExpire = 30 // 缓存30分钟
    
    // 尝试从缓存获取文章详情
    let cachedArticle = cache.get(cacheKey)
    
    // 如果缓存不存在，从API获取
    if (!cachedArticle) {
      const queryParams = { id, cache: false }
      const res = await request.get('/api/article/one', queryParams)

      if (res.code === 200) {
        if (!res.data || Object.keys(res.data).length === 0) {
            error.value = true
            errorMsg.value = '未找到该文章，可能已被删除或ID错误'
            setDynamicTitle('文章不存在')
          } else {
            cachedArticle = res.data
            // 缓存文章详情
            cache.set(cacheKey, cachedArticle, cacheExpire)
            articleInfo.value = cachedArticle
            error.value = false
            setDynamicTitle(articleInfo.value.title)
            // 初始化文章操作状态（获取点赞数、收藏数等）
            await initArticleActions()
            // 获取文章评论
            getComments(articleInfo.value.id, currentPage.value)
          }
      } else {
        error.value = true
        errorMsg.value = res.msg || '获取文章详情失败'
        setDynamicTitle('获取文章失败')
      }
    } else {
      // 使用缓存数据
      articleInfo.value = cachedArticle
      error.value = false
      setDynamicTitle(articleInfo.value.title)
      // 初始化文章操作状态（获取点赞数、收藏数等）
      await initArticleActions()
      // 获取文章评论
      getComments(articleInfo.value.id, currentPage.value)
    }
  } catch (err) {
    error.value = true
    errorMsg.value = '网络异常，请检查网络后刷新页面'
    // console.error('[文章详情接口异常]：', err)
    setDynamicTitle('网络异常')
  } finally {
    loading.value = false
  }
}

// 计算属性
const isLogin = computed(() => store.comm.login.finish && Object.keys(store.comm.login.user).length > 0)

// 获取文章评论
const getComments = async (articleId, page = 1) => {
  try {
    const res = await request.get('/api/comment/flat', {
      bind_id: articleId,
      bind_type: 'article',
      page: page,
      limit: pageSize.value,
      order: 'create_time desc'
    })
    
    if (res.code === 200) {
      commentCount.value = res.data?.count || 0
      totalComments.value = res.data?.count || 0
      staticCommentList.value = res.data?.data || []
    }
  } catch (error) {
    // console.error('获取评论失败：', error)
  }
}

// 发布评论
const handlePublishComment = async (data) => {
  try {
    const res = await request.post('/api/comment/create', {
      content: data.content,
      bind_type: 'article',
      bind_id: articleInfo.value.id
    })
    
    if (res.code === 200) {
      // 重新获取评论列表
await getComments(articleInfo.value.id, currentPage.value)
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
    const res = await request.post('/api/comment/create', {
      content: data.content,
      bind_type: 'article',
      bind_id: articleInfo.value.id,
      pid: data.commentId
    })
    
    if (res.code === 200) {
      // 重新获取评论列表
      await getComments(articleInfo.value.id, currentPage.value)
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

// 检测深色模式
const detectDarkMode = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark') || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
}

// 处理评论分页变化
const handleCommentPageChange = async (page) => {
  currentPage.value = page
  await getComments(articleInfo.value.id, page)
}

/**
 * 处理文章点赞
 */
const handleLike = async () => {
  try {
    const articleId = articleInfo.value.id
    if (!articleId) return

    // 确保isLiked.value是布尔值
    const currentState = !!isLiked.value
    // console.log('点赞操作，当前状态:', currentState)
    // console.log('准备发送的state:', currentState ? 0 : 1)

    const userId = store.comm.login.user.id
    // console.log('当前用户ID:', userId)

    const res = await request.post('/api/exp/like', {
      bind_id: articleId,
      bind_type: 'article',
      state: currentState ? 0 : 1,
      description: '文章点赞',
      uid: userId // 显式传递用户ID
    })

    // console.log('点赞API响应:', res)

    if (res.code === 200) {
      // 计算新状态
      const newState = !currentState
      // 更新点赞状态
      isLiked.value = newState
      // 更新点赞数，确保不小于0
      likeCount.value = newState ? likeCount.value + 1 : Math.max(0, likeCount.value - 1)
      
      // 强制更新articleInfo中的result数据，确保页面刷新后状态正确
      if (articleInfo.value.result) {
        if (userId) {
          if (!articleInfo.value.result.like) {
            articleInfo.value.result.like = []
          }
          if (newState) {
            // 如果是点赞，确保用户ID在like数组中
            if (!articleInfo.value.result.like.includes(userId)) {
              articleInfo.value.result.like.push(userId)
            }
          } else {
            // 如果是取消点赞，确保用户ID不在like数组中
            articleInfo.value.result.like = articleInfo.value.result.like.filter(id => id !== userId)
          }
        }
      }
      
      // console.log('更新后的点赞状态:', isLiked.value)
      // console.log('更新后的点赞数:', likeCount.value)
      
      // 不再立即重新检查状态，因为API可能有延迟，会导致状态被覆盖
      // 本地状态已经正确更新，页面刷新时会通过initArticleActions重新获取正确状态
      
      if (window.Toast) {
        window.Toast.success(newState ? '点赞成功！' : '取消点赞成功！')
      }
    } else {
      // console.error('点赞操作失败，API返回码:', res.code)
      if (window.Toast) {
        window.Toast.error(res.msg || '操作失败')
      }
    }
  } catch (error) {
    // console.error('点赞操作失败：', error)
    if (window.Toast) {
      window.Toast.error('网络异常，操作失败')
    }
  }
}

/**
 * 处理文章分享
 */
const handleShare = async () => {
  try {
    const articleId = articleInfo.value.id
    if (!articleId) return

    // 准备分享内容：页面标题 + 链接
    const shareContent = `${articleInfo.value.title} ${window.location.href}`
    
    // 复制到剪贴板
    await navigator.clipboard.writeText(shareContent)
    
    // 调用分享API记录经验值
    const res = await request.post('/api/exp/share', {
      bind_id: articleId,
      bind_type: 'article',
      description: '文章分享'
    })

    // 显示成功提示
    if (window.Toast) {
      window.Toast.success('标题和链接已复制到剪贴板！')
    }

    // 更新分享数
    if (res.code === 200) {
      shareCount.value = shareCount.value + 1
    }
  } catch (error) {
    // console.error('分享操作失败：', error)
    if (window.Toast) {
      window.Toast.error('复制失败，请手动复制链接')
    }
  }
}

/**
 * 处理文章收藏
 */
const handleCollect = async () => {
  try {
    const articleId = articleInfo.value.id
    if (!articleId) return

    // 确保isCollected.value是布尔值
    const currentState = !!isCollected.value
    // console.log('收藏操作，当前状态:', currentState)
    // console.log('准备发送的state:', currentState ? 0 : 1)

    const userId = store.comm.login.user.id
    // console.log('当前用户ID:', userId)

    const res = await request.post('/api/exp/collect', {
      bind_id: articleId,
      bind_type: 'article',
      state: currentState ? 0 : 1,
      description: '文章收藏',
      uid: userId // 显式传递用户ID
    })

    // console.log('收藏API响应:', res)

    if (res.code === 200) {
      // 计算新状态
      const newState = !currentState
      // 更新收藏状态
      isCollected.value = newState
      // 更新收藏数，确保不小于0
      collectCount.value = newState ? collectCount.value + 1 : Math.max(0, collectCount.value - 1)
      
      // 强制更新articleInfo中的result数据，确保页面刷新后状态正确
      if (articleInfo.value.result) {
        if (userId) {
          if (!articleInfo.value.result.collect) {
            articleInfo.value.result.collect = []
          }
          if (newState) {
            // 如果是收藏，确保用户ID在collect数组中
            if (!articleInfo.value.result.collect.includes(userId)) {
              articleInfo.value.result.collect.push(userId)
            }
          } else {
            // 如果是取消收藏，确保用户ID不在collect数组中
            articleInfo.value.result.collect = articleInfo.value.result.collect.filter(id => id !== userId)
          }
        }
      }
      
      // console.log('更新后的收藏状态:', isCollected.value)
      // console.log('更新后的收藏数:', collectCount.value)
      
      // 不再立即重新检查状态，因为API可能有延迟，会导致状态被覆盖
      // 本地状态已经正确更新，页面刷新时会通过initArticleActions重新获取正确状态
      
      if (window.Toast) {
        window.Toast.success(newState ? '收藏成功！' : '取消收藏成功！')
      }
    } else {
      // console.error('收藏操作失败，API返回码:', res.code)
      if (window.Toast) {
        window.Toast.error(res.msg || '操作失败')
      }
    }
  } catch (error) {
    // console.error('收藏操作失败：', error)
    if (window.Toast) {
      window.Toast.error('网络异常，操作失败')
    }
  }
}

/**
 * 初始化文章操作状态
 */
const initArticleActions = async () => {
  // 从articleInfo.result中获取点赞数、分享数和收藏数
  likeCount.value = articleInfo.value.result?.like?.length || 0
  shareCount.value = articleInfo.value.result?.share?.length || 0
  collectCount.value = articleInfo.value.result?.collect?.length || 0
  
  // 检查用户是否已点赞/收藏
  await checkUserActions()
}

/**
 * 检查用户操作状态（是否已点赞、已收藏）
 */
const checkUserActions = async () => {
  try {
    const articleId = articleInfo.value.id
    if (!articleId) return
    
    // 检查用户是否已登录
    if (!isLogin.value) {
      isLiked.value = false
      isCollected.value = false
      return
    }
    
    const userId = store.comm.login.user.id
    if (!userId) {
      isLiked.value = false
      isCollected.value = false
      return
    }
    
    // 检查是否已点赞
    const likeRes = await request.get('/api/exp/one', {
      where: JSON.stringify({
        uid: String(userId),
        type: 'like',
        bind_id: articleId,
        bind_type: 'article',
        state: 1 // 只查询有效状态的记录
      })
    })
    // 确保isLiked.value是布尔值，并且只在记录存在且状态为1时为true
    isLiked.value = !!likeRes.data && likeRes.data.state === 1
    // console.log('检查点赞状态：', likeRes.data, '，状态值：', likeRes.data?.state, '，设置为：', isLiked.value)
    
    // 检查是否已收藏
    const collectRes = await request.get('/api/exp/one', {
      where: JSON.stringify({
        uid: String(userId),
        type: 'collect',
        bind_id: articleId,
        bind_type: 'article',
        state: 1 // 只查询有效状态的记录
      })
    })
    // 确保isCollected.value是布尔值，并且只在记录存在且状态为1时为true
    isCollected.value = !!collectRes.data && collectRes.data.state === 1
    // console.log('检查收藏状态：', collectRes.data, '，状态值：', collectRes.data?.state, '，设置为：', isCollected.value)
  } catch (error) {
    // console.error('检查用户操作状态失败：', error)
    // 出错时默认设置为未操作状态
    isLiked.value = false
    isCollected.value = false
  }
}

// 页面挂载执行核心逻辑
onMounted(() => {
  const currentId = getCurrentArticleId()
  if (checkArticleId(currentId)) {
    getArticleDetail(Number(currentId))
  } else {
    error.value = true
    loading.value = false
    setDynamicTitle('文章ID不合法')
    setTimeout(() => router.go(-1), 3000)
  }
  
  detectDarkMode()
  
  // 监听深色模式变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', detectDarkMode)
})

// 监听路由参数变化，重新获取文章数据
watch(
  () => route.params.id,
  (newId) => {
    if (newId && checkArticleId(newId)) {
      getArticleDetail(Number(newId))
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

/* 文章标题：响应式字号、优化行高、居中 */
.article-title {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  line-height: 1.3;
  font-weight: 700;
}

/* 文章元信息：弱化样式、统一图标 */
.article-meta {
  font-size: 0.9rem;
  color: #6b7280;
  flex-wrap: wrap;
}
.article-meta .meta-item {
  white-space: nowrap;
}
.article-meta .bi {
  font-size: 1em;
  color: #9ca3af;
}

/* 文章内容区：核心阅读样式优化 */
.article-content {
  line-height: 1.8;
  font-size: 1.05rem;
}

/* 适配Markdown渲染的内部样式（核心：保证阅读体验） */
.article-content :deep(h2),
.article-content :deep(h3),
.article-content :deep(h4) {
  margin: 1.8rem 0 0.8rem;
  font-weight: 600;
  line-height: 1.4;
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
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}
.article-content :deep(ul),
.article-content :deep(ol) {
  margin-bottom: 1.2rem;
  padding-left: 1.8rem;
}
.article-content :deep(li) {
  margin-bottom: 0.5rem;
}
.article-content :deep(a) {
  color: #2563eb;
  text-decoration: none;
}
.article-content :deep(a:hover) {
  text-decoration: underline;
  text-underline-offset: 0.2rem;
}
.article-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.2rem;
}
.article-content :deep(td),
.article-content :deep(th) {
  border: 1px solid #e5e7eb;
  padding: 0.7rem;
  text-align: left;
}
.article-content :deep(th) {
  background-color: #f9fafb;
  font-weight: 600;
}

/* 评论区容器：基础间距 */
.article-comment {
  width: 100%;
}
/* 文章操作按钮样式 */
.article-actions {
  padding: 1.25rem;
  border-radius: 1rem;
  background-color: #fafafa;
  backdrop-filter: blur(10px);
  border: 1px solid #f0f0f0;
}

/* 徽章样式 */
.btn .badge {
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem !important;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
}

/* 文章标签样式 */
.article-tags .badge {
  font-size: 0.75rem;
  padding: 0.35rem 0.75rem;
  font-weight: 500;
  border-radius: 50px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.article-tags .badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 文章操作按钮样式 */
.btn-group .btn {
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-group .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn-group .btn:active {
  transform: translateY(0);
}

/* 按钮图标样式 */
.btn i {
  transition: all 0.3s ease;
}

.btn:hover i {
  transform: scale(1.1);
}

/* 暗黑模式样式 */
[data-bs-theme=dark] {
  /* 文章元信息 */
  .article-meta {
    color: var(--bs-secondary-color);
  }
  .article-meta .bi {
    color: var(--bs-tertiary-color);
  }
  
  /* 文章内容 */
  .article-content :deep(h2),
  .article-content :deep(h3),
  .article-content :deep(h4) {
    color: var(--bs-emphasis-color);
  }
  .article-content :deep(img) {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
  .article-content :deep(a) {
    color: var(--bs-link-color);
  }
  .article-content :deep(a:hover) {
    color: var(--bs-link-hover-color);
  }
  .article-content :deep(td),
  .article-content :deep(th) {
    border-color: var(--bs-border-color);
  }
  .article-content :deep(th) {
    background-color: var(--bs-secondary-bg);
  }
  
  /* 版权信息卡片 */
  .card.border {
    border-color: var(--bs-border-color);
    background-color: var(--bs-tertiary-bg);
  }
  
  /* 加载状态 */
  .spinner-border {
    color: var(--bs-info);
  }
  
  /* 错误状态 */
  .article-content-wrap.card {
    background-color: var(--bs-tertiary-bg);
    border-color: var(--bs-border-color);
  }
  
  /* 文章操作按钮 */
  .btn-group .btn:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
}

/* 关键：768px及以下屏幕 文章元信息适配缩小 */
@media (max-width: 768px) {
  .article-meta {
    font-size: 0.65rem; /* 字号缩小，核心 */
    gap: 0.6rem !important; /* 元信息项之间的间距缩小，!important覆盖bootstrap的gap-4 */
  }
  .article-meta .meta-item .bi {
    font-size: 0.8em; /* 图标字号轻微缩小，更协调 */
    margin-right: 0.3rem !important; /* 图标与文字间距缩小 */
  }
  
  /* 文章标签响应式调整 */
  .article-tags {
    gap: 0.5rem !important;
  }
  
  .article-tags .badge {
    font-size: 0.7rem;
    padding: 0.25rem 0.6rem;
  }
  
  /* 文章操作按钮响应式调整 - 小按钮 */
  .btn-group {
    width: 100%;
    gap: 0.5rem !important;
    flex-direction: row;
  }
  
  .btn {
    flex: 1;
    padding: 0.4rem 0.2rem !important;
    font-size: 0.7rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 60px;
  }
  
  .btn .bi {
    font-size: 1.1em;
    margin-right: 0 !important;
    margin-bottom: 0.2rem;
  }
  
  .btn span {
    font-size: 0.65rem;
    margin-right: 0 !important;
    text-align: center;
  }
  
  .btn .badge {
    font-size: 0.6rem;
    padding: 0.1rem 0.3rem !important;
    margin-top: 0.2rem;
  }
}

/* 关键：480px及以下屏幕 进一步缩小 */
@media (max-width: 480px) {
  /* 文章标签响应式调整 */
  .article-tags {
    gap: 0.4rem !important;
  }
  
  .article-tags .badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.5rem;
  }
  
  /* 文章操作按钮响应式调整 - 更紧凑的布局 */
  .btn-group {
    width: 100%;
    flex-direction: row;
    gap: 0.3rem !important;
  }
  
  .btn {
    flex: 1;
    padding: 0.3rem 0.1rem !important;
    font-size: 0.6rem;
    min-width: 50px;
  }
  
  .btn .bi {
    font-size: 1em;
    margin-bottom: 0.1rem;
  }
  
  .btn .badge {
    font-size: 0.55rem;
    padding: 0.05rem 0.25rem !important;
    margin-top: 0.1rem;
  }
}
</style>