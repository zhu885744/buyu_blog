<template>
  <footer id="footer" class="fs-6 py-3 mt-2 bg-body-tertiary text-body-secondary">
    <div class="container">
      <div class="text-center">
        <!-- 版权年份 -->
        <div class="text">
          Copyright © {{ startYear || '2020' }} ~ {{ currentYear }} {{ siteTitle }} 版权所有
        </div>
        
        <!-- ICP备案号 -->
        <div class="test" v-if="hasIcp">
          <a 
            :href="icpLink" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-decoration-none text-reset hover-text-primary transition-opacity"
            aria-label="ICP备案号"
          >
            {{ icpCode }}
          </a>
        </div>
        
        <!-- 公安备案号 -->
        <div class="test" v-if="hasPolice">
          <a 
            :href="policeLink" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-decoration-none text-reset hover-text-primary transition-opacity"
            aria-label="公安备案号"
          >
            {{ policeCode }}
          </a>
        </div>
        
        <!-- 技术支持 -->
        <div class="text" aria-label="技术支持">
          <span>Powered by </span>
          <a 
            href="https://github.com/zhu885744/inisv1" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-decoration-none text-reset hover-text-primary transition-opacity"
            title="inisv1 开源地址"
          >
            inis v{{ systemVersion }}
          </a>
          <span class="mx-1">|</span>
          <span>Theme by </span>
          <a 
            href="https://github.com/zhu885744/xiao-inisv1-vue" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-decoration-none text-reset hover-text-primary transition-opacity"
            title="xiao主题开源地址"
          >
            xiao v{{ themeVersion }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from '@/utils/request'
import { useCommStore } from '@/store/comm'

// 环境变量
const THEME_VERSION = import.meta.env.VITE_VERSION || '1.0.0'

// 响应式数据
const systemVersion = ref(THEME_VERSION)
const currentYear = new Date().getFullYear()
const commStore = useCommStore()

// 直接使用store中的siteInfo
const siteInfo = ref(commStore.siteInfo)

const startYear = computed(() => {
  const timestamp = siteInfo.value?.date
  if (!timestamp) return currentYear
  
  try {
    // 秒级时间戳转毫秒
    const milliseconds = parseInt(timestamp) * 1000
    const date = new Date(milliseconds)
    const year = date.getFullYear()
    console.log('解析时间戳:', timestamp, '->', milliseconds, '->', year)
    return isNaN(year) ? currentYear : year
  } catch (error) {
    console.error('解析时间戳失败:', error)
    return currentYear
  }
})

const siteTitle = computed(() => {
  return siteInfo.value?.title || '未设置网站名'
})

// ICP备案
const hasIcp = computed(() => !!siteInfo.value?.copy?.code)
const icpCode = computed(() => siteInfo.value?.copy?.code || '请在后台填写备案号')
const icpLink = computed(() => siteInfo.value?.copy?.link || 'http://beian.miit.gov.cn/')

// 公安备案
const hasPolice = computed(() => !!siteInfo.value?.police?.code)
const policeCode = computed(() => siteInfo.value?.police?.code || '请在后台填写公安备案号')
const policeLink = computed(() => siteInfo.value?.police?.link || 'https://beian.mps.gov.cn/#/query/webSearch')

const themeVersion = computed(() => THEME_VERSION)

// 数据获取方法
const fetchSystemVersion = async () => {
  try {
    const res = await axios.get('/dev/info/version')
    
    if (res?.code === 200 && res.data?.inis) {
      systemVersion.value = res.data.inis
    }
  } catch (error) {
    console.error('系统版本加载失败:', error)
  }
}

// 组件挂载
onMounted(async () => {
  console.log('组件挂载，siteInfo:', siteInfo.value)
  // 确保站点信息已加载
  if (!siteInfo.value || Object.keys(siteInfo.value).length === 0) {
    console.log('站点信息为空，调用fetchSiteInfo')
    await commStore.fetchSiteInfo()
    // 更新siteInfo ref的值
    siteInfo.value = commStore.siteInfo
    console.log('fetchSiteInfo调用完成，siteInfo:', siteInfo.value)
  }
  await fetchSystemVersion()
})
</script>

<style scoped>
.hover-text-primary:hover {
  color: var(--bs-primary) !important;
}

.transition-opacity {
  transition: opacity 0.2s ease;
}

.transition-opacity:hover {
  opacity: 0.8;
}
</style>