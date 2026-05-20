let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let metas   = JSON.parse(localStorage.getItem("metas"))   || [];
let arquivo = JSON.parse(localStorage.getItem("arquivo")) || [];
let notas   = JSON.parse(localStorage.getItem("notas"))   || [""];
let postits = JSON.parse(localStorage.getItem("postits")) || [];

let modo            = "tarefas";
let corSelecionada  = "#ff5f57";
let catSelecionada  = "trabalho";
let prioSelecionada = "normal";
let filtroCat       = "todas";
let filtroCor       = "todas";
let paginaNotas     = 0;
let dragIdx         = null;
let dataSelecionada = null;
let calMes, calAno;
let editandoIdx     = null;

let calFullMes, calFullAno, calFullView = "mes";
let _semanaAncora = new Date();
const hoje = new Date();

calMes = hoje.getMonth();
calAno = hoje.getFullYear();
calFullMes = hoje.getMonth();
calFullAno = hoje.getFullYear();
document.getElementById("mesTopo").innerText = hoje.toLocaleDateString("pt-BR",{month:"long"});
document.getElementById("diaTopo").innerText  = hoje.getDate();

/* ══ SALVAR / BADGES / PROGRESSO ══ */
function salvar(){
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
  localStorage.setItem("metas",   JSON.stringify(metas));
  localStorage.setItem("arquivo", JSON.stringify(arquivo));
  localStorage.setItem("notas",   JSON.stringify(notas));
  localStorage.setItem("postits", JSON.stringify(postits));
}

function atualizarBadges(){
  document.getElementById("badgeTarefas").innerText = tarefas.length || "";
  document.getElementById("badgeMetas").innerText   = metas.length   || "";
  document.getElementById("badgeArquivo").innerText = arquivo.length  || "";
}

function atualizarProgresso(){
  const total      = tarefas.length + arquivo.length;
  const concluidas = arquivo.length;
  const pct = total ? Math.round((concluidas / total) * 100) : 0;
  document.getElementById("progressBar").style.width = pct + "%";
  document.getElementById("progressText").innerText =
    total ? `${concluidas} de ${total} concluídas` : "nenhuma tarefa ainda";
}

/* ══ RENDER LISTA ══ */
function render(){
  const lista = document.getElementById("listaTarefas");
  lista.innerHTML = "";
  atualizarBadges();
  atualizarProgresso();
  if(modo === "arquivo"){ renderArquivo(lista); return; }

  const fonte = modo === "metas" ? metas : tarefas;
  const busca = document.getElementById("campoBusca").value.toLowerCase().trim();

  let filtradas = fonte.filter((t,i) => {
    t._idx = i;
    return (filtroCat==="todas"||t.cat===filtroCat) &&
           (filtroCor==="todas"||t.cor===filtroCor) &&
           (!busca||t.titulo.toLowerCase().includes(busca)||
            (t.nota&&t.nota.toLowerCase().includes(busca)));
  });

  if(!filtradas.length){
    lista.innerHTML = `<div class="empty-state">${busca ? 'nenhum resultado para "'+busca+'"' : "tudo limpo por aqui ✓"}</div>`;
    return;
  }

  const ordemPrio = {alta:0, normal:1, baixa:2};
  filtradas.sort((a,b) => {
    const pa = ordemPrio[a.prioridade||"normal"];
    const pb = ordemPrio[b.prioridade||"normal"];
    if(pa !== pb) return pa - pb;
    if(a.data && b.data) return parseData(a.data) - parseData(b.data);
    if(a.data) return -1;
    if(b.data) return 1;
    return 0;
  });

  const grupos = {};
  filtradas.forEach(t => {
    const chave = t.data || "__sem_data__";
    if(!grupos[chave]) grupos[chave] = [];
    grupos[chave].push(t);
  });

  Object.entries(grupos).forEach(([chave, itens]) => {
    if(chave !== "__sem_data__"){
      const labelEl = document.createElement("div");
      labelEl.className = "secao-data-label";
      labelEl.textContent = formatarDataLabel(chave);
      lista.appendChild(labelEl);
    }
    itens.forEach(t => lista.appendChild(criarElementoTarefa(t, fonte)));
  });
}

function parseData(str){
  const [d,m,a] = str.split("/");
  return new Date(a, m-1, d);
}

function formatarDataLabel(str){
  const d = parseData(str);
  const hj = new Date(); hj.setHours(0,0,0,0);
  const am = new Date(hj); am.setDate(hj.getDate()+1);
  const on = new Date(hj); on.setDate(hj.getDate()-1);
  d.setHours(0,0,0,0);
  if(d.getTime()===hj.getTime()) return "hoje · " + str;
  if(d.getTime()===am.getTime()) return "amanhã · " + str;
  if(d.getTime()===on.getTime()) return "ontem · " + str;
  if(d < hj) return "⚠ atrasada · " + str;
  return d.toLocaleDateString("pt-BR",{weekday:"long"}) + " · " + str;
}

