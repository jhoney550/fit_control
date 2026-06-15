iniciarDadosDemo();

let tipoLoginSelecionado = "professor";

const tabs = document.querySelectorAll(".tab");
const titulo = document.getElementById("loginTitulo");
const subtitulo = document.getElementById("loginSubtitulo");
const email = document.getElementById("loginEmail");
const senha = document.getElementById("loginSenha");
const botao = document.querySelector(".primary-btn");
const demo = document.getElementById("demoLogin");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    tipoLoginSelecionado = tab.dataset.profile;
    atualizarTelaLogin();
    setMsg("");
  });
});

function atualizarTelaLogin() {
  email.value = "";
  senha.value = "";

  if (tipoLoginSelecionado === "professor") {
    titulo.textContent = "Login do Professor";
    subtitulo.textContent = "Acesse para cadastrar alunos, montar treinos e acompanhar progresso.";
    email.placeholder = "professor@teste.com";
    botao.textContent = "Entrar como professor";
    demo.textContent = "Professor: professor@teste.com / 123456";
  } else {
    titulo.textContent = "Login do Aluno";
    subtitulo.textContent = "Acesse para visualizar seu treino do dia e marcar exercícios como feitos.";
    email.placeholder = "aluno@teste.com";
    botao.textContent = "Entrar como aluno";
    demo.textContent = "Aluno: aluno@teste.com / 123456";
  }
}

function login() {
  try {
    const emailValor = email.value.trim();
    const senhaValor = senha.value;

    if (!emailValor || !senhaValor) {
      setMsg("Informe e-mail e senha.", "error");
      return;
    }

    const usuario = autenticar(emailValor, senhaValor, tipoLoginSelecionado);

    if (!usuario) {
      setMsg("Login inválido para a aba selecionada.", "error");
      return;
    }

    setSessao(usuario);
    window.location.href = usuario.tipo === "professor" ? "professor.html" : "aluno.html";
  } catch (err) {
    setMsg(err.message, "error");
  }
}
