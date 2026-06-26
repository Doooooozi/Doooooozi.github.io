# 极简高定导航站 (Minimalist Premium Navigation)

基于纯原生 HTML/CSS/JavaScript 构建的高性能、极简风格静态导航网站。致力于用最纯粹的代码，还原极致的 UI 质感与交互体验。

## ✨ 核心特性 (Features)

- **极致流畅 (Butter Smooth)**：内嵌 Lenis 平滑阻尼引擎，提供 60fps 原生级物理滚动体验。
- **光学级毛玻璃 (Progressive Blur)**：使用 CSS `mask-image` 实现硬件加速的渐进式毛玻璃遮罩，完美还原 Figma 顶级质感，告别渲染黑块。
- **物理追踪滑块**：导航选中态使用 `transform` 动态追踪坐标，杜绝重排 (Reflow) 性能损耗。
- **事件委托架构**：导航点击事件 O(1) 级绑定，支持无限量分类节点扩展，内存占用极低。
- **无障碍访问 (A11y)**：全量支持 `aria-current` 等国际标准屏幕阅读器标签。
- **零构建工具 (Zero Build)**：标准静态目录结构，开箱即用，秒级部署。

## 📁 目录结构 (Structure)

\`\`\`text
my-nav-site/
├── assets/
│   ├── css/
│   │   ├── fonts/
│   │   │   └── MiSans/      # 本地字体文件库 (建议包含 Regular/Medium/Bold.woff2)
│   │   └── style.css        # 核心样式与 CSS 变量设定
│   ├── images/
│   │   └── logos/           # 站点核心视觉资源
│   └── js/
│       └── main.js          # 物理滚动引擎与事件委托交互逻辑
├── 404.html                 # 极简错误页
├── index.html               # 站点主骨架与侧边栏结构
└── README.md                # 项目架构说明
\`\`\`

## 🚀 部署指南 (Deployment)

本项目为纯静态架构，推荐使用 **GitHub Pages**、**Vercel** 或 **Netlify** 进行零成本托管。

1. 克隆或下载本仓库代码。
2. 确保 `/assets/css/fonts/MiSans/` 目录下已放置对应的 `woff2` 字体文件。
3. 将代码推送到 GitHub。
4. 在仓库 `Settings -> Pages` 中开启部署，或直接导入至 Vercel。
5. 尽情享受丝滑的浏览体验。

## 📝 内容管理路线图 (CMS Roadmap)

作为一个持续生长的导航站，本项目的侧边栏类目与右侧内容区支持以下几种内容管理演进方式：

* **Lv.1 静态手写 (当前)**：直接在 `index.html` 中维护分类与锚点，适合初期的视觉走查与框架定型。
* **Lv.2 数据分离 (计划)**：引入 `data.js` 配置文件。将所有站点链接与分类目录抽离为 JSON 对象，通过 JS 动态渲染。实现“改数据即可更新界面”，彻底保护 UI 结构。
* **Lv.3 无头 CMS (进阶)**：未来可接入 Decap CMS (原 Netlify CMS) 等无头内容管理系统。提供可视化的登录后台与设置弹窗，实现在线随时增加、修改导航分类，系统自动触发 GitHub Actions 重新编译静态页面。

## 🎨 样式定制 (Customization)

所有核心尺寸均在 `assets/css/style.css` 顶部的 `:root` 全局变量中定义，改动即可全站生效：

- `--sidebar-collapsed-width`: 侧边栏收起时的宽度 (默认 70px)
- `--sidebar-expanded-width`: 侧边栏展开宽度 (默认 240px)
- `--item-height`: 菜单项高度 (默认 44px)
- `--mask-height`: 光学级渐变毛玻璃垫片高度 (默认 40px)

---
*Crafted with minimalist design philosophy.*