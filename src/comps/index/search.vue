<template>
  <!-- 搜索组件 -->
  <div>
    <!-- 搜索模态框 -->
    <transition name="modal-fade" mode="out-in">
      <div 
        v-if="state.item.dialog"
        class="modal fade show"
        style="display: block;"
        tabindex="-1" 
        aria-labelledby="searchModalLabel" 
        aria-hidden="false"
        aria-modal="true"
        id="searchModal"
      >
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable" style="max-width: 500px; margin: 1.75rem auto;">
          <div class="modal-content">
            <!-- 模态框头部 -->
            <div class="modal-header">
              <h5 class="modal-title" id="searchModalLabel">搜索</h5>
              <button type="button" class="btn-close" @click="method.hide()" aria-label="Close"></button>
            </div>
            
            <!-- 模态框体部 -->
            <div class="modal-body">
              <!-- 搜索输入框 -->
              <div class="mb-4">
                <!-- 搜索范围选择 -->
                <div class="mb-3">
                  <div class="btn-group w-100" role="group" aria-label="搜索范围">
                    <button
                      type="button"
                      class="btn" 
                      :class="searchScope === 'all' ? 'btn-primary' : 'btn-outline-primary'"
                      @click="searchScope = 'all'"
                    >
                      <i class="bi bi-search"></i> 全部
                    </button>
                    <button
                      type="button"
                      class="btn" 
                      :class="searchScope === 'article' ? 'btn-primary' : 'btn-outline-primary'"
                      @click="searchScope = 'article'"
                    >
                      <i class="bi bi-file-earmark-text"></i> 文章
                    </button>
                    <button
                      type="button"
                      class="btn" 
                      :class="searchScope === 'page' ? 'btn-primary' : 'btn-outline-primary'"
                      @click="searchScope = 'page'"
                    >
                      <i class="bi bi-file-earmark"></i> 页面
                    </button>
                    <button
                      type="button"
                      class="btn" 
                      :class="searchScope === 'tag' ? 'btn-primary' : 'btn-outline-primary'"
                      @click="searchScope = 'tag'"
                    >
                      <i class="bi bi-tag"></i> 标签
                    </button>
                  </div>
                </div>
                <!-- 搜索输入框 -->
                <div class="input-group">
                  <input
                    ref="searchInput"
                    type="text"
                    v-model="searchQuery"
                    class="form-control form-control-lg"
                    :placeholder="getSearchPlaceholder()"
                    @input="handleInput"
                    @keyup.enter="performSearch"
                  >
                  <button
                    class="btn btn-primary"
                    type="button"
                    @click="performSearch"
                    :disabled="loading"
                  >
                    <i class="bi" :class="loading ? 'bi-arrow-clockwise spin' : 'bi-search'"></i>
                    <span class="ms-2">搜索</span>
                  </button>
                </div>
              </div>

              <!-- 搜索内容区域 -->
              <!-- 搜索历史 -->
              <div v-if="!loading && searchQuery === '' && searchHistory.length > 0" class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="text-muted">
                    <i class="bi bi-clock-history me-1"></i>搜索历史
                  </h6>
                  <button @click="clearSearchHistory" class="btn btn-sm btn-outline-secondary">
                    清除历史
                  </button>
                </div>
                <div class="list-group" style="max-height: 300px; overflow-y: auto;">
                  <div
                    v-for="(item, index) in searchHistory"
                    :key="index"
                    class="list-group-item d-flex justify-content-between align-items-center"
                    @click="useSearchHistory(item)"
                    style="cursor: pointer;"
                  >
                    <span>{{ item }}</span>
                    <button @click.stop="searchHistory.splice(index, 1); localStorage.setItem('search-history', JSON.stringify(searchHistory))" class="btn btn-sm text-muted">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 搜索结果 -->
              <div v-else-if="!loading && searchResults.length > 0" class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="text-muted">
                    <i class="bi bi-search me-1"></i>搜索结果 ({{ searchResults.length }})
                  </h6>
                </div>
                <div class="result-list" style="max-height: 400px; overflow-y: auto;">
                  <div
                    v-for="result in searchResults"
                    :key="result.id || result.key"
                    @click="navigateToResult(result)"
                    class="result-item"
                    :class="`result-${result.type}`"
                  >
                    <div class="d-flex align-items-start p-3 rounded-lg transition-all duration-300 hover:bg-primary/5 hover:shadow-sm">
                      <div class="result-icon-container">
                        <i :class="[getResultIcon(result.type), 'result-icon']"></i>
                      </div>
                      <div class="flex-grow-1 ms-3">
                        <div class="d-flex justify-content-between align-items-start">
                          <h5 class="mb-1 font-medium result-title">{{ result.title || result.name }}</h5>
                          <span class="result-type-badge" :class="`badge-${result.type}`">
                            {{ getResultTypeName(result.type) }}
                          </span>
                        </div>
                        <p v-if="result.abstract" class="mb-1 text-xs text-muted line-clamp-2 result-abstract">{{ result.abstract }}</p>
                        <div v-if="result.create_time" class="text-xs text-gray-400 mt-1">
                          {{ formatDate(result.create_time) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 无结果 -->
              <div v-else-if="!loading && searchQuery !== '' && searchResults.length === 0" class="text-center py-8">
                <div class="mb-3">
                  <i class="bi bi-search text-4xl text-muted"></i>
                </div>
                <p class="text-muted">没有找到与 "{{ searchQuery }}" 相关的结果</p>
              </div>

              <!-- 加载中 -->
              <div v-else-if="loading" class="text-center py-8">
                <div class="spinner-border text-primary mb-3" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted">搜索中...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 背景遮罩 -->
    <transition name="backdrop-fade">
      <div 
        v-if="state.item.dialog"
        class="modal-backdrop fade show"
        @click="method.hide()"
      ></div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/request'
import Toast from '@/utils/toast'

// Router
const router = useRouter()

// 状态管理
const state = reactive({
  item: {
    dialog: false
  }
})

// 响应式数据
const searchQuery = ref('')
const loading = ref(false)
const searchResults = ref([])
const searchHistory = ref([])
const debounceTimer = ref(null)
const searchInput = ref(null)
const searchScope = ref('all') // 搜索范围：all, article, page, tag

// 方法定义
const method = {
  // 显示搜索弹窗
  show: () => {
    // console.log('显示搜索弹窗')
    state.item.dialog = true
    // 清空搜索内容
    searchQuery.value = ''
    searchResults.value = []
    
    // 禁止页面滚动
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.height = '100%'
    document.body.style.top = '0'
    document.body.style.left = '0'
    document.body.style.zIndex = '1059'
    
    // 延迟聚焦输入框，避免autofocus被阻止
    setTimeout(() => {
      if (searchInput.value) {
        searchInput.value.focus()
      }
    }, 100)
  },
  
  // 隐藏搜索弹窗
  hide: () => {
    // console.log('隐藏搜索弹窗')
    state.item.dialog = false
    
    // 恢复页面滚动
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
    document.body.style.height = ''
    document.body.style.top = ''
    document.body.style.left = ''
    document.body.style.zIndex = ''
  }
}

// 初始化
onMounted(() => {
  loadSearchHistory()
  // console.log('搜索组件已挂载')
})

// 加载搜索历史
const loadSearchHistory = () => {
  const history = localStorage.getItem('search-history')
  if (history) {
    searchHistory.value = JSON.parse(history)
  }
}

// 保存搜索历史
const saveSearchHistory = (query) => {
  if (!query) return
  
  // 移除重复项
  searchHistory.value = searchHistory.value.filter(item => item !== query)
  
  // 添加到开头
  searchHistory.value.unshift(query)
  
  // 限制历史记录数量
  if (searchHistory.value.length > 10) {
    searchHistory.value = searchHistory.value.slice(0, 10)
  }
  
  // 保存到 localStorage
  localStorage.setItem('search-history', JSON.stringify(searchHistory.value))
}

// 清除搜索历史
const clearSearchHistory = () => {
  searchHistory.value = []
  localStorage.removeItem('search-history')
}

// 使用搜索历史
const useSearchHistory = (query) => {
  searchQuery.value = query
  performSearch()
}

// 输入处理（防抖）
const handleInput = () => {
  clearTimeout(debounceTimer.value)
  debounceTimer.value = setTimeout(() => {
    if (searchQuery.value.trim()) {
      performSearch()
    } else {
      searchResults.value = []
    }
  }, 300)
}

// 执行搜索
const performSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) return
  
  loading.value = true
  searchResults.value = []
  
  try {
    let results = []
    
    // 根据搜索范围执行不同的搜索
    switch (searchScope.value) {
      case 'article':
        // 只搜索文章
        results = await searchArticles(query)
        break
      case 'page':
        // 只搜索页面
        results = await searchPages(query)
        break
      case 'tag':
        // 只搜索标签
        results = await searchTags(query)
        break
      default:
        // 全局搜索：搜索文章、页面和标签
        const [articleResults, pageResults, tagResults] = await Promise.all([
          searchArticles(query),
          searchPages(query),
          searchTags(query)
        ])
        
        // 合并并优化搜索结果
        const optimizedResults = []
        const seenIds = new Set() // 用于去重
        
        // 1. 首先添加文章结果，按相关性排序
        if (articleResults.length > 0) {
          // 按创建时间降序排序
          const sortedArticles = articleResults.sort((a, b) => {
            return new Date(b.create_time || 0) - new Date(a.create_time || 0)
          })
          
          // 去重并添加文章结果
          sortedArticles.forEach(article => {
            if (!seenIds.has(article.id)) {
              seenIds.add(article.id)
              optimizedResults.push(article)
            }
          })
        }
        
        // 2. 然后添加页面结果
        if (pageResults.length > 0) {
          // 按创建时间降序排序
          const sortedPages = pageResults.sort((a, b) => {
            return new Date(b.create_time || 0) - new Date(a.create_time || 0)
          })
          
          // 去重并添加页面结果
          sortedPages.forEach(page => {
            if (!seenIds.has(page.id)) {
              seenIds.add(page.id)
              optimizedResults.push(page)
            }
          })
        }
        
        // 3. 最后添加标签结果，限制数量
        if (tagResults.length > 0) {
          // 限制标签数量
          const relevantTags = tagResults.slice(0, 3)
          
          // 去重并添加标签结果
          relevantTags.forEach(tag => {
            if (!seenIds.has(tag.id)) {
              seenIds.add(tag.id)
              optimizedResults.push(tag)
            }
          })
        }
        
        results = optimizedResults
        break
    }
    
    // 设置搜索结果
    searchResults.value = results
    
    // 保存搜索历史
    saveSearchHistory(query)
  } catch (error) {
    console.error('搜索失败:', error)
    Toast.error('搜索失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 搜索文章
const searchArticles = async (keyword) => {
  try {
    // 构建搜索URL
    const url = `/api/search/article?keyword=${encodeURIComponent(keyword)}&page=1&limit=50`
    const response = await axios.get(url)
    
    // console.log('文章搜索响应:', response)
    
    if (response.code === 200 && response.data) {
      // 检查实际的数据结构
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map(item => ({
          ...item,
          type: 'article'
        }))
      } else if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data.map(item => ({
          ...item,
          type: 'article'
        }))
      }
    }
    return []
  } catch (error) {
    console.error('搜索文章失败:', error)
    return []
  }
}

// 搜索页面
const searchPages = async (keyword) => {
  try {
    // 构建搜索URL
    const url = `/api/search/pages?keyword=${encodeURIComponent(keyword)}&page=1&limit=50`
    const response = await axios.get(url)
    
    // console.log('页面搜索响应:', response)
    
    if (response.code === 200 && response.data) {
      // 检查实际的数据结构
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map(item => ({
          ...item,
          type: 'page'
        }))
      } else if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data.map(item => ({
          ...item,
          type: 'page'
        }))
      }
    }
    return []
  } catch (error) {
    console.error('搜索页面失败:', error)
    return []
  }
}

