<template>
  <!-- 配置初始化组件 -->
  <ConfigInit />
  
  <!-- 主布局 -->
  <!-- 全局导航栏 -->
  <i-nav ref="navRef"></i-nav>
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
import { ref, onMounted, onUnmounted } from 'vue'
import upgradePage from '@/comps/upgrade/page.vue'
import iNav from '@/views/index/layout/nav.vue'
import iFooter from '@/views/index/layout/footer.vue'
import socket from '@/utils/socket'

const navRef = ref(null)
const showBackToTop = ref(false)

const handleShowLogin = () => {
  if (navRef.value && navRef.value.method && navRef.value.method.showLogin) {
    navRef.value.method.showLogin()
  }
}

const handleShowRegister = () => {
  if (navRef.value && navRef.value.method && navRef.value.method.showRegister) {
    navRef.value.method.showRegister()
  }
}

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

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  
  // 连接WebSocket
  socket.on('open', handleSocketOpen)
  socket.on('close', handleSocketClose)
  socket.on('error', handleSocketError)
  socket.connect()
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