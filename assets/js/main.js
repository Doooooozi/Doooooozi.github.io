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

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// =========================================================
// 2. 核心引擎：绝对物理锁死 (Snap & Glide) + 渲染阻断
// =========================================================
const highlightBox = document.getElementById('highlightBox');
const menuItems = document.querySelectorAll('.nav-menu .nav-item');

// 🌟 修复【置顶加载闪跳】：在浏览器第一帧画出来之前，强行隐身！
if (highlightBox) {
  highlightBox.style.visibility = 'hidden';
  highlightBox.style.transition = 'none';
}

// 物理防线：确保滑块乖乖呆在滚动容器内部，保证【手动滚轮时不脱节】
const navMenu = document.querySelector('.nav-menu');
if (highlightBox && highlightBox.parentNode !== navMenu) {
  navMenu.insertBefore(highlightBox, navMenu.firstChild);
}

function alignHighlight(el, animate = true) {
  if (!el) return;

  const centerOffset = - (sidebarContent.clientHeight / 2) + (el.offsetHeight / 2);
  const maxScroll = Math.max(0, sidebarContent.scrollHeight - sidebarContent.clientHeight);
  const targetScroll = Math.max(0, Math.min(el.offsetTop + centerOffset, maxScroll));
  
  const currentScroll = sidebarContent.scrollTop;
  const isScrolling = Math.abs(targetScroll - currentScroll) > 2;

  // 🌟 第一道防线：强制拔掉所有动画引擎
  highlightBox.style.transition = 'none';

  if (!animate) {
    // 🔴 初次加载 / 尺寸变动：瞬间就位
    highlightBox.style.transform = `translateY(${el.offsetTop}px)`;
    lenis.scrollTo(targetScroll, { immediate: true });
    
    // 🌟 终极护城河 (Double-rAF)：强迫浏览器在没有动画的情况下画完这一帧，下一帧再解除隐身
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        highlightBox.style.visibility = 'visible';
        highlightBox.style.transition = 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      });
    });
    
  } else {
    if (isScrolling) {
      // 🔵 屏幕需要滚动 (防抖动模式)
      // 1. 滑块瞬间 (0s) 贴合目标，绝不产生自身的拉扯抖动
      highlightBox.style.transform = `translateY(${el.offsetTop}px)`;
      
      // 2. Lenis 带着【已贴合的滑块+文本】一起平滑居中
      lenis.scrollTo(targetScroll, { 
        duration: 0.5, 
        easing: (t) => 1 - Math.pow(1 - t, 4) 
      });

      // 3. Double-rAF：确保瞬间瞬移彻底生效后，再恢复宽度缩放动画
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          highlightBox.style.transition = 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
      });
      
    } else {
      // 🟢 屏幕不需要滚动（如点选附近的目录）：优雅地滑过去
      void highlightBox.offsetHeight; // 强制重排
      
      highlightBox.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      highlightBox.style.transform = `translateY(${el.offsetTop}px)`;
    }
  }
}

// =========================================================
// 3. 彻底消灭初次加载跳动的护城河
// =========================================================
function initActiveState() {
  if (highlightBox.dataset.initialized) return; 
  
  const initialActive = document.querySelector('.nav-menu .nav-item.active') || menuItems[0];
  if (initialActive) {
    menuItems.forEach(n => {
      n.classList.remove('active');
      n.removeAttribute('aria-current');
    });
    initialActive.classList.add('active');
    initialActive.setAttribute('aria-current', 'page');
    
    alignHighlight(initialActive, false); 
  }
  highlightBox.dataset.initialized = 'true';
}

// 🌟 抢在 DOM 绘制前立即执行一次，把滑块提前“钉死”在目标位置
initActiveState();
window.addEventListener('DOMContentLoaded', initActiveState);
window.addEventListener('load', () => {
  const activeItem = document.querySelector('.nav-menu .nav-item.active');
  if (activeItem) alignHighlight(activeItem, false);
});

// =========================================================
// 4. 事件委托模式 (高性能点击捕获)
// =========================================================
navMenu.addEventListener('click', function(e) {
  const clickedItem = e.target.closest('.nav-item');
  if (!clickedItem) return;
  
  // 💡 核心修复：阻止浏览器默认的锚点跳转，保证 URL 纯净无瑕！
  e.preventDefault(); 
  
  menuItems.forEach(nav => {
    nav.classList.remove('active');
    nav.removeAttribute('aria-current');
  });
  clickedItem.classList.add('active');
  clickedItem.setAttribute('aria-current', 'page');
  
  alignHighlight(clickedItem, true);
});

// =========================================================
// 5. 固定面板与尺寸校准
// =========================================================
document.getElementById('pinBtn').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('sidebar').classList.toggle('is-pinned');
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const activeItem = document.querySelector('.nav-menu .nav-item.active');
    alignHighlight(activeItem, false);
  }, 100); 
});