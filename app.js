const ADMIN_USER = 'admin1';
const ADMIN_PASS = 'admin1';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

const todayISO = () => new Date().toISOString();
const formatDate = (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const monthKey = (iso) => iso.slice(0, 7);
const id = () => crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());

let db = storage.get('hospitalSystemDb', null);

function seedDb() {
  if (db) return;
  db = {
    logged: false,
    items: [
      { id: id(), name: 'Luva descartável M', category: 'Hospital', unit: 'caixa', stock: 24, min: 10, note: 'Uso geral nos atendimentos.' },
      { id: id(), name: 'Soro fisiológico 500ml', category: 'Hospital', unit: 'unidade', stock: 18, min: 12, note: 'Reposição para salas de procedimento.' },
      { id: id(), name: 'Kit curativo ambulância', category: 'Ambulância', unit: 'kit', stock: 6, min: 5, note: 'Manter sempre acima do mínimo.' },
      { id: id(), name: 'Papel toalha', category: 'Limpeza', unit: 'pacote', stock: 9, min: 8, note: 'Uso em banheiros e salas.' }
    ],
    requests: [],
    records: [],
    exams: []
  };
  saveDb();
}

function saveDb() { storage.set('hospitalSystemDb', db); }

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function showApp() {
  $('#loginView').classList.add('hidden');
  $('#appView').classList.remove('hidden');
  renderAll();
}

function showLogin() {
  $('#loginView').classList.remove('hidden');
  $('#appView').classList.add('hidden');
}

function initAuth() {
  $('#loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const user = $('#loginUser').value.trim();
    const pass = $('#loginPass').value.trim();

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      db.logged = true;
      saveDb();
      showApp();
      showToast('Login realizado com sucesso.');
      return;
    }

    showToast('Login ou senha incorretos. Use admin1/admin1.');
  });

  $('#logoutBtn').addEventListener('click', () => {
    db.logged = false;
    saveDb();
    showLogin();
  });
}

function initNavigation() {
  $$('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const screen = button.dataset.screen;
      $$('.nav-btn').forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      $$('.screen').forEach((section) => section.classList.remove('active-screen'));
      $(`#${screen}`).classList.add('active-screen');
      $('#screenTitle').textContent = button.textContent;
      renderAll();
    });
  });
}

function initForms() {
  $('#itemForm').addEventListener('submit', (event) => {
    event.preventDefault();
    db.items.push({
      id: id(),
      name: $('#itemName').value.trim(),
      category: $('#itemCategory').value,
      unit: $('#itemUnit').value.trim(),
      stock: Number($('#itemStock').value),
      min: Number($('#itemMin').value),
      note: $('#itemNote').value.trim()
    });
    saveDb();
    event.target.reset();
    showToast('Item cadastrado no almoxarifado.');
    renderAll();
  });

  $('#requestForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const item = db.items.find((x) => x.id === $('#requestItem').value);
    if (!item) return showToast('Cadastre um item antes de pedir.');

    db.requests.unshift({
      id: id(),
      person: $('#requestPerson').value.trim(),
      sector: $('#requestSector').value,
      itemId: item.id,
      itemName: item.name,
      qty: Number($('#requestQty').value),
      reason: $('#requestReason').value.trim(),
      status: 'pendente',
      createdAt: todayISO(),
      readyAt: null,
      collectedAt: null
    });
    saveDb();
    event.target.reset();
    showToast('Pedido enviado ao almoxarifado.');
    renderAll();
  });

  $('#medicalForm').addEventListener('submit', (event) => {
    event.preventDefault();
    db.records.unshift({
      id: id(),
      patient: $('#patientName').value.trim(),
      cpf: $('#patientCpf').value.trim(),
      birth: $('#patientBirth').value,
      doctor: $('#doctorName').value.trim(),
      complaint: $('#patientComplaint').value.trim(),
      conduct: $('#medicalConduct').value.trim(),
      createdAt: todayISO()
    });
    saveDb();
    event.target.reset();
    showToast('Prontuário salvo.');
    renderAll();
  });

  $('#examForm').addEventListener('submit', (event) => {
    event.preventDefault();
    db.exams.unshift({
      id: id(),
      patient: $('#examPatient').value.trim(),
      cpf: $('#examCpf').value.trim(),
      type: $('#examType').value.trim(),
      status: $('#examStatus').value,
      createdAt: todayISO()
    });
    saveDb();
    event.target.reset();
    showToast('Exame adicionado à fila.');
    renderAll();
  });

  ['itemSearch', 'requestFilter', 'historyPerson', 'historyMonth', 'medicalSearch', 'examSearch'].forEach((elementId) => {
    $(`#${elementId}`).addEventListener('input', renderAll);
    $(`#${elementId}`).addEventListener('change', renderAll);
  });
}

