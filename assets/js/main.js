// 1. Lenis 平滑滚动引擎初始化
const sidebarContent = document.querySelector('.sidebar-content');
const lenis = new Lenis({
  wrapper: sidebarContent, 
  content: sidebarContent.querySelector('.nav-menu'), 
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 2. 核心交互：电梯滑块的智能防跳动对齐
const highlightBox = document.getElementById('highlightBox');
const menuItems = document.querySelectorAll('.nav-menu .nav-item');

function alignHighlight(el, animate = true) {
  if (!el) return;
  if (!animate) {
    highlightBox.style.transition = 'none';
  } else {
    highlightBox.style.transition = 'transform 0.3s var(--transition-curve)';
  }
  
  highlightBox.style.transform = `translateY(${el.offsetTop}px)`;
  if (!animate) highlightBox.offsetHeight; 
}

// 3. 终极初始化防线
window.addEventListener('DOMContentLoaded', () => {
  const initialActive = document.querySelector('.nav-menu .nav-item.active') || menuItems[0];
  if (initialActive) {
    menuItems.forEach(n => {
      n.classList.remove('active');
      n.removeAttribute('aria-current');
    });
    initialActive.classList.add('active');
    initialActive.setAttribute('aria-current', 'page');
    alignHighlight(initialActive, false);
    
    setTimeout(() => {
      highlightBox.style.transition = 'transform 0.3s var(--transition-curve)';
    }, 50);
  }
});

// 4. 事件委托模式 (高性能点击捕获)
const navMenuContainer = document.querySelector('.nav-menu');
navMenuContainer.addEventListener('click', function(e) {
  const clickedItem = e.target.closest('.nav-item');
  if (!clickedItem) return;
  
  // A11y 盲人阅读器状态与样式切换
  menuItems.forEach(nav => {
    nav.classList.remove('active');
    nav.removeAttribute('aria-current');
  });
  clickedItem.classList.add('active');
  clickedItem.setAttribute('aria-current', 'page');
  
  alignHighlight(clickedItem, true);
});

// 5. 固定面板按钮逻辑
document.getElementById('pinBtn').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('sidebar').classList.toggle('is-pinned');
});

// 6. 尺寸变动与动效校准
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const activeItem = document.querySelector('.nav-menu .nav-item.active');
    alignHighlight(activeItem, false);
  }, 100); 
});

document.getElementById('sidebar').addEventListener('transitionend', (e) => {
  if (e.propertyName === 'width') {
    const activeItem = document.querySelector('.nav-menu .nav-item.active');
    alignHighlight(activeItem, false);
  }
});