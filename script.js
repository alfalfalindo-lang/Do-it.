```javascript
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let metas   = JSON.parse(localStorage.getItem("metas"))   || [];
let arquivo = JSON.parse(localStorage.getItem("arquivo")) || [];
let notas   = JSON.parse(localStorage.getItem("notas"))   || [""];
let postits = JSON.parse(localStorage.getItem("postits")) || [];

let modo           = "tarefas";
let corSelecionada = "#ff5f57";
let catSelecionada = "trabalho";
let filtroCat      = "todas";
let filtroCor      = "todas";
let paginaNotas    = 0;
let dragIdx        = null;
let dataSelecionada = null;
let calMes, calAno;

/* ── CALENDÁRIO FULL ── */
let calFullMes, calFullAno, calFullView = "mes";
const hoje = new Date();

/* ── DATA TOPO ── */
calMes = hoje.getMonth();
calAno = hoje.getFullYear();
calFullMes = hoje.getMonth();
calFullAno = hoje.getFullYear();

document.getElementById("mesTopo").innerText =
  hoje.toLocaleDateString("pt-BR",{month:"long"});

document.getElementById("diaTopo").innerText =
  hoje.getDate();

/* ── SALVAR ── */
function salvar(){
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
  localStorage.setItem("metas", JSON.stringify(metas));
  localStorage.setItem("arquivo", JSON.stringify(arquivo));
  localStorage.setItem("notas", JSON.stringify(notas));
  localStorage.setItem("postits", JSON.stringify(postits));
}

/* ── BADGES ── */
function atualizarBadges(){
  document.getElementById("badgeTarefas").innerText = tarefas.length || "";
  document.getElementById("badgeMetas").innerText   = metas.length || "";
  document.getElementById("badgeArquivo").innerText = arquivo.length || "";
}

/* ── RENDER ── */
function render(){

  const lista = document.getElementById("listaTarefas");
  lista.innerHTML = "";

  atualizarBadges();

  if(modo === "arquivo"){
    renderArquivo(lista);
    return;
  }

  const fonte = modo === "metas" ? metas : tarefas;

  const busca = document
    .getElementById("campoBusca")
    .value
    .toLowerCase()
    .trim();

  let filtradas = fonte.filter((t,i)=>{

    t._idx = i;

    return (
      (filtroCat === "todas" || t.cat === filtroCat) &&
      (filtroCor === "todas" || t.cor === filtroCor) &&
      (!busca || t.titulo.toLowerCase().includes(busca))
    );
  });

  if(!filtradas.length){
    lista.innerHTML =
      `<div class="empty-state">nenhuma tarefa encontrada.</div>`;
    return;
  }

  filtradas.forEach(t=>{
    lista.appendChild(criarElementoTarefa(t, fonte));
  });

  /* atualiza calendário instantaneamente */
  if(calFullOverlay.classList.contains("aberto")){
    renderCalFull();
  }
}

/* ── ELEMENTO TAREFA ── */
function criarElementoTarefa(t, fonte){

  const div = document.createElement("div");

  div.className = "tarefa";
  div.draggable = true;
  div.dataset.idx = t._idx;

  const cats = {
    trabalho:"💼 trabalho",
    estudo:"📚 estudo",
    pessoal:"🏠 pessoal"
  };

  const dataLabel = t.data
    ? `<span class="tarefa-data">${t.data}</span>`
    : "";

  const horaLabel = t.hora
    ? `<span class="tarefa-hora">⏰ ${t.hora}</span>`
    : "";

  const catLabel = t.cat
    ? `<span class="tarefa-cat">${cats[t.cat] || ""}</span>`
    : "";

  const recLabel = t.recorrente
    ? `<span class="tarefa-recorrente">↻ ${t.frequencia}</span>`
    : "";

  const diasLabel =
    t.dias && t.dias.length
      ? `<span class="tarefa-dias">${t.dias.join(" · ")}</span>`
      : "";

  div.innerHTML = `
    <div class="bolinha" style="background:${t.cor}"></div>

    <div class="tarefa-info">
      <div class="tarefa-titulo">${t.titulo}</div>

      <div class="tarefa-meta">
        ${dataLabel}
        ${horaLabel}
        ${catLabel}
        ${recLabel}
        ${diasLabel}
      </div>
    </div>

    <button class="concluir-btn">✓</button>
  `;

  /* concluir */
  div.querySelector(".concluir-btn").onclick = e => {

    e.stopPropagation();

    div.classList.add("concluindo");

    setTimeout(()=>{

      const i = fonte.indexOf(t);

      if(i > -1){
        fonte.splice(i,1);
      }

      arquivo.unshift({
        ...t,
        arquivadoEm:new Date().toISOString()
      });

      salvar();
      render();

    },480);
  };

  /* drag */
  div.addEventListener("dragstart",()=>{

    dragIdx = Number(div.dataset.idx);

    setTimeout(()=>{
      div.classList.add("dragging");
    },0);

  });

  div.addEventListener("dragend",()=>{

    div.classList.remove("dragging");

    document
      .querySelectorAll(".drag-over")
      .forEach(el=>el.classList.remove("drag-over"));

    dragIdx = null;
  });

  div.addEventListener("dragover",e=>{

    e.preventDefault();

    if(
      dragIdx === null ||
      dragIdx === Number(div.dataset.idx)
    ) return;

    document
      .querySelectorAll(".drag-over")
      .forEach(el=>el.classList.remove("drag-over"));

    div.classList.add("drag-over");
  });

  div.addEventListener("drop",e=>{

    e.preventDefault();

    const toIdx = Number(div.dataset.idx);

    if(dragIdx === null || dragIdx === toIdx) return;

    const item = fonte.splice(dragIdx,1)[0];

    fonte.splice(toIdx,0,item);

    salvar();
    render();
  });

  return div;
}

/* ── ARQUIVO ── */
function renderArquivo(lista){

  if(!arquivo.length){

    lista.innerHTML =
      `<div class="empty-state">arquivo vazio.</div>`;

    return;
  }

  const label = document.createElement("div");

  label.className = "secao-label";
  label.innerText = "concluídas";

  lista.appendChild(label);

  arquivo.forEach(t=>{

    const div = document.createElement("div");

    div.className = "tarefa arquivo-item";

    div.innerHTML = `
      <div class="bolinha" style="background:${t.cor}"></div>

      <div class="tarefa-info">
        <div class="tarefa-titulo">${t.titulo}</div>

        <div class="tarefa-meta">
          ${t.cat ? `<span class="tarefa-cat">${t.cat}</span>` : ""}
        </div>
      </div>
    `;

    lista.appendChild(div);
  });
}

/* ── MODOS ── */
document.getElementById("tarefasBtn").onclick =
  ()=>setModo("tarefas");

document.getElementById("metasBtn").onclick =
  ()=>setModo("metas");

document.getElementById("arquivoBtn").onclick =
  ()=>setModo("arquivo");

document.getElementById("calendarioBtn").onclick =
  ()=>abrirCalendarioFull();

function setModo(m){

  modo = m;

  document
    .querySelectorAll(".sidebar-btn")
    .forEach(b=>b.classList.remove("active"));

  const map = {
    tarefas:"tarefasBtn",
    metas:"metasBtn",
    arquivo:"arquivoBtn"
  };

  if(map[m]){
    document.getElementById(map[m]).classList.add("active");
  }

  render();
}

/* ── FILTROS ── */
document.querySelectorAll(".filtro-btn").forEach(btn=>{

  btn.onclick = ()=>{

    filtroCat = btn.dataset.cat;

    document
      .querySelectorAll(".filtro-btn")
      .forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");

    render();
  };
});

document.querySelectorAll(".filtro-cor-btn").forEach(btn=>{

  btn.onclick = ()=>{

    filtroCor = btn.dataset.filtrocor;

    document
      .querySelectorAll(".filtro-cor-btn")
      .forEach(b=>b.classList.remove("active"));

    btn.classList.add("active");

    render();
  };
});

document
  .getElementById("campoBusca")
  .addEventListener("input", render);

/* ── CRIAR ── */
document.getElementById("criar").onclick = ()=>{

  const titulo =
    document.getElementById("titulo").value.trim();

  if(!titulo) return;

  const h = document
    .getElementById("horaInput")
    .value
    .padStart(2,"0");

  const m = document
    .getElementById("minInput")
    .value
    .padStart(2,"0");

  const hora =
    (
      document.getElementById("horaInput").value &&
      document.getElementById("minInput").value
    )
      ? `${h}:${m}`
      : null;

  const diasAtivos =
    [...document.querySelectorAll(".dia-btn.ativo")]
      .map(b=>b.dataset.dia);

  const recorrente =
    document.getElementById("recorrenteCheck").checked;

  const obj = {

    titulo,

    cor:corSelecionada,

    cat:catSelecionada,

    data:
      document.getElementById("dataDisplay").value || null,

    hora,

    dias:diasAtivos,

    recorrente,

    frequencia:recorrente
      ? document.getElementById("frequencia").value
      : null
  };

  if(modo === "metas"){
    metas.push(obj);
  } else {
    tarefas.push(obj);
  }

  salvar();
  render();

  /* calendário instantâneo */
  renderCalFull();

  document.getElementById("titulo").value = "";
  document.getElementById("dataDisplay").value = "";
  document.getElementById("horaInput").value = "";
  document.getElementById("minInput").value = "";

  dataSelecionada = null;

  document
    .querySelectorAll(".dia-btn")
    .forEach(b=>b.classList.remove("ativo"));

  document.getElementById("recorrenteCheck").checked = false;

  document
    .getElementById("recorrenteOpcoes")
    .classList.add("hidden");

  fecharModal();
};

/* ── MODAL ── */
document.getElementById("novoBtn").onclick = ()=>{

  if(modo !== "arquivo"){
    document.getElementById("modal").style.display = "flex";
  }
};

document.getElementById("fecharModal").onclick =
  ()=>fecharModal();

function fecharModal(){

  document.getElementById("modal").style.display = "none";
}

/* ── CALENDÁRIO ── */

const calFullOverlay =
  document.getElementById("calFullOverlay");

const MESES_PT = [
  "janeiro","fevereiro","março","abril",
  "maio","junho","julho","agosto",
  "setembro","outubro","novembro","dezembro"
];

const DIAS_CURTOS = [
  "dom","seg","ter","qua","qui","sex","sáb"
];

function tarefasNoDia(d,m,a){

  const dd = String(d).padStart(2,"0");

  const mm = String(m+1).padStart(2,"0");

  const dataStr = `${dd}/${mm}/${a}`;

  return [...tarefas, ...metas]
    .filter(t=>t.data === dataStr);
}

function isHoje(d,m,a){

  return (
    d === hoje.getDate() &&
    m === hoje.getMonth() &&
    a === hoje.getFullYear()
  );
}

function abrirCalendarioFull(){

  calFullOverlay.classList.add("aberto");

  document
    .querySelectorAll(".sidebar-btn")
    .forEach(b=>b.classList.remove("active"));

  document
    .getElementById("calendarioBtn")
    .classList.add("active");

  renderCalFull();
}

document.getElementById("calFullFechar").onclick = ()=>{

  calFullOverlay.classList.remove("aberto");

  document
    .getElementById("calendarioBtn")
    .classList.remove("active");
};

function renderCalFull(){

  document.getElementById("calFullTitle").textContent =
    `${MESES_PT[calFullMes]} ${calFullAno}`;

  const body =
    document.getElementById("calFullBody");

  body.innerHTML = "";

  body.className = "cal-full-body cal-mes-view";

  const primeiroDia =
    new Date(calFullAno,calFullMes,1).getDay();

  const totalDias =
    new Date(calFullAno,calFullMes+1,0).getDate();

  const cabecalho = document.createElement("div");

  cabecalho.className = "cal-mes-cabecalho";

  DIAS_CURTOS.forEach(d=>{

    const el = document.createElement("div");

    el.className = "cal-mes-label-dia";

    el.textContent = d;

    cabecalho.appendChild(el);
  });

  body.appendChild(cabecalho);

  const grid = document.createElement("div");

  grid.className = "cal-mes-grid";

  for(let i=0;i<primeiroDia;i++){

    const vazio = document.createElement("div");

    vazio.className = "cal-cel cal-cel-inativo";

    grid.appendChild(vazio);
  }

  for(let d=1; d<=totalDias; d++){

    const cel = document.createElement("div");

    cel.className =
      "cal-cel" +
      (isHoje(d,calFullMes,calFullAno)
        ? " cal-cel-hoje"
        : "");

    const num = document.createElement("div");

    num.className = "cal-cel-num";

    num.textContent = d;

    cel.appendChild(num);

    const tarefasDia =
      tarefasNoDia(d,calFullMes,calFullAno);

    tarefasDia.forEach(t=>{

      const chip = document.createElement("div");

      chip.className = "cal-chip";

      chip.style.borderLeft =
        `3px solid ${t.cor}`;

      chip.textContent = t.titulo;

      cel.appendChild(chip);
    });

    cel.onclick = ()=>{
      abrirModalComData(d,calFullMes,calFullAno);
    };

    grid.appendChild(cel);
  }

  body.appendChild(grid);
}

function abrirModalComData(d,m,a,hora){

  const dd = String(d).padStart(2,"0");

  const mm = String(m+1).padStart(2,"0");

  document.getElementById("dataDisplay").value =
    `${dd}/${mm}/${a}`;

  dataSelecionada = {d,m,a};

  calMes = m;
  calAno = a;

  if(hora !== undefined){

    document.getElementById("horaInput").value =
      String(hora).padStart(2,"0");

    document.getElementById("minInput").value =
      "00";
  }

  document.getElementById("modal").style.display =
    "flex";
}

/* ── NAVEGAÇÃO CALENDÁRIO ── */

document.getElementById("calFullPrev").onclick = ()=>{

  calFullMes--;

  if(calFullMes < 0){
    calFullMes = 11;
    calFullAno--;
  }

  renderCalFull();
};

document.getElementById("calFullNext").onclick = ()=>{

  calFullMes++;

  if(calFullMes > 11){
    calFullMes = 0;
    calFullAno++;
  }

  renderCalFull();
};

document.getElementById("calFullHoje").onclick = ()=>{

  calFullMes = hoje.getMonth();

  calFullAno = hoje.getFullYear();

  renderCalFull();
};

/* ── NOTAS ── */

function atualizarNotas(){

  document.getElementById("paginaAtual").value =
    notas[paginaNotas] || "";

  document.getElementById("paginaInfo").innerText =
    `página ${paginaNotas+1} / ${notas.length}`;
}

document.getElementById("notasBtn").onclick = ()=>{

  document.getElementById("modalNotas").style.display =
    "flex";

  atualizarNotas();
};

document.querySelector(".fechar-notas").onclick = ()=>{

  notas[paginaNotas] =
    document.getElementById("paginaAtual").value;

  salvar();

  document.getElementById("modalNotas").style.display =
    "none";
};

document
  .getElementById("paginaAtual")
  .addEventListener("input",()=>{

    notas[paginaNotas] =
      document.getElementById("paginaAtual").value;

    salvar();
  });

document.getElementById("paginaAnterior").onclick = ()=>{

  notas[paginaNotas] =
    document.getElementById("paginaAtual").value;

  if(paginaNotas > 0){

    paginaNotas--;

    atualizarNotas();
  }
};

document.getElementById("proximaPagina").onclick = ()=>{

  notas[paginaNotas] =
    document.getElementById("paginaAtual").value;

  if(paginaNotas < notas.length - 1){

    paginaNotas++;

    atualizarNotas();
  }
};

document.getElementById("novaPagina").onclick = ()=>{

  notas[paginaNotas] =
    document.getElementById("paginaAtual").value;

  notas.push("");

  paginaNotas = notas.length - 1;

  salvar();

  atualizarNotas();
};

/* ── INIT ── */
render();
```

