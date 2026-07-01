// 🌟 拦截浏览器原生的“记忆滚动”，强迫每次 F5 都老老实实在顶部
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// =========================================================
// 🌟 0. 核心数据引擎 (读取同级 data.json + 绝对兜底防线)
// =========================================================
let SITE_DATA = {
  site: {
    title: "DOOOZZZI",
    favicon: "",
    logo: "",
    modules: {
      1: [
        { id: "sm_1_1", name: "模块链接未连接...", url: "#", image: "", placeholder: "icon\nSVG", order: 0 }
      ],
      2: [],
      3: []
    }
  },
  categories: [
    {
      id: "cat_1", name: "默认分类 (请使用 Live Server 运行)", order: 0, iconSvg: "",
      links: [
        { id: "link_1", name: "安全策略拦截", url: "#", image: "", placeholder: "⚠️\nCORS", desc: "由于双击本地运行 (file://)，浏览器切断了数据读取权限。请使用 VS Code 的 Live Server 启动此页面。", order: 0 }
      ]
    }
  ]
};

let lenis, lenisMain;

async function fetchSiteData() {
  try {
    const res = await fetch('./data.json', { cache: 'no-store' });
    if (res.ok) {
      SITE_DATA = await res.json();
    } else {
      throw new Error('JSON Fetch Failed');
    }
  } catch (e) {
    const cachedData = localStorage.getItem('NAV_SITE_DATA_V1');
    if (cachedData) {
      SITE_DATA = JSON.parse(cachedData);
    }
  }
  
  renderApp();
}

// =========================================================
// 🌟 1. 全局 UI 渲染工厂
// =========================================================
function renderApp() {
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

  const mod1 = SITE_DATA.site.modules[1] || [];
  let m1Html = '';
  mod1.sort((a,b) => a.order - b.order).forEach((link, i) => {
    if(i > 0) m1Html += `<div class="footer-divider"></div>`;
    const icon = link.image ? `<img src="${link.image}" style="width:100%;height:100%;">` : `icon`;
    m1Html += `<a href="${link.url}" class="footer-action-item" target="_blank"><div class="icon-wrapper">${icon}</div><span class="text">${link.name}</span></a>`;
  });
  document.getElementById('footerModule1').innerHTML = m1Html;

  const mod2 = SITE_DATA.site.modules[2]?.[0];
  const fm2 = document.getElementById('footerModule2');
  if (mod2) {
    fm2.style.display = 'block';
    fm2.href = mod2.url;
    fm2.querySelector('.db-icon').innerHTML = mod2.image ? `<img src="${mod2.image}" style="width:100%;height:100%;">` : 'icon';
    fm2.querySelectorAll('.db-icon')[1].innerHTML = mod2.image ? `<img src="${mod2.image}" style="width:100%;height:100%;">` : 'icon';
    
    document.getElementById('dbRowText').textContent = mod2.name;
    const nameStr = mod2.name || '';
    const char1 = nameStr.substring(0,2) || '文本';
    const char2 = nameStr.substring(2,4) || '文本';
    document.getElementById('dbStackText').innerHTML = `<span>${char1}</span><span>${char2}</span>`;
  } else {
    fm2.style.display = 'none'; 
  }

  const mod3 = SITE_DATA.site.modules[3] || [];
  const shareExpandedBox = document.getElementById('shareExpandedBox');
  shareExpandedBox.innerHTML = '';
  mod3.sort((a,b) => a.order - b.order).forEach((link, i) => {
    const icon = link.image ? `<img src="${link.image}" style="width:100%;height:100%;">` : `${i+1}`;
    shareExpandedBox.insertAdjacentHTML('beforeend', `<a href="${link.url}" class="s-mini-icon" target="_blank" title="${link.name}">${icon}</a>`);
  });

  // 👇 数据加载完毕，依次唤醒底部独立渲染组件，最后初始化物理引擎
  initFooterMarquee();
  initPhysicsEngines();
}

