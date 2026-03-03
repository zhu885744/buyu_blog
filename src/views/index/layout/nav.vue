<template>
  <!-- 顶部导航栏 -->
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
    <div class="container d-flex align-items-center">
      <!-- 移动端侧边栏触发按钮 -->
      <button 
        class="navbar-toggler d-lg-none me-3 border-0" 
        type="button" 
        @click="toggleSidebar"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- 网站标题：跳首页 -->
      <router-link class="navbar-brand flex-grow-1 text-center d-lg-block d-flex justify-content-start align-items-center" to="/">
        <img 
          v-if="store.comm.siteInfo?.avatar" 
          :src="store.comm.siteInfo.avatar" 
          alt="网站图标" 
          style="width: 45px;border-radius: 50%;"
        >
        <span v-else class="fw-bold">{{ store.comm.siteInfo?.title || '未设置网站名' }}</span>
      </router-link>

      <!-- 移动端右侧搜索按钮 -->
      <div class="d-flex align-items-center ms-3">
        <button class="btn d-lg-none border-0 bg-transparent" type="button" @click="method.showSearch()">
          <i class="bi bi-search"></i>
        </button>
      </div>

      <!-- PC端导航内容 -->
      <div class="collapse navbar-collapse d-none d-lg-flex" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- 首页 -->
          <li class="nav-item">
            <router-link class="nav-link" aria-current="page" to="/" active-class="active" exact-active-class="active">
              首页
            </router-link>
          </li>

          <!-- 分类下拉列表 -->
          <li class="nav-item dropdown" ref="pcDropdownRef">
            <a class="nav-link dropdown-toggle" role="button" aria-expanded="false" data-bs-toggle="dropdown">
              分类
            </a>
            <ul class="dropdown-menu">
              <li v-for="category in categories" :key="category.id" class="dropdown-item p-0">
                <router-link class="nav-link d-block w-100 h-100 py-2 px-4 text-decoration-none" :to="`/category/${category.key}`">
                  {{ category.name }}
                </router-link>
              </li>
              <li v-if="categories.length === 0" class="dropdown-item text-muted">
                暂无分类数据
              </li>
            </ul>
          </li>

          <!-- 动态渲染的导航项 -->
          <li v-for="item in navItems" :key="item.key" class="nav-item">
            <router-link class="nav-link" :to="`/${item.key}`" active-class="active" exact-active-class="active">
              {{ item.title }}
            </router-link>
          </li>
        </ul>
        
        <!-- 右侧功能区域 -->
        <div class="d-flex align-items-center">
          <!-- 搜索按钮 -->
          <button class="btn btn-outline-secondary me-2" type="button" @click="method.showSearch()">
            <i class="bi bi-search"></i>
          </button>
          
          <!-- 深色/浅色模式切换按钮 -->
          <button 
            class="btn btn-outline-secondary me-2" 
            type="button" 
            @click="toggleDarkMode"
            :title="isDarkMode ? '切换到浅色模式' : '切换到深色模式'"
          >
            <i :class="darkModeIcon"></i>
          </button>
          
          <!-- 用户相关功能 -->
          <div class="d-flex align-items-center" v-if="store.comm.login.finish && store.comm.login.user">
            <!-- 已登录用户信息 -->
            <div class="dropdown" ref="userDropdownRef">
              <button 
                class="btn btn-outline-secondary dropdown-toggle d-flex align-items-center" 
                type="button" 
                id="userDropdownMenu"
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                @click="toggleUserDropdown"
              >
                <i class="bi bi-person-circle me-1"></i>
                <span class="text-truncate" style="max-width: 100px;">
                  {{ store.comm.login.user.nickname || store.comm.login.user.account }}
                </span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdownMenu" :class="{ 'show': userDropdownOpen }">
                <li>
                  <button class="dropdown-item" type="button" @click="method.showPublishNotification()">
                    <i class="bi bi-plus-circle me-1"></i>发布文章
                  </button>
                </li>
                <li>
                  <router-link class="dropdown-item" :to="`/author/${store.comm.login.user.id}`">
                    <i class="bi bi-person me-1"></i>用户主页
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/user">
                    <i class="bi bi-gear me-1"></i>用户设置
                  </router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/upgrade/theme">
                    <i class="bi bi-arrow-down-circle me-1"></i>版本更新
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <button class="dropdown-item text-danger" @click="method.logout()">
                    <i class="bi bi-box-arrow-right me-1"></i>退出登录
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div class="d-flex" v-else>
            <!-- 未登录状态 -->
            <button class="btn btn-outline-primary me-2" @click="method.showLogin()">
              登录
            </button>
            <button 
              v-if="parseInt(store.config.getAllowRegister?.value) === 1" 
              class="btn btn-outline-success"
              @click="method.showRegister()"
            >
              注册
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- 移动端侧边栏 -->
  <div 
    class="offcanvas offcanvas-start" 
    tabindex="-1" 
    id="mobileSidebar"
    aria-labelledby="mobileSidebarLabel"
  >
    <div class="offcanvas-header border-bottom">
      <h5 class="offcanvas-title d-flex align-items-center" id="mobileSidebarLabel">
        <img 
          v-if="store.comm.siteInfo?.avatar" 
          :src="store.comm.siteInfo.avatar" 
          alt="网站图标" 
          class="nav-logo"
        >
        <span v-else class="fw-bold">{{ store.comm.siteInfo?.title || '朱某的生活印记' }}</span>
      </h5>
      <button 
        type="button" 
        class="btn-close" 
        data-bs-dismiss="offcanvas" 
        aria-label="Close"
        @click="closeSidebar"
      ></button>
    </div>
    <div class="offcanvas-body d-flex flex-column">
      <!-- 移动端导航菜单 -->
      <ul class="navbar-nav flex-grow-1">
        <!-- 首页 -->
        <li class="nav-item mb-2">
          <router-link 
            class="nav-link" 
            to="/" 
            active-class="active" 
            exact-active-class="active"
            @click="closeSidebar"
          >
            首页
          </router-link>
        </li>

        <!-- 分类菜单 -->
        <li class="nav-item mb-2">
          <a 
            class="nav-link d-flex justify-content-between align-items-center" 
            href="javascript:;" 
            @click="toggleCategoryDropdown"
          >
            分类
            <i :class="categoryDropdownOpen ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
          </a>
          <!-- 分类子菜单 -->
          <ul class="navbar-nav ms-3 mt-2" v-show="categoryDropdownOpen">
            <li v-for="category in categories" :key="category.id" class="nav-item mb-1">
              <router-link 
                class="nav-link" 
                :to="`/category/${category.key}`"
                @click="closeSidebar"
              >
                {{ category.name }}
              </router-link>
            </li>
            <li v-if="categories.length === 0" class="nav-item text-muted small">
              暂无分类数据
            </li>
          </ul>
        </li>

        <!-- 动态导航项 -->
        <li v-for="item in navItems" :key="item.key" class="nav-item mb-2">
          <router-link 
            class="nav-link" 
            :to="`/${item.key}`" 
            active-class="active" 
            exact-active-class="active"
            @click="closeSidebar"
          >
            {{ item.title }}
          </router-link>
        </li>
      </ul>

      <!-- 移动端功能按钮组 -->
      <div class="mt-auto pt-3 border-top">
        <!-- 未登录状态 -->
        <div v-if="utils.is.empty(store.comm.login.user)" class="mb-4">
          <div class="d-grid grid-cols-2 gap-3">
            <button class="btn btn-outline-primary text-center" type="button" @click="method.showLogin()">
              <i class="bi bi-person-circle me-1"></i>登录
            </button>
            <button 
              v-if="parseInt(store.config.getAllowRegister?.value) === 1" 
              class="btn btn-outline-success text-center" 
              type="button" 
              @click="method.showRegister()"
            >
              <i class="bi bi-person-plus me-1"></i>注册
            </button>
          </div>
        </div>
        
        <!-- 已登录状态 -->
        <div v-else-if="!utils.is.empty(store.comm.login.user)" class="mb-4">
          <div class="text-center mb-3">
            <i class="bi bi-person-circle fs-4 text-success"></i>
            <div class="mt-1">{{ store.comm.login.user.nickname }}</div>
            <small class="text-muted">{{ store.comm.login.user.email }}</small>
          </div>
          <button 
            class="btn btn-danger w-100 mb-3" 
            type="button" 
            @click="doSign"
            :disabled="signLoading || hasSigned"
          >
            <i v-if="!signLoading" :class="hasSigned ? 'bi bi-check-circle' : 'bi bi-calendar-check'" class="me-1"></i>
            <i v-else class="bi bi-arrow-clockwise animate-spin me-1"></i>
            {{ hasSigned ? '今日已签到' : '每日签到' }}
            <span v-if="signDays > 0" class="ms-1 text-muted">({{ signDays }}天)</span>
          </button>
          <div class="d-grid grid-cols-2 gap-3">
            <router-link class="btn btn-outline-secondary text-center" :to="`/author/${store.comm.login.user.id}`" @click="closeSidebar">
              <i class="bi bi-person me-1"></i>用户主页
            </router-link>
            <router-link class="btn btn-outline-secondary text-center" to="/user" @click="closeSidebar">
              <i class="bi bi-gear me-1"></i>用户设置
            </router-link>

            <button class="btn btn-outline-success text-center" type="button" @click="method.showPublishNotification()">
              <i class="bi bi-plus-circle me-1"></i>发布文章
            </button>
            <button class="btn btn-outline-danger text-center" type="button" @click="method.logout()">
              <i class="bi bi-box-arrow-right me-1"></i>退出登录
            </button>
          </div>
        </div>
        
        <!-- 其他功能按钮 -->
        <div class="d-flex gap-2 mt-3">
          <button class="btn btn-outline-secondary flex-grow-1" type="button" @click="method.showSearch()">
            <i class="bi bi-search me-1"></i>搜索
          </button>
          <button 
            class="btn btn-outline-secondary flex-grow-1" 
            type="button" 
            @click="toggleDarkMode"
          >
            <i :class="[darkModeIcon, 'me-1']"></i>{{ isDarkMode ? '浅色' : '深色' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 引入三个对话框组件 -->
  <DialogLogin ref="loginDialog" @finish="method.onLoginFinish" />
  <DialogRegister ref="registerDialog" @finish="method.onRegisterFinish" />
  <DialogResetPassword ref="resetDialog" @finish="method.onResetFinish" />
  
  <!-- 搜索组件 -->
  <Search ref="searchDialog" />
</template>

<script setup>
import { ref, onMounted, computed, nextTick, reactive, watch, onUpdated } from 'vue'
import axios from '@/utils/request'
import utils from '@/utils/utils'
import Toast from '@/utils/toast'
import cache from '@/utils/cache'
import { useRouter } from 'vue-router'
import { useCommStore } from '@/store/comm'
import { useConfigStore } from '@/store/config'

// 引入对话框组件
import DialogLogin from '@/comps/index/dialog/login.vue'
import DialogRegister from '@/comps/index/dialog/register.vue'
import DialogResetPassword from '@/comps/index/dialog/reset-password.vue'
import Search from '@/comps/index/search.vue'

// 初始化router
const router = useRouter()

// 导航项数据
const navItems = ref([])
const categories = ref([])
const sidebarOpen = ref(false)
const categoryDropdownOpen = ref(false)
const userDropdownOpen = ref(false)

// 签到相关数据
const hasSigned = ref(false)
const signDays = ref(0)
const signLoading = ref(false)

// Refs for dropdowns
const pcDropdownRef = ref(null)
const userDropdownRef = ref(null)

// 组件引用
const loginDialog = ref(null)
const registerDialog = ref(null)
const resetDialog = ref(null)
const searchDialog = ref(null)

// 存储
const store = {
  comm: useCommStore(),
  config: useConfigStore()
}

// 状态管理
const state = reactive({
  theme: 'white',
  drawer: {
    show: false,
    menu: true
  },
  nav: {
    name: 'index',
    color: {
      active: 'rgb(var(--assist-color))',
      inactive: 'rgb(var(--vice-font-color))',
    }
  },
})

// 方法定义
const method = {
  // 显示对话框
  showLogin: () => {
    // 先关闭侧边栏
    closeSidebar()
    
    if (loginDialog.value && loginDialog.value.show) {
      loginDialog.value.show()
    } else {
      // 延迟一下，确保对话框引用被正确初始化
      setTimeout(() => {
        if (loginDialog.value && loginDialog.value.show) {
          loginDialog.value.show()
        }
      }, 100)
    }
  },
  
  showRegister: () => {
    // 先关闭侧边栏
    closeSidebar()
    
    if (registerDialog.value && registerDialog.value.show) {
      registerDialog.value.show()
    } else {
      // 延迟一下，确保对话框引用被正确初始化
      setTimeout(() => {
        if (registerDialog.value && registerDialog.value.show) {
          registerDialog.value.show()
        }
      }, 100)
    }
  },
  
  showResetPassword: () => {
    // 先关闭侧边栏
    closeSidebar()
    
    if (resetDialog.value && resetDialog.value.show) {
      resetDialog.value.show()
    } else {
      // 延迟一下，确保对话框引用被正确初始化
      setTimeout(() => {
        if (resetDialog.value && resetDialog.value.show) {
          resetDialog.value.show()
        }
      }, 100)
    }
  },
  
  // 搜索相关方法
  showSearch: () => {
    // 先关闭侧边栏
    closeSidebar()
    
    console.log('搜索按钮被点击，searchDialog.value:', searchDialog.value)
    
    // 显示搜索弹窗
    if (searchDialog.value && searchDialog.value.show) {
      console.log('调用searchDialog.value.show()')
      searchDialog.value.show()
    } else {
      console.log('搜索对话框引用未就绪，等待100ms后重试')
      // 延迟一下，确保对话框引用被正确初始化
      setTimeout(() => {
        if (searchDialog.value && searchDialog.value.show) {
          console.log('延迟后调用searchDialog.value.show()')
          searchDialog.value.show()
        } else {
          console.log('延迟后搜索对话框引用仍未就绪:', searchDialog.value)
        }
      }, 100)
    }
  },
  
  hideSearch: () => {
    // 隐藏搜索弹窗
    if (searchDialog.value && searchDialog.value.hide) {
      searchDialog.value.hide()
    }
  },
  
  // 事件处理
  onLoginFinish: (user) => {
    // console.log('登录成功:', user)
    store.comm.login.finish = true
    store.comm.login.user = user
    closeSidebar()
    // 登录成功提示
    Toast.success('登录成功')
    // 重新初始化下拉菜单（用户登录后）
    nextTick(() => {
      initDropdowns()
    })
  },
  
  onRegisterFinish: (user) => {
    // console.log('注册成功:', user)
    // 注册成功提示
    Toast.success('注册成功，请登录')
    method.showLogin()
  },
  
  onResetFinish: () => {
    // console.log('密码重置成功')
    // 密码重置成功提示
    Toast.success('密码重置成功，请登录')
    method.showLogin()
  },
  
  // 登出（核心修改：适配后端 DELETE /api/comm/logout 接口）
  logout: async () => {
    try {
      // 1. 调用后端退出登录接口（DELETE 请求）
      const response = await axios.del('/api/comm/logout')
      
      // 2. 处理接口响应（根据后端返回状态码判断）
      if (response.code === 200) {
        // 接口调用成功 - 清理前端状态
        utils.set.cookie(globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', '', -1)
        store.comm.login.finish = false
        store.comm.login.user = null
        
        // 清理本地缓存的用户信息
        if (utils.cache?.del) {
          utils.cache.del('user-info')
        } else if (localStorage) {
          localStorage.removeItem('user-info')
        }
        
        // 成功提示
        Toast.success('已退出登录')
      } else {
        // 接口返回错误
        Toast.error(response.msg || '退出登录失败')
      }
    } catch (error) {
      // 网络错误/接口调用失败
      // console.error('退出登录接口调用失败:', error)
      
      // 兜底清理前端状态（即使接口失败，也清理本地Token）
      utils.set.cookie(globalThis?.inis?.token_name || 'INIS_LOGIN_TOKEN', '', -1)
      store.comm.login.finish = false
      store.comm.login.user = null
      
      // 错误提示
      Toast.error('网络异常，已本地退出登录')
    } finally {
      // 无论成功失败，都关闭侧边栏
      closeSidebar()
      // 可选：登出后跳转到首页
      // router.push('/')
    }
  },
  
  // 显示发布文章通知
  showPublishNotification: () => {
    Toast.info('该功能正在开发中，敬请期待！')
    closeSidebar()
  },
  
  // 获取当前主题
  async getTheme() {
    let theme = document.querySelector('body').getAttribute('inis-theme')
    if (!utils.is.empty(theme)) {
      if (theme.indexOf('white') !== -1) state.theme = 'white'
      else state.theme = 'dark'
    }
  },
  
  // 路由跳转 - 关闭抽屉
  push: (params = {}) => {
    router.push(params)
    state.drawer.show = false
  },
}

// 暴露方法给父组件
defineExpose({
  method,
  store
})

// 初始化下拉菜单
const initDropdowns = () => {
  // 等待 DOM 更新完成
  nextTick(() => {
    // 初始化分类下拉菜单
    if (pcDropdownRef.value && window.bootstrap) {
      const trigger = pcDropdownRef.value.querySelector('.dropdown-toggle')
      if (trigger) {
        try {
          // 确保每个下拉菜单只初始化一次
          if (!trigger._dropdown) {
            trigger._dropdown = new window.bootstrap.Dropdown(trigger)
          }
        } catch (e) {
          console.warn('分类下拉初始化失败:', e)
        }
      }
    }
    
    // 初始化用户下拉菜单
    if (userDropdownRef.value && window.bootstrap) {
      const trigger = userDropdownRef.value.querySelector('.dropdown-toggle')
      if (trigger) {
        try {
          if (!trigger._dropdown) {
            trigger._dropdown = new window.bootstrap.Dropdown(trigger)
          }
        } catch (e) {
          console.warn('用户下拉初始化失败:', e)
        }
      }
    }
  })
}

// 计算属性
const isDarkMode = computed(() => store.comm.isDarkMode)

const darkModeIcon = computed(() => {
  return isDarkMode.value ? 'bi bi-brightness-high-fill' : 'bi bi-brightness-high'
})



// 切换深色/浅色模式
const toggleDarkMode = () => {
  store.comm.toggleDarkMode()
}

// 初始化主题
const initTheme = () => {
  // 应用主题
  const htmlElement = document.documentElement
  htmlElement.setAttribute('data-bs-theme', isDarkMode.value ? 'dark' : 'light')
}

// 移除系统主题变化的监听，只支持手动切换
const setupSystemThemeListener = () => {
  // 不再监听系统主题变化
  return () => {}
}

// 侧边栏实例
let offcanvasInstance = null

// 初始化侧边栏
const initOffcanvas = () => {
  if (window.bootstrap && !offcanvasInstance) {
    const sidebar = document.getElementById('mobileSidebar')
    if (sidebar) {
      offcanvasInstance = new window.bootstrap.Offcanvas(sidebar, {
        backdrop: true,
        keyboard: true
      })
      
      // 监听关闭事件
      sidebar.addEventListener('hidden.bs.offcanvas', () => {
        sidebarOpen.value = false
        categoryDropdownOpen.value = false
      })
      
      // 监听显示事件
      sidebar.addEventListener('shown.bs.offcanvas', () => {
        sidebarOpen.value = true
      })
    }
  }
}

// 切换移动端侧边栏
const toggleSidebar = () => {
  if (!offcanvasInstance) {
    initOffcanvas()
  }
  
  if (sidebarOpen.value) {
    offcanvasInstance.hide()
  } else {
    offcanvasInstance.show()
  }
}

// 关闭侧边栏
const closeSidebar = () => {
  if (offcanvasInstance) {
    offcanvasInstance.hide()
  }
  sidebarOpen.value = false
  categoryDropdownOpen.value = false
}

// 切换移动端分类下拉
const toggleCategoryDropdown = () => {
  categoryDropdownOpen.value = !categoryDropdownOpen.value
}

// 切换用户下拉列表
const toggleUserDropdown = () => {
  userDropdownOpen.value = !userDropdownOpen.value
}

// 从API获取导航数据
const fetchNavData = async () => {
  try {
    // 缓存键
    const cacheKey = 'nav_items'
    const cacheExpire = 60 // 缓存60分钟
    
    // 尝试从缓存获取导航数据
    let cachedNavItems = cache.get(cacheKey)
    
    // 如果缓存不存在，从API获取
    if (!cachedNavItems) {
      const response = await axios.get('/api/pages/all', {
        params: {
          field: 'key,title',
          cache: false
        }
      })
      
      if (response.data && Array.isArray(response.data)) {
        navItems.value = response.data
        // 缓存导航数据
        cache.set(cacheKey, response.data, cacheExpire)
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        navItems.value = response.data.data
        // 缓存导航数据
        cache.set(cacheKey, response.data.data, cacheExpire)
      } else {
        navItems.value = []
      }
    } else {
      // 使用缓存数据
      navItems.value = cachedNavItems
    }
  } catch (error) {
    // console.error('获取导航数据失败:', error)
  }
}

// 从store获取站点信息
const fetchSiteInfo = async () => {
  try {
    await store.comm.fetchSiteInfo()
  } catch (error) {
    // console.error('获取站点信息失败:', error)
  }
}

// 从API获取分类数据
const fetchCategories = async () => {
  try {
    // 缓存键
    const cacheKey = 'categories_list'
    const cacheExpire = 60 // 缓存60分钟
    
    // 尝试从缓存获取分类数据
    let cachedCategories = cache.get(cacheKey)
    
    // 如果缓存不存在，从API获取
    if (!cachedCategories) {
      const response = await axios.get('/api/article-group/all', {
        params: {
          field: 'id,key,name',
          cache: false
        }
      })

      if (response.data && response.data.code === 200 && response.data.data && response.data.data.data) {
        categories.value = response.data.data.data
        // 缓存分类数据
        cache.set(cacheKey, response.data.data.data, cacheExpire)
      } else if (response.data && Array.isArray(response.data)) {
        categories.value = response.data
        // 缓存分类数据
        cache.set(cacheKey, response.data, cacheExpire)
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        categories.value = response.data.data
        // 缓存分类数据
        cache.set(cacheKey, response.data.data, cacheExpire)
      } else {
        categories.value = []
      }
    } else {
      // 使用缓存数据
      categories.value = cachedCategories
    }
  } catch (error) {
    // console.error('获取分类数据失败:', error)
    categories.value = []
  }
}

// 签到相关方法
const checkSignStatus = async () => {
  if (!store.comm.login.finish || !store.comm.login.user) return
  
  try {
    const response = await axios.get('/api/exp/check-in/status')
    if (response.code === 200) {
      hasSigned.value = response.data?.hasSigned || false
      signDays.value = response.data?.signDays || 0
    }
  } catch (error) {
    // console.error('获取签到状态失败：', error)
  }
}

const doSign = async () => {
  if (!store.comm.login.finish || !store.comm.login.user) {
    Toast.warning('请先登录')
    return
  }
  
  if (hasSigned.value) {
    Toast.info('今日已签到')
    return
  }
  
  try {
    signLoading.value = true
    const response = await axios.post('/api/exp/check-in')
    
    if (response.code === 200) {
      hasSigned.value = true
      signDays.value += 1
      Toast.success(`签到成功！获得 ${response.data?.exp || 10} 点经验`)
    } else {
      Toast.error(response.msg || '签到失败')
    }
  } catch (error) {
    // console.error('签到失败：', error)
    Toast.error('网络异常，签到失败')
  } finally {
    signLoading.value = false
  }
}

// 组件挂载时获取数据并初始化
onMounted(() => {
  fetchNavData()
  fetchCategories()
  fetchSiteInfo()
  initTheme()
  setupSystemThemeListener()
  checkSignStatus()
  
  // 初始化 Bootstrap 组件
  if (window.bootstrap) {
    initDropdowns()
    initOffcanvas()
  } else {
    // 如果Bootstrap未加载，等待一下再尝试
    setTimeout(() => {
      if (window.bootstrap) {
        initDropdowns()
        initOffcanvas()
      }
    }, 100)
  }
  
  // 监听窗口大小变化，自动关闭侧边栏
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) {
      closeSidebar()
    }
  })
  
  // 初始化主题获取
  method.getTheme()
})

