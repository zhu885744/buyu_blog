import cache from '@/utils/cache'
import utils from '@/utils/utils'
import { push } from '@/utils/route'
import { useAuthPagesStore } from '@/store/auth-pages'

const config = {
    menuWidth: 140,
    customClass: 'dark-howdy-menu scale-up-top-left',
    useLongPressInMobile: true,
    menuWrapperCss: {
        background: '#0b0b0bcc',
        borderRadius: '8px',
        padding: '5px 4px',
        boxShadow: '#00000080 0 10px 30px',
        lineColor: 'rgba(255,255,255,.1)',
        lineMargin: '5px 10px',
        backdropFilter: 'blur(10px)',
    },
    menuItemCss: {
        arrowSize: '10px',
        labelColor: '#FFF',
        hoverLabelColor: '#FFF',
        arrowColor: '#ffffff00'
    },
    menuList: [],
}

const list = async () => {
    return []
}

export { list, config }