const horaTela = document.getElementById('horaTela');
const lastUpdate = document.getElementById('lastUpdate');
const btnChamar = document.getElementById('btnChamar');
const senhaAtual = document.getElementById('senhaAtual');
const proximaSenha = document.getElementById('proximaSenha');
const queueBody = document.getElementById('queueBody');
const tabs = document.querySelectorAll('.tabs button');
const toast = document.getElementById('toast');
const totalFila = document.getElementById('totalFila');
const senhasEmitidas = document.getElementById('senhasEmitidas');
const tableInfo = document.getElementById('tableInfo');
const pagination = document.getElementById('pagination');
const buscarFila = document.getElementById('buscarFila');

let senhaNum = 23;
let activeFilter = 'todas';
let currentPage = 1;
const pageSize = 8;

let queueData = [];

function showToast(msg) {
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add('show');

  clearTimeout(window.__toast);

  window.__toast = setTimeout(() => toast.classList.remove('show'), 2300);
}

function updateClock() {
  const d = new Date();

  if (horaTela) {
    horaTela.textContent = d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  if (lastUpdate) {
    lastUpdate.textContent = d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}

setInterval(updateClock, 1000);
updateClock();

function tagClassForCategory(categoria) {
  if (categoria === 'Preferencial') return 'red';
  if (categoria === 'Exames') return 'green';
  return 'gray';
}

function parseInitialRows() {
  if (!queueBody) return [];

  return [...queueBody.querySelectorAll('tr')].map((row, index) => {
    const cells = row.querySelectorAll('td');

    return {
      id: row.dataset.id || `fixo-${index + 1}`,
      senha: cells[0]?.textContent.trim() || `G ${String(index + 1).padStart(3, '0')}`,
      paciente: cells[1]?.textContent.trim() || 'Paciente',
      categoria: row.dataset.cat || cells[2]?.textContent.trim() || 'Geral',
      guiche: cells[3]?.textContent.trim() || 'Guichê 01',
      tempo: cells[4]?.textContent.trim() || '00:00',
      status: cells[5]?.textContent.trim() || 'Aguardando',
      origem: 'fixo'
    };
  });
}

function gerarLinhasExtras() {
  const nomes = [
    'Fernanda Rodrigues', 'Marcos Vinícius Santos', 'Helena Ribeiro', 'Arthur Menezes',
    'Camila Duarte', 'Paulo Henrique Costa', 'Larissa Gomes', 'Ricardo Almeida',
    'Bianca Ferreira', 'Pedro Augusto Lima', 'Rafaela Nunes', 'Gustavo Martins',
    'Sueli Cristina', 'André Luiz Rocha', 'Nathalia Azevedo', 'Joana Cardoso',
    'Lucas Moreira', 'Ana Carolina Dias', 'Márcia Aparecida', 'Wellington Prado'
  ];

  const categorias = ['Preferencial', 'Geral', 'Geral', 'Exames'];
  const extras = [];
  let seqG = 40;
  let seqP = 29;
  let seqE = 13;

  for (let i = 0; i < 50; i++) {
    const categoria = categorias[i % categorias.length];
    let senha = '';

    if (categoria === 'Preferencial') {
      senha = `P ${String(seqP++).padStart(3, '0')}`;
    } else if (categoria === 'Exames') {
      senha = `E ${String(seqE++).padStart(3, '0')}`;
    } else {
      senha = `G ${String(seqG++).padStart(3, '0')}`;
    }

    extras.push({
      id: `extra-${i + 1}`,
      senha,
      paciente: nomes[i % nomes.length],
      categoria,
      guiche: `Guichê ${String((i % 5) + 1).padStart(2, '0')}`,
      tempo: `00:${String(10 + (i * 3) % 55).padStart(2, '0')}`,
      status: i % 9 === 0 ? 'Em espera' : 'Aguardando',
      origem: 'simulado'
    });
  }

  return extras;
}

function renderPacientesRecepcaoNaFila() {
  if (!window.HospitalFlow) return;

  const pacientes = HospitalFlow.read(HospitalFlow.STORE.receptionQueue);
  const ids = new Set(queueData.map((item) => item.id));

  pacientes.forEach((p) => {
    if (ids.has(p.id)) return;

    queueData.unshift({
      id: p.id,
      senha: p.senha || 'G 000',
      paciente: p.paciente || p.nome || 'Paciente',
      categoria: p.categoria || 'Geral',
      guiche: 'Aguardando',
      tempo: '00:00',
      status: 'Aguardando',
      origem: 'recepcao'
    });
  });
}

function getFilteredData() {
  const busca = (buscarFila?.value || '').toLowerCase().trim();

  return queueData.filter((item) => {
    const filterOk = activeFilter === 'todas' || item.categoria === activeFilter;
    const searchText = `${item.senha} ${item.paciente} ${item.categoria} ${item.guiche} ${item.status}`.toLowerCase();
    const searchOk = !busca || searchText.includes(busca);

    return filterOk && searchOk;
  });
}

function updateTabCounts() {
  const count = (cat) => cat === 'todas'
    ? queueData.length
    : queueData.filter((item) => item.categoria === cat).length;

  tabs.forEach((btn) => {
    const span = btn.querySelector('span');
    if (span) span.textContent = count(btn.dataset.filter);
  });
}

function createPageButton(label, page, disabled = false, active = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.disabled = disabled;
  button.classList.toggle('active', active);

  if (!disabled && page) {
    button.addEventListener('click', () => {
      currentPage = page;
      renderQueue();
    });
  }

  return button;
}

function renderPagination(totalPages) {
  if (!pagination) return;

  pagination.innerHTML = '';

  pagination.appendChild(createPageButton('‹', currentPage - 1, currentPage <= 1));

  const pages = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);

    if (currentPage > 4) pages.push('...');

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (currentPage < totalPages - 3) pages.push('...');

    pages.push(totalPages);
  }

  pages.forEach((page) => {
    if (page === '...') {
      pagination.appendChild(createPageButton('...', null, true));
    } else {
      pagination.appendChild(createPageButton(String(page), page, false, page === currentPage));
    }
  });

  pagination.appendChild(createPageButton('›', currentPage + 1, currentPage >= totalPages));
}

