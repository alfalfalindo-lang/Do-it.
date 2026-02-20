const lista=document.getElementById("lista");
const novoBtn=document.getElementById("novoBtn");
const modal=document.getElementById("modal");
const fechar=document.querySelector(".fechar");
const criar=document.getElementById("criar");
const titulo=document.getElementById("titulo");
const dataInput=document.getElementById("data");

const todasBtn=document.getElementById("todasBtn");
const incompletasBtn=document.getElementById("incompletasBtn");
const metasBtn=document.getElementById("metasBtn");

let tarefas=[];
let metas=[];
let modo="todas";
let tipoAtual="tarefa";
let corSelecionada="vermelha";

/* DATA TOPO */
const hoje=new Date();
document.getElementById("mesTopo").innerText=
hoje.toLocaleDateString("pt-BR",{month:"long"});
document.getElementById("diaTopo").innerText=hoje.getDate();

/* Seleção de cor */
document.querySelectorAll(".cor").forEach(btn=>{
 btn.onclick=()=>corSelecionada=btn.dataset.cor;
});

/* Abrir modal */
novoBtn.onclick=()=>{
 modal.style.display="flex";
};

fechar.onclick=()=>modal.style.display="none";

/* Criar item */
criar.onclick=()=>{
 if(!titulo.value)return;

 const item={
  texto:titulo.value,
  data:dataInput.value,
  feita:false,
  cor:corSelecionada
 };

 if(tipoAtual==="tarefa"){
  tarefas.push(item);
 }else{
  metas.push(item);
 }

 titulo.value="";
 modal.style.display="none";
 render();
};

/* Render */
function render(){
 lista.innerHTML="";
 let array=[];

 if(modo==="todas") array=tarefas;
 if(modo==="incompletas") array=tarefas.filter(t=>!t.feita);
 if(modo==="metas") array=metas;

 array.forEach((item,index)=>{
  const div=document.createElement("div");
  div.className="item";
  if(item.feita)div.classList.add("feita");

  const bolinha=document.createElement("div");
  bolinha.className="bolinha";
  bolinha.style.background=
  item.cor==="vermelha"?"#ff3b30":
  item.cor==="amarela"?"#ffcc00":"#34c759";

  const texto=document.createElement("div");
  texto.innerHTML=`<strong>${item.texto}</strong><br><small>${item.data}</small>`;

  div.appendChild(bolinha);
  div.appendChild(texto);

  div.onclick=()=>{
    item.feita=!item.feita;
    render();
  };

  lista.appendChild(div);
 });
}

/* Botões menu */
todasBtn.onclick=()=>{
 modo="todas";
 tipoAtual="tarefa";
 render();
};

incompletasBtn.onclick=()=>{
 modo="incompletas";
 tipoAtual="tarefa";
 render();
};

metasBtn.onclick=()=>{
 modo="metas";
 tipoAtual="meta";
 render();
};
 
