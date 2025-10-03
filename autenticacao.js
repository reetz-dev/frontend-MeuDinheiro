// --- LOGIN ---
const formLogin = document.getElementById("formLogin");
if (formLogin) {
  formLogin.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    try {
      const res = await fetch("http://localhost:8080/usuarios/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (res.ok) {
        // SALVA o token JWT no localStorage
        localStorage.setItem("token", data.token);

        alert("Login realizado com sucesso!");
        // Redireciona já logado para a home
        window.location.href = "home.html";
      } else {
        alert(data.error || "Erro no login");
      }
    } catch (error) {
      alert("Erro de conexão com o servidor");
      console.error(error);
    }
  });
}

// --- CADASTRO ---
const formCadastro = document.getElementById("formCadastro");
if (formCadastro) {
  formCadastro.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = document.getElementById("nome").value;
    const email = document.getElementById("emailCadastro").value;
    const senha = document.getElementById("senhaCadastro").value;

    try {
      const res = await fetch("http://localhost:8080/usuarios/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });

      if (res.ok) {
        alert("Cadastro realizado com sucesso!");
        window.location.href = "login.html";
      } else {
        const msg = await res.text();
        alert("Erro no cadastro: " + msg);
      }
    } catch (error) {
      alert("Erro de conexão com o servidor");
      console.error(error);
    }
  });
}

// --- FUNÇÕES DE USUÁRIO ---
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

async function carregarUsuario() {
  const usuarioId = pegarUsuarioId();
  const token = localStorage.getItem("token");

  if (!usuarioId || !token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`http://localhost:8080/usuarios/${usuarioId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
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