function renderQueue() {
  if (!queueBody) return;

  renderPacientesRecepcaoNaFila();
  updateTabCounts();

  const filtered = getFilteredData();
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  queueBody.innerHTML = '';

  if (!pageItems.length) {
    const row = document.createElement('tr');
    row.className = 'empty-row';
    row.innerHTML = '<td colspan="7">Nenhum paciente encontrado nessa fila.</td>';
    queueBody.appendChild(row);
  }

  pageItems.forEach((item) => {
    const tr = document.createElement('tr');
    tr.dataset.cat = item.categoria;
    tr.dataset.id = item.id;

    const statusClass = item.status === 'Em espera' ? 'orange' : 'blue';

    tr.innerHTML = `
      <td><span class="ticket">${item.senha}</span></td>
      <td><strong>${item.paciente}</strong></td>
      <td><span class="tag ${tagClassForCategory(item.categoria)}">${item.categoria}</span></td>
      <td>${item.guiche}</td>
      <td>${item.tempo}</td>
      <td><span class="tag ${statusClass}">${item.status}</span></td>
      <td>
        <div class="queue-actions">
          <button class="queue-action primary-action" type="button" title="Chamar senha" data-action="call" data-id="${item.id}">🔊</button>
          <button class="queue-action" type="button" title="Ver paciente" data-action="view" data-id="${item.id}">👤</button>
        </div>
      </td>
    `;

    queueBody.appendChild(tr);
  });

  if (tableInfo) {
    const showingFrom = filtered.length ? start + 1 : 0;
    const showingTo = Math.min(start + pageSize, filtered.length);
    tableInfo.textContent = `Exibindo ${showingFrom} a ${showingTo} de ${filtered.length} registros`;
  }

  if (totalFila) totalFila.textContent = String(queueData.length);

  renderPagination(totalPages);
}

function chamarSenhaPorId(id) {
  const index = queueData.findIndex((item) => item.id === id);
  if (index === -1) return;

  const [item] = queueData.splice(index, 1);

  senhaAtual.textContent = item.senha;
  proximaSenha.textContent = queueData[0]?.senha || '-';

  if (senhasEmitidas) {
    const atual = Number(senhasEmitidas.textContent) || 0;
    senhasEmitidas.textContent = String(atual + 1);
  }

  if (window.HospitalFlow && item.origem === 'recepcao') {
    HospitalFlow.removeById(HospitalFlow.STORE.receptionQueue, item.id);
  }

  showToast(`Senha ${item.senha} chamada para ${item.guiche}.`);
  renderQueue();
}

btnChamar?.addEventListener('click', () => {
  const filtered = getFilteredData();
  const first = filtered[0];

  if (!first) {
    showToast('Não há pacientes nessa fila.');
    return;
  }

  chamarSenhaPorId(first.id);
});

queueBody?.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const item = queueData.find((row) => row.id === button.dataset.id);

  if (!item) return;

  if (button.dataset.action === 'call') {
    chamarSenhaPorId(item.id);
  }

  if (button.dataset.action === 'view') {
    showToast(`${item.paciente} • ${item.senha} • ${item.categoria}`);
  }
});

tabs.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabs.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');

    activeFilter = btn.dataset.filter || 'todas';
    currentPage = 1;
    renderQueue();
  });
});

buscarFila?.addEventListener('input', () => {
  currentPage = 1;
  renderQueue();
});

queueData = parseInitialRows();

if (queueData.length < 58) {
  queueData = queueData.concat(gerarLinhasExtras()).slice(0, 58);
}

renderQueue();
