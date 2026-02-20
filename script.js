let tarefas = [];
let metas = [];
let modo = "tarefas";

function adicionar() {
  let texto = document.getElementById("texto").value;
  let prioridade = document.getElementById("prioridade").value;
  let data = document.getElementById("data").value;

  if (texto === "") return;

  let item = {
    texto,
    prioridade,
    data,
    concluida: false
  };

  if (modo === "metas") {
    metas.push(item);
  } else {
    tarefas.push(item);
  }

  document.getElementById("texto").value = "";
  renderizar();
}

function renderizar() {
  let lista = document.getElementById("lista");
  lista.innerHTML = "";

  let array = modo === "metas" ? metas : tarefas;

  array.forEach(item => {
    let div = document.createElement("div");
    div.className = "item";
    if (item.concluida) div.classList.add("done");

    div.innerHTML = `
      ${item.texto}
      <span class="prioridade ${item.prioridade}">
        ${item.prioridade}
      </span>
      ${item.data ? "<small> - " + item.data + "</small>" : ""}
    `;

    div.onclick = () => {
      item.concluida = !item.concluida;

      // Se estiver na aba incompletas e marcar como concluída
      if (modo === "incompletas" && item.concluida) {
        renderizarIncompletas();
      } else {
        renderizar();
      }
    };

    lista.appendChild(div);
  });
}

function mostrarTarefas() {
  modo = "tarefas";
  renderizar();
}

function mostrarMetas() {
  modo = "metas";
  renderizar();
}

function mostrarIncompletas() {
  modo = "incompletas";
  renderizarIncompletas();
}

function renderizarIncompletas() {
  let lista = document.getElementById("lista");
  lista.innerHTML = "";

  tarefas
    .filter(t => !t.concluida)
    .forEach(item => {
      let div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        ${item.texto}
        <span class="prioridade ${item.prioridade}">
          ${item.prioridade}
        </span>
        ${item.data ? "<small> - " + item.data + "</small>" : ""}
      `;

      div.onclick = () => {
        item.concluida = true;
        renderizarIncompletas();
      };

      lista.appendChild(div);
    });
}
