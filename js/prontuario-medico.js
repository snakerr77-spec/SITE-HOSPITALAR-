const patient = {
  name: "João da Silva",
  initials: "JS",
  age: "42 anos, 7 meses",
  gender: "male"
};

const patientName = document.getElementById("patientName");
const patientInitials = document.getElementById("patientInitials");
const patientAge = document.getElementById("patientAge");
const patientSex = document.getElementById("patientSex");

const genderButtons = document.querySelectorAll(".gender-btn");
const bodyImage = document.getElementById("bodyImage");
const painButtons = document.querySelectorAll(".pain-btn");
const selectedPainText = document.getElementById("selectedPainText");
const clearPain = document.getElementById("clearPain");

let currentGender = patient.gender;
let selectedPainPlaces = [];

if (patientName) patientName.textContent = patient.name;
if (patientInitials) patientInitials.textContent = patient.initials;
if (patientAge) patientAge.textContent = patient.age;

setGender(currentGender);

genderButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setGender(button.dataset.gender);
  });
});

painButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("hidden")) return;

    const place = button.dataset.name;

    if (button.classList.contains("active")) {
      button.classList.remove("active");
      selectedPainPlaces = selectedPainPlaces.filter((item) => item !== place);
    } else {
      button.classList.add("active");
      selectedPainPlaces.push(place);
    }

    updateSelectedPainText();
  });
});

if (clearPain) {
  clearPain.addEventListener("click", () => {
    selectedPainPlaces = [];

    painButtons.forEach((button) => {
      button.classList.remove("active");
    });

    updateSelectedPainText();
  });
}

function setGender(gender) {
  currentGender = gender;

  genderButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.gender === gender);
  });

  if (patientSex) {
    patientSex.textContent = gender === "female" ? "Feminino" : "Masculino";
  }

  if (bodyImage) {
    if (gender === "female") {
      bodyImage.src = "../assets/mapa-feminino.png";
      bodyImage.alt = "Mapa corporal feminino";
    } else {
      bodyImage.src = "../assets/mapa-masculino.png";
      bodyImage.alt = "Mapa corporal masculino";
    }
  }

  selectedPainPlaces = [];

  painButtons.forEach((button) => {
    const isMalePoint = button.classList.contains("male-point");
    const isFemalePoint = button.classList.contains("female-point");

    button.classList.remove("active");

    if (gender === "male") {
      button.classList.toggle("hidden", !isMalePoint);
    } else {
      button.classList.toggle("hidden", !isFemalePoint);
    }
  });

  updateSelectedPainText();
}

function updateSelectedPainText() {
  if (!selectedPainText) return;

  if (selectedPainPlaces.length === 0) {
    selectedPainText.textContent = "Nenhum local selecionado.";
    return;
  }

  selectedPainText.textContent = selectedPainPlaces.join(", ");
}

/* Fluxo integrado: paciente liberado pela triagem aparece para o médico */
const btnDrChamar = document.getElementById("btnDrChamar") || document.getElementById("openActions");

function setTextBySelector(selector, value) {
  const el = document.querySelector(selector);

  if (el && value !== undefined && value !== null && value !== "") {
    el.textContent = value;
  }
}

function aplicarPacienteNoProntuario(p) {
  if (!p) return;

  const nome = p.paciente || p.nome || "Paciente";

  if (patientName) patientName.textContent = nome;

  if (patientInitials && window.HospitalFlow) {
    patientInitials.textContent = HospitalFlow.initials(nome);
  }

  if (patientAge) {
    patientAge.textContent = p.idade && p.idade !== "--"
      ? `${p.idade} anos`
      : "Idade não informada";
  }

  const sexoPaciente = p.sexo || p.gender || p.genero || "";

  if (sexoPaciente) {
    const sexoNormalizado = String(sexoPaciente).toLowerCase();

    if (
      sexoNormalizado.includes("fem") ||
      sexoNormalizado === "female" ||
      sexoNormalizado === "mulher"
    ) {
      setGender("female");
    } else {
      setGender("male");
    }
  }

  const infos = document.querySelectorAll(".patient-info strong");

  if (infos[0]) {
    const svg = infos[0].querySelector("svg");
    infos[0].textContent = "";

    if (svg) infos[0].appendChild(svg);

    infos[0].append(" " + (p.nascimento || "Não informado"));
  }

  if (infos[1]) {
    infos[1].textContent = p.prontuario || p.cns || "Não informado";
  }

  if (infos[2]) {
    const svg = infos[2].querySelector("svg");
    infos[2].textContent = "";

    if (svg) infos[2].appendChild(svg);

    infos[2].append(" " + (p.telefone || "Não informado"));
  }

  if (infos[3]) {
    infos[3].innerHTML = '<small class="tag-green">Precisa de atendimento</small>';
  }

  const complaint = document.querySelector(".alert-grid .mini-card:nth-child(1) strong");

  if (complaint) {
    complaint.textContent = p.sintomas || p.motivo || "Paciente encaminhado pela triagem";
  }

  const riskText = document.querySelector(".alert-grid .mini-card:nth-child(2) strong");

  if (riskText) {
    riskText.textContent = String(p.classificacao || "AMARELO").toUpperCase() + " - Encaminhado pela triagem";
  }

  const riskP = document.querySelector(".alert-grid .mini-card:nth-child(2) p");

  if (riskP) {
    riskP.textContent = "Definida na triagem " + (
      p.enviadoParaMedicoEm
        ? new Date(p.enviadoParaMedicoEm).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit"
          })
        : "agora"
    );
  }

  const summaryValues = document.querySelectorAll(".vitals strong");

  if (summaryValues[0]) summaryValues[0].textContent = p.pressao || "120/80";
  if (summaryValues[1]) summaryValues[1].textContent = p.fc || "82";
  if (summaryValues[2]) summaryValues[2].textContent = p.fr || "18";
  if (summaryValues[3]) summaryValues[3].textContent = p.saturacao || "98";
  if (summaryValues[4]) summaryValues[4].textContent = p.temp || "36,7";
  if (summaryValues[5]) summaryValues[5].textContent = p.dor || "5";

  const clinicalObs = document.querySelector(".clinical-lines div:nth-child(3) span");

  if (clinicalObs) {
    clinicalObs.textContent = p.observacoes || p.sintomas || "Paciente aguardando avaliação médica.";
  }

  if (window.HospitalFlow) {
    localStorage.setItem(HospitalFlow.STORE.currentDoctorPatient, JSON.stringify(p));
  }
}

function chamarProximoPacienteMedico() {
  if (!window.HospitalFlow) return;

  const proximo = HospitalFlow.popFirst(HospitalFlow.STORE.doctorQueue);

  if (!proximo) {
    alert("Nenhum paciente aguardando no prontuário médico.");
    return;
  }

  aplicarPacienteNoProntuario(proximo);
}

btnDrChamar?.addEventListener("click", chamarProximoPacienteMedico);

try {
  if (window.HospitalFlow) {
    const atual = JSON.parse(localStorage.getItem(HospitalFlow.STORE.currentDoctorPatient) || "null");

    if (atual) {
      aplicarPacienteNoProntuario(atual);
    }

    const filaMedicoInicial = HospitalFlow.read(HospitalFlow.STORE.doctorQueue);

    if (filaMedicoInicial.length) {
      aplicarPacienteNoProntuario(filaMedicoInicial[0]);
    }
  }
} catch (_) {}