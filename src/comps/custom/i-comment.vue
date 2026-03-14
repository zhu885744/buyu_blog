<!-- src/comps/CommentList.vue 通用评论组件 -->
<template>
  <div class="card shadow-sm bg-body-tertiary">
    <!-- 评论区标题：接收props的评论数，动态展示 -->
    <div class="card-header bg-transparent">
      <h3 class="h5 fw-bold mt-2">
        <i class="bi bi-chat-dots me-2"></i>
        评论 ({{ commentCount || 0 }})
      </h3>
    </div>
    <div class="card-body">
      <!-- 评论输入框：仅登录状态显示 -->
      <div class="mb-5" v-if="isLogin">
        <textarea 
          v-model="commentInput"
          class="form-control border border-secondary-subtle bg-body" 
          rows="3" 
          placeholder="请输入你的评论..."
          :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
        ></textarea>
        <div class="text-end mt-1">
          <small class="text-muted" :class="{ 'text-danger': commentInput.length > (commentConfig.max_length || 500) }">
            {{ commentInput.length }} / {{ commentConfig.max_length || 500 }}
          </small>
        </div>
        
        <!-- 表情选择面板 -->
        <div v-if="showEmojiPicker" class="emoji-picker-container mt-2 p-3 border bg-body mb-3" :class="{ 'bg-dark border-dark-subtle': isDarkMode }">
          <div class="d-flex flex-wrap gap-2">
            <button 
              v-for="(emoji, index) in emojis" 
              :key="index"
              @click="insertEmoji(emoji)"
              class="btn btn-sm btn-outline-secondary rounded-2 emoji-item"
              :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
        
        <!-- 按钮区域：表情按钮和发布评论按钮在同一行 -->
        <div class="d-flex gap-2 mt-3">
          <button 
            @click="toggleEmojiPicker"
            class="btn btn-outline-secondary btn-sm px-4 emoji-button"
            :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
          >
            <i class="bi bi-emoji-smile me-1"></i> 表情
          </button>
          <button 
            @click="handlePublish"
            class="btn btn-primary px-4 publish-btn flex-grow-1"
            :disabled="!commentInput.trim() || isCommenting"
            :class="{ 'publishing': isCommenting }"
          >
            <span v-if="isCommenting" class="d-flex align-items-center justify-content-center">
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              发布中...
            </span>
            <span v-else>
              <i class="bi bi-paper-plane-fill me-1"></i> 发布评论
            </span>
          </button>
        </div>
      </div>

      <!-- 未登录引导区：Bootstrap 深色模式适配 -->
      <div class="mb-5 p-4 bg-body text-center border" v-else>
        <i class="bi bi-person-circle fs-3  mb-2"></i>
        <p class="mb-3 text-muted">登录后即可发表评论～</p>
        <div class="d-flex gap-2 justify-content-center">
          <button 
            @click="handleToLogin()"
            class="btn btn-primary btn-sm px-4"
          >
            登录
          </button>
          <button 
            @click="handleToRegister()"
            class="btn btn-outline-primary btn-sm px-4"
          >
            注册
          </button>
        </div>
      </div>

      <!-- 评论加载状态 -->
      <div v-if="loading" class="py-5">
        <!-- 骨架屏 -->
        <div class="comment-skeleton" v-for="i in 3" :key="i">
          <div class="d-flex align-items-start mb-3">
            <div class="skeleton-avatar rounded-circle me-3"></div>
            <div class="flex-grow-1">
              <div class="skeleton-line skeleton-line-short mb-2"></div>
              <div class="skeleton-line skeleton-line-sm mb-1"></div>
            </div>
          </div>
          <div class="skeleton-line skeleton-line-medium mb-2"></div>
          <div class="skeleton-line skeleton-line-long mb-3"></div>
          <div class="d-flex gap-2">
            <div class="skeleton-button skeleton-button-small"></div>
            <div class="skeleton-button skeleton-button-small"></div>
          </div>
        </div>
      </div>

      <!-- 评论列表：接收props的评论数据，无数据时展示提示 -->
      <div class="comments-list" v-else-if="processedCommentList.length > 0">
        <div 
          class="comment-item pb-4 mb-4 border-bottom border-secondary-subtle animate-fade-in"
          :class="{ 'comment-new': item.isNew }"
          v-for="(item, index) in processedCommentList" 
          :key="item.id || index"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="d-flex align-items-start mb-3">
            <img 
              :src="item.avatar || 'https://picsum.photos/60/60'" 
              class="avatar rounded-circle me-3 border border-light shadow-sm" 
              alt="用户头像"
              style="width: 50px; height: 50px; object-fit: cover;"
            >
            <div class="flex-grow-1">
              <h6 class="fw-semibold mb-1">
                <router-link v-if="item.authorId" :to="`/author/${item.authorId}`" class="text-decoration-none ">
                  {{ item.nickname || '匿名用户' }}
                </router-link>
                <span v-else>{{ item.nickname || '匿名用户' }}</span>
                <span v-if="item.level" class="badge bg-secondary text-white ms-2 rounded-pill">Lv.{{ item.level }} {{ item.levelName }}</span>
                <span v-if="item.isAuthor" class="badge bg-primary text-white ms-2 rounded-pill">作者</span>
              </h6>
              <small class="text-muted">{{ item.time || '未知时间' }}</small>
            </div>
          </div>
          <p class="mb-3 px-2 py-1 bg-body-tertiary" v-html="item.content"></p>
          
          <!-- 回复和点赞按钮组：优化交互 -->
          <div class="d-flex gap-2">
            <button 
              class="btn btn-sm btn-outline-primary" 
              @click="toggleReplyForm(index)"
              v-if="isLogin"
            >
              <i class="bi bi-reply-fill me-1"></i> 回复
            </button>
            <button 
              class="btn btn-sm btn-outline-secondary disabled" 
              v-else
              data-bs-toggle="tooltip"
              data-bs-title="登录后可回复"
            >
              <i class="bi bi-reply-fill me-1"></i> 回复
            </button>
            <!-- 点赞/点踩按钮 -->
            <button 
              class="btn btn-sm" 
              :class="getLikeStatus(item.id) ? 'btn-outline-danger' : 'btn-outline-success'"
              @click="handleCommentLike(item.id)"
              v-if="isLogin"
            >
              <i :class="getLikeStatus(item.id) ? 'bi bi-hand-thumbs-down' : 'bi bi-hand-thumbs-up'"></i>
              <span class="ms-1">{{ getLikeStatus(item.id) ? '点踩' : '点赞' }}</span>
              <span class="ms-1">{{ getLikeCount(item.id) }}</span>
            </button>
            <button 
              class="btn btn-sm btn-outline-secondary disabled" 
              v-else
              data-bs-toggle="tooltip"
              data-bs-title="登录后可点赞"
            >
              <i class="bi bi-hand-thumbs-up"></i>
              <span class="ms-1">点赞</span>
              <span class="ms-1">{{ getLikeCount(item.id) }}</span>
            </button>
          </div>

          <!-- 回复输入框 -->
          <div v-if="showReplyIndex === index || (typeof showReplyIndex === 'string' && showReplyIndex.startsWith(`${index}-`))" class="mt-3 reply-form">
            <textarea 
              v-model="replyInput"
              class="form-control border border-secondary-subtle bg-body" 
              rows="2" 
              placeholder="请输入你的回复..."
              :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
            ></textarea>
            <div class="text-end mt-1">
              <small class="text-muted" :class="{ 'text-danger': replyInput.length > (commentConfig.max_length || 500) }">
                {{ replyInput.length }} / {{ commentConfig.max_length || 500 }}
              </small>
            </div>
            
            <!-- 回复表情选择面板 -->
            <div v-if="showReplyEmojiPicker" class="emoji-picker-container mt-2 mb-3 p-3 border bg-body" :class="{ 'bg-dark border-dark-subtle': isDarkMode }">
              <div class="d-flex flex-wrap gap-2">
                <button 
                  v-for="(emoji, index) in emojis" 
                  :key="index"
                  @click="insertReplyEmoji(emoji)"
                  class="btn btn-sm btn-outline-secondary rounded-2 emoji-item"
                  :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
                >
                  {{ emoji }}
                </button>
              </div>
            </div>
            
            <!-- 按钮区域：表情按钮、发送回复按钮和取消按钮在同一行 -->
            <div class="d-flex gap-2 mt-2">
              <button 
                @click="toggleReplyEmojiPicker"
                class="btn btn-sm btn-outline-secondary px-3 emoji-button"
                :class="{ 'bg-dark border-dark-subtle': isDarkMode }"
              >
                <i class="bi bi-emoji-smile me-1"></i> 表情
              </button>
              <button 
                @click="handleSubmitReply()"
                class="btn btn-sm btn-primary px-3 flex-grow-1"
                :disabled="!replyInput.trim() || isCommenting"
                :class="{ 'publishing': isCommenting }"
              >
                <span v-if="isCommenting" class="d-flex align-items-center justify-content-center">
                  <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  发送中...
                </span>
                <span v-else>
                  <i class="bi bi-reply-fill me-1"></i> 发送回复
                </span>
              </button>
              <button 
                @click="cancelReply"
                class="btn btn-sm btn-outline-secondary px-3"
              >
                取消
              </button>
            </div>
          </div>

          <!-- 评论回复：嵌套展示 -->
          <div 
            class="ms-5 mt-3 pt-3 border-top border-secondary-subtle reply-item"
            v-for="(reply, rIndex) in item.replies" 
            :key="reply.id || rIndex"
          >
            <div class="d-flex align-items-start mb-3">
              <img 
                :src="reply.avatar || 'https://picsum.photos/62/62'" 
                class="avatar rounded-circle me-3 border border-light shadow-sm" 
                alt="回复用户头像"
                style="width: 45px; height: 45px; object-fit: cover;"
              >
              <div class="flex-grow-1">
                <h6 class="fw-semibold mb-1">
                  <router-link v-if="reply.authorId" :to="`/author/${reply.authorId}`" class="text-decoration-none ">
                    {{ reply.nickname || '匿名用户' }}
                  </router-link>
                  <span v-else>{{ reply.nickname || '匿名用户' }}</span>
                  <span v-if="reply.level" class="badge bg-secondary text-white ms-2 rounded-pill">Lv.{{ reply.level }} {{ reply.levelName }}</span>
                  <span v-if="reply.isAuthor" class="badge bg-primary text-white ms-2 rounded-pill">作者</span>
                </h6>
                <small class="text-muted">{{ reply.time || '未知时间' }}</small>
              </div>
            </div>
            <p class="mb-3 px-2 py-1 bg-body-tertiary" v-html="reply.content"></p>
            
            <!-- 回复和点赞按钮组 -->
            <div class="d-flex gap-2">
              <button 
                class="btn btn-sm btn-outline-primary" 
                @click="toggleReplyForm(index, rIndex)"
                v-if="isLogin"
              >
                <i class="bi bi-reply-fill me-1"></i> 回复
              </button>
              <button 
                class="btn btn-sm btn-outline-secondary disabled" 
                v-else
                data-bs-toggle="tooltip"
                data-bs-title="登录后可回复"
              >
                <i class="bi bi-reply-fill me-1"></i> 回复
              </button>
              <!-- 点赞/点踩按钮 -->
              <button 
                class="btn btn-sm" 
                :class="getLikeStatus(reply.id) ? 'btn-outline-danger' : 'btn-outline-success'"
                @click="handleCommentLike(reply.id)"
                v-if="isLogin"
              >
                <i :class="getLikeStatus(reply.id) ? 'bi bi-hand-thumbs-down' : 'bi bi-hand-thumbs-up'"></i>
                <span class="ms-1">{{ getLikeStatus(reply.id) ? '点踩' : '点赞' }}</span>
                <span class="ms-1">{{ getLikeCount(reply.id) }}</span>
              </button>
              <button 
                class="btn btn-sm btn-outline-secondary disabled" 
                v-else
                data-bs-toggle="tooltip"
                data-bs-title="登录后可点赞"
              >
                <i class="bi bi-hand-thumbs-up"></i>
                <span class="ms-1">点赞</span>
                <span class="ms-1">{{ getLikeCount(reply.id) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 无评论提示 -->
      <div v-else class="text-center py-5 text-muted">
        <p class="mb-0 h6">暂无评论，快来抢沙发吧～</p>
      </div>

      <!-- 分页控件 -->
      <div v-if="totalComments > pageSize" class="mt-4">
        <nav aria-label="评论分页">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="handlePageChange(currentPage - 1)" :disabled="currentPage === 1">
                <span aria-hidden="true">&laquo;</span>
              </button>
            </li>
            <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
              <button class="page-link" @click="handlePageChange(page)">
                {{ page }}
              </button>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="handlePageChange(currentPage + 1)" :disabled="currentPage === totalPages">
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
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useCommStore } from '@/store/comm'
import utils from '@/utils/utils'
import request from '@/utils/request'
import Toast from '@/utils/toast'

// 🌟 1. 定义组件接收的props
const props = defineProps({
  articleId: {
    type: [String, Number],
    required: true,
    validator: (val) => String(val).trim() !== ''
  },
  commentCount: {
    type: [String, Number],
    default: 0
  },
  commentList: {
    type: Array,
    default: () => []
  },
  isLogin: {
    type: Boolean,
    required: true,
    default: false
  },
  // 新增：文章作者信息，用于判断评论是否为作者所发
  articleAuthor: {
    type: Object,
    default: () => ({})
  },
  // 新增：接收深色模式状态（可选，自动检测兜底）
  isDarkMode: {
    type: Boolean,
    default: false
  },
  // 新增：分页相关属性
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  totalComments: {
    type: Number,
    default: 0
  },
  // 新增：加载状态
  loading: {
    type: Boolean,
    default: false
  }
})

// 存储
const store = useCommStore()

// 🌟 2. 定义组件向外触发的事件
const emit = defineEmits(['publishComment', 'replyComment', 'toLogin', 'toRegister', 'pageChange'])

// 🌟 3. 组件内部响应式状态
const commentInput = ref('')
const replyInput = ref('')
const showReplyIndex = ref(null)
const replyTarget = ref(null)
// 表情功能相关状态
const showEmojiPicker = ref(false)
const showReplyEmojiPicker = ref(false)
// 自动检测系统深色模式（兜底方案）
const isSystemDark = ref(false)

// 评论点赞状态
const commentLikes = ref(new Map())
const commentLikeCounts = ref(new Map())

// 评论配置
const commentConfig = ref({})
// 速率限制相关
const lastCommentTime = ref(0)
const isCommenting = ref(false)

// 🌟 4. 分页相关计算属性和方法
// 总页数
const totalPages = computed(() => {
  return Math.ceil(props.totalComments / props.pageSize)
})

// 当前页码
const currentPage = computed(() => {
  return props.currentPage
})

// 每页大小
const pageSize = computed(() => {
  return props.pageSize
})

// 总评论数
const totalComments = computed(() => {
  return props.totalComments
})

// 处理页码变化
const handlePageChange = (page) => {
  if (page < 1 || page > totalPages.value) return
  emit('pageChange', page)
}

// 获取评论点赞数的辅助函数
const getLikeCount = (commentId) => {
  return commentLikeCounts.value.get(commentId) || 0
}

// 获取评论点赞状态的辅助函数
const getLikeStatus = (commentId) => {
  return commentLikes.value.get(commentId) || false
}

// 定义常用表情
const emojis = [
  // 颜文字
  '😊', '😂', '😍', '🤔', '😎', '😢', '😡', '👍', '👎', '👏',
  // Emoji表情
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
  '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩'
]

// 获取评论配置
async function getCommentConfig() {
  try {
    const response = await request.get('/api/config/one', {
      key: 'COMMENT'
    })
    if (response.code === 200 && response.data) {
      return response.data.json || {}
    }
    return {}
  } catch (error) {
    console.error('获取评论配置失败:', error)
    return {}
  }
}

// 应用评论配置
function applyCommentConfig() {
  // 速率限制
  applyRateLimit()
  // 评论长度限制
  applyMaxLength()
  // 要求包含中文
  applyChineseRequirement()
  // 敏感词过滤
  applySensitiveFilter()
}

// 应用速率限制
function applyRateLimit() {
  const rateLimit = commentConfig.value.rate_limit || {}
  if (rateLimit.enabled === 1) {
    // 速率限制已在发布评论时处理
  }
}

// 应用评论长度限制
function applyMaxLength() {
  const maxLength = commentConfig.value.max_length || 500
  // 设置输入框的最大长度
  const textarea = document.querySelector('textarea[placeholder="请输入你的评论..."]')
  if (textarea) {
    textarea.maxLength = maxLength
  }
}

// 应用要求包含中文
function applyChineseRequirement() {
  // 中文要求已在发布评论时处理
}

// 应用敏感词过滤
function applySensitiveFilter() {
  // 敏感词过滤已在发布评论时处理
}

// 检查评论内容
function validateCommentContent(content) {
  const config = commentConfig.value
  
  // 检查评论长度
  const maxLength = config.max_length || 500
  if (content.length > maxLength) {
    Toast.error(`评论长度不能超过 ${maxLength} 字`)
    return false
  }
  
  // 检查是否要求包含中文
  if (config.require_chinese === 1) {
    const hasChinese = /[\u4e00-\u9fa5]/.test(content)
    if (!hasChinese) {
      Toast.error('评论内容必须包含中文')
      return false
    }
  }
  
  // 检查敏感词
  if (config.sensitive_filter === 1 && config.sensitive_words) {
    const sensitiveWords = config.sensitive_words
    for (const word of sensitiveWords) {
      if (content.includes(word)) {
        Toast.error('评论内容包含敏感词，请修改后重试')
        return false
      }
    }
  }
  
  return true
}

// 检查速率限制
function checkRateLimit() {
  const rateLimit = commentConfig.value.rate_limit || {}
  if (rateLimit.enabled === 1) {
    const maxCount = rateLimit.max_count || 5
    const timeWindow = rateLimit.time_window || 60
    
    const now = Date.now() / 1000 // 转换为秒
    
    // 检查评论数量限制和时间窗口
    // 从localStorage获取评论计数
    try {
      const commentCount = parseInt(localStorage.getItem('commentCount')) || 0
      const lastResetTime = parseInt(localStorage.getItem('lastResetTime')) || 0
      
      // 检查是否需要重置计数
      if (now - lastResetTime > timeWindow) {
        localStorage.setItem('commentCount', '1')
        localStorage.setItem('lastResetTime', now.toString())
      } else {
        // 检查是否超过最大评论数
        if (commentCount >= maxCount) {
          Toast.error(`在 ${timeWindow} 秒内最多只能发送 ${maxCount} 条评论`)
          return false
        }
        // 增加评论计数
        localStorage.setItem('commentCount', (commentCount + 1).toString())
      }
    } catch (error) {
      console.error('存储评论计数失败:', error)
    }
  }
  return true
}

// 格式化时间函数
const formatTime = (timestamp) => {
  if (!timestamp || timestamp === 0) return '未知时间'
  return utils.timeToDate(timestamp, 'Y-m-d H:i')
}

// 处理@提及的函数
const handleAtMentions = (content) => {
  if (!content) return ''
  // 先将换行符转换为<br>标签
  let processedContent = content.replace(/\n/g, '<br>')
  // 匹配@用户名格式，替换为带颜色的HTML
  return processedContent.replace(/@([\u4e00-\u9fa5\w]+)/g, '<span class="at-mention">@$1</span>')
}

// 提取用户信息的公共函数
const extractUserInfo = (item, articleAuthorId, isReply = false) => {
  // 尝试从不同位置获取等级信息
  let levelName = '';
  
  // 1. 尝试从 result.author.result.level 获取（正确路径）
  if (item.result?.author?.result?.level?.current?.name) {
    levelName = item.result.author.result.level.current.name;
  } 
  // 2. 尝试从 result.author.level 获取
  else if (item.result?.author?.level?.current?.name) {
    levelName = item.result.author.level.current.name;
  }
  // 3. 尝试从 author.result.level 获取
  else if (item.author?.result?.level?.current?.name) {
    levelName = item.author.result.level.current.name;
  }
  // 4. 尝试从 level 获取
  else if (item.level?.current?.name) {
    levelName = item.level.current.name;
  }
  // 5. 尝试从 result.author.result.levelName 获取
  else if (item.result?.author?.result?.levelName) {
    levelName = item.result.author.result.levelName;
  }
  // 6. 尝试从 result.author.levelName 获取
  else if (item.result?.author?.levelName) {
    levelName = item.result.author.levelName;
  }
  // 7. 尝试从 author.levelName 获取
  else if (item.author?.levelName) {
    levelName = item.author.levelName;
  }
  // 8. 尝试从 levelName 获取
  else if (item.levelName) {
    levelName = item.levelName;
  }
  
  // 获取评论作者ID
  const commentAuthorId = item.result?.author?.id || item.author?.id || null;
  // 判断是否为文章作者
  const isCommentAuthor = commentAuthorId && articleAuthorId && String(commentAuthorId) === String(articleAuthorId);
  
  return {
    id: item.id,
    authorId: commentAuthorId,
    avatar: item.result?.author?.avatar?.trim() || item.author?.avatar?.trim() || item.avatar || (isReply ? 'https://picsum.photos/62/62' : 'https://picsum.photos/60/60'),
    nickname: item.result?.author?.nickname || item.author?.nickname || item.nickname || '匿名用户',
    level: item.result?.author?.result?.level?.current?.value || item.result?.author?.level?.current?.value || item.author?.result?.level?.current?.value || item.level?.current?.value || item.level || null,
    levelName: levelName,
    time: formatTime(item.create_time || item.time || item.update_time),
    content: handleAtMentions(item.content || ''),
    isAuthor: isCommentAuthor || item.result?.author?.result?.isAuthor || item.result?.author?.isAuthor || item.author?.result?.isAuthor || item.isAuthor || false
  }
}

// 处理回复数据
const processReplies = (replies, articleAuthorId) => {
  if (!Array.isArray(replies)) return []
  return replies.map(reply => {
    return extractUserInfo(reply, articleAuthorId, true)
  })
}

// 🌟 4. 处理评论数据，适配 API 返回格式
const processedCommentList = computed(() => {
  const articleAuthorId = props.articleAuthor.id;
  return props.commentList.map(item => {
    const userInfo = extractUserInfo(item, articleAuthorId)
    return {
      ...userInfo,
      replies: processReplies(item.replies, articleAuthorId),
      isNew: item.isNew || false // 标记新评论
    }
  })
})

// 🌟 4. 发布评论处理
const handlePublish = async () => {
  const content = commentInput.value.trim()
  if (!content) return
  
  // 检查速率限制
  if (!checkRateLimit()) {
    return
  }
  
  // 验证评论内容
  if (!validateCommentContent(content)) {
    return
  }
  
  isCommenting.value = true
  
  try {
    // 发布评论
    emit('publishComment', {
      articleId: props.articleId,
      content
    })
    
    commentInput.value = ''
  } catch (error) {
    console.error('发布评论失败:', error)
    Toast.error('发布评论失败，请稍后重试')
  } finally {
    isCommenting.value = false
  }
}

// 🌟 5. 切换回复输入框
// 参数说明：
// - index: 一级评论的索引
// - replyIndex: 二级评论（回复）的索引，可选
const toggleReplyForm = (index, replyIndex = null) => {
  // 创建一个唯一的标识符，用于区分不同评论的回复输入框
  const uniqueKey = replyIndex !== null ? `${index}-${replyIndex}` : index
  
  if (showReplyIndex.value === uniqueKey) {
    showReplyIndex.value = null
    replyInput.value = ''
    replyTarget.value = null
  } else {
    showReplyIndex.value = uniqueKey
    let targetComment
    
    if (replyIndex !== null) {
      // 回复二级评论
      const parentComment = processedCommentList.value[index]
      targetComment = parentComment.replies[replyIndex]
    } else {
      // 回复一级评论
      targetComment = processedCommentList.value[index]
    }
    
    replyTarget.value = targetComment
    // 在回复输入框中显示@用户
    replyInput.value = `@${targetComment.nickname} `
    // 自动聚焦回复输入框
    setTimeout(() => {
      const textarea = document.querySelector('textarea[placeholder="请输入你的回复..."]')
      if (textarea) {
        textarea.focus()
        // 将光标移动到输入框末尾
        textarea.setSelectionRange(replyInput.value.length, replyInput.value.length)
      }
    }, 100)
  }
}

// 🌟 6. 提交回复
const handleSubmitReply = async () => {
  const content = replyInput.value.trim()
  if (!content) return
  
  // 检查速率限制
  if (!checkRateLimit()) {
    return
  }
  
  // 验证评论内容
  if (!validateCommentContent(content)) {
    return
  }
  
  // 使用 replyTarget.value.id 作为目标评论的 ID
  const commentId = replyTarget.value?.id
  if (!commentId) return
  
  isCommenting.value = true
  
  try {
    // 提交回复
    emit('replyComment', {
      articleId: props.articleId,
      commentId,
      content
    })
    
    showReplyIndex.value = null
    replyInput.value = ''
    replyTarget.value = null
  } catch (error) {
    console.error('提交回复失败:', error)
    Toast.error('提交回复失败，请稍后重试')
  } finally {
    isCommenting.value = false
  }
}

// 🌟 7. 取消回复
const cancelReply = () => {
  showReplyIndex.value = null
  replyInput.value = ''
  replyTarget.value = null
  showReplyEmojiPicker.value = false
}

// 🌟 8. 表情功能
// 切换评论表情选择面板
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
  showReplyEmojiPicker.value = false
}