function criarElementoTarefa(t, fonte){
  const div = document.createElement("div");
  div.className = "tarefa";
  div.draggable = true;
  div.dataset.idx = t._idx;

  let atrasada = false;
  if(t.data){
    const td = parseData(t.data); td.setHours(0,0,0,0);
    const hj = new Date(); hj.setHours(0,0,0,0);
    if(td < hj) atrasada = true;
  }

  const cats = {trabalho:"💼", estudo:"📚", pessoal:"🏠"};
  const horaLabel = t.hora ? `<span class="tag">⏰ ${t.hora}</span>` : "";
  const catLabel  = t.cat  ? `<span class="tag">${cats[t.cat]||""}</span>` : "";
  const recLabel  = t.recorrente ? `<span class="tag">↻</span>` : "";
  const prioMap   = {alta:"‼", baixa:"↓"};
  const prioLabel = (t.prioridade&&t.prioridade!=="normal") ? `<span class="tag tag-prio tag-prio-${t.prioridade}">${prioMap[t.prioridade]}</span>` : "";
  const notaLabel = t.nota ? `<div class="tarefa-nota-preview">${t.nota}</div>` : "";
  const atrasadaLabel = atrasada ? `<span class="tag tag-atrasada">atrasada</span>` : "";

  div.innerHTML = `
    <div class="bolinha" style="background:${t.cor}"></div>
    <div class="tarefa-info">
      <div class="tarefa-titulo">${t.titulo}</div>
      <div class="tarefa-meta">${prioLabel}${horaLabel}${catLabel}${recLabel}${atrasadaLabel}</div>
      ${notaLabel}
    </div>
    <div class="tarefa-acoes">
      <button class="tarefa-acao-btn editar-btn" title="editar">✎</button>
      <button class="concluir-btn" title="concluir">✓</button>
    </div>
  `;

  div.addEventListener("click", e => {
    if(e.target.closest(".tarefa-acoes")) return;
    abrirDetalhe(t, fonte);
  });

  div.querySelector(".editar-btn").onclick = e => {
    e.stopPropagation();
    abrirEdicao(t._idx, fonte === metas ? "metas" : "tarefas");
  };

  div.querySelector(".concluir-btn").onclick = e => {
    e.stopPropagation();
    div.classList.add("concluindo");
    setTimeout(() => {
      const i = fonte.indexOf(t);
      if(i > -1) fonte.splice(i,1);
      arquivo.unshift({...t, arquivadoEm: new Date().toISOString()});
      salvar(); render();
      if(calFullOverlay.classList.contains("aberto")) renderCalFull();
    }, 480);
  };

  div.addEventListener("dragstart", () => { dragIdx=Number(div.dataset.idx); setTimeout(()=>div.classList.add("dragging"),0); });
  div.addEventListener("dragend",   () => { div.classList.remove("dragging"); document.querySelectorAll(".drag-over").forEach(el=>el.classList.remove("drag-over")); dragIdx=null; });
  div.addEventListener("dragover",  e => { e.preventDefault(); if(dragIdx===null||dragIdx===Number(div.dataset.idx))return; document.querySelectorAll(".drag-over").forEach(el=>el.classList.remove("drag-over")); div.classList.add("drag-over"); });
  div.addEventListener("drop", e => {
    e.preventDefault();
    const toIdx = Number(div.dataset.idx);
    if(dragIdx===null||dragIdx===toIdx) return;
    const item = fonte.splice(dragIdx,1)[0];
    fonte.splice(toIdx,0,item);
    salvar(); render();
  });

  return div;
}

function renderArquivo(lista){
  if(!arquivo.length){ lista.innerHTML=`<div class="empty-state">arquivo vazio.</div>`; return; }
  const label = document.createElement("div");
  label.className = "secao-label"; label.innerText = "concluídas";
  lista.appendChild(label);
  arquivo.forEach((t,i) => {
    const div = document.createElement("div");
    div.className = "tarefa arquivo-item";
    const data = t.arquivadoEm ? new Date(t.arquivadoEm).toLocaleDateString("pt-BR") : "";
    div.innerHTML = `
      <div class="bolinha" style="background:${t.cor}"></div>
      <div class="tarefa-info">
        <div class="tarefa-titulo">${t.titulo}</div>
        <div class="tarefa-meta">
          ${t.cat?`<span class="tag">${t.cat}</span>`:""}
          ${data?`<span class="tag">${data}</span>`:""}
        </div>
      </div>
      <button class="tarefa-acao-btn restaurar-btn" title="restaurar">↩</button>
    `;
    div.querySelector(".restaurar-btn").onclick = () => {
      const item = arquivo.splice(i,1)[0];
      delete item.arquivadoEm;
      tarefas.unshift(item);
      salvar(); render();
    };
    lista.appendChild(div);
  });
}

