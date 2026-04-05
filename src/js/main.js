/* ═══════════════════════════════════════════
   K.G.T. Main Application Entry
   ═══════════════════════════════════════════ */

import { initParticles, initLogin, checkAuth, logout } from './auth.js';
import { initDashboard, selectSheet } from './dashboard.js';
import { initCoding } from './coding.js';

/* ═══ Toast System ═══ */
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-dismiss">&times;</button>
  `;

  toast.querySelector('.toast-dismiss').addEventListener('click', () => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  });

  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

/* ═══ Modal System ═══ */
let modalResolve = null;

export function showModal(title, bodyHtml, onConfirm) {
  const overlay = document.getElementById('modal-overlay');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');

  titleEl.textContent = title;
  bodyEl.innerHTML = bodyHtml;
  overlay.classList.add('active');

  modalResolve = onConfirm;
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  modalResolve = null;
}

document.getElementById('modal-close')?.addEventListener('click', closeModal);
document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
document.getElementById('modal-confirm')?.addEventListener('click', () => {
  if (modalResolve) modalResolve();
  closeModal();
});
document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

/* ═══ Time Display ═══ */
function updateTime() {
  const el = document.getElementById('topbar-time');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}

/* ═══ Navigation ═══ */
let currentPage = 'dashboard';

function switchPage(page) {
  currentPage = page;

  /* Nav buttons */
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });

  /* Views */
  document.querySelectorAll('.content-view').forEach(view => {
    view.classList.remove('active');
  });

  if (page === 'dashboard') {
    document.getElementById('dashboard-view').classList.add('active');
    document.getElementById('page-title').textContent = 'Dashboard';
    document.getElementById('page-subtitle').textContent = 'Personnel Management';
    document.getElementById('total-stat').style.display = 'flex';
  } else if (page === 'coding') {
    document.getElementById('coding-view').classList.add('active');
    document.getElementById('page-title').textContent = 'Coding System';
    document.getElementById('page-subtitle').textContent = 'Codes & Protocols';
    document.getElementById('total-stat').style.display = 'none';
  }
}

/* ═══ Init ═══ */
async function init() {
  /* Check if already authenticated */
  const user = checkAuth();

  if (user) {
    showApp(user);
  } else {
    showLogin();
  }
}

function showLogin() {
  document.getElementById('login-page').classList.add('active');
  document.getElementById('app-page').classList.remove('active');
  initParticles();
  initLogin((user) => showApp(user));
}

async function showApp(user) {
  document.getElementById('login-page').classList.remove('active');
  document.getElementById('app-page').classList.add('active');

  /* Set user info in sidebar */
  document.getElementById('user-name').textContent = user.displayName || user.username;
  document.getElementById('user-role').textContent = user.role === 'admin' ? 'Administrator' : 'Viewer';
  document.getElementById('user-avatar').textContent = (user.displayName || user.username).charAt(0).toUpperCase();

  /* Init modules */
  await initDashboard(user);
  await initCoding(user);

  /* Navigation */
  document.getElementById('nav-dashboard')?.addEventListener('click', () => switchPage('dashboard'));
  document.getElementById('nav-coding')?.addEventListener('click', () => switchPage('coding'));

  /* Sidebar toggle */
  document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
  });

  /* Logout */
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  });

  /* Time */
  updateTime();
  setInterval(updateTime, 1000);

  switchPage('dashboard');
}

/* ═══ Boot ═══ */
document.addEventListener('DOMContentLoaded', init);
