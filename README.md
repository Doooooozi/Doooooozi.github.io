# 极简高定导航站 (Minimalist Premium Navigation)

基于纯原生 HTML/CSS/JavaScript 构建的高性能、极简风格静态导航网站。

## ✨ 核心特性

- **极致流畅 (Butter Smooth)**：内嵌 Lenis 平滑阻尼引擎，提供 60fps 原生级滚动体验。
- **光学级毛玻璃 (Progressive Blur)**：使用 CSS `mask-image` 实现硬件加速的渐进式毛玻璃遮罩，完美还原 Figma 质感。
- **物理追踪滑块**：导航选中态使用 `transform` 动态追踪坐标，无重排 (Reflow) 性能损耗。
- **事件委托架构**：导航点击事件 O(1) 级绑定，支持无限量分类节点扩展。
- **无障碍访问 (A11y)**：全量支持 `aria-current` 等屏幕阅读器标签。
- **零构建工具 (Zero Build)**：标准的静态目录结构，直接丢进 GitHub Pages 即可秒开。

## 📁 目录结构

\`\`\`text
├── assets/
│   ├── css/
│   │   ├── fonts/           # 推荐引入 MiSans-Regular.woff2
│   │   └── style.css        # 全局与组件样式
│   ├── images/
│   │   └── logos/           # 站点 Logo
│   └── js/
│       └── main.js          # 物理滚动引擎与交互逻辑
├── 404.html                 # 404 错误页
├── index.html               # 站点骨架
└── README.md
\`\`\`

## 🚀 部署指南

本项目为纯静态结构，推荐使用 **GitHub Pages** 或 **Vercel** 部署。
1. Fork 或 clone 本仓库。
2. 放入你的 `MiSans-Regular.woff2` 字体文件到 `/assets/css/fonts/` 目录。
3. 开启 GitHub Repo -> Settings -> Pages。
4. 部署完成。

## 🎨 样式定制

所有的核心尺寸均在 `assets/css/style.css` 顶部的 `:root` 变量中定义：
- `--sidebar-expanded-width`: 侧边栏展开宽度
- `--item-height`: 菜单项高度
- `--mask-height`: 渐变毛玻璃垫片高度