/* ══ DETALHE ══ */
function abrirDetalhe(t, fonte){
  document.getElementById("detalheTitulo").textContent = t.titulo;
  document.getElementById("detalheCorBarra").style.background = t.cor;
  const cats = {trabalho:"💼 trabalho", estudo:"📚 estudo", pessoal:"🏠 pessoal"};
  let infos = "";
  if(t.data) infos += `<div class="detalhe-info-item">📅 ${formatarDataLabel(t.data)}</div>`;
  if(t.hora) infos += `<div class="detalhe-info-item">⏰ ${t.hora}</div>`;
  if(t.cat)  infos += `<div class="detalhe-info-item">${cats[t.cat]}</div>`;
  if(t.prioridade && t.prioridade !== "normal") infos += `<div class="detalhe-info-item">prioridade: ${t.prioridade}</div>`;
  if(t.recorrente) infos += `<div class="detalhe-info-item">↻ ${t.frequencia}</div>`;
  if(t.dias && t.dias.length) infos += `<div class="detalhe-info-item">dias: ${t.dias.join(", ")}</div>`;
  document.getElementById("detalheInfos").innerHTML = infos;
  document.getElementById("detalheNota").textContent = t.nota || "";
  document.getElementById("detalheNota").style.display = t.nota ? "block" : "none";
  document.getElementById("detalheConcluir").onclick = () => {
    document.getElementById("modalDetalhe").style.display = "none";
    const i = fonte.indexOf(t);
    if(i > -1) fonte.splice(i,1);
    arquivo.unshift({...t, arquivadoEm: new Date().toISOString()});
    salvar(); render();
    if(calFullOverlay.classList.contains("aberto")) renderCalFull();
  };
  document.getElementById("detalheEditar").onclick = () => {
    document.getElementById("modalDetalhe").style.display = "none";
    abrirEdicao(t._idx, fonte === metas ? "metas" : "tarefas");
  };
  document.getElementById("modalDetalhe").style.display = "flex";
}

document.getElementById("fecharDetalhe").onclick = () => { document.getElementById("modalDetalhe").style.display = "none"; };
document.getElementById("modalDetalhe").addEventListener("click", e => { if(e.target === document.getElementById("modalDetalhe")) document.getElementById("modalDetalhe").style.display = "none"; });

/* ══ EDIÇÃO ══ */
function abrirEdicao(idx, tipoFonte){
  const fonte = tipoFonte === "metas" ? metas : tarefas;
  const t = fonte[idx];
  if(!t) return;
  editandoIdx = idx;
  document.getElementById("modalTitulo").textContent = "editar tarefa";
  document.getElementById("titulo").value = t.titulo;
  document.getElementById("dataDisplay").value = t.data || "";
  document.getElementById("horaInput").value = t.hora ? t.hora.split(":")[0] : "";
  document.getElementById("minInput").value  = t.hora ? t.hora.split(":")[1] : "";
  document.getElementById("notaRapida").value = t.nota || "";
  corSelecionada = t.cor;
  document.querySelectorAll(".cor").forEach(b => b.classList.toggle("selected", b.dataset.cor === t.cor));
  catSelecionada = t.cat || "trabalho";
  document.querySelectorAll(".cat-btn").forEach(b => b.classList.toggle("selected", b.dataset.cat === t.cat));
  prioSelecionada = t.prioridade || "normal";
  document.querySelectorAll(".prio-btn").forEach(b => b.classList.toggle("selected", b.dataset.prio === prioSelecionada));
  document.querySelectorAll(".dia-btn").forEach(b => b.classList.toggle("ativo", t.dias && t.dias.includes(b.dataset.dia)));
  document.getElementById("recorrenteCheck").checked = !!t.recorrente;
  document.getElementById("recorrenteOpcoes").classList.toggle("hidden", !t.recorrente);
  if(t.frequencia) document.getElementById("frequencia").value = t.frequencia;
  document.getElementById("criar").textContent = "salvar";
  document.getElementById("modal").style.display = "flex";
}

/* ══ MODO ══ */
document.getElementById("tarefasBtn").onclick    = () => setModo("tarefas");
document.getElementById("metasBtn").onclick      = () => setModo("metas");
document.getElementById("arquivoBtn").onclick    = () => setModo("arquivo");
document.getElementById("calendarioBtn").onclick = () => abrirCalendarioFull();

