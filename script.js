/* ================= ESTADO ================= */

let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let metas = JSON.parse(localStorage.getItem("metas")) || [];
let paginas = JSON.parse(localStorage.getItem("paginas")) || [""];
let postits = JSON.parse(localStorage.getItem("postits")) || [];

let modo = "tarefas";
let corSelecionada = "vermelha";
let paginaAtualIndex = 0;

/* ======== LIMPAR DADOS CORROMPIDOS ======== */

function limparDadosInvalidos() {
  tarefas = tarefas.filter(t => t && t.titulo);
  metas = metas.filter(m => m && m.titulo);
  postits = postits.filter(p => p && p.top && p.left);
  salvarTudo();
}

limparDadosInvalidos();

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

  if (!titulo.value) return;

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

    if (!item || !item.titulo) return; // proteção extra

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

/* ================= NOTAS ================= */

notasBtn.onclick = () => {
  modalNotas.style.display = "flex";
  paginaAtual.value = paginas[paginaAtualIndex];
  numeroPagina.innerText = paginaAtualIndex + 1;
};

document.querySelector(".fechar-notas").onclick = () => {
  paginas[paginaAtualIndex] = paginaAtual.value;
  salvarTudo();
  modalNotas.style.display = "none";
};

paginaAnterior.onclick = () => {
  if (paginaAtualIndex > 0) {
    paginas[paginaAtualIndex] = paginaAtual.value;
    paginaAtualIndex--;
    paginaAtual.value = paginas[paginaAtualIndex];
    numeroPagina.innerText = paginaAtualIndex + 1;
  }
};

proximaPagina.onclick = () => {
  if (paginaAtualIndex < paginas.length - 1) {
    paginas[paginaAtualIndex] = paginaAtual.value;
    paginaAtualIndex++;
    paginaAtual.value = paginas[paginaAtualIndex];
    numeroPagina.innerText = paginaAtualIndex + 1;
  }
};

novaPagina.onclick = () => {
  paginas[paginaAtualIndex] = paginaAtual.value;
  paginas.push("");
  paginaAtualIndex = paginas.length - 1;
  paginaAtual.value = "";
  numeroPagina.innerText = paginaAtualIndex + 1;
  salvarTudo();
};

/* ================= POST-IT ================= */

function criarPostit(obj) {

  const post = document.createElement("div");
  post.className = "postit";
  post.style.top = obj.top;
  post.style.left = obj.left;

  post.innerHTML = `
    <span class="fechar-post">×</span>
    <textarea>${obj.texto}</textarea>
  `;

  document.body.appendChild(post);

  const textarea = post.querySelector("textarea");

  textarea.oninput = () => {
    obj.texto = textarea.value;
    salvarTudo();
  };

  post.querySelector(".fechar-post").onclick = () => {
    post.remove();
    postits = postits.filter(p => p !== obj);
    salvarTudo();
  };

  let offsetX, offsetY;

  post.onmousedown = function(e) {
    offsetX = e.clientX - post.offsetLeft;
    offsetY = e.clientY - post.offsetTop;

    document.onmousemove = function(e) {
      post.style.left = (e.clientX - offsetX) + "px";
      post.style.top = (e.clientY - offsetY) + "px";
      obj.left = post.style.left;
      obj.top = post.style.top;
      salvarTudo();
    };

    document.onmouseup = function() {
      document.onmousemove = null;
    };
  };
}

postitBtn.onclick = () => {
  const novo = {
    top: "150px",
    left: "350px",
    texto: ""
  };

  postits.push(novo);
  salvarTudo();
  criarPostit(novo);
};

postits.forEach(p => criarPostit(p));
