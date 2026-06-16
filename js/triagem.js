const painRange = document.getElementById('painRange');
const painValue = document.getElementById('painValue');

const cpfPaciente = document.getElementById('cpfPaciente');
const dataNascimento = document.getElementById('dataNascimento');
const idadePaciente = document.getElementById('idadePaciente');
const telefonePaciente = document.getElementById('telefonePaciente');

const sintomasPaciente = document.getElementById('sintomasPaciente');
const observacoesPaciente = document.getElementById('observacoesPaciente');
const contadorSintomas = document.getElementById('contadorSintomas');
const contadorObservacoes = document.getElementById('contadorObservacoes');

let triagemAtual = null;

function somenteNumeros(valor) {
  return String(valor || '').replace(/\D/g, '');
}

function aplicarMascaraCPF(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  return numeros
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
}

function aplicarMascaraData(valor) {
  const numeros = somenteNumeros(valor).slice(0, 8);

  return numeros
    .replace(/^(\d{2})(\d)/, '$1/$2')
    .replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
}

function aplicarMascaraTelefone(valor) {
  const numeros = somenteNumeros(valor).slice(0, 11);

  if (numeros.length <= 10) {
    return numeros
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return numeros
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function calcularIdade(dataFormatada) {
  const partes = dataFormatada.split('/');

  if (partes.length !== 3) return '--';

  const dia = Number(partes[0]);
  const mes = Number(partes[1]) - 1;
  const ano = Number(partes[2]);

  if (!dia || mes < 0 || !ano || ano < 1900) return '--';

  const nascimento = new Date(ano, mes, dia);
  const hoje = new Date();

  if (nascimento > hoje) return '--';

  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());

  if (aindaNaoFezAniversario) {
    idade--;
  }

  return idade >= 0 ? String(idade) : '--';
}

if (cpfPaciente) {
  cpfPaciente.addEventListener('input', () => {
    cpfPaciente.value = aplicarMascaraCPF(cpfPaciente.value);
  });
}

if (dataNascimento) {
  dataNascimento.addEventListener('input', () => {
    dataNascimento.value = aplicarMascaraData(dataNascimento.value);

    if (idadePaciente) {
      idadePaciente.value = dataNascimento.value.length === 10
        ? calcularIdade(dataNascimento.value)
        : '--';
    }
  });
}

if (telefonePaciente) {
  telefonePaciente.addEventListener('input', () => {
    telefonePaciente.value = aplicarMascaraTelefone(telefonePaciente.value);
  });
}

function atualizarContador(textarea, contador) {
  if (!textarea || !contador) return;

  textarea.value = textarea.value.slice(0, 500);
  contador.textContent = `${textarea.value.length}/500`;
}

if (sintomasPaciente) {
  sintomasPaciente.addEventListener('input', () => {
    atualizarContador(sintomasPaciente, contadorSintomas);
  });
}

if (observacoesPaciente) {
  observacoesPaciente.addEventListener('input', () => {
    atualizarContador(observacoesPaciente, contadorObservacoes);
  });
}

if (painRange && painValue) {
  const updatePain = () => {
    const value = Number(painRange.value);
    painValue.textContent = value;

    const pct = (value / 10) * 100;

    painRange.style.background = `
      linear-gradient(
        90deg,
        #d90716 0%,
        #d90716 ${pct}%,
        #e7ebf0 ${pct}%,
        #e7ebf0 100%
      )
    `;
  };

  painRange.addEventListener('input', updatePain);
  updatePain();
}

const riskMeta = {
  vermelho: {
    title: 'VERMELHO',
    sub: 'Emergência',
    time: 'Atendimento imediato',
    note: 'Paciente crítico, prioridade absoluta para atendimento.'
  },
  laranja: {
    title: 'LARANJA',
    sub: 'Muito urgente',
    time: 'Atendimento em até 10 minutos',
    note: 'Quadro de alta gravidade com risco elevado.'
  },
  amarelo: {
    title: 'AMARELO',
    sub: 'Urgência',
    time: 'Atendimento em até 60 minutos',
    note: 'Sinais vitais estáveis e sintomas de média gravidade.'
  },
  verde: {
    title: 'VERDE',
    sub: 'Pouco urgente',
    time: 'Atendimento em até 120 minutos',
    note: 'Situação estável, atendimento pode aguardar.'
  },
  azul: {
    title: 'AZUL',
    sub: 'Não urgente',
    time: 'Atendimento conforme ordem de chegada',
    note: 'Baixa gravidade, atendimento ambulatorial.'
  }
};

const riskButtons = document.querySelectorAll('.risk-option');
const riskHighlight = document.getElementById('riskHighlight');
const riskInput = document.getElementById('riskInput');
const justificationText = document.querySelector('.justification p');

let toast = document.querySelector('.toast-msg');

if (!toast) {
  toast = document.createElement('div');
  toast.className = 'toast-msg';
  document.body.appendChild(toast);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(window.__toastTimer);

  window.__toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

function setRisk(key, silent = false) {
  const meta = riskMeta[key];

  if (!meta || !riskHighlight) return;

  const riskText = riskHighlight.querySelector('.risk-text');
  const riskSub = riskHighlight.querySelector('.risk-sub');
  const riskTime = riskHighlight.querySelector('p');

  riskButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.risk === key);
  });

  riskHighlight.classList.remove('vermelho', 'laranja', 'amarelo', 'verde', 'azul');
  riskHighlight.classList.add(key);

  if (riskText) riskText.textContent = meta.title;
  if (riskSub) riskSub.textContent = meta.sub;
  if (riskTime) riskTime.textContent = meta.time;
  if (justificationText) justificationText.textContent = meta.note;
  if (riskInput) riskInput.value = key;

  if (!silent) {
    showToast(`Classificação alterada para ${meta.title}.`);
  }
}

riskButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setRisk(button.dataset.risk);
  });
});

setRisk(document.querySelector('.risk-option.active')?.dataset.risk || 'amarelo', true);

const btnVerTodasTriagens = document.getElementById('btnVerTodasTriagens');
const modalTriagens = document.getElementById('modalTriagens');
const btnFecharTriagens = document.getElementById('btnFecharTriagens');
const fecharModalTriagens = document.getElementById('fecharModalTriagens');
const buscarTriagem = document.getElementById('buscarTriagem');
const filtroClassificacao = document.getElementById('filtroClassificacao');
const listaTodasTriagens = document.getElementById('listaTodasTriagens');

function abrirModalTriagens() {
  if (!modalTriagens) return;

  modalTriagens.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function fecharModalTriagensFunc() {
  if (!modalTriagens) return;

  modalTriagens.classList.remove('active');
  document.body.style.overflow = '';
}

function filtrarTriagens() {
  if (!listaTodasTriagens) return;

  const busca = buscarTriagem ? buscarTriagem.value.toLowerCase().trim() : '';
  const filtro = filtroClassificacao ? filtroClassificacao.value : 'todas';
  const linhas = listaTodasTriagens.querySelectorAll('tr');

  linhas.forEach((linha) => {
    const texto = linha.textContent.toLowerCase();
    const classificacao = linha.dataset.classificacao;

    const passouBusca = texto.includes(busca);
    const passouFiltro = filtro === 'todas' || classificacao === filtro;

    linha.style.display = passouBusca && passouFiltro ? '' : 'none';
  });
}

if (btnVerTodasTriagens) btnVerTodasTriagens.addEventListener('click', abrirModalTriagens);
if (btnFecharTriagens) btnFecharTriagens.addEventListener('click', fecharModalTriagensFunc);
if (fecharModalTriagens) fecharModalTriagens.addEventListener('click', fecharModalTriagensFunc);
if (buscarTriagem) buscarTriagem.addEventListener('input', filtrarTriagens);
if (filtroClassificacao) filtroClassificacao.addEventListener('change', filtrarTriagens);

const modalDetalheTriagem = document.getElementById('modalDetalheTriagem');
const fecharDetalheTriagem = document.getElementById('fecharDetalheTriagem');
const btnFecharDetalheTriagem = document.getElementById('btnFecharDetalheTriagem');
const btnFecharDetalheRodape = document.getElementById('btnFecharDetalheRodape');
const btnAbrirProntuario = document.getElementById('btnAbrirProntuario');

const detalhePacienteNome = document.getElementById('detalhePacienteNome');
const detalheClassificacao = document.getElementById('detalheClassificacao');
const detalheTempo = document.getElementById('detalheTempo');
const detalheStatus = document.getElementById('detalheStatus');
const detalheProtocolo = document.getElementById('detalheProtocolo');

function abrirDetalheTriagem(dados) {
  if (!modalDetalheTriagem) return;

  triagemAtual = dados;

  if (detalhePacienteNome) detalhePacienteNome.textContent = dados.paciente;
  if (detalheClassificacao) detalheClassificacao.textContent = dados.classificacao.toUpperCase();
  if (detalheTempo) detalheTempo.textContent = dados.tempo;
  if (detalheStatus) detalheStatus.textContent = dados.status;
  if (detalheProtocolo) detalheProtocolo.textContent = 'Protocolo de Manchester';

  fecharModalTriagensFunc();

  modalDetalheTriagem.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function fecharDetalheTriagemFunc() {
  if (!modalDetalheTriagem) return;

  modalDetalheTriagem.classList.remove('active');
  document.body.style.overflow = '';
}

function ativarBotoesDetalhe() {
  document.querySelectorAll('#listaTodasTriagens .btn-ver-detalhe').forEach((botao) => {
    botao.onclick = () => {
      const linha = botao.closest('tr');

      if (!linha) return;

      if (linha.__dadosTriagem) {
        abrirDetalheTriagem(linha.__dadosTriagem);
        return;
      }

      const colunas = linha.querySelectorAll('td');

      abrirDetalheTriagem({
        paciente: colunas[0]?.textContent.trim() || 'Paciente',
        classificacao: linha.dataset.classificacao || 'amarelo',
        tempo: colunas[2]?.textContent.trim() || '-',
        status: colunas[3]?.textContent.trim() || '-',
        cpf: linha.dataset.cpf || 'Não informado',
        idade: linha.dataset.idade || '--',
        telefone: linha.dataset.telefone || 'Não informado',
        convenio: linha.dataset.convenio || 'SUS',
        prontuario: linha.dataset.prontuario || 'Não informado',
        sintomas: linha.dataset.sintomas || 'Registro vindo do histórico de triagem.',
        dor: linha.dataset.dor || '5',
        saturacao: linha.dataset.saturacao || '98',
        pressao: linha.dataset.pressao || '120/80',
        fc: linha.dataset.fc || '82',
        temp: linha.dataset.temp || '36,7',
        fr: linha.dataset.fr || '18'
      });
    };
  });
}

if (fecharDetalheTriagem) fecharDetalheTriagem.addEventListener('click', fecharDetalheTriagemFunc);
if (btnFecharDetalheTriagem) btnFecharDetalheTriagem.addEventListener('click', fecharDetalheTriagemFunc);
if (btnFecharDetalheRodape) btnFecharDetalheRodape.addEventListener('click', fecharDetalheTriagemFunc);

ativarBotoesDetalhe();

const modalProntuario = document.getElementById('modalProntuario');
const fecharProntuario = document.getElementById('fecharProntuario');
const btnFecharProntuario = document.getElementById('btnFecharProntuario');
const btnVoltarDetalhe = document.getElementById('btnVoltarDetalhe');

function preencherProntuario(dados) {
  const risco = dados.classificacao || 'amarelo';
  const meta = riskMeta[risco] || riskMeta.amarelo;

  document.getElementById('prontuarioNome').textContent = dados.paciente || 'Paciente';
  document.getElementById('prontuarioResumo').textContent = `${meta.title} • ${dados.status || 'Em atendimento'} • ${dados.tempo || '0 min'}`;

  document.getElementById('prontuarioPacienteNome').textContent = dados.paciente || 'Paciente';
  document.getElementById('prontuarioCpf').textContent = dados.cpf || 'Não informado';
  document.getElementById('prontuarioIdade').textContent = dados.idade || '--';
  document.getElementById('prontuarioTelefone').textContent = dados.telefone || 'Não informado';
  document.getElementById('prontuarioConvenio').textContent = dados.convenio || 'Não informado';
  document.getElementById('prontuarioNumero').textContent = dados.prontuario || 'Não informado';

  document.getElementById('prontuarioClassificacao').textContent = meta.title;
  document.getElementById('prontuarioStatus').textContent = dados.status || '-';
  document.getElementById('prontuarioTempo').textContent = dados.tempo || '-';

  document.getElementById('prontuarioDor').textContent = `${dados.dor || '5'}/10`;
  document.getElementById('prontuarioSaturacao').textContent = `${dados.saturacao || '98'}%`;
  document.getElementById('prontuarioPressao').textContent = dados.pressao || '120/80';
  document.getElementById('prontuarioFc').textContent = `${dados.fc || '82'} bpm`;
  document.getElementById('prontuarioTemp').textContent = `${dados.temp || '36,7'}°C`;
  document.getElementById('prontuarioFr').textContent = `${dados.fr || '18'} irpm`;

  document.getElementById('prontuarioSintomas').value = dados.sintomas || 'Sem sintomas registrados.';
  document.getElementById('timelineClassificacao').textContent = `${meta.title}, ${meta.time}.`;

  const tag = document.getElementById('prontuarioRiscoTag');
  tag.className = `tag-risk ${getTagColor(risco)}`;
  tag.textContent = meta.title;
}

function abrirProntuario() {
  if (!modalProntuario) return;

  if (!triagemAtual) {
    showToast('Abra os detalhes de uma triagem primeiro.');
    return;
  }

  preencherProntuario(triagemAtual);

  if (modalDetalheTriagem) {
    modalDetalheTriagem.classList.remove('active');
  }

  modalProntuario.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function fecharProntuarioFunc() {
  if (!modalProntuario) return;

  modalProntuario.classList.remove('active');
  document.body.style.overflow = '';
}

if (btnAbrirProntuario) btnAbrirProntuario.addEventListener('click', abrirProntuario);
if (fecharProntuario) fecharProntuario.addEventListener('click', fecharProntuarioFunc);
if (btnFecharProntuario) btnFecharProntuario.addEventListener('click', fecharProntuarioFunc);

if (btnVoltarDetalhe) {
  btnVoltarDetalhe.addEventListener('click', () => {
    fecharProntuarioFunc();

    if (modalDetalheTriagem) {
      modalDetalheTriagem.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  });
}

const saveTriageBtn = document.getElementById('saveTriageBtn');
const ultimasTriagensLista = document.getElementById('ultimasTriagensLista');

function getTagColor(risk) {
  const colors = {
    vermelho: 'red',
    laranja: 'orange',
    amarelo: 'yellow',
    verde: 'green',
    azul: 'blue'
  };

  return colors[risk] || 'yellow';
}

function getTagText(risk) {
  const texts = {
    vermelho: 'VERMELHO',
    laranja: 'LARANJA',
    amarelo: 'AMARELO',
    verde: 'VERDE',
    azul: 'AZUL'
  };

  return texts[risk] || 'AMARELO';
}

function getStatus(risk) {
  return risk === 'verde' || risk === 'azul' ? 'Aguardando' : 'Em atendimento';
}

function coletarDadosFormulario(nome, risk) {
  const pressaoSistolica = document.getElementById('pressaoSistolica')?.value || '120';
  const pressaoDiastolica = document.getElementById('pressaoDiastolica')?.value || '80';

  return {
    paciente: nome,
    classificacao: risk,
    tempo: '0 min',
    status: getStatus(risk),
    cpf: cpfPaciente?.value || 'Não informado',
    idade: idadePaciente?.value || '--',
    telefone: telefonePaciente?.value || 'Não informado',
    convenio: document.getElementById('convenioPaciente')?.value || 'Não informado',
    prontuario: document.getElementById('prontuarioPaciente')?.value || 'Não informado',
    sintomas: sintomasPaciente?.value || 'Sem sintomas registrados.',
    dor: painRange?.value || '5',
    saturacao: document.getElementById('saturacaoPaciente')?.value || '98',
    pressao: `${pressaoSistolica}/${pressaoDiastolica}`,
    fc: document.getElementById('frequenciaCardiaca')?.value || '82',
    temp: document.getElementById('temperaturaPaciente')?.value || '36,7',
    fr: document.getElementById('frequenciaRespiratoria')?.value || '18'
  };
}

function criarItemUltimasTriagens(dados) {
  if (!ultimasTriagensLista) return;

  const item = document.createElement('div');
  item.className = 'latest-triage-item';
  item.dataset.paciente = dados.paciente;
  item.dataset.classificacao = dados.classificacao;
  item.dataset.tempo = dados.tempo;
  item.dataset.status = dados.status;

  item.innerHTML = `
    <div>
      <strong>${dados.paciente}</strong>
      <small>Paciente</small>
    </div>

    <span class="tag-risk ${getTagColor(dados.classificacao)}">${getTagText(dados.classificacao)}</span>

    <div>
      <strong>${dados.tempo}</strong>
      <small>Tempo</small>
    </div>

    <div>
      <strong>${dados.status}</strong>
      <small>Status</small>
    </div>
  `;

  ultimasTriagensLista.prepend(item);
}

function criarLinhaModal(dados) {
  if (!listaTodasTriagens) return;

  const hoje = new Date().toLocaleDateString('pt-BR');

  const linha = document.createElement('tr');
  linha.dataset.classificacao = dados.classificacao;
  linha.dataset.cpf = dados.cpf || 'Não informado';
  linha.dataset.idade = dados.idade || '--';
  linha.dataset.telefone = dados.telefone || 'Não informado';
  linha.dataset.convenio = dados.convenio || 'Não informado';
  linha.dataset.prontuario = dados.prontuario || 'Não informado';
  linha.dataset.sintomas = dados.sintomas || 'Sem sintomas registrados.';
  linha.dataset.dor = dados.dor || '5';
  linha.dataset.saturacao = dados.saturacao || '98';
  linha.dataset.pressao = dados.pressao || '120/80';
  linha.dataset.fc = dados.fc || '82';
  linha.dataset.temp = dados.temp || '36,7';
  linha.dataset.fr = dados.fr || '18';

  linha.__dadosTriagem = dados;

  linha.innerHTML = `
    <td>${dados.paciente}</td>
    <td><span class="tag-risk ${getTagColor(dados.classificacao)}">${getTagText(dados.classificacao)}</span></td>
    <td>${dados.tempo}</td>
    <td>${dados.status}</td>
    <td>${hoje}</td>
    <td><button class="btn-ver-detalhe" type="button">Ver detalhes</button></td>
  `;

  listaTodasTriagens.prepend(linha);
  ativarBotoesDetalhe();
}


function limparFormulario() {
  document.querySelectorAll('.triage-form input[type="text"], .triage-form textarea').forEach((campo) => {
    campo.value = '';
  });

  document.querySelectorAll('.triage-form select').forEach((select) => {
    select.selectedIndex = 0;
  });

  if (idadePaciente) idadePaciente.value = '--';

  if (painRange) {
    painRange.value = 5;
    painRange.dispatchEvent(new Event('input'));
  }

  atualizarContador(sintomasPaciente, contadorSintomas);
  atualizarContador(observacoesPaciente, contadorObservacoes);
}

if (saveTriageBtn) {
  saveTriageBtn.addEventListener('click', () => {
    const nomeInput = document.getElementById('nomePaciente');
    const nome = nomeInput && nomeInput.value.trim() ? nomeInput.value.trim() : 'Paciente sem nome';
    const risk = riskInput ? riskInput.value : 'amarelo';
    const dados = coletarDadosFormulario(nome, risk);

    criarItemUltimasTriagens(dados);
    criarLinhaModal(dados);

    showToast(`Triagem de ${nome} salva como ${getTagText(risk)}.`);

    limparFormulario();
  });
}

const btnLimparTriagem = document.getElementById('btnLimparTriagem');

if (btnLimparTriagem) {
  btnLimparTriagem.addEventListener('click', limparFormulario);
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    fecharModalTriagensFunc();
    fecharDetalheTriagemFunc();
    fecharProntuarioFunc();
  }
});

/* Fluxo integrado: Recepção -> Triagem -> Prontuário Médico */
let pacienteRecepcaoAtual = null;

function setValueIfExists(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined && value !== null && value !== 'Não informado') {
    el.value = value;
    el.dispatchEvent(new Event('input'));
  }
}

function carregarPacienteDaRecepcaoNaTriagem() {
  if (!window.HospitalFlow) return;
  const fila = HospitalFlow.read(HospitalFlow.STORE.triageQueue);
  if (!fila.length) return;
  const p = fila[0];
  pacienteRecepcaoAtual = p;
  setValueIfExists('nomePaciente', p.paciente || p.nome);
  setValueIfExists('cpfPaciente', p.cpf);
  setValueIfExists('dataNascimento', p.nascimento);
  setValueIfExists('telefonePaciente', p.telefone);
  setValueIfExists('prontuarioPaciente', p.cns);
  setValueIfExists('sintomasPaciente', p.motivo);
  const convenio = document.getElementById('convenioPaciente');
  if (convenio && p.convenio) {
    [...convenio.options].forEach((opt, i) => {
      if (opt.textContent.trim().toLowerCase() === String(p.convenio).trim().toLowerCase()) convenio.selectedIndex = i;
    });
  }
  if (typeof showToast === 'function') showToast(`${p.paciente || p.nome} carregado da recepção para triagem.`);
}

function coletarDadosTriagemIntegrada(nome, risk) {
  const ps = document.getElementById('pressaoSistolica')?.value || document.querySelector('.pressure-group input:nth-child(1)')?.value || '120';
  const pd = document.getElementById('pressaoDiastolica')?.value || document.querySelector('.pressure-group input:nth-child(3)')?.value || '80';
  const dadosBase = pacienteRecepcaoAtual || {};
  return {
    ...dadosBase,
    id: dadosBase.id || ('TRI-' + Date.now().toString(36).toUpperCase()),
    paciente: nome,
    nome,
    cpf: document.getElementById('cpfPaciente')?.value || dadosBase.cpf || 'Não informado',
    nascimento: document.getElementById('dataNascimento')?.value || dadosBase.nascimento || 'Não informado',
    idade: document.getElementById('idadePaciente')?.value || dadosBase.idade || '--',
    telefone: document.getElementById('telefonePaciente')?.value || dadosBase.telefone || 'Não informado',
    convenio: document.getElementById('convenioPaciente')?.value || dadosBase.convenio || 'Não informado',
    prontuario: document.getElementById('prontuarioPaciente')?.value || dadosBase.cns || 'Não informado',
    sintomas: document.getElementById('sintomasPaciente')?.value || dadosBase.motivo || 'Sem sintomas registrados.',
    observacoes: document.getElementById('observacoesPaciente')?.value || '',
    classificacao: risk,
    tempo: '0 min',
    status: 'Aguardando médico',
    dor: document.getElementById('painRange')?.value || '5',
    saturacao: document.getElementById('saturacaoPaciente')?.value || '98',
    pressao: `${ps}/${pd}`,
    fc: document.getElementById('frequenciaCardiaca')?.value || '82',
    temp: document.getElementById('temperaturaPaciente')?.value || '36,7',
    fr: document.getElementById('frequenciaRespiratoria')?.value || '18',
    enviadoParaMedicoEm: new Date().toISOString()
  };
}

// Reforça o botão salvar sem alterar o layout: envia para fila do médico também.
document.getElementById('saveTriageBtn')?.addEventListener('click', () => {
  const nomeInput = document.getElementById('nomePaciente') || document.querySelector('input[placeholder="Digite o nome completo"]');
  const nome = nomeInput && nomeInput.value.trim() ? nomeInput.value.trim() : 'Paciente sem nome';
  const risk = document.getElementById('riskInput')?.value || 'amarelo';
  const dados = coletarDadosTriagemIntegrada(nome, risk);
  HospitalFlow.pushUnique(HospitalFlow.STORE.doctorQueue, dados);
  HospitalFlow.removeById(HospitalFlow.STORE.triageQueue, dados.id);
  if (typeof showToast === 'function') showToast(`${nome} enviado para o prontuário médico.`);
});

carregarPacienteDaRecepcaoNaTriagem();