function setModo(m){
  modo = m;
  document.querySelectorAll(".sidebar-btn").forEach(b => b.classList.remove("active"));
  const map = {tarefas:"tarefasBtn", metas:"metasBtn", arquivo:"arquivoBtn"};
  if(map[m]) document.getElementById(map[m]).classList.add("active");
  render();
}

/* ══ FILTROS ══ */
document.querySelectorAll(".filtro-btn").forEach(btn => {
  btn.onclick = () => { filtroCat = btn.dataset.cat; document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("active")); btn.classList.add("active"); render(); };
});
document.querySelectorAll(".filtro-cor-btn").forEach(btn => {
  btn.onclick = () => { filtroCor = btn.dataset.filtrocor; document.querySelectorAll(".filtro-cor-btn").forEach(b => b.classList.remove("active")); btn.classList.add("active"); render(); };
});
document.getElementById("campoBusca").addEventListener("input", render);

/* ══ CALENDÁRIO MINI ══ */
function renderCal(){
  const cal = document.getElementById("miniCal");
  const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  const diasSem = ["dom","seg","ter","qua","qui","sex","sáb"];
  const primeiroDia = new Date(calAno,calMes,1).getDay();
  const totalDias   = new Date(calAno,calMes+1,0).getDate();
  const hojeD=hoje.getDate(), hojeM=hoje.getMonth(), hojeA=hoje.getFullYear();
  let html = `<div class="cal-header"><button class="cal-nav" id="calPrev">‹</button><span>${meses[calMes]} ${calAno}</span><button class="cal-nav" id="calNext">›</button></div><div class="cal-grid">${diasSem.map(d=>`<div class="cal-dia-label">${d}</div>`).join("")}`;
  for(let i=0;i<primeiroDia;i++) html += `<div class="cal-dia vazio"></div>`;
  for(let d=1;d<=totalDias;d++){
    const isHj  = d===hojeD&&calMes===hojeM&&calAno===hojeA;
    const isSel = dataSelecionada&&d===dataSelecionada.d&&calMes===dataSelecionada.m&&calAno===dataSelecionada.a;
    html += `<button class="cal-dia${isHj?" hoje":""}${isSel?" selecionado":""}" data-d="${d}">${d}</button>`;
  }
  html += `</div>`;
  cal.innerHTML = html;
  document.getElementById("calPrev").onclick = e => { e.stopPropagation(); calMes--; if(calMes<0){calMes=11;calAno--;} renderCal(); };
  document.getElementById("calNext").onclick = e => { e.stopPropagation(); calMes++; if(calMes>11){calMes=0;calAno++;} renderCal(); };
  cal.querySelectorAll(".cal-dia:not(.vazio)").forEach(btn => {
    btn.onclick = e => {
      e.stopPropagation();
      const d = Number(btn.dataset.d);
      dataSelecionada = {d, m:calMes, a:calAno};
      document.getElementById("dataDisplay").value = `${String(d).padStart(2,"0")}/${String(calMes+1).padStart(2,"0")}/${calAno}`;
      renderCal();
      setTimeout(() => document.getElementById("miniCal").classList.remove("aberto"), 150);
    };
  });
}
document.getElementById("dataDisplay").onclick = e => { e.stopPropagation(); const cal=document.getElementById("miniCal"); cal.classList.toggle("aberto"); if(cal.classList.contains("aberto")) renderCal(); };
document.addEventListener("click", e => { const cal=document.getElementById("miniCal"); if(!cal.contains(e.target)&&e.target!==document.getElementById("dataDisplay")) cal.classList.remove("aberto"); });

/* ══ HORÁRIO ══ */
["horaInput","minInput"].forEach(id => {
  document.getElementById(id).addEventListener("input", function(){ this.value = this.value.replace(/\D/g,""); });
  document.getElementById(id).addEventListener("blur", function(){
    if(this.value) this.value = this.value.padStart(2,"0");
    if(document.getElementById("horaInput").value && Number(document.getElementById("horaInput").value)>23) document.getElementById("horaInput").value="23";
    if(document.getElementById("minInput").value  && Number(document.getElementById("minInput").value)>59)  document.getElementById("minInput").value="59";
  });
});

/* ══ DIAS ══ */
document.querySelectorAll(".dia-btn").forEach(btn => { btn.onclick = () => btn.classList.toggle("ativo"); });

/* ══ PRIORIDADE ══ */
document.querySelectorAll(".prio-btn").forEach(btn => {
  btn.onclick = () => { prioSelecionada = btn.dataset.prio; document.querySelectorAll(".prio-btn").forEach(b => b.classList.remove("selected")); btn.classList.add("selected"); };
});

/* ══ MODAL ══ */
document.getElementById("novoBtn").onclick = () => { if(modo==="arquivo") return; resetarModal(); document.getElementById("modal").style.display="flex"; };
document.getElementById("fecharModal").onclick = () => fecharModal();
document.getElementById("modal").addEventListener("click", e => { if(e.target===document.getElementById("modal")) fecharModal(); });

