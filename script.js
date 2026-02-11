const novoBtn = document.getElementById("novoBtn");
const modal = document.getElementById("modal");
const fechar = document.querySelector(".fechar");
const criar = document.getElementById("criar");
const lista = document.getElementById("listaTarefas");

const titulo = document.getElementById("titulo");
const dataSelect = document.getElementById("data");
const importancia = document.getElementById("importancia");

/* Data topo */
const dataAtual = document.getElementById("dataAtual");
const hoje = new Date();
dataAtual.innerText = hoje.toLocaleDateString("pt-BR", {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

/* Popular datas */
for(let i=0;i<30;i++){
  let d = new Date();
  d.setDate(d.getDate()+i);
  let option = document.createElement("option");
  option.value = d.toLocaleDateString();
  option.textContent = d.toLocaleDateString();
  dataSelect.appendChild(option);
}

/* Abrir modal */
novoBtn.onclick = () => modal.style.display = "flex";
fechar.onclick = () => modal.style.display = "none";

/* Criar tarefa */
criar.onclick = () => {

  if(titulo.value === "") return;

  const div = document.createElement("div");
  div.className = "tarefa";
  div.style.borderLeft = `8px solid ${
    importancia.value === "vermelha" ? "#ff3b30" :
    importancia.value === "amarela" ? "#ffcc00" :
    "#34c759"
  }`;

  div.innerHTML = `
    <strong>${titulo.value}</strong>
    <div class="data">${dataSelect.value}</div>
  `;

  div.onclick = () => div.classList.toggle("feita");

  lista.appendChild(div);

  titulo.value = "";
  modal.style.display = "none";
};

/* ===== NOTAS ===== */

const notasBtn = document.getElementById("notasBtn");
const modalNotas = document.getElementById("modalNotas");
const fecharNotas = document.querySelector(".fechar-notas");
const textarea = document.getElementById("paginaAtual");
const numeroPagina = document.getElementById("numeroPagina");

const paginaAnterior = document.getElementById("paginaAnterior");
const proximaPagina = document.getElementById("proximaPagina");
const novaPagina = document.getElementById("novaPagina");

let paginas = [""];
let paginaAtualIndex = 0;

notasBtn.onclick = () => modalNotas.style.display = "flex";
fecharNotas.onclick = () => modalNotas.style.display = "none";

function atualizarPagina() {
  textarea.value = paginas[paginaAtualIndex];
  numeroPagina.innerText = paginaAtualIndex + 1;
}

textarea.oninput = () => {
  paginas[paginaAtualIndex] = textarea.value;
};

paginaAnterior.onclick = () => {
  if (paginaAtualIndex > 0) {
    paginaAtualIndex--;
    atualizarPagina();
  }
};

proximaPagina.onclick = () => {
  if (paginaAtualIndex < paginas.length - 1) {
    paginaAtualIndex++;
    atualizarPagina();
  }
};

novaPagina.onclick = () => {
  paginas.push("");
  paginaAtualIndex = paginas.length - 1;
  atualizarPagina();
};

atualizarPagina();