// 切换回复表情选择面板
const toggleReplyEmojiPicker = () => {
  showReplyEmojiPicker.value = !showReplyEmojiPicker.value
  showEmojiPicker.value = false
}

// 插入表情到评论输入框
const insertEmoji = (emoji) => {
  commentInput.value += emoji
  // 自动聚焦输入框
  setTimeout(() => {
    const textarea = document.querySelector('textarea[placeholder="请输入你的评论..."]')
    if (textarea) {
      textarea.focus()
    }
  }, 100)
}

// 插入表情到回复输入框
const insertReplyEmoji = (emoji) => {
  replyInput.value += emoji
  // 自动聚焦输入框
  setTimeout(() => {
    const textarea = document.querySelector('textarea[placeholder="请输入你的回复..."]')
    if (textarea) {
      textarea.focus()
    }
  }, 100)
}

// 点击外部关闭表情选择面板
const handleClickOutside = (event) => {
  const emojiPickers = event.target.closest('.emoji-picker-container')
  const emojiButtons = event.target.closest('.emoji-button')
  if (!emojiPickers && !emojiButtons) {
    showEmojiPicker.value = false
    showReplyEmojiPicker.value = false
  }
}

// 组件挂载后添加点击外部事件监听器
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载前移除点击外部事件监听器
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 🌟 8. 处理登录注册
const handleToLogin = () => {
  store.switchAuth('login', true)
}

