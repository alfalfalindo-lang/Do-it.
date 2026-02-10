let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let postits = JSON.parse(localStorage.getItem("postits")) || [];
let filtroAtual = "todas";

const lista = document.getElementById("lista");
const resumo = document.getElementById("resumo");

const hoje = new Date();
document.getElementById("dia").innerText = hoje.getDate();
document.getElementById("mes").innerText =
  hoje.toLocaleString("pt-BR", { month: "short" }).toUpperCase();

tarefas.forEach(t => {
  if (!t.feita && t.data < hoje.toISOString().split("T")[0]) {
    t.atrasada = true;
  }
});

render();
renderPostIts();

function novaTarefa() {
  const texto = prompt("O que fazer?");
  const tipo = prompt("importante / medio / leve");
  const data = prompt("Data (YYYY-MM-DD)");

  tarefas.push({ texto, tipo, data, feita: false, atrasada: false });
  salvar();
  render();
}

function render() {
  lista.innerHTML = "";
  let feitas = 0;

  tarefas.forEach(t => {
    if (filtroAtual === "incompletas" && !t.atrasada) return;

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

    div.appendChild(ball);
    div.appendChild(document.createTextNode(t.texto));
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

/* Post-its */
function novoPostIt() {
  const texto = prompt("Texto do post-it:");
  if (!texto) return;

  postits.push({ texto, x: 300, y: 300 });
  salvarPostIts();
  renderPostIts();
}

function renderPostIts() {
  document.querySelectorAll(".postit").forEach(p => p.remove());

  postits.forEach((p, i) => {
    const div = document.createElement("div");
    div.className = "postit";
    div.style.left = p.x + "px";
    div.style.top = p.y + "px";
    div.innerHTML = `<span class="close">×</span>${p.texto}`;

    div.querySelector(".close").onclick = () => {
      postits.splice(i, 1);
      salvarPostIts();
      renderPostIts();
    };

    div.onmousedown = e => {
      const dx = e.clientX - div.offsetLeft;
      const dy = e.clientY - div.offsetTop;

      document.onmousemove = ev => {
        div.style.left = ev.clientX - dx + "px";
        div.style.top = ev.clientY - dy + "px";
        p.x = ev.clientX - dx;
        p.y = ev.clientY - dy;
      };

      document.onmouseup = () => {
        document.onmousemove = null;
        salvarPostIts();
      };
    };

    document.body.appendChild(div);
  });
}

function salvarPostIts() {
  localStorage.setItem("postits", JSON.stringify(postits));
}

