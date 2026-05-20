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
document.getElementById("mesTopo").innerText = hoje.toLocaleDateString("pt-BR",{month:"long"});
document.getElementById("diaTopo").innerText = hoje.getDate();

/* ── SALVAR ── */
function salvar(){
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
  localStorage.setItem("metas",   JSON.stringify(metas));
  localStorage.setItem("arquivo", JSON.stringify(arquivo));
  localStorage.setItem("notas",   JSON.stringify(notas));
  localStorage.setItem("postits", JSON.stringify(postits));
}

/* ── BADGES ── */
function atualizarBadges(){
  document.getElementById("badgeTarefas").innerText = tarefas.length || "";
  document.getElementById("badgeMetas").innerText   = metas.length   || "";
  document.getElementById("badgeArquivo").innerText = arquivo.length  || "";
}

/* ── RENDER TAREFAS ── */
function render(){
  const lista = document.getElementById("listaTarefas");
  lista.innerHTML = "";
  atualizarBadges();
  if(modo === "arquivo"){ renderArquivo(lista); return; }
  const fonte = modo === "metas" ? metas : tarefas;
  const busca = document.getElementById("campoBusca").value.toLowerCase().trim();
  let filtradas = fonte.filter((t,i) => {
    t._idx = i;
    return (filtroCat==="todas"||t.cat===filtroCat) &&
           (filtroCor==="todas"||t.cor===filtroCor) &&
           (!busca||t.titulo.toLowerCase().includes(busca));
  });
  if(!filtradas.length){ lista.innerHTML=`<div class="empty-state">nenhuma tarefa encontrada.</div>`; return; }
  filtradas.forEach(t => lista.appendChild(criarElementoTarefa(t, fonte)));
}

function criarElementoTarefa(t, fonte){
  const div = document.createElement("div");
  div.className = "tarefa";
  div.draggable = true;
  div.dataset.idx = t._idx;
  const cats = {trabalho:"💼 trabalho", estudo:"📚 estudo", pessoal:"🏠 pessoal"};
  const dataLabel = t.data ? `<span class="tarefa-data">${t.data}</span>` : "";
  const horaLabel = t.hora ? `<span class="tarefa-hora">⏰ ${t.hora}</span>` : "";
  const catLabel  = t.cat  ? `<span class="tarefa-cat">${cats[t.cat]||""}</span>` : "";
  const recLabel  = t.recorrente ? `<span class="tarefa-recorrente">↻ ${t.frequencia}</span>` : "";
  const diasLabel = t.dias && t.dias.length ? `<span class="tarefa-dias">${t.dias.join(" · ")}</span>` : "";
  div.innerHTML = `
    <div class="bolinha" style="background:${t.cor}"></div>
    <div class="tarefa-info">
      <div class="tarefa-titulo">${t.titulo}</div>
      <div class="tarefa-meta">${dataLabel}${horaLabel}${catLabel}${recLabel}${diasLabel}</div>
    </div>
    <button class="concluir-btn" title="concluir">✓</button>
  `;
  div.querySelector(".concluir-btn").onclick = e => {
    e.stopPropagation();
    div.classList.add("concluindo");
    setTimeout(() => {
      const i = fonte.indexOf(t);
      if(i > -1) fonte.splice(i,1);
      arquivo.unshift({...t, arquivadoEm: new Date().toISOString()});
      salvar(); render();
    }, 480);
  };
  div.addEventListener("dragstart", () => { dragIdx=Number(div.dataset.idx); setTimeout(()=>div.classList.add("dragging"),0); });
  div.addEventListener("dragend",   () => { div.classList.remove("dragging"); document.querySelectorAll(".drag-over").forEach(el=>el.classList.remove("drag-over")); dragIdx=null; });
  div.addEventListener("dragover",  e => { e.preventDefault(); if(dragIdx===null||dragIdx===Number(div.dataset.idx))return; document.querySelectorAll(".drag-over").forEach(el=>el.classList.remove("drag-over")); div.classList.add("drag-over"); });
  div.addEventListener("drop", e => {
    e.preventDefault();
    const toIdx=Number(div.dataset.idx);
    if(dragIdx===null||dragIdx===toIdx) return;
    const item=fonte.splice(dragIdx,1)[0];
    fonte.splice(toIdx,0,item);
    salvar(); render();
  });
  return div;
}