const handleToRegister = () => {
  store.switchAuth('register', true)
}

// 🌟 9. 评论点赞/点踩功能
const handleCommentLike = async (commentId) => {
  if (!props.isLogin) {
    store.switchAuth('login', true)
    return
  }

  try {
    // 确保commentId有效
    if (!commentId) return

    // 获取当前状态
    const currentState = commentLikes.value.get(commentId) ? 0 : 1
    // console.log('评论点赞操作，当前状态:', currentState)
    // console.log('准备发送的state:', currentState)

    // 获取用户ID
    const userId = store.login.user?.id
    // console.log('当前用户ID:', userId)

    // 调用API
    const res = await request.post('/api/exp/like', {
      bind_id: commentId,
      bind_type: 'comment',
      state: currentState,
      description: '评论点赞',
      uid: userId // 显式传递用户ID
    })

    // console.log('评论点赞API响应:', res)

    if (res.code === 200) {
      // 计算新状态
      const newState = currentState === 1
      // 更新点赞状态
      commentLikes.value.set(commentId, newState)
      // 更新点赞数，确保不小于0
      const currentCount = commentLikeCounts.value.get(commentId) || 0
      const newCount = newState ? currentCount + 1 : Math.max(0, currentCount - 1)
      commentLikeCounts.value.set(commentId, newCount)
      
      // console.log('更新后点赞状态:', newState)
      // console.log('更新后点赞数:', newCount)
      
      // 添加消息提示
      if (newState) {
        Toast.success('点赞成功！')
      } else {
        Toast.success('已取消点赞')
      }
    } else if (res.code === 400 && res.msg === '已经点过赞啦！') {
      // 当API返回"已经点过赞啦！"的错误时，更新点赞状态为true
      commentLikes.value.set(commentId, true)
      // console.log('更新点赞状态为true，因为已经点过赞啦！')
      Toast.info('已经点过赞啦！')
    } else {
      // console.error('评论点赞操作失败，API返回码:', res.code)
      Toast.error(res.msg || '操作失败，请重试')
    }
  } catch (error) {
    // console.error('评论点赞操作失败:', error)
    Toast.error('网络异常，操作失败')
  }
}

