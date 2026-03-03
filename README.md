### 📖 项目简介

inis buyu 是一款基于 Vue 3 + JavaScript + Vite 开发的现代化博客主题，专为个人博客和内容创作者设计。

**设计理念**：简约而不简单，专注于内容的呈现，为读者提供沉浸式的阅读体验。

**技术栈**：
- **前端框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **路由管理**：Vue Router
- **状态管理**：Pinia
- **样式方案**：Bootstrap 5 + 自定义 CSS
- **Markdown渲染**：支持文章内容的 Markdown 解析

**核心优势**：
- **高性能**：Vite 构建，代码分割，懒加载等优化技术
- **响应式**：完美适配桌面、平板、手机等各种设备
- **现代化**：使用 Vue 3 最新特性，代码结构清晰
- **易部署**：支持多种部署平台，提供详细的部署指南
- **用户友好**：直观的界面设计，流畅的交互体验

### 🛠️ 开发体验
- **热更新**：开发过程中实时预览修改效果
- **ESLint集成**：代码质量检查，保持代码风格一致
- **TypeScript支持**：可选的类型检查，提升代码可靠性
- **模块化设计**：组件化开发，便于维护和扩展

## 开发
```
# 拉取代码
git clone https://github.com/zhu885744/xiao-inisv1-vue.git

# 进入项目目录
cd xiao-inisv1-vue

# 安装项目依赖
npm install

# 开启本地开发服务器（默认地址：http://localhost:3000，热更新实时预览）
npm run dev
```

## 打包
```
# 构建生产环境包（打包后生成dist目录，包含压缩后的静态文件，可直接部署）
npm run build

# 本地预览生产打包结果（验证打包后功能是否正常，无需部署服务器）
npm run preview
```

## 部署

### 路由模式部署指南

本项目支持两种路由模式：Hash模式和History模式。不同的路由模式需要不同的部署配置。

#### 1. Hash模式部署

Hash模式是Vue Router的默认模式，URL中会包含一个`#`符号，例如：`http://example.com/#/archives/1`。

**部署步骤：**
1. 确保`vite.config.js`或路由配置中使用Hash模式
2. 执行`npm run build`打包项目
3. 将生成的`dist`目录上传到服务器
4. 无需特殊服务器配置，直接访问即可

**优点：** 部署简单，无需服务器配置
**缺点：** URL中包含`#`符号，不够美观

#### 2. History模式部署

History模式使用HTML5 History API，URL更加干净，例如：`http://example.com/archives/1`。

**部署步骤：**
1. 在`vite.config.js`中配置基础路径：
   ```javascript
   export default defineConfig({
     base: '/', // 填写你的网站根路径
     // 其他配置...
   })
   ```

2. 在路由配置中使用History模式：
   ```javascript
   const router = createRouter({
     history: createWebHistory(),
     routes: [
       // 路由配置...
     ]
   })
   ```

3. 执行`npm run build`打包项目

4. 将生成的`dist`目录上传到服务器

5. **配置服务器重写规则**（关键步骤）：

   **Nginx配置示例：**
   ```nginx
   server {
     listen 80;
     server_name example.com;
     root /path/to/your/dist;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

   **Apache配置示例：**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

   **GitHub Pages部署：**
   - 使用Hash模式或
   - 在根目录创建`404.html`文件，内容与`index.html`相同

**优点：** URL美观，符合RESTful风格
**缺点：** 需要服务器配置，否则刷新页面会出现404错误

### 部署平台推荐

- **Vercel**：零配置部署，支持History模式
- **Netlify**：简单易用，支持自动部署
- **GitHub Pages**：适合静态网站，推荐使用Hash模式
- **阿里云/腾讯云**：适合企业级应用，需要手动配置服务器