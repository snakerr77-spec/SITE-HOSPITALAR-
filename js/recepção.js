const sidebar=document.querySelector('.sidebar');const btnMenu=document.getElementById('btnMenu');const form=document.getElementById('patientForm');const toast=document.getElementById('toast');const cpf=document.getElementById('cpf');const nascimento=document.getElementById('nascimento');const telefone=document.getElementById('telefone');const cep=document.getElementById('cep');const cns=document.getElementById('cns');const btnClear=document.getElementById('btnClear');const btnAtualizar=document.getElementById('btnAtualizar');const horaAtualizacao=document.getElementById('horaAtualizacao');function onlyNumbers(v){return String(v||'').replace(/\D/g,'')}function maskCPF(v){return onlyNumbers(v).slice(0,11).replace(/^(\d{3})(\d)/,'$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/,'$1.$2.$3').replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/,'$1.$2.$3-$4')}function maskDate(v){return onlyNumbers(v).slice(0,8).replace(/^(\d{2})(\d)/,'$1/$2').replace(/^(\d{2})\/(\d{2})(\d)/,'$1/$2/$3')}function maskPhone(v){const n=onlyNumbers(v).slice(0,11);if(n.length<=10)return n.replace(/^(\d{2})(\d)/,'($1) $2').replace(/(\d{4})(\d)/,'$1-$2');return n.replace(/^(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2')}function maskCEP(v){return onlyNumbers(v).slice(0,8).replace(/^(\d{5})(\d)/,'$1-$2')}function maskCNS(v){return onlyNumbers(v).slice(0,15).replace(/(\d{3})(\d)/,'$1 $2').replace(/(\d{4})(\d)/,'$1 $2').replace(/(\d{4})(\d)/,'$1 $2').replace(/(\d{4})(\d)/,'$1 $2')}function showToast(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>toast.classList.remove('show'),2400)}cpf?.addEventListener('input',()=>cpf.value=maskCPF(cpf.value));nascimento?.addEventListener('input',()=>nascimento.value=maskDate(nascimento.value));telefone?.addEventListener('input',()=>telefone.value=maskPhone(telefone.value));cep?.addEventListener('input',()=>cep.value=maskCEP(cep.value));cns?.addEventListener('input',()=>cns.value=maskCNS(cns.value));btnClear?.addEventListener('click',()=>{form.reset();showToast('Formulário limpo.');});btnAtualizar?.addEventListener('click',()=>{const d=new Date();horaAtualizacao.textContent=d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});showToast('Situação atualizada.');});btnMenu?.addEventListener('click',()=>sidebar.classList.toggle('open'));


/* Fluxo integrado: Recepção -> Triagem/Fila */
function recepcaoValor(id, fallback = '') {
  return document.getElementById(id)?.value?.trim() || fallback;
}

function recepcaoCategoria() {
  const prioridade = recepcaoValor('prioridade', 'Geral');
  if (/prefer|alta|idoso|gestante|defic/i.test(prioridade)) return 'Preferencial';
  if (/exame/i.test(prioridade)) return 'Exames';
  return 'Geral';
}

function criarPacienteRecepcao() {
  const nome = recepcaoValor('nome', 'Paciente');
  const categoria = recepcaoCategoria();
  const ticketPrefix = categoria === 'Preferencial' ? 'P' : categoria === 'Exames' ? 'E' : 'G';
  const ticketNumber = Math.floor(100 + Math.random() * 899);

  return {
    id: 'PAC-' + Date.now().toString(36).toUpperCase(),
    origem: 'Recepção',
    paciente: nome,
    nome,
    cpf: recepcaoValor('cpf', 'Não informado'),
    nascimento: recepcaoValor('nascimento', 'Não informado'),
    telefone: recepcaoValor('telefone', 'Não informado'),
    convenio: recepcaoValor('convenio', 'SUS'),
    cns: recepcaoValor('cns', 'Não informado'),
    endereco: recepcaoValor('endereco', 'Não informado'),
    prioridade: recepcaoValor('prioridade', 'Normal'),
    categoria,
    senha: ticketPrefix + ' ' + String(ticketNumber).padStart(3, '0'),
    motivo: recepcaoValor('motivo', 'Atendimento na recepção'),
    status: 'Aguardando triagem',
    criadoEm: new Date().toISOString()
  };
}

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const paciente = criarPacienteRecepcao();
  HospitalFlow.pushUnique(HospitalFlow.STORE.triageQueue, paciente);
  HospitalFlow.pushUnique(HospitalFlow.STORE.receptionQueue, paciente);
  showToast(`${paciente.paciente} enviado para triagem.`);
  setTimeout(() => { window.location.href = 'triagem.html'; }, 750);
});