// 当用户状态变化时重新初始化下拉菜单
watch(() => store.comm.login.user, () => {
  nextTick(() => {
    initDropdowns()
  })
})

onUpdated(() => {
  // 组件更新后检查是否需要重新初始化下拉菜单
  initDropdowns()
})

nextTick(async () => {
  await method.getTheme()
  initDropdowns()
})

// 监听当前路由 name 改变
watch(() => router.currentRoute.value.name, (val) => {
  const map = {
    'index-themes-list': 'themes',
    'index-articles-list': 'articles',
  }
  state.nav.name = map[val] || val
}, { immediate: true })

watch(() => state.drawer.show, (val) => {
  // 显示抽屉时禁止滚动
  document.querySelector('body').style.overflow = val ? 'hidden' : 'auto'
})

// 监听 auth 状态变化，自动显示对应的弹窗
watch(
  () => store.comm.auth,
  (newAuth) => {
    if (newAuth.login) {
      method.showLogin()
    } else if (newAuth.register) {
      method.showRegister()
    } else if (newAuth.reset) {
      method.showResetPassword()
    }
  },
  { deep: true }
)
</script>

<style scoped>
/* 基础样式 */
:deep(.nav-link.active) {
  color: #0077ff !important;
  font-weight: 500;
}

/* 导航栏图标样式 */
.nav-logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

