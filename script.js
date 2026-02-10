const modal = document.getElementById("modal");
const novoBtn = document.getElementById("novoBtn");
const criarBtn = document.getElementById("criar");
const lista = document.getElementById("listaTarefas");

let corSelecionada = "red";

// Data estilo calendário Apple
const hoje = new Date();
document.getElementById("dia").innerText = hoje.getDate();
document.getElementById("mes").innerText =
  hoje.toLocaleString("pt-BR", { month: "short" }).toUpperCase();

// Abrir modal
novoBtn.onclick = () => modal.style.display = "flex";

// Escolher importância
document.querySelectorAll(".importancia button").forEach(btn => {
  btn.onclick = () => corSelecionada = btn.dataset.cor;
});

// Criar tarefa
criarBtn.onclick = () => {
  const titulo = document.getElementById("titulo").value;
  if (!titulo) return;

  const tarefa = document.createElement("div");
  tarefa.className = "tarefa";
  tarefa.style.borderColor = corSelecionada;

  tarefa.innerHTML = `
    <span>${titulo}</span>
    <input type="checkbox">
  `;

  tarefa.querySelector("input").onclick = () => {
    tarefa.classList.toggle("feita");
  };

  lista.appendChild(tarefa);

  modal.style.display = "none";
  document.getElementById("titulo").value = "";
};

 
 