function fecharModal(){ document.getElementById("modal").style.display="none"; document.getElementById("miniCal").classList.remove("aberto"); resetarModal(); }

function resetarModal(){
  editandoIdx = null;
  document.getElementById("modalTitulo").textContent = "nova tarefa";
  document.getElementById("criar").textContent = "criar";
  document.getElementById("titulo").value = "";
  document.getElementById("dataDisplay").value = "";
  document.getElementById("horaInput").value = "";
  document.getElementById("minInput").value = "";
  document.getElementById("notaRapida").value = "";
  dataSelecionada = null;
  document.querySelectorAll(".dia-btn").forEach(b => b.classList.remove("ativo"));
  document.getElementById("recorrenteCheck").checked = false;
  document.getElementById("recorrenteOpcoes").classList.add("hidden");
  corSelecionada = "#ff5f57";
  document.querySelectorAll(".cor").forEach(b => b.classList.toggle("selected", b.dataset.cor==="#ff5f57"));
  catSelecionada = "trabalho";
  document.querySelectorAll(".cat-btn").forEach(b => b.classList.toggle("selected", b.dataset.cat==="trabalho"));
  prioSelecionada = "normal";
  document.querySelectorAll(".prio-btn").forEach(b => b.classList.toggle("selected", b.dataset.prio==="normal"));
}

document.querySelectorAll(".cor").forEach(btn => { btn.onclick = () => { corSelecionada=btn.dataset.cor; document.querySelectorAll(".cor").forEach(b=>b.classList.remove("selected")); btn.classList.add("selected"); }; });
document.querySelectorAll(".cat-btn").forEach(btn => { btn.onclick = () => { catSelecionada=btn.dataset.cat; document.querySelectorAll(".cat-btn").forEach(b=>b.classList.remove("selected")); btn.classList.add("selected"); }; });
document.getElementById("recorrenteCheck").addEventListener("change", function(){ document.getElementById("recorrenteOpcoes").classList.toggle("hidden",!this.checked); });

/* ══ CRIAR / SALVAR ══ */
document.getElementById("criar").onclick = () => {
  const titulo = document.getElementById("titulo").value.trim();
  if(!titulo) return;
  const h    = document.getElementById("horaInput").value.padStart(2,"0");
  const m    = document.getElementById("minInput").value.padStart(2,"0");
  const hora = (document.getElementById("horaInput").value && document.getElementById("minInput").value) ? `${h}:${m}` : null;
  const diasAtivos = [...document.querySelectorAll(".dia-btn.ativo")].map(b => b.dataset.dia);
  const recorrente = document.getElementById("recorrenteCheck").checked;
  const nota       = document.getElementById("notaRapida").value.trim() || null;
  const obj = {
    titulo, cor:corSelecionada, cat:catSelecionada, prioridade:prioSelecionada,
    data:document.getElementById("dataDisplay").value||null,
    hora, dias:diasAtivos, recorrente,
    frequencia:recorrente?document.getElementById("frequencia").value:null, nota,
  };
  if(editandoIdx !== null){
    const fonte = modo==="metas" ? metas : tarefas;
    fonte[editandoIdx] = {...fonte[editandoIdx], ...obj};
  } else {
    if(modo==="metas") metas.push(obj); else tarefas.push(obj);
  }
  salvar(); render();
  if(calFullOverlay.classList.contains("aberto")) renderCalFull();
  fecharModal();
};

/* ══ NOTAS ══ */
function atualizarNotas(){ document.getElementById("paginaAtual").value=notas[paginaNotas]||""; document.getElementById("paginaInfo").innerText=`página ${paginaNotas+1} / ${notas.length}`; }
document.getElementById("notasBtn").onclick = () => { document.getElementById("modalNotas").style.display="flex"; atualizarNotas(); };
document.querySelector(".fechar-notas").onclick = () => { notas[paginaNotas]=document.getElementById("paginaAtual").value; salvar(); document.getElementById("modalNotas").style.display="none"; };
document.getElementById("paginaAtual").addEventListener("input", () => { notas[paginaNotas]=document.getElementById("paginaAtual").value; salvar(); });
document.getElementById("paginaAnterior").onclick = () => { notas[paginaNotas]=document.getElementById("paginaAtual").value; if(paginaNotas>0){paginaNotas--;atualizarNotas();} };
document.getElementById("proximaPagina").onclick  = () => { notas[paginaNotas]=document.getElementById("paginaAtual").value; if(paginaNotas<notas.length-1){paginaNotas++;atualizarNotas();} };
document.getElementById("novaPagina").onclick     = () => { notas[paginaNotas]=document.getElementById("paginaAtual").value; notas.push(""); paginaNotas=notas.length-1; salvar(); atualizarNotas(); };
document.getElementById("modalNotas").addEventListener("click", e => { if(e.target===document.getElementById("modalNotas")){notas[paginaNotas]=document.getElementById("paginaAtual").value;salvar();document.getElementById("modalNotas").style.display="none";} });

