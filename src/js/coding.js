/* ═══════════════════════════════════════════
   K.G.T. Coding System Module
   ═══════════════════════════════════════════ */

import { api } from './api.js';
import { showToast, showModal } from './main.js';

let categories = [];
let isAdmin = false;

export async function initCoding(user) {
  isAdmin = user.role === 'admin';

  if (isAdmin) {
    document.getElementById('coding-toolbar').style.display = 'flex';
  }

  document.getElementById('add-category-btn')?.addEventListener('click', handleAddCategory);
  document.getElementById('code-search')?.addEventListener('input', handleSearch);

  await loadCodes();
}

async function loadCodes() {
  try {
    categories = await api.getCodes();
    renderCategories(categories);
  } catch (err) {
    showToast('Failed to load codes', 'error');
  }
}

function renderCategories(cats) {
  const container = document.getElementById('coding-container');

  if (cats.length === 0) {
    container.innerHTML = `
      <div class="coding-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
        </svg>
        <p>No code categories found</p>
      </div>
    `;
    return;
  }

  container.innerHTML = cats.map((cat, idx) => `
    <div class="code-category" data-cat-id="${cat._id}" style="animation-delay: ${idx * 0.08}s">
      <div class="category-header" data-toggle="${cat._id}">
        <div class="category-header-left">
          <div class="category-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
          </div>
          <div class="category-info">
            <h3>${cat.name}</h3>
            <p>${cat.description || 'No description'}</p>
          </div>
        </div>
        <div class="category-header-right">
          <span class="category-count">${cat.codes?.length || 0} codes</span>
          ${isAdmin ? `
            <div class="category-actions">
              <button class="category-action-btn edit-cat-btn" data-cat-id="${cat._id}" title="Edit category">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="category-action-btn delete-cat-btn" data-cat-id="${cat._id}" title="Delete category">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          ` : ''}
          <svg class="category-toggle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
      <div class="category-body" id="cat-body-${cat._id}">
        ${(cat.codes || []).map(code => `
          <div class="code-item" data-code="${code.code}">
            <span class="code-badge ${code.severity}">${code.code}</span>
            <div class="code-info">
              <h4>${code.title}</h4>
              <p>${code.description}</p>
            </div>
            <span class="code-severity ${code.severity}">${code.severity}</span>
            ${isAdmin ? `
              <div class="code-item-actions">
                <button class="code-item-action delete-code-item-btn" data-cat-id="${cat._id}" data-code="${code.code}" title="Delete code">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            ` : ''}
          </div>
        `).join('')}
        ${isAdmin ? `
          <button class="add-code-btn" data-cat-id="${cat._id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Code
          </button>
        ` : ''}
      </div>
    </div>
  `).join('');

  /* Attach event listeners */
  container.querySelectorAll('.category-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('.category-actions')) return;
      const catId = header.dataset.toggle;
      const body = document.getElementById(`cat-body-${catId}`);
      const toggle = header.querySelector('.category-toggle');
      body.classList.toggle('expanded');
      toggle.classList.toggle('expanded');
    });
  });

  if (isAdmin) {
    container.querySelectorAll('.edit-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleEditCategory(btn.dataset.catId);
      });
    });

    container.querySelectorAll('.delete-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeleteCategory(btn.dataset.catId);
      });
    });

    container.querySelectorAll('.add-code-btn').forEach(btn => {
      btn.addEventListener('click', () => handleAddCode(btn.dataset.catId));
    });

    container.querySelectorAll('.delete-code-item-btn').forEach(btn => {
      btn.addEventListener('click', () => handleDeleteCode(btn.dataset.catId, btn.dataset.code));
    });
  }
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    renderCategories(categories);
    return;
  }

  const filtered = categories.map(cat => {
    const matchedCodes = (cat.codes || []).filter(c =>
      c.code.toLowerCase().includes(query) ||
      c.title.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query)
    );
    if (matchedCodes.length > 0 || cat.name.toLowerCase().includes(query)) {
      return { ...cat, codes: matchedCodes.length > 0 ? matchedCodes : cat.codes };
    }
    return null;
  }).filter(Boolean);

  renderCategories(filtered);

  /* Auto-expand matching categories */
  filtered.forEach(cat => {
    const body = document.getElementById(`cat-body-${cat._id}`);
    const toggle = document.querySelector(`[data-toggle="${cat._id}"] .category-toggle`);
    if (body) body.classList.add('expanded');
    if (toggle) toggle.classList.add('expanded');
  });
}