function renderArquivo(lista){
  if(!arquivo.length){ lista.innerHTML=`<div class="empty-state">arquivo vazio.</div>`; return; }
  const label=document.createElement("div");
  label.className="secao-label"; label.innerText="concluídas";
  lista.appendChild(label);
  arquivo.forEach(t => {
    const div=document.createElement("div");
    div.className="tarefa arquivo-item";
    div.innerHTML=`
      <div class="bolinha" style="background:${t.cor}"></div>
      <div class="tarefa-info">
        <div class="tarefa-titulo">${t.titulo}</div>
        <div class="tarefa-meta">${t.cat?`<span class="tarefa-cat">${t.cat}</span>`:""}</div>
      </div>`;
    lista.appendChild(div);
  });
}

/* ── MODO ── */
document.getElementById("tarefasBtn").onclick   = () => setModo("tarefas");
document.getElementById("metasBtn").onclick     = () => setModo("metas");
document.getElementById("arquivoBtn").onclick   = () => setModo("arquivo");
document.getElementById("calendarioBtn").onclick = () => abrirCalendarioFull();

function setModo(m){
  modo=m;
  document.querySelectorAll(".sidebar-btn").forEach(b=>b.classList.remove("active"));
  const map={tarefas:"tarefasBtn",metas:"metasBtn",arquivo:"arquivoBtn"};
  if(map[m]) document.getElementById(map[m]).classList.add("active");
  render();
}

/* ── FILTROS ── */
document.querySelectorAll(".filtro-btn").forEach(btn=>{
  btn.onclick=()=>{ filtroCat=btn.dataset.cat; document.querySelectorAll(".filtro-btn").forEach(b=>b.classList.remove("active")); btn.classList.add("active"); render(); };
});
document.querySelectorAll(".filtro-cor-btn").forEach(btn=>{
  btn.onclick=()=>{ filtroCor=btn.dataset.filtrocor; document.querySelectorAll(".filtro-cor-btn").forEach(b=>b.classList.remove("active")); btn.classList.add("active"); render(); };
});
document.getElementById("campoBusca").addEventListener("input", render);

/* ── CALENDÁRIO MINI (MODAL) ── */
function renderCal(){
  const cal = document.getElementById("miniCal");
  const meses=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const diasSem=["dom","seg","ter","qua","qui","sex","sáb"];
  const primeiroDia=new Date(calAno,calMes,1).getDay();
  const totalDias=new Date(calAno,calMes+1,0).getDate();
  const hojeD=hoje.getDate(),hojeM=hoje.getMonth(),hojeA=hoje.getFullYear();
  let html=`
    <div class="cal-header">
      <button class="cal-nav" id="calPrev">‹</button>
      <span>${meses[calMes]} ${calAno}</span>
      <button class="cal-nav" id="calNext">›</button>
    </div>
    <div class="cal-grid">
      ${diasSem.map(d=>`<div class="cal-dia-label">${d}</div>`).join("")}
  `;
  for(let i=0;i<primeiroDia;i++) html+=`<div class="cal-dia vazio"></div>`;
  for(let d=1;d<=totalDias;d++){
    const isHoje=d===hojeD&&calMes===hojeM&&calAno===hojeA;
    const isSel=dataSelecionada&&d===dataSelecionada.d&&calMes===dataSelecionada.m&&calAno===dataSelecionada.a;
    html+=`<button class="cal-dia${isHoje?" hoje":""}${isSel?" selecionado":""}" data-d="${d}">${d}</button>`;
  }
  html+=`</div>`;
  cal.innerHTML=html;
  document.getElementById("calPrev").onclick=e=>{ e.stopPropagation(); calMes--; if(calMes<0){calMes=11;calAno--;} renderCal(); };
  document.getElementById("calNext").onclick=e=>{ e.stopPropagation(); calMes++; if(calMes>11){calMes=0;calAno++;} renderCal(); };
  cal.querySelectorAll(".cal-dia:not(.vazio)").forEach(btn=>{
    btn.onclick=e=>{
      e.stopPropagation();
      const d=Number(btn.dataset.d);
      dataSelecionada={d,m:calMes,a:calAno};
      const dd=String(d).padStart(2,"0");
      const mm=String(calMes+1).padStart(2,"0");
      document.getElementById("dataDisplay").value=`${dd}/${mm}/${calAno}`;
      renderCal();
      setTimeout(()=>document.getElementById("miniCal").classList.remove("aberto"),150);
    };
  });
}
document.getElementById("dataDisplay").onclick=e=>{ e.stopPropagation(); const cal=document.getElementById("miniCal"); cal.classList.toggle("aberto"); if(cal.classList.contains("aberto")) renderCal(); };
document.addEventListener("click",e=>{ const cal=document.getElementById("miniCal"); if(!cal.contains(e.target)&&e.target!==document.getElementById("dataDisplay")) cal.classList.remove("aberto"); });

