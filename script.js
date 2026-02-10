
const modal = document.getElementById("modal");
const novoBtn = document.getElementById("novoBtn");
const criarBtn = document.getElementById("criar");
const lista = document.getElementById("listaTarefas");
const postItBtn = document.getElementById("postItBtn");

let corSelecionada = "red";

/* Calendário */
const hoje = new Date();
document.getElementById("dia").innerText = hoje.getDate();
document.getElementById("mes").innerText =
  hoje.toLocaleString("pt-BR", { month: "short" }).toUpperCase();

/* Abrir modal */
novoBtn.onclick = () => modal.style.display = "flex";

/* Importância */
document.querySelectorAll(".importancia span").forEach(b => {
  b.onclick = () => corSelecionada = b.dataset.cor;
});

/* Criar tarefa */
criarBtn.onclick = () => {
  const titulo = document.getElementById("titulo").value;
  if (!titulo) return;

  const tarefa = document.createElement("div");
  tarefa.className = "tarefa";
  tarefa.style.borderColor = corSelecionada;
  tarefa.innerHTML = `<span>${titulo}</span><input type="checkbox">`;

  lista.appendChild(tarefa);
  modal.style.display = "none";
  document.getElementById("titulo").value = "";
};

/* Criar Post-it */
postItBtn.onclick = () => {
  const postit = document.createElement("div");
  postit.className = "postit";
  postit.contentEditable = true;
  postit.style.left = "50%";
  postit.style.top = "50%";

  document.body.appendChild(postit);

  let offsetX, offsetY;
  postit.onmousedown = e => {
    offsetX = e.offsetX;
    offsetY = e.offsetY;
    document.onmousemove = ev => {
      postit.style.left = ev.pageX - offsetX + "px";
      postit.style.top = ev.pageY - offsetY + "px";
    };
  };

  document.onmouseup = () => document.onmousemove = null;
};
