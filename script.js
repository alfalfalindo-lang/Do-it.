let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let postits = JSON.parse(localStorage.getItem("postits")) || [];
let filtroAtual = "todas";

const lista = document.getElementById("lista");
const resumo = document.getElementById("resumo");

const hoje = new Date().toISOString().split("T")[0];

/* marca atrasadas */
tarefas.forEach(t => {
  if (!t.feita && t.data < hoje) t.atrasada = true;
});

render();
renderPostIts();

/* criar tarefa pela bolinha */
function novaTarefa(tipo) {
  const texto = prompt("O que você quer fazer?");
  if (!texto) return;

  const data = prompt("Data (YYYY-MM-DD)");

  tarefas.push({
    texto,
    tipo,
    data,
    feita: false,
    atrasada: false
  });

  salvar();
  render();
}

function render() {
  lista.innerHTML = "";
  let feitas = 0;

  tarefas.forEach(t => {
    if (filtroAtual === "incompletas" && !t.atrasada) return;
    if (filtroAtual === "mes" && t.data.slice(0,7) !== hoje.slice(0,7)) return;

    const div = document.createElement("div");
    div.className = "task";
    if (t.feita) div.classList.add("done");

    if (t.tipo === "importante") div.classList.add("red");
    else if (t.tipo === "medio") div.classList.add("yellow");
    else div.classList.add("green");

    const ball = document.createElement("div");
    ball.className = "ball";
    if (t.feita) ball.classList.add("done");

    ball.onclick = () => {
      t.feita = !t.feita;
      salvar();
      render();
    };

    const text = document.createElement("span");
    text.innerText = t.texto;

    const date = document.createElement("span");
    date.className = "date";
    date.innerText = t.data;

    div.appendChild(ball);
    div.appendChild(text);
    div.appendChild(date);

    lista.appendChild(div);

    if (t.feita) feitas++;
  });

  resumo.innerText = `✔ ${feitas} / ${tarefas.length}`;
}

function filtro(f) {
  filtroAtual = f;
  render();
}

function salvar() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

/* post-its continuam iguais */
