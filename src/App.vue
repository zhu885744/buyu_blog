<template>
  <!-- 全局导航栏 -->
  <i-nav></i-nav>
  <!-- 主内容区 -->
  <div class="container">
    <router-view></router-view>
  </div>
  <!-- 全局页脚 -->
  <i-footer></i-footer>

  <!-- 检查客户端页面更新 -->
  <upgrade-page></upgrade-page>
  
  <!-- 返回顶部按钮 -->
  <button 
    class="btn btn-primary shadow-lg back-to-top" 
    id="backToTop" 
    @click="scrollToTop"
    :class="{ 'show': showBackToTop }"
    title="返回顶部"
    style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;"
  >
    <i class="bi bi-arrow-up"></i>
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import upgradePage from '@/comps/upgrade/page.vue'
import iNav from '@/views/index/layout/nav.vue'
import iFooter from '@/views/index/layout/footer.vue'
import socket from '@/utils/socket'
import { useCommStore } from '@/store/comm'

const showBackToTop = ref(false)
const store = useCommStore()

// 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 监听滚动事件
const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

// WebSocket事件处理
const handleSocketOpen = () => {
  console.log('WebSocket连接已建立');
}

const handleSocketClose = () => {
  console.log('WebSocket连接已关闭');
}

const handleSocketError = (error) => {
  console.error('WebSocket错误:', error);
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  
  // 连接WebSocket
  socket.on('open', handleSocketOpen)
  socket.on('close', handleSocketClose)
  socket.on('error', handleSocketError)
  socket.connect()
  
  // 确保siteInfo加载完成
  await store.fetchSiteInfo()
  
  // 直接使用store.siteInfo获取自定义代码
  const customCodeData = store.siteInfo?.custom_code || {}
  
  // 注入自定义CSS
  if (customCodeData.css) {
    const style = document.createElement('style')
    style.textContent = customCodeData.css
    document.head.appendChild(style)
  }
  
  // 注入自定义头部HTML代码
  if (customCodeData.header) {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = customCodeData.header
    
    // 直接将所有子节点添加到head中，而不是添加整个div
    while (tempDiv.firstChild) {
      document.head.appendChild(tempDiv.firstChild)
    }
  }
  
  // 注入自定义JavaScript
  if (customCodeData.js) {
    const script = document.createElement('script')
    script.textContent = customCodeData.js
    document.body.appendChild(script)
  }
  
  // 注入自定义底部HTML代码
  if (customCodeData.footer) {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = customCodeData.footer
    
    // 直接将所有子节点添加到body中，而不是添加整个div
    while (tempDiv.firstChild) {
      document.body.appendChild(tempDiv.firstChild)
    }
  }
  
  // 注入网站统计HTML代码
  if (customCodeData.analytics) {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = customCodeData.analytics
    
    // 直接将所有子节点添加到body中，而不是添加整个div
    while (tempDiv.firstChild) {
      document.body.appendChild(tempDiv.firstChild)
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  
  // 销毁WebSocket实例
  socket.destroy()
})
</script>

<style>
/* 返回顶部按钮样式 */
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 999;
}

.back-to-top.show {
  opacity: 1;
  visibility: visible;
}

.back-to-top:hover {
  transform: translateY(-3px);
}

.back-to-top:active {
  transform: translateY(0);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .back-to-top {
    bottom: 20px;
    right: 20px;
  }
  
  .back-to-top {
    width: 40px !important;
    height: 40px !important;
    font-size: 1rem !important;
  }
}
</style>