<template>
  <!-- 公告卡片 -->
  <i-notice />

  <!-- 加载状态 -->
  <div v-if="loading && articleList.length === 0" class="d-flex justify-content-center align-items-center py-5">
    <div class="spinner-border text-info" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>

  <!-- 空数据状态 -->
  <div v-else-if="articleList.length === 0 && !loading" class="alert alert-light text-center py-4 mt-2">
    <p class="mb-0 text-muted fs-7">暂无文章数据</p>
  </div>

  <!-- 文章列表 -->
  <div v-else :class="['article-list-container mt-2', hasImageMode ? 'grid-article-list' : 'list-article-list']">
    <!-- 先显示置顶文章 -->
    <div 
      v-for="article in sortedArticleList.filter(article => article.top === 1)" 
      :key="`sticky-${article.id}`"
      :class="[
        'card', 
        hasImageMode ? 'article-item-card shadow-sm hover-shadow' : 'article-item-list shadow-sm hover-shadow mt-2',
        {'sticky-article': article.top === 1}
      ]"
      @click="toArticleDetail(article.id)" 
      style="cursor: pointer;"
    >
      <!-- 置顶标识 -->
      <div class="sticky-badge" v-if="article.top === 1">
        <i class="bi bi-pin-angle-fill"></i> 置顶
      </div>
      
      <!-- 有图模式布局 -->
      <div v-if="hasImageMode" class="card-body p-0 d-flex flex-column h-100">
        <!-- 文章封面 -->
        <div class="article-cover flex-shrink-0">
          <img 
            :src="loadingGif" 
            :data-src="getCoverImg(article)" 
            :alt="article.title" 
            class="article-cover-img w-100 h-100 object-cover lazy-img"
            @load="onImageLoad"
            @error="handleImageError"
          >
          <!-- 置顶标识 -->
          <div class="sticky-badge" v-if="article.top === 1">
            <i class="bi bi-pin-angle-fill"></i> 置顶
          </div>
        </div>
        <!-- 内容区 -->
        <div class="article-content p-4 flex-grow-1 d-flex flex-column">
          <!-- 文章标题 -->
          <h3 class="article-title fw-bold mb-3">
            {{ article.title }}
          </h3>

          <!-- 文章摘要 -->
          <p class="article-desc text-muted mb-4 flex-grow-1">
            {{ article.abstract || '暂无摘要' }}
          </p>

          <!-- 元信息 -->
          <div class="article-meta d-flex align-items-center justify-content-between w-100">
            <div class="meta-left">
              <span class="meta-item"><i class="bi bi-folder-fill me-1"></i>{{ article?.result?.group?.[0]?.name || '未分类' }}</span>
            </div>
            <div class="meta-right">
              <span class="meta-item"><i class="bi bi-calendar-fill me-1"></i>{{ formatTime(article.create_time) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无图模式布局 -->
      <div v-else class="card-body p-2">
        <!-- 文章标题 -->
        <h3 class="article-title-list h5 fw-bold mb-2">
          <span v-if="article.top === 1" class="me-2">
            <i class="bi bi-pin-angle-fill text-warning"></i>
          </span>
          {{ article.title }}
        </h3>

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

    <!-- 再显示非置顶文章 -->
    <div 
      v-for="article in sortedArticleList.filter(article => article.top !== 1)" 
      :key="article.id"
      :class="[
        'card', 
        hasImageMode ? 'article-item-card shadow-sm hover-shadow' : 'article-item-list shadow-sm hover-shadow mt-2'
      ]"
      @click="toArticleDetail(article.id)" 
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
            @load="onImageLoad"
            @error="handleImageError"
          >
        </div>
        <!-- 内容区 -->
        <div class="article-content p-4 flex-grow-1 d-flex flex-column">
          <!-- 文章标题 -->
          <h3 class="article-title fw-bold mb-3">{{ article.title }}</h3>

          <!-- 文章摘要 -->
          <p class="article-desc text-muted mb-4 flex-grow-1">
            {{ article.abstract || '暂无摘要' }}
          </p>

          <!-- 元信息 -->
          <div class="article-meta d-flex align-items-center justify-content-between w-100">
            <div class="meta-left">
              <span class="meta-item"><i class="bi bi-folder-fill me-1"></i>{{ article?.result?.group?.[0]?.name || '未分类' }}</span>
            </div>
            <div class="meta-right">
              <span class="meta-item"><i class="bi bi-calendar-fill me-1"></i>{{ formatTime(article.create_time) }}</span>
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
          <div class="page-input-container">
            <input 
              type="number" 
              class="page-input" 
              v-model.number="pageInput" 
              @keyup.enter="goToPage"
              @blur="goToPage"
              min="1"
              :max="pageCount"
            >
            <span class="page-separator">/</span>
            <span class="page-total">{{ pageCount }}</span>
          </div>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === pageCount }">
          <button class="page-link" @click="changePage(currentPage + 1)">
            <span aria-hidden="true">&raquo;</span>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { push } from '@/utils/route'