// 🌟 10. 获取评论点赞数
const getCommentLikeCount = async (commentId) => {
  try {
    // 确保commentId有效
    if (!commentId) {
      commentLikeCounts.value.set(commentId, 0)
      return
    }
    
    const whereParam = JSON.stringify({ bind_id: commentId, type: 'like', bind_type: 'comment', state: 1 })
    // console.log('获取评论点赞数，commentId:', commentId)
    // console.log('获取评论点赞数，whereParam:', whereParam)
    
    const res = await request.get('/api/exp/count', {
      where: whereParam
    })

    // console.log('获取评论点赞数API响应:', res)
    
    if (res.code === 200) {
      commentLikeCounts.value.set(commentId, res.data || 0)
    } else {
      commentLikeCounts.value.set(commentId, 0)
    }
  } catch (error) {
    // console.error('获取评论点赞数失败:', error)
    commentLikeCounts.value.set(commentId, 0)
  }
}

// 🌟 11. 检查评论是否已点赞
const checkCommentLikeStatus = async (commentId) => {
  if (!props.isLogin) return

  try {
    // 确保commentId有效
    if (!commentId) return
    
    const userId = store.login.user?.id
    if (!userId) return

    const whereParam = JSON.stringify({ uid: userId, bind_id: commentId, type: 'like', bind_type: 'comment', state: 1 })
    // console.log('检查评论点赞状态，commentId:', commentId)
    // console.log('检查评论点赞状态，userId:', userId)
    // console.log('检查评论点赞状态，whereParam:', whereParam)
    
    const res = await request.get('/api/exp/one', {
      where: whereParam
    })

    // console.log('检查评论点赞状态API响应:', res)
    
    if (res.code === 200 && res.data) {
      commentLikes.value.set(commentId, true)
    } else {
      commentLikes.value.set(commentId, false)
    }
  } catch (error) {
    // console.error('检查评论点赞状态失败:', error)
    commentLikes.value.set(commentId, false)
  }
}

