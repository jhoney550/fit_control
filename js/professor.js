iniciarDadosDemo();

let sessao = null;
let professor = null;

document.addEventListener("DOMContentLoaded", iniciarProfessor);

function iniciarProfessor() {
  sessao = getSessao();
  if (!sessao) return window.location.href = "index.html";
  professor = buscarUsuarioPorId(sessao.id);
  if (!professor || professor.tipo !== "professor") return window.location.href = "index.html";

  document.getElementById("professorNomeTopo").textContent = professor.nome;
  document.getElementById("drawerUserName").textContent = professor.nome;
  document.getElementById("boasVindasProfessor").textContent = `Olá, ${professor.nome}. Veja o resumo dos seus alunos.`;

  prepararNavegacao();
  preencherListaExercicios();
  preencherPerfilProfessor();
  carregarTela();
}

function prepararNavegacao() {
  document.querySelectorAll(".drawer-link").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".drawer-link").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("page-" + btn.dataset.page).classList.add("active");
      fecharMenu();
      carregarTela();
    });
  });
}

function sair(){ limparSessao(); window.location.href="index.html"; }

function preencherListaExercicios() {
  document.getElementById("listaExercicios").innerHTML = EXERCICIOS_SUGERIDOS.map(e => `<option value="${e}"></option>`).join("");
}

function preencherPerfilProfessor() {
  professor = buscarUsuarioPorId(professor.id);
  document.getElementById("profPerfilNome").value = professor.nome || "";
  document.getElementById("profPerfilEmail").value = professor.email || "";
  document.getElementById("profPerfilFoto").value = professor.foto || "";
  const avatar = document.getElementById("profAvatarPreview");
  avatar.textContent = inicialNome(professor.nome);
  avatar.style.backgroundImage = professor.foto ? `url('${professor.foto}')` : "";
  if (professor.foto) avatar.textContent = "";
}

function salvarPerfilProfessor() {
  try {
    const dados = {
      nome: document.getElementById("profPerfilNome").value.trim(),
      email: document.getElementById("profPerfilEmail").value.trim(),
      foto: document.getElementById("profPerfilFoto").value.trim()
    };
    const senha = document.getElementById("profPerfilSenha").value;
    if (senha) dados.senha = senha;
    if (!dados.nome || !dados.email) return setMsg("Nome e e-mail são obrigatórios.", "error");
    professor = atualizarUsuario(professor.id, dados);
    setSessao(professor);
    document.getElementById("professorNomeTopo").textContent = professor.nome;
    document.getElementById("drawerUserName").textContent = professor.nome;
    preencherPerfilProfessor();
    setMsg("Perfil atualizado.", "ok");
  } catch (err) { setMsg(err.message, "error"); }
}

function carregarTela() {
  professor = buscarUsuarioPorId(professor.id);
  carregarDashboard();
  carregarAlunos();
  carregarProgresso();
  atualizarTreinoAlunoSelecionado();
}

function cadastrarAluno() {
  try {
    const nome = document.getElementById("alunoNome").value.trim();
    const email = document.getElementById("alunoEmail").value.trim();
    const senha = document.getElementById("alunoSenha").value;
    const whatsapp = document.getElementById("alunoWhatsapp").value.trim();
    const objetivo = document.getElementById("alunoObjetivo").value;
    const peso = numero(document.getElementById("alunoPeso").value);
    const altura = numero(document.getElementById("alunoAltura").value);
    if (!nome || !email || !senha) return setMsg("Nome, e-mail e senha são obrigatórios.", "error");
    if (senha.length < 6) return setMsg("A senha precisa ter no mínimo 6 caracteres.", "error");
    criarUsuario({ tipo:"aluno", professorId:professor.id, nome, email, senha, whatsapp, objetivo, peso, altura });
    ["alunoNome","alunoEmail","alunoSenha","alunoWhatsapp","alunoPeso","alunoAltura"].forEach(id => document.getElementById(id).value = "");
    setMsg("Aluno cadastrado.", "ok");
    carregarTela();
  } catch (err) { setMsg(err.message, "error"); }
}

function carregarDashboard() {
  const alunos = listarAlunosDoProfessor(professor.id);
  const treinos = dbGet(DB_KEYS.treinos).filter(t => t.professorId === professor.id);
  const exercicios = listarExerciciosPorProfessor(professor.id);
  const concluidosHoje = listarExecucoesDoDia().filter(e => e.professorId === professor.id && e.concluido).length;
  document.getElementById("totalAlunos").textContent = alunos.length;
  document.getElementById("totalTreinos").textContent = treinos.length;
  document.getElementById("totalExercicios").textContent = exercicios.length;
  document.getElementById("totalConcluidosHoje").textContent = concluidosHoje;
  const box = document.getElementById("dashboardAlunos");
  box.innerHTML = alunos.length ? alunos.slice(0,5).map(a => {
    const p = progressoAlunoHoje(a.id);
    const pct = p.totalExercicios ? Math.round((p.concluidosHoje / p.totalExercicios) * 100) : 0;
    return `<div class="student-item"><header><div><strong>${a.nome}</strong><div class="meta">${a.objetivo || "-"} • ${p.concluidosHoje}/${p.totalExercicios} hoje</div></div><span class="badge">${pct}%</span></header></div>`;
  }).join("") : `<p class="meta">Nenhum aluno cadastrado.</p>`;
}

