// =========================================================
// 1. JSON 数据中心 (底层兜底模板)
// =========================================================
let SITE_DATA = {
  site: {
    title: "",
    favicon: "",
    logo: "",
    modules: {
      1: [
        { id: "sm_1_1", name: "名称文本一行自适应名称文本...", url: "https://example.com", image: "", placeholder: "icon\nSVG", order: 0 },
        { id: "sm_1_2", name: "名称文本一行自适应名称文本...", url: "https://example.com", image: "", placeholder: "icon\nSVG", order: 1 },
        { id: "sm_1_3", name: "名称文本一行自适应名称文本...", url: "https://example.com", image: "", placeholder: "icon\nSVG", order: 2 }
      ],
      2: [
        { id: "sm_2_1", name: "名称文本一行自适应名称文本...", url: "https://example.com", image: "", placeholder: "icon\nSVG", order: 0 }
      ],
      3: [
        { id: "sm_3_1", name: "名称文本一行自适应名称文本...", url: "https://example.com", image: "", placeholder: "icon\nSVG", order: 0 },
        { id: "sm_3_2", name: "名称文本一行自适应名称文本...", url: "https://example.com", image: "", placeholder: "icon\nSVG", order: 1 }
      ]
    }
  },
  categories: [
    {
      id: "cat_1", name: "分类目录1", order: 0, iconSvg: "",
      links: [
        { id: "link_1", name: "Figma", url: "https://figma.com", image: "", placeholder: "logo\nPNG", desc: "这是一款基于浏览器的协同设计工具", order: 0 },
        { id: "link_2", name: "站点名一行截断测试超长文本", url: "https://example.com", image: "", placeholder: "logo\nPNG", desc: "描述文案信息补充", order: 1 }
      ]
    },
    {
      id: "cat_2", name: "分类目录2", order: 1, iconSvg: "",
      links: [
        { id: "link_3", name: "Notion", url: "https://notion.so", image: "", placeholder: "logo\nPNG", desc: "全能型笔记软件", order: 0 }
      ]
    }
  ]
};

// 🌟 幽灵记忆引擎 (LocalStorage 草稿箱)
function loadMemoryFromDrive() {
  const cachedData = localStorage.getItem('NAV_SITE_DATA_V1');
  if (cachedData) {
    try {
      SITE_DATA = JSON.parse(cachedData);
      console.log("🟢 [草稿箱]：已恢复浏览器本地未导出的修改数据！");
    } catch (e) {
      console.error("🔴 [草稿箱]：缓存受损，回退至初始模板。");
    }
  }
}
function syncMemoryToDrive() {
  localStorage.setItem('NAV_SITE_DATA_V1', JSON.stringify(SITE_DATA));
}

let currentCategoryId = "cat_1"; 
if (!SITE_DATA.categories.find(c => c.id === currentCategoryId) && SITE_DATA.categories.length > 0) {
  currentCategoryId = SITE_DATA.categories[0].id;
}

let isBatchMode = false;
let selectedLinkIds = new Set(); 

// =========================================================
// 2. 侧边栏与视图切换引擎
// =========================================================
const sidebarItems = document.querySelectorAll('.nav-menu .nav-item');
const adminHighlightBox = document.getElementById('adminHighlightBox');
const views = document.querySelectorAll('.admin-view');

function switchAdminView(viewId, el, animate = true) {
  sidebarItems.forEach(nav => nav.classList.remove('active'));
  el.classList.add('active');
  if (!animate) {
    adminHighlightBox.style.transition = 'none';
    adminHighlightBox.style.transform = `translateY(${el.offsetTop}px)`;
  } else {
    adminHighlightBox.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    adminHighlightBox.style.transform = `translateY(${el.offsetTop}px)`;
  }
  views.forEach(view => view.classList.remove('is-active'));
  document.getElementById(viewId).classList.add('is-active');

  if (viewId === 'view-nav') requestAnimationFrame(triggerScrollbarCue);
}

sidebarItems.forEach((item, index) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const targetView = index === 0 ? 'view-site' : 'view-nav';
    switchAdminView(targetView, item, true);
  });
});

