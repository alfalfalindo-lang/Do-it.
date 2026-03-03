document.addEventListener("DOMContentLoaded", () => {

/* ================= ELEMENTOS ================= */

const mesTopo = document.getElementById("mesTopo");
const diaTopo = document.getElementById("diaTopo");
const listaTarefas = document.getElementById("listaTarefas");

const novoBtn = document.getElementById("novoBtn");
const tarefasBtn = document.getElementById("tarefasBtn");
const incompletasBtn = document.getElementById("incompletasBtn");
const metasBtn = document.getElementById("metasBtn");
const notasBtn = document.getElementById("notasBtn");
const postitBtn = document.getElementById("postitBtn");

const modal = document.getElementById("modal");
const modalNotas = document.getElementById("modalNotas");

const titulo = document.getElementById("titulo");
const data = document.getElementById("data");

const cancelar = document.getElementById("cancelar");
const criar = document.getElementById("criar");

const paginaAtual = document.getElementById("paginaAtual");
const numeroPagina = document.getElementById("numeroPagina");
const paginaAnterior = document.getElementById("paginaAnterior");
const proximaPagina = document.getElementById("proximaPagina");
const novaPagina = document.getElementById("novaPagina");

/* ================= ESTADO ================= */

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let metas = JSON.parse(localStorage.getItem("metas")) || [];
let paginas = JSON.parse(localStorage.getItem("paginas")) || [""];
let postits = JSON.parse(localStorage.getItem("postits")) || [];

let modo = "tarefas";
let corSelecionada = "vermelha";
let paginaAtualIndex = 0;

/* ================= SALVAR ================= */

function salvarTudo() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
  localStorage.setItem("metas", JSON.stringify(metas));
  localStorage.setItem("paginas", JSON.stringify(paginas));
  localStorage.setItem("postits", JSON.stringify(postits));
}

/* ================= DATA ================= */

const hoje = new Date();
mesTopo.innerText = hoje.toLocaleDateString("pt-BR", { month: "long" });
diaTopo.innerText = hoje.getDate();

/* ================= MODO ================= */

tarefasBtn.onclick = () => { modo = "tarefas"; renderizar(); };
metasBtn.onclick = () => { modo = "metas"; renderizar(); };
incompletasBtn.onclick = () => { modo = "incompletas"; renderizar(); };

/* ================= MODAL ================= */

novoBtn.onclick = () => modal.style.display = "flex";
cancelar.onclick = () => modal.style.display = "none";
document.querySelector(".fechar").onclick = () => modal.style.display = "none";

/* ================= CORES ================= */

document.querySelectorAll(".cor").forEach(btn => {
  btn.onclick = () => corSelecionada = btn.dataset.cor;
});

/* ================= CRIAR ================= */

criar.onclick = () => {

  if (!titulo.value.trim()) return;

  const nova = {
    titulo: titulo.value,
    data: data.value,
    cor: corSelecionada,
    feita: false
  };

  if (modo === "metas") metas.push(nova);
  else tarefas.push(nova);

  salvarTudo();
  titulo.value = "";
  modal.style.display = "none";
  renderizar();
};

/* ================= RENDER ================= */

function renderizar() {

  listaTarefas.innerHTML = "";

  let listaAtual = [];

  if (modo === "tarefas") listaAtual = tarefas;
  if (modo === "metas") listaAtual = metas;
  if (modo === "incompletas") {
    listaAtual = [
      ...tarefas.filter(t => !t.feita),
      ...metas.filter(m => !m.feita)
    ];
  }

  listaAtual.forEach(item => {

    const div = document.createElement("div");
    div.className = "tarefa";
    if (item.feita) div.classList.add("feita");

    const bolinha = document.createElement("div");
    bolinha.className = "bolinha-tarefa";
    bolinha.style.background =
      item.cor === "vermelha" ? "#ff3b30" :
      item.cor === "amarela" ? "#ffcc00" : "#34c759";

    const texto = document.createElement("div");
    texto.innerHTML = `<strong>${item.titulo}</strong><br><small>${item.data || ""}</small>`;

    div.appendChild(bolinha);
    div.appendChild(texto);

    div.onclick = () => {
      item.feita = !item.feita;
      salvarTudo();
      renderizar();
    };

    listaTarefas.appendChild(div);
  });
}

renderizar();

});