// 🌟 12. 初始化评论点赞数据
const initCommentLikeData = async () => {
  if (processedCommentList.value.length === 0) return

  // 获取所有评论和回复的ID
  const allCommentIds = new Set() // 使用Set避免重复ID
  processedCommentList.value.forEach(comment => {
    if (comment.id) {
      allCommentIds.add(comment.id)
    }
    if (comment.replies && comment.replies.length > 0) {
      comment.replies.forEach(reply => {
        if (reply.id) {
          allCommentIds.add(reply.id)
        }
      })
    }
  })

  const commentIdArray = Array.from(allCommentIds)
  if (commentIdArray.length === 0) return

  // 过滤出未缓存的评论ID
  const uncachedIds = commentIdArray.filter(id => !commentLikeCounts.value.has(id))
  
  if (uncachedIds.length > 0) {
    // 批量获取点赞数（如果后端支持）
    // 这里暂时保持单个请求，实际项目中可以实现批量API
    await Promise.all(
      uncachedIds.map(async (id) => {
        await getCommentLikeCount(id)
      })
    )
  }

  // 仅当用户登录时才获取点赞状态
  if (props.isLogin) {
    // 过滤出未检查点赞状态的评论ID
    const unCheckedIds = commentIdArray.filter(id => !commentLikes.value.has(id))
    
    if (unCheckedIds.length > 0) {
      await Promise.all(
        unCheckedIds.map(async (id) => {
          await checkCommentLikeStatus(id)
        })
      )
    }
  }
}

