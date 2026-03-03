import { useTitle as useVueUseTitle } from '@vueuse/core';
import { computed, watch, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useCommStore } from '@/store/comm';

/**
 * 页面标题管理 Composable
 * 使用 VueUse 的 useTitle 函数实现页面标题的统一管理
 * 支持静态标题和动态标题
 */
export function usePageTitle() {
  const route = useRoute();
  const commStore = useCommStore();
  
  // 使用 VueUse 的 useTitle 函数
  const title = useVueUseTitle('');
  
  // 获取网站基础标题
  const baseTitle = computed(() => {
    return commStore.siteInfo?.title || 'Xiao-INIS';
  });
  
  // 计算完整标题
  const fullTitle = computed(() => {
    const pageTitle = route.meta.title || route.name || '未知页面';
    return `${pageTitle} - ${baseTitle.value}`;
  });
  
  // 设置标题的函数
  const setTitle = (newTitle) => {
    title.value = newTitle;
  };
  
  // 监听路由变化，更新标题
  watch(
    () => route.path,
    () => {
      setTitle(fullTitle.value);
    },
    { immediate: true }
  );
  
  // 监听网站标题变化，更新页面标题
  watch(
    baseTitle,
    () => {
      setTitle(fullTitle.value);
    }
  );
  
  /**
   * 设置动态标题
   * @param {string} dynamicTitle - 动态标题内容
   * @param {boolean} appendBase - 是否追加基础标题
   */
  const setDynamicTitle = (dynamicTitle, appendBase = true) => {
    if (appendBase) {
      setTitle(`${dynamicTitle} - ${baseTitle.value}`);
    } else {
      setTitle(dynamicTitle);
    }
  };
  
  /**
   * 重置为默认标题（路由配置的标题）
   */
  const resetTitle = () => {
    setTitle(fullTitle.value);
  };
  
  return {
    title,
    fullTitle,
    baseTitle,
    setTitle,
    setDynamicTitle,
    resetTitle
  };
}

/**
 * 路由标题管理工具
 * 用于在路由守卫中统一处理标题
 */
export function setupRouteTitle(router) {
  router.beforeEach((to, from, next) => {
    // 只有当路由的路径发生变化时才更新标题
    if (to.path !== from.path) {
      const commStore = useCommStore();
      const siteTitle = commStore.siteInfo?.title || 'Xiao-INIS';
      const pageTitle = to.meta.title || to.name || '未知页面';
      document.title = `${pageTitle} - ${siteTitle}`;
    }
    next();
  });
}