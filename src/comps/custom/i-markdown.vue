<!-- src\comps\custom\i-markdown.vue 文章markdown内容渲染组件 -->
<template>
  <div class="markdown-content" v-html="renderedMd"></div>
</template>

<script setup>
import { ref, watch } from 'vue'
// 导入marked核心渲染方法
import { marked } from 'marked'
// 导入highlight.js库和样式
import hljs from 'highlight.js'
import 'highlight.js/styles/agate.css'

// props规范
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

// 存储渲染后的HTML结果
const renderedMd = ref('')

// 初始化渲染方法
const renderMarkdown = (content) => {
  if (!content) {
    renderedMd.value = ''
    return
  }
  
  // 简单处理：直接使用highlight.js处理所有代码
  let processedContent = content
  
  // 匹配并处理代码块
  processedContent = processedContent.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    try {
      const highlighted = hljs.highlight(code, { language: lang || 'plaintext' }).value
      return `<div class="code-block-container">
        <div class="code-block-header">
          <span class="code-language">${lang || 'plaintext'}</span>
          <button class="copy-button" data-code="${code.replace(/"/g, '&quot;')}">
            <i class="bi bi-clipboard"></i>
            <span class="copy-text">复制</span>
          </button>
        </div>
        <pre class="hljs"><code class="language-${lang || 'plaintext'}">${highlighted}</code></pre>
      </div>`
    } catch (error) {
      console.error('代码高亮处理失败:', error)
      return `<div class="code-block-container">
        <div class="code-block-header">
          <span class="code-language">plaintext</span>
          <button class="copy-button" data-code="${code.replace(/"/g, '&quot;')}">
            <i class="bi bi-clipboard"></i>
            <span class="copy-text">复制</span>
          </button>
        </div>
        <pre class="hljs"><code>${code}</code></pre>
      </div>`
    }
  })
  
  // 渲染Markdown
  let html = marked.parse(processedContent, {
    gfm: true,
    breaks: true,
    html: true
  })
  
  // 为所有图片添加 data-fancybox 属性
  html = html.replace(/<img\s+src="([^"]+)"\s+alt="([^"]*)"\s*(.*?)\s*>/g, '<a href="$1" data-fancybox="gallery" data-caption="$2"><img src="$1" alt="$2" $3></a>')
  
  // 安全处理超链接
  html = html.replace(/<a\s+([^>]*)>/g, (match, attributes) => {
    let safeAttributes = attributes.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '')
    safeAttributes = safeAttributes.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '')
    if (!safeAttributes.match(/target\s*=/i)) {
      safeAttributes += ' target="_blank"'
    }
    if (!safeAttributes.match(/rel\s*=/i)) {
      safeAttributes += ' rel="noopener noreferrer"'
    }
    return `<a ${safeAttributes}>`
  })
  
  renderedMd.value = html
}

// 复制按钮点击处理函数
const handleCopyClick = (e) => {
  const button = e.target.closest('.copy-button')
  if (!button) return
  
  const code = button.getAttribute('data-code')
  if (!code) return
  
  // 复制代码到剪贴板
  navigator.clipboard.writeText(code).then(() => {
    // 显示复制成功状态
    const originalText = button.innerHTML
    button.innerHTML = '<i class="bi bi-check"></i><span class="copy-text">已复制</span>'
    button.classList.add('copied')
    
    // 2秒后恢复原始状态
    setTimeout(() => {
      button.innerHTML = originalText
      button.classList.remove('copied')
    }, 2000)
  }).catch(err => {
    console.error('复制失败:', err)
  })
}

// 添加复制按钮事件监听器
const addCopyEventListeners = () => {
  const copyButtons = document.querySelectorAll('.copy-button')
  copyButtons.forEach(button => {
    // 移除可能存在的旧事件监听器
    button.removeEventListener('click', handleCopyClick)
    // 添加新的事件监听器
    button.addEventListener('click', handleCopyClick)
  })
}

// 首次加载立即渲染
renderMarkdown(props.modelValue)

// 监听内容变化，重新渲染
watch(
  () => props.modelValue,
  (newVal) => {
    renderMarkdown(newVal)
    // 延迟添加事件监听器，确保DOM已更新
    setTimeout(addCopyEventListeners, 100)
  },
  { immediate: true, deep: false }
)

// 组件挂载后添加事件监听器
import { onMounted } from 'vue'
onMounted(() => {
  setTimeout(addCopyEventListeners, 100)
})
</script>

<style>
/* 代码块容器样式 */
.code-block-container {
  margin-bottom: 1.2rem;
  border-radius: 0.5rem;
  border: 1px solid var(--bs-border-color);
  overflow: hidden;
}

/* 代码块头部样式 */
.code-block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid var(--bs-border-color);
}

/* 代码语言标签 */
.code-language {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--bs-body-color);
  opacity: 0.8;
}

/* 复制按钮样式 */
.copy-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: transparent;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.25rem;
  font-size: 0.75rem;
  color: var(--bs-body-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.copy-button:hover {
  background-color: var(--bs-tertiary-bg);
  border-color: var(--bs-primary);
}

.copy-button:active {
  transform: scale(0.95);
}

.copy-button.copied {
  background-color: var(--bs-success);
  border-color: var(--bs-success);
  color: white;
}

/* 代码块样式 */
pre {
  margin: 0;
  border-radius: 0;
  padding: 1rem;
  overflow-x: auto;
  background-color: #282c34;
  border: none;
}

/* 行内代码样式 */
code:not(pre code) {
  background-color: var(--bs-tertiary-bg);
  padding: 0.15rem 0.3rem;
  border-radius: 0.25rem;
  font-size: 0.95em;
  color: var(--bs-body-color);
}

/* 适配深色模式下行内代码 */
.dark code:not(pre code) {
  background-color: #334155;
  color: #f8fafc;
}
</style>