const barcodeInput = document.getElementById("barcodeInput");
const quantityInput = document.getElementById("quantityInput");
const confirmScan = document.getElementById("confirmScan");
const scannerStatus = document.getElementById("scannerStatus");
const itemCard = document.getElementById("itemCard");
const historyTable = document.getElementById("historyTable");
const clearHistory = document.getElementById("clearHistory");
const operationButtons = document.querySelectorAll(".operation");

let currentOperation = "entrada";

const products = [
  {
    code: "7891234567890",
    name: "Dipirona 500mg/mL",
    description: "Ampola 2mL",
    category: "Medicamentos",
    unit: "Unidade",
    stock: 2004,
    minStock: 500,
    location: "Prateleira 03 / Gaveta B"
  },
  {
    code: "7899876543210",
    name: "Seringa 5mL c/ agulha",
    description: "Descartável",
    category: "Materiais Hospitalares",
    unit: "Unidade",
    stock: 120,
    minStock: 200,
    location: "Prateleira 01 / Gaveta A"
  },
  {
    code: "7894561230001",
    name: "Luva de procedimento G",
    description: "Látex - Com pó",
    category: "EPIs",
    unit: "Caixa",
    stock: 300,
    minStock: 500,
    location: "Prateleira 05 / Caixa 02"
  },
  {
    code: "7897418529630",
    name: "Álcool 70% 1L",
    description: "Frasco",
    category: "Materiais de Limpeza",
    unit: "Frasco",
    stock: 50,
    minStock: 100,
    location: "Depósito / Limpeza"
  },
  {
    code: "7895558881110",
    name: "Soro Fisiológico 0,9% 500mL",
    description: "Bolsa",
    category: "Medicamentos",
    unit: "Unidade",
    stock: 1024,
    minStock: 600,
    location: "Prateleira 04 / Gaveta C"
  },
  {
    code: "7892223334445",
    name: "Máscara Cirúrgica Tripla",
    description: "Caixa c/ 50 unidades",
    category: "EPIs",
    unit: "Caixa",
    stock: 642,
    minStock: 300,
    location: "Prateleira 02 / Caixa 01"
  }
];

let scanHistory = JSON.parse(localStorage.getItem("scanHistory")) || [];

operationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    operationButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    currentOperation = button.dataset.operation;

    barcodeInput.focus();
    showStatus(`Modo selecionado: ${currentOperation === "entrada" ? "Entrada" : "Saída"}. Agora bipe o produto.`, "warning");
  });
});

barcodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    processBarcode();
  }
});

confirmScan.addEventListener("click", () => {
  processBarcode();
});

clearHistory.addEventListener("click", () => {
  const confirmClear = confirm("Deseja limpar o histórico de bipagens desta tela?");

  if (!confirmClear) return;

  scanHistory = [];
  localStorage.removeItem("scanHistory");
  renderHistory();
  showStatus("Histórico limpo com sucesso.", "success");
  barcodeInput.focus();
});

function processBarcode() {
  const code = barcodeInput.value.trim();
  const quantity = Number(quantityInput.value);

  if (!code) {
    showStatus("Bipe ou digite um código de barras antes de confirmar.", "error");
    barcodeInput.focus();
    return;
  }

  if (!quantity || quantity <= 0) {
    showStatus("Informe uma quantidade válida para movimentar o item.", "error");
    quantityInput.focus();
    return;
  }

  const product = findProductByCode(code);

  if (!product) {
    showStatus(`Item não encontrado para o código: ${code}`, "error");
    renderUnknownItem(code);
    resetScanner(false);
    return;
  }

  if (currentOperation === "saida" && quantity > product.stock) {
    showStatus(`Estoque insuficiente. Disponível: ${product.stock} ${product.unit.toLowerCase()}(s).`, "error");
    renderProduct(product);
    resetScanner(false);
    return;
  }

  if (currentOperation === "entrada") {
    product.stock += quantity;
  } else {
    product.stock -= quantity;
  }

  const movement = {
    date: getCurrentDate(),
    type: currentOperation,
    code: product.code,
    name: product.name,
    quantity,
    stock: product.stock,
    user: "Dra. Ana Silva"
  };

  scanHistory.unshift(movement);
  localStorage.setItem("scanHistory", JSON.stringify(scanHistory));

  renderProduct(product);
  renderHistory();

  const operationName = currentOperation === "entrada" ? "entrada" : "saída";

  showStatus(
    `Bipagem registrada com sucesso: ${operationName} de ${quantity} item(ns) - ${product.name}.`,
    "success"
  );

  resetScanner(true);
}

