/* ═══════════════════════════════════════════
   K.G.T. API Client
   ═══════════════════════════════════════════ */

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('kgt_token');
}

function setToken(token) {
  localStorage.setItem('kgt_token', token);
}

function clearToken() {
  localStorage.removeItem('kgt_token');
  localStorage.removeItem('kgt_user');
}

function getUser() {
  const u = localStorage.getItem('kgt_user');
  return u ? JSON.parse(u) : null;
}

function setUser(user) {
  localStorage.setItem('kgt_user', JSON.stringify(user));
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  });

  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  getToken, setToken, clearToken, getUser, setUser,

  /* Auth */
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => request('/auth/me'),
  getUsers: () => request('/auth/users'),
  createUser: (data) => request('/auth/users', { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/auth/users/${id}`, { method: 'DELETE' }),

  /* Sheets */
  getSheets: () => request('/sheets'),
  getSheet: (id) => request(`/sheets/${id}`),
  createSheet: (data) => request('/sheets', { method: 'POST', body: JSON.stringify(data) }),
  updateSheet: (id, data) => request(`/sheets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSheet: (id) => request(`/sheets/${id}`, { method: 'DELETE' }),

  /* Rows */
  addRow: (sheetId, data) => request(`/sheets/${sheetId}/rows`, { method: 'POST', body: JSON.stringify(data) }),
  updateRow: (sheetId, rowId, data) => request(`/sheets/${sheetId}/rows/${rowId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteRow: (sheetId, rowId) => request(`/sheets/${sheetId}/rows/${rowId}`, { method: 'DELETE' }),

  /* Codes */
  getCodes: () => request('/codes'),
  createCode: (data) => request('/codes', { method: 'POST', body: JSON.stringify(data) }),
  updateCode: (id, data) => request(`/codes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCode: (id) => request(`/codes/${id}`, { method: 'DELETE' })
};