// 🌟 9. 初始化Bootstrap tooltip + 检测系统深色模式
onMounted(async () => {
  // 初始化tooltip
  if (window.bootstrap) {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    tooltipTriggerList.forEach(tooltipTriggerEl => {
      new window.bootstrap.Tooltip(tooltipTriggerEl)
    })
  }

  // 检测系统深色模式（兜底）
  if (!props.isDarkMode) {
    isSystemDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  // 获取评论配置
  const config = await getCommentConfig()
  commentConfig.value = config
  // 应用评论配置
  applyCommentConfig()
  


  // 初始化评论点赞数据
  initCommentLikeData()
})

// 🌟 10. 监听深色模式变化，更新tooltip样式
watch([() => props.isDarkMode, isSystemDark], () => {
  if (window.bootstrap) {
    document.querySelectorAll('.tooltip').forEach(el => {
      el.classList.toggle('tooltip-dark', props.isDarkMode || isSystemDark.value)
    })
  }
})

// 🌟 11. 监听评论列表变化，初始化点赞数据
watch(
  () => processedCommentList.value,
  (newCommentList) => {
    if (newCommentList && newCommentList.length > 0) {
      // console.log('评论列表变化，重新初始化点赞数据')
      initCommentLikeData()
    }
  },
  { deep: true }
)
</script>

<style scoped>
/* 基础样式优化 + 深色模式适配 */
.avatar {
  transition: transform 0.2s ease;
  border: 2px solid rgba(var(--bs-primary-rgb), 0.1);
}

.avatar:hover {
  transform: scale(1.05);
  border-color: rgba(var(--bs-primary-rgb), 0.3);
}

.comment-item {
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: rgba(var(--bs-primary-rgb), 0.01);
}

.comment-item:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.03);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

