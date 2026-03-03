import router from '@/router/index.js'
import utils from '@/utils/utils'

/**
 * 统一封装路由跳转方法（基于router.push）
 * 解决原生push重复点击报错，支持单次前置/后置处理（不污染全局守卫）
 * 兼容router.push所有原生传参方式：字符串/对象/命名路由
 * 适配Vue3+Pinia，复用全局权限/标题逻辑，无重复守卫注册问题
 * @param {string|Object} options - 路由跳转参数（和router.push完全一致）
 * @returns {Promise<void>} 跳转成功/失败的Promise（可通过then/catch捕获）
 */
export function push(options) {
  // 1. 边界校验：无跳转参数直接终止
  if (utils.is.empty(options)) {
    return Promise.reject(new Error('路由跳转参数不能为空'))
  }

  // 2. 单次跳转前置处理（仅当前次生效，可自定义业务逻辑）
  const beforeHandle = (to, from) => {
    // 示例：自定义单次跳转逻辑（埋点、临时权限校验、弹窗确认等）
    // console.log('【单次跳转前置】', from.path, '→', to.path)
  }

  // 3. 单次跳转后置处理（仅当前次生效，默认滚动到顶部，可自定义）
  const afterHandle = (to, from) => {
    // 示例：关闭全局弹窗、更新导航激活状态、埋点统计等
    // const commStore = useCommStore()
    // commStore.closeAllDialog()
  }

  // 4. 注册**真正的一次性守卫**（Vue3路由守卫返回「移除函数」，执行即销毁）
  const removeBeforeEach = router.beforeEach((to, from, next) => {
    beforeHandle(to, from) // 执行单次前置逻辑
    next() // 放行路由
    removeBeforeEach() // 执行后立即移除前置守卫，避免重复注册
  })
  const removeAfterEach = router.afterEach((to, from) => {
    afterHandle(to, from) // 执行单次后置逻辑
    removeAfterEach() // 执行后立即移除后置守卫，避免重复注册
  })

  // 5. 执行路由跳转：捕获重复点击错误，过滤无意义异常
  return new Promise((resolve, reject) => {
    router.push(options)
      .then(() => {
        resolve() // 跳转成功
      })
      .catch((err) => {
        // 过滤「重复点击相同路由」的无意义错误，视为成功
        if (err.message?.includes('Avoided redundant navigation to current location')) {
          resolve()
        } else {
          console.error('【路由push失败】', err.message)
          reject(err) // 真实错误抛出，供业务代码catch处理
        }
      })
  })
}

/**
 * 统一封装路由替换方法（基于router.replace，逻辑和push一致）
 * 用法和push完全相同，区别：replace不会向历史记录添加新记录（适用于登录/重定向）
 * @param {string|Object} options - 路由跳转参数
 * @returns {Promise<void>}
 */
export function replace(options) {
  if (utils.is.empty(options)) {
    return Promise.reject(new Error('路由跳转参数不能为空'))
  }

  // 自定义replace专属前置处理（和push不一致时单独写，一致可直接复用beforeHandle）
  const beforeHandle = (to, from) => {
    // 示例：replace跳转专属逻辑（如登录后替换登录页，防止回退）
    // console.log('【单次replace前置】', from.path, '→', to.path)
  }

  // 自定义replace专属后置处理（默认复用滚动到顶部，可自定义）
  const afterHandle = (to, from) => {
    // 示例：登录成功后更新用户信息、刷新缓存等
    // const commStore = useCommStore()
    // commStore.refreshUserInfo()
  }

  // 一次性守卫（同push逻辑，执行后自动销毁）
  const removeBeforeEach = router.beforeEach((to, from, next) => {
    beforeHandle(to, from)
    next()
    removeBeforeEach()
  })
  const removeAfterEach = router.afterEach((to, from) => {
    afterHandle(to, from)
    removeAfterEach()
  })

  // 执行路由替换，捕获异常
  return new Promise((resolve, reject) => {
    router.replace(options)
      .then(() => {
        resolve()
      })
      .catch((err) => {
        if (err.message?.includes('Avoided redundant navigation to current location')) {
          resolve()
        } else {
          console.error('【路由replace失败】', err.message)
          reject(err)
        }
      })
  })
}

/**
 * 【新增】封装返回上一页方法（兼容历史记录，避免无记录时报错）
 * @param {number} step - 返回步数，默认1（上一页）
 * @returns {Promise<void>}
 */
export function goBack(step = 1) {
  return new Promise((resolve) => {
    // 判断是否有历史记录，无则跳首页（避免window.history.go(-1)报错）
    if (window.history.length <= 1) {
      push('/').then(() => resolve())
    } else {
      router.go(-step)
      resolve()
    }
  })
}