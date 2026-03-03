import cache from '@/utils/cache'
import utils from '@/utils/utils'
import axios from '@/utils/request'

const authPages = {
    column: (params = {}) => {
        return new Promise(async (resolve, reject) => {
            // 缓存名称
            const cacheName = `auth-pages-column?${JSON.stringify(params)}`

            // 读取缓存
            if (cache.has(cacheName)) return resolve(cache.get(cacheName))

            // 请求数据
            const { code, msg, data } = await axios.get('/api/auth-pages/column', params).catch(reject)

            if (code !== 200) return resolve(msg)

            // 缓存数据
            cache.set(cacheName, data, inis.cache)
            resolve(data)
        })
    },
}

export default authPages
