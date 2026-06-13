const ADMIN_USER = 'admin1';
const ADMIN_PASS = 'admin1';
const DB_KEY = 'hospitalControlDbV2';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);
const now = () => new Date().toISOString();
const brDate = (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const monthKey = (iso) => iso.slice(0, 7);

const seed = {
  session: false,
  items: [
    { id: uid(), name: 'Luva de procedimento M', category: 'Hospital', qty: 120, min: 40, createdAt: now() },
    { id: uid(), name: 'Soro fisiológico 500ml', category: 'Hospital', qty: 42, min: 25, createdAt: now() },
    { id: uid(), name: 'Kit curativo ambulância', category: 'Ambulância', qty: 16, min: 8, createdAt: now() },
    { id: uid(), name: 'Máscara cirúrgica', category: 'Hospital', qty: 300, min: 80, createdAt: now() }
  ],
  orders: [],
  exams: [
    { id: uid(), patient: 'Maria Oliveira', cpf: '000.000.000-00', type: 'Hemograma', status: 'Aguardando', createdAt: now() },
    { id: uid(), patient: 'João Santos', cpf: '111.111.111-11', type: 'Raio-X', status: 'Chamado', createdAt: now() }
  ],
  records: []
};

const storage = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEY)) || structuredClone(seed);
    } catch {
      return structuredClone(seed);
    }
  },
  set(value) { localStorage.setItem(DB_KEY, JSON.stringify(value)); }
};

let db = storage.get();

function save() { storage.set(db); renderAll(); }
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function escapeHtml(str = '') {
  return String(str).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}
function badge(status) {
  const cls = status === 'Retirado' || status === 'Finalizado' ? 'success' : status === 'Pronto para coleta' || status === 'Chamado' ? 'warning' : '';
  return `<span class="badge ${cls}">${escapeHtml(status)}</span>`;
}

function requireSession() {
  if (db.session) {
    $('#loginView').classList.add('hidden');
    $('#appView').classList.remove('hidden');
  } else {
    $('#loginView').classList.remove('hidden');
    $('#appView').classList.add('hidden');
  }
  renderAll();
}

$('#loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const user = $('#loginUser').value.trim();
  const pass = $('#loginPass').value.trim();
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    db.session = true;
    storage.set(db);
    requireSession();
    toast('Login realizado com sucesso.');
  } else {
    toast('Login ou senha incorretos. Use admin1 / admin1.');
  }
});

$('#logoutBtn').addEventListener('click', () => {
  db.session = false;
  storage.set(db);
  requireSession();
});

$$('.nav-btn').forEach(btn => btn.addEventListener('click', () => {
  const view = btn.dataset.view;
  $$('.nav-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  $$('.view-section').forEach(s => s.classList.remove('active-section'));
  $(`#${view}`).classList.add('active-section');
  const title = btn.textContent.replace(/[⌂▣↗◷✚☤]/g, '').trim();
  $('#pageTitle').textContent = title;
}));

$('#itemForm').addEventListener('submit', e => {
  e.preventDefault();
  db.items.unshift({ id: uid(), name: $('#itemName').value.trim(), category: $('#itemCategory').value, qty: Number($('#itemQty').value), min: Number($('#itemMin').value), createdAt: now() });
  e.target.reset();
  $('#itemQty').value = 0; $('#itemMin').value = 5;
  save();
  toast('Item cadastrado no almoxarifado.');
});

$('#orderForm').addEventListener('submit', e => {
  e.preventDefault();
  const item = db.items.find(i => i.id === $('#orderItem').value);
  if (!item) return toast('Cadastre um item antes de fazer pedido.');
  db.orders.unshift({
    id: uid(), person: $('#orderPerson').value.trim(), sector: $('#orderSector').value, itemId: item.id, itemName: item.name,
    qty: Number($('#orderQty').value), note: $('#orderNote').value.trim(), status: 'Pendente', createdAt: now(), readyAt: null, collectedAt: null
  });
  e.target.reset(); $('#orderQty').value = 1;
  save();
  toast('Pedido enviado ao almoxarifado.');
});

$('#examForm').addEventListener('submit', e => {
  e.preventDefault();
  db.exams.unshift({ id: uid(), patient: $('#examPatient').value.trim(), cpf: $('#examCpf').value.trim(), type: $('#examType').value.trim(), status: $('#examStatus').value, createdAt: now() });
  e.target.reset();
  save();
  toast('Exame adicionado na fila.');
});

$('#recordForm').addEventListener('submit', e => {
  e.preventDefault();
  db.records.unshift({
    id: uid(), patient: $('#recordPatient').value.trim(), cpf: $('#recordCpf').value.trim(), doctor: $('#recordDoctor').value.trim(),
    complaint: $('#recordComplaint').value.trim(), conduct: $('#recordConduct').value.trim(), createdAt: now()
  });
  e.target.reset();
  save();
  toast('Prontuário salvo para o paciente.');
});

$('#globalSearch').addEventListener('input', renderAll);
$('#historyPerson').addEventListener('input', renderHistory);
$('#historyMonth').addEventListener('input', renderHistory);
$('#recordSearch').addEventListener('input', renderRecords);
$('#clearHistoryFilters').addEventListener('click', () => { $('#historyPerson').value = ''; $('#historyMonth').value = ''; renderHistory(); });
$('#exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `backup-hospital-control-${new Date().toISOString().slice(0,10)}.json`; a.click();
  URL.revokeObjectURL(url);
});

