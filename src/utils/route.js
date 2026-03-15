import router from '@/router/index.js'
import utils from '@/utils/utils'

/**
 * 统一封装路由跳转方法（基于router.push）
 * 解决原生push重复点击报错，兼容router.push所有原生传参方式
 * @param {string|Object} options - 路由跳转参数（和router.push完全一致）
 * @returns {Promise<void>} 跳转成功/失败的Promise（可通过then/catch捕获）
 */
export function push(options) {
  // 1. 边界校验：无跳转参数直接终止
  if (utils.is.empty(options)) {
    return Promise.reject(new Error('路由跳转参数不能为空'))
  }

  // 2. 执行路由跳转：捕获重复点击错误，过滤无意义异常
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