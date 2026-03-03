<template>
  <!-- 首页顶部公告卡片 -->
  <div class="card mt-2 mb-3 shadow-sm" v-if="noticeList.length > 0">
    <div class="card-body p-0">
      <!-- 公告列表 -->
      <ul class="list-unstyled mb-0">
        <li
          v-for="notice in showNoticeList"
          :key="notice.id"
          class="notice-item d-flex align-items-center py-2 px-3 border-bottom cursor-pointer"
          :class="{'border-light': !isDarkMode, 'border-dark-subtle': isDarkMode}"
          @click="openNoticeModal(notice)"
        >
          <span class="badge text-bg-danger me-2"><i class="bi bi-megaphone"></i></span>
          <span class="fw-medium fs-7 text-truncate flex-grow-1">{{ notice.title }}</span>
          <span class="ms-2 text-muted x-small text-nowrap">{{ formatDate(notice.create_time) }}</span>
        </li>
      </ul>

      <!-- 展开/折叠按钮 -->
      <div v-if="noticeList.length > 1" class="text-center py-2">
        <button
          class="btn btn-link text-danger fs-7 p-0 text-decoration-none"
          @click="toggleExpand"
        >
          {{ isExpand ? '折叠公告' : `查看更多(${noticeList.length - 1}条)` }}
          <i class="bi ms-1" :class="isExpand ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- 空状态 -->
  <div v-else class="card text-center py-4 mt-2">
    <p class="mb-0 text-muted fs-7">暂无系统公告</p>
  </div>

  <!-- 公告弹窗 -->
  <div class="modal fade" id="noticeModal" tabindex="-1" aria-hidden="true" ref="noticeModal">
    <div class="modal-dialog modal-dialog-centered modal-md">
      <div class="modal-content shadow">
        <div class="modal-header border-bottom py-3 px-4">
          <h5 class="modal-title d-flex align-items-center mb-0 text-danger-emphasis">
            <i class="bi bi-megaphone me-2"></i>
            {{ currentNotice?.title || '系统公告' }}
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="关闭"></button>
        </div>

        <div class="modal-body p-4">
          <!-- 公告内容 -->
          <div class="notice-content p-3 scrollable-content">
            <div v-html="formatContent(currentNotice?.content)" class="notice-text"></div>
            
            <!-- 查看详情链接 -->
            <div v-if="currentNotice?.url" class="text-center mt-4">
              <a
                :href="currentNotice.url"
                :target="currentNotice.target || '_blank'"
                class="btn btn-outline-danger rounded-pill px-4 text-decoration-none w-100"
              >
                <i class="bi bi-link-45deg me-1"></i>查看详情
              </a>
            </div>
          </div>

          <!-- 公告信息 -->
          <div class="notice-meta d-flex align-items-center flex-wrap gap-2 mt-4">
            <span class="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle">
              <i class="bi bi-tag me-1"></i> {{ currentNotice?.type || '系统通知' }}
            </span>
            <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle">
              <i class="bi bi-calendar3 me-1"></i>
              {{ formatDate(currentNotice?.create_time) }}
            </span>
          </div>
        </div>

        <div class="modal-footer border-top py-3 px-4 justify-content-center">
          <button type="button" class="btn btn-outline-danger rounded-pill px-4 w-100" data-bs-dismiss="modal">
            关闭
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Modal } from 'bootstrap'
import request from '@/utils/request'
import utils from '@/utils/utils'

// 响应式数据
const noticeList = ref([])
const currentNotice = ref(null)
const noticeModal = ref(null)
const isExpand = ref(false)
let modalInstance = null

// 深色模式检测
const isDarkMode = computed(() => {
  return document.documentElement.getAttribute('data-bs-theme') === 'dark'
})

// 显示的公告列表
const showNoticeList = computed(() => {
  return isExpand.value ? noticeList.value : noticeList.value.slice(0, 1)
})

