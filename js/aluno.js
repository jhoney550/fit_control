iniciarDadosDemo();

let sessao = null;
let aluno = null;
let treinoHoje = null;
let exerciciosHoje = [];
let execucoesHoje = [];

document.addEventListener("DOMContentLoaded", iniciarAluno);

function iniciarAluno() {
  sessao = getSessao();
  if (!sessao) return window.location.href = "index.html";
  aluno = buscarUsuarioPorId(sessao.id);
  if (!aluno || aluno.tipo !== "aluno") return window.location.href = "index.html";

  prepararNavegacaoAluno();
  preencherPerfilAluno();
  carregarTudoAluno();
}

function prepararNavegacaoAluno() {
  document.querySelectorAll(".drawer-link").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".drawer-link").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("page-" + btn.dataset.page).classList.add("active");
      fecharMenu();
      carregarTudoAluno();
    });
  });
}

function sair(){ limparSessao(); window.location.href="index.html"; }

function preencherPerfilAluno() {
  aluno = buscarUsuarioPorId(aluno.id);
  document.getElementById("alunoNomeTopo").textContent = aluno.nome;
  document.getElementById("drawerAlunoNome").textContent = aluno.nome;
  document.getElementById("alunoPerfilNome").value = aluno.nome || "";
  document.getElementById("alunoPerfilEmail").value = aluno.email || "";
  document.getElementById("alunoPerfilWhatsapp").value = aluno.whatsapp || "";
  document.getElementById("alunoPerfilPeso").value = aluno.peso || "";
  document.getElementById("alunoPerfilAltura").value = aluno.altura || "";
  document.getElementById("alunoAvatarPreview").textContent = inicialNome(aluno.nome);
}

function salvarPerfilAluno() {
  try {
    const dados = {
      nome: document.getElementById("alunoPerfilNome").value.trim(),
      email: document.getElementById("alunoPerfilEmail").value.trim(),
      whatsapp: document.getElementById("alunoPerfilWhatsapp").value.trim(),
      peso: numero(document.getElementById("alunoPerfilPeso").value),
      altura: numero(document.getElementById("alunoPerfilAltura").value)
    };
    const senha = document.getElementById("alunoPerfilSenha").value;
    if (senha) dados.senha = senha;
    if (!dados.nome || !dados.email) return setMsg("Nome e e-mail são obrigatórios.", "error");
    aluno = atualizarUsuario(aluno.id, dados);
    setSessao(aluno);
    preencherPerfilAluno();
    setMsg("Perfil atualizado.", "ok");
  } catch (err) { setMsg(err.message, "error"); }
}

function carregarTudoAluno() {
  aluno = buscarUsuarioPorId(aluno.id);
  carregarTreinoHoje();
  carregarSemana();
  carregarHistorico();
}

function carregarTreinoHoje() {
  const dia = diaSemanaAtual();
  treinoHoje = buscarTreinoPorAlunoDia(aluno.id, dia);
  const box = document.getElementById("treinoHoje");
  if (!treinoHoje) {
    document.getElementById("subtituloTreino").textContent = `${diaSemanaNome(dia)} sem treino cadastrado.`;
    box.innerHTML = `<p class="meta">Seu professor ainda não cadastrou treino para hoje.</p>`;
    atualizarProgresso(0, 0);
    return;
  }

  document.getElementById("subtituloTreino").textContent = `${diaSemanaNome(dia)} - ${treinoHoje.nome}`;
  exerciciosHoje = listarExerciciosPorTreino(treinoHoje.id);
  execucoesHoje = listarExecucoesAlunoData(aluno.id, hojeISO());

  if (!exerciciosHoje.length) {
    box.innerHTML = `<p class="meta">Treino cadastrado, mas sem exercícios.</p>`;
    atualizarProgresso(0, 0);
    return;
  }

  box.innerHTML = exerciciosHoje.map(ex => {
    const feito = execucoesHoje.some(e => e.exercicioId === ex.id && e.concluido);
    return `<article class="exercise-item ${feito ? "done" : ""}"><header><div><strong>${ex.nome}</strong><div class="meta">${ex.series || 0} séries • ${ex.repeticoes || "-"} repetições${ex.carga ? " • Carga: " + ex.carga : ""}${ex.descanso ? " • Descanso: " + ex.descanso : ""}</div>${ex.observacao ? `<div class="meta">Obs: ${ex.observacao}</div>` : ""}</div><span class="badge ${feito ? "" : "pending"}">${feito ? "Feito" : "Pendente"}</span></header><div class="action-row"><button class="small-btn ${feito ? "" : "success"}" onclick="marcarExercicio('${ex.id}')">${feito ? "Desmarcar" : "Marcar como feito"}</button></div></article>`;
  }).join("");

  const feitos = exerciciosHoje.filter(ex => execucoesHoje.some(e => e.exercicioId === ex.id && e.concluido)).length;
  atualizarProgresso(feitos, exerciciosHoje.length);
}

function atualizarProgresso(feitos, total) {
  const percentual = total ? Math.round((feitos / total) * 100) : 0;
  document.getElementById("progressoTexto").textContent = `${feitos} de ${total} exercícios`;
  document.getElementById("progressoPercentual").textContent = `${percentual}%`;
  document.getElementById("progressoBarra").style.width = `${percentual}%`;
}

function marcarExercicio(exercicioId) {
  const ex = exerciciosHoje.find(e => e.id === exercicioId);
  if (!ex || !treinoHoje) return;
  alternarExecucao({ professorId:ex.professorId, alunoId:aluno.id, treinoId:treinoHoje.id, exercicioId });
  carregarTudoAluno();
}

function carregarSemana() {
  const box = document.getElementById("semanaAluno");
  const treinos = listarTreinosPorAluno(aluno.id);
  if (!treinos.length) return box.innerHTML = `<p class="meta">Nenhum treino semanal cadastrado.</p>`;
  const dias = [1,2,3,4,5,6,0];
  box.innerHTML = dias.map(dia => {
    const treino = treinos.find(t => Number(t.diaSemana) === dia);
    if (!treino) return `<div class="week-item"><div><strong>${diaSemanaNome(dia)}</strong><div class="meta">Sem treino cadastrado</div></div><span class="badge neutral">Livre</span></div>`;
    const qtd = listarExerciciosPorTreino(treino.id).length;
    return `<div class="week-item"><div><strong>${diaSemanaNome(dia)} - ${treino.nome}</strong><div class="meta">${qtd} exercício(s)</div></div><span class="badge">Treino</span></div>`;
  }).join("");
}

function carregarHistorico() {
  const box = document.getElementById("historicoAluno");
  const execucoes = listarExecucoesAluno(aluno.id).filter(e => e.concluido);
  if (!execucoes.length) return box.innerHTML = `<p class="meta">Nenhum exercício concluído ainda.</p>`;
  const agrupado = {};
  execucoes.forEach(e => { agrupado[e.dataExecucao] = (agrupado[e.dataExecucao] || 0) + 1; });
  box.innerHTML = Object.entries(agrupado).sort((a,b)=>b[0].localeCompare(a[0])).map(([data,qtd]) => `<div class="history-item"><div><strong>${data}</strong><div class="meta">${qtd} exercício(s) concluído(s)</div></div><span class="badge">Feito</span></div>`).join("");
}