function renderAll() {
  renderStats();
  renderItems();
  renderItemSelect();
  renderRequests();
  renderHistory();
  renderRecords();
  renderExams();
  renderRecent();
}

function renderStats() {
  $('#statItems').textContent = db.items.length;
  $('#statPending').textContent = db.requests.filter((x) => x.status === 'pendente').length;
  $('#statReady').textContent = db.requests.filter((x) => x.status === 'pronto').length;
  $('#statRecords').textContent = db.records.length;
}

function renderItems() {
  const query = $('#itemSearch').value?.toLowerCase() || '';
  const items = db.items.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(query));

  if (!items.length) {
    $('#itemList').innerHTML = '<div class="empty">Nenhum item encontrado.</div>';
    return;
  }

  $('#itemList').innerHTML = `
    <table>
      <thead>
        <tr><th>Item</th><th>Categoria</th><th>Estoque</th><th>Status</th><th>Observação</th><th>Ação</th></tr>
      </thead>
      <tbody>
        ${items.map((item) => `
          <tr>
            <td><b>${escapeHTML(item.name)}</b><br><small>${escapeHTML(item.unit)}</small></td>
            <td>${escapeHTML(item.category)}</td>
            <td>${item.stock} / mín. ${item.min}</td>
            <td><span class="tag ${item.stock <= item.min ? 'low' : 'ok'}">${item.stock <= item.min ? 'Estoque baixo' : 'Ok'}</span></td>
            <td>${escapeHTML(item.note || '-')}</td>
            <td><button class="btn danger" onclick="deleteItem('${item.id}')">Excluir</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

function renderItemSelect() {
  $('#requestItem').innerHTML = db.items.map((item) => `<option value="${item.id}">${escapeHTML(item.name)} (${item.stock} ${escapeHTML(item.unit)})</option>`).join('');
}

function renderRequests() {
  const filter = $('#requestFilter').value;
  const requests = db.requests.filter((request) => filter === 'todos' || request.status === filter);

  if (!requests.length) {
    $('#requestList').innerHTML = '<div class="empty">Nenhum pedido nesta lista.</div>';
    return;
  }

  $('#requestList').innerHTML = requests.map(requestCard).join('');
}

function renderRecent() {
  const recent = db.requests.slice(0, 5);
  $('#recentRequests').innerHTML = recent.length ? recent.map(requestCard).join('') : '<div class="empty">Ainda não há pedidos recentes.</div>';
}

function requestCard(request) {
  return `
    <article class="data-card">
      <h4>${escapeHTML(request.itemName)} <span class="tag ${request.status}">${statusLabel(request.status)}</span></h4>
      <p><b>Solicitante:</b> ${escapeHTML(request.person)} | <b>Setor:</b> ${escapeHTML(request.sector)}</p>
      <p><b>Quantidade:</b> ${request.qty} | <b>Pedido em:</b> ${formatDate(request.createdAt)}</p>
      <p><b>Observação:</b> ${escapeHTML(request.reason || '-')}</p>
      ${request.readyAt ? `<p><b>Separado em:</b> ${formatDate(request.readyAt)}</p>` : ''}
      ${request.collectedAt ? `<p><b>Retirado em:</b> ${formatDate(request.collectedAt)}</p>` : ''}
      <div class="action-row">
        ${request.status === 'pendente' ? `<button class="btn warning" onclick="markReady('${request.id}')">Marcar como pronto para coleta</button>` : ''}
        ${request.status === 'pronto' ? `<button class="btn success" onclick="markCollected('${request.id}')">Confirmar retirada</button>` : ''}
        <button class="btn danger" onclick="deleteRequest('${request.id}')">Excluir</button>
      </div>
    </article>`;
}