/* ══ POST-IT ══ */
document.getElementById("postitBtn").onclick = e => mostrarSeletorPostit(e.clientX, e.clientY);
function mostrarSeletorPostit(x,y){
  document.querySelectorAll(".postit-cor-selector").forEach(el=>el.remove());
  const sel = document.createElement("div"); sel.className="postit-cor-selector";
  sel.innerHTML=`<p>cor:</p><div class="postit-cor-op" data-classe="postit-amarelo" style="background:#ffd966"></div><div class="postit-cor-op" data-classe="postit-vermelho" style="background:#ff8a80"></div><div class="postit-cor-op" data-classe="postit-verde" style="background:#a5d6a7"></div>`;
  sel.style.left=(x-20)+"px"; sel.style.top=(y+10)+"px";
  document.body.appendChild(sel);
  sel.querySelectorAll(".postit-cor-op").forEach(op => { op.onclick=()=>{ const obj={top:"180px",left:"340px",texto:"",classe:op.dataset.classe}; postits.push(obj); criarPostit(obj); salvar(); sel.remove(); }; });
  setTimeout(()=>{ document.addEventListener("click",function f(ev){ if(!sel.contains(ev.target)){sel.remove();document.removeEventListener("click",f);} }); },50);
}
function criarPostit(p){
  const div = document.createElement("div"); div.className=`postit ${p.classe||"postit-amarelo"}`; div.style.top=p.top; div.style.left=p.left;
  div.innerHTML=`<div class="postit-edge postit-edge-top"></div><div class="postit-edge postit-edge-bottom"></div><div class="postit-edge postit-edge-left"></div><div class="postit-edge postit-edge-right"></div><textarea placeholder="escreva...">${p.texto}</textarea>`;
  document.body.appendChild(div);
  div.querySelector("textarea").addEventListener("input",function(){ p.texto=this.value; salvar(); });
  div.querySelectorAll(".postit-edge").forEach(edge => {
    function iniciarArrasto(clientX,clientY){ const ox=clientX-div.offsetLeft,oy=clientY-div.offsetTop; function mover(cx,cy){div.style.left=(cx-ox)+"px";div.style.top=(cy-oy)+"px";p.left=div.style.left;p.top=div.style.top;const lx=document.getElementById("lixeira").getBoundingClientRect();const px=div.getBoundingClientRect();document.getElementById("lixeira").classList.toggle("highlight",px.right>lx.left&&px.left<lx.right&&px.bottom>lx.top&&px.top<lx.bottom);} function soltar(){document.getElementById("lixeira").classList.remove("highlight");const lx=document.getElementById("lixeira").getBoundingClientRect();const px=div.getBoundingClientRect();if(px.right>lx.left&&px.left<lx.right&&px.bottom>lx.top&&px.top<lx.bottom){div.remove();postits=postits.filter(x=>x!==p);salvar();}else{salvar();}} document.onmousemove=e=>mover(e.clientX,e.clientY); document.onmouseup=()=>{document.onmousemove=null;document.onmouseup=null;soltar();}; edge.ontouchmove=e=>{e.preventDefault();mover(e.touches[0].clientX,e.touches[0].clientY);}; edge.ontouchend=()=>{edge.ontouchmove=null;edge.ontouchend=null;soltar();}; }
    edge.onmousedown=e=>{e.preventDefault();iniciarArrasto(e.clientX,e.clientY);}; edge.ontouchstart=e=>{e.preventDefault();iniciarArrasto(e.touches[0].clientX,e.touches[0].clientY);};
  });
}
postits.forEach(p=>criarPostit(p));

/* ══════════════════════════════════════════
   CALENDÁRIO FULL
══════════════════════════════════════════ */
const calFullOverlay = document.getElementById("calFullOverlay");
const MESES_PT    = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
const DIAS_CURTOS = ["dom","seg","ter","qua","qui","sex","sáb"];

function tarefasNoDia(d,m,a){ const dd=String(d).padStart(2,"0"),mm=String(m+1).padStart(2,"0"),ds=`${dd}/${mm}/${a}`; return [...tarefas,...metas].filter(t=>t.data===ds); }
function isHoje(d,m,a){ return d===hoje.getDate()&&m===hoje.getMonth()&&a===hoje.getFullYear(); }

