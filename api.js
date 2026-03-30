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
  if (res.status === 402) {
    const data = await res.json();
    if (data.bloqueado) mostrarBloqueio(data.linkPagamento);
    return data;
  }
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
async function apiAniversariantes()        { return apiFetch('/clientes/aniversariantes'); }

// Funcionarios
async function apiAlterarSenha(senhaAtual, novaSenha) {
  return apiFetch('/auth/senha', { method: 'PUT', body: JSON.stringify({ senhaAtual, novaSenha }) });
}
async function apiUploadFoto(fd) { return apiFetch('/auth/foto', { method: 'PUT', body: fd }); }
async function apiListarFuncionarios() { return apiFetch('/auth/funcionarios'); }
async function apiCriarFuncionario(dados) {
  return apiFetch('/auth/funcionarios', { method: 'POST', body: JSON.stringify(dados) });
}

// Observacoes
async function apiListarObservacoes()   { return apiFetch('/observacoes'); }
async function apiCriarObservacao(texto) { return apiFetch('/observacoes', { method: 'POST', body: JSON.stringify({ texto }) }); }
async function apiRemoverObservacao(id) { return apiFetch(`/observacoes/${id}`, { method: 'DELETE' }); }

// Logs
async function apiListarLogs() { return apiFetch('/logs'); }

// Documentos
async function apiListarDocumentos(clienteId) { return apiFetch(`/clientes/${clienteId}/documentos`); }
async function apiUploadDocumento(clienteId, fd) { return apiFetch(`/clientes/${clienteId}/documentos`, { method: 'POST', body: fd }); }
async function apiRemoverDocumento(clienteId, docId) { return apiFetch(`/clientes/${clienteId}/documentos/${docId}`, { method: 'DELETE' }); }

// Toggle ativo
async function apiToggleAtivo(clienteId) { return apiFetch(`/clientes/${clienteId}/ativo`, { method: 'PATCH' }); }

// Assinatura do sistema
async function apiStatusAssinatura() {
  return fetch(`${API_BASE}/assinatura/status`).then(r => r.json());
}

// Bloqueio do sistema — overlay
let _bloqueioAtivo = false;
function mostrarBloqueio(linkPagamento) {
  if (_bloqueioAtivo) return;
  _bloqueioAtivo = true;

  let overlay = document.getElementById('overlay-bloqueio');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'overlay-bloqueio';
    overlay.innerHTML = `
      <div class="bloqueio-card">
        <div class="bloqueio-icon">🔒</div>
        <h2>Sistema Bloqueado</h2>
        <p>A mensalidade do sistema está pendente.<br>Efetue o pagamento para liberar o acesso.</p>
        <a id="btn-pagar-assinatura" href="#" target="_blank" class="bloqueio-btn">Pagar Agora</a>
        <p class="bloqueio-sub">Após o pagamento, o sistema será liberado automaticamente.</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const btn = document.getElementById('btn-pagar-assinatura');
  if (linkPagamento) {
    btn.href = linkPagamento;
    btn.style.display = '';
  } else {
    btn.style.display = 'none';
  }

  overlay.classList.add('visivel');

  // Polling: verifica a cada 30s se o pagamento foi feito
  clearInterval(window._bloqueioPolling);
  window._bloqueioPolling = setInterval(async () => {
    try {
      const res = await apiStatusAssinatura();
      if (res.ok && res.ativa) {
        overlay.classList.remove('visivel');
        _bloqueioAtivo = false;
        clearInterval(window._bloqueioPolling);
        window.location.reload();
      }
    } catch {}
  }, 30000);
}
