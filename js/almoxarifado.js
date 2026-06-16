const tableBody = document.getElementById("movementTable");
const paginationInfo = document.getElementById("paginationInfo");
const pageNumbers = document.getElementById("pageNumbers");
const pageSizeSelect = document.getElementById("pageSize");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");

const tabs = document.querySelectorAll(".tab");
const typeFilter = document.getElementById("typeFilter");
const userFilter = document.getElementById("userFilter");
const searchInput = document.getElementById("searchInput");
const clearFilters = document.getElementById("clearFilters");

const modalBackdrop = document.getElementById("modalBackdrop");
const openMovement = document.getElementById("openMovement");
const closeMovement = document.getElementById("closeMovement");
const movementForm = document.getElementById("movementForm");

let currentPage = 1;
let itemsPerPage = Number(pageSizeSelect.value);
let currentTab = "todas";

const baseMovements = [
  {
    date: "15/06/2026 18:15",
    type: "entrada",
    item: "Dipirona 500mg/mL",
    desc: "Ampola 2mL",
    qty: "200 un.",
    reason: "Compra - Med Center Hospitalar",
    nf: "NF: 45231",
    user: "João Silva",
    icon: "box"
  },
  {
    date: "15/06/2026 17:42",
    type: "saida",
    item: "Seringa 5mL c/ agulha",
    desc: "Descartável",
    qty: "120 un.",
    reason: "Consumo no atendimento",
    nf: "Enfermaria",
    user: "Maria Santos",
    icon: "syringe"
  },
  {
    date: "15/06/2026 16:30",
    type: "saida",
    item: "Luva de procedimento G",
    desc: "Látex - Com pó",
    qty: "300 un.",
    reason: "Consumo no atendimento",
    nf: "Centro Cirúrgico",
    user: "Carlos Lima",
    icon: "glove"
  },
  {
    date: "15/06/2026 15:10",
    type: "entrada",
    item: "Atadura de Crepe 15cm",
    desc: "Pacote c/ 12 unidades",
    qty: "150 un.",
    reason: "Compra - Cirúrgica Fernandes",
    nf: "NF: 98712",
    user: "João Silva",
    icon: "bottle"
  },
  {
    date: "15/06/2026 14:05",
    type: "saida",
    item: "Álcool 70% 1L",
    desc: "Frasco",
    qty: "50 un.",
    reason: "Higienização de superfícies",
    nf: "Limpeza",
    user: "Maria Santos",
    icon: "alcohol"
  },
  {
    date: "15/06/2026 11:20",
    type: "entrada",
    item: "Soro Fisiológico 0,9% 500mL",
    desc: "Bolsa",
    qty: "60 un.",
    reason: "Compra - Med Center Hospitalar",
    nf: "NF: 45231",
    user: "João Silva",
    icon: "bag"
  },
  {
    date: "15/06/2026 09:45",
    type: "saida",
    item: "Lamina de Bisturi nº 24",
    desc: "Caixa c/ 100 unidades",
    qty: "20 un.",
    reason: "Procedimento cirúrgico",
    nf: "Centro Cirúrgico",
    user: "Carlos Lima",
    icon: "blade"
  },
  {
    date: "14/06/2026 16:50",
    type: "entrada",
    item: "Máscara Cirúrgica Tripla",
    desc: "Caixa c/ 50 unidades",
    qty: "100 cx.",
    reason: "Compra - Cirúrgica Fernandes",
    nf: "NF: 98654",
    user: "João Silva",
    icon: "mask"
  }
];

let movements = createMockMovements(128);

function createMockMovements(total) {
  const users = ["João Silva", "Maria Santos", "Carlos Lima"];

  const reasons = [
    ["Compra - Med Center Hospitalar", "NF: 45231"],
    ["Consumo no atendimento", "Enfermaria"],
    ["Consumo no atendimento", "Centro Cirúrgico"],
    ["Compra - Cirúrgica Fernandes", "NF: 98712"],
    ["Higienização de superfícies", "Limpeza"],
    ["Inventário mensal", "Ajuste de estoque"]
  ];

  const list = [];

  for (let i = 0; i < total; i++) {
    const base = baseMovements[i % baseMovements.length];
    const day = String(15 - (i % 15)).padStart(2, "0");
    const hour = String(18 - (i % 9)).padStart(2, "0");
    const minute = String((15 + i * 7) % 60).padStart(2, "0");
    const reason = reasons[i % reasons.length];

    list.push({
      ...base,
      id: i + 1,
      date: `${day}/06/2026 ${hour}:${minute}`,
      user: users[i % users.length],
      reason: reason[0],
      nf: reason[1]
    });
  }

  return list;
}