function abrirCalendarioFull(){ calFullOverlay.classList.add("aberto"); document.querySelectorAll(".sidebar-btn").forEach(b=>b.classList.remove("active")); document.getElementById("calendarioBtn").classList.add("active"); renderCalFull(); }
document.getElementById("calFullFechar").onclick = () => { calFullOverlay.classList.remove("aberto"); document.getElementById("calendarioBtn").classList.remove("active"); };
calFullOverlay.addEventListener("click", e => { if(e.target===calFullOverlay) calFullOverlay.classList.remove("aberto"); });

document.getElementById("calFullPrev").onclick = () => navCalFull(-1);
document.getElementById("calFullNext").onclick = () => navCalFull(1);
document.getElementById("calFullHoje").onclick = () => { calFullMes=hoje.getMonth(); calFullAno=hoje.getFullYear(); _semanaAncora=new Date(); renderCalFull(); };

function navCalFull(dir){
  if(calFullView==="mes"){ calFullMes+=dir; if(calFullMes<0){calFullMes=11;calFullAno--;} if(calFullMes>11){calFullMes=0;calFullAno++;} }
  else { const a=new Date(_semanaAncora); a.setDate(a.getDate()+dir*7); calFullMes=a.getMonth(); calFullAno=a.getFullYear(); _semanaAncora=a; }
  renderCalFull();
}

document.getElementById("btnViewMes").onclick = () => { calFullView="mes"; document.querySelectorAll(".cal-view-btn").forEach(b=>b.classList.remove("active")); document.getElementById("btnViewMes").classList.add("active"); renderCalFull(); };
document.getElementById("btnViewSemana").onclick = () => { _semanaAncora=new Date(calFullAno,calFullMes,1); calFullView="semana"; document.querySelectorAll(".cal-view-btn").forEach(b=>b.classList.remove("active")); document.getElementById("btnViewSemana").classList.add("active"); renderCalFull(); };

function renderCalFull(){ if(calFullView==="mes") renderMes(); else renderSemana(); }

function renderMes(){
  document.getElementById("calFullTitle").textContent=`${MESES_PT[calFullMes]} ${calFullAno}`;
  const body=document.getElementById("calFullBody"); body.innerHTML=""; body.className="cal-full-body cal-mes-view";
  const primeiroDia=new Date(calFullAno,calFullMes,1).getDay(), totalDias=new Date(calFullAno,calFullMes+1,0).getDate(), totalDiasAnt=new Date(calFullAno,calFullMes,0).getDate();
  const cab=document.createElement("div"); cab.className="cal-mes-cabecalho";
  DIAS_CURTOS.forEach(d=>{const el=document.createElement("div");el.className="cal-mes-label-dia";el.textContent=d;cab.appendChild(el);});
  body.appendChild(cab);
  const grid=document.createElement("div"); grid.className="cal-mes-grid";
  const mAnt=calFullMes-1<0?11:calFullMes-1, aAnt=calFullMes-1<0?calFullAno-1:calFullAno;
  for(let i=primeiroDia-1;i>=0;i--) grid.appendChild(criarCelulaMes(totalDiasAnt-i,mAnt,aAnt,true));
  for(let d=1;d<=totalDias;d++) grid.appendChild(criarCelulaMes(d,calFullMes,calFullAno,false));
  const total=Math.ceil((primeiroDia+totalDias)/7)*7, mProx=calFullMes+1>11?0:calFullMes+1, aProx=calFullMes+1>11?calFullAno+1:calFullAno;
  let dProx=1; for(let i=primeiroDia+totalDias;i<total;i++) grid.appendChild(criarCelulaMes(dProx++,mProx,aProx,true));
  body.appendChild(grid);
}

function criarCelulaMes(d,m,a,inativo){
  const cel=document.createElement("div"); cel.className="cal-cel"+(inativo?" cal-cel-inativo":"")+(isHoje(d,m,a)?" cal-cel-hoje":"");
  const num=document.createElement("div"); num.className="cal-cel-num"; num.textContent=d; cel.appendChild(num);
  const ts=tarefasNoDia(d,m,a);
  const chips=document.createElement("div"); chips.className="cal-cel-chips";
  ts.forEach(t=>{ const chip=document.createElement("div"); chip.className="cal-chip"; chip.style.borderLeft=`3px solid ${t.cor}`; chip.textContent=(t.hora?t.hora+" ":"")+t.titulo; chip.title=t.titulo; chips.appendChild(chip); });
  cel.appendChild(chips);
  if(!inativo) cel.onclick=()=>abrirModalComData(d,m,a);
  return cel;
}