// =========================================================
// 3. 原生物理拖拽引擎 
// =========================================================
function initSortableTable(tbodyElement, dataArray, onSortComplete) {
  let draggedRow = null;

  tbodyElement.addEventListener('mouseover', e => {
    if (e.target.closest('td.sort-handle')) e.target.closest('tr').setAttribute('draggable', 'true');
  });
  tbodyElement.addEventListener('mouseout', e => {
    if (e.target.closest('td.sort-handle')) e.target.closest('tr').removeAttribute('draggable');
  });

  tbodyElement.addEventListener('dragstart', e => {
    draggedRow = e.target.closest('tr');
    if (!draggedRow) return;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => draggedRow.classList.add('is-dragging'), 0);
  });

  tbodyElement.addEventListener('dragover', e => {
    e.preventDefault(); 
    const targetRow = e.target.closest('tr');
    if (!targetRow || targetRow === draggedRow) return;

    const bounding = targetRow.getBoundingClientRect();
    const offset = bounding.y + (bounding.height / 2);
    Array.from(tbodyElement.children).forEach(child => child.classList.remove('drag-over-top', 'drag-over-bottom'));
    
    if (e.clientY > offset) targetRow.classList.add('drag-over-bottom');
    else targetRow.classList.add('drag-over-top');
  });

  tbodyElement.addEventListener('dragleave', e => {
    const targetRow = e.target.closest('tr');
    if (targetRow) targetRow.classList.remove('drag-over-top', 'drag-over-bottom');
  });

  tbodyElement.addEventListener('drop', e => {
    e.preventDefault();
    const targetRow = e.target.closest('tr');
    if (!targetRow || targetRow === draggedRow) return;

    const isBottom = targetRow.classList.contains('drag-over-bottom');
    targetRow.classList.remove('drag-over-top', 'drag-over-bottom');

    const fromIndex = parseInt(draggedRow.dataset.index);
    let toIndex = parseInt(targetRow.dataset.index);

    if (isBottom) {
      targetRow.after(draggedRow);
      if (fromIndex < toIndex) toIndex; else toIndex += 1;
    } else {
      targetRow.before(draggedRow);
      if (fromIndex > toIndex) toIndex; else toIndex -= 1;
    }

    const movedItem = dataArray.splice(fromIndex, 1)[0];
    const finalToIndex = Array.from(tbodyElement.children).indexOf(draggedRow);
    dataArray.splice(finalToIndex, 0, movedItem);

    dataArray.forEach((item, idx) => item.order = idx);
    onSortComplete(); 
  });

  tbodyElement.addEventListener('dragend', () => {
    if (draggedRow) {
      draggedRow.classList.remove('is-dragging');
      draggedRow.removeAttribute('draggable');
    }
    Array.from(tbodyElement.children).forEach(child => child.classList.remove('drag-over-top', 'drag-over-bottom'));
    draggedRow = null;
  });
}

// =========================================================
// 4. 网站管理引擎：渲染与事件 (Site Management)
// =========================================================
function renderSiteTables() {
  [1, 2, 3].forEach(modNum => {
    const tBody = document.getElementById(`moduleTable${modNum}`);
    if (!tBody) return;
    tBody.innerHTML = '';
    
    const modData = SITE_DATA.site.modules[modNum].sort((a, b) => a.order - b.order);
    
    if (modData.length === 0) {
      tBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999; padding: 40px;">暂无数据</td></tr>`;
      return;
    }

    modData.forEach((link, index) => {
      const tr = document.createElement('tr');
      tr.dataset.index = index; tr.dataset.linkId = link.id; tr.dataset.module = modNum;
      const iconHTML = link.image ? `<img src="${link.image}" class="table-icon" alt="icon">` : `<div class="table-icon">${link.placeholder.replace('\n', '<br>')}</div>`;
      
      tr.innerHTML = `
        <td class="col-icon"><div class="icon-cell-wrapper">${iconHTML}</div></td>
        <td><span class="truncate">${link.name}</span></td>
        <td><span class="truncate text-gray">${link.url}</span></td>
        <td class="sort-handle" title="按住拖拽排序">${index + 1}</td>
        <td>
          <div class="table-actions">
            <span class="action-link edit-mod-btn">编辑</span>
            <span class="action-link text-danger del-mod-btn">删除</span>
          </div>
        </td>
      `;
      tBody.appendChild(tr);
    });

    initSortableTable(tBody, modData, () => { renderSiteTables(); syncMemoryToDrive(); });
  });
}

[1, 2, 3].forEach(modNum => {
  const tBody = document.getElementById(`moduleTable${modNum}`);
  if (!tBody) return;
  tBody.addEventListener('click', (e) => {
    const tr = e.target.closest('tr'); if (!tr) return;
    const linkId = tr.dataset.linkId;
    const modDataArray = SITE_DATA.site.modules[modNum];
    const linkIndex = modDataArray.findIndex(l => l.id === linkId);

    if (e.target.classList.contains('del-mod-btn')) {
      if (confirm('确认删除该链接吗？')) {
        modDataArray.splice(linkIndex, 1); modDataArray.forEach((item, idx) => item.order = idx);
        renderSiteTables(); syncMemoryToDrive(); 
      }
    }
    if (e.target.classList.contains('edit-mod-btn')) {
      const linkData = modDataArray[linkIndex]; openModuleModal(modNum, linkData);
    }
  });
});

