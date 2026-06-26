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