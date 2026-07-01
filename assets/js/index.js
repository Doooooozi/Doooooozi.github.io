// =========================================================
// 🌟 0. 核心数据引擎 (读取同级 data.json)
// =========================================================
let SITE_DATA = { site: { title: "DOOOZZZI", modules: {1:[], 2:[], 3:[]} }, categories: [] };
let lenis, lenisMain;

async function fetchSiteData() {
  try {
    const res = await fetch('./data.json', { cache: 'no-store' });
    if (res.ok) {
      SITE_DATA = await res.json();
    }
  } catch (e) {
    console.warn("未找到外部 data.json，尝试读取本地草稿箱...");
    const cachedData = localStorage.getItem('NAV_SITE_DATA_V1');
    if (cachedData) SITE_DATA = JSON.parse(cachedData);
  }
  
  // 数据获取完毕，开始爆兵渲染
  renderApp();
}

// =========================================================
// 🌟 1. 全局 UI 渲染工厂
// =========================================================
function renderApp() {
  // 1.1 渲染全局标题与 Logo
  document.title = SITE_DATA.site.title || '我的极简导航';
  document.getElementById('hollowBgText').textContent = SITE_DATA.site.title || 'DOOOZZZI';
  
  const logoBox = document.getElementById('siteLogoBox');
  if (SITE_DATA.site.logo) {
    logoBox.innerHTML = `<img src="${SITE_DATA.site.logo}" style="width:100%;height:100%;object-fit:contain;">`;
    logoBox.style.backgroundColor = 'transparent';
  } else {
    logoBox.innerHTML = 'LOGO';
    logoBox.style.backgroundColor = '#000';
  }

  // 1.2 渲染左侧分类菜单
  const navMenu = document.getElementById('navMenu');
  let navHtml = `<div class="active-highlight" id="highlightBox"></div>`;
  const sortedCategories = SITE_DATA.categories.sort((a,b) => a.order - b.order);
  
  sortedCategories.forEach((cat, index) => {
    const icon = cat.iconSvg ? `<img src="${cat.iconSvg}" style="width:100%;height:100%;">` : `svg`;
    navHtml += `
      <a href="#${cat.id}" class="nav-item ${index === 0 ? 'active' : ''}" ${index === 0 ? 'aria-current="page"' : ''}>
        <div class="icon-wrapper">${icon}</div><span class="text">${cat.name}</span>
      </a>`;
  });
  navMenu.innerHTML = navHtml;

  // 1.3 渲染右侧内容卡片矩阵
  const mainContainer = document.getElementById('mainContentContainer');
  mainContainer.innerHTML = '';
  
  sortedCategories.forEach(cat => {
    let linksHtml = '';
    const sortedLinks = cat.links.sort((a,b) => a.order - b.order);
    
    sortedLinks.forEach(link => {
      const icon = link.image 
        ? `<div class="site-logo" style="border:none;"><img src="${link.image}" style="width:100%;height:100%;object-fit:cover;"></div>` 
        : `<div class="site-logo"><span class="logo-placeholder">${link.placeholder.replace('\n', '<br>')}</span></div>`;
      
      linksHtml += `
        <a href="${link.url}" class="site-card" target="_blank">
          <div class="card-header">${icon}<h3 class="site-name">${link.name}</h3></div>
          <div class="site-desc">${link.desc || ''}</div>
        </a>`;
    });

    mainContainer.insertAdjacentHTML('beforeend', `
      <section class="category-section" id="${cat.id}">
        <h2 class="category-title"># ${cat.name}</h2>
        <div class="card-grid">${linksHtml}</div>
      </section>
    `);
  });

  // 1.4 渲染 Footer Module 1 (普通按钮组)
  const mod1 = SITE_DATA.site.modules[1] || [];
  let m1Html = '';
  mod1.sort((a,b) => a.order - b.order).forEach((link, i) => {
    if(i > 0) m1Html += `<div class="footer-divider"></div>`;
    const icon = link.image ? `<img src="${link.image}" style="width:100%;height:100%;">` : `icon`;
    m1Html += `<a href="${link.url}" class="footer-action-item" target="_blank"><div class="icon-wrapper">${icon}</div><span class="text">${link.name}</span></a>`;
  });
  document.getElementById('footerModule1').innerHTML = m1Html;

  // 1.5 渲染 Footer Module 2 (黑块)
  const mod2 = SITE_DATA.site.modules[2]?.[0];
  const fm2 = document.getElementById('footerModule2');
  if (mod2) {
    fm2.href = mod2.url;
    fm2.querySelector('.db-icon').innerHTML = mod2.image ? `<img src="${mod2.image}" style="width:100%;height:100%;">` : 'icon';
    fm2.querySelectorAll('.db-icon')[1].innerHTML = mod2.image ? `<img src="${mod2.image}" style="width:100%;height:100%;">` : 'icon';
    
    document.getElementById('dbRowText').textContent = mod2.name;
    const nameStr = mod2.name || '';
    const char1 = nameStr.substring(0,2) || '文本';
    const char2 = nameStr.substring(2,4) || '文本';
    document.getElementById('dbStackText').innerHTML = `<span>${char1}</span><span>${char2}</span>`;
  } else {
    fm2.style.display = 'none'; // 没配就不显示
  }

  // 1.6 渲染 Footer Module 3 (小方块组)
  const mod3 = SITE_DATA.site.modules[3] || [];
  const shareExpandedBox = document.getElementById('shareExpandedBox');
  shareExpandedBox.innerHTML = '';
  mod3.sort((a,b) => a.order - b.order).forEach((link, i) => {
    const icon = link.image ? `<img src="${link.image}" style="width:100%;height:100%;">` : `${i+1}`;
    shareExpandedBox.insertAdjacentHTML('beforeend', `<a href="${link.url}" class="s-mini-icon" target="_blank" title="${link.name}">${icon}</a>`);
  });

  // 等 DOM 全部渲染完，立刻启动物理引擎！
  initPhysicsEngines();
}

