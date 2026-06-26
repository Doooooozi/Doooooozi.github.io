// =========================================================
// 1. 物理架构重构：将滑块剥离出滚动区，使其在屏幕上绝对静止
// =========================================================
const sidebarContent = document.querySelector('.sidebar-content');
const scrollWrapper = document.querySelector('.sidebar-scroll-wrapper');
const highlightBox = document.getElementById('highlightBox');

// 自动把滑块提到静止的包裹层中（无需修改你的 HTML）
if (highlightBox && highlightBox.parentNode !== scrollWrapper) {
  scrollWrapper.insertBefore(highlightBox, scrollWrapper.firstChild);
  // 确保文字层级在滑块之上，不被遮挡
  sidebarContent.style.position = 'relative';
  sidebarContent.style.zIndex = '1';
  highlightBox.style.zIndex = '0';
}

// =========================================================
// 2. Lenis 平滑滚动引擎初始化
// =========================================================
const lenis = new Lenis({
  wrapper: sidebarContent, 
  content: sidebarContent.querySelector('.nav-menu'), 
  duration: 0.8, // 调整为更干脆的滚动速度
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// =========================================================
// 3. 终极交互引擎：绝对静止吸附 (Snap & Glide)
// =========================================================
const menuItems = document.querySelectorAll('.nav-menu .nav-item');

function alignHighlight(el, animate = true) {
  if (!el) return;

  // 1. 计算居中对齐所需的滚动目标值
  const wrapperHeight = sidebarContent.clientHeight;
  const centerY = wrapperHeight / 2 - el.offsetHeight / 2;
  
  const maxScroll = Math.max(0, sidebarContent.scrollHeight - wrapperHeight);
  const targetScroll = Math.max(0, Math.min(el.offsetTop - centerY, maxScroll));
  
  // 2. 神奇公式：计算项目滚动结束后的【最终屏幕绝对 Y 坐标】
  const finalScreenY = el.offsetTop - targetScroll;

  if (!animate) {
    // 瞬间静默加载（绝对没有跳动）
    highlightBox.style.transition = 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; // 仅保留宽度的丝滑伸缩
    highlightBox.style.transform = `translateY(${finalScreenY}px)`;
    void highlightBox.offsetWidth; // 强制浏览器重排，钉死坐标
    lenis.scrollTo(targetScroll, { immediate: true });
  } else {
    // 交互点击加载（滑块走向最终坐标，列表开始滚动找滑块）
    highlightBox.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    highlightBox.style.transform = `translateY(${finalScreenY}px)`;
    
    lenis.scrollTo(targetScroll, { 
      duration: 0.4, 
      easing: (t) => 1 - Math.pow(1 - t, 4) 
    });
  }
}

// =========================================================
// 4. 彻底消灭初次加载跳动的护城河
// =========================================================
function initActiveState() {
  if (highlightBox.dataset.initialized) return; // 拦截二次触发
  
  const initialActive = document.querySelector('.nav-menu .nav-item.active') || menuItems[0];
  if (initialActive) {
    menuItems.forEach(n => {
      n.classList.remove('active');
      n.removeAttribute('aria-current');
    });
    initialActive.classList.add('active');
    initialActive.setAttribute('aria-current', 'page');
    
    alignHighlight(initialActive, false); // 绝对无动画执行
  }
  highlightBox.dataset.initialized = 'true';
}

window.addEventListener('DOMContentLoaded', initActiveState);
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initActiveState();
}
// 防止字体加载导致布局撑开产生微小错位，无缝重算一次
window.addEventListener('load', () => {
  const activeItem = document.querySelector('.nav-menu .nav-item.active');
  if (activeItem) alignHighlight(activeItem, false);
});

// =========================================================
// 5. 事件委托模式 (高性能点击捕获)
// =========================================================
const navMenuContainer = document.querySelector('.nav-menu');
navMenuContainer.addEventListener('click', function(e) {
  const clickedItem = e.target.closest('.nav-item');
  if (!clickedItem) return;
  
  menuItems.forEach(nav => {
    nav.classList.remove('active');
    nav.removeAttribute('aria-current');
  });
  clickedItem.classList.add('active');
  clickedItem.setAttribute('aria-current', 'page');
  
  alignHighlight(clickedItem, true);
});

// =========================================================
// 6. 固定面板按钮逻辑
// =========================================================
document.getElementById('pinBtn').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('sidebar').classList.toggle('is-pinned');
});

// =========================================================
// 7. 尺寸变动与动效实时校准
// =========================================================
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const activeItem = document.querySelector('.nav-menu .nav-item.active');
    alignHighlight(activeItem, false);
  }, 100); 
});