// 获取公告列表
const fetchNotices = async () => {
  try {
    const res = await request.get('/api/placard/all', {
      page: 1,
      limit: 10,
      order: 'create_time desc'
    })
    
    if (res.code === 200 && res.data?.data) {
      noticeList.value = res.data.data
    }
  } catch (error) {
    console.error('获取公告失败:', error)
  }
}

// 格式化日期
const formatDate = (timestamp) => {
  if (!timestamp) return '未知时间'
  
  try {
    return utils.timeToDate(timestamp, 'Y-m-d')
  } catch {
    return '未知时间'
  }
}

// 格式化内容
const formatContent = (content) => {
  if (!content) return '<p class="text-muted mb-0">暂无公告内容</p>'
  return content.replace(/\n/g, '<br>')
}

// 打开公告弹窗
const openNoticeModal = (notice) => {
  currentNotice.value = notice
  modalInstance?.show()
}

// 切换展开状态
const toggleExpand = () => {
  isExpand.value = !isExpand.value
}

// 初始化弹窗
const initModal = () => {
  if (noticeModal.value) {
    modalInstance = new Modal(noticeModal.value, {
      backdrop: true,
      keyboard: true
    })
  }
}

// 清理资源
const cleanup = () => {
  modalInstance?.dispose()
  modalInstance = null
}

// 生命周期
onMounted(() => {
  initModal()
  fetchNotices()
})

onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
/* 公告项样式 */
.notice-item {
  transition: background-color 0.2s ease;
}

.notice-item:hover {
  background-color: var(--bs-tertiary-bg);
}

.cursor-pointer {
  cursor: pointer;
}

/* 字体大小 */
.fs-7 {
  font-size: 0.875rem !important;
}

.x-small {
  font-size: 0.75rem !important;
}

/* 滚动容器 */
.scrollable-content {
  max-height: 300px;
  overflow-y: auto;
  background-color: var(--bs-tertiary-bg);
  border-radius: 0.375rem;
  padding: 1rem;
}

/* 滚动条样式 */
.scrollable-content::-webkit-scrollbar {
  width: 6px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background-color: var(--bs-border-color);
  border-radius: 3px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--bs-border-color-subtle);
}

/* 深色模式适配 */
[data-bs-theme="dark"] .scrollable-content {
  scrollbar-color: var(--bs-border-color-dark) transparent;
}

[data-bs-theme="dark"] .scrollable-content::-webkit-scrollbar-thumb {
  background-color: var(--bs-border-color-dark);
}

/* 文本样式 */
.notice-text {
  line-height: 1.6;
}

.notice-text p {
  margin-bottom: 0.75rem;
}

.notice-text p:last-child {
  margin-bottom: 0;
}

/* 弹窗动画效果 */
.modal.fade {
  transition: opacity 0.3s ease;
}

.modal.fade .modal-dialog {
  transition: transform 0.3s ease;
  transform: translateY(-20px);
}

.modal.fade.show .modal-dialog {
  transform: translateY(0);
}

.modal-backdrop.fade {
  transition: opacity 0.3s ease;
}

/* 公告卡片动画 */
.card {
  animation: fadeInDown 0.5s ease forwards;
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes fadeInDown {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 公告项动画 */
.notice-item {
  animation: fadeIn 0.3s ease forwards;
  opacity: 0;
}

.notice-item:nth-child(1) {
  animation-delay: 0.1s;
}

.notice-item:nth-child(2) {
  animation-delay: 0.2s;
}

.notice-item:nth-child(3) {
  animation-delay: 0.3s;
}

.notice-item:nth-child(4) {
  animation-delay: 0.4s;
}

.notice-item:nth-child(5) {
  animation-delay: 0.5s;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* 按钮动画 */
.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 1rem;
  }
  
  .card {
    margin-top: 1rem !important;
    margin-bottom: 1rem !important;
  }
}
</style>