/* ── HORÁRIO ── */
["horaInput","minInput"].forEach(id=>{
  document.getElementById(id).addEventListener("input",function(){ this.value=this.value.replace(/\D/g,""); });
  document.getElementById(id).addEventListener("blur",function(){
    if(this.value) this.value=this.value.padStart(2,"0");
    const h=document.getElementById("horaInput").value;
    const m=document.getElementById("minInput").value;
    if(h&&Number(h)>23) document.getElementById("horaInput").value="23";
    if(m&&Number(m)>59) document.getElementById("minInput").value="59";
  });
});

/* ── DIAS DA SEMANA ── */
document.querySelectorAll(".dia-btn").forEach(btn=>{ btn.onclick=()=>btn.classList.toggle("ativo"); });

/* ── MODAL ── */
document.getElementById("novoBtn").onclick=()=>{ if(modo!=="arquivo"&&modo!=="calendario") document.getElementById("modal").style.display="flex"; };
document.getElementById("fecharModal").onclick=()=>fecharModal();
document.getElementById("modal").addEventListener("click",e=>{ if(e.target===document.getElementById("modal")) fecharModal(); });
function fecharModal(){ document.getElementById("modal").style.display="none"; document.getElementById("miniCal").classList.remove("aberto"); }

document.querySelectorAll(".cor").forEach(btn=>{ btn.onclick=()=>{ corSelecionada=btn.dataset.cor; document.querySelectorAll(".cor").forEach(b=>b.classList.remove("selected")); btn.classList.add("selected"); }; });
document.querySelectorAll(".cat-btn").forEach(btn=>{ btn.onclick=()=>{ catSelecionada=btn.dataset.cat; document.querySelectorAll(".cat-btn").forEach(b=>b.classList.remove("selected")); btn.classList.add("selected"); }; });
document.getElementById("recorrenteCheck").addEventListener("change",function(){ document.getElementById("recorrenteOpcoes").classList.toggle("hidden",!this.checked); });

/* ── CRIAR ── */
document.getElementById("criar").onclick=()=>{
  const titulo=document.getElementById("titulo").value.trim();
  if(!titulo) return;
  const h=document.getElementById("horaInput").value.padStart(2,"0");
  const m=document.getElementById("minInput").value.padStart(2,"0");
  const hora=(document.getElementById("horaInput").value&&document.getElementById("minInput").value)?`${h}:${m}`:null;
  const diasAtivos=[...document.querySelectorAll(".dia-btn.ativo")].map(b=>b.dataset.dia);
  const recorrente=document.getElementById("recorrenteCheck").checked;
  const obj={
    titulo, cor:corSelecionada, cat:catSelecionada,
    data:document.getElementById("dataDisplay").value||null,
    hora, dias:diasAtivos, recorrente,
    frequencia:recorrente?document.getElementById("frequencia").value:null
  };
  if(modo==="metas") metas.push(obj); else tarefas.push(obj);
  salvar(); render();
  if(calFullOverlay.classList.contains("aberto")) renderCalFull();
  document.getElementById("titulo").value="";
  document.getElementById("dataDisplay").value="";
  document.getElementById("horaInput").value="";
  document.getElementById("minInput").value="";
  dataSelecionada=null;
  document.querySelectorAll(".dia-btn").forEach(b=>b.classList.remove("ativo"));
  document.getElementById("recorrenteCheck").checked=false;
  document.getElementById("recorrenteOpcoes").classList.add("hidden");
  fecharModal();
};

