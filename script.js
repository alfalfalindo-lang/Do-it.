const lista = document.getElementById("lista");
let tarefas = [];
let filtroAtual = "todas";

function novaTarefa() {
  const texto = prompt("O que você quer fazer?");
  if (!texto) return;

  const tipo = prompt("Importância: importante / medio / leve");
  const data = prompt("Data (ex: 03/2026)");

  const tarefa = {
    texto,
    tipo,
    data,
    feita: false
  };

  tarefas.push(tarefa);
  render();
}

function render() {
  lista.innerHTML = "";

  tarefas.forEach((tarefa, index) => {
    if (filtroAtual === "incompletas" && tarefa.feita) return;

    const task = document.createElement("div");
    task.className = "task";

    if (tarefa.tipo === "importante") task.classList.add("red");
    else if (tarefa.tipo === "medio") task.classList.add("yellow");
    else task.classList.add("green");

    if (tarefa.feita) task.classList.add("done");

    const ball = document.createElement("div");
    ball.className = "ball";
    if (tarefa.feita) ball.classList.add("done");

    ball.onclick = () => {
      tarefa.feita = !tarefa.feita;
      render();
    };

    const text = document.createElement("span");
    text.innerText = tarefa.texto;

    const date = document.createElement("span");
    date.className = "date";
    date.innerText = tarefa.data;

    task.appendChild(ball);
    task.appendChild(text);
    task.appendChild(date);

    lista.appendChild(task);
  });
}

function filtro(tipo) {
  filtroAtual = tipo;
  render();
}

