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
    const deleteBtn = e.target.closest('.row-delete-btn');
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const rowId = deleteBtn.dataset.rowId;
      if (rowId) handleDeleteRow(rowId);
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

  sheets.forEach(sheet => {
    const btn = document.createElement('button');
    btn.className = `nav-item sheet-item${sheet._id === currentSheetId ? ' active' : ''}`;
    btn.dataset.sheetId = sheet._id;
    btn.innerHTML = `
      <span class="sheet-dot"></span>
      <span class="sheet-name">${sheet.name}</span>
      ${isAdmin ? `<span class="sheet-delete" data-delete="${sheet._id}" title="Delete sheet">✕</span>` : ''}
    `;

    btn.addEventListener('click', (e) => {
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
  document.getElementById('page-subtitle').textContent = 'Personnel Management';
  document.getElementById('total-count').textContent = rows.length;
}

function renderSpreadsheet() {
  const container = document.getElementById('spreadsheet-container');
  if (!currentSheetData) {
    container.innerHTML = `<div class="spreadsheet-empty"><img src="/logo.png" alt="KGT" class="empty-logo" /><p>Select a sheet from the sidebar</p></div>`;
    return;
  }

  const { sheet, rows } = currentSheetData;
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
      html += `<tr class="section-divider"><td colspan="${colSpan}">${section.title}</td></tr>`;
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