/* ── NOTAS ── */
function atualizarNotas(){ document.getElementById("paginaAtual").value=notas[paginaNotas]||""; document.getElementById("paginaInfo").innerText=`página ${paginaNotas+1} / ${notas.length}`; }
document.getElementById("notasBtn").onclick=()=>{ document.getElementById("modalNotas").style.display="flex"; atualizarNotas(); };
document.querySelector(".fechar-notas").onclick=()=>{ notas[paginaNotas]=document.getElementById("paginaAtual").value; salvar(); document.getElementById("modalNotas").style.display="none"; };
document.getElementById("paginaAtual").addEventListener("input",()=>{ notas[paginaNotas]=document.getElementById("paginaAtual").value; salvar(); });
document.getElementById("paginaAnterior").onclick=()=>{ notas[paginaNotas]=document.getElementById("paginaAtual").value; if(paginaNotas>0){paginaNotas--;atualizarNotas();} };
document.getElementById("proximaPagina").onclick =()=>{ notas[paginaNotas]=document.getElementById("paginaAtual").value; if(paginaNotas<notas.length-1){paginaNotas++;atualizarNotas();} };
document.getElementById("novaPagina").onclick    =()=>{ notas[paginaNotas]=document.getElementById("paginaAtual").value; notas.push(""); paginaNotas=notas.length-1; salvar(); atualizarNotas(); };
document.getElementById("modalNotas").addEventListener("click",e=>{ if(e.target===document.getElementById("modalNotas")){notas[paginaNotas]=document.getElementById("paginaAtual").value;salvar();document.getElementById("modalNotas").style.display="none";} });

/* ── POST-IT ── */
document.getElementById("postitBtn").onclick=e=>mostrarSeletorPostit(e.clientX,e.clientY);
function mostrarSeletorPostit(x,y){
  document.querySelectorAll(".postit-cor-selector").forEach(el=>el.remove());
  const sel=document.createElement("div");
  sel.className="postit-cor-selector";
  sel.innerHTML=`<p>cor:</p>
    <div class="postit-cor-op" data-classe="postit-amarelo" style="background:#ffd966"></div>
    <div class="postit-cor-op" data-classe="postit-vermelho" style="background:#ff8a80"></div>
    <div class="postit-cor-op" data-classe="postit-verde" style="background:#a5d6a7"></div>`;
  sel.style.left=(x-20)+"px"; sel.style.top=(y+10)+"px";
  document.body.appendChild(sel);
  sel.querySelectorAll(".postit-cor-op").forEach(op=>{
    op.onclick=()=>{ const obj={top:"180px",left:"340px",texto:"",classe:op.dataset.classe}; postits.push(obj); criarPostit(obj); salvar(); sel.remove(); };
  });
  setTimeout(()=>{ document.addEventListener("click",function f(ev){ if(!sel.contains(ev.target)){sel.remove();document.removeEventListener("click",f);} }); },50);
}

