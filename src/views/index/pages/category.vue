<template>
  <div class="category-page-wrapper">
    <!-- 加载状态 -->
    <div v-if="loading" class="page-loading">
      <div class="spinner-border text-info fs-4" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="card shadow-sm p-4 mt-2">
      <p class="mb-0 fw-normal">{{ errorMsg }}</p>
    </div>

    <!-- 分类页面主体 -->
    <div v-else class="category-main">
      <!-- 分类信息卡片 -->
      <div class="category-info card shadow-sm p-4 mt-2">
        <div class="category-info-inner">
          <!-- 分类头像 -->
          <div class="category-info-avatar">
            <img 
              :src="categoryInfo.avatar || defaultCover" 
              :alt="categoryInfo.name"
              class="category-info-avatar-img"
              @error="handleImageError"
            >
          </div>
          <!-- 分类信息 -->
          <div class="category-info-content">
            <h1 class="category-title fw-bold mb-3">{{ categoryInfo.name }} <span class="text-sm text-muted">({{ articleCount }})</span></h1>
            <p v-if="categoryInfo.description" class="category-description text-muted mb-4">
              {{ categoryInfo.description }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- 文章列表 -->
      <div :class="['article-list-container mt-2', hasImageMode ? 'grid-article-list' : 'list-article-list']">
        <div v-if="articles.length === 0" class="card shadow-sm p-4 text-center col-12">
          <i class="bi bi-file-earmark-text text-muted fs-3 mb-2"></i>
          <p class="mb-0 text-muted">该分类下暂无文章</p>
        </div>
        <div 
          v-for="article in articles" 
          :key="article.id" 
          :class="[
            'card', 
            hasImageMode ? 'article-item-card shadow-sm hover-shadow' : 'article-item-list shadow-sm hover-shadow mt-2'
          ]"
          @click="goToArticle(article.id)"
          style="cursor: pointer;"
        >
          <!-- 有图模式布局 -->
          <div v-if="hasImageMode" class="card-body p-0 d-flex flex-column h-100">
            <!-- 文章封面 -->
            <div class="article-cover flex-shrink-0">
              <img 
                :src="loadingGif" 
                :data-src="getCoverImg(article)" 
                :alt="article.title" 
                class="article-cover-img w-100 h-100 object-cover lazy-img"
                loading="lazy"
                @load="onImageLoad"
                @error="handleImageError"
              >
            </div>
            <!-- 内容区 -->
            <div class="article-content p-2 flex-grow-1 d-flex flex-column">
              <!-- 文章标题 -->
              <h3 class="article-title fw-bold mb-1 m-0">{{ article.title }}</h3>

              <!-- 文章摘要 -->
              <p class="article-desc text-truncate-1 mt-auto mb-1">
                {{ article.abstract || '暂无摘要' }}
              </p>

              <!-- 元信息 -->
              <div class="article-meta d-flex align-items-center w-100 m-0">
                <div class="meta-left d-flex align-items-center gap-0.5">
                  <span class="meta-item"><i class="bi bi-folder-fill"></i>{{ article?.result?.group?.[0]?.name || '未分类' }}</span>
                </div>
                <div class="meta-right d-flex align-items-center gap-0.5 ms-auto">
                  <span class="meta-item"><i class="bi bi-calendar-fill"></i>{{ formatTime(article.create_time) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 无图模式布局 -->
          <div v-else class="card-body p-2">
            <!-- 文章标题 -->
            <h3 class="article-title-list h5 fw-bold mb-2">{{ article.title }}</h3>

            <!-- 文章摘要 -->
            <p class="article-desc-list text-muted mb-3">
              {{ article.abstract || '暂无摘要' }}
            </p>

            <!-- 元信息 -->
            <div class="d-flex align-items-center justify-content-between w-100">
              <div class="d-flex align-items-center gap-3">
                <span class="text-sm text-secondary"><i class="bi bi-folder-fill me-1"></i>{{ article?.result?.group?.[0]?.name || '未分类' }}</span>
              </div>
              <div class="d-flex align-items-center gap-3">
                <span class="text-sm text-secondary"><i class="bi bi-calendar-fill me-1"></i>{{ formatTime(article.create_time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 分页 -->
      <div v-if="total > 0" class="pagination-container mt-4">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="changePage(currentPage - 1)">
                <span aria-hidden="true">&laquo;</span>
              </button>
            </li>
            <li class="page-item active">
              <span class="page-link">{{ currentPage }} / {{ pageCount }}</span>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === pageCount }">
              <button class="page-link" @click="changePage(currentPage + 1)">
                <span aria-hidden="true">&raquo;</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import request from '@/utils/request'
import cache from '@/utils/cache'

// 导入本地图片
import defaultCover from '@/assets/img/fm.avif'
import loadingGif from '@/assets/img/ljz.gif'
import { useCommStore } from '@/store/comm'
import { usePageTitle } from '@/utils/usePageTitle'

// 存储
const store = {
  comm: useCommStore()
};

const router = useRouter()
const route = useRoute()

// 页面标题管理
const { setDynamicTitle } = usePageTitle()
setDynamicTitle('加载中...')

// 响应式状态
const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')
const categoryInfo = ref({})
const articles = ref([])
const currentPage = ref(1)
const total = ref(0)
const limit = ref(10)
const articleCount = ref(0)
// 显示模式：true为有图模式（网格布局），false为无图模式（列表布局）
const hasImageMode = ref(true)

// 从后端API获取显示模式设置
const loadDisplayMode = async () => {
  try {
    const response = await request.get('/api/config/one', { key: 'xiao_functions' })
    if (response.code === 200 && response.data) {
      const config = response.data.json || {}
      hasImageMode.value = config.display_mode !== false // 默认值为true
    }
  } catch (error) {
    console.error('读取显示模式设置失败:', error)
    // 出错时使用默认值
    hasImageMode.value = true
  }
}

// 保存显示模式设置到后端API
const saveDisplayMode = async (mode) => {
  try {
    await request.post('/api/config/save', {
      key: 'xiao_functions',
      json: { display_mode: mode }
    })
  } catch (error) {
    console.error('保存显示模式设置失败:', error)
  }
}

// 监听显示模式变化
const changeDisplayMode = async (mode) => {
  hasImageMode.value = mode
  await saveDisplayMode(mode)
}

// Intersection Observer 用于懒加载
let observer = null

// 计算属性
const pageCount = computed(() => {
  return Math.ceil(total.value / limit.value)
})



// 从路由参数获取分类ID
const getCurrentCategoryId = () => {
  return route.params.id
}

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 跳转文章详情
const goToArticle = (articleId) => {
  // 验证文章ID是否为有效的正整数
  const validArticleId = parseInt(articleId)
  if (!isNaN(validArticleId) && validArticleId > 0) {
    router.push(`/archives/${validArticleId}`)
  } else {
    // console.error('文章ID不合法:', articleId)
  }
}

// 检查分类参数合法性
const checkCategoryParam = (param) => {
  const paramVal = String(param).trim()
  if (!paramVal) {
    errorMsg.value = '分类参数不能为空，请检查访问地址'
    return false
  }
  return true
}

// 获取封面图片
const getCoverImg = (article) => {
  // 1. 优先使用文章自身封面
  if (article.covers && article.covers.trim() !== '') {
    return article.covers
  }
  
  // 2. 使用导入的本地默认封面图片
  return defaultCover
}

// 图片加载成功处理
const onImageLoad = (event) => {
  const img = event.target
  // 移除loading样式
  img.classList.remove('lazy-loading')
  img.classList.add('lazy-loaded')
}

// 图片加载失败处理
const handleImageError = (event) => {
  const img = event.target
  // 移除loading样式
  img.classList.remove('lazy-loading')
  
  // 尝试加载默认图片
  
  // 如果当前src不是默认图片，则尝试加载默认图片
  if (img.src !== defaultCover) {
    img.src = defaultCover
  } else {
    // 如果默认图片也加载失败，显示错误状态
    img.classList.add('lazy-error')
  }
  
  // 防止无限错误循环
  img.onerror = null
}

// Intersection Observer 用于懒加载
const initIntersectionObserver = () => {
  if (!('IntersectionObserver' in window)) {
    // 浏览器不支持 IntersectionObserver，回退到立即加载
    loadAllImages()
    return
  }

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target
        const dataSrc = img.dataset.src
        
        if (dataSrc) {
          // 开始加载实际图片
          img.src = dataSrc
          img.classList.add('lazy-loading')
          observer.unobserve(img)
        }
      }
    })
  }, {
    rootMargin: '50px 0px', // 提前50px开始加载
    threshold: 0.1
  })
}

