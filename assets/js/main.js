// 🌟 拦截浏览器原生的“记忆滚动”，强迫每次 F5 都老老实实在顶部
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// =========================================================
// 1. Lenis 平滑滚动引擎初始化
// =========================================================
const sidebarContent = document.querySelector('.sidebar-content');
const lenis = new Lenis({
  wrapper: sidebarContent, 
  content: sidebarContent.querySelector('.nav-menu'), 
  duration: 0.8, 
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

const scrollableBody = document.getElementById('scrollableBody');
const lenisMain = new Lenis({
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

// =========================================================
// 2. 自定义滚动条 (0.4s 呼吸消散)
// =========================================================
const customScrollbar = document.getElementById('customScrollbar');
const customThumb = document.getElementById('customThumb');
let scrollTimeout;

scrollableBody.addEventListener('scroll', () => {
  const scrollHeight = scrollableBody.scrollHeight;
  const clientHeight = scrollableBody.clientHeight;
  const scrollTop = scrollableBody.scrollTop;

  // 如果内容不够滚动，就不显示
  if (scrollHeight <= clientHeight) return;

  // 动态计算滑块的高度和位置
  const thumbHeight = Math.max((clientHeight / scrollHeight) * clientHeight, 40); // 最小 40px
  const maxScrollTop = scrollHeight - clientHeight;
  const progress = scrollTop / maxScrollTop;
  const thumbY = progress * (clientHeight - thumbHeight);

  customThumb.style.height = `${thumbHeight}px`;
  customThumb.style.transform = `translateY(${thumbY}px)`;

  // 添加显示 class
  customScrollbar.classList.add('is-active');

  // 0.4s 静止后自动消散
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    customScrollbar.classList.remove('is-active');
  }, 400);
});

// =========================================================
// 3. 核心引擎：滑块对齐逻辑
// =========================================================
const highlightBox = document.getElementById('highlightBox');
const menuItems = document.querySelectorAll('.nav-menu .nav-item');

function alignHighlight(el, animate = true) {
  if (!el) return;

  const centerOffset = - (sidebarContent.clientHeight / 2) + (el.offsetHeight / 2);
  const maxScroll = Math.max(0, sidebarContent.scrollHeight - sidebarContent.clientHeight);
  const targetScroll = Math.max(0, Math.min(el.offsetTop + centerOffset, maxScroll));
  
  if (!animate) {
    // 无动画硬着陆 (取消了 CSS 的硬编码，改由 JS 控制保证逻辑统一)
    highlightBox.style.transition = 'none';
    highlightBox.style.transform = `translateY(${el.offsetTop}px)`;
  } else {
    // 有动画丝滑滑行
    const currentScroll = sidebarContent.scrollTop;
    const isScrolling = Math.abs(targetScroll - currentScroll) > 2;

    if (isScrolling) {
      highlightBox.style.transition = 'none';
      highlightBox.style.transform = `translateY(${el.offsetTop}px)`;
      lenis.scrollTo(targetScroll, { duration: 0.5, easing: (t) => 1 - Math.pow(1 - t, 4) });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          highlightBox.style.transition = 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
      });
    } else {
      void highlightBox.offsetHeight; 
      highlightBox.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      highlightBox.style.transform = `translateY(${el.offsetTop}px)`;
    }
  }
}

// =========================================================
// 4. 彻底消灭初次加载跳动的护城河 (强行锁定 #section1)
// =========================================================
function resetToFirstItem() {
  const firstItem = menuItems[0];
  if (!firstItem) return;
  
  // 清空所有状态，强行点亮第一项
  menuItems.forEach(nav => {
    nav.classList.remove('active');
    nav.removeAttribute('aria-current');
  });
  firstItem.classList.add('active');
  firstItem.setAttribute('aria-current', 'page');
  
  // 无动画对齐，强制滚动条置顶
  alignHighlight(firstItem, false);
  lenis.scrollTo(0, { immediate: true });
  lenisMain.scrollTo(0, { immediate: true });
}

// 执行初始化
resetToFirstItem();
window.addEventListener('load', resetToFirstItem);

// =========================================================
// 5. 事件委托模式 (左右联动)
// =========================================================
const navMenu = document.querySelector('.nav-menu');
navMenu.addEventListener('click', function(e) {
  const clickedItem = e.target.closest('.nav-item');
  if (!clickedItem) return;
  
  e.preventDefault(); 
  
  menuItems.forEach(nav => {
    nav.classList.remove('active');
    nav.removeAttribute('aria-current');
  });
  clickedItem.classList.add('active');
  clickedItem.setAttribute('aria-current', 'page');
  
  alignHighlight(clickedItem, true);

  const targetId = clickedItem.getAttribute('href'); 
  if (targetId && targetId.startsWith('#')) {
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
      lenisMain.scrollTo(targetSection, {
        offset: -80, 
        duration: 1, 
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
      });
    }
  }
});

// 固定面板
document.getElementById('pinBtn').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('sidebar').classList.toggle('is-pinned');
});