document.addEventListener('click', (e) => {
  const action = e.target.dataset.action;
  const id = e.target.dataset.id;
  if (!action || !id) return;
  if (action === 'ready') {
    const order = db.orders.find(o => o.id === id);
    if (order) { order.status = 'Pronto para coleta'; order.readyAt = now(); save(); toast('Pedido marcado como pronto para coleta.'); }
  }
  if (action === 'collect') {
    const order = db.orders.find(o => o.id === id);
    const item = db.items.find(i => i.id === order?.itemId);
    if (order && item) {
      if (item.qty < order.qty) return toast('Estoque insuficiente para retirar este pedido.');
      item.qty -= order.qty; order.status = 'Retirado'; order.collectedAt = now(); save(); toast('Retirada registrada no histórico.');
    }
  }
  if (action === 'delete-order') { db.orders = db.orders.filter(o => o.id !== id); save(); toast('Pedido apagado.'); }
  if (action === 'delete-item') { db.items = db.items.filter(i => i.id !== id); save(); toast('Item apagado.'); }
  if (action === 'exam-next') {
    const exam = db.exams.find(x => x.id === id);
    if (exam) { exam.status = exam.status === 'Aguardando' ? 'Chamado' : exam.status === 'Chamado' ? 'Finalizado' : 'Aguardando'; save(); }
  }
  if (action === 'delete-exam') { db.exams = db.exams.filter(x => x.id !== id); save(); toast('Exame removido da fila.'); }
  if (action === 'delete-record') { db.records = db.records.filter(r => r.id !== id); save(); toast('Prontuário apagado.'); }
});

function getSearch() { return ($('#globalSearch')?.value || '').trim().toLowerCase(); }
function matchesSearch(text) { const q = getSearch(); return !q || String(text).toLowerCase().includes(q); }

function renderStats() {
  $('#statItems').textContent = db.items.length;
  $('#statPending').textContent = db.orders.filter(o => o.status === 'Pendente').length;
  $('#statReady').textContent = db.orders.filter(o => o.status === 'Pronto para coleta').length;
  $('#statRecords').textContent = db.records.length;
  $('#loginItemsCount').textContent = db.items.length;
  $('#loginOrdersCount').textContent = db.orders.filter(o => monthKey(o.createdAt) === new Date().toISOString().slice(0,7)).length;
  $('#loginRecordsCount').textContent = db.records.length;
}

function renderItems() {
  $('#itemsCountLabel').textContent = `${db.items.length} itens`;
  $('#orderItem').innerHTML = db.items.map(i => `<option value="${i.id}">${escapeHtml(i.name)} · estoque ${i.qty}</option>`).join('') || '<option value="">Cadastre um item primeiro</option>';
  const items = db.items.filter(i => matchesSearch(`${i.name} ${i.category}`));
  $('#itemsList').innerHTML = items.map(i => `
    <article class="mini-card">
      <header><h4>${escapeHtml(i.name)}</h4>${i.qty <= i.min ? '<span class="badge danger">Estoque baixo</span>' : '<span class="badge success">Ok</span>'}</header>
      <p>Categoria: <b>${escapeHtml(i.category)}</b> · Estoque atual: <b>${i.qty}</b> · Mínimo: <b>${i.min}</b></p>
      <div class="actions"><button class="mini-btn danger" data-action="delete-item" data-id="${i.id}">Apagar</button></div>
    </article>`).join('') || '<div class="empty">Nenhum item encontrado.</div>';
}