function criarPostit(p){
  const div=document.createElement("div");
  div.className=`postit ${p.classe||"postit-amarelo"}`;
  div.style.top=p.top; div.style.left=p.left;
  div.innerHTML=`
    <div class="postit-edge postit-edge-top"></div>
    <div class="postit-edge postit-edge-bottom"></div>
    <div class="postit-edge postit-edge-left"></div>
    <div class="postit-edge postit-edge-right"></div>
    <textarea placeholder="escreva...">${p.texto}</textarea>
  `;
  document.body.appendChild(div);
  div.querySelector("textarea").addEventListener("input",function(){ p.texto=this.value; salvar(); });
  div.querySelectorAll(".postit-edge").forEach(edge=>{
    function iniciarArrasto(clientX, clientY){
      const ox=clientX-div.offsetLeft, oy=clientY-div.offsetTop;
      function mover(clientX, clientY){
        div.style.left=(clientX-ox)+"px";
        div.style.top =(clientY-oy)+"px";
        p.left=div.style.left; p.top=div.style.top;
        const lx=document.getElementById("lixeira").getBoundingClientRect();
        const px=div.getBoundingClientRect();
        document.getElementById("lixeira").classList.toggle("highlight",px.right>lx.left&&px.left<lx.right&&px.bottom>lx.top&&px.top<lx.bottom);
      }
      function soltar(){
        document.getElementById("lixeira").classList.remove("highlight");
        const lx=document.getElementById("lixeira").getBoundingClientRect();
        const px=div.getBoundingClientRect();
        if(px.right>lx.left&&px.left<lx.right&&px.bottom>lx.top&&px.top<lx.bottom){
          div.remove(); postits=postits.filter(x=>x!==p); salvar();
        } else { salvar(); }
      }
      document.onmousemove=e=>mover(e.clientX,e.clientY);
      document.onmouseup=()=>{ document.onmousemove=null; document.onmouseup=null; soltar(); };
      edge.ontouchmove=e=>{ e.preventDefault(); mover(e.touches[0].clientX,e.touches[0].clientY); };
      edge.ontouchend=()=>{ edge.ontouchmove=null; edge.ontouchend=null; soltar(); };
    }
    edge.onmousedown=e=>{ e.preventDefault(); iniciarArrasto(e.clientX,e.clientY); };
    edge.ontouchstart=e=>{ e.preventDefault(); iniciarArrasto(e.touches[0].clientX,e.touches[0].clientY); };
  });
}

postits.forEach(p=>criarPostit(p));

/* ════════════════════════════════════════
   CALENDÁRIO FULL — MÊS E SEMANA
════════════════════════════════════════ */

const calFullOverlay = document.getElementById("calFullOverlay");
const MESES_PT = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const DIAS_CURTOS = ["dom","seg","ter","qua","qui","sex","sáb"];

function tarefasNoDia(d, m, a){
  const dd = String(d).padStart(2,"0");
  const mm = String(m+1).padStart(2,"0");
  const dataStr = `${dd}/${mm}/${a}`;
  return [...tarefas, ...metas].filter(t => t.data === dataStr);
}

function isHoje(d, m, a){
  return d===hoje.getDate() && m===hoje.getMonth() && a===hoje.getFullYear();
}

function abrirCalendarioFull(){
  calFullOverlay.classList.add("aberto");
  document.querySelectorAll(".sidebar-btn").forEach(b=>b.classList.remove("active"));
  document.getElementById("calendarioBtn").classList.add("active");
  renderCalFull();
}

document.getElementById("calFullFechar").onclick = () => {
  calFullOverlay.classList.remove("aberto");
  document.getElementById("calendarioBtn").classList.remove("active");
};
calFullOverlay.addEventListener("click", e => {
  if(e.target === calFullOverlay) calFullOverlay.classList.remove("aberto");
});