// 尺寸自适应
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const activeItem = document.querySelector('.nav-menu .nav-item.active');
    alignHighlight(activeItem, false);
    
    // 触发一下滚动条刷新
    scrollableBody.dispatchEvent(new Event('scroll'));
  }, 100); 
});

// =========================================================
// 6. 高级动效：Footer 矩阵波浪与无限履带引擎
// =========================================================
const footerMarquee = document.getElementById('footerMarquee');

if (footerMarquee) {
  // 1. 内容矩阵排布
  const marqueeData = [
    "PRODUCT DESIGN", "icon",
    "VIBE CODING", "icon",
    "PRODUCT DESIGN", "icon",
    "VISUAL ART", "icon",
    ":) HI I'M DOOOZZZI", "icon"
  ];

  // 2. 注入你的专属四芒星 SVG
  const svgIcon = `<svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M14.728 11.1518C15.0308 11.2479 15.3056 11.416 15.5288 11.642C15.7521 11.8681 15.9169 12.1455 16.0093 12.4496L17.2417 16.5121C17.3981 17.032 17.4776 17.2923 17.3374 17.4301C17.1971 17.5675 16.9379 17.4861 16.4204 17.3227L12.3726 16.0434C12.0696 15.9474 11.7942 15.7792 11.5708 15.5531C11.3474 15.3271 11.1828 15.0496 11.0903 14.7455L9.50048 9.50137L14.728 11.1518ZM7.84814 14.727C7.75222 15.0299 7.58382 15.3053 7.3579 15.5287C7.13206 15.752 6.85508 15.9166 6.55126 16.0092L2.48779 17.2416C1.9687 17.398 1.7085 17.4764 1.56982 17.3373C1.43217 17.1971 1.51474 16.938 1.67821 16.4203L2.95751 12.3715C3.05359 12.0689 3.22191 11.7939 3.44775 11.5707C3.67363 11.3476 3.95061 11.1827 4.25439 11.0902L9.50048 9.50137L7.84814 14.727ZM16.5122 1.76114C17.0322 1.6037 17.2924 1.52326 17.4302 1.66348C17.5689 1.80359 17.4862 2.06281 17.3227 2.58047L16.0434 6.62833C15.9477 6.93143 15.7791 7.20646 15.5532 7.43008C15.3273 7.65368 15.0506 7.81884 14.7466 7.91153L9.50048 9.50137L11.1518 4.27481C11.2478 3.97183 11.4161 3.69649 11.6421 3.47305C11.8682 3.24958 12.1455 3.08405 12.4497 2.99161L16.5122 1.76114ZM1.66454 1.57071C1.80379 1.43328 2.0622 1.51475 2.57958 1.67813L6.62841 2.95743C6.9313 3.05357 7.20688 3.22155 7.43017 3.44766C7.65343 3.67376 7.81831 3.95124 7.91064 4.25528L9.50048 9.50137L4.27392 7.84903C3.97096 7.75307 3.69559 7.58478 3.47216 7.35879C3.24869 7.13269 3.08316 6.85534 2.99071 6.55118L1.76025 2.48868C1.6028 1.9687 1.52442 1.70949 1.66454 1.57071Z" fill="white"/>
  </svg>`;

  // 3. 构建物理 DOM 组
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
          // 🌟 核心修复：遇到空格强制转换为 &nbsp; (实体字符)，防止浏览器折叠
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

  // 4. 生成多重分身履带 (矩阵暴兵)
  // 🌟 核心修复 3：面对超宽屏或短文本，2个分身是不够的，直接丢入 4 个分身！
  // 这样无论屏幕多宽，背后永远有充足的“弹药”填补黑洞。
  footerMarquee.appendChild(createMarqueeGroup());
  footerMarquee.appendChild(createMarqueeGroup());
  footerMarquee.appendChild(createMarqueeGroup());
  footerMarquee.appendChild(createMarqueeGroup());
}

// =========================================================
// 7. 返回顶部按钮 (与 Lenis 引擎完美融合)
// =========================================================
const backToTopBtn = document.getElementById('backToTop');

if (backToTopBtn && scrollableBody) {
  // 1. 监听滚动，控制按钮在首屏后平滑“浮现”
  scrollableBody.addEventListener('scroll', () => {
    // 下拉超过 300px 出现，否则缩回
    if (scrollableBody.scrollTop > 300) {
      backToTopBtn.classList.add('is-visible');
    } else {
      backToTopBtn.classList.remove('is-visible');
    }
  });

  // 2. 点击事件，呼叫物理引擎平滑登顶
  backToTopBtn.addEventListener('click', () => {
    // 调用现成的 Lenis 实例，强制滑到坐标 0
    lenisMain.scrollTo(0, { 
      duration: 1, 
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
    });
    
    // 如果想要点击回顶的同时，侧边栏也自动切回第一项，取消下一行的注释即可：
    // resetToFirstItem();
  });
}