/* ═══════════════════════════════════════════
   K.G.T. Dashboard / Spreadsheet Module
   ═══════════════════════════════════════════ */

import { api } from './api.js';
import { showToast, showModal } from './main.js';

let sheets = [];
let currentSheetId = null;
let currentSheetData = null;
let isAdmin = false;

export async function initDashboard(user) {
  isAdmin = user.role === 'admin';

  if (isAdmin) {
    document.getElementById('spreadsheet-toolbar').style.display = 'flex';
    document.getElementById('add-sheet-btn').style.display = 'flex';
  }

  document.getElementById('add-row-btn')?.addEventListener('click', handleAddRow);
  document.getElementById('add-section-btn')?.addEventListener('click', handleAddSection);
  document.getElementById('add-sheet-btn')?.addEventListener('click', handleAddSheet);

  /* Event delegation — attach once on init */
  const container = document.getElementById('spreadsheet-container');
  container.addEventListener('dblclick', (e) => {
    if (!isAdmin) return;
    const td = e.target.closest('td.editable');
    if (td) startEdit(td);
  });

  container.addEventListener('click', (e) => {
    if (!isAdmin) return;

    /* Row delete button */
    const deleteBtn = e.target.closest('.row-delete-btn');
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const rowId = deleteBtn.dataset.rowId;
      if (rowId) handleDeleteRow(rowId);
      return;
    }

    /* Section edit button */
    const sectionEditBtn = e.target.closest('.section-edit-btn');
    if (sectionEditBtn) {
      e.preventDefault();
      e.stopPropagation();
      const title = sectionEditBtn.dataset.sectionTitle;
      if (title) handleEditSection(title);
      return;
    }

    /* Section delete button */
    const sectionDeleteBtn = e.target.closest('.section-delete-btn');
    if (sectionDeleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const title = sectionDeleteBtn.dataset.sectionTitle;
      if (title) handleDeleteSection(title);
      return;
    }
  });

  await loadSheets();
}

export async function loadSheets() {
  try {
    sheets = await api.getSheets();
    renderSheetNav();
    if (sheets.length > 0 && !currentSheetId) {
      selectSheet(sheets[0]._id);
    }
  } catch (err) {
    showToast('Failed to load sheets', 'error');
  }
}

function renderSheetNav() {
  const list = document.getElementById('sheet-nav-list');
  list.innerHTML = '';

  /* Sort sheets by order */
  const sorted = [...sheets].sort((a, b) => (a.order || 0) - (b.order || 0));

  sorted.forEach((sheet, idx) => {
    const btn = document.createElement('button');
    btn.className = `nav-item sheet-item${sheet._id === currentSheetId ? ' active' : ''}`;
    btn.dataset.sheetId = sheet._id;

    let reorderHtml = '';
    if (isAdmin && sorted.length > 1) {
      reorderHtml = `
        <span class="sheet-reorder-btns">
          <span class="sheet-reorder-btn sheet-move-up" data-move-id="${sheet._id}" data-direction="up" title="Move up"${idx === 0 ? ' style="visibility:hidden"' : ''}>▲</span>
          <span class="sheet-reorder-btn sheet-move-down" data-move-id="${sheet._id}" data-direction="down" title="Move down"${idx === sorted.length - 1 ? ' style="visibility:hidden"' : ''}>▼</span>
        </span>
      `;
    }

    btn.innerHTML = `
      <span class="sheet-dot"></span>
      <span class="sheet-name">${sheet.name}</span>
      ${reorderHtml}
      ${isAdmin ? `<span class="sheet-delete" data-delete="${sheet._id}" title="Delete sheet">✕</span>` : ''}
    `;

    btn.addEventListener('click', (e) => {
      /* Handle reorder button clicks */
      const moveBtn = e.target.closest('.sheet-reorder-btn');
      if (moveBtn) {
        e.stopPropagation();
        const moveId = moveBtn.dataset.moveId;
        const direction = moveBtn.dataset.direction;
        if (moveId && direction) handleMoveSheet(moveId, direction);
        return;
      }

      if (e.target.dataset.delete) {
        e.stopPropagation();
        handleDeleteSheet(e.target.dataset.delete);
        return;
      }
      selectSheet(sheet._id);
    });

    list.appendChild(btn);
  });
}