// 搜索标签
const searchTags = async (keyword) => {
  try {
    // 构建搜索URL
    const url = `/api/search/tags?keyword=${encodeURIComponent(keyword)}&page=1&limit=50`
    const response = await axios.get(url)
    
    // console.log('标签搜索响应:', response)
    
    if (response.code === 200 && response.data) {
      // 检查实际的数据结构
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data.map(item => ({
          ...item,
          type: 'tag'
        }))
      } else if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
        return response.data.data.data.map(item => ({
          ...item,
          type: 'tag'
        }))
      }
    }
    return []
  } catch (error) {
    console.error('搜索标签失败:', error)
    return []
  }
}

// 获取结果图标
const getResultIcon = (type) => {
  switch (type) {
    case 'article':
      return 'bi bi-file-earmark-text'
    case 'page':
      return 'bi bi-file-earmark'
    case 'tag':
      return 'bi bi-tag'
    default:
      return 'bi bi-search'
  }
}

// 获取结果类型的中文名称
const getResultTypeName = (type) => {
  switch (type) {
    case 'article':
      return '文章'
    case 'page':
      return '页面'
    case 'tag':
      return '标签'
    default:
      return '未知'
  }
}

// 获取搜索占位符
const getSearchPlaceholder = () => {
  switch (searchScope.value) {
    case 'article':
      return '搜索文章...'
    case 'page':
      return '搜索页面...'
    case 'tag':
      return '搜索标签...'
    default:
      return '搜索文章、页面或标签...'
  }
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return ''
  
  // 处理秒级时间戳（转换为毫秒级）
  const timestampMs = typeof timestamp === 'number' ? timestamp * 1000 : timestamp
  const date = new Date(timestampMs)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) return ''
  
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// 导航到结果
const navigateToResult = (result) => {
  switch (result.type) {
    case 'article':
      if (result.id) {
        router.push(`/archives/${result.id}`)
      }
      break
    case 'page':
      if (result.key) {
        router.push(`/${result.key}`)
      } else {
        Toast.error('页面路径无效，无法跳转')
      }
      break
    case 'tag':
      // 假设标签页面的路由是 /tag/:id
      if (result.id) {
        router.push(`/tag/${result.id}`)
      }
      break
    default:
      break
  }
  method.hide()
}

