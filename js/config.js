const APP_CONFIG = {
  appName: "FitControl",
  storagePrefix: "fitcontrol_local_",
  sessionKey: "fitcontrol_local_session",
  adminKey: "FITCONTROL-ADMIN-2026"
};

/*
FUTURA CONEXÃO COM SUPABASE

const SUPABASE_URL = "COLE_AQUI_SUA_SUPABASE_URL";
const SUPABASE_ANON_KEY = "COLE_AQUI_SUA_SUPABASE_ANON_KEY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
*/

function setMsg(texto, tipo = "") {
  const el = document.getElementById("msg");
  if (!el) return;
  el.textContent = texto;
  el.className = "msg fixed-msg " + tipo;
  if (tipo) setTimeout(() => { el.className = "msg fixed-msg"; el.textContent = ""; }, 2600);
}
function hojeISO(){ return new Date().toISOString().slice(0, 10); }
function diaSemanaAtual(){ return new Date().getDay(); }
function diaSemanaNome(valor){
  const mapa={0:"Domingo",1:"Segunda-feira",2:"Terça-feira",3:"Quarta-feira",4:"Quinta-feira",5:"Sexta-feira",6:"Sábado"};
  return mapa[Number(valor)] || "";
}
function gerarId(prefixo="id"){ return `${prefixo}_${Date.now()}_${Math.floor(Math.random()*99999)}`; }
function numero(valor){ const n=Number(valor); return Number.isFinite(n)?n:0; }
function inicialNome(nome){ return (nome || "?").trim().charAt(0).toUpperCase(); }
function abrirMenu(){
  document.getElementById("drawer")?.classList.add("open");
  document.querySelector(".drawer-backdrop")?.classList.add("show");
}
function fecharMenu(){
  document.getElementById("drawer")?.classList.remove("open");
  document.querySelector(".drawer-backdrop")?.classList.remove("show");
}
