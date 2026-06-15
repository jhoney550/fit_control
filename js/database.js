const DB_KEYS = {
  usuarios: APP_CONFIG.storagePrefix + "usuarios",
  treinos: APP_CONFIG.storagePrefix + "treinos",
  exercicios: APP_CONFIG.storagePrefix + "exercicios",
  execucoes: APP_CONFIG.storagePrefix + "execucoes"
};

const EXERCICIOS_SUGERIDOS = [
  "Supino reto","Supino inclinado","Crucifixo","Peck deck","Tríceps corda","Tríceps testa",
  "Puxada frente","Remada baixa","Remada curvada","Rosca direta","Rosca martelo",
  "Agachamento livre","Leg press","Cadeira extensora","Mesa flexora","Panturrilha em pé",
  "Desenvolvimento","Elevação lateral","Abdominal prancha","Esteira"
];

function dbGet(chave){ return JSON.parse(localStorage.getItem(chave) || "[]"); }
function dbSet(chave, valor){ localStorage.setItem(chave, JSON.stringify(valor)); }

function iniciarDadosDemo(){
  const usuarios = dbGet(DB_KEYS.usuarios);
  if (usuarios.length > 0) return;

  const professorId = gerarId("prof");
  const alunoId = gerarId("aluno");
  const treinoIdHoje = gerarId("treino");
  const treinoIdAmanha = gerarId("treino");

  dbSet(DB_KEYS.usuarios, [
    {id:professorId,tipo:"professor",nome:"Professor Teste",email:"professor@teste.com",senha:"123456",foto:"",criadoEm:hojeISO()},
    {id:alunoId,tipo:"aluno",professorId,nome:"Aluno Teste",email:"aluno@teste.com",senha:"123456",whatsapp:"(66) 99999-9999",objetivo:"Hipertrofia",peso:70,altura:175,foto:"",criadoEm:hojeISO()}
  ]);

  dbSet(DB_KEYS.treinos, [
    {id:treinoIdHoje,professorId,alunoId,diaSemana:diaSemanaAtual(),nome:"Treino de hoje - Peito e tríceps",criadoEm:hojeISO()},
    {id:treinoIdAmanha,professorId,alunoId,diaSemana:(diaSemanaAtual()+1)%7,nome:"Costas e bíceps",criadoEm:hojeISO()}
  ]);

  dbSet(DB_KEYS.exercicios, [
    {id:gerarId("ex"),treinoId:treinoIdHoje,professorId,alunoId,nome:"Supino reto",series:4,repeticoes:"10",carga:"40kg",descanso:"60s",observacao:"Controlar bem a descida.",criadoEm:hojeISO()},
    {id:gerarId("ex"),treinoId:treinoIdHoje,professorId,alunoId,nome:"Supino inclinado",series:3,repeticoes:"12",carga:"30kg",descanso:"60s",observacao:"",criadoEm:hojeISO()},
    {id:gerarId("ex"),treinoId:treinoIdHoje,professorId,alunoId,nome:"Tríceps corda",series:4,repeticoes:"10-12",carga:"25kg",descanso:"45s",observacao:"Abrir a corda no final.",criadoEm:hojeISO()},
    {id:gerarId("ex"),treinoId:treinoIdAmanha,professorId,alunoId,nome:"Puxada frente",series:4,repeticoes:"10",carga:"35kg",descanso:"60s",observacao:"",criadoEm:hojeISO()}
  ]);

  dbSet(DB_KEYS.execucoes, []);
}

function getSessao(){ return JSON.parse(localStorage.getItem(APP_CONFIG.sessionKey) || "null"); }
function setSessao(usuario){ localStorage.setItem(APP_CONFIG.sessionKey, JSON.stringify({id:usuario.id,tipo:usuario.tipo,nome:usuario.nome})); }
function limparSessao(){ localStorage.removeItem(APP_CONFIG.sessionKey); }

function autenticar(email, senha, tipoEsperado){
  return dbGet(DB_KEYS.usuarios).find(u =>
    u.email.toLowerCase() === email.toLowerCase() &&
    u.senha === senha &&
    u.tipo === tipoEsperado
  ) || null;
}

function criarUsuario(usuario){
  const usuarios = dbGet(DB_KEYS.usuarios);
  if (usuarios.some(u => u.email.toLowerCase() === usuario.email.toLowerCase())) {
    throw new Error("Já existe usuário com este e-mail.");
  }
  const novo = {id:gerarId(usuario.tipo),criadoEm:hojeISO(),foto:"",...usuario};
  usuarios.push(novo);
  dbSet(DB_KEYS.usuarios, usuarios);
  return novo;
}

