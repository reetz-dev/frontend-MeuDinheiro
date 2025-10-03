let graficoCategoria = null;
let graficoMes = null;
const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// --- Pega usuárioId do token JWT ---
function pegarUsuarioId() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub; // ID do usuário
  } catch {
    return null;
  }
}

// --- Carregar usuário logado ---
async function carregarUsuario() {
  const usuarioId = pegarUsuarioId();
  const token = localStorage.getItem("token");

  if (!usuarioId || !token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/usuarios/${usuarioId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.ok) {
      const usuario = await res.json();
      document.getElementById("nomeUsuario").textContent = usuario.nome;
    } else {
      localStorage.removeItem("token");
      window.location.href = "login.html";
    }
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
  }
}

// --- Buscar transações ---
async function buscarTransacoes() {
  const usuarioId = pegarUsuarioId();
  const token = localStorage.getItem("token");

  if (!usuarioId || !token) {
    window.location.href = "login.html";
    return [];
  }

  try {
    const res = await fetch(`http://localhost:8080/transacoes/${usuarioId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("Erro ao buscar transações:", error);
    return [];
  }
}

// --- Popular tabela ---
async function carregarTransacoes() {
  const transacoes = await buscarTransacoes();
  const tbody = document.getElementById("tabelaTransacoes");
  tbody.innerHTML = "";

  transacoes.forEach(t => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.data}</td>
      <td>${t.categoria.nome}</td>
      <td>${t.categoria.tipo}</td>
      <td>R$ ${t.valor.toFixed(2)}</td>
      <td>${t.descricao}</td>
    `;
    tbody.appendChild(tr);
  });
}

// --- Gráfico de categoria ---
async function carregarGraficoCategoria(filtro = "TODOS") {
  const transacoes = await buscarTransacoes();

  const categorias = Array.from(new Set(transacoes.map(t => t.categoria.nome)));
  const porCategoria = {};
  categorias.forEach(cat => porCategoria[cat] = 0);

  transacoes.forEach(t => {
    if (filtro === "TODOS" || t.categoria.tipo === filtro) {
      const nome = t.categoria.nome;
      porCategoria[nome] = (porCategoria[nome] || 0) + t.valor;
    }
  });

  const ctx = document.getElementById("graficoCategoria").getContext("2d");
  if (graficoCategoria) graficoCategoria.destroy();

  graficoCategoria = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(porCategoria),
      datasets: [{
        data: Object.values(porCategoria),
        backgroundColor: ["#007bff", "#28a745", "#ffc107", "#dc3545", "#17a2b8"]
      }]
    }
  });
}

// --- Gráfico de mês ---
async function carregarGraficoMes() {
  const transacoes = await buscarTransacoes();
  const valoresMes = new Array(12).fill(0);

  transacoes.forEach(t => {
    const mes = new Date(t.data).getMonth();
    valoresMes[mes] += t.valor;
  });

  const ctx = document.getElementById("graficoMes").getContext("2d");
  if (graficoMes) graficoMes.destroy();

  graficoMes = new Chart(ctx, {
    type: "line",
    data: {
      labels: meses,
      datasets: [{
        label: "Gastos (R$)",
        data: valoresMes,
        borderColor: "#00a89c",
        backgroundColor: "rgba(0, 168, 156, 0.2)",
        fill: true,
        tension: 0.3
      }]
    }
  });
}

// --- Inicialização ---
window.addEventListener("DOMContentLoaded", () => {
  carregarUsuario();
  carregarTransacoes();
  carregarGraficoMes();
  carregarGraficoCategoria();
});

// --- Eventos ---
document.getElementById("filtroCategoria").addEventListener("change", (e) => {
  carregarGraficoCategoria(e.target.value);
});

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("token");
  alert("Você saiu!");
  window.location.href = "login.html";
});