// =========================================================
// 🌟 2. 物理与交互引擎初始化 (必须在 DOM 生成后执行)
// =========================================================
function initPhysicsEngines() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const sidebarContent = document.querySelector('.sidebar-content');
  const scrollableBody = document.getElementById('scrollableBody');
  const highlightBox = document.getElementById('highlightBox');
  const menuItems = document.querySelectorAll('.nav-menu .nav-item');

  // 初始化 Lenis
  lenis = new Lenis({
    wrapper: sidebarContent, 
    content: sidebarContent.querySelector('.nav-menu'), 
    duration: 0.8, 
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  lenisMain = new Lenis({
    wrapper: scrollableBody,
    content: scrollableBody.querySelector('.content-container'),
    duration: 0.8,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    lenisMain.raf(time); 
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // 滑块对齐逻辑
  function alignHighlight(el, animate = true) {
    if (!el) return;
    const centerOffset = - (sidebarContent.clientHeight / 2) + (el.offsetHeight / 2);
    const maxScroll = Math.max(0, sidebarContent.scrollHeight - sidebarContent.clientHeight);
    const targetScroll = Math.max(0, Math.min(el.offsetTop + centerOffset, maxScroll));
    
    if (!animate) {
      highlightBox.style.transition = 'none';
      highlightBox.style.transform = `translateY(${el.offsetTop}px)`;
    } else {
      const currentScroll = sidebarContent.scrollTop;
      if (Math.abs(targetScroll - currentScroll) > 2) {
        highlightBox.style.transition = 'none';
        highlightBox.style.transform = `translateY(${el.offsetTop}px)`;
        lenis.scrollTo(targetScroll, { duration: 0.5, easing: (t) => 1 - Math.pow(1 - t, 4) });
        requestAnimationFrame(() => { requestAnimationFrame(() => { highlightBox.style.transition = 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; }); });
      } else {
        void highlightBox.offsetHeight; 
        highlightBox.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        highlightBox.style.transform = `translateY(${el.offsetTop}px)`;
      }
    }
  }

  // 重置首项
  function resetToFirstItem() {
    const firstItem = menuItems[0];
    if (!firstItem) return;
    menuItems.forEach(nav => { nav.classList.remove('active'); nav.removeAttribute('aria-current'); });
    firstItem.classList.add('active'); firstItem.setAttribute('aria-current', 'page');
    alignHighlight(firstItem, false);
    lenis.scrollTo(0, { immediate: true }); lenisMain.scrollTo(0, { immediate: true });
  }
  resetToFirstItem();

  // 事件委托联动
  document.querySelector('.nav-menu').addEventListener('click', function(e) {
    const clickedItem = e.target.closest('.nav-item');
    if (!clickedItem) return;
    e.preventDefault(); 
    menuItems.forEach(nav => { nav.classList.remove('active'); nav.removeAttribute('aria-current'); });
    clickedItem.classList.add('active'); clickedItem.setAttribute('aria-current', 'page');
    alignHighlight(clickedItem, true);

    const targetId = clickedItem.getAttribute('href'); 
    if (targetId && targetId.startsWith('#')) {
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        lenisMain.scrollTo(targetSection, { offset: -80, duration: 1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      }
    }
  });

  // 滚动条呼吸
  const customScrollbar = document.getElementById('customScrollbar');
  const customThumb = document.getElementById('customThumb');
  let scrollTimeout;
  scrollableBody.addEventListener('scroll', () => {
    const scrollHeight = scrollableBody.scrollHeight; const clientHeight = scrollableBody.clientHeight; const scrollTop = scrollableBody.scrollTop;
    if (scrollHeight <= clientHeight) return;
    const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 40); 
    const progress = scrollTop / (scrollHeight - clientHeight);
    customThumb.style.height = `${thumbHeight}px`; customThumb.style.transform = `translateY(${progress * (clientHeight - thumbHeight)}px)`;
    customScrollbar.classList.add('is-active');
    clearTimeout(scrollTimeout); scrollTimeout = setTimeout(() => customScrollbar.classList.remove('is-active'), 400);
  });

  // 固定面板
  document.getElementById('pinBtn').addEventListener('click', (e) => {
    e.preventDefault(); document.getElementById('sidebar').classList.toggle('is-pinned');
  });

  // 返回顶部
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    scrollableBody.addEventListener('scroll', () => {
      if (scrollableBody.scrollTop > 300) backToTopBtn.classList.add('is-visible');
      else backToTopBtn.classList.remove('is-visible');
    });
    backToTopBtn.addEventListener('click', () => {
      lenisMain.scrollTo(0, { duration: 1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    });
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const activeItem = document.querySelector('.nav-menu .nav-item.active');
      alignHighlight(activeItem, false);
      scrollableBody.dispatchEvent(new Event('scroll'));
    }, 100); 
  });
}

// 🌟 页面加载直接点火
fetchSiteData();