function renderSemana(){
  const anc=new Date(_semanaAncora), dom=new Date(anc); dom.setDate(anc.getDate()-anc.getDay());
  const sab=new Date(dom); sab.setDate(dom.getDate()+6);
  const mesD=MESES_PT[dom.getMonth()], mesS=MESES_PT[sab.getMonth()];
  document.getElementById("calFullTitle").textContent=mesD===mesS?`${mesD} ${dom.getFullYear()}`:`${mesD} – ${mesS} ${sab.getFullYear()}`;
  const body=document.getElementById("calFullBody"); body.innerHTML=""; body.className="cal-full-body cal-semana-view";
  const dias=Array.from({length:7},(_,i)=>{const dt=new Date(dom);dt.setDate(dom.getDate()+i);return dt;});
  const cab=document.createElement("div"); cab.className="cal-semana-cabecalho";
  const vz=document.createElement("div"); vz.className="cal-semana-hora-label"; cab.appendChild(vz);
  dias.forEach(dt=>{ const col=document.createElement("div"); col.className="cal-semana-col-header"+(isHoje(dt.getDate(),dt.getMonth(),dt.getFullYear())?" cal-semana-col-hoje":""); col.innerHTML=`<span class="cal-semana-dow">${DIAS_CURTOS[dt.getDay()]}</span><span class="cal-semana-num${isHoje(dt.getDate(),dt.getMonth(),dt.getFullYear())?" cal-semana-num-hoje":""}">${dt.getDate()}</span>`; cab.appendChild(col); });
  body.appendChild(cab);
  const allDayRow=document.createElement("div"); allDayRow.className="cal-semana-allday-row";
  const allDayLabel=document.createElement("div"); allDayLabel.className="cal-semana-hora-label cal-semana-allday-label"; allDayLabel.textContent="dia"; allDayRow.appendChild(allDayLabel);
  dias.forEach(dt=>{ const cel=document.createElement("div"); cel.className="cal-semana-allday-cel"+(isHoje(dt.getDate(),dt.getMonth(),dt.getFullYear())?" cal-semana-cel-hoje":""); tarefasNoDia(dt.getDate(),dt.getMonth(),dt.getFullYear()).filter(t=>!t.hora).forEach(t=>{const chip=document.createElement("div");chip.className="cal-chip cal-chip-semana";chip.style.borderLeft=`3px solid ${t.cor}`;chip.textContent=t.titulo;chip.title=t.titulo;cel.appendChild(chip);}); cel.onclick=()=>abrirModalComData(dt.getDate(),dt.getMonth(),dt.getFullYear()); allDayRow.appendChild(cel); });
  body.appendChild(allDayRow);
  const scroll=document.createElement("div"); scroll.className="cal-semana-scroll";
  const grid=document.createElement("div"); grid.className="cal-semana-grid";
  for(let h=0;h<24;h++){
    const linha=document.createElement("div"); linha.className="cal-semana-linha";
    const horaEl=document.createElement("div"); horaEl.className="cal-semana-hora-label"; horaEl.textContent=h===0?"":`${String(h).padStart(2,"0")}:00`; linha.appendChild(horaEl);
    dias.forEach(dt=>{ const cel=document.createElement("div"); cel.className="cal-semana-cel"+(isHoje(dt.getDate(),dt.getMonth(),dt.getFullYear())?" cal-semana-cel-hoje":""); tarefasNoDia(dt.getDate(),dt.getMonth(),dt.getFullYear()).filter(t=>t.hora&&parseInt(t.hora.split(":")[0])===h).forEach(t=>{const chip=document.createElement("div");chip.className="cal-chip cal-chip-semana";chip.style.borderLeft=`3px solid ${t.cor}`;chip.textContent=`${t.hora} ${t.titulo}`;chip.title=t.titulo;cel.appendChild(chip);}); cel.onclick=()=>abrirModalComData(dt.getDate(),dt.getMonth(),dt.getFullYear(),h); linha.appendChild(cel); });
    grid.appendChild(linha);
  }
  scroll.appendChild(grid); body.appendChild(scroll);
  if(dias.some(dt=>isHoje(dt.getDate(),dt.getMonth(),dt.getFullYear()))) requestAnimationFrame(()=>{ scroll.scrollTop=Math.max(0,hoje.getHours()*56-56*2); });
}

function abrirModalComData(d,m,a,hora){
  resetarModal();
  document.getElementById("dataDisplay").value=`${String(d).padStart(2,"0")}/${String(m+1).padStart(2,"0")}/${a}`;
  dataSelecionada={d,m,a}; calMes=m; calAno=a;
  if(hora!==undefined&&hora>0){ document.getElementById("horaInput").value=String(hora).padStart(2,"0"); document.getElementById("minInput").value="00"; }
  document.getElementById("modal").style.display="flex";
}

document.addEventListener("keydown", e => {
  if(e.key==="Escape"){ document.getElementById("modal").style.display="none"; document.getElementById("modalDetalhe").style.display="none"; document.getElementById("modalNotas").style.display="none"; calFullOverlay.classList.remove("aberto"); resetarModal(); }
});

render();