// 观察所有懒加载图片
const observeLazyImages = () => {
  nextTick(() => {
    const lazyImages = document.querySelectorAll('.lazy-img')
    lazyImages.forEach(img => {
      if (observer) {
        observer.observe(img)
      }
    })
  })
}

// 加载所有图片（回退方案）
const loadAllImages = () => {
  const lazyImages = document.querySelectorAll('.lazy-img')
  lazyImages.forEach(img => {
    const dataSrc = img.dataset.src
    if (dataSrc) {
      img.src = dataSrc
    }
  })
}

// 获取分类文章总数
const getCategoryArticleCount = async (categoryId) => {
  try {
    // 使用like参数获取分类文章总数，使用与文章列表相同的参数格式和传递方式
    const like = `Group|%7C${categoryId}%7C`;
    const apiUrl = `/api/article/count?like=${like}`;
    // console.log('分类文章总数请求URL:', apiUrl);
    // console.log('当前分类ID:', categoryId);
    // console.log('like参数:', like);
    
    const response = await request.get(apiUrl);
    
    if (response.code === 200) {
      articleCount.value = response.data || 0
      // console.log('分类文章总数:', articleCount.value)
    } else {
      articleCount.value = 0
      // console.error('获取分类文章总数失败:', response.msg)
    }
  } catch (err) {
    articleCount.value = 0
    // console.error('获取分类文章总数失败:', err)
  }
}