function renderHistory() {
  const person = ($('#historyPerson').value || '').toLowerCase();
  const month = $('#historyMonth').value;
  const history = db.requests.filter((request) => {
    const isCollected = request.status === 'retirado';
    const matchPerson = !person || request.person.toLowerCase().includes(person);
    const matchMonth = !month || monthKey(request.collectedAt || request.createdAt) === month;
    return isCollected && matchPerson && matchMonth;
  });

  if (!history.length) {
    $('#historyList').innerHTML = '<div class="empty">Nenhuma retirada encontrada para esses filtros.</div>';
    return;
  }

  $('#historyList').innerHTML = `
    <table>
      <thead><tr><th>Pessoa</th><th>Setor</th><th>Item</th><th>Quantidade</th><th>Data de retirada</th></tr></thead>
      <tbody>
        ${history.map((request) => `
          <tr>
            <td><b>${escapeHTML(request.person)}</b></td>
            <td>${escapeHTML(request.sector)}</td>
            <td>${escapeHTML(request.itemName)}</td>
            <td>${request.qty}</td>
            <td>${formatDate(request.collectedAt)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

function renderRecords() {
  const query = ($('#medicalSearch').value || '').toLowerCase();
  const records = db.records.filter((record) => `${record.patient} ${record.cpf} ${record.doctor}`.toLowerCase().includes(query));

  if (!records.length) {
    $('#medicalList').innerHTML = '<div class="empty">Nenhum prontuário salvo.</div>';
    return;
  }

  $('#medicalList').innerHTML = records.map((record) => `
    <article class="data-card">
      <h4>${escapeHTML(record.patient)}</h4>
      <p><b>CPF:</b> ${escapeHTML(record.cpf)} | <b>Nascimento:</b> ${record.birth || '-'}</p>
      <p><b>Médico:</b> ${escapeHTML(record.doctor)} | <b>Data:</b> ${formatDate(record.createdAt)}</p>
      <p><b>Queixa:</b> ${escapeHTML(record.complaint)}</p>
      <p><b>Conduta:</b> ${escapeHTML(record.conduct)}</p>
      <div class="action-row"><button class="btn danger" onclick="deleteRecord('${record.id}')">Excluir</button></div>
    </article>
  `).join('');
}

function renderExams() {
  const query = ($('#examSearch').value || '').toLowerCase();
  const exams = db.exams.filter((exam) => `${exam.patient} ${exam.cpf} ${exam.type} ${exam.status}`.toLowerCase().includes(query));

  if (!exams.length) {
    $('#examList').innerHTML = '<div class="empty">Nenhum exame em espera cadastrado.</div>';
    return;
  }

  $('#examList').innerHTML = exams.map((exam) => `
    <article class="data-card">
      <h4>${escapeHTML(exam.type)}</h4>
      <p><b>Paciente:</b> ${escapeHTML(exam.patient)} | <b>CPF:</b> ${escapeHTML(exam.cpf)}</p>
      <p><b>Status:</b> ${escapeHTML(exam.status)} | <b>Entrada:</b> ${formatDate(exam.createdAt)}</p>
      <div class="action-row">
        <button class="btn warning" onclick="changeExamStatus('${exam.id}')">Avançar status</button>
        <button class="btn danger" onclick="deleteExam('${exam.id}')">Excluir</button>
      </div>
    </article>
  `).join('');
}

function statusLabel(status) {
  return {
    pendente: 'Pendente',
    pronto: 'Pronto para coleta',
    retirado: 'Retirado'
  }[status] || status;
}

function markReady(requestId) {
  const request = db.requests.find((x) => x.id === requestId);
  if (!request) return;
  request.status = 'pronto';
  request.readyAt = todayISO();
  saveDb();
  showToast('Pedido separado. O solicitante pode coletar.');
  renderAll();
}

function markCollected(requestId) {
  const request = db.requests.find((x) => x.id === requestId);
  const item = db.items.find((x) => x.id === request.itemId);
  if (!request || !item) return;
  if (item.stock < request.qty) return showToast('Estoque insuficiente para confirmar a retirada.');

  item.stock -= request.qty;
  request.status = 'retirado';
  request.collectedAt = todayISO();
  saveDb();
  showToast('Retirada confirmada e estoque atualizado.');
  renderAll();
}

function changeExamStatus(examId) {
  const exam = db.exams.find((x) => x.id === examId);
  if (!exam) return;
  const statuses = ['Aguardando coleta', 'Aguardando laudo', 'Pronto para entrega'];
  const next = (statuses.indexOf(exam.status) + 1) % statuses.length;
  exam.status = statuses[next];
  saveDb();
  showToast('Status do exame atualizado.');
  renderAll();
}

function deleteItem(itemId) {
  if (!confirm('Deseja excluir este item?')) return;
  db.items = db.items.filter((item) => item.id !== itemId);
  saveDb();
  renderAll();
}

function deleteRequest(requestId) {
  if (!confirm('Deseja excluir este pedido?')) return;
  db.requests = db.requests.filter((request) => request.id !== requestId);
  saveDb();
  renderAll();
}

function deleteRecord(recordId) {
  if (!confirm('Deseja excluir este prontuário?')) return;
  db.records = db.records.filter((record) => record.id !== recordId);
  saveDb();
  renderAll();
}

function deleteExam(examId) {
  if (!confirm('Deseja excluir este exame?')) return;
  db.exams = db.exams.filter((exam) => exam.id !== examId);
  saveDb();
  renderAll();
}

function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

seedDb();
initAuth();
initNavigation();
initForms();

db.logged ? showApp() : showLogin();