// 清理
const cleanup = () => {
  clearTimeout(debounceTimer.value)
}

// 生命周期钩子
onUnmounted(() => {
  cleanup()
  
  // 确保在组件卸载时恢复页面滚动
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
  document.body.style.height = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.zIndex = ''
})

// 初始化
onMounted(() => {
  loadSearchHistory()
  // console.log('搜索组件已挂载')
})

// 导出方法
defineExpose({
  show: method.show,
  hide: method.hide
})
</script>

<style scoped>
/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

/* 动画 */
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

/* 搜索结果样式 */
.result-list {
  border-radius: 0.5rem;
  overflow: hidden;
}

.result-item {
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.result-item:hover {
  transform: translateY(-1px);
}

.result-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.result-icon {
  font-size: 1.25rem;
}

.result-article .result-icon-container {
  background-color: #e3f2fd;
}

.result-article .result-icon {
  color: #2196f3;
}

.result-page .result-icon-container {
  background-color: #e8f5e8;
}

.result-page .result-icon {
  color: #4caf50;
}

.result-tag .result-icon-container {
  background-color: #fff3e0;
}

.result-tag .result-icon {
  color: #ff9800;
}

.result-type-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-weight: 500;
}

.badge-article {
  background-color: #e3f2fd;
  color: #1976d2;
}

.badge-page {
  background-color: #e8f5e8;
  color: #388e3c;
}

.badge-tag {
  background-color: #fff3e0;
  color: #f57c00;
}

/* 文本截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 过渡效果 */
.transition-all {
  transition: all 0.3s ease;
}

.duration-300 {
  transition-duration: 300ms;
}

/* 阴影效果 */
.hover\:shadow-sm:hover {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 背景色效果 */
.hover\:bg-primary\/5:hover {
  background-color: rgba(13, 110, 253, 0.05);
}

/* 字体样式 */
.font-medium {
  font-weight: 500;
}

/* 标题样式 */
.result-title {
  font-size: 1rem;
  line-height: 1.4;
}

/* 摘要样式 */
.result-abstract {
  font-size: 0.75rem;
  line-height: 1.4;
}

/* 文本颜色 */
.text-gray-400 {
  color: #9ca3af;
}

/* 响应式设计 */
@media (max-width: 576px) {
  .result-icon-container {
    width: 32px;
    height: 32px;
  }
  
  .result-icon {
    font-size: 1rem;
  }
  
  .result-item .p-3 {
    padding: 0.75rem;
  }
}
</style>