/* 评论内容样式优化 */
.comment-item p {
  line-height: 1.6;
  font-size: 0.95rem;
  padding: 0.75rem;
  border-radius: 6px;
  background-color: rgba(var(--bs-primary-rgb), 0.02);
  transition: all 0.3s ease;
}

.comment-item p:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.04);
}

/* 回复输入框样式优化 */
.reply-form {
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 1rem;
  background-color: rgba(var(--bs-primary-rgb), 0.02);
}

/* 深色模式专属样式 */
:deep(.bg-dark) {
  --bs-secondary-subtle: #2b2b2b;
  --bs-body-tertiary: #212121;
}

:deep(.tooltip-dark) {
  --bs-tooltip-bg: #333;
  --bs-tooltip-color: #fff;
}

/* 移动端适配增强 */
@media (max-width: 768px) {
  .ms-5 {
    margin-left: 1rem !important;
  }

  .avatar {
    width: 40px !important;
    height: 40px !important;
  }

  .card-body {
    padding: 1rem !important;
  }

  .comment-item {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .comment-item p {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
}

/* 输入框焦点样式优化 */
:deep(textarea:focus) {
  border-color: var(--bs-primary) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25) !important;
  outline: none !important;
}

/* 按钮hover效果增强 */
:deep(.btn-outline-primary:hover) {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(var(--bs-primary-rgb), 0.3);
}

:deep(.btn) {
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

:deep(.btn:hover) {
  transform: translateY(-1px);
}

/* 点赞/点踩按钮动画 */
:deep(.btn-outline-success:hover) {
  background-color: var(--bs-success);
  border-color: var(--bs-success);
  color: white;
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

:deep(.btn-outline-danger:hover) {
  background-color: var(--bs-danger);
  border-color: var(--bs-danger);
  color: white;
  transform: translateY(-1px) scale(1.05);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

/* 按钮点击动画 */
:deep(.btn:active) {
  transform: translateY(0) scale(0.98);
  transition: transform 0.1s ease;
}

/* 评论输入框的焦点动画 */
:deep(textarea:focus) {
  border-color: var(--bs-primary) !important;
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25) !important;
  outline: none !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--bs-primary-rgb), 0.2);
}

/* 表情选择器的动画效果 */
.emoji-picker-container {
  transition: all 0.3s ease;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 5;
  animation: emojiPickerFadeIn 0.3s ease forwards;
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes emojiPickerFadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 回复输入框的展开/收起动画 */
.reply-form {
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 1rem;
  background-color: rgba(var(--bs-primary-rgb), 0.02);
  animation: replyFormSlideIn 0.3s ease forwards;
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes replyFormSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 无评论提示动画 */
:deep(.bi-chat-square-dots) {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* 评论输入框样式优化 */
:deep(.form-control) {
  transition: all 0.3s ease;
  border-radius: 8px;
  font-size: 0.95rem;
  line-height: 1.5;
}

:deep(.form-control:focus) {
  border-color: var(--bs-primary);
  box-shadow: 0 0 0 0.2rem rgba(var(--bs-primary-rgb), 0.25);
  transform: translateY(-1px);
}

/* 回复输入框占位符样式 */
:deep(textarea[placeholder="请输入你的回复..."]) {
  font-size: 0.9rem;
}

/* 评论时间样式优化 */
.comment-item small {
  font-size: 0.8rem;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.comment-item:hover small {
  opacity: 1;
}

/* 徽章样式优化 */
.comment-item .badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  transition: all 0.3s ease;
}

.comment-item:hover .badge {
  transform: scale(1.05);
}

/* 回复评论的样式 */
.reply-item {
  border-left: 3px solid rgba(var(--bs-primary-rgb), 0.2);
  padding-left: 1rem;
  margin-left: 1rem;
  margin-top: 0.75rem;
  transition: all 0.3s ease;
}

.reply-item:hover {
  border-left-color: rgba(var(--bs-primary-rgb), 0.4);
  margin-left: 1.25rem;
}

/* @提及样式 */
:deep(.at-mention) {
  color: var(--bs-primary);
  font-weight: 600;
  text-decoration: none;
}

/* 发布评论按钮样式优化 */
.publish-btn {
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.publish-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(var(--bs-primary-rgb), 0.3);
}

.publish-btn:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

.publish-btn.publishing {
  opacity: 0.8;
  cursor: not-allowed;
}

.publishing .spinner-border {
  animation: spin 1s linear infinite;
}

/* 表情功能样式 */
.emoji-button {
  transition: all 0.3s ease;
  z-index: 10;
}

.emoji-button:hover {
  transform: scale(1.1);
  border-color: var(--bs-primary);
}

.emoji-picker-container {
  transition: all 0.3s ease;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 5;
}

.emoji-item {
  transition: all 0.3s ease;
  font-size: 1.2rem;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.emoji-item:hover {
  transform: scale(1.2);
  border-color: var(--bs-primary);
  background-color: rgba(var(--bs-primary-rgb), 0.1);
}

/* 表情选择面板滚动条样式 */
.emoji-picker-container::-webkit-scrollbar {
  width: 6px;
}

.emoji-picker-container::-webkit-scrollbar-track {
  background: rgba(var(--bs-primary-rgb), 0.1);
  border-radius: 3px;
}

.emoji-picker-container::-webkit-scrollbar-thumb {
  background: rgba(var(--bs-primary-rgb), 0.3);
  border-radius: 3px;
}

.emoji-picker-container::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--bs-primary-rgb), 0.5);
}

/* 深色模式表情样式 */
:deep(.bg-dark) .emoji-item {
  border-color: #444;
  color: #fff;
}

:deep(.bg-dark) .emoji-item:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.2);
}