function carregarAlunos() {
  const alunos = listarAlunosDoProfessor(professor.id);
  const select = document.getElementById("selectAluno");
  const lista = document.getElementById("listaAlunos");
  if (!alunos.length) {
    select.innerHTML = `<option value="">Nenhum aluno cadastrado</option>`;
    lista.innerHTML = `<p class="meta">Nenhum aluno cadastrado ainda.</p>`;
    return;
  }
  select.innerHTML = alunos.map(a => `<option value="${a.id}">${a.nome}</option>`).join("");
  select.onchange = atualizarTreinoAlunoSelecionado;
  lista.innerHTML = alunos.map(aluno => {
    const p = progressoAlunoHoje(aluno.id);
    const pct = p.totalExercicios ? Math.round((p.concluidosHoje / p.totalExercicios) * 100) : 0;
    return `<article class="student-item"><header><div><strong>${aluno.nome}</strong><div class="meta">${aluno.email} ${aluno.whatsapp ? " • " + aluno.whatsapp : ""}</div><div class="meta">Objetivo: ${aluno.objetivo || "-"}${aluno.peso ? " • " + aluno.peso + "kg" : ""}${aluno.altura ? " • " + aluno.altura + "cm" : ""}</div></div><span class="badge">${pct}% hoje</span></header><div class="action-row"><button class="small-btn warning" onclick="abrirMontarTreino('${aluno.id}')">Montar treino</button><button class="small-btn" onclick="abrirProgresso()">Ver progresso</button></div></article>`;
  }).join("");
}

function abrirMontarTreino(alunoId) {
  document.querySelector('[data-page="treino"]').click();
  setTimeout(() => { document.getElementById("selectAluno").value = alunoId; atualizarTreinoAlunoSelecionado(); }, 0);
}
function abrirProgresso(){ document.querySelector('[data-page="progresso"]').click(); }

function salvarExercicioNoTreino() {
  try {
    const alunoId = document.getElementById("selectAluno").value;
    const diaSemana = Number(document.getElementById("diaSemana").value);
    const nomeTreino = document.getElementById("nomeTreino").value.trim();
    const nomeExercicio = document.getElementById("exNome").value.trim();
    const series = numero(document.getElementById("exSeries").value);
    const repeticoes = document.getElementById("exReps").value.trim();
    const carga = document.getElementById("exCarga").value.trim();
    const descanso = document.getElementById("exDescanso").value.trim();
    const observacao = document.getElementById("exObs").value.trim();
    if (!alunoId || !nomeTreino || !nomeExercicio) return setMsg("Selecione aluno, nome do treino e exercício.", "error");
    const treino = salvarOuAtualizarTreino({ professorId:professor.id, alunoId, diaSemana, nome:nomeTreino });
    criarExercicio({ treinoId:treino.id, professorId:professor.id, alunoId, nome:nomeExercicio, series, repeticoes, carga, descanso, observacao });
    ["exNome","exSeries","exReps","exCarga","exDescanso","exObs"].forEach(id => document.getElementById(id).value = "");
    setMsg("Exercício salvo.", "ok");
    carregarTela();
  } catch (err) { setMsg(err.message, "error"); }
}

function atualizarTreinoAlunoSelecionado() {
  const alunoId = document.getElementById("selectAluno")?.value;
  const box = document.getElementById("treinoAlunoSelecionado");
  if (!box || !alunoId) return;
  const treinos = listarTreinosPorAluno(alunoId);
  if (!treinos.length) return box.innerHTML = `<p class="meta">Nenhum treino cadastrado para este aluno.</p>`;
  box.innerHTML = treinos.map(t => {
    const exs = listarExerciciosPorTreino(t.id);
    return `<div class="student-item"><strong>${diaSemanaNome(t.diaSemana)} - ${t.nome}</strong>${exs.length ? `<ul>${exs.map(e => `<li>${e.nome} - ${e.series || 0}x ${e.repeticoes || "-"} ${e.carga ? " • " + e.carga : ""}</li>`).join("")}</ul>` : `<p class="meta">Sem exercícios.</p>`}</div>`;
  }).join("");
}

function carregarProgresso() {
  const alunos = listarAlunosDoProfessor(professor.id);
  const box = document.getElementById("listaProgresso");
  if (!alunos.length) return box.innerHTML = `<p class="meta">Nenhum aluno cadastrado.</p>`;
  box.innerHTML = alunos.map(a => {
    const p = progressoAlunoHoje(a.id);
    const pct = p.totalExercicios ? Math.round((p.concluidosHoje / p.totalExercicios) * 100) : 0;
    return `<div class="student-item"><header><div><strong>${a.nome}</strong><div class="meta">Hoje: ${p.concluidosHoje} de ${p.totalExercicios} exercícios concluídos.</div></div><span class="badge">${pct}%</span></header><div class="progress-bar" style="margin-top:12px"><div style="width:${pct}%"></div></div></div>`;
  }).join("");
}

function resetarSistema() {
  if (!confirm("Tem certeza que deseja apagar todos os dados locais?")) return;
  resetarDadosLocais();
  alert("Dados resetados.");
  window.location.href = "index.html";
}