function renderOrders() {
  const orders = db.orders.filter(o => matchesSearch(`${o.person} ${o.sector} ${o.itemName} ${o.status}`));
  const card = (o) => `
    <article class="mini-card">
      <header><h4>${escapeHtml(o.itemName)} · ${o.qty} un.</h4>${badge(o.status)}</header>
      <p><b>${escapeHtml(o.person)}</b> pediu para <b>${escapeHtml(o.sector)}</b> em ${brDate(o.createdAt)}.</p>
      ${o.note ? `<p>Obs: ${escapeHtml(o.note)}</p>` : ''}
      <div class="actions">
        ${o.status === 'Pendente' ? `<button class="mini-btn primary" data-action="ready" data-id="${o.id}">Marcar pronto</button>` : ''}
        ${o.status === 'Pronto para coleta' ? `<button class="mini-btn success" data-action="collect" data-id="${o.id}">Registrar retirada</button>` : ''}
        <button class="mini-btn danger" data-action="delete-order" data-id="${o.id}">Apagar</button>
      </div>
    </article>`;
  $('#ordersList').innerHTML = orders.map(card).join('') || '<div class="empty">Nenhum pedido ainda.</div>';
  $('#recentOrders').innerHTML = db.orders.slice(0,5).map(card).join('') || '<div class="empty">Sem pedidos recentes.</div>';
}

function renderHistory() {
  const person = $('#historyPerson').value.trim().toLowerCase();
  const month = $('#historyMonth').value;
  let rows = db.orders.filter(o => o.status === 'Retirado');
  if (person) rows = rows.filter(o => o.person.toLowerCase().includes(person));
  if (month) rows = rows.filter(o => monthKey(o.collectedAt || o.createdAt) === month);
  $('#historyList').innerHTML = rows.length ? `
    <table class="history-table"><thead><tr><th>Data</th><th>Pessoa</th><th>Setor</th><th>Item</th><th>Qtd.</th></tr></thead><tbody>
      ${rows.map(o => `<tr><td>${brDate(o.collectedAt)}</td><td>${escapeHtml(o.person)}</td><td>${escapeHtml(o.sector)}</td><td>${escapeHtml(o.itemName)}</td><td>${o.qty}</td></tr>`).join('')}
    </tbody></table>` : '<div class="empty">Nenhuma retirada encontrada para esse filtro.</div>';
}

function renderExams() {
  const exams = db.exams.filter(x => matchesSearch(`${x.patient} ${x.cpf} ${x.type} ${x.status}`));
  const card = (x) => `
    <article class="mini-card">
      <header><h4>${escapeHtml(x.patient)}</h4>${badge(x.status)}</header>
      <p>Exame: <b>${escapeHtml(x.type)}</b> · CPF: ${escapeHtml(x.cpf || 'não informado')} · ${brDate(x.createdAt)}</p>
      <div class="actions"><button class="mini-btn primary" data-action="exam-next" data-id="${x.id}">Trocar status</button><button class="mini-btn danger" data-action="delete-exam" data-id="${x.id}">Remover</button></div>
    </article>`;
  $('#examsList').innerHTML = exams.map(card).join('') || '<div class="empty">Nenhum exame em espera.</div>';
  $('#recentExams').innerHTML = db.exams.slice(0,5).map(card).join('') || '<div class="empty">Sem exames recentes.</div>';
}

function renderRecords() {
  const q = ($('#recordSearch').value || '').trim().toLowerCase();
  const records = db.records.filter(r => (!q || `${r.patient} ${r.cpf}`.toLowerCase().includes(q)) && matchesSearch(`${r.patient} ${r.cpf} ${r.doctor} ${r.complaint}`));
  $('#recordsList').innerHTML = records.map(r => `
    <article class="mini-card">
      <header><h4>${escapeHtml(r.patient)}</h4><span class="badge">${brDate(r.createdAt)}</span></header>
      <p>CPF: <b>${escapeHtml(r.cpf)}</b> · Médico: <b>${escapeHtml(r.doctor || 'não informado')}</b></p>
      <p><b>Queixa:</b> ${escapeHtml(r.complaint)}</p>
      <p><b>Conduta:</b> ${escapeHtml(r.conduct)}</p>
      <div class="actions"><button class="mini-btn danger" data-action="delete-record" data-id="${r.id}">Apagar</button></div>
    </article>`).join('') || '<div class="empty">Nenhum prontuário encontrado.</div>';
}

function renderAll() {
  renderStats(); renderItems(); renderOrders(); renderHistory(); renderExams(); renderRecords();
}

requireSession();