function getIcon(name) {
  const icons = {
    box: `
      <svg viewBox="0 0 24 24">
        <path d="m21 8-9-5-9 5 9 5 9-5Z"/>
        <path d="M3 8v8l9 5 9-5V8"/>
        <path d="M12 13v8"/>
      </svg>
    `,
    syringe: `
      <svg viewBox="0 0 24 24">
        <path d="m18 2 4 4"/>
        <path d="m17 7-10 10"/>
        <path d="m14 4 6 6"/>
        <path d="M5 19 3 21"/>
        <path d="m7 17-2-2"/>
        <path d="m10 14-2-2"/>
      </svg>
    `,
    glove: `
      <svg viewBox="0 0 24 24">
        <path d="M8 12V5a1.5 1.5 0 0 1 3 0v7"/>
        <path d="M11 12V4a1.5 1.5 0 0 1 3 0v8"/>
        <path d="M14 12V6a1.5 1.5 0 0 1 3 0v8"/>
        <path d="M8 13 6.5 11.5a1.6 1.6 0 0 0-2.3 2.2l4.4 5A6 6 0 0 0 19 14"/>
      </svg>
    `,
    bottle: `
      <svg viewBox="0 0 24 24">
        <path d="M10 2h4"/>
        <path d="M11 2v5l-3 3v10a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V10l-3-3V2"/>
        <path d="M8 14h8"/>
      </svg>
    `,
    alcohol: `
      <svg viewBox="0 0 24 24">
        <path d="M10 2h4"/>
        <path d="M11 2v5l-3 4v9a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-9l-3-4V2"/>
        <path d="M10 15h4"/>
      </svg>
    `,
    bag: `
      <svg viewBox="0 0 24 24">
        <path d="M8 3h8v4H8z"/>
        <path d="M9 7h6l2 4v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9l2-4Z"/>
        <path d="M12 12v5"/>
        <path d="M10 14h4"/>
      </svg>
    `,
    blade: `
      <svg viewBox="0 0 24 24">
        <path d="M20 4 4 20"/>
        <path d="M14 4h6v6"/>
      </svg>
    `,
    mask: `
      <svg viewBox="0 0 24 24">
        <path d="M4 9h16v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V9Z"/>
        <path d="M4 11 2 9"/>
        <path d="m20 11 2-2"/>
        <path d="M8 13h8"/>
      </svg>
    `
  };

  return icons[name] || icons.box;
}