const moduleLinkModal = document.getElementById('moduleLinkModal');
let currentEditModule = null; let currentEditModLinkId = null;

document.querySelectorAll('.add-module-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modNum = e.currentTarget.dataset.module; openModuleModal(modNum, null);
  });
});

function openModuleModal(modNum, linkData = null) {
  currentEditModule = modNum;
  if (linkData) {
    currentEditModLinkId = linkData.id;
    document.getElementById('modLinkName').value = linkData.name || '';
    document.getElementById('modLinkUrl').value = linkData.url || '';
    document.getElementById('modUploadFilename').value = linkData.image ? linkData.image.split('/').pop().replace(/\.svg$/i, '') : '';
  } else {
    currentEditModLinkId = null;
    document.getElementById('modLinkName').value = '';
    document.getElementById('modLinkUrl').value = '';
    document.getElementById('modUploadFilename').value = '';
  }
  moduleLinkModal.classList.add('is-visible');
}

document.getElementById('cancelModLinkBtn').addEventListener('click', () => moduleLinkModal.classList.remove('is-visible'));
document.getElementById('saveModLinkBtn').addEventListener('click', () => {
  const newName = document.getElementById('modLinkName').value.trim();
  const newUrl = document.getElementById('modLinkUrl').value.trim();
  const rawFileName = document.getElementById('modUploadFilename').value.trim();
  if (!newName || !newUrl) { alert("请至少填写名称与地址"); return; }

  const finalImage = rawFileName ? `assets/images/${rawFileName}.svg` : ""; 
  const modDataArray = SITE_DATA.site.modules[currentEditModule];

  if (currentEditModLinkId) {
    const linkItem = modDataArray.find(l => l.id === currentEditModLinkId);
    if (linkItem) { linkItem.name = newName; linkItem.url = newUrl; linkItem.image = finalImage; }
  } else {
    modDataArray.push({ id: 'mod_link_' + Date.now(), name: newName, url: newUrl, image: finalImage, placeholder: "icon\nSVG", order: modDataArray.length });
  }
  moduleLinkModal.classList.remove('is-visible');
  renderSiteTables(); syncMemoryToDrive(); 
});


// =========================================================
// 5. 导航管理引擎：渲染与事件 (Nav Management)
// =========================================================
const adminTabsContainer = document.getElementById('adminTabs');
const tableBody = document.getElementById('tableBody');

function renderTabs() {
  adminTabsContainer.innerHTML = '';
  const sortedCategories = SITE_DATA.categories.sort((a, b) => a.order - b.order);
  sortedCategories.forEach(category => {
    const div = document.createElement('div');
    div.className = `tab-item ${category.id === currentCategoryId ? 'active' : ''}`;
    div.textContent = category.name;
    div.addEventListener('click', (e) => {
      if (window.isDraggingTabs) { e.preventDefault(); e.stopPropagation(); return; }
      isBatchMode = false; selectedLinkIds.clear(); syncBatchStateToDOM();
      currentCategoryId = category.id; renderTabs(); renderTable(); 
    });
    adminTabsContainer.appendChild(div);
  });
}