// =========================================================
// 🌟 2. 无限波浪履带专属引擎 (与旧代码 1:1 还原)
// =========================================================
function initFooterMarquee() {
  const footerMarquee = document.getElementById('footerMarquee');
  if (!footerMarquee) return;
  
  footerMarquee.innerHTML = ''; // 清空残留
  
  const marqueeData = [
    "PRODUCT DESIGN", "icon",
    "VIBE CODING", "icon",
    "PRODUCT DESIGN", "icon",
    "VISUAL ART", "icon",
    ":) HI I'M DOOOZZZI", "icon"
  ];

  const svgIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.728 11.1518C15.0308 11.2479 15.3056 11.416 15.5288 11.642C15.7521 11.8681 15.9169 12.1455 16.0093 12.4496L17.2417 16.5121C17.3981 17.032 17.4776 17.2923 17.3374 17.4301C17.1971 17.5675 16.9379 17.4861 16.4204 17.3227L12.3726 16.0434C12.0696 15.9474 11.7942 15.7792 11.5708 15.5531C11.3474 15.3271 11.1828 15.0496 11.0903 14.7455L9.50048 9.50137L14.728 11.1518ZM7.84814 14.727C7.75222 15.0299 7.58382 15.3053 7.3579 15.5287C7.13206 15.752 6.85508 15.9166 6.55126 16.0092L2.48779 17.2416C1.9687 17.398 1.7085 17.4764 1.56982 17.3373C1.43217 17.1971 1.51474 16.938 1.67821 16.4203L2.95751 12.3715C3.05359 12.0689 3.22191 11.7939 3.44775 11.5707C3.67363 11.3476 3.95061 11.1827 4.25439 11.0902L9.50048 9.50137L7.84814 14.727ZM16.5122 1.76114C17.0322 1.6037 17.2924 1.52326 17.4302 1.66348C17.5689 1.80359 17.4862 2.06281 17.3227 2.58047L16.0434 6.62833C15.9477 6.93143 15.7791 7.20646 15.5532 7.43008C15.3273 7.65368 15.0506 7.81884 14.7466 7.91153L9.50048 9.50137L11.1518 4.27481C11.2478 3.97183 11.4161 3.69649 11.6421 3.47305C11.8682 3.24958 12.1455 3.08405 12.4497 2.99161L16.5122 1.76114ZM1.66454 1.57071C1.80379 1.43328 2.0622 1.51475 2.57958 1.67813L6.62841 2.95743C6.9313 3.05357 7.20688 3.22155 7.43017 3.44766C7.65343 3.67376 7.81831 3.95124 7.91064 4.25528L9.50048 9.50137L4.27392 7.84903C3.97096 7.75307 3.69559 7.58478 3.47216 7.35879C3.24869 7.13269 3.08316 6.85534 2.99071 6.55118L1.76025 2.48868C1.6028 1.9687 1.52442 1.70949 1.66454 1.57071Z" fill="white"/></svg>`;

  function createMarqueeGroup() {
    const group = document.createElement('div');
    group.className = 'marquee-group';
    let globalCharIndex = 0; 

    marqueeData.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'wave-item';

      if (item === 'icon') {
        itemEl.innerHTML = `
          <span class="wave-char wave-icon" style="--i: ${globalCharIndex}">
            <span class="wave-inner">
              <span class="wave-front">${svgIcon}</span>
              <span class="wave-bottom">${svgIcon}</span>
            </span>
          </span>
        `;
        globalCharIndex += 2; 
      } else {
        const chars = item.split('');
        chars.forEach(char => {
          const displayChar = char === ' ' ? '&nbsp;' : char;
          const charHTML = `
            <span class="wave-char" style="--i: ${globalCharIndex}">
              <span class="wave-inner">
                <span class="wave-front">${displayChar}</span>
                <span class="wave-bottom">${displayChar}</span>
              </span>
            </span>
          `;
          itemEl.insertAdjacentHTML('beforeend', charHTML);
          globalCharIndex++;
        });
      }
      group.appendChild(itemEl);
    });
    return group;
  }

  // 抛入四层矩阵，抵抗宽屏断层
  footerMarquee.appendChild(createMarqueeGroup());
  footerMarquee.appendChild(createMarqueeGroup());
  footerMarquee.appendChild(createMarqueeGroup());
  footerMarquee.appendChild(createMarqueeGroup());
}

// =========================================================
// 🌟 3. 主物理引擎
// =========================================================
function initPhysicsEngines() {
  const sidebarContent = document.querySelector('.sidebar-content');
  const scrollableBody = document.getElementById('scrollableBody');
  const highlightBox = document.getElementById('highlightBox');
  const menuItems = document.querySelectorAll('.nav-menu .nav-item');

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

  function resetToFirstItem() {
    const firstItem = menuItems[0];
    if (!firstItem) return;
    menuItems.forEach(nav => { nav.classList.remove('active'); nav.removeAttribute('aria-current'); });
    firstItem.classList.add('active'); firstItem.setAttribute('aria-current', 'page');
    alignHighlight(firstItem, false);
    lenis.scrollTo(0, { immediate: true }); lenisMain.scrollTo(0, { immediate: true });
  }
  
  if (menuItems.length > 0) resetToFirstItem();

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
      if (targetSection) lenisMain.scrollTo(targetSection, { offset: -80, duration: 1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    }
  });

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

  document.getElementById('pinBtn').addEventListener('click', (e) => {
    e.preventDefault(); document.getElementById('sidebar').classList.toggle('is-pinned');
  });

  // --- 🌟 返回顶部引擎恢复 ---
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

fetchSiteData();