/* ── Add Category ── */
function handleAddCategory() {
  const formHtml = `
    <div class="form-group"><label>Category Name</label><input type="text" id="modal-cat-name" placeholder="e.g. Traffic Codes" /></div>
    <div class="form-group"><label>Description</label><textarea id="modal-cat-desc" placeholder="Brief description of this category"></textarea></div>
  `;

  showModal('Add Code Category', formHtml, async () => {
    const name = document.getElementById('modal-cat-name').value.trim();
    const description = document.getElementById('modal-cat-desc').value.trim();
    if (!name) return showToast('Category name is required', 'error');

    try {
      await api.createCode({ name, description, codes: [] });
      await loadCodes();
      showToast('Category created', 'success');
    } catch (err) {
      showToast('Failed to create category', 'error');
    }
  });
}

/* ── Edit Category ── */
function handleEditCategory(catId) {
  const cat = categories.find(c => c._id === catId);
  if (!cat) return;

  const formHtml = `
    <div class="form-group"><label>Category Name</label><input type="text" id="modal-cat-name" value="${cat.name}" /></div>
    <div class="form-group"><label>Description</label><textarea id="modal-cat-desc">${cat.description || ''}</textarea></div>
  `;

  showModal('Edit Category', formHtml, async () => {
    const name = document.getElementById('modal-cat-name').value.trim();
    const description = document.getElementById('modal-cat-desc').value.trim();
    if (!name) return showToast('Category name is required', 'error');

    try {
      await api.updateCode(catId, { name, description });
      await loadCodes();
      showToast('Category updated', 'success');
    } catch (err) {
      showToast('Failed to update category', 'error');
    }
  });
}

/* ── Delete Category ── */
async function handleDeleteCategory(catId) {
  if (!confirm('Delete this entire category and all its codes?')) return;

  try {
    await api.deleteCode(catId);
    await loadCodes();
    showToast('Category deleted', 'success');
  } catch (err) {
    showToast('Failed to delete category', 'error');
  }
}

/* ── Add Code to Category ── */
function handleAddCode(catId) {
  const formHtml = `
    <div class="form-group"><label>Code</label><input type="text" id="modal-code" placeholder="e.g. PC-007" /></div>
    <div class="form-group"><label>Title</label><input type="text" id="modal-code-title" placeholder="e.g. Reckless Driving" /></div>
    <div class="form-group"><label>Description</label><textarea id="modal-code-desc" placeholder="Description of this code"></textarea></div>
    <div class="form-group"><label>Severity</label><select id="modal-code-sev">
      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
    </select></div>
  `;

  showModal('Add Code', formHtml, async () => {
    const code = document.getElementById('modal-code').value.trim();
    const title = document.getElementById('modal-code-title').value.trim();
    const description = document.getElementById('modal-code-desc').value.trim();
    const severity = document.getElementById('modal-code-sev').value;

    if (!code || !title) return showToast('Code and title are required', 'error');

    const cat = categories.find(c => c._id === catId);
    if (!cat) return;

    const codes = [...(cat.codes || []), { code, title, description, severity }];

    try {
      await api.updateCode(catId, { codes });
      await loadCodes();
      showToast('Code added', 'success');
    } catch (err) {
      showToast('Failed to add code', 'error');
    }
  });
}

/* ── Delete Code from Category ── */
async function handleDeleteCode(catId, codeStr) {
  const cat = categories.find(c => c._id === catId);
  if (!cat) return;

  const codes = (cat.codes || []).filter(c => c.code !== codeStr);

  try {
    await api.updateCode(catId, { codes });
    await loadCodes();
    showToast('Code removed', 'success');
  } catch (err) {
    showToast('Failed to remove code', 'error');
  }
}
