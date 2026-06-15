iniciarDadosDemo();

function liberarAdmin() {
  const chave = document.getElementById("adminKey").value.trim();

  if (chave !== APP_CONFIG.adminKey) {
    setMsg("Chave de administrador inválida.", "error");
    return;
  }

  document.getElementById("adminUnlock").classList.add("hidden");
  document.getElementById("adminForm").classList.remove("hidden");
  setMsg("Cadastro liberado.", "ok");
}

function criarProfessorAdmin() {
  try {
    const nome = document.getElementById("profNome").value.trim();
    const email = document.getElementById("profEmail").value.trim();
    const senha = document.getElementById("profSenha").value;

    if (!nome || !email || !senha) {
      setMsg("Preencha todos os campos.", "error");
      return;
    }

    if (senha.length < 6) {
      setMsg("A senha precisa ter no mínimo 6 caracteres.", "error");
      return;
    }

    criarUsuario({ tipo: "professor", nome, email, senha });

    document.getElementById("profNome").value = "";
    document.getElementById("profEmail").value = "";
    document.getElementById("profSenha").value = "";

    setMsg("Professor criado com sucesso.", "ok");
  } catch (err) {
    setMsg(err.message, "error");
  }
}
