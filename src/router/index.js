import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import cache from '@/utils/cache'
import utils from '@/utils/utils'
import { useCommStore } from '@/store/comm'
import config from '@/utils/config'
import { setupRouteTitle } from '@/utils/usePageTitle'

/**
 * 路由管理配置
 * 优化点：
 * 1. 分组路由配置，按功能模块组织
 * 2. 优化路由懒加载
 * 3. 增强路由守卫和错误处理
 * 4. 添加详细的类型定义和注释
 * 5. 优化路由配置的可维护性
 */

// 读取配置
const ROUTER_BASE = config.getSync('base_url') || '/'
// 从配置文件同步获取路由模式
const ROUTER_MODE = config.getSync('router_mode') || 'hash'

console.log('路由模式:', ROUTER_MODE)

// 1. 定义路由规则，按功能模块分组
const routes = [
  // 重定向路由
  {
    path: '/index',
    redirect: '/'
  },

  // 核心路由
  {
    path: '/',
    name: '首页',
    component: () => import('@/views/index/pages/index.vue'),
    meta: { 
      title: '首页', 
      requiresAuth: false,
      keepAlive: true
    }
  },
  // 用户相关路由
  {
    path: '/user',
    name: '用户设置',
    component: () => import('@/views/index/pages/user.vue'),
    meta: { 
      title: '用户设置', 
      requiresAuth: true
    }
  },
  {
    path: '/author/:id',
    name: '用户主页',
    component: () => import('@/views/index/pages/author.vue'),
    meta: { 
      title: '用户主页', 
      requiresAuth: false
    },
    props: true
  },

  // 文章相关路由
  {
    path: '/archives/:id',
    name: '文章详情',
    component: () => import('@/views/index/pages/archives.vue'),
    meta: { 
      title: '文章详情', 
      requiresAuth: false
    },
    props: true
  },

  // 分类相关路由
  {
    path: '/category/:id',
    name: '分类页面',
    component: () => import('@/views/index/pages/category.vue'),
    meta: { 
      title: '分类页面', 
      requiresAuth: false
    },
    props: true
  },

  // 标签相关路由
  {
    path: '/tags',
    name: '标签页面',
    component: () => import('@/views/index/pages/tags.vue'),
    meta: { 
      title: '标签', 
      requiresAuth: false
    }
  },
  {
    path: '/tag/:id',
    name: '单个标签页面',
    component: () => import('@/views/index/pages/tags.vue'),
    meta: { 
      title: '单个标签页面', 
      requiresAuth: false
    },
    props: true
  },

  // 独立页面路由
  {
    path: '/archive',
    name: '归档页面',
    component: () => import('@/views/index/pages/page.vue'),
    meta: { 
      title: '网站统计', 
      requiresAuth: false
    },
    props: { pageKey: 'archive' }
  },
  {
    path: '/links',
    name: '友链页面',
    component: () => import('@/views/index/pages/page.vue'),
    meta: { 
      title: '友链', 
      requiresAuth: false
    },
    props: { pageKey: 'links' }
  },
  {
    path: '/:key',
    name: '独立页面',
    component: () => import('@/views/index/pages/page.vue'),
    meta: { 
      title: '独立页面', 
      requiresAuth: false
    },
    props: true,
    beforeEnter: (to, from, next) => {
      const currentKey = (to.params.key || '').trim()
      if (!currentKey) {
        next('/404')
      } else {
        next()
      }
    }
  },

  // 版本更新路由
  {
    path: '/upgrade/theme',
    name: '版本更新',
    component: () => import('@/views/index/pages/theme-upgrade.vue'),
    meta: { 
      title: '版本更新', 
      requiresAuth: true
    }
  },

  // 404 兜底路由（必须放在最后！）
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error.vue'),
    meta: { 
      title: '页面不存在', 
      requiresAuth: false
    }
  }
]

// 2. 动态创建路由历史对象（适配两种模式）
const createRouterHistory = () => {
  // 再次检查路由模式，确保使用最新的配置值
  const currentMode = config.getSync('router_mode') || 'hash'
  console.log('路由模式:', currentMode)
  return currentMode === 'history'
    ? createWebHistory(ROUTER_BASE)
    : createWebHashHistory(ROUTER_BASE)
}

// 3. 创建路由实例
const router = createRouter({
  history: createRouterHistory(),
  routes,
  // 路由跳转后回到顶部
  scrollBehavior: (to, from, savedPosition) => {
    // 只有在真正的路由跳转时才滚动到顶部
    // 避免Fancybox等模态框关闭时触发滚动
    if (savedPosition) {
      return savedPosition
    } else {
      // 只有当路由路径发生变化时才滚动到顶部
      if (to.path !== from.path) {
        return { top: 0, left: 0 }
      }
    }
  }
})

// 全局前置守卫：通用权限校验
router.beforeEach((to, from, next) => {
  // 权限校验
  if (to.meta.requiresAuth) {
    const commStore = useCommStore()
    const userInfo = commStore.getLogin.user
    const isLogin = !utils.is.empty(userInfo)

    if (!isLogin) {
      next('/')
      return
    }
  }

  next()
})

// 全局后置守卫：缓存路由历史
router.afterEach((to) => {
  // 缓存路由历史，保存最近10条
  const historyKey = 'router_history'
  const history = cache.get(historyKey) || []
  
  // 移除重复的路由记录
  const filteredHistory = history.filter(item => item.path !== to.path)
  
  // 添加当前路由到历史记录开头
  filteredHistory.unshift({
    path: to.path,
    name: to.name,
    meta: to.meta,
    timestamp: Date.now()
  })
  
  // 只保留最近10条记录
  const limitedHistory = filteredHistory.slice(0, 10)
  
  // 缓存路由历史，有效期7天
  cache.set(historyKey, limitedHistory, 24 * 7)
})

// 全局错误处理（捕获路由加载/跳转错误）
router.onError((error) => {
  console.error(`[路由错误] ${error.type}: ${error.message}`)
  // 处理组件加载错误
  if (error.message.includes('Failed to fetch dynamically imported module')) {
    console.error('组件加载失败，可能是网络问题或文件不存在')
    // 跳转到404页面
    router.push('/404').catch(() => {})
  }
})



// 设置路由标题管理
setupRouteTitle(router);

// 导出路由实例
export default router