export async function selectSheet(sheetId) {
  currentSheetId = sheetId;
  renderSheetNav();

  try {
    currentSheetData = await api.getSheet(sheetId);
    renderSpreadsheet();
    updatePageInfo();
  } catch (err) {
    showToast('Failed to load sheet data', 'error');
  }
}

function updatePageInfo() {
  if (!currentSheetData) return;
  const { sheet, rows } = currentSheetData;
  document.getElementById('page-title').textContent = sheet.name;

  const isCipher = sheet.name === 'Encryption Codes' || (sheet.columns && sheet.columns.some(c => c.key === 'cipher'));
  if (isCipher) {
    document.getElementById('page-subtitle').textContent = 'Encryption System';
    document.getElementById('total-stat').style.display = 'none';
  } else {
    document.getElementById('page-subtitle').textContent = 'Personnel Management';
    document.getElementById('total-stat').style.display = 'flex';
    document.getElementById('total-count').textContent = rows.length;
  }
}

function renderSpreadsheet() {
  const container = document.getElementById('spreadsheet-container');
  if (!currentSheetData) {
    container.innerHTML = `<div class="spreadsheet-empty"><img src="/logo.png" alt="KGT" class="empty-logo" /><p>Select a sheet from the sidebar</p></div>`;
    return;
  }

  const { sheet, rows } = currentSheetData;

  /* ── Check if this is the Cipher Sheet → custom visual layout ── */
  if (sheet.name === 'Encryption Codes' || (sheet.columns && sheet.columns.some(c => c.key === 'cipher'))) {
    renderCipherSheet(container, sheet, rows);
    return;
  }

  const sections = sheet.sections || [];
  const columns = sheet.columns || [];

  let html = '';

  /* Sheet header */
  html += `
    <div class="sheet-header">
      <img src="/logo.png" alt="KGT" class="sheet-header-logo" />
      <div class="sheet-header-info">
        <h2 class="sheet-header-title">${sheet.name}</h2>
      </div>
      <img src="/logo.png" alt="KGT" class="sheet-header-logo" />
      <div class="sheet-header-total">Total : ${rows.length}</div>
    </div>
  `;

  /* Table */
  html += `<div class="spreadsheet-table-wrapper"><table class="spreadsheet-table"><thead><tr>`;

  columns.forEach(col => {
    html += `<th style="min-width:${col.width}px">${col.label}</th>`;
  });

  if (isAdmin) html += `<th style="min-width:80px">Actions</th>`;
  html += `</tr></thead><tbody>`;

  if (sections.length > 0) {
    const sorted = [...sections].sort((a, b) => a.order - b.order);
    sorted.forEach(section => {
      const sectionRows = rows.filter(r => r.section === section.title).sort((a, b) => a.order - b.order);
      const colSpan = columns.length + (isAdmin ? 1 : 0);

      /* Section divider with edit/delete buttons for admins */
      if (isAdmin) {
        html += `<tr class="section-divider">
          <td colspan="${colSpan}">
            <span class="section-title-text">${section.title}</span>
            <span class="section-actions">
              <button class="section-action-btn section-edit-btn" data-section-title="${section.title}" title="Edit section name">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="section-action-btn section-delete-btn" data-section-title="${section.title}" title="Delete section">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </span>
          </td>
        </tr>`;
      } else {
        html += `<tr class="section-divider"><td colspan="${colSpan}">${section.title}</td></tr>`;
      }

      sectionRows.forEach(row => {
        html += renderRow(row, columns);
      });
    });

    /* Rows without a section */
    const unsectioned = rows.filter(r => !r.section || !sections.find(s => s.title === r.section));
    if (unsectioned.length > 0) {
      const colSpan = columns.length + (isAdmin ? 1 : 0);
      html += `<tr class="section-divider"><td colspan="${colSpan}">Other</td></tr>`;
      unsectioned.forEach(row => {
        html += renderRow(row, columns);
      });
    }
  } else {
    rows.forEach(row => {
      html += renderRow(row, columns);
    });
  }

  html += `</tbody></table></div>`;
  container.innerHTML = html;

}

