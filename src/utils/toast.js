// src/utils/toast.js
// 基于 Bootstrap 5 Toasts 组件的消息提示库
import * as bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';

class Toast {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.idCounter = 0;
    this.initContainer();
  }

  // 初始化容器
  initContainer() {
    this.container = document.createElement('div');
    this.container.className = 'toast-container position-fixed bottom-0 end-0 p-3 z-50';
    document.body.appendChild(this.container);
  }

  // 生成唯一ID
  generateId() {
    return `toast-${Date.now()}-${++this.idCounter}`;
  }

  // 创建Toast元素
  createToast(options) {
    const id = this.generateId();
    const {
      message,
      title = '',
      delay = 3000,
      autohide = true,
      showClose = true,
      animation = true
    } = options;

    const toastElement = document.createElement('div');
    toastElement.id = id;
    toastElement.className = `toast ${animation ? 'fade' : ''}`;
    toastElement.role = 'alert';
    toastElement.ariaLive = 'assertive';
    toastElement.ariaAtomic = 'true';
    
    // 设置宽度、圆角和动画效果
    toastElement.style.width = '300px';
    toastElement.style.borderRadius = '8px';
    toastElement.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    
    // 为toast-header和toast-body设置具体的圆角，覆盖全局大圆角
    toastElement.style.setProperty('--bs-border-radius', '8px');
    toastElement.style.setProperty('--bs-border-radius-sm', '6px');
    toastElement.style.setProperty('--bs-border-radius-lg', '10px');

    // 根据当前主题模式选择背景和文字颜色
    const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const headerBgClass = isDarkMode ? 'bg-dark bg-opacity-90' : 'bg-white';
    const headerTextClass = isDarkMode ? 'text-light' : 'text-dark';
    const bodyBgClass = isDarkMode ? 'bg-dark bg-opacity-90' : 'bg-white';
    const bodyTextClass = isDarkMode ? 'text-light' : 'text-dark';
    const closeBtnClass = isDarkMode ? 'btn-close btn-close-white' : 'btn-close';

    toastElement.innerHTML = `
      <div class="toast-header ${headerBgClass} ${headerTextClass}">
        <strong class="me-auto">${title || '通知'}</strong>
        <small>${new Date().toLocaleString()}</small>
        ${showClose ? `
          <button type="button" class="${closeBtnClass}" data-bs-dismiss="toast" aria-label="Close"></button>
        ` : ''}
      </div>
      <div class="toast-body ${bodyBgClass} ${bodyTextClass} p-3">
        ${message}
      </div>
    `;

    this.container.appendChild(toastElement);

    // 初始化Bootstrap Toast
    const toast = new bootstrap.Toast(toastElement, {
      delay,
      autohide
    });

    // 存储Toast实例
    this.toasts.set(id, toast);

    // 监听隐藏事件，清理实例
    toastElement.addEventListener('hidden.bs.toast', () => {
      this.toasts.delete(id);
      toastElement.remove();
    });

    return {
      id,
      toast,
      element: toastElement
    };
  }

  // 显示消息
  show(options) {
    const { id, toast } = this.createToast(options);
    toast.show();
    return {
      id,
      close: () => toast.hide()
    };
  }

  // 信息消息
  info(message, options = {}) {
    return this.show({ ...options, message });
  }

  // 成功消息
  success(message, options = {}) {
    return this.show({ ...options, message });
  }

  // 警告消息
  warning(message, options = {}) {
    return this.show({ ...options, message });
  }

  // 错误消息
  error(message, options = {}) {
    return this.show({ ...options, message });
  }

  // 关闭所有消息
  closeAll() {
    this.toasts.forEach((toast) => {
      toast.hide();
    });
    this.toasts.clear();
  }

  // 配置
  config(options) {
    // 可以在这里添加全局配置
    return this;
  }
}

// 创建单例
const toastInstance = new Toast();

// 导出
const ToastPlugin = {
  install(app, options = {}) {
    // 配置
    if (options.config) {
      toastInstance.config(options.config);
    }
    
    // 挂载到Vue实例
    app.config.globalProperties.$toast = toastInstance;
    app.provide('$toast', toastInstance);
  }
};

// 导出为React Hook
export const useToast = () => {
  return toastInstance;
};

export default toastInstance;
export { ToastPlugin };