import request from '@/utils/request' 
// 导入公告组件
import INotice from '@/comps/custom/i-notice.vue'
import { usePageTitle } from '@/utils/usePageTitle'

// 使用页面标题管理
const { setDynamicTitle } = usePageTitle();
setDynamicTitle('首页');

// 导入本地图片
import defaultCover from '@/assets/img/fm.avif'
import loadingGif from '@/assets/img/ljz.gif'

const articleList = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageInput = ref(1)
const limit = ref(9)
const total = ref(0)
const order = ref('top desc, create_time desc')
// 显示模式：true为有图模式（网格布局），false为无图模式（列表布局）
const hasImageMode = ref(true)

// 从后端API获取显示模式设置
const loadDisplayMode = async () => {
  try {
    const response = await request.get('/api/config/one', { key: 'buyu_functions' })
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
      key: 'buyu_functions',
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

// 计算总页数
const pageCount = computed(() => {
  return Math.ceil(total.value / limit.value)
})

// 计算排序后的文章列表：置顶文章在前
const sortedArticleList = computed(() => {
  return [...articleList.value].sort((a, b) => {
    if (a.top !== b.top) {
      return b.top - a.top // 置顶的在前
    }
    return new Date(b.create_time * 1000) - new Date(a.create_time * 1000)
  })
})

// 切换分页
const changePage = (page) => {
  if (page < 1 || page > pageCount.value) return
  currentPage.value = page
  pageInput.value = page
  getArticleList(page, false)
}

// 跳转到指定页数
const goToPage = () => {
  let page = parseInt(pageInput.value)
  if (isNaN(page) || page < 1) {
    page = 1
  } else if (page > pageCount.value) {
    page = pageCount.value
  }
  pageInput.value = page
  currentPage.value = page
  getArticleList(page, false)
}

const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  const date = new Date(timestamp * 1000)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
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
  const articleId = img.dataset.id
  
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
let observer = null

// 初始化观察者
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
    const lazyImages = document.querySelectorAll('.lazy-img:not([data-observed])')
    lazyImages.forEach(img => {
      if (observer) {
        observer.observe(img)
        img.dataset.observed = 'true'
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

const getArticleList = async (page = 1) => {
  loading.value = true
  try {
    const params = { page, limit: limit.value, order: order.value }
    const res = await request.get('/api/article/all', params)
    
    if (res.code === 200) {
      const newData = res.data.data || []
      const totalCount = res.data.count || 0
      
      articleList.value = newData
      total.value = totalCount
      currentPage.value = page
      
      // 数据更新后，观察新图片
      observeLazyImages()
    } else {
      // console.error('获取文章列表失败：', res.msg)
      articleList.value = []
    }
  } catch (error) {
    // console.error('获取文章列表接口异常：', error)
    articleList.value = []
  } finally {
    loading.value = false
  }
}

const toArticleDetail = (id) => {
  push(`/archives/${id}`) 
}

onMounted(async () => {
  // 加载显示模式设置
  await loadDisplayMode()
  
  // 初始化Intersection Observer
  initIntersectionObserver()
  
  // 获取文章列表
  getArticleList(1)
})

onUnmounted(() => {
  // 清理观察者
  if (observer) {
    observer.disconnect()
    observer = null
  }
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

/* 文章列表Grid布局 - 有图模式 */
.grid-article-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  margin: 0 auto;
}

/* 文章卡片基础样式 */
.article-item-card {
  border-radius: 16px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--bs-border-color);
  background-color: var(--bs-card-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.article-item-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  border-color: rgba(0, 123, 255, 0.3);
}

/* 置顶文章标识 */
.sticky-article {
  position: relative;
}

.sticky-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

.sticky-badge .bi {
  font-size: 0.8em;
}

/* 封面容器 */
.article-cover {
  width: 100%;
  padding-top: 66.67%;
  position: relative;
  overflow: hidden;
  background-color: var(--bs-secondary-bg);
}

/* 懒加载图片样式 */
.article-cover-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s ease;
}

/* 加载中的图片样式 */
.article-cover-img.lazy-loading {
  filter: blur(8px);
  opacity: 0.6;
  transform: scale(1.05);
}

/* 加载完成的图片样式 */
.article-cover-img.lazy-loaded {
  filter: blur(0);
  opacity: 1;
  animation: fadeIn 0.6s ease;
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
  font-size: 0.9rem;
  color: #868e96;
}

/* 内容区 */
.article-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--bs-card-bg);
  padding: 1.5rem;
}

/* 图片样式 */
img {
  transition: all 0.3s ease;
  max-width: 100%;
  height: auto;
}

.article-cover:hover .article-cover-img {
  transform: scale(1.1);
  filter: brightness(0.9);
}

/* 标题 */
.article-title {
  font-size: clamp(1.1rem, 1.5vw, 1.3rem);
  line-height: 1.4;
  font-weight: 700;
  color: var(--bs-heading-color);
  transition: color 0.3s ease;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  display: -moz-box;
  display: box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -moz-line-clamp: 2;
  -webkit-box-orient: vertical;
  -moz-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-item-card:hover .article-title {
  color: var(--bs-primary);
}

/* 摘要 */
.article-desc {
  font-size: 0.9rem;
  color: var(--bs-secondary-color);
  line-height: 1.6;
  margin: 0 0 1.25rem 0;
  display: -webkit-box;
  display: -moz-box;
  display: box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -moz-line-clamp: 3;
  -webkit-box-orient: vertical;
  -moz-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-grow: 1;
}

/* 无图模式标题 */
.article-title-list {
  font-size: clamp(1.2rem, 2vw, 1.5rem);
  line-height: 1.4;
  font-weight: 700;
  color: var(--bs-heading-color);
  transition: color 0.3s ease;
}

.article-item-list:hover .article-title-list {
  color: var(--bs-primary);
}

/* 无图模式摘要 */
.article-desc-list {
  font-size: 0.95rem;
  color: var(--bs-secondary-color);
  line-height: 1.6;
  margin: 0.75rem 0 1.25rem 0;
  display: -webkit-box;
  display: -moz-box;
  display: box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -moz-line-clamp: 2;
  -webkit-box-orient: vertical;
  -moz-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 无图模式卡片样式 */
.article-item-list {
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 4px !important;
  border: 1px solid var(--bs-border-color);
  background-color: var(--bs-card-bg);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
}

.article-item-list:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
  border-color: rgba(0, 123, 255, 0.3);
}

/* 元信息 */
.article-meta {
  font-size: 0.85rem;
  color: var(--bs-tertiary-color);
  line-height: 1.4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--bs-border-color);
}

.meta-item {
  position: relative;
  display: flex;
  align-items: center;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.article-item-card:hover .meta-item,
.article-item-list:hover .meta-item {
  color: var(--bs-primary);
}

.meta-item .bi {
  font-size: 0.9em;
  margin-right: 0.4rem;
  line-height: 1;
  vertical-align: middle;
  color: var(--bs-tertiary-color);
  transition: color 0.3s ease;
}

.article-item-card:hover .meta-item .bi,
.article-item-list:hover .meta-item .bi {
  color: var(--bs-primary);
}

/* 分页样式 */
.pagination-container {
  margin-top: 4rem;
  margin-bottom: 4rem;
}

.pagination {
  gap: 0.5rem;
}

.page-item {
  transition: all 0.3s ease;
}

.page-item .page-link {
  border-radius: 10px;
  padding: 0.6rem 1.2rem;
  transition: all 0.3s ease;
  border: 1px solid var(--bs-border-color);
  color: var(--bs-dark);
  font-weight: 500;
  background-color: var(--bs-white);
  min-width: 48px;
  text-align: center;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-item:hover .page-link {
  background-color: var(--bs-light);
  color: var(--bs-dark);
  border-color: var(--bs-border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-item.active .page-link {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: var(--bs-white);
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.25);
}

.page-item.disabled .page-link {
  opacity: 0.6;
  cursor: not-allowed;
  border-color: var(--bs-border-color);
  color: var(--bs-secondary-color);
  background-color: var(--bs-tertiary-bg);
}

.page-item.disabled:hover .page-link {
  background-color: var(--bs-tertiary-bg);
  color: var(--bs-secondary-color);
  border-color: var(--bs-border-color);
  box-shadow: none;
}

/* 分页输入框样式 */
.page-input-container {
  display: flex;
  align-items: center;
  padding: 0 1.2rem;
  background-color: var(--bs-white);
  border: 1px solid var(--bs-border-color);
  border-radius: 10px;
  color: var(--bs-dark);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 48px;
  min-width: 140px;
}

.page-input {
  width: 60px;
  background-color: var(--bs-light);
  border: 1px solid var(--bs-border-color);
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  color: var(--bs-dark);
  text-align: center;
  font-weight: 600;
  margin: 0 0.5rem;
  transition: all 0.3s ease;
  height: 32px;
}

.page-input:focus {
  outline: none;
  background-color: var(--bs-white);
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.page-input::-webkit-inner-spin-button,
.page-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.page-input[type=number] {
  appearance: textfield;
  -moz-appearance: textfield;
}

.page-separator {
  font-weight: 600;
  margin: 0 0.25rem;
}

.page-total {
  font-weight: 600;
}

/* 暗黑模式适配 */
[data-bs-theme=dark] {
  .page-item .page-link {
    background-color: var(--bs-dark);
    border-color: var(--bs-border-color);
    color: var(--bs-light);
  }
  
  .page-item:hover .page-link {
    background-color: var(--bs-secondary);
    color: var(--bs-light);
    border-color: var(--bs-border-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .page-item.active .page-link {
    background-color: var(--bs-primary);
    border-color: var(--bs-primary);
    color: var(--bs-white);
  }
  
  .page-item.disabled .page-link {
    background-color: var(--bs-tertiary-bg);
    border-color: var(--bs-border-color);
    color: var(--bs-secondary-color);
  }
  
  .page-item.disabled:hover .page-link {
    background-color: var(--bs-tertiary-bg);
  }
  
  .page-input-container {
    background-color: var(--bs-dark);
    border-color: var(--bs-border-color);
    color: var(--bs-light);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .page-input {
    background-color: var(--bs-secondary);
    border-color: var(--bs-border-color);
    color: var(--bs-light);
  }
  
  .page-input:focus {
    background-color: var(--bs-dark);
    border-color: var(--bs-primary);
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
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
@media (max-width: 1200px) {
  .grid-article-list {
    gap: 1.5rem;
  }
}

@media (max-width: 992px) {
  .grid-article-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .grid-article-list {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }
  .article-item-card {
    min-width: 160px;
  }
  .article-content {
    padding: 1.25rem !important;
  }
  
  .article-title {
    font-size: 1rem;
  }
  
  .article-desc {
    font-size: 0.85rem;
  }
  
  .article-meta {
    font-size: 0.8rem;
  }
}

@media (max-width: 576px) {
  .grid-article-list {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  
  .article-title {
    font-size: 1.1rem;
  }
  
  .article-meta {
    font-size: 0.8rem;
  }
  .article-cover {
    padding-top: 56.25%;
  }
}

/* 暗黑模式适配 */
[data-bs-theme=dark] {
  /* 加载动画 */
  .article-cover-img:not([src]) {
    background: linear-gradient(90deg, var(--bs-secondary-bg) 25%, var(--bs-tertiary-bg) 50%, var(--bs-secondary-bg) 75%);
  }
  
  /* 悬停效果 */
  .article-item-card:hover,
  .article-item-list:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    border-color: rgba(0, 123, 255, 0.4);
  }
  
  /* 置顶标识 */
  .sticky-badge {
    background: linear-gradient(135deg, #ff8787, #ff6b6b);
    box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
  }
  
  /* 加载失败的图片样式 */
  .article-cover-img.lazy-error::after {
    color: var(--bs-tertiary-color);
  }
}
</style>