function renderRow(row, columns) {
  let html = `<tr data-row-id="${row._id}">`;

  columns.forEach(col => {
    const value = row.data[col.key] || '';
    const editClass = isAdmin ? ' editable' : '';

    if (col.type === 'badge') {
      html += `<td class="${editClass}" data-key="${col.key}" data-row-id="${row._id}" data-type="badge" data-options='${JSON.stringify(col.options || [])}'>
        <span class="cell-badge" data-status="${value}">${value}</span>
      </td>`;
    } else if (col.type === 'dropdown') {
      html += `<td class="${editClass}" data-key="${col.key}" data-row-id="${row._id}" data-type="dropdown" data-options='${JSON.stringify(col.options || [])}'>
        <span class="cell-dropdown" data-value="${value}">${value}</span>
      </td>`;
    } else {
      const isBold = col.key === 'name' || col.key === 'rank' || col.key === 'badge';
      const isCategory = col.key === 'category';
      const isNumber = /^\d+$/.test(value);
      const isItemCol = col.key.includes('_item');
      const isTexCol = col.key.includes('_tex');
      let extraClass = '';
      if (isBold) extraClass += ' cell-text-bold';
      if (isCategory) extraClass += ' cell-category';
      if (isNumber && isItemCol) extraClass += ' cell-number cell-number-item';
      else if (isNumber && isTexCol) extraClass += ' cell-number cell-number-tex';
      else if (isNumber) extraClass += ' cell-number';
      html += `<td class="${editClass}${extraClass}" data-key="${col.key}" data-row-id="${row._id}" data-type="text">${value}</td>`;
    }
  });

  if (isAdmin) {
    html += `<td>
      <div class="row-actions">
        <button class="row-action-btn row-delete-btn" data-row-id="${row._id}" onclick="window.__kgtDeleteRow('${row._id}')" title="Delete row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </td>`;
  }

  html += `</tr>`;
  return html;
}

function startEdit(td) {
  if (td.classList.contains('editing')) return;
  td.classList.add('editing');

  const key = td.dataset.key;
  const rowId = td.dataset.rowId;
  const type = td.dataset.type;
  const currentValue = getCurrentCellValue(td);
  let saved = false;

  const doSave = (value) => {
    if (saved) return;
    saved = true;
    saveEdit(td, key, rowId, type, value, currentValue);
  };

  if (type === 'dropdown' || type === 'badge') {
    const options = JSON.parse(td.dataset.options || '[]');
    const select = document.createElement('select');
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt;
      option.textContent = opt;
      if (opt === currentValue) option.selected = true;
      select.appendChild(option);
    });

    td.innerHTML = '';
    td.appendChild(select);
    select.focus();

    select.addEventListener('change', () => doSave(select.value));
    select.addEventListener('blur', () => doSave(select.value));
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentValue;
    td.innerHTML = '';
    td.appendChild(input);
    input.focus();
    input.select();

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); doSave(input.value); }
      if (e.key === 'Escape') { saved = true; cancelEdit(td, key, type, currentValue); }
    });
    input.addEventListener('blur', () => doSave(input.value));
  }
}

function getCurrentCellValue(td) {
  const badge = td.querySelector('.cell-badge');
  if (badge) return badge.textContent;
  const dropdown = td.querySelector('.cell-dropdown');
  if (dropdown) return dropdown.textContent;
  return td.textContent.trim();
}

async function saveEdit(td, key, rowId, type, newValue, originalValue) {
  td.classList.remove('editing');

  /* Find the row data */
  const row = currentSheetData.rows.find(r => r._id === rowId);
  if (!row) {
    renderCellValue(td, key, type, originalValue || newValue);
    return;
  }

  const oldValue = originalValue !== undefined ? originalValue : row.data[key];
  if (oldValue === newValue) {
    renderCellValue(td, key, type, newValue);
    return;
  }

  row.data[key] = newValue;
  renderCellValue(td, key, type, newValue);

  try {
    await api.updateRow(currentSheetId, rowId, { data: row.data, section: row.section });
    showToast('Cell updated', 'success');
  } catch (err) {
    row.data[key] = oldValue;
    renderCellValue(td, key, type, oldValue);
    showToast('Failed to update: ' + (err.message || 'Unknown error'), 'error');
  }
}

function cancelEdit(td, key, type, value) {
  td.classList.remove('editing');
  renderCellValue(td, key, type, value);
}

function renderCellValue(td, key, type, value) {
  if (type === 'badge') {
    td.innerHTML = `<span class="cell-badge" data-status="${value}">${value}</span>`;
  } else if (type === 'dropdown') {
    td.innerHTML = `<span class="cell-dropdown" data-value="${value}">${value}</span>`;
  } else {
    td.textContent = value;
  }
}