function atualizarUsuario(id, novosDados){
  const usuarios = dbGet(DB_KEYS.usuarios);
  const idx = usuarios.findIndex(u => u.id === id);
  if (idx < 0) throw new Error("Usuário não encontrado.");
  const emailNovo = (novosDados.email || "").toLowerCase();
  if (emailNovo && usuarios.some(u => u.id !== id && u.email.toLowerCase() === emailNovo)) {
    throw new Error("Este e-mail já está em uso.");
  }
  usuarios[idx] = {...usuarios[idx], ...novosDados};
  dbSet(DB_KEYS.usuarios, usuarios);
  return usuarios[idx];
}

function buscarUsuarioPorId(id){ return dbGet(DB_KEYS.usuarios).find(u => u.id === id) || null; }
function listarAlunosDoProfessor(professorId){
  return dbGet(DB_KEYS.usuarios).filter(u => u.tipo === "aluno" && u.professorId === professorId).sort((a,b)=>a.nome.localeCompare(b.nome));
}
function salvarOuAtualizarTreino({ professorId, alunoId, diaSemana, nome }){
  const treinos = dbGet(DB_KEYS.treinos);
  let treino = treinos.find(t => t.alunoId === alunoId && Number(t.diaSemana) === Number(diaSemana));
  if (treino) treino.nome = nome;
  else { treino={id:gerarId("treino"),professorId,alunoId,diaSemana:Number(diaSemana),nome,criadoEm:hojeISO()}; treinos.push(treino); }
  dbSet(DB_KEYS.treinos, treinos);
  return treino;
}
function listarTreinosPorAluno(alunoId){ return dbGet(DB_KEYS.treinos).filter(t=>t.alunoId===alunoId).sort((a,b)=>Number(a.diaSemana)-Number(b.diaSemana)); }
function buscarTreinoPorAlunoDia(alunoId,diaSemana){ return dbGet(DB_KEYS.treinos).find(t=>t.alunoId===alunoId && Number(t.diaSemana)===Number(diaSemana)) || null; }
function criarExercicio(exercicio){
  const exercicios = dbGet(DB_KEYS.exercicios);
  const novo = {id:gerarId("ex"),criadoEm:hojeISO(),...exercicio};
  exercicios.push(novo);
  dbSet(DB_KEYS.exercicios, exercicios);
  return novo;
}
function listarExerciciosPorTreino(treinoId){ return dbGet(DB_KEYS.exercicios).filter(e=>e.treinoId===treinoId); }
function listarExerciciosPorProfessor(professorId){ return dbGet(DB_KEYS.exercicios).filter(e=>e.professorId===professorId); }
function listarExecucoesDoDia(data=hojeISO()){ return dbGet(DB_KEYS.execucoes).filter(e=>e.dataExecucao===data); }
function listarExecucoesAlunoData(alunoId,data=hojeISO()){ return dbGet(DB_KEYS.execucoes).filter(e=>e.alunoId===alunoId && e.dataExecucao===data); }
function listarExecucoesAluno(alunoId){ return dbGet(DB_KEYS.execucoes).filter(e=>e.alunoId===alunoId); }
function alternarExecucao({ professorId, alunoId, treinoId, exercicioId }){
  const execucoes = dbGet(DB_KEYS.execucoes);
  const dataExecucao = hojeISO();
  let execucao = execucoes.find(e => e.alunoId===alunoId && e.exercicioId===exercicioId && e.dataExecucao===dataExecucao);
  if (execucao) execucao.concluido = !execucao.concluido;
  else execucoes.push({id:gerarId("exec"),professorId,alunoId,treinoId,exercicioId,dataExecucao,concluido:true,criadoEm:new Date().toISOString()});
  dbSet(DB_KEYS.execucoes, execucoes);
}
function progressoAlunoHoje(alunoId){
  const treinoHoje = buscarTreinoPorAlunoDia(alunoId, diaSemanaAtual());
  if (!treinoHoje) return {totalExercicios:0, concluidosHoje:0};
  const exercicios = listarExerciciosPorTreino(treinoHoje.id);
  const execucoesHoje = listarExecucoesAlunoData(alunoId, hojeISO()).filter(e=>e.concluido && exercicios.some(ex=>ex.id===e.exercicioId));
  return {totalExercicios:exercicios.length, concluidosHoje:execucoesHoje.length};
}
function resetarDadosLocais(){
  Object.values(DB_KEYS).forEach(k=>localStorage.removeItem(k));
  limparSessao();
  iniciarDadosDemo();
}