document.querySelectorAll(".cal-view-btn").forEach(btn => {
  btn.onclick = () => {
    calFullView = btn.dataset.view;
    document.querySelectorAll(".cal-view-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    renderCalFull();
  };
});

document.getElementById("calFullPrev").onclick = () => navCalFull(-1);
document.getElementById("calFullNext").onclick = () => navCalFull(1);
document.getElementById("calFullHoje").onclick = () => {
  calFullMes = hoje.getMonth();
  calFullAno = hoje.getFullYear();
  _semanaAncora = new Date();
  renderCalFull();
};

function navCalFull(dir){
  if(calFullView === "mes"){
    calFullMes += dir;
    if(calFullMes < 0){ calFullMes = 11; calFullAno--; }
    if(calFullMes > 11){ calFullMes = 0; calFullAno++; }
  } else {
    const anchoraDate = new Date(_semanaAncora);
    anchoraDate.setDate(anchoraDate.getDate() + dir * 7);
    calFullMes = anchoraDate.getMonth();
    calFullAno = anchoraDate.getFullYear();
    _semanaAncora = anchoraDate;
  }
  renderCalFull();
}

let _semanaAncora = new Date();

function calFullDiaSemana(){
  return _semanaAncora.getDate();
}

function renderCalFull(){
  if(calFullView === "mes") renderMes();
  else renderSemana();
}

function renderMes(){
  document.getElementById("calFullTitle").textContent = `${MESES_PT[calFullMes]} ${calFullAno}`;
  const body = document.getElementById("calFullBody");
  body.innerHTML = "";
  body.className = "cal-full-body cal-mes-view";

  const primeiroDia = new Date(calFullAno, calFullMes, 1).getDay();
  const totalDias   = new Date(calFullAno, calFullMes+1, 0).getDate();
  const totalDiasAnt= new Date(calFullAno, calFullMes, 0).getDate();

  const cabecalho = document.createElement("div");
  cabecalho.className = "cal-mes-cabecalho";
  DIAS_CURTOS.forEach(d => {
    const el = document.createElement("div");
    el.className = "cal-mes-label-dia";
    el.textContent = d;
    cabecalho.appendChild(el);
  });
  body.appendChild(cabecalho);

  const grid = document.createElement("div");
  grid.className = "cal-mes-grid";

  for(let i = primeiroDia - 1; i >= 0; i--){
    const cel = criarCelulaMes(totalDiasAnt - i, calFullMes - 1 < 0 ? 11 : calFullMes - 1, calFullMes - 1 < 0 ? calFullAno - 1 : calFullAno, true);
    grid.appendChild(cel);
  }

  for(let d = 1; d <= totalDias; d++){
    const cel = criarCelulaMes(d, calFullMes, calFullAno, false);
    grid.appendChild(cel);
  }

  const totalCelulas = Math.ceil((primeiroDia + totalDias) / 7) * 7;
  let dProx = 1;
  for(let i = primeiroDia + totalDias; i < totalCelulas; i++){
    const cel = criarCelulaMes(dProx++, calFullMes + 1 > 11 ? 0 : calFullMes + 1, calFullMes + 1 > 11 ? calFullAno + 1 : calFullAno, true);
    grid.appendChild(cel);
  }

  body.appendChild(grid);
}

function criarCelulaMes(d, m, a, inativo){
  const cel = document.createElement("div");
  cel.className = "cal-cel" + (inativo ? " cal-cel-inativo" : "") + (isHoje(d,m,a) ? " cal-cel-hoje" : "");

  const numEl = document.createElement("div");
  numEl.className = "cal-cel-num";
  numEl.textContent = d;
  cel.appendChild(numEl);

  const ts = tarefasNoDia(d, m, a);
  ts.slice(0,3).forEach(t => {
    const chip = document.createElement("div");
    chip.className = "cal-chip";
    chip.style.borderLeft = `3px solid ${t.cor}`;
    chip.textContent = t.titulo;
    cel.appendChild(chip);
  });
  if(ts.length > 3){
    const mais = document.createElement("div");
    mais.className = "cal-chip cal-chip-mais";
    mais.textContent = `+${ts.length - 3} mais`;
    cel.appendChild(mais);
  }

  if(!inativo){
    cel.onclick = () => abrirModalComData(d, m, a);
  }

  return cel;
}

function renderSemana(){
  const anchoraDate = new Date(_semanaAncora);
  const diaSemana   = anchoraDate.getDay();
  const domingo     = new Date(anchoraDate);
  domingo.setDate(anchoraDate.getDate() - diaSemana);

  const sabado = new Date(domingo);
  sabado.setDate(domingo.getDate() + 6);

  const mesD = MESES_PT[domingo.getMonth()];
  const mesS = MESES_PT[sabado.getMonth()];
  const tituloStr = mesD === mesS
    ? `${mesD} ${domingo.getFullYear()}`
    : `${mesD} – ${mesS} ${sabado.getFullYear()}`;
  document.getElementById("calFullTitle").textContent = tituloStr;

  const body = document.getElementById("calFullBody");
  body.innerHTML = "";
  body.className = "cal-full-body cal-semana-view";

  const dias = [];
  for(let i = 0; i < 7; i++){
    const dt = new Date(domingo);
    dt.setDate(domingo.getDate() + i);
    dias.push(dt);
  }

  const cabecalho = document.createElement("div");
  cabecalho.className = "cal-semana-cabecalho";

  const vazio = document.createElement("div");
  vazio.className = "cal-semana-hora-label";
  cabecalho.appendChild(vazio);

  dias.forEach(dt => {
    const col = document.createElement("div");
    col.className = "cal-semana-col-header" + (isHoje(dt.getDate(), dt.getMonth(), dt.getFullYear()) ? " cal-semana-col-hoje" : "");
    col.innerHTML = `<span class="cal-semana-dow">${DIAS_CURTOS[dt.getDay()]}</span><span class="cal-semana-num${isHoje(dt.getDate(), dt.getMonth(), dt.getFullYear()) ? " cal-semana-num-hoje" : ""}">${dt.getDate()}</span>`;
    cabecalho.appendChild(col);
  });
  body.appendChild(cabecalho);

  const scroll = document.createElement("div");
  scroll.className = "cal-semana-scroll";

  const grid = document.createElement("div");
  grid.className = "cal-semana-grid";

  for(let h = 0; h < 24; h++){
    const linha = document.createElement("div");
    linha.className = "cal-semana-linha";

    const horaEl = document.createElement("div");
    horaEl.className = "cal-semana-hora-label";
    horaEl.textContent = h === 0 ? "" : `${String(h).padStart(2,"0")}:00`;
    linha.appendChild(horaEl);

    dias.forEach(dt => {
      const cel = document.createElement("div");
      cel.className = "cal-semana-cel" + (isHoje(dt.getDate(), dt.getMonth(), dt.getFullYear()) ? " cal-semana-cel-hoje" : "");

      const tarefasDia = tarefasNoDia(dt.getDate(), dt.getMonth(), dt.getFullYear());
      tarefasDia.filter(t => t.hora && parseInt(t.hora.split(":")[0]) === h).forEach(t => {
        const chip = document.createElement("div");
        chip.className = "cal-chip cal-chip-semana";
        chip.style.borderLeft = `3px solid ${t.cor}`;
        chip.textContent = `${t.hora} ${t.titulo}`;
        cel.appendChild(chip);
      });

      if(h === 0){
        tarefasDia.filter(t => !t.hora).forEach(t => {
          const chip = document.createElement("div");
          chip.className = "cal-chip cal-chip-semana";
          chip.style.borderLeft = `3px solid ${t.cor}`;
          chip.textContent = t.titulo;
          cel.appendChild(chip);
        });
      }

      cel.onclick = () => abrirModalComData(dt.getDate(), dt.getMonth(), dt.getFullYear(), h);
      linha.appendChild(cel);
    });

    grid.appendChild(linha);
  }

  scroll.appendChild(grid);
  body.appendChild(scroll);

  const hojeNaSemana = dias.some(dt => isHoje(dt.getDate(), dt.getMonth(), dt.getFullYear()));
  if(hojeNaSemana){
    requestAnimationFrame(() => {
      const alturaLinha = 56;
      scroll.scrollTop = Math.max(0, hoje.getHours() * alturaLinha - alturaLinha * 2);
    });
  }
}

function abrirModalComData(d, m, a, hora){
  const dd = String(d).padStart(2,"0");
  const mm = String(m+1).padStart(2,"0");
  document.getElementById("dataDisplay").value = `${dd}/${mm}/${a}`;
  dataSelecionada = {d, m, a};
  calMes = m; calAno = a;
  if(hora !== undefined && hora > 0){
    document.getElementById("horaInput").value = String(hora).padStart(2,"0");
    document.getElementById("minInput").value  = "00";
  }
  document.getElementById("modal").style.display = "flex";
}

document.getElementById("btnViewSemana").onclick = () => {
  _semanaAncora = new Date(calFullAno, calFullMes, 1);
  calFullView = "semana";
  document.querySelectorAll(".cal-view-btn").forEach(b=>b.classList.remove("active"));
  document.getElementById("btnViewSemana").classList.add("active");
  renderCalFull();
};

document.getElementById("btnViewMes").onclick = () => {
  calFullView = "mes";
  document.querySelectorAll(".cal-view-btn").forEach(b=>b.classList.remove("active"));
  document.getElementById("btnViewMes").classList.add("active");
  renderCalFull();
};

render();