/* ── Add Row ── */
async function handleAddRow() {
  if (!currentSheetData) return;

  const sections = currentSheetData.sheet.sections || [];
  const columns = currentSheetData.sheet.columns || [];

  let formHtml = '';
  if (sections.length > 0) {
    formHtml += `<div class="form-group"><label>Place in Section</label><select id="modal-row-section">`;
    sections.forEach(s => { formHtml += `<option value="${s.title}">${s.title}</option>`; });
    formHtml += `</select></div>`;
  }

  columns.forEach(col => {
    if (col.type === 'dropdown' || col.type === 'badge') {
      formHtml += `<div class="form-group"><label>${col.label}</label><select id="modal-col-${col.key}">`;
      (col.options || []).forEach(opt => { formHtml += `<option value="${opt}">${opt}</option>`; });
      formHtml += `</select></div>`;
    } else {
      formHtml += `<div class="form-group"><label>${col.label}</label><input type="text" id="modal-col-${col.key}" placeholder="${col.label}" /></div>`;
    }
  });

  showModal('Add New Row', formHtml, async () => {
    const data = {};
    columns.forEach(col => {
      const el = document.getElementById(`modal-col-${col.key}`);
      data[col.key] = el ? el.value : '';
    });

    const sectionEl = document.getElementById('modal-row-section');
    const section = sectionEl ? sectionEl.value : '';

    try {
      await api.addRow(currentSheetId, { section, data });
      currentSheetData = await api.getSheet(currentSheetId);
      renderSpreadsheet();
      updatePageInfo();
      showToast('Row added successfully', 'success');
    } catch (err) {
      showToast('Failed to add row', 'error');
    }
  });
}

/* ── Add Section ── */
function handleAddSection() {
  if (!currentSheetData) return;

  const formHtml = `<div class="form-group"><label>Section Title</label><input type="text" id="modal-section-title" placeholder="e.g. New Division" /></div>`;

  showModal('Add New Section', formHtml, async () => {
    const title = document.getElementById('modal-section-title').value.trim();
    if (!title) return showToast('Section title is required', 'error');

    const sections = [...(currentSheetData.sheet.sections || [])];
    sections.push({ title, order: sections.length });

    try {
      await api.updateSheet(currentSheetId, { sections });
      currentSheetData = await api.getSheet(currentSheetId);
      renderSpreadsheet();
      showToast('Section added', 'success');
    } catch (err) {
      showToast('Failed to add section', 'error');
    }
  });
}

/* ── Delete Row ── */
function handleDeleteRow(rowId) {
  console.log('[KGT] Delete requested for row:', rowId);
  if (!rowId) {
    showToast('No row ID provided', 'error');
    return;
  }

  showModal('Delete Row', '<p style="color:var(--text-secondary);">Are you sure you want to delete this row? This cannot be undone.</p>', async () => {
    try {
      console.log('[KGT] Deleting row:', rowId, 'from sheet:', currentSheetId);
      await api.deleteRow(currentSheetId, rowId);
      currentSheetData.rows = currentSheetData.rows.filter(r => r._id !== rowId);
      renderSpreadsheet();
      updatePageInfo();
      showToast('Row deleted', 'success');
    } catch (err) {
      console.error('[KGT] Delete failed:', err);
      showToast('Failed to delete row: ' + (err.message || 'Unknown error'), 'error');
    }
  });
}

/* Expose to window for inline onclick */
window.__kgtDeleteRow = handleDeleteRow;
console.log('[KGT] __kgtDeleteRow registered on window');

/* ── Add Sheet ── */
function handleAddSheet() {
  const formHtml = `
    <div class="form-group"><label>Sheet Name</label><input type="text" id="modal-sheet-name" placeholder="e.g. Equipment List" /></div>
    <div class="form-group"><label>Columns (comma-separated)</label><input type="text" id="modal-sheet-cols" placeholder="e.g. Item, Category, Status" /></div>
  `;

  showModal('Create New Sheet', formHtml, async () => {
    const name = document.getElementById('modal-sheet-name').value.trim();
    const colNames = document.getElementById('modal-sheet-cols').value.split(',').map(s => s.trim()).filter(Boolean);

    if (!name) return showToast('Sheet name is required', 'error');

    const columns = colNames.map(label => ({
      key: label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      label,
      type: 'text',
      width: 150
    }));

    try {
      const sheet = await api.createSheet({ name, columns, sections: [] });
      sheets.push(sheet);
      renderSheetNav();
      selectSheet(sheet._id);
      showToast('Sheet created', 'success');
    } catch (err) {
      showToast('Failed to create sheet', 'error');
    }
  });
}