function findProductByCode(code) {
  return products.find((product) => product.code === code);
}

function renderProduct(product) {
  const stockClass = getStockClass(product);

  itemCard.innerHTML = `
    <div class="product-view">
      <div class="product-top">
        <div class="product-icon">
          <svg viewBox="0 0 24 24">
            <path d="M21 8 12 3 3 8l9 5 9-5Z"/>
            <path d="M3 8v8l9 5 9-5V8"/>
            <path d="M12 13v8"/>
          </svg>
        </div>

        <div>
          <h2>${product.name}</h2>
          <p>${product.description} • ${product.category}</p>
        </div>
      </div>

      <div class="product-grid">
        <div class="product-info">
          <span>Código de barras</span>
          <strong>${product.code}</strong>
        </div>

        <div class="product-info">
          <span>Unidade</span>
          <strong>${product.unit}</strong>
        </div>

        <div class="product-info ${stockClass}">
          <span>Estoque atual</span>
          <strong>${product.stock}</strong>
        </div>

        <div class="product-info">
          <span>Estoque mínimo</span>
          <strong>${product.minStock}</strong>
        </div>

        <div class="product-info">
          <span>Categoria</span>
          <strong>${product.category}</strong>
        </div>

        <div class="product-info">
          <span>Localização</span>
          <strong>${product.location}</strong>
        </div>
      </div>
    </div>
  `;
}

function renderUnknownItem(code) {
  itemCard.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">
        <svg viewBox="0 0 24 24">
          <path d="M10.3 3.3 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.3a2 2 0 0 0-3.4 0Z"/>
          <path d="M12 9v4"/>
          <path d="M12 17h.01"/>
        </svg>
      </div>

      <h3>Item não cadastrado</h3>
      <p>O código <strong>${code}</strong> não foi encontrado no almoxarifado.</p>
    </div>
  `;
}

function renderHistory() {
  if (scanHistory.length === 0) {
    historyTable.innerHTML = `
      <tr>
        <td colspan="7" class="empty-table">
          Nenhuma bipagem registrada ainda.
        </td>
      </tr>
    `;
    return;
  }

  historyTable.innerHTML = "";

  scanHistory.slice(0, 20).forEach((movement) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${movement.date}</td>

      <td>
        <span class="status ${movement.type}">
          ${movement.type === "entrada" ? "Entrada" : "Saída"}
        </span>
      </td>

      <td>${movement.code}</td>
      <td>${movement.name}</td>
      <td>${movement.quantity}</td>
      <td>${movement.stock}</td>
      <td>${movement.user}</td>
    `;

    historyTable.appendChild(tr);
  });
}

function getStockClass(product) {
  if (product.stock <= product.minStock * 0.5) {
    return "stock-critical";
  }

  if (product.stock <= product.minStock) {
    return "stock-low";
  }

  return "stock-good";
}

function showStatus(message, type) {
  scannerStatus.textContent = message;
  scannerStatus.className = `scanner-status ${type || ""}`;
}

function resetScanner(clearQuantity) {
  barcodeInput.value = "";

  if (clearQuantity) {
    quantityInput.value = 1;
  }

  setTimeout(() => {
    barcodeInput.focus();
  }, 80);
}

function getCurrentDate() {
  const now = new Date();

  return now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

document.addEventListener("click", () => {
  if (!document.activeElement || document.activeElement.tagName !== "INPUT") {
    barcodeInput.focus();
  }
});

renderHistory();

setTimeout(() => {
  barcodeInput.focus();
}, 300);