function normalizeText(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getFilteredMovements() {
  const search = normalizeText(searchInput.value.trim());
  const selectedType = typeFilter.value;
  const selectedUser = userFilter.value;

  return movements.filter((movement) => {
    const tabMatch = currentTab === "todas" || movement.type === currentTab;
    const typeMatch = selectedType === "todas" || movement.type === selectedType;
    const userMatch = selectedUser === "todos" || normalizeText(movement.user) === selectedUser;

    const searchableText = normalizeText(
      `${movement.item} ${movement.desc} ${movement.reason} ${movement.nf} ${movement.user}`
    );

    const searchMatch = !search || searchableText.includes(search);

    return tabMatch && typeMatch && userMatch && searchMatch;
  });
}

function renderTable() {
  const filtered = getFilteredMovements();
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = filtered.slice(startIndex, endIndex);

  tableBody.innerHTML = "";

  if (pageItems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-row">
          Nenhuma movimentação encontrada.
        </td>
      </tr>
    `;

    paginationInfo.textContent = "Mostrando 0 a 0 de 0 movimentações";
    renderPagination(1);
    return;
  }

  pageItems.forEach((movement) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${movement.date}</td>

      <td>
        <span class="status ${movement.type}">
          ${movement.type === "entrada" ? "Entrada" : "Saída"}
        </span>
      </td>

      <td>
        <div class="item-cell">
          <span class="item-icon">${getIcon(movement.icon)}</span>

          <span class="item-text">
            <strong>${movement.item}</strong>
            <span>${movement.desc}</span>
          </span>
        </div>
      </td>

      <td>${movement.qty}</td>

      <td>
        <span class="reason">
          ${movement.reason}
          <small>${movement.nf}</small>
        </span>
      </td>

      <td>${movement.user}</td>

      <td>
        <div class="actions">
          <button class="icon-btn" type="button" title="Visualizar">
            <svg viewBox="0 0 24 24">
              <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>

          <button class="icon-btn" type="button" title="Documento">
            <svg viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/>
              <path d="M14 2v6h6"/>
              <path d="M9 15h6"/>
              <path d="M9 18h4"/>
            </svg>
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  const showingStart = filtered.length === 0 ? 0 : startIndex + 1;
  const showingEnd = Math.min(endIndex, filtered.length);

  paginationInfo.textContent = `Mostrando ${showingStart} a ${showingEnd} de ${filtered.length} movimentações`;

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  pageNumbers.innerHTML = "";

  prevPageBtn.disabled = currentPage === 1;
  nextPageBtn.disabled = currentPage === totalPages;

  const pages = getVisiblePages(currentPage, totalPages);

  pages.forEach((page) => {
    if (page === "...") {
      const dots = document.createElement("span");
      dots.className = "dots";
      dots.textContent = "...";
      pageNumbers.appendChild(dots);
      return;
    }

    const button = document.createElement("button");
    button.type = "button";
    button.className = `number-btn ${page === currentPage ? "active" : ""}`;
    button.textContent = page;

    button.addEventListener("click", () => {
      currentPage = page;
      renderTable();
    });

    pageNumbers.appendChild(button);
  });
}

function getVisiblePages(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 5) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (page >= totalPages - 4) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, "...", page - 1, page, page + 1, "...", totalPages];
}

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(getFilteredMovements().length / itemsPerPage));

  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
});

pageSizeSelect.addEventListener("change", () => {
  itemsPerPage = Number(pageSizeSelect.value);
  currentPage = 1;
  renderTable();
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");

    currentTab = tab.dataset.type;
    typeFilter.value = currentTab;
    currentPage = 1;

    renderTable();
  });
});

typeFilter.addEventListener("change", () => {
  currentTab = typeFilter.value;

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.type === currentTab);
  });

  currentPage = 1;
  renderTable();
});

userFilter.addEventListener("change", () => {
  currentPage = 1;
  renderTable();
});

searchInput.addEventListener("input", () => {
  currentPage = 1;
  renderTable();
});

clearFilters.addEventListener("click", () => {
  currentTab = "todas";
  typeFilter.value = "todas";
  userFilter.value = "todos";
  searchInput.value = "";

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.type === "todas");
  });

  currentPage = 1;
  renderTable();
});

openMovement.addEventListener("click", () => {
  modalBackdrop.classList.add("show");
});

closeMovement.addEventListener("click", () => {
  modalBackdrop.classList.remove("show");
});

modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    modalBackdrop.classList.remove("show");
  }
});

movementForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const now = new Date();

  const formattedDate =
    now.toLocaleDateString("pt-BR") +
    " " +
    now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });

  const newMovement = {
    id: movements.length + 1,
    date: formattedDate,
    type: document.getElementById("newType").value,
    item: document.getElementById("newItem").value,
    desc: document.getElementById("newDesc").value,
    qty: `${document.getElementById("newQty").value} un.`,
    reason: document.getElementById("newReason").value,
    nf: "Registro manual",
    user: document.getElementById("newUser").value,
    icon: "box"
  };

  movements.unshift(newMovement);

  movementForm.reset();
  modalBackdrop.classList.remove("show");

  currentTab = "todas";
  typeFilter.value = "todas";
  userFilter.value = "todos";
  searchInput.value = "";

  tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.type === "todas");
  });

  currentPage = 1;
  renderTable();
});

renderTable();