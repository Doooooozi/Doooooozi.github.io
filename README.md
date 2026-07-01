# 导航网站：古法手搓工艺与现代创新编程的极致交响 (习作)

基于纯原生 HTML/CSS/JavaScript 构建的高性能、极简风格静态导航网站。致力于用科学极简的纯粹代码，摒弃框架依赖，直接操作浏览器底层物理渲染引擎，还原像素级的视觉质感与流体交互体验。

## ✨ 核心视觉架构 (Visual Engineering Features)

### 1. 物理刚体与流体网格 (Rigid Body & Fluid Matrix)
告别依赖默认机制导致的排版错乱。在数据表格的设计上，采用 `table-layout: fixed` 强制夺取浏览器渲染控制权：
- **操作列与状态列**：注入绝对尺寸（如 `44px`, `56px`, `150px`），设定为**不可压缩的绝对刚体**。
- **内容列（名称 / URL）**：利用 `30% / 70%` 比例划分为**动态流体空间**。
配合父级 `.truncate` 结界的百分百填充，使得超长文本在任何极端屏幕下，都能在触顶前 1px 精准截断（Ellipsis），彻底杜绝因数据长度引起的 UI 崩溃。

### 2. 光学透镜与图层防线 (Optical Masking)
- **渐隐毛玻璃透镜**：在侧边栏及主内容区的上下边缘，利用 CSS `mask-image` 实现硬件加速的 Alpha 通道渐进式遮罩。彻底告别生硬的白色渐变遮罩导致的“脏灰”色块。
- **碰撞消散引擎**：在工具栏响应式挤压时，摒弃僵硬的换行逻辑。当动态的 Tabs 栏与绝对定宽的操作按钮区发生重叠碰撞，触发 Alpha `linear-gradient` 物理防线，使得左侧溢出文本在右侧 32px 缓冲带内实现 `100% -> 0%` 的平滑视觉蒸发。

### 3. Typography 基准降维 (Font Matrix)
将所有零散的字号配置（Magic Numbers）从子元素中拔除，于父级核心模块注入 `font-size: 12px; line-height: 1.5` 基准线。通过 DOM 层叠继承树（Inheritance Tree）向下辐射，仅在表头或特定重音处使用 `font-weight: 700`。以代码世界的纪律，捍卫设计图上的像素级一致性。

### 4. 拟物级状态机交互 (Custom Damping Scrollbars)
全站取缔丑陋的系统原生滚动条，基于 JS 重算视图视口差（Client vs Scroll）。
- **交互暗示 (Scrollbar Cue)**：借鉴 macOS 原生体验，当表格数据渲染完成或窗口尺寸变窄导致内容潜藏时，横/纵向自定义滑块会主动“呼吸”浮现 1000ms 作为视觉契约，若无操作则无声潜水，确保页面绝对的视觉留白。

### 5. DOM 降维隔离术 (Layer Decoupling)
彻底解决 WebKit 引擎下 `mask-image` 与 `background-clip: text` 的底层渲染死锁 Bug。针对极简大字背景，采用“父级边界约束 + 子级纹理裁切”的物理隔离法，打造了最纯净的文本镂空与背景条纹渲染。

---

## 🗺️ 架构演进路线图 (Architecture Roadmap)

为了推动界面结构与内容数据的彻底解耦，提升站点的可维护性，本项目规划了三个阶段的演进路线：

### 🟢 Lv.1: 纯享静态与数据分离 (当前阶段)
- **状态**：页面重构完毕，数据已被提取至核心 JS 对象（如 `SITE_DATA`）。
- **核心目标**：夯实所有的物理视觉结界。完成定制化阻尼滚动引擎、响应式网格降维以及横纵向联动滚动的底层搭建。数据渲染已通过纯原生 DOM 操作进行无感刷新。

### 🟡 Lv.2: 无后端伪 CMS 引擎 (开发中)
- **目标**：不依赖任何服务端（Serverless），在纯前端实现可视化数据配置闭环。
- **核心工作流**：
  1. **状态代理**：初始化优先读取浏览器 `LocalStorage` 用户缓存，降级读取本地 `config.js`。
  2. **可视化中枢**：开发带毛玻璃滤镜的极简配置面板（Modal），支持增/删/拖拽排序。
  3. **无缝热重载**：点击保存后，内存重写并触发渲染树重构，实现“所见即所得”。
  4. **固化下载**：内置 Blob API，一键将最新 JSON 内存打包下载为实体文件。开发者覆写本地文件后 Push 至 Git 即可完成公网热更新。

### 🔴 Lv.3: 无头 CMS 动态驱动 (Future)
- **目标**：拥抱 Headless CMS 动态生态（如 Strapi / Notion API）。
- **方案**：因前期已实现绝佳的 UI-Data 彻底解耦，此阶段仅需将 `LocalStorage` 的 I/O 操作替换为 Fetch/Axios 网络请求。前端渲染组件与光学滤镜无需一行修改即可平滑升维。

---

## 📁 目录结构 (Directory Structure)

```text
my-nav-site/
├── admin.html               # 导航后台管理 (CMS 挂载点)
├── index.html               # 前台展示大盘
├── assets/
│   ├── css/
│   │   ├── base.css         # 核心 Token 库 (变量、字体引入)
│   │   ├── sidebar.css      # 侧边栏光学与状态引擎
│   │   ├── index-main.css   # 前台展示专属布局
│   │   └── admin-main.css   # CMS 数据网格、刚体/流体引擎
│   └── js/
│       ├── index.js         # 前台物理滚动引擎 (Lenis/Staggered Marquee)
│       └── admin.js         # 后台数据代理、DOM 挂载与横向状态机
└── README.md                # 架构与部署规范
```


## 🚀 部署指南 (Deployment)

纯静态架构方案，零构建 (Zero Build Process)。
推荐依托于 GitHub Pages、Vercel 或 Netlify 免费生态。在 Lv.2 阶段，只需将配置面板导出的最新 JSON 文件推送到 Repo 根目录，CI/CD 引擎即可在极速间完成全球 CDN 分发。
