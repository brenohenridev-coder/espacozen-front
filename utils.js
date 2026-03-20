function toast(msg, type = '', duration = 4500) {
  const c = document.getElementById('toasts');
  if (!c) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span style="flex-shrink:0">${{success:'✅',error:'❌',warning:'⚠️'}[type]||'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(el);
  setTimeout(() => { el.style.cssText += 'opacity:0;transform:translateX(20px);transition:.3s'; setTimeout(() => el.remove(), 300); }, duration);
}

function maskCPF(el) {
  let v = el.value.replace(/\D/g,'').slice(0,11);
  v = v.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})(\d{1,2})$/,'$1-$2');
  el.value = v;
}

function maskTel(el) {
  let v = el.value.replace(/\D/g,'').slice(0,11);
  v = v.replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2');
  el.value = v;
}

function fmtData(iso) {
  if (!iso) return '—';
  return new Date((iso+'').slice(0,10)+'T12:00:00').toLocaleDateString('pt-BR');
}

function fmtDataHora(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR');
}

function calcIdade(dateStr) {
  if (!dateStr) return '';
  const nasc = new Date((dateStr+'').slice(0,10)+'T12:00:00');
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  if (idade < 0) return '';
  if (idade < 1) {
    const meses = (hoje.getFullYear()*12+hoje.getMonth())-(nasc.getFullYear()*12+nasc.getMonth());
    return `${meses} ${meses===1?'mês':'meses'}`;
  }
  return `${idade} ${idade===1?'ano':'anos'}`;
}

function previewFoto(inputEl, imgId, placeholderId) {
  const file = inputEl.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById(imgId);
    const ph  = document.getElementById(placeholderId);
    if (img) { img.src = e.target.result; img.style.display = 'block'; }
    if (ph)  ph.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function buildAvatar(url, emoji = '👤', size = 40) {
  const fs = Math.floor(size * 0.45);
  if (url) {
    return `<div class="table-avatar" style="width:${size}px;height:${size}px">
      <img src="${url}" alt="" onerror="this.parentElement.innerHTML='<span style=font-size:${fs}px>${emoji}</span>'">
    </div>`;
  }
  return `<div class="table-avatar" style="width:${size}px;height:${size}px;font-size:${fs}px">${emoji}</div>`;
}

function confirmar(titulo, mensagem, onConfirm) {
  document.getElementById('confirmTitle').textContent = titulo;
  document.getElementById('confirmMsg').textContent   = mensagem;
  document.getElementById('confirmBtn').onclick = () => {
    document.getElementById('modalConfirm').classList.remove('open');
    onConfirm();
  };
  document.getElementById('modalConfirm').classList.add('open');
}

function closeConfirm() { document.getElementById('modalConfirm').classList.remove('open'); }

function setupModalClose(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', e => { if (e.target === el) fn(); });
}