/* 响应式图标大小 */
@media (max-width: 768px) {
  .nav-logo {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 576px) {
  .nav-logo {
    width: 28px;
    height: 28px;
  }
}

/* 导航项样式优化 */
:deep(.navbar-nav .nav-item .nav-link) {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s ease;
}

:deep(.navbar-nav .nav-item .nav-link:hover) {
  background-color: var(--bs-secondary-bg-subtle);
}

/* 网格布局 */
:deep(.grid-cols-2) {
  grid-template-columns: repeat(2, 1fr);
}

:deep(.d-grid) {
  display: grid;
}

/* 适配不同主题 */
:deep(.dropdown-menu) {
  background-color: var(--bs-dropdown-bg);
}

:deep(.dropdown-item:hover) {
  background-color: var(--bs-dropdown-link-hover-bg);
}

/* 搜索容器样式 */
.search-container {
  position: relative;
}

/* 响应式调整 */
@media (max-width: 991.98px) {
  :deep(.navbar) {
    padding: 0.5rem 1rem;
  }
  
  /* 移动端标题居中 */
  :deep(.navbar-brand) {
    text-align: center !important;
    justify-content: center !important;
  }
  
  /* 移动端搜索组件宽度 */
  .search-container {
    width: 100%;
  }
}

@media (min-width: 992px) {
  /* PC端标题在左侧 */
  :deep(.navbar-brand) {
    text-align: left !important;
    justify-content: flex-start !important;
    flex-grow: 0 !important;
  }
}

@media (min-width: 992px) {
  /* PC端下拉强制展开修复 */
  :deep(.nav-item.dropdown) { position: relative; }
  :deep(.nav-item.dropdown .dropdown-menu) { z-index: 9999 !important; }
  :deep(.nav-item.dropdown:hover .dropdown-menu) { display: block !important; }
  :deep(.nav-item.dropdown .dropdown-toggle)[data-bs-toggle="dropdown"] { pointer-events: auto !important; }
  
  /* 用户下拉菜单强制显示 */
  :deep(.dropdown) { position: relative; }
  :deep(.dropdown .dropdown-menu) { z-index: 10000 !important; }
  :deep(.dropdown:hover .dropdown-menu) { display: block !important; }
  :deep(.dropdown .dropdown-toggle)[data-bs-toggle="dropdown"] { pointer-events: auto !important; }
  :deep(.dropdown-menu.show) { display: block !important; }
}
</style>