// 获取分类详情
const getCategoryDetail = async (categoryParam) => {
  loading.value = true
  error.value = false
  errorMsg.value = ''
  articleCount.value = 0
  try {
    // 缓存键
    const cacheKey = 'categories_list'
    const cacheExpire = 60 // 缓存60分钟
    
    // 尝试从缓存获取分类列表
    let categories = cache.get(cacheKey)
    
    // 如果缓存不存在，从API获取
    if (!categories) {
      let res = await request.get('/api/article-group/all', {
        cache: false
      })

      if (res.code === 200 && res.data && res.data.data && res.data.data.length > 0) {
        categories = res.data.data
        // 缓存分类列表
        cache.set(cacheKey, categories, cacheExpire)
      } else {
        error.value = true
        errorMsg.value = '获取分类列表失败'
        loading.value = false
        return
      }
    }

    // 根据key或id匹配分类
    let matchedCategory = null
    
    // 优先根据key匹配
    matchedCategory = categories.find(category => category.key === categoryParam)
    
    // 如果key匹配失败，尝试根据id匹配
    if (!matchedCategory) {
      matchedCategory = categories.find(category => category.id == categoryParam)
    }
    
    if (matchedCategory) {
      categoryInfo.value = matchedCategory
      // 获取分类文章总数
      await getCategoryArticleCount(matchedCategory.id)
      // 更新页面标题
      setDynamicTitle(matchedCategory.name)
    } else {
      error.value = true
      errorMsg.value = '未找到该分类，可能已被删除或参数错误'
      // 更新页面标题
      setDynamicTitle('分类不存在')
    }
  } catch (err) {
    error.value = true
    errorMsg.value = '网络异常，请检查网络后刷新页面'
    // console.error('获取分类详情失败:', err)
    // 更新页面标题
    setDynamicTitle('网络异常')
  } finally {
    loading.value = false
  }
}

