<template>
  <div class="tags-page-wrapper">
    <!-- 加载状态 -->
    <div v-if="loading" class="page-loading">
      <div class="spinner-border text-info fs-4" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="card  shadow-sm p-4 mt-2">
      <p class="mb-0 fw-normal">{{ errorMsg }}</p>
    </div>

    <!-- 标签页面主体 -->
    <div v-else class="tags-main">
      <!-- 标签列表页结构 -->
      <div v-if="!currentTag" class="tags-list-page">
        <!-- 标签总数统计 -->
        <div class="tags-count card  shadow-sm p-4 mt-2">
          <div class="tags-count-header">
            <h2 class="tags-count-title fw-bold">标签 <span class="text-sm text-muted">({{ totalTags }})</span></h2>
          </div>
        </div>
        <!-- 标签卡片网格 -->
        <div class="tags-grid card  shadow-sm p-4 mt-2">
          <div class="tags-grid-container">
            <div 
              v-for="tag in tags" 
              :key="tag.id" 
              class="tag-card"
              @click="selectTag(tag.id)"
            >
              <div class="tag-card-inner">
                <!-- 标签头像 -->
                <div class="tag-avatar">
                  <img 
                    :src="tag.avatar || defaultCover" 
                    :alt="tag.name"
                    class="tag-avatar-img"
                    @error="handleImageError"
                  >
                </div>
                <!-- 标签信息 -->
                <div class="tag-card-body">
                  <h3 class="tag-card-title">{{ tag.name }}</h3>
                  <p v-if="tag.description" class="tag-card-description">{{ tag.description }}</p>
                  <div class="tag-card-footer">
                    <span class="tag-article-count">{{ tag.articleCount || 0 }} 篇文章</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 标签分页 -->
        <div v-if="totalTags > 0" class="tag-pagination-container mt-4">
          <nav aria-label="Tag page navigation">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: tagCurrentPage === 1 }">
                <button class="page-link" @click="changeTagPage(tagCurrentPage - 1)">
                  <span aria-hidden="true">&laquo;</span>
                </button>
              </li>
              <li class="page-item active">
                <span class="page-link">{{ tagCurrentPage }} / {{ tagPageCount }}</span>
              </li>
              <li class="page-item" :class="{ disabled: tagCurrentPage === tagPageCount }">
                <button class="page-link" @click="changeTagPage(tagCurrentPage + 1)">
                  <span aria-hidden="true">&raquo;</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      
      <!-- 单个标签页结构 -->
      <div v-else class="single-tag-page">
        <!-- 标签详情 -->
        <div class="tag-info card  shadow-sm p-4 mt-2">
          <div class="tag-info-inner">
            <!-- 标签头像 -->
            <div class="tag-info-avatar">
              <img 
                :src="currentTag.avatar || defaultCover" 
                :alt="currentTag.name"
                class="tag-info-avatar-img"
                @error="handleImageError"
              >
            </div>
            <!-- 标签信息 -->
            <div class="tag-info-content">
              <h1 class="tag-title fw-bold mb-3">{{ currentTag.name }} <span class="text-sm text-muted">({{ currentTag.articleCount || 0 }})</span></h1>
              <p class="tag-description text-muted mb-4">
                {{ currentTag.description || '该标签无描述' }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 文章列表 -->
      <div v-if="currentTag" :class="['article-list-container mt-2', hasImageMode ? 'grid-article-list' : 'list-article-list']">
        <div v-if="articles.length === 0" class="card  shadow-sm p-4 text-center col-12">
          <i class="bi bi-file-earmark-text text-muted fs-3 mb-2"></i>
          <p class="mb-0 text-muted">该标签下暂无文章</p>
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
                :src="getCoverImg(article)" 
                :alt="article.title" 
                class="article-cover-img w-100 h-100 object-cover"
                loading="lazy"
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
      <div v-if="currentTag && total > 0" class="pagination-container mt-4">
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
import { usePageTitle } from '@/utils/usePageTitle'

// 定义组件属性
const props = defineProps({
  id: {
    type: [String, Number],
    default: null
  }
})

// 导入本地图片
import defaultCover from '@/assets/img/fm.avif'
import { useCommStore } from '@/store/comm'

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
const tags = ref([])
const tagsCount = ref(0)
const currentTag = ref(null)
const currentTagId = ref(null)
const articles = ref([])
const currentPage = ref(1)
const total = ref(0)
const limit = ref(10)
// 标签分页相关
const tagCurrentPage = ref(1)
const tagPageSize = ref(10)
const totalTags = ref(0)
const tagPageCount = computed(() => {
  return Math.ceil(totalTags.value / tagPageSize.value)
})
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

// 获取封面图片
const getCoverImg = (article) => {
  // 1. 优先使用文章自身封面
  if (article.covers && article.covers.trim() !== '') {
    return article.covers
  }
  
  // 2. 尝试从result中获取封面
  if (article.result && article.result.covers && article.result.covers.trim() !== '') {
    return article.result.covers
  }
  
  // 3. 尝试从covers字段的其他可能位置获取
  if (article.cover && article.cover.trim() !== '') {
    return article.cover
  }
  
  // 4. 使用导入的本地默认封面图片
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

// 获取标签列表
const getTagsList = async () => {
  try {
    // 缓存键包含页码信息，确保不同页码的标签列表有不同的缓存
    const cacheKey = `tags_list_page_${tagCurrentPage.value}_${tagPageSize.value}`
    const cacheExpire = 60 // 缓存60分钟
    
    // 尝试从缓存获取标签列表
    let tagsList = cache.get(cacheKey)
    
    // 如果缓存不存在，从API获取
    if (!tagsList) {
      // 参考分类页面的实现方式，从API获取标签列表
      // 使用URL参数的形式直接请求API，确保分页参数被正确处理
      const apiUrl = `/api/tags/all?page=${tagCurrentPage.value}&limit=${tagPageSize.value}&order=create_time+desc&cache=false`
      let res = await request.get(apiUrl)

      if (res.code === 200 && res.data) {
        if (res.data.data && res.data.data.length > 0) {
          tagsList = res.data.data
        } else if (Array.isArray(res.data)) {
          tagsList = res.data
        } else {
          tagsList = []
        }
        // 更新标签总数
        totalTags.value = res.data.count || tagsList.length
        tagsCount.value = tagsList.length
        // 缓存标签列表
        cache.set(cacheKey, tagsList, cacheExpire)
        // 缓存标签总数
        cache.set('tags_total_count', totalTags.value, cacheExpire)
      } else {
        tagsList = []
        totalTags.value = 0
        tagsCount.value = 0
        console.error('获取标签列表失败:', res.msg || '未知错误')
      }
    } else {
      // 从缓存获取时，更新标签总数
      totalTags.value = cache.get('tags_total_count') || tagsList.length
      tagsCount.value = tagsList.length
    }

    // 为每个标签获取文章数量
    for (const tag of tagsList) {
      await getTagArticleCount(tag)
    }

    tags.value = tagsList
    // 更新标签总数
    tagsCount.value = tagsList.length
    
    // 移除默认选择第一个标签的逻辑，现在通过路由参数或手动导航选择标签
  } catch (err) {
    tags.value = []
    tagsCount.value = 0
    // console.error('获取标签列表失败:', err)
  }
}

// 获取标签文章数量
const getTagArticleCount = async (tag) => {
  try {
    // 缓存键
    const cacheKey = `tag_article_count_${tag.id}`
    const cacheExpire = 30 // 缓存30分钟
    
    // 尝试从缓存获取
    const cachedCount = cache.get(cacheKey)
    if (cachedCount !== null) {
      tag.articleCount = cachedCount
      return
    }
    
    // 参考分类页面的实现方式，使用like参数
    const like = `tags|%7C${tag.id}%7C`;
    const apiUrl = `/api/article/count?like=${like}`;
    
    const response = await request.get(apiUrl);
    
    if (response.code === 200) {
      tag.articleCount = response.data || 0
      // 缓存文章数量
      cache.set(cacheKey, tag.articleCount, cacheExpire)
    } else {
      tag.articleCount = 0
      console.error('获取标签文章数量失败:', response.msg)
    }
  } catch (err) {
    tag.articleCount = 0
    console.error('获取标签文章数量失败:', err)
  }
}

// 获取标签下的文章列表
const getTagArticles = async (tagId, page = 1) => {
  try {
    // 缓存键
    const cacheKey = `tag_articles_${tagId}_page_${page}_limit_${limit.value}`
    const cacheExpire = 30 // 缓存30分钟
    
    // 尝试从缓存获取文章列表
    const cachedArticles = cache.get(cacheKey)
    if (cachedArticles) {
      articles.value = cachedArticles.data || []
      total.value = cachedArticles.total || 0
      // 数据更新后，观察新图片
      observeLazyImages()
      return
    }
    
    // 参考分类页面的实现方式，使用like参数
    const like = `tags|%7C${tagId}%7C`;
    const apiUrl = `/api/article/all?like=${like}&page=${page}&limit=${limit.value}&order=create_time+desc&cache=false`;
    
    const res = await request.get(apiUrl);

    if (res.code === 200) {
      // 处理不同的数据结构
      let articlesData = []
      let totalCount = 0
      
      if (res.data && res.data.data) {
        // 文章数组在data.data中
        articlesData = res.data.data;
        totalCount = res.data.count || 0;
      } else if (res.data && Array.isArray(res.data)) {
        // 直接是文章数组
        articlesData = res.data;
        totalCount = res.count || 0;
      }
      
      articles.value = articlesData
      total.value = totalCount
      
      // 缓存文章列表
      cache.set(cacheKey, {
        data: articlesData,
        total: totalCount
      }, cacheExpire)
      
      // 数据更新后，观察新图片
      observeLazyImages();
    } else {
      articles.value = [];
      total.value = 0;
      console.error('API返回错误:', res.msg);
    }
  } catch (err) {
    articles.value = [];
    total.value = 0;
    console.error('获取标签文章失败:', err);
  }
};

// 选择标签
const selectTag = (tagId) => {
  // 导航到单个标签页面
  router.push(`/tag/${tagId}`)
}

// 切换分页
const changePage = (page) => {
  if (page < 1 || page > pageCount.value) return
  currentPage.value = page
  if (currentTagId.value) {
    getTagArticles(currentTagId.value, page)
  }
}

// 切换标签分页
const changeTagPage = (page) => {
  if (page < 1 || page > tagPageCount.value) return
  tagCurrentPage.value = page
  // 重新获取标签列表
  getTagsList()
}

// 从路由参数获取标签ID并显示对应标签
const loadTagFromProps = async (tagId) => {
  if (!tagId) return
  
  // 重置标签状态
  currentTag.value = null
  currentTagId.value = null
  
  try {
    // 缓存键
    const cacheKey = `tag_detail_${tagId}`
    const cacheExpire = 60 // 缓存60分钟
    
    // 尝试从缓存获取标签详情
    const cachedTag = cache.get(cacheKey)
    if (cachedTag) {
      currentTagId.value = cachedTag.id
      currentTag.value = cachedTag
      setDynamicTitle(cachedTag.name)
      // 获取标签文章列表
      await getTagArticles(tagId, 1)
      return
    }
    
    // 直接从API获取标签详情
    const apiUrl = `/api/tags/all?where=${encodeURIComponent(JSON.stringify({ id: tagId }))}&cache=false`
    const response = await request.get(apiUrl)
    
    if (response.code === 200 && response.data) {
      // 处理不同的数据结构
      let tag = null
      if (response.data.data && response.data.data.length > 0) {
        tag = response.data.data[0]
      } else if (Array.isArray(response.data)) {
        tag = response.data[0]
      }
      
      if (tag) {
        currentTagId.value = tag.id
        currentTag.value = tag
        setDynamicTitle(tag.name)
        // 缓存标签详情
        cache.set(cacheKey, tag, cacheExpire)
        // 获取标签文章数量
        await getTagArticleCount(tag)
        // 获取标签文章列表
        await getTagArticles(tag.id, 1)
      } else {
        // 如果标签不存在，显示错误信息
        error.value = true
        errorMsg.value = '未找到该标签，可能已被删除或参数错误'
        setDynamicTitle('标签不存在')
      }
    } else {
      error.value = true
      errorMsg.value = '获取标签信息失败'
      setDynamicTitle('标签不存在')
    }
  } catch (err) {
    error.value = true
    errorMsg.value = '网络异常，请检查网络后刷新页面'
    setDynamicTitle('网络异常')
  }
}

// 初始化页面
const initPage = async () => {
  loading.value = true
  error.value = false
  errorMsg.value = ''
  currentTag.value = null
  currentTagId.value = null
  articles.value = []
  total.value = 0
  currentPage.value = 1
  
  try {
    // 获取标签列表
    await getTagsList()
    
    // 检查是否有路由参数中的标签ID
    const tagIdFromRoute = route.params.id
    if (tagIdFromRoute) {
      await loadTagFromProps(tagIdFromRoute)
    } else {
      // 如果没有标签ID，更新页面标题为"标签"
      setDynamicTitle('标签')
    }
  } catch (err) {
    error.value = true
    errorMsg.value = '网络异常，请检查网络后刷新页面'
    // console.error('初始化页面失败:', err)
    // 更新页面标题
    setDynamicTitle('网络异常')
  } finally {
    loading.value = false
  }
}

// 监听路由参数变化
watch(
  () => route.params.id,
  async (newId) => {
    // 当路由参数变化时，重新初始化页面
    await initPage()
  },
  { immediate: false }
)

// 页面挂载初始化
onMounted(async () => {
  // 加载显示模式设置
  await loadDisplayMode()
  
  // 初始化Intersection Observer
  initIntersectionObserver()
  
  // 初始化页面
  await initPage()
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

/* 标签标题 */
.tag-title {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  line-height: 1.3;
  font-weight: 700;
  margin-bottom: 0.75rem !important;
}

/* 标签描述 */
.tag-description {
  font-size: 1.1rem;
  line-height: 1.5;
  margin-bottom: 0 !important;
}

/* 标签总数统计 */
.tags-count-title {
  font-size: clamp(1.5rem, 4vw, 2rem);
  line-height: 1.3;
  font-weight: 700;
}

/* 标签卡片网格 */
.tags-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* 标签卡片 */
.tag-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.tag-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.tag-card-inner {
  padding: 1.5rem;
}

/* 标签头像 */
.tag-avatar {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  overflow: hidden;
  background-color: #f8f9fa;
}

.tag-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.tag-avatar-img:hover {
  transform: scale(1.1);
}

/* 标签卡片内容 */
.tag-card-body {
  text-align: center;
}

.tag-card-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.tag-card-description {
  font-size: 0.9rem;
  color: #6c757d;
  margin-bottom: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-card-footer {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.tag-article-count {
  font-size: 0.85rem;
  color: #868e96;
}

/* 单个标签页结构 */
.tag-info-inner {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.tag-info-avatar {
  flex-shrink: 0;
}

.tag-info-avatar-img {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 标签信息内容 */
.tag-info-content {
  flex-grow: 1;
  min-width: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .tag-info-inner {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .tag-info-avatar-img {
    width: 80px;
    height: 80px;
  }
  
  .tag-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  
  .tag-description {
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
  
  .tag-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }
  
  .tag-description {
    font-size: 1rem;
  }
  
  /* 标签卡片网格响应式调整 */
  .tags-grid-container {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
  
  /* 标签头像响应式调整 */
  .tag-avatar {
    width: 60px;
    height: 60px;
  }
  
  .tag-info-avatar {
    width: 100px;
    height: 100px;
  }
  
  /* 标签卡片内容响应式调整 */
  .tag-card-inner {
    padding: 1.2rem;
  }
  
  .tag-card-title {
    font-size: 1.1rem;
  }
  
  .tag-card-description {
    font-size: 0.85rem;
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
  
  /* 标签卡片网格响应式调整 */
  .tags-grid-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  /* 标签头像响应式调整 */
  .tag-avatar {
    width: 50px;
    height: 50px;
  }
  
  .tag-info-avatar {
    width: 80px;
    height: 80px;
  }
  
  /* 标签卡片内容响应式调整 */
  .tag-card-inner {
    padding: 1rem;
  }
  
  .tag-card-title {
    font-size: 1rem;
  }
  
  .tag-card-description {
    font-size: 0.8rem;
  }
  
  .tag-article-count {
    font-size: 0.75rem;
  }
}

/* 暗黑模式适配 */
[data-bs-theme=dark] {
  /* 标签标题和描述 */
  .tag-title {
    color: var(--bs-heading-color);
  }
  
  .tag-description {
    color: var(--bs-secondary-color);
  }
  
  /* 标签卡片 */
  .tag-card {
    background-color: var(--bs-body-bg);
    border-color: var(--bs-border-color);
  }
  
  .tag-card-title {
    color: var(--bs-heading-color);
  }
  
  .tag-card-description {
    color: var(--bs-secondary-color);
  }
  
  .tag-article-count {
    color: var(--bs-tertiary-color);
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
  
  .tag-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
}
</style>