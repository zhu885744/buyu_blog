// 统一API出口：集中管理所有接口模块，便于维护和扩展
import config from '@/api/config' // 配置相关接口
import authPages from '@/api/auth-pages'

class API {
    constructor() {
        this.config = config
        this['auth-pages'] = authPages
    }
}
export default new API()