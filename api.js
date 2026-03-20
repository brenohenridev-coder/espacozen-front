const API_BASE = (window.EZ_CONFIG?.API_URL || '').replace(/\/$/, '') + '/api';

function getToken() { return localStorage.getItem('ez_token'); }
function getUser()  { try { return JSON.parse(localStorage.getItem('ez_user')); } catch { return null; } }

function logout() {
  localStorage.removeItem('ez_token');
  localStorage.removeItem('ez_user');
  window.location.href = '/';
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (res.status === 401) { logout(); return null; }
  return res.json();
}

async function apiLogin(email, senha) {
  return fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  }).then(r => r.json());
}

async function apiMe()                      { return apiFetch('/auth/me'); }
async function apiStats()                   { return apiFetch('/clientes/dashboard/stats'); }
async function apiListarClientes(p = {})    { return apiFetch(`/clientes?${new URLSearchParams(p)}`); }
async function apiObterCliente(id)          { return apiFetch(`/clientes/${id}`); }
async function apiCriarCliente(fd)          { return apiFetch('/clientes', { method: 'POST', body: fd }); }
async function apiAtualizarCliente(id, fd)  { return apiFetch(`/clientes/${id}`, { method: 'PUT', body: fd }); }
async function apiRemoverCliente(id)        { return apiFetch(`/clientes/${id}`, { method: 'DELETE' }); }
async function apiMarcarPago(id)            { return apiFetch(`/clientes/${id}/pagamento`, { method: 'PATCH' }); }
async function apiHistoricoPagamentos(id)   { return apiFetch(`/clientes/${id}/historico-pagamentos`); }