/* ── Delete Sheet ── */
async function handleDeleteSheet(sheetId) {
  if (!confirm('Are you sure you want to delete this entire sheet? This cannot be undone.')) return;

  try {
    await api.deleteSheet(sheetId);
    sheets = sheets.filter(s => s._id !== sheetId);
    if (currentSheetId === sheetId) {
      currentSheetId = null;
      currentSheetData = null;
      if (sheets.length > 0) {
        selectSheet(sheets[0]._id);
      } else {
        document.getElementById('spreadsheet-container').innerHTML = `<div class="spreadsheet-empty"><img src="/logo.png" alt="KGT" class="empty-logo" /><p>No sheets available. Create one!</p></div>`;
      }
    }
    renderSheetNav();
    showToast('Sheet deleted', 'success');
  } catch (err) {
    showToast('Failed to delete sheet', 'error');
  }
}

/* ══════════════════════════════════════════
   NEW: Reorder Sheets (Move Up/Down)
   ══════════════════════════════════════════ */
async function handleMoveSheet(sheetId, direction) {
  const sorted = [...sheets].sort((a, b) => (a.order || 0) - (b.order || 0));
  const idx = sorted.findIndex(s => s._id === sheetId);
  if (idx === -1) return;

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= sorted.length) return;

  /* Swap orders */
  const tempOrder = sorted[idx].order;
  sorted[idx].order = sorted[swapIdx].order;
  sorted[swapIdx].order = tempOrder;

  /* If orders happen to be the same (data issue), force unique orders */
  if (sorted[idx].order === sorted[swapIdx].order) {
    sorted[idx].order = swapIdx;
    sorted[swapIdx].order = idx;
  }

  /* Update local state immediately for responsiveness */
  sheets = sheets.map(s => {
    if (s._id === sorted[idx]._id) return { ...s, order: sorted[idx].order };
    if (s._id === sorted[swapIdx]._id) return { ...s, order: sorted[swapIdx].order };
    return s;
  });
  renderSheetNav();

  /* Persist to server */
  try {
    const orders = sheets.map(s => ({ id: s._id, order: s.order }));
    const updated = await api.reorderSheets(orders);
    sheets = updated;
    renderSheetNav();
    showToast('Sheet order updated', 'success');
  } catch (err) {
    showToast('Failed to reorder: ' + (err.message || 'Unknown error'), 'error');
    /* Reload to get correct state */
    await loadSheets();
  }
}

/* ══════════════════════════════════════════
   NEW: Edit Section Name
   ══════════════════════════════════════════ */
function handleEditSection(oldTitle) {
  if (!currentSheetData) return;

  const formHtml = `
    <div class="form-group">
      <label>Current Name</label>
      <input type="text" disabled value="${oldTitle}" style="opacity:0.5" />
    </div>
    <div class="form-group">
      <label>New Section Name</label>
      <input type="text" id="modal-section-new-name" placeholder="Enter new name" value="${oldTitle}" />
    </div>
  `;

  showModal('Edit Section Name', formHtml, async () => {
    const newTitle = document.getElementById('modal-section-new-name').value.trim();
    if (!newTitle) return showToast('Section name is required', 'error');
    if (newTitle === oldTitle) return; /* No change */

    /* Check for duplicates */
    const sections = currentSheetData.sheet.sections || [];
    if (sections.some(s => s.title === newTitle)) {
      return showToast('A section with that name already exists', 'error');
    }

    /* Update section title in sheet definition */
    const updatedSections = sections.map(s =>
      s.title === oldTitle ? { ...s, title: newTitle } : s
    );

    try {
      /* 1. Update the sheet definition */
      await api.updateSheet(currentSheetId, { sections: updatedSections });

      /* 2. Reassign all rows that belong to the old section */
      const affectedRows = currentSheetData.rows.filter(r => r.section === oldTitle);
      for (const row of affectedRows) {
        await api.updateRow(currentSheetId, row._id, { data: row.data, section: newTitle });
      }

      /* 3. Reload sheet */
      currentSheetData = await api.getSheet(currentSheetId);
      renderSpreadsheet();
      showToast(`Section renamed to "${newTitle}"`, 'success');
    } catch (err) {
      showToast('Failed to rename section: ' + (err.message || 'Unknown error'), 'error');
    }
  });
}