function renderTable() {
  tableBody.innerHTML = '';
  const currentCategory = SITE_DATA.categories.find(c => c.id === currentCategoryId);
  if (!currentCategory || currentCategory.links.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#999; padding: 40px;">暂无导航数据</td></tr>`;
    return;
  }
  
  const sortedLinks = currentCategory.links.sort((a, b) => a.order - b.order);
  sortedLinks.forEach((link, index) => {
    const tr = document.createElement('tr');
    tr.dataset.index = index; tr.dataset.linkId = link.id; 
    
    const iconHTML = link.image ? `<img src="${link.image}" class="table-icon" alt="icon">` : `<div class="table-icon">${link.placeholder.replace('\n', '<br>')}</div>`;
    const isChecked = selectedLinkIds.has(link.id);
    const cbHTML = isBatchMode ? `<div class="admin-checkbox row-checkbox ${isChecked ? 'is-checked' : ''}" data-id="${link.id}"></div>` : '';

    tr.innerHTML = `
      <td class="col-icon"><div class="icon-cell-wrapper">${cbHTML}${iconHTML}</div></td>
      <td><span class="truncate">${link.name}</span></td>
      <td><span class="truncate text-gray">${link.url}</span></td>
      <td class="sort-handle" title="按住拖拽排序">${index + 1}</td>
      <td>
        <div class="table-actions">
          <span class="action-link edit-nav-btn">编辑</span>
          <span class="action-link text-danger del-nav-btn">删除</span>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
  
  requestAnimationFrame(() => { if (typeof triggerScrollbarCue === 'function') triggerScrollbarCue(); });
  initSortableTable(tableBody, currentCategory.links, () => { renderTable(); syncMemoryToDrive(); });
}

tableBody.addEventListener('click', (e) => {
  const tr = e.target.closest('tr'); if (!tr) return;
  const linkId = tr.dataset.linkId;
  const currentCategory = SITE_DATA.categories.find(c => c.id === currentCategoryId);
  const linkIndex = currentCategory.links.findIndex(l => l.id === linkId);

  if (e.target.classList.contains('del-nav-btn')) {
    if (confirm('确认删除该导航信息吗？')) {
      currentCategory.links.splice(linkIndex, 1);
      currentCategory.links.forEach((item, idx) => item.order = idx);
      selectedLinkIds.delete(linkId); renderTable(); updateBatchUI(); syncMemoryToDrive(); 
    }
  }

  if (e.target.classList.contains('edit-nav-btn')) {
    const linkData = currentCategory.links[linkIndex]; openNavModal(linkData, currentCategoryId);
  }

  if (e.target.classList.contains('row-checkbox')) {
    if (selectedLinkIds.has(linkId)) { selectedLinkIds.delete(linkId); e.target.classList.remove('is-checked'); } 
    else { selectedLinkIds.add(linkId); e.target.classList.add('is-checked'); }
    updateBatchUI();
  }
});


// =========================================================
// 6. 批量操作引擎 (Batch Ops)
// =========================================================
const enterBatchBtn = document.getElementById('enterBatchBtn');
const exitBatchBtn = document.getElementById('exitBatchBtn');
const selectAllCb = document.getElementById('selectAllCb');

function syncBatchStateToDOM() {
  if (isBatchMode) document.body.classList.add('is-batch-mode');
  else document.body.classList.remove('is-batch-mode');
  updateBatchUI();
}

enterBatchBtn.addEventListener('click', () => { isBatchMode = true; selectedLinkIds.clear(); syncBatchStateToDOM(); renderTable(); });
exitBatchBtn.addEventListener('click', () => { isBatchMode = false; selectedLinkIds.clear(); syncBatchStateToDOM(); renderTable(); });

function updateBatchUI() {
  const currentCategory = SITE_DATA.categories.find(c => c.id === currentCategoryId);
  const totalLinks = currentCategory ? currentCategory.links.length : 0;
  const selectedCount = selectedLinkIds.size;
  
  document.getElementById('selectedCount').textContent = selectedCount;
  const deleteCountTxt = document.getElementById('deleteBatchCountTxt');
  if (deleteCountTxt) deleteCountTxt.textContent = selectedCount;
  
  selectAllCb.className = 'admin-checkbox'; 
  if (totalLinks > 0 && selectedCount === totalLinks) selectAllCb.classList.add('is-checked');
  else if (selectedCount > 0) selectAllCb.classList.add('is-half');
}

selectAllCb.addEventListener('click', () => {
  const currentCategory = SITE_DATA.categories.find(c => c.id === currentCategoryId);
  if (!currentCategory) return;
  if (selectedLinkIds.size === currentCategory.links.length) selectedLinkIds.clear(); 
  else currentCategory.links.forEach(l => selectedLinkIds.add(l.id)); 
  
  document.querySelectorAll('.row-checkbox').forEach(cb => {
    if (selectedLinkIds.has(cb.dataset.id)) cb.classList.add('is-checked');
    else cb.classList.remove('is-checked');
  });
  updateBatchUI();
});

const moveBatchModal = document.getElementById('moveBatchModal');
document.getElementById('openMoveBatchBtn').addEventListener('click', () => {
  if (selectedLinkIds.size === 0) { alert('请先勾选需要移动的数据'); return; }
  const select = document.getElementById('batchMoveCategorySelect'); select.innerHTML = '';
  SITE_DATA.categories.forEach(cat => {
    if (cat.id !== currentCategoryId) {
      const option = document.createElement('option'); option.value = cat.id; option.textContent = cat.name; select.appendChild(option);
    }
  });
  if (select.children.length === 0) { alert("当前只有 1 个分类，无法移动"); return; }
  moveBatchModal.classList.add('is-visible');
});

document.getElementById('cancelMoveBatchBtn').addEventListener('click', () => moveBatchModal.classList.remove('is-visible'));
document.getElementById('confirmMoveBatchBtn').addEventListener('click', () => {
  const targetCatId = document.getElementById('batchMoveCategorySelect').value;
  const currentCategory = SITE_DATA.categories.find(c => c.id === currentCategoryId);
  const targetCategory = SITE_DATA.categories.find(c => c.id === targetCatId);
  
  if (targetCategory && currentCategory) {
    const itemsToMove = currentCategory.links.filter(l => selectedLinkIds.has(l.id));
    currentCategory.links = currentCategory.links.filter(l => !selectedLinkIds.has(l.id));
    targetCategory.links.push(...itemsToMove);
    currentCategory.links.forEach((l, i) => l.order = i); targetCategory.links.forEach((l, i) => l.order = i);
    
    selectedLinkIds.clear(); isBatchMode = false; syncBatchStateToDOM();
    moveBatchModal.classList.remove('is-visible'); renderTable(); syncMemoryToDrive(); 
  }
});

const deleteBatchModal = document.getElementById('deleteBatchModal');
document.getElementById('openDeleteBatchBtn').addEventListener('click', () => {
  if (selectedLinkIds.size === 0) { alert('请先勾选需要删除的数据'); return; }
  deleteBatchModal.classList.add('is-visible');
});
document.getElementById('cancelDeleteBatchBtn').addEventListener('click', () => deleteBatchModal.classList.remove('is-visible'));
document.getElementById('confirmDeleteBatchBtn').addEventListener('click', () => {
  const currentCategory = SITE_DATA.categories.find(c => c.id === currentCategoryId);
  if (currentCategory) {
    currentCategory.links = currentCategory.links.filter(l => !selectedLinkIds.has(l.id));
    currentCategory.links.forEach((item, idx) => item.order = idx); 
    
    selectedLinkIds.clear(); isBatchMode = false; syncBatchStateToDOM();
    deleteBatchModal.classList.remove('is-visible'); renderTable(); syncMemoryToDrive(); 
  }
});


// =========================================================
// 7. 分类管理弹窗沙盒 (Category Modal)
// =========================================================
const editCategoryModal = document.getElementById('editCategoryModal');
const categoryInfoModal = document.getElementById('categoryInfoModal');
const categoryTableBody = document.getElementById('categoryTableBody');

let draftCategories = [];
let editingDraftIndex = null; 
let isDirectAdd = false; 

document.querySelectorAll('.text-btn')[0].addEventListener('click', () => {
  draftCategories = JSON.parse(JSON.stringify(SITE_DATA.categories));
  renderDraftCategoryTable(); editCategoryModal.classList.add('is-visible');
});
document.getElementById('mainAddCategoryBtn').addEventListener('click', () => {
  isDirectAdd = true; editingDraftIndex = null;
  document.getElementById('editCatName').value = ''; document.getElementById('uploadFilename').value = '';
  categoryInfoModal.classList.add('is-visible');
});

function renderDraftCategoryTable() {
  categoryTableBody.innerHTML = '';
  const sortedDrafts = draftCategories.sort((a, b) => a.order - b.order);
  sortedDrafts.forEach((cat, index) => {
    const tr = document.createElement('tr'); tr.dataset.index = index;
    const iconHTML = cat.iconSvg ? `<img src="${cat.iconSvg}" class="table-icon" alt="icon">` : `<div class="table-icon">logo<br>PNG</div>`;
    tr.innerHTML = `
      <td>${iconHTML}</td><td><span class="truncate">${cat.name}</span></td><td class="sort-handle" title="按住拖拽排序">${index + 1}</td>
      <td><div class="table-actions"><span class="action-link edit-cat-btn">编辑</span><span class="action-link text-danger del-cat-btn">删除</span></div></td>
    `;
    categoryTableBody.appendChild(tr);
  });
  initSortableTable(categoryTableBody, draftCategories, renderDraftCategoryTable);
}

categoryTableBody.addEventListener('click', (e) => {
  const tr = e.target.closest('tr'); if (!tr) return;
  const index = parseInt(tr.dataset.index);
  if (e.target.classList.contains('del-cat-btn')) {
    draftCategories.splice(index, 1); draftCategories.forEach((item, idx) => item.order = idx); renderDraftCategoryTable();
  }
  if (e.target.classList.contains('edit-cat-btn')) {
    isDirectAdd = false; editingDraftIndex = index; 
    document.getElementById('editCatName').value = draftCategories[index].name;
    document.getElementById('uploadFilename').value = draftCategories[index].iconSvg ? draftCategories[index].iconSvg.replace('.svg', '') : '';
    categoryInfoModal.classList.add('is-visible');
  }
});

document.getElementById('addCategoryBtn').addEventListener('click', () => {
  isDirectAdd = false; editingDraftIndex = null; 
  document.getElementById('editCatName').value = ''; document.getElementById('uploadFilename').value = '';
  categoryInfoModal.classList.add('is-visible');
});
document.getElementById('cancelCategoryModal').addEventListener('click', () => { editCategoryModal.classList.remove('is-visible'); draftCategories = []; });
document.getElementById('saveCategoryModal').addEventListener('click', () => {
  SITE_DATA.categories = JSON.parse(JSON.stringify(draftCategories));
  editCategoryModal.classList.remove('is-visible'); renderTabs(); renderTable(); syncMemoryToDrive(); 
});
document.getElementById('cancelInfoModal').addEventListener('click', () => { categoryInfoModal.classList.remove('is-visible'); isDirectAdd = false; });
document.getElementById('saveInfoModal').addEventListener('click', () => {
  const newName = document.getElementById('editCatName').value.trim();
  const rawSvgName = document.getElementById('uploadFilename').value.trim();
  const finalSvg = rawSvgName ? rawSvgName + ".svg" : ""; 

  if (newName) {
    if (isDirectAdd) {
      SITE_DATA.categories.push({ id: 'cat_' + Date.now(), name: newName, order: SITE_DATA.categories.length, iconSvg: finalSvg, links: [] });
      renderTabs(); renderTable(); syncMemoryToDrive();
    } else {
      if (editingDraftIndex !== null) { draftCategories[editingDraftIndex].name = newName; draftCategories[editingDraftIndex].iconSvg = finalSvg; } 
      else { draftCategories.push({ id: 'cat_' + Date.now(), name: newName, order: draftCategories.length, iconSvg: finalSvg, links: [] }); }
      renderDraftCategoryTable(); 
    }
  }
  categoryInfoModal.classList.remove('is-visible'); isDirectAdd = false;
});


// =========================================================
// 8. 导航表单驱动器 (Nav Link Modal)
// =========================================================
const navInfoModal = document.getElementById('navInfoModal');
let editingNavDataId = null; 

function populateCategoryDropdown(selectId) {
  const select = document.getElementById(selectId); select.innerHTML = '';
  SITE_DATA.categories.forEach(cat => {
    const option = document.createElement('option'); option.value = cat.id; option.textContent = cat.name; select.appendChild(option);
  });
}

function openNavModal(linkData = null, defaultCatId = null) {
  populateCategoryDropdown('editNavCategory');
  if (linkData) {
    editingNavDataId = linkData.id;
    document.getElementById('editNavName').value = linkData.name || ''; document.getElementById('editNavUrl').value = linkData.url || '';
    document.getElementById('editNavDesc').value = linkData.desc || '';
    document.getElementById('uploadPngFilename').value = linkData.image ? linkData.image.split('/').pop().replace(/\.(png|jpe?g)$/i, '') : '';
    document.getElementById('editNavCategory').value = defaultCatId;
  } else {
    editingNavDataId = null; document.getElementById('editNavName').value = ''; document.getElementById('editNavUrl').value = '';
    document.getElementById('editNavDesc').value = ''; document.getElementById('uploadPngFilename').value = '';
    document.getElementById('editNavCategory').value = currentCategoryId; 
  }
  navInfoModal.classList.add('is-visible');
}

document.getElementById('addNavBtn').addEventListener('click', () => openNavModal());
document.getElementById('cancelNavModal').addEventListener('click', () => navInfoModal.classList.remove('is-visible'));
document.getElementById('saveNavModal').addEventListener('click', () => {
  const newName = document.getElementById('editNavName').value.trim(); const newUrl = document.getElementById('editNavUrl').value.trim();
  const newDesc = document.getElementById('editNavDesc').value.trim(); const rawFileName = document.getElementById('uploadPngFilename').value.trim();
  const selectedCatId = document.getElementById('editNavCategory').value;
  
  if (!newName || !newUrl) { alert("请至少填写网站名称与地址"); return; }
  const finalImage = rawFileName ? `assets/images/weblogo/${rawFileName}.png` : ""; 
  const targetCategory = SITE_DATA.categories.find(c => c.id === selectedCatId);

  if (editingNavDataId) {
    for (let cat of SITE_DATA.categories) {
      const idx = cat.links.findIndex(l => l.id === editingNavDataId);
      if (idx > -1) {
        const linkItem = cat.links[idx];
        linkItem.name = newName; linkItem.url = newUrl; linkItem.desc = newDesc; linkItem.image = finalImage;
        if (cat.id !== selectedCatId) {
          cat.links.splice(idx, 1); linkItem.order = targetCategory.links.length; targetCategory.links.push(linkItem); 
        }
        break;
      }
    }
  } else {
    targetCategory.links.push({ id: 'link_' + Date.now(), name: newName, url: newUrl, desc: newDesc, image: finalImage, placeholder: "logo\nPNG", order: targetCategory.links.length });
  }

  navInfoModal.classList.remove('is-visible');
  if (selectedCatId !== currentCategoryId) { currentCategoryId = selectedCatId; renderTabs(); }
  renderTable(); syncMemoryToDrive(); 
});


// =========================================================
// 9. 多轨文件上传沙盒 
// =========================================================
function initUploadSandbox(boxId, inputId, hiddenId, validExts) {
  const box = document.getElementById(boxId); const input = document.getElementById(inputId); const hidden = document.getElementById(hiddenId);
  if (!box || !input || !hidden) return;

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => { box.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false); });
  ['dragenter', 'dragover'].forEach(eventName => box.addEventListener(eventName, () => box.classList.add('is-dragover'), false));
  ['dragleave', 'drop'].forEach(eventName => box.addEventListener(eventName, () => box.classList.remove('is-dragover'), false));

  box.addEventListener('drop', (e) => processFile(e.dataTransfer.files), false);
  const triggerBtn = box.querySelector('.upload-trigger');
  if (triggerBtn) { triggerBtn.addEventListener('click', () => hidden.click()); } else { box.addEventListener('click', (e) => { if (e.target !== input) hidden.click(); }); }
  hidden.addEventListener('change', (e) => { processFile(e.target.files); e.target.value = ''; });

  function processFile(files) {
    if (files && files.length) {
      const file = files[0]; const ext = file.name.split('.').pop().toLowerCase();
      if (validExts.includes(ext) || file.type.includes(ext)) {
        input.value = file.name.replace(new RegExp(`\\.${ext}$`, 'i'), ''); input.dispatchEvent(new Event('input', { bubbles: true }));
      } else alert(`格式不符：请上传 [${validExts.join(', ')}] 文件`);
    }
  }
}
initUploadSandbox('siteFaviconUpload', 'faviconFilename', 'hiddenFaviconInput', ['svg']);
initUploadSandbox('siteLogoUpload', 'logoFilename', 'hiddenLogoInput', ['svg']);
initUploadSandbox('svgUploadBox', 'uploadFilename', 'hiddenSvgInput', ['svg']);
initUploadSandbox('pngUploadBox', 'uploadPngFilename', 'hiddenPngInput', ['png', 'jpg', 'jpeg']);
initUploadSandbox('modSvgUploadBox', 'modUploadFilename', 'hiddenModSvgInput', ['svg']);


// =========================================================
// 10. 物理滚动条与动能拖拽引擎
// =========================================================
const tableContainer = document.getElementById('tableContainer');
const customScrollbarH = document.getElementById('customScrollbarH');
const customThumbH = document.getElementById('customThumbH');
let scrollTimeoutH;

function triggerScrollbarCue() {
  if (!tableContainer || !customScrollbarH || !customThumbH) return;
  const scrollWidth = tableContainer.scrollWidth; const clientWidth = tableContainer.clientWidth;
  if (scrollWidth > clientWidth) {
    const thumbWidth = Math.max((clientWidth / scrollWidth) * clientWidth, 40); 
    const scrollLeft = tableContainer.scrollLeft; const maxScrollLeft = scrollWidth - clientWidth;
    const progress = maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0; const thumbX = progress * (clientWidth - thumbWidth);
    customThumbH.style.width = `${thumbWidth}px`; customThumbH.style.transform = `translateX(${thumbX}px)`; customScrollbarH.classList.add('is-active');
    clearTimeout(scrollTimeoutH); scrollTimeoutH = setTimeout(() => customScrollbarH.classList.remove('is-active'), 1000);
  } else { customScrollbarH.classList.remove('is-active'); }
}

if (tableContainer && customScrollbarH && customThumbH) {
  tableContainer.addEventListener('scroll', () => {
    const scrollWidth = tableContainer.scrollWidth; const clientWidth = tableContainer.clientWidth; const scrollLeft = tableContainer.scrollLeft;
    if (scrollWidth <= clientWidth) return;
    const thumbWidth = Math.max((clientWidth / scrollWidth) * clientWidth, 40); 
    const maxScrollLeft = scrollWidth - clientWidth; const progress = scrollLeft / maxScrollLeft; const thumbX = progress * (clientWidth - thumbWidth);
    customThumbH.style.width = `${thumbWidth}px`; customThumbH.style.transform = `translateX(${thumbX}px)`; customScrollbarH.classList.add('is-active');
    clearTimeout(scrollTimeoutH); scrollTimeoutH = setTimeout(() => customScrollbarH.classList.remove('is-active'), 400);
  });
  let resizeTimer; window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(triggerScrollbarCue, 200); });
}

const tabsWrapper = document.querySelector('.tabs-wrapper');
if (tabsWrapper) {
  let isDown = false; let startX; let scrollLeft; let velX = 0; let momentumID; window.isDraggingTabs = false;
  tabsWrapper.addEventListener('mousedown', (e) => {
    isDown = true; window.isDraggingTabs = false; tabsWrapper.style.cursor = 'grabbing';
    startX = e.pageX - tabsWrapper.offsetLeft; scrollLeft = tabsWrapper.scrollLeft; cancelAnimationFrame(momentumID); 
  });
  tabsWrapper.addEventListener('mouseleave', () => { isDown = false; tabsWrapper.style.cursor = 'auto'; });
  tabsWrapper.addEventListener('mouseup', () => { isDown = false; tabsWrapper.style.cursor = 'auto'; beginMomentum(); setTimeout(() => { window.isDraggingTabs = false; }, 50); });
  tabsWrapper.addEventListener('mousemove', (e) => {
    if (!isDown) return; e.preventDefault();
    const x = e.pageX - tabsWrapper.offsetLeft; const walk = (x - startX) * 1.5; 
    if (Math.abs(walk) > 3) window.isDraggingTabs = true; 
    const prevScrollLeft = tabsWrapper.scrollLeft; tabsWrapper.scrollLeft = scrollLeft - walk; velX = tabsWrapper.scrollLeft - prevScrollLeft; 
  });
  function beginMomentum() { momentumID = requestAnimationFrame(momentumLoop); }
  function momentumLoop() { if (Math.abs(velX) > 0.5) { tabsWrapper.scrollLeft += velX; velX *= 0.92; momentumID = requestAnimationFrame(momentumLoop); } }
}

document.querySelectorAll('.admin-modal-overlay').forEach(overlay => {
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) { overlay.classList.remove('is-visible'); if (overlay.id === 'editCategoryModal') draftCategories = []; isDirectAdd = false; } });
});


// =========================================================
// 12. Blob 物理内存固化引擎 (导出 JSON 文件)
// =========================================================
const exportBtn = document.getElementById('exportBtn');
if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    const dataString = JSON.stringify(SITE_DATA, null, 2);
    const blob = new Blob([dataString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `data.json`; 
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  });
}


// =========================================================
// 🌟 13. 终极初始化装载 (注入 fetch 线上获取引擎)
// =========================================================
window.addEventListener('load', async () => {
  
  // 1. 尝试从同级目录抓取真实的 data.json (需在 Live Server 下运行)
  try {
    // 附加 no-store 防止浏览器自作聪明读取旧缓存
    const response = await fetch('./data.json', { cache: 'no-store' });
    if (response.ok) {
      SITE_DATA = await response.json();
      console.log('🟢 [引擎进化]：成功挂载同级目录 data.json 物理数据！');
      
      // 既然线上文件是绝对真理，就顺手用它把本地 localStorage 里的脏草稿洗掉
      syncMemoryToDrive(); 
    } else {
      throw new Error('未找到文件');
    }
  } catch (error) {
    // 2. 如果你在文件夹里直接双击 html 导致跨域，或者根本没建 data.json 文件
    // 系统立刻降维，回退至“草稿箱”模式，确保你的操作不丢失
    console.warn('🟡 [物理拦截]：未找到 data.json 或是处于 file:// 协议，系统降级为草稿箱缓存模式。');
    loadMemoryFromDrive();
  }

  // --- 回显全局设置 ---
  const siteTitleInput = document.getElementById('siteTitleInput');
  const faviconInput = document.getElementById('faviconFilename');
  const logoInput = document.getElementById('logoFilename');

  if (siteTitleInput) {
    siteTitleInput.value = SITE_DATA.site.title || '';
    siteTitleInput.addEventListener('input', (e) => { SITE_DATA.site.title = e.target.value; syncMemoryToDrive(); });
  }
  if (faviconInput && logoInput) {
    faviconInput.value = SITE_DATA.site.favicon ? SITE_DATA.site.favicon.split('/').pop().replace(/\.svg$/i, '') : '';
    logoInput.value = SITE_DATA.site.logo ? SITE_DATA.site.logo.split('/').pop().replace(/\.svg$/i, '') : '';
    faviconInput.addEventListener('input', (e) => { const val = e.target.value.trim(); SITE_DATA.site.favicon = val ? `assets/images/${val}.svg` : ""; syncMemoryToDrive(); });
    logoInput.addEventListener('input', (e) => { const val = e.target.value.trim(); SITE_DATA.site.logo = val ? `assets/images/${val}.svg` : ""; syncMemoryToDrive(); });
  }

  // --- 初始化渲染 ---
  switchAdminView('view-site', sidebarItems[0], false);
  renderSiteTables(); 
  renderTabs();
  renderTable();
  const currentCategory = SITE_DATA.categories.find(c => c.id === currentCategoryId);
  if(currentCategory) initSortableTable(tableBody, currentCategory.links, renderTable);
});