// 获取分类下的文章列表 - 修复版
const getCategoryArticles = async (page = 1) => {
  try {
    // 使用带管道符的格式，确保能匹配到所有文章
    const like = `Group|%7C${categoryInfo.value.id}%7C`;
    const apiUrl = `/api/article/all?like=${like}&page=${page}&limit=${limit.value}&order=create_time+desc&cache=false`;
    
    // console.log('修复版请求URL:', apiUrl);
    // console.log('当前分类ID:', categoryInfo.value.id);
    // console.log('like参数:', like);
    
    const res = await request.get(apiUrl);

    if (res.code === 200) {
      // 调试：查看API返回的数据结构
      // console.log('API返回数据:', res);
      
      // 处理不同的数据结构
      if (res.data && res.data.data) {
        // 文章数组在data.data中
        articles.value = res.data.data;
        total.value = res.data.count || 0;
      } else if (res.data && Array.isArray(res.data)) {
        // 直接是文章数组
        articles.value = res.data;
        total.value = res.count || 0;
      } else {
        articles.value = [];
        total.value = 0;
      }
      // 数据更新后，观察新图片
      observeLazyImages();
    } else {
      articles.value = [];
      total.value = 0;
      // console.error('API返回错误:', res.msg);
    }
  } catch (err) {
    articles.value = [];
    total.value = 0;
    // console.error('获取分类文章失败:', err);
  }
};

// 切换分页
const changePage = (page) => {
  if (page < 1 || page > pageCount.value) return
  currentPage.value = page
  if (!error.value && categoryInfo.value && categoryInfo.value.id) {
    getCategoryArticles(page)
  }
}

// 初始化页面
const initPage = async (categoryParam) => {
  if (categoryParam && checkCategoryParam(categoryParam)) {
    await getCategoryDetail(categoryParam)
    if (!error.value) {
      await getCategoryArticles(currentPage.value)
    }
  } else {
    error.value = true
    loading.value = false
    errorMsg.value = '分类参数不合法'
  }
}

// 监听路由参数变化
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      // 清空之前的数据，避免旧数据残留
      categoryInfo.value = {}
      articles.value = []
      total.value = 0
      currentPage.value = 1
      error.value = false
      errorMsg.value = ''
      
      // 重新初始化页面，直接使用newId
      await initPage(newId)
    }
  },
  { immediate: false }
)

// 页面挂载初始化
onMounted(async () => {
  // 加载显示模式设置
  await loadDisplayMode()
  
  // 初始化Intersection Observer
  initIntersectionObserver()
  
  // 获取文章列表
  await initPage(getCurrentCategoryId())
})
</script>

<style scoped>
/* 加载状态 */
.page-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

/* 分类信息卡片 */
.category-info-inner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

/* 分类头像 */
.category-info-avatar {
  flex-shrink: 0;
}