/* ══════════════════════════════════════════
   NEW: Delete Section
   ══════════════════════════════════════════ */
function handleDeleteSection(title) {
  if (!currentSheetData) return;

  const sections = currentSheetData.sheet.sections || [];
  const affectedRows = currentSheetData.rows.filter(r => r.section === title);
  const rowCountMsg = affectedRows.length > 0
    ? `<p style="color:var(--accent-gold); margin-top:8px;">⚠ ${affectedRows.length} row(s) in this section will become unsectioned.</p>`
    : '';

  const bodyHtml = `
    <p style="color:var(--text-secondary);">Are you sure you want to delete the section <strong>"${title}"</strong>?</p>
    ${rowCountMsg}
  `;

  showModal('Delete Section', bodyHtml, async () => {
    /* Remove section from sheet definition */
    const updatedSections = sections
      .filter(s => s.title !== title)
      .map((s, i) => ({ ...s, order: i }));

    try {
      /* 1. Update sheet (remove the section) */
      await api.updateSheet(currentSheetId, { sections: updatedSections });

      /* 2. Unassign all rows from this section */
      for (const row of affectedRows) {
        await api.updateRow(currentSheetId, row._id, { data: row.data, section: '' });
      }

      /* 3. Reload sheet */
      currentSheetData = await api.getSheet(currentSheetId);
      renderSpreadsheet();
      showToast(`Section "${title}" deleted`, 'success');
    } catch (err) {
      showToast('Failed to delete section: ' + (err.message || 'Unknown error'), 'error');
    }
  });
}

/* ══════════════════════════════════════════
   CIPHER SHEET — Custom Visual Renderer
   ══════════════════════════════════════════ */

function parseShapes(cipherStr) {
  if (!cipherStr) return '';

  /* SVG shape templates — clean geometric shapes */
  const svgSize = 20;
  const shapeMap = {
    '▲': `<svg class="cipher-shape" width="${svgSize}" height="${svgSize}" viewBox="0 0 20 20"><polygon points="10,2 18,18 2,18" fill="#e8e8f0"/></svg>`,
    '△': `<svg class="cipher-shape" width="${svgSize}" height="${svgSize}" viewBox="0 0 20 20"><polygon points="10,2 18,18 2,18" fill="none" stroke="#a0a0b8" stroke-width="2"/></svg>`,
    '●': `<svg class="cipher-shape" width="${svgSize}" height="${svgSize}" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#e8e8f0"/></svg>`,
    '○': `<svg class="cipher-shape" width="${svgSize}" height="${svgSize}" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="none" stroke="#a0a0b8" stroke-width="2"/></svg>`,
    '■': `<svg class="cipher-shape" width="${svgSize}" height="${svgSize}" viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" fill="#e8e8f0"/></svg>`,
    '□': `<svg class="cipher-shape" width="${svgSize}" height="${svgSize}" viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" fill="none" stroke="#a0a0b8" stroke-width="2"/></svg>`,
    '◆': `<svg class="cipher-shape" width="${svgSize}" height="${svgSize}" viewBox="0 0 20 20"><polygon points="10,1 19,10 10,19 1,10" fill="#e8e8f0"/></svg>`,
    '◇': `<svg class="cipher-shape" width="${svgSize}" height="${svgSize}" viewBox="0 0 20 20"><polygon points="10,2 18,10 10,18 2,10" fill="none" stroke="#a0a0b8" stroke-width="2"/></svg>`
  };

  let result = '';
  for (const char of cipherStr) {
    if (shapeMap[char]) {
      result += shapeMap[char];
    }
    /* Skip spaces and other chars */
  }
  return result;
}

