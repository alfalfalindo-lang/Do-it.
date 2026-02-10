const modal = document.getElementById("modal");
const novoBtn = document.getElementById("novoBtn");
const criarBtn = document.getElementById("criar");
const fecharModal = document.querySelector(".fechar-modal");
const lista = document.getElementById("listaTarefas");
const postItBtn = document.getElementById("postItBtn");

let corSelecionada = "red";

/* Calendário */
const hoje = new Date();
document.getElementById("dia").innerText = hoje.getDate();
document.getElementById("mes").innerText =
  hoje.toLocaleString("pt-BR", { month: "short" }).toUpperCase();

/* Modal */
novoBtn.onclick = () => modal.style.display = "flex";
fecharModal.onclick = () => modal.style.display = "none";

/* Importância */
document.querySelectorAll(".importancia span").forEach(el => {
  el.onclick = () => corSelecionada = el.dataset.cor;
});

/* Criar tarefa */
criarBtn.onclick = () => {
  const titulo = document.getElementById("titulo").value;
  const data = document.getElementById("data").value;
  if (!titulo) return;

  const tarefa = document.createElement("div");
  tarefa.className = "tarefa";
  tarefa.style.borderColor = corSelecionada;

  tarefa.innerHTML = `
    <div>
      <div>${titulo}</div>
      <small>${data ? new Date(data).toLocaleDateString("pt-BR") : ""}</small>
    </div>
    <input type="checkbox">
  `;

  lista.appendChild(tarefa);
  modal.style.display = "none";
  document.getElementById("titulo").value = "";
};

/* Post-it */
postItBtn.onclick = () => {
  const postit = document.createElement("div");
  postit.className = "postit";
  postit.style.left = "50%";
  postit.style.top = "50%";
  postit.style.transform = "translate(-50%, -50%)";

  postit.innerHTML = `
    <button>×</button>
    <div contenteditable="true" style="margin-top:24px;">Escreva aqui...</div>
  `;

  document.body.appendChild(postit);

  postit.querySelector("button").onclick = () => postit.remove();

  let ox, oy;
  postit.onmousedown = e => {
    ox = e.offsetX;
    oy = e.offsetY;
    document.onmousemove = ev => {
      postit.style.left = ev.pageX - ox + "px";
      postit.style.top = ev.pageY - oy + "px";
      postit.style.transform = "";
    };
  };

  document.onmouseup = () => document.onmousemove = null;
};
