<template>
  <!-- 首页顶部公告卡片 -->
  <div class="card mt-2 shadow-sm notice-card" v-if="noticeList.length > 0">
    <div class="card-body p-0">
      <!-- 公告列表 -->
      <ul class="list-unstyled mb-0">
        <li
          v-for="(notice, index) in showNoticeList"
          :key="notice.id"
          class="notice-item d-flex align-items-center py-3 px-4 border-bottom cursor-pointer"
          :class="{'border-light': !isDarkMode, 'border-dark-subtle': isDarkMode}"
          @click="openNoticeModal(notice)"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <span class="badge text-bg-danger me-3 notice-badge"><i class="bi bi-megaphone"></i></span>
          <span class="fw-medium fs-7 text-truncate flex-grow-1 notice-title">{{ notice.title }}</span>
          <span class="ms-3 text-muted x-small text-nowrap notice-date">{{ formatDate(notice.create_time) }}</span>
        </li>
      </ul>

      <!-- 展开/折叠按钮 -->
      <div v-if="noticeList.length > 1" class="text-center py-2 notice-expand">
        <button
          class="btn btn-link text-danger fs-7 p-0 text-decoration-none notice-expand-btn"
          @click="toggleExpand"
        >
          {{ isExpand ? '折叠公告' : `查看更多(${noticeList.length - 1}条)` }}
          <i class="bi ms-1" :class="isExpand ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        </button>
      </div>
    </div>
  </div>

  <!-- 空状态 -->
  <div v-else class="card text-center py-4 mt-2 notice-empty">
    <div class="notice-empty-icon mb-2">
      <i class="bi bi-megaphone text-muted fs-4"></i>
    </div>
    <p class="mb-0 text-muted fs-7">暂无系统公告</p>
  </div>

  <!-- 公告弹窗 -->
  <div class="modal fade" id="noticeModal" tabindex="-1" aria-hidden="true" ref="noticeModal">
    <div class="modal-dialog modal-dialog-centered modal-md">
      <div class="modal-content shadow notice-modal-content">
        <div class="modal-header border-bottom py-3 px-4 notice-modal-header">
          <h5 class="modal-title d-flex align-items-center mb-0 text-danger-emphasis notice-modal-title">
            <i class="bi bi-megaphone me-2"></i>
            {{ currentNotice?.title || '系统公告' }}
          </h5>
          <button type="button" class="btn-close notice-modal-close" data-bs-dismiss="modal" aria-label="关闭"></button>
        </div>

        <div class="modal-body p-4 notice-modal-body">
          <!-- 公告内容 -->
          <div class="notice-content p-4 scrollable-content">
            <div v-html="formatContent(currentNotice?.content)" class="notice-text"></div>
            
            <!-- 查看详情链接 -->
            <div v-if="currentNotice?.url" class="text-center mt-4">
              <a
                :href="currentNotice.url"
                :target="currentNotice.target || '_blank'"
                class="btn btn-outline-danger rounded-pill px-4 text-decoration-none w-100 notice-detail-btn"
              >
                <i class="bi bi-link-45deg me-1"></i>查看详情
              </a>
            </div>
          </div>

          <!-- 公告信息 -->
          <div class="notice-meta d-flex align-items-center flex-wrap gap-2 mt-4">
            <span class="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle notice-meta-badge">
              <i class="bi bi-tag me-1"></i> {{ currentNotice?.type || '系统通知' }}
            </span>
            <span class="badge bg-success-subtle text-success-emphasis border border-success-subtle notice-meta-badge">
              <i class="bi bi-calendar3 me-1"></i>
              {{ formatDate(currentNotice?.create_time) }}
            </span>
          </div>
        </div>

        <div class="modal-footer border-top py-3 px-4 justify-content-center notice-modal-footer">
          <button type="button" class="btn btn-outline-danger rounded-pill px-4 w-100 notice-close-btn" data-bs-dismiss="modal">
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
/* 公告卡片样式 */
.notice-card {
  border-radius: 0.75rem;
  border: 1px solid var(--bs-border-color);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.notice-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 公告项样式 */
.notice-item {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.notice-item:hover {
  background-color: var(--bs-tertiary-bg);
  border-left-color: var(--bs-danger);
  transform: translateX(4px);
}

.cursor-pointer {
  cursor: pointer;
}

/* 公告徽章样式 */
.notice-badge {
  font-size: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.notice-item:hover .notice-badge {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

/* 公告标题样式 */
.notice-title {
  transition: all 0.3s ease;
}

.notice-item:hover .notice-title {
  color: var(--bs-danger);
}

/* 公告日期样式 */
.notice-date {
  transition: all 0.3s ease;
}

.notice-item:hover .notice-date {
  color: var(--bs-danger);
}

/* 展开/折叠按钮样式 */
.notice-expand {
  border-top: 1px solid var(--bs-border-color);
  background-color: var(--bs-tertiary-bg);
  transition: all 0.3s ease;
}

.notice-expand-btn {
  transition: all 0.3s ease;
  font-weight: 500;
}

.notice-expand-btn:hover {
  color: var(--bs-danger);
  transform: translateY(-1px);
}

/* 空状态样式 */
.notice-empty {
  border-radius: 0.75rem;
  border: 1px dashed var(--bs-border-color);
  background-color: var(--bs-tertiary-bg);
  transition: all 0.3s ease;
}

.notice-empty-icon {
  transition: all 0.3s ease;
  opacity: 0.6;
}

.notice-empty:hover .notice-empty-icon {
  opacity: 1;
  transform: scale(1.1);
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
  max-height: 350px;
  overflow-y: auto;
  background-color: var(--bs-tertiary-bg);
  border-radius: 0.5rem;
  padding: 1.25rem;
  transition: all 0.3s ease;
  border: 1px solid var(--bs-border-color);
}

.scrollable-content:hover {
  border-color: var(--bs-danger);
  box-shadow: 0 0 0 0.125rem rgba(220, 38, 38, 0.1);
}

/* 滚动条样式 */
.scrollable-content::-webkit-scrollbar {
  width: 8px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: var(--bs-tertiary-bg);
  border-radius: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background-color: var(--bs-border-color);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--bs-danger);
}

/* 深色模式适配 */
[data-bs-theme="dark"] .scrollable-content {
  scrollbar-color: var(--bs-border-color-dark) var(--bs-tertiary-bg);
}

[data-bs-theme="dark"] .scrollable-content::-webkit-scrollbar-thumb {
  background-color: var(--bs-border-color-dark);
}

[data-bs-theme="dark"] .scrollable-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--bs-danger);
}

/* 文本样式 */
.notice-text {
  line-height: 1.7;
  font-size: 0.9rem;
}

.notice-text p {
  margin-bottom: 0.75rem;
}

.notice-text p:last-child {
  margin-bottom: 0;
}

/* 弹窗样式 */
.notice-modal-content {
  border-radius: 1rem;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.notice-modal-header {
  background-color: var(--bs-danger-subtle);
  border-bottom: 1px solid var(--bs-danger-border-subtle);
}

.notice-modal-title {
  font-weight: 600;
  font-size: 1.1rem;
}

.notice-modal-close {
  transition: all 0.3s ease;
}

.notice-modal-close:hover {
  transform: rotate(90deg);
  opacity: 1;
}

.notice-modal-body {
  background-color: var(--bs-body-bg);
}

.notice-modal-footer {
  background-color: var(--bs-tertiary-bg);
  border-top: 1px solid var(--bs-border-color);
}

/* 公告元数据样式 */
.notice-meta {
  padding-top: 1rem;
  border-top: 1px solid var(--bs-border-color);
}

.notice-meta-badge {
  transition: all 0.3s ease;
  font-size: 0.75rem;
}

.notice-meta-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 按钮样式 */
.notice-detail-btn {
  transition: all 0.3s ease;
  font-weight: 500;
}

.notice-detail-btn:hover {
  background-color: var(--bs-danger);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.notice-close-btn {
  transition: all 0.3s ease;
  font-weight: 500;
}

.notice-close-btn:hover {
  background-color: var(--bs-danger);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

/* 弹窗动画效果 */
.modal.fade {
  transition: opacity 0.4s ease;
}

.modal.fade .modal-dialog {
  transition: transform 0.4s ease;
  transform: translateY(-30px) scale(0.95);
}

.modal.fade.show .modal-dialog {
  transform: translateY(0) scale(1);
}

.modal-backdrop.fade {
  transition: opacity 0.4s ease;
}

/* 公告卡片动画 */
.notice-card {
  animation: fadeInDown 0.6s ease forwards;
  opacity: 0;
  transform: translateY(-15px);
}

@keyframes fadeInDown {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 公告项动画 */
.notice-item {
  animation: fadeIn 0.4s ease forwards;
  opacity: 0;
  transform: translateX(-10px);
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 空状态动画 */
.notice-empty {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(15px);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 按钮动画 */
.btn {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0) scale(0.98);
  transition: transform 0.1s ease;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .modal-dialog {
    margin: 1rem;
  }
  
  .notice-card {
    margin-top: 1rem !important;
    margin-bottom: 1rem !important;
  }
  
  .notice-item {
    padding: 0.75rem !important;
  }
  
  .notice-badge {
    font-size: 0.675rem;
    padding: 0.25rem 0.5rem;
  }
  
  .scrollable-content {
    max-height: 300px;
    padding: 1rem;
  }
}

/* 平板设备响应式调整 */
@media (min-width: 769px) and (max-width: 992px) {
  .notice-card {
    margin-top: 1.5rem !important;
    margin-bottom: 1.5rem !important;
  }
}
</style>