function renderCipherSheet(container, sheet, rows) {
  const sections = sheet.sections || [];
  const letterSection = sections.find(s => s.title.includes('Letters') || s.title.includes('الحروف'));
  const numberSection = sections.find(s => s.title.includes('Numbers') || s.title.includes('الأرقام'));

  const letterRows = rows.filter(r => r.section === (letterSection ? letterSection.title : '')).sort((a, b) => a.order - b.order);
  const numberRows = rows.filter(r => r.section === (numberSection ? numberSection.title : '')).sort((a, b) => a.order - b.order);

  /* If no section match, try to split by data */
  let lettersData = letterRows.length > 0 ? letterRows : rows.filter(r => /^[A-Z]$/i.test(r.data?.letter));
  let numbersData = numberRows.length > 0 ? numberRows : rows.filter(r => /^\d$/.test(r.data?.letter));

  let html = '';

  /* ── Banner Header ── */
  html += `
    <div class="cipher-banner">
      <div class="cipher-banner-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <div class="cipher-banner-info">
    <h2>Encryption System</h2>
        <p>Cipher Reference Sheet — Shape Code System</p>
      </div>
    </div>
  `;

  /* ── Shape Legend ── */
  html += `
    <div class="cipher-legend">
      <div class="cipher-legend-title">SHAPE LEGEND</div>
      <div class="cipher-legend-shapes">
        <span class="cipher-legend-item"><svg class="shape-preview" width="16" height="16" viewBox="0 0 20 20"><polygon points="10,2 18,18 2,18" fill="none" stroke="#a0a0b8" stroke-width="2"/></svg> Triangle (Outline)</span>
        <span class="cipher-legend-item"><svg class="shape-preview" width="16" height="16" viewBox="0 0 20 20"><polygon points="10,2 18,18 2,18" fill="#e8e8f0"/></svg> Triangle (Filled)</span>
        <span class="cipher-legend-item"><svg class="shape-preview" width="16" height="16" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" fill="none" stroke="#a0a0b8" stroke-width="2"/></svg> Circle (Outline)</span>
        <span class="cipher-legend-item"><svg class="shape-preview" width="16" height="16" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="#e8e8f0"/></svg> Circle (Filled)</span>
        <span class="cipher-legend-item"><svg class="shape-preview" width="16" height="16" viewBox="0 0 20 20"><polygon points="10,2 18,10 10,18 2,10" fill="none" stroke="#a0a0b8" stroke-width="2"/></svg> Diamond (Outline)</span>
        <span class="cipher-legend-item"><svg class="shape-preview" width="16" height="16" viewBox="0 0 20 20"><polygon points="10,1 19,10 10,19 1,10" fill="#e8e8f0"/></svg> Diamond (Filled)</span>
        <span class="cipher-legend-item"><svg class="shape-preview" width="16" height="16" viewBox="0 0 20 20"><rect x="3" y="3" width="14" height="14" fill="none" stroke="#a0a0b8" stroke-width="2"/></svg> Square (Outline)</span>
        <span class="cipher-legend-item"><svg class="shape-preview" width="16" height="16" viewBox="0 0 20 20"><rect x="2" y="2" width="16" height="16" fill="#e8e8f0"/></svg> Square (Filled)</span>
      </div>
    </div>
  `;

  /* ── Letters Section ── */
  if (lettersData.length > 0) {
    html += `
      <div class="cipher-section-header">
        <div class="cipher-section-left">
          <span class="cipher-section-badge">A — Z</span>
          <span class="cipher-section-title">الحروف والشفرات</span>
        </div>
        <span class="cipher-section-label">Letter Ciphers</span>
      </div>
      <div class="cipher-grid">
    `;

    lettersData.forEach(row => {
      const letter = row.data?.letter || '?';
      const cipher = row.data?.cipher || '';
      html += `
        <div class="cipher-card" title="${letter}: ${cipher}">
          <span class="cipher-card-letter">${letter}</span>
          <div class="cipher-card-shapes">${parseShapes(cipher)}</div>
        </div>
      `;
    });

    html += `</div>`;
  }

  /* ── Numbers Section ── */
  if (numbersData.length > 0) {
    html += `
      <div class="cipher-section-header">
        <div class="cipher-section-left">
          <span class="cipher-section-badge">0 — 9</span>
          <span class="cipher-section-title">الأرقام والشفرات</span>
        </div>
        <span class="cipher-section-label">Number Ciphers</span>
      </div>
      <div class="cipher-grid">
    `;

    numbersData.forEach(row => {
      const letter = row.data?.letter || '?';
      const cipher = row.data?.cipher || '';
      html += `
        <div class="cipher-card cipher-card-number" title="${letter}: ${cipher}">
          <span class="cipher-card-letter">${letter}</span>
          <div class="cipher-card-shapes">${parseShapes(cipher)}</div>
        </div>
      `;
    });

    html += `</div>`;
  }

  container.innerHTML = html;
}