.category-info-avatar-img {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 分类信息内容 */
.category-info-content {
  flex-grow: 1;
  min-width: 0;
}

/* 分类标题 */
.category-title {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  line-height: 1.3;
  font-weight: 700;
  margin-bottom: 0.75rem !important;
}

/* 分类描述 */
.category-description {
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 0 !important;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .category-info-inner {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .category-info-avatar-img {
    width: 80px;
    height: 80px;
  }
  
  .category-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  
  .category-description {
    font-size: 1rem;
  }
}

/* 文章列表Grid布局 - 有图模式 */
.grid-article-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 文章列表List布局 - 无图模式 */
.list-article-list {
  max-width: 1200px;
  margin: 0 auto;
}

/* 封面容器 */
.article-cover {
  width: 100%;
  padding-top: 66.67%;
  position: relative;
  overflow: hidden;
  background-color: #f8f9fa; /* 加载时的背景色 */
}

/* 懒加载图片样式 */
.article-cover-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

/* 加载中的图片样式 */
.article-cover-img.lazy-loading {
  filter: blur(5px);
  opacity: 0.7;
  transform: scale(1.02);
}

/* 加载完成的图片样式 */
.article-cover-img.lazy-loaded {
  filter: blur(0);
  opacity: 1;
  animation: fadeIn 0.5s ease;
}

/* 加载失败的图片样式 */
.article-cover-img.lazy-error {
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.article-cover-img.lazy-error::after {
  content: '图片加载失败';
  font-size: 0.7rem;
  color: #868e96;
}

/* 内容区 */
.article-content {
  height: 100%;
}

/* 图片样式 */
img {
  transition: all 0.3s ease;
  max-width: 100%;
  height: auto;
}

.article-cover-img:hover {
  transform: scale(1.03);
  filter: brightness(0.95);
}

/* 标题 */
.article-title {
  font-size: clamp(1rem, 1.4vw, 1.2rem);
  line-height: 1.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 摘要 */
.article-desc {
  font-size: 0.6rem;
  color: #6c757d;
  line-height: 1.3;
  margin: 0;
}

.text-truncate-1 {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 无图模式标题 */
.article-title-list {
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  line-height: 1.4;
  font-weight: 700;
}

/* 无图模式摘要 */
.article-desc-list {
  font-size: 0.9rem;
  color: #6c757d;
  line-height: 1.5;
  margin: 0.5rem 0;
}

/* 元信息 */
.article-meta {
  font-size: 0.7rem;
  color: #868e96;
  line-height: 1.2;
}

.meta-left, .meta-right {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.meta-item {
  position: relative;
  display: flex;
  align-items: center;
  white-space: nowrap;
  padding-left: 0 !important;
}

.meta-item .bi {
  font-size: 0.9em;
  margin-right: 0.2rem;
  line-height: 1;
  vertical-align: middle;
  color: #9ca3af;
}

/* 分页样式 */
.pagination-container {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0.7;
    filter: blur(5px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 如果gif路径不对，可以使用纯CSS加载动画 */
.article-cover-img:not([src]) {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .grid-article-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }
  .article-item-card {
    min-width: 160px;
  }
  .article-content {
    padding: 1.5px;
  }
  
  .category-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  
  .category-description {
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .grid-article-list {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .article-item-card:hover {
    transform: translateY(-2px);
  }
  
  .article-title {
    font-size: 1rem;
  }
  
  .article-meta {
    font-size: 0.75rem;
  }
}

/* 暗黑模式适配 */
[data-bs-theme=dark] {
  /* 分类标题和描述 */
  .category-title {
    color: var(--bs-heading-color);
  }
  
  .category-description {
    color: var(--bs-secondary-color);
  }
  
  /* 文章卡片 */
  .article-item-card,
  .article-item-list {
    background-color: var(--bs-body-bg);
    border-color: var(--bs-border-color);
  }
  
  /* 标题 */
  .article-title {
    color: var(--bs-heading-color);
  }
  
  /* 摘要 */
  .article-desc {
    color: var(--bs-secondary-color);
  }
  
  /* 无图模式标题 */
  .article-title-list {
    color: var(--bs-heading-color);
  }
  
  /* 无图模式摘要 */
  .article-desc-list {
    color: var(--bs-secondary-color);
  }
  
  /* 元信息 */
  .article-meta {
    color: var(--bs-tertiary-color);
  }
  
  .meta-item .bi {
    color: var(--bs-tertiary-color);
  }
  
  /* 加载动画 */
  .article-cover-img:not([src]) {
    background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
  }
  
  /* 悬停效果 */
  .article-item-card:hover,
  .article-item-list:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}
</style>