/* 移动端表情适配 */
@media (max-width: 768px) {
  .emoji-picker-container {
    max-height: 150px;
  }
  
  .emoji-item {
    font-size: 1rem;
    min-width: 32px;
    height: 32px;
  }
  
  .emoji-button {
    bottom: 1rem !important;
    right: 1rem !important;
  }
  
  /* 评论容器响应式调整 */
  .comments-list {
    padding: 0.75rem;
  }
  
  /* 评论项响应式调整 */
  .comment-item {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .comment-item p {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  /* 头像响应式调整 */
  .avatar {
    width: 40px !important;
    height: 40px !important;
  }
  
  /* 回复项响应式调整 */
  .reply-item {
    margin-left: 0.75rem;
    padding-left: 0.75rem;
  }
  
  /* 按钮响应式调整 */
  .btn {
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
  }
  
  /* 输入框响应式调整 */
  .form-control {
    font-size: 0.85rem;
  }
  
  /* 分页按钮响应式调整 */
  .page-item .page-link {
    padding: 0.4rem 0.8rem;
    min-width: 40px;
    height: 40px;
  }
}

/* 平板设备响应式调整 */
@media (min-width: 769px) and (max-width: 992px) {
  .comments-list {
    padding: 0.875rem;
  }
  
  .comment-item {
    padding: 0.875rem;
  }
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

/* 评论容器样式 */
.comments-list {
  padding: 1rem;
  background-color: rgba(var(--bs-primary-rgb), 0.01);
  border-radius: 8px;
  border: 1px solid rgba(var(--bs-primary-rgb), 0.1);
}

/* 评论项淡入动画 */
.animate-fade-in {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 新评论动画效果 */
.comment-new {
  animation: newCommentAnimation 1.5s ease-in-out forwards;
  border-left: 4px solid var(--bs-primary);
  background-color: rgba(var(--bs-primary-rgb), 0.05);
}

@keyframes newCommentAnimation {
  0% {
    background-color: rgba(var(--bs-primary-rgb), 0.2);
    transform: translateY(-5px);
  }
  50% {
    background-color: rgba(var(--bs-primary-rgb), 0.1);
  }
  100% {
    background-color: rgba(var(--bs-primary-rgb), 0.05);
    transform: translateY(0);
  }
}

/* 暗黑模式新评论效果 */
[data-bs-theme=dark] .comment-new {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
  animation: newCommentAnimationDark 1.5s ease-in-out forwards;
}

@keyframes newCommentAnimationDark {
  0% {
    background-color: rgba(var(--bs-primary-rgb), 0.3);
    transform: translateY(-5px);
  }
  50% {
    background-color: rgba(var(--bs-primary-rgb), 0.2);
  }
  100% {
    background-color: rgba(var(--bs-primary-rgb), 0.1);
    transform: translateY(0);
  }
}

/* 分页样式 */
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

/* 骨架屏样式 */
.comment-skeleton {
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  background-color: rgba(var(--bs-primary-rgb), 0.01);
}

.skeleton-avatar {
  width: 50px;
  height: 50px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border: 2px solid rgba(var(--bs-primary-rgb), 0.1);
}

.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
  height: 16px;
}

.skeleton-line-short {
  width: 60%;
  height: 18px;
}

.skeleton-line-sm {
  width: 40%;
  height: 14px;
}

.skeleton-line-medium {
  width: 80%;
}

.skeleton-line-long {
  width: 100%;
}

.skeleton-button {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
  height: 32px;
}

.skeleton-button-small {
  width: 80px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 暗黑模式骨架屏 */
[data-bs-theme=dark] {
  .skeleton-avatar,
  .skeleton-line,
  .skeleton-button {
    background: linear-gradient(90deg, #333 25%, #444 50%, #333 75%);
  }
  
  .comment-skeleton {
    background-color: rgba(var(--bs-primary-rgb), 0.05);
  }
  
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
}
</style>