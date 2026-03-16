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

/* ── DATA ── */
const hoje = new Date();
calMes = hoje.getMonth();
calAno = hoje.getFullYear();
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

/* ── RENDER ── */
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
  const diasLabel = t.dias && t.dias.length
    ? `<span class="tarefa-dias">${t.dias.join(" · ")}</span>` : "";

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
document.getElementById("tarefasBtn").onclick = () => setModo("tarefas");
document.getElementById("metasBtn").onclick   = () => setModo("metas");
document.getElementById("arquivoBtn").onclick  = () => setModo("arquivo");
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

/* ── CALENDÁRIO CUSTOMIZADO ── */
function renderCal(){
  const cal = document.getElementById("miniCal");
  const meses=["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const diasSem=["dom","seg","ter","qua","qui","sex","sáb"];
  const primeiroDia = new Date(calAno, calMes, 1).getDay();
  const totalDias   = new Date(calAno, calMes+1, 0).getDate();
  const hojeD=hoje.getDate(), hojeM=hoje.getMonth(), hojeA=hoje.getFullYear();

  let html = `
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
    const isHoje = d===hojeD && calMes===hojeM && calAno===hojeA;
    const isSel  = dataSelecionada &&
                   d===dataSelecionada.d &&
                   calMes===dataSelecionada.m &&
                   calAno===dataSelecionada.a;
    html+=`<button class="cal-dia${isHoje?" hoje":""}${isSel?" selecionado":""}" data-d="${d}">${d}</button>`;
  }
  html+=`</div>`;
  cal.innerHTML=html;

  document.getElementById("calPrev").onclick = e => { e.stopPropagation(); calMes--; if(calMes<0){calMes=11;calAno--;} renderCal(); };
  document.getElementById("calNext").onclick = e => { e.stopPropagation(); calMes++; if(calMes>11){calMes=0;calAno++;} renderCal(); };

  cal.querySelectorAll(".cal-dia:not(.vazio)").forEach(btn=>{
    btn.onclick = e => {
      e.stopPropagation();
      const d=Number(btn.dataset.d);
      dataSelecionada={d, m:calMes, a:calAno};
      const dd=String(d).padStart(2,"0");
      const mm=String(calMes+1).padStart(2,"0");
      document.getElementById("dataDisplay").value=`${dd}/${mm}/${calAno}`;
      renderCal();
      setTimeout(()=>document.getElementById("miniCal").classList.remove("aberto"),150);
    };
  });
}

document.getElementById("dataDisplay").onclick = e => {
  e.stopPropagation();
  const cal=document.getElementById("miniCal");
  cal.classList.toggle("aberto");
  if(cal.classList.contains("aberto")) renderCal();
};

document.addEventListener("click", e => {
  const cal=document.getElementById("miniCal");
  if(!cal.contains(e.target) && e.target!==document.getElementById("dataDisplay"))
    cal.classList.remove("aberto");
});

/* horário — só números */
["horaInput","minInput"].forEach(id=>{
  document.getElementById(id).addEventListener("input", function(){
    this.value=this.value.replace(/\D/g,"");
  });
  document.getElementById(id).addEventListener("blur", function(){
    if(this.value) this.value=this.value.padStart(2,"0");
    const h=document.getElementById("horaInput").value;
    const m=document.getElementById("minInput").value;
    if(h && Number(h)>23) document.getElementById("horaInput").value="23";
    if(m && Number(m)>59) document.getElementById("minInput").value="59";
  });
});

/* ── DIAS DA SEMANA ── */
document.querySelectorAll(".dia-btn").forEach(btn=>{
  btn.onclick=()=>btn.classList.toggle("ativo");
});

/* ── MODAL ── */
document.getElementById("novoBtn").onclick=()=>{ if(modo!=="arquivo") document.getElementById("modal").style.display="flex"; };
document.getElementById("fecharModal").onclick=()=>fecharModal();
document.getElementById("modal").addEventListener("click",e=>{ if(e.target===document.getElementById("modal")) fecharModal(); });

function fecharModal(){
  document.getElementById("modal").style.display="none";
  document.getElementById("miniCal").classList.remove("aberto");
}

/* cores */
document.querySelectorAll(".cor").forEach(btn=>{
  btn.onclick=()=>{ corSelecionada=btn.dataset.cor; document.querySelectorAll(".cor").forEach(b=>b.classList.remove("selected")); btn.classList.add("selected"); };
});
/* cats */
document.querySelectorAll(".cat-btn").forEach(btn=>{
  btn.onclick=()=>{ catSelecionada=btn.dataset.cat; document.querySelectorAll(".cat-btn").forEach(b=>b.classList.remove("selected")); btn.classList.add("selected"); };
});
/* recorrente */
document.getElementById("recorrenteCheck").addEventListener("change",function(){
  document.getElementById("recorrenteOpcoes").classList.toggle("hidden",!this.checked);
});

/* ── CRIAR ── */
document.getElementById("criar").onclick=()=>{
  const titulo=document.getElementById("titulo").value.trim();
  if(!titulo) return;

  const h=document.getElementById("horaInput").value.padStart(2,"0");
  const m=document.getElementById("minInput").value.padStart(2,"0");
  const hora=(h&&m) ? `${h}:${m}` : null;

  const diasAtivos=[...document.querySelectorAll(".dia-btn.ativo")].map(b=>b.dataset.dia);
  const recorrente=document.getElementById("recorrenteCheck").checked;

  const obj={
    titulo,
    cor: corSelecionada,
    cat: catSelecionada,
    data: document.getElementById("dataDisplay").value || null,
    hora,
    dias: diasAtivos,
    recorrente,
    frequencia: recorrente ? document.getElementById("frequencia").value : null
  };

  if(modo==="metas") metas.push(obj); else tarefas.push(obj);
  salvar(); render();

  /* limpar */
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
function atualizarNotas(){
  document.getElementById("paginaAtual").value=notas[paginaNotas]||"";
  document.getElementById("paginaInfo").innerText=`página ${paginaNotas+1} / ${notas.length}`;
}
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
  div.innerHTML=`<div class="postit-handle">· · ·</div><textarea placeholder="escreva...">${p.texto}</textarea>`;
  document.body.appendChild(div);
  div.querySelector("textarea").addEventListener("input",function(){ p.texto=this.value; salvar(); });
  div.querySelector(".postit-handle").onmousedown=e=>{
    e.preventDefault();
    const ox=e.clientX-div.offsetLeft, oy=e.clientY-div.offsetTop;
    document.onmousemove=e=>{
      div.style.left=(e.clientX-ox)+"px"; div.style.top=(e.clientY-oy)+"px";
      p.left=div.style.left; p.top=div.style.top;
      const lx=document.getElementById("lixeira").getBoundingClientRect();
      const px=div.getBoundingClientRect();
      document.getElementById("lixeira").classList.toggle("highlight",px.right>lx.left&&px.left<lx.right&&px.bottom>lx.top&&px.top<lx.bottom);
    };
    document.onmouseup=()=>{
      document.onmousemove=null;
      document.getElementById("lixeira").classList.remove("highlight");
      const lx=document.getElementById("lixeira").getBoundingClientRect();
      const px=div.getBoundingClientRect();
      if(px.right>lx.left&&px.left<lx.right&&px.bottom>lx.top&&px.top<lx.bottom){ div.remove(); postits=postits.filter(x=>x!==p); salvar(); } else { salvar(); }
    };
  };
}
postits.forEach(